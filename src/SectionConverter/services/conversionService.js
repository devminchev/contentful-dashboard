import {
    getFieldMappingRules,
    getConversionDifficulty,
    LAYOUT_TYPE_MAPPING
} from '../config/fieldMappings';
import {
    validateRequiredFields,
    getFieldReport,
    isFieldValueValid,
    extractLocalizedValue,
    FIELD_DEFAULTS
} from '../config/fieldRequirements';
import logger from '../../utils/logger';

/**
 * Service for converting sections between different IG types
 */
class ConversionService {
    constructor() {
        this.defaultLocale = 'en-US'; // Will be overridden by SDK during initialize
        this.availableLocales = ['en-US']; // Will be overridden by SDK during initialize
        this.sectionService = null;
    }

    /**
     * Initialize the service with default locale and available locales from SDK
     * @param {Object} sdk - The Contentful SDK from useSDK
     * @param {Object} sectionServiceInstance - The sectionService instance for fetching complete data
     */
    initialize(sdk, sectionServiceInstance = null) {
        // 🚨 CRITICAL: Use SDK's actual locale, with space-aware fallback
        const spaceId = sdk.ids.space;
        const spaceAwareFallback = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        this.defaultLocale = sdk.locales?.default || spaceAwareFallback;
        this.availableLocales = sdk.locales?.available || [this.defaultLocale];
        this.sectionService = sectionServiceInstance;

        logger.info('ConversionService initialized with:', {
            defaultLocale: this.defaultLocale,
            availableLocales: this.availableLocales,
            hasSectionService: !!this.sectionService
        });
    }

    /**
     * Convert a section from one type to another with robust field handling
     * @param {Object} sourceSection - The source section data (may be incomplete from GraphQL)
     * @param {string} targetType - The target content type ID
     * @returns {Object} - The converted section data
     */
    async convertSection(sourceSection, targetType) {
        const sourceType = sourceSection.sys.contentType.sys.id;
        const sourceId = sourceSection.sys.id;

        logger.info('🔄 Starting section conversion:', {
            sourceType,
            targetType,
            sourceId
        });

        // Ensure we have sectionService for fetching complete data
        if (!this.sectionService) {
            throw new Error('ConversionService not properly initialized - sectionService is required');
        }

        // 🚨 CRITICAL: Always fetch complete section data via CMA for conversions
        // The sourceSection might be from GraphQL with only basic fields
        logger.debug('🔧 Fetching COMPLETE section data via CMA for conversion...');
        const completeSourceSection = await this.sectionService.getSection(sourceId);

        if (!completeSourceSection || !completeSourceSection.fields) {
            throw new Error(`Failed to fetch complete source section data for ${sourceId}`);
        }

        logger.info('✅ Fetched complete section data with all fields:', {
            fieldsCount: Object.keys(completeSourceSection.fields).length,
            fieldNames: Object.keys(completeSourceSection.fields)
        });

        // Get the source locale from the complete section fields
        const sourceLocale = this.getSourceLocale(completeSourceSection.fields);
        logger.debug('Detected source locale:', sourceLocale);

        // Generate comprehensive field report for debugging
        const fieldReport = getFieldReport(completeSourceSection.fields, sourceLocale);
        logger.info('📊 Source section field analysis:', {
            totalFields: fieldReport.totalFields,
            validFields: fieldReport.fieldsByStatus.valid.length,
            emptyFields: fieldReport.fieldsByStatus.empty.length,
            missingFields: fieldReport.fieldsByStatus.missing.length
        });

        // Get field mapping rules for this conversion
        const mappingRules = getFieldMappingRules(sourceType, targetType);
        logger.info('🔧 Conversion mapping rules analysis:', {
            copyDirectly: mappingRules.copyDirectly.length,
            copyDirectlyFields: mappingRules.copyDirectly,
            transformations: Object.keys(mappingRules.transform).length,
            transformationFields: Object.keys(mappingRules.transform),
            defaults: Object.keys(mappingRules.addDefaults).length,
            defaultFields: Object.keys(mappingRules.addDefaults),
            omitted: mappingRules.omit.length,
            omittedFields: mappingRules.omit
        });

        const convertedFields = {};

        // 🔥 ROBUST FIELD COPYING with detailed validation
        logger.info('📋 Starting field copying process...');

        // 🎯 SMART FILTERING: Only attempt to copy fields that actually exist in source
        const existingFieldsToCopy = mappingRules.copyDirectly.filter(fieldId => {
            const exists = fieldId in completeSourceSection.fields;
            if (!exists) {
                logger.debug(`⏭️ Skipping optional field '${fieldId}' (not present in source)`);
            }
            return exists;
        });

        logger.info(`📊 Field copy plan: ${existingFieldsToCopy.length} existing fields out of ${mappingRules.copyDirectly.length} total fields planned`);

        let copySuccessCount = 0;
        let copyFailureCount = 0;

        for (const fieldId of existingFieldsToCopy) {
            logger.debug(`🔍 Attempting to copy field '${fieldId}'...`);

            const fieldValue = completeSourceSection.fields[fieldId];

            logger.debug(`   Field '${fieldId}' exists: true, value:`, {
                valueType: typeof fieldValue,
                isNull: fieldValue === null,
                isUndefined: fieldValue === undefined,
                value: fieldValue
            });

            const result = this.copyFieldRobustly(completeSourceSection.fields, fieldId, sourceLocale);
            if (result.success) {
                convertedFields[fieldId] = result.value;
                copySuccessCount++;
                logger.info(`✅ Successfully copied field '${fieldId}':`, {
                    type: typeof result.originalValue,
                    hasValue: result.originalValue !== null && result.originalValue !== undefined,
                    isArray: Array.isArray(result.originalValue),
                    arrayLength: Array.isArray(result.originalValue) ? result.originalValue.length : 'N/A'
                });
            } else {
                copyFailureCount++;
                logger.error(`❌ Failed to copy field '${fieldId}':`, {
                    reason: result.reason,
                    originalValue: result.originalValue,
                    fieldType: result.fieldType
                });
            }
        }

        logger.info(`📊 Field copying summary: ${copySuccessCount} succeeded, ${copyFailureCount} failed out of ${existingFieldsToCopy.length} attempted fields`);

        // 📝 Report on skipped optional fields
        const skippedFields = mappingRules.copyDirectly.filter(fieldId => !(fieldId in completeSourceSection.fields));
        if (skippedFields.length > 0) {
            logger.info(`⏭️ Skipped ${skippedFields.length} optional fields that weren't present in source:`, skippedFields);
        }

        // Apply transformations with validation
        for (const [fieldId, transformFn] of Object.entries(mappingRules.transform)) {
            try {
                const originalValue = completeSourceSection.fields[fieldId]
                    ? this.getLocalizedValue(completeSourceSection.fields[fieldId], sourceLocale)
                    : null;

                const transformedValue = transformFn(completeSourceSection.fields, sourceLocale);

                if (transformedValue !== null && transformedValue !== undefined) {
                    convertedFields[fieldId] = this.createLocalizedField(transformedValue, sourceLocale);
                    logger.info(`🔄 Transformed field '${fieldId}':`, {
                        originalValue: originalValue,
                        transformedValue: transformedValue,
                        transformedType: typeof transformedValue,
                        fieldExists: !!completeSourceSection.fields[fieldId],
                        usedLocale: sourceLocale
                    });
                } else {
                    logger.warn(`⚠️ Transformation for '${fieldId}' returned null/undefined`, {
                        originalValue: originalValue,
                        sourceFieldExists: !!completeSourceSection.fields[fieldId],
                        usedLocale: sourceLocale
                    });
                }
            } catch (error) {
                logger.error(`❌ Error transforming field '${fieldId}':`, error);
            }
        }

        // Add default values with validation
        for (const [fieldId, defaultValue] of Object.entries(mappingRules.addDefaults)) {
            convertedFields[fieldId] = this.createLocalizedField(defaultValue, sourceLocale);
            logger.debug(`➕ Added default field '${fieldId}':`, { value: defaultValue });
        }

        // Add any missing required defaults
        for (const [fieldId, defaultValue] of Object.entries(FIELD_DEFAULTS)) {
            if (!convertedFields[fieldId]) {
                convertedFields[fieldId] = this.createLocalizedField(defaultValue, sourceLocale);
                logger.debug(`🛡️ Added required default '${fieldId}':`, { value: defaultValue });
            }
        }

        // 🎯 ADD SENSIBLE DEFAULTS for missing optional common fields
        const optionalDefaults = {
            viewAllActionText: 'View All',
            expandedSectionLayoutType: LAYOUT_TYPE_MAPPING[targetType] || 'grid-a'
        };

        for (const [fieldId, defaultValue] of Object.entries(optionalDefaults)) {
            if (!convertedFields[fieldId]) {
                convertedFields[fieldId] = this.createLocalizedField(defaultValue, sourceLocale);
                logger.debug(`🔧 Added missing optional field '${fieldId}' with default:`, { value: defaultValue });
            }
        }

        // Generate new entryTitle
        const originalTitle = this.getLocalizedValue(completeSourceSection.fields.entryTitle, sourceLocale);
        convertedFields.entryTitle = this.createLocalizedField(`${originalTitle}_converted`, sourceLocale);

        // 🚨 CRITICAL VALIDATION: Check if all required fields are present
        const validation = validateRequiredFields(convertedFields, targetType, sourceLocale);
        logger.info('🔍 Final validation result:', {
            isValid: validation.isValid,
            totalRequired: validation.totalRequired,
            validFields: validation.valid.length,
            missingFields: validation.missing,
            invalidFields: validation.invalid.map(f => ({ field: f.fieldId, issue: typeof f.value }))
        });

        if (!validation.isValid) {
            logger.error('❌ CONVERSION FAILED: Missing required fields!', {
                missing: validation.missing,
                invalid: validation.invalid,
                targetType
            });
            throw new Error(`Conversion validation failed. Missing required fields: ${validation.missing.join(', ')}. Invalid fields: ${validation.invalid.map(f => f.fieldId).join(', ')}`);
        }

        logger.info('✅ Conversion completed successfully', {
            fieldsCreated: Object.keys(convertedFields).length,
            requiredFieldsSatisfied: validation.valid.length
        });

        return convertedFields;
    }

    /**
     * Robustly copy a field with comprehensive validation and error handling
     * @param {Object} sourceFields - The source section fields
     * @param {string} fieldId - The field ID to copy
     * @param {string} locale - The target locale
     * @returns {Object} - Result object with success flag and value/reason
     */
    copyFieldRobustly(sourceFields, fieldId, locale) {
        // Check if field exists in source
        if (!(fieldId in sourceFields)) {
            return {
                success: false,
                reason: `Field '${fieldId}' does not exist in source section`
            };
        }

        const field = sourceFields[fieldId];

        // Handle null/undefined fields
        if (field === null || field === undefined) {
            return {
                success: false,
                reason: `Field '${fieldId}' is null or undefined`
            };
        }

        // Extract localized value
        const localizedValue = extractLocalizedValue(field, locale);

        // Check if the localized value is valid for this field type
        const isValid = isFieldValueValid(localizedValue, fieldId);

        if (!isValid) {
            return {
                success: false,
                reason: `Field '${fieldId}' has invalid value for field type`,
                originalValue: localizedValue,
                fieldType: typeof localizedValue
            };
        }

        // Field is valid, copy it
        return {
            success: true,
            value: field, // Copy the entire field object (preserves locale structure)
            originalValue: localizedValue
        };
    }

    /**
     * Get the source locale from section fields with fallback logic
     * @param {Object} fields - Section fields
     * @returns {string} - The locale to use
     */
    getSourceLocale(fields) {
        // Find the first field with locale data to determine the locale
        for (const field of Object.values(fields)) {
            if (field && typeof field === 'object') {
                // First try the default locale
                if (field[this.defaultLocale] !== undefined) {
                    return this.defaultLocale;
                }

                // Try available locales in order
                for (const locale of this.availableLocales) {
                    if (field[locale] !== undefined) {
                        return locale;
                    }
                }

                // Return first available locale as fallback
                const keys = Object.keys(field);
                if (keys.length > 0) {
                    return keys[0];
                }
            }
        }
        return this.defaultLocale; // Use default locale as fallback
    }

    /**
     * Validate if a conversion is possible
     * @param {string} sourceType - Source content type ID
     * @param {string} targetType - Target content type ID
     * @returns {Object} - Validation result with isValid and warnings
     */
    validateConversion(sourceType, targetType) {
        const result = {
            isValid: true,
            warnings: [],
            difficulty: getConversionDifficulty(sourceType, targetType)
        };

        // Add warnings based on conversion difficulty
        switch (result.difficulty) {
            case 'complex':
                result.warnings.push('This conversion involves significant data transformation');
                if (sourceType === 'igGridCSection') {
                    result.warnings.push('Converting from Grid C: media fields will be lost');
                }
                if (targetType === 'igGridCSection') {
                    result.warnings.push('Converting to Grid C: only first game will be kept');
                }
                break;

            case 'moderate':
                result.warnings.push('Some fields may be lost or modified during conversion');
                break;

            case 'easy':
                // No warnings for easy conversions
                break;

            default:
                result.warnings.push('Unknown conversion difficulty level');
                break;
        }

        return result;
    }

    /**
     * Get preview of what fields will be converted
     * @param {Object} sourceSection - The source section entry
     * @param {string} targetType - The target content type ID
     * @returns {Object} - Preview of field changes
     */
    getConversionPreview(sourceSection, targetType) {
        const sourceType = sourceSection.sys.contentType.sys.id;
        const mappingRules = getFieldMappingRules(sourceType, targetType);

        const preview = {
            sourceType,
            targetType,
            fieldChanges: {
                copied: [],
                transformed: [],
                added: [],
                omitted: []
            }
        };

        // Fields that will be copied directly
        for (const fieldId of mappingRules.copyDirectly) {
            if (sourceSection.fields[fieldId]) {
                preview.fieldChanges.copied.push({
                    field: fieldId,
                    value: this.getLocalizedValue(sourceSection.fields[fieldId])
                });
            }
        }

        // Fields that will be transformed
        for (const [fieldId, transformFn] of Object.entries(mappingRules.transform)) {
            const originalValue = this.getFieldDisplayValue(sourceSection.fields, fieldId);
            const transformedValue = transformFn(sourceSection.fields);

            preview.fieldChanges.transformed.push({
                field: fieldId,
                originalValue,
                newValue: transformedValue
            });
        }

        // Fields that will be added with defaults
        for (const [fieldId, defaultValue] of Object.entries(mappingRules.addDefaults)) {
            preview.fieldChanges.added.push({
                field: fieldId,
                value: defaultValue
            });
        }

        // Fields that will be omitted
        for (const fieldId of mappingRules.omit) {
            if (sourceSection.fields[fieldId]) {
                preview.fieldChanges.omitted.push({
                    field: fieldId,
                    value: this.getFieldDisplayValue(sourceSection.fields, fieldId)
                });
            }
        }

        return preview;
    }

    /**
     * Helper to get display value for a field
     * @param {Object} fields - Section fields
     * @param {string} fieldId - Field ID
     * @returns {string} - Display value
     */
    getFieldDisplayValue(fields, fieldId) {
        const field = fields[fieldId];
        if (!field) return 'N/A';

        const value = this.getLocalizedValue(field);
        if (!value) return 'N/A';

        // Handle different field types
        if (Array.isArray(value)) {
            return `Array (${value.length} items)`;
        }

        if (typeof value === 'object' && value.sys) {
            return `Link to ${value.sys.id}`;
        }

        return String(value);
    }

    /**
     * Batch validate multiple conversions
     * @param {Array} sections - Array of sections to validate
     * @param {string} targetType - Target content type ID
     * @returns {Object} - Batch validation results
     */
    batchValidateConversions(sections, targetType) {
        const results = {
            valid: [],
            invalid: [],
            warnings: []
        };

        for (const section of sections) {
            const sourceType = section.sys.contentType.sys.id;
            const validation = this.validateConversion(sourceType, targetType);

            const sectionResult = {
                section,
                validation
            };

            if (validation.isValid) {
                results.valid.push(sectionResult);
                if (validation.warnings.length > 0) {
                    results.warnings.push(...validation.warnings.map(warning => ({
                        sectionId: section.sys.id,
                        warning
                    })));
                }
            } else {
                results.invalid.push(sectionResult);
            }
        }

        return results;
    }

    /**
     * Create a localized field object
     * @param {any} value - The value to localize
     * @param {string} locale - The locale to use
     * @returns {Object} - Localized field object
     */
    createLocalizedField(value, locale) {
        return { [locale]: value };
    }

    /**
     * Get localized field value
     * @param {Object} field - The field object with locale keys
     * @param {string} preferredLocale - The preferred locale to use
     * @returns {any} - The field value in the preferred or first available locale
     */
    getLocalizedValue(field, preferredLocale = null) {
        if (!field || typeof field !== 'object') return field;

        // Try preferred locale first
        if (preferredLocale && field[preferredLocale] !== undefined) {
            return field[preferredLocale];
        }

        // Try default locale
        if (field[this.defaultLocale] !== undefined) {
            return field[this.defaultLocale];
        }

        // Try available locales in order
        for (const locale of this.availableLocales) {
            if (field[locale] !== undefined && field[locale] !== null) {
                return field[locale];
            }
        }

        // If no available locale found, get the first available value
        const keys = Object.keys(field);
        if (keys.length > 0) {
            return field[keys[0]];
        }

        return '';
    }
}

// Create singleton instance
const conversionService = new ConversionService();

export default conversionService;

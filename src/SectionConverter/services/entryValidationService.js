import contentTypeSchemaService from './contentTypeSchemaService';
import logger from '../../utils/logger';

/**
 * Service for validating entries against their content type schemas
 * Uses dynamic schema validation instead of hardcoded field requirements
 */
class EntryValidationService {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize the validation service with content type schemas
     * @param {Object} schemas - Object with contentTypeId as key and schema as value
     */
    async initialize(schemas) {
        try {
            await contentTypeSchemaService.initializeWithSchemas(schemas);
            this.isInitialized = true;
            logger.info('🔍 EntryValidationService initialized with dynamic schemas');
        } catch (error) {
            logger.error('❌ Failed to initialize EntryValidationService:', error);
            throw error;
        }
    }

    /**
     * Validate a single entry against its content type schema
     * @param {Object} entry - The entry to validate
     * @param {string} locale - The locale to validate (e.g., 'en-US', 'en-GB')
     * @returns {Object} - Validation result
     */
    validateEntry(entry, locale = null) {
        if (!locale) {
            // Use space-aware default
            const spaceId = entry?.sys?.space?.sys?.id || 'unknown';
            locale = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        }

        if (!this.isInitialized) {
            logger.warn('⚠️ EntryValidationService not initialized');
            return {
                isValid: false,
                error: 'Validation service not initialized',
                entry: { id: entry?.sys?.id, contentType: entry?.sys?.contentType?.sys?.id }
            };
        }

        const contentTypeId = entry?.sys?.contentType?.sys?.id;
        if (!contentTypeId) {
            return {
                isValid: false,
                error: 'Entry missing content type information',
                entry: { id: entry?.sys?.id }
            };
        }

        const requiredFields = contentTypeSchemaService.getRequiredFields(contentTypeId);
        if (requiredFields.length === 0) {
            logger.warn(`⚠️ No required fields found for content type: ${contentTypeId}`);
            return {
                isValid: true,
                warning: `No schema validation available for ${contentTypeId}`,
                entry: { id: entry.sys.id, contentType: contentTypeId }
            };
        }

        return this._validateRequiredFields(entry, requiredFields, locale);
    }

    /**
     * Validate multiple entries and return summary
     * @param {Array} entries - Array of entries to validate
     * @param {string} locale - The locale to validate
     * @returns {Object} - Validation summary
     */
    validateEntries(entries, locale = null) {
        if (!locale && entries.length > 0) {
            // Use space-aware default based on first entry
            const spaceId = entries[0]?.sys?.space?.sys?.id || 'unknown';
            locale = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        }

        if (!Array.isArray(entries)) {
            return {
                isValid: false,
                error: 'Invalid entries array provided'
            };
        }

        logger.info(`🔍 Validating ${entries.length} entries...`);

        const results = entries.map(entry => this.validateEntry(entry, locale));

        const valid = results.filter(r => r.isValid);
        const invalid = results.filter(r => !r.isValid);
        const warnings = results.filter(r => r.warning);

        const summary = {
            totalEntries: entries.length,
            validEntries: valid.length,
            invalidEntries: invalid.length,
            warningEntries: warnings.length,
            validationRate: ((valid.length / entries.length) * 100).toFixed(1),
            results: {
                valid: valid.map(r => r.entry),
                invalid: invalid.map(r => ({
                    entry: r.entry,
                    error: r.error,
                    missingFields: r.missingFields || [],
                    invalidFields: r.invalidFields || []
                })),
                warnings: warnings.map(r => ({ entry: r.entry, warning: r.warning }))
            }
        };

        logger.info(`📊 Validation complete: ${valid.length}/${entries.length} valid (${summary.validationRate}%)`);

        if (invalid.length > 0) {
            logger.warn(`⚠️ ${invalid.length} entries failed validation`);
        }

        return summary;
    }

    /**
     * Validate required fields for a single entry
     * @param {Object} entry - The entry to validate
     * @param {Array} requiredFields - Array of required field IDs
     * @param {string} locale - The locale to validate
     * @returns {Object} - Validation result
     * @private
     */
    _validateRequiredFields(entry, requiredFields, locale) {
        const contentTypeId = entry.sys.contentType.sys.id;
        const fields = entry.fields || {};

        const missing = [];
        const invalid = [];
        const valid = [];

        for (const fieldId of requiredFields) {
            const field = fields[fieldId];

            if (!field) {
                missing.push(fieldId);
                continue;
            }

            const localizedValue = this._extractLocalizedValue(field, locale);
            const isValid = this._isFieldValueValid(localizedValue, fieldId);

            if (!isValid) {
                invalid.push({ fieldId, value: localizedValue });
            } else {
                valid.push(fieldId);
            }
        }

        const isEntryValid = missing.length === 0 && invalid.length === 0;

        return {
            isValid: isEntryValid,
            entry: {
                id: entry.sys.id,
                contentType: contentTypeId,
                entryTitle: this._extractLocalizedValue(fields.entryTitle, locale) || 'Untitled'
            },
            validation: {
                totalRequired: requiredFields.length,
                valid: valid.length,
                missing: missing.length,
                invalid: invalid.length
            },
            missingFields: missing,
            invalidFields: invalid.map(i => i.fieldId),
            validFields: valid
        };
    }

    /**
     * Extract localized value from a field
     * @param {any} field - The field data
     * @param {string} locale - The locale to extract
     * @returns {any} - The localized value
     * @private
     */
    _extractLocalizedValue(field, locale) {
        if (!field || typeof field !== 'object') {
            return field;
        }

        // If it's already localized, return the value for the locale
        if (field[locale] !== undefined) {
            return field[locale];
        }

        // Fallback to other available locales
        const keys = Object.keys(field);
        if (keys.length > 0) {
            return field[keys[0]];
        }

        return null;
    }

    /**
     * Check if a field value is valid (not empty/null and meets type requirements)
     * @param {any} value - The field value to check
     * @param {string} fieldId - The field ID for specific logic
     * @returns {boolean} - Whether the field has a valid value
     * @private
     */
    _isFieldValueValid(value, fieldId) {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return false;
        }

        // Handle different field types based on common patterns
        switch (fieldId) {
            case 'games':
                // Games array must exist and have at least one item
                return Array.isArray(value) && value.length > 0;

            case 'game':
                // Single game must be a valid link object
                return value && typeof value === 'object' && value.sys && value.sys.id;

            case 'venture':
                // Venture must be a valid link object
                return value && typeof value === 'object' && value.sys && value.sys.id;

            case 'title':
            case 'entryTitle':
            case 'slug':
                // Required string fields must be non-empty strings
                return typeof value === 'string' && value.trim().length > 0;

            case 'environmentVisibility':
            case 'platformVisibility':
            case 'sessionVisibility':
                // Arrays must exist and have at least one item
                return Array.isArray(value) && value.length > 0;

            default:
                // For other fields, check if they exist and are not empty
                if (typeof value === 'string') {
                    return value.trim().length > 0;
                }
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                // For objects, links, etc. just check if they exist
                return value !== null && value !== undefined;
        }
    }

    /**
     * Get validation statistics for debugging
     * @returns {Object} - Validation service statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            schemaStats: contentTypeSchemaService.getCacheStats()
        };
    }

    /**
     * Reset the validation service
     */
    reset() {
        contentTypeSchemaService.reset();
        this.isInitialized = false;
        logger.info('🔄 EntryValidationService reset');
    }
}

// Create and export singleton instance
const entryValidationService = new EntryValidationService();
export default entryValidationService;

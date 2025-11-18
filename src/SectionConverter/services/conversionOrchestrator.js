import sectionService from './sectionService';
import conversionService from './conversionService';
import entryValidationService from './entryValidationService';
import { initializeSchemaValidation } from '../utils/schemaInitializer';
import logger from '../../utils/logger';

/**
 * Helper function to get localized field value
 * @param {Object} field - The field object with locale keys
 * @param {string} spaceId - The space ID
 * @returns {any} - The field value in the first available locale
 */
const getLocalizedValue = (field, spaceId = 'unknown') => {
    if (!field || typeof field !== 'object') return field;

    // Try common locales - prioritize based on space
    const spaceAwareDefault = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
    const locales = [spaceAwareDefault, spaceAwareDefault === 'en-GB' ? 'en-US' : 'en-GB', 'en'];
    for (const locale of locales) {
        if (field[locale] !== undefined && field[locale] !== null) {
            return field[locale];
        }
    }

    // If no common locale found, get the first available value
    const keys = Object.keys(field);
    if (keys.length > 0) {
        return field[keys[0]];
    }

    return '';
};

/**
 * Orchestrates the complete section conversion process
 */
class ConversionOrchestrator {
    constructor() {
        this.isRunning = false;
        this.currentProgress = null;
        this.progressCallback = null;
    }

    /**
     * Initialize with service instances
     * @param {Object} sectionServiceInstance - The section service instance
     * @param {Object} conversionServiceInstance - The conversion service instance
     */
    initialize(sectionServiceInstance, conversionServiceInstance) {
        this.sectionService = sectionServiceInstance;
        this.conversionService = conversionServiceInstance;

        // Pass sectionService to conversionService so it can fetch complete data
        if (this.conversionService && this.conversionService.sectionService === null) {
            this.conversionService.sectionService = this.sectionService;
            logger.info('ConversionOrchestrator initialized and linked sectionService to conversionService');
        } else {
            logger.info('ConversionOrchestrator initialized with existing services');
        }
    }

    /**
     * Execute the complete conversion process for multiple sections
     * @param {Array} sections - Sections to convert
     * @param {string} targetType - Target content type ID
     * @param {Function} onProgress - Progress callback function
     * @returns {Promise<Object>} - Conversion results
     */
    async executeConversion(sections, targetType, onProgress = null) {
        if (this.isRunning) {
            throw new Error('Conversion already in progress');
        }

        this.isRunning = true;
        this.progressCallback = onProgress;

        const results = {
            successful: [],
            failed: [],
            skipped: [],
            validationFailed: [],
            totalProcessed: 0,
            startTime: new Date(),
            endTime: null
        };

        try {
            // Step 1: Initialize schema validation if not already done
            this.updateProgress('Initializing validation schemas...', 0, sections.length);
            await this.ensureValidationInitialized();

            // Step 2: Fetch complete section data for validation (GraphQL only has basic fields)
            this.updateProgress('Fetching complete section data...', 0, sections.length);
            const completeSections = [];
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                this.updateProgress(`Fetching section data (${i + 1}/${sections.length})...`, i, sections.length);
                try {
                    const completeSection = await sectionService.getSection(section.sys.id);
                    completeSections.push(completeSection);
                } catch (error) {
                    logger.error(`Failed to fetch complete data for section ${section.sys.id}:`, error);
                    // Add to failed list and continue
                    results.failed.push({
                        section,
                        error: `Failed to fetch complete section data: ${error.message}`,
                        details: error
                    });
                }
            }

            if (completeSections.length === 0) {
                throw new Error('Failed to fetch complete data for any sections');
            }

            // Step 3: Validate entry completeness using complete section data
            this.updateProgress('Validating entry completeness...', 0, completeSections.length);
            const validationResults = entryValidationService.validateEntries(completeSections);

            // Separate entries that failed schema validation
            results.validationFailed = validationResults.results.invalid.map(invalidEntry => ({
                section: {
                    sys: { id: invalidEntry.entry.id },
                    fields: { entryTitle: { 'en-GB': invalidEntry.entry.entryTitle } }
                },
                reason: 'Missing required fields',
                missingFields: invalidEntry.missingFields,
                invalidFields: invalidEntry.invalidFields,
                error: invalidEntry.error
            }));

            // Only proceed with valid entries for conversion validation
            const validEntries = validationResults.results.valid.map(validEntry => {
                // Find the original section by ID
                return sections.find(section => section.sys.id === validEntry.id);
            }).filter(Boolean);

            if (validEntries.length === 0) {
                logger.warn('No entries passed schema validation');
                if (results.validationFailed.length > 0) {
                    logger.warn(`${results.validationFailed.length} entries failed validation:`,
                        results.validationFailed.map(f => ({
                            id: f.section.sys.id,
                            missing: f.missingFields
                        }))
                    );
                }
                throw new Error('No valid entries to convert after schema validation');
            }

            // Step 4: Validate conversion compatibility (existing logic)
            this.updateProgress('Validating conversion compatibility...', 0, validEntries.length);
            const conversionValidationResults = conversionService.batchValidateConversions(validEntries, targetType);

            // Skip invalid conversions
            results.skipped = conversionValidationResults.invalid.map(result => ({
                section: result.section,
                reason: 'Invalid conversion compatibility',
                errors: result.validation.warnings
            }));

            const validSections = conversionValidationResults.valid.map(result => result.section);

            if (validSections.length === 0) {
                throw new Error('No valid sections to convert after compatibility validation');
            }

            logger.info(`📊 Validation Summary:
                - Total sections: ${sections.length}
                - Schema validation failed: ${results.validationFailed.length}
                - Conversion compatibility failed: ${results.skipped.length}
                - Ready for conversion: ${validSections.length}`);

            // Step 5: Process each valid section
            for (let i = 0; i < validSections.length; i++) {
                const section = validSections[i];
                const spaceId = section.sys?.space?.sys?.id || 'unknown';
                const entryTitle = getLocalizedValue(section.fields?.entryTitle, spaceId) || 'Untitled';

                try {
                    this.updateProgress(`Converting "${entryTitle}" (${i + 1}/${validSections.length})`, i, validSections.length);

                    const conversionResult = await this.convertSingleSection(section, targetType, i + 1, validSections.length);
                    results.successful.push(conversionResult);

                } catch (error) {
                    logger.error(`Failed to convert section ${section.sys.id}:`, error);
                    results.failed.push({
                        section,
                        error: error.message,
                        details: error
                    });
                }

                results.totalProcessed++;
            }

            results.endTime = new Date();
            this.updateProgress('Conversion completed', validSections.length, validSections.length);

            return results;

        } catch (error) {
            results.endTime = new Date();
            throw error;
        } finally {
            this.isRunning = false;
            this.progressCallback = null;
        }
    }

    /**
     * Convert a single section following the complete workflow
     * @param {Object} section - Section to convert
     * @param {string} targetType - Target content type ID
     * @param {number} sectionIndex - Current section index
     * @param {number} totalSections - Total sections
     * @returns {Promise<Object>} - Conversion result
     */
    async convertSingleSection(section, targetType, sectionIndex, totalSections) {
        const spaceId = section.sys?.space?.sys?.id || 'unknown';
        const originalEntryTitle = getLocalizedValue(section.fields?.entryTitle, spaceId) || 'Untitled';
        const sectionId = section.sys.id;

        const result = {
            originalSection: section,
            newSection: null,
            referencesUpdated: [],
            steps: []
        };

        try {
            // Step 1: Convert field data (prepare the new section data)
            this.updateStepProgress(originalEntryTitle, 'convert_fields', 'started', sectionIndex, totalSections);
            result.steps.push({ step: 'convert_fields', status: 'started', timestamp: new Date() });
            const convertedFields = await conversionService.convertSection(section, targetType);
            result.steps.push({ step: 'convert_fields', status: 'completed', timestamp: new Date() });
            this.updateStepProgress(originalEntryTitle, 'convert_fields', 'completed', sectionIndex, totalSections);

            // Step 2: 🚨 CRITICAL FIX: Find references to original section BEFORE archiving it
            this.updateStepProgress(originalEntryTitle, 'find_references', 'started', sectionIndex, totalSections);
            result.steps.push({ step: 'find_references', status: 'started', timestamp: new Date() });
            const references = await sectionService.getSectionReferences(sectionId);
            result.steps.push({ step: 'find_references', status: 'completed', timestamp: new Date(), data: { referenceCount: references.length } });
            this.updateStepProgress(originalEntryTitle, 'find_references', 'completed', sectionIndex, totalSections, { referenceCount: references.length });

            // Step 3: Rename and archive original section (to free up the name)
            this.updateStepProgress(originalEntryTitle, 'rename_and_archive_original', 'started', sectionIndex, totalSections);
            result.steps.push({ step: 'rename_and_archive_original', status: 'started', timestamp: new Date() });
            await sectionService.renameAndArchiveSection(sectionId, originalEntryTitle);
            result.steps.push({ step: 'rename_and_archive_original', status: 'completed', timestamp: new Date() });
            this.updateStepProgress(originalEntryTitle, 'rename_and_archive_original', 'completed', sectionIndex, totalSections);

            // Step 4: Create new section with the EXACT original name
            this.updateStepProgress(originalEntryTitle, 'create_section', 'started', sectionIndex, totalSections);
            result.steps.push({ step: 'create_section', status: 'started', timestamp: new Date() });
            const newSection = await sectionService.createConvertedSection(targetType, convertedFields, sectionId, originalEntryTitle);
            result.newSection = newSection;
            result.steps.push({ step: 'create_section', status: 'completed', timestamp: new Date(), data: { newSectionId: newSection.sys.id } });
            this.updateStepProgress(originalEntryTitle, 'create_section', 'completed', sectionIndex, totalSections, { newSectionId: newSection.sys.id });

            // Step 5: Update references to point to new section (using the references found in step 2)
            if (references.length > 0) {
                this.updateStepProgress(originalEntryTitle, 'update_references', 'started', sectionIndex, totalSections, { referenceCount: references.length });
                result.steps.push({ step: 'update_references', status: 'started', timestamp: new Date() });
                const updateResults = await sectionService.updateReferences(sectionId, newSection.sys.id, references);
                result.referencesUpdated = updateResults;

                const successfulUpdates = updateResults.filter(r => r.success).length;
                result.steps.push({
                    step: 'update_references',
                    status: 'completed',
                    timestamp: new Date(),
                    data: {
                        total: updateResults.length,
                        successful: successfulUpdates,
                        failed: updateResults.length - successfulUpdates
                    }
                });
                this.updateStepProgress(originalEntryTitle, 'update_references', 'completed', sectionIndex, totalSections, {
                    total: updateResults.length,
                    successful: successfulUpdates,
                    failed: updateResults.length - successfulUpdates
                });
            }

            // Step 6: Publish new section
            this.updateStepProgress(originalEntryTitle, 'publish_section', 'started', sectionIndex, totalSections);
            result.steps.push({ step: 'publish_section', status: 'started', timestamp: new Date() });
            await sectionService.publishSection(newSection.sys.id);
            result.steps.push({ step: 'publish_section', status: 'completed', timestamp: new Date() });
            this.updateStepProgress(originalEntryTitle, 'publish_section', 'completed', sectionIndex, totalSections);

            return result;

        } catch (error) {
            // Mark current step as failed
            if (result.steps.length > 0) {
                const lastStep = result.steps[result.steps.length - 1];
                if (lastStep.status === 'started') {
                    lastStep.status = 'failed';
                    lastStep.error = error.message;
                    lastStep.timestamp = new Date();

                    // Update progress with failed status
                    this.updateStepProgress(originalEntryTitle, lastStep.step, 'failed', sectionIndex, totalSections, { error: error.message });
                }
            }

            throw error;
        }
    }

    /**
     * Update progress and call progress callback with detailed step information
     * @param {string} message - Progress message
     * @param {number} current - Current progress
     * @param {number} total - Total items
     * @param {Object} stepDetails - Optional step details for current operation
     */
    updateProgress(message, current, total, stepDetails = null) {
        this.currentProgress = {
            message,
            current,
            total,
            percentage: total > 0 ? Math.round((current / total) * 100) : 0,
            timestamp: new Date(),
            stepDetails
        };

        if (this.progressCallback) {
            this.progressCallback(this.currentProgress);
        }
    }

    /**
     * Update progress for specific section step
     * @param {string} sectionTitle - Title of the section being processed
     * @param {string} stepName - Name of the current step
     * @param {string} status - Step status (started/completed/failed)
     * @param {number} sectionIndex - Current section index
     * @param {number} totalSections - Total sections
     * @param {Object} stepData - Optional step data
     */
    updateStepProgress(sectionTitle, stepName, status, sectionIndex, totalSections, stepData = null) {
        const stepDisplayNames = {
            'convert_fields': 'Converting field data',
            'rename_and_archive_original': 'Archiving original section',
            'create_section': 'Creating new section',
            'find_references': 'Finding references',
            'update_references': 'Updating references',
            'publish_section': 'Publishing section'
        };

        const stepMessage = stepDisplayNames[stepName] || stepName;
        const statusIcon = status === 'completed' ? '✓' : status === 'failed' ? '✗' : '⏳';

        const message = `${statusIcon} ${stepMessage} for "${sectionTitle}"`;

        this.updateProgress(message, sectionIndex, totalSections, {
            currentSection: sectionTitle,
            currentStep: stepName,
            stepStatus: status,
            stepMessage,
            stepData,
            sectionProgress: {
                current: sectionIndex,
                total: totalSections
            }
        });
    }

    /**
     * Get current progress
     * @returns {Object|null} - Current progress or null if not running
     */
    getCurrentProgress() {
        return this.currentProgress;
    }

    /**
     * Check if conversion is currently running
     * @returns {boolean} - Whether conversion is running
     */
    isConversionRunning() {
        return this.isRunning;
    }

    /**
     * Cancel current conversion (if possible)
     * Note: This is a basic implementation - in practice, you'd need more sophisticated cancellation
     */
    cancelConversion() {
        if (this.isRunning) {
            this.isRunning = false;
            this.progressCallback = null;
            this.currentProgress = null;
            console.warn('Conversion cancellation requested - may not stop immediately');
        }
    }

    /**
     * Generate a summary report of conversion results
     * @param {Object} results - Conversion results
     * @returns {Object} - Summary report
     */
    generateSummaryReport(results) {
        const duration = results.endTime - results.startTime;

        return {
            summary: {
                totalSections: results.totalProcessed + results.skipped.length,
                successful: results.successful.length,
                failed: results.failed.length,
                skipped: results.skipped.length,
                duration: Math.round(duration / 1000), // seconds
                successRate: results.totalProcessed > 0
                    ? Math.round((results.successful.length / results.totalProcessed) * 100)
                    : 0
            },
            details: {
                successful: results.successful.map(result => ({
                    originalId: result.originalSection.sys.id,
                    originalTitle: getLocalizedValue(result.originalSection.fields?.entryTitle, result.originalSection.sys?.space?.sys?.id) || 'Untitled',
                    newId: result.newSection?.sys.id,
                    referencesUpdated: result.referencesUpdated.filter(r => r.success).length,
                    steps: result.steps.length
                })),
                failed: results.failed.map(failure => ({
                    sectionId: failure.section.sys.id,
                    title: getLocalizedValue(failure.section.fields?.entryTitle, failure.section.sys?.space?.sys?.id) || 'Untitled',
                    error: failure.error
                })),
                skipped: results.skipped.map(skip => ({
                    sectionId: skip.section.sys.id,
                    title: getLocalizedValue(skip.section.fields?.entryTitle, skip.section.sys?.space?.sys?.id) || 'Untitled',
                    reason: skip.reason
                }))
            }
        };
    }

    /**
     * Ensure validation services are initialized
     * @private
     */
    async ensureValidationInitialized() {
        const stats = entryValidationService.getStats();
        if (!stats.isInitialized) {
            logger.info('🔧 Initializing schema validation for the first time...');
            const result = await initializeSchemaValidation();
            if (!result.success) {
                throw new Error(`Failed to initialize schema validation: ${result.error}`);
            }
            logger.info('✅ Schema validation initialized successfully');
        } else {
            logger.debug('✅ Schema validation already initialized');
        }
    }
}

// Create singleton instance
const conversionOrchestrator = new ConversionOrchestrator();

export default conversionOrchestrator;

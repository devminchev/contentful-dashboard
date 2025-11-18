import rateLimiter from './rateLimiter';
import graphqlSectionService from './graphqlSectionService';
import {
    validateRequiredFields,
    getFieldReport,
    REQUIRED_FIELDS
} from '../config/fieldRequirements';
import logger from '../../utils/logger';

/**
 * Helper function to get localized field value
 * @param {Object} field - The field object with locale keys
 * @returns {any} - The field value in the first available locale
 */
const getLocalizedValue = (field, defaultLocale = 'en-US') => {
    if (!field || typeof field !== 'object') return field;

    // Try common locales - prioritize based on space
    const locales = [defaultLocale, defaultLocale === 'en-GB' ? 'en-US' : 'en-GB', 'en'];
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
 * Service for managing IG sections using Contentful SDK
 */
class SectionService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.cmaClient = null;
        this.sdk = null;
        this.defaultLocale = 'en-US'; // Will be overridden by SDK during initialize
    }

    /**
     * Initialize the service with Contentful SDK
     * @param {Object} sdk - The Contentful SDK from useSDK
     */
    initialize(sdk) {
        this.sdk = sdk;
        // 🚨 CRITICAL: Use SDK's actual locale, with space-aware fallback
        const spaceId = sdk.ids.space;
        const spaceAwareFallback = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        this.defaultLocale = sdk.locales?.default || spaceAwareFallback;
        this.availableLocales = sdk.locales?.available || [this.defaultLocale];

        // Use the SDK's built-in CMA client
        this.cmaClient = sdk.cma.entry;

        // Initialize GraphQL service for fast reads
        graphqlSectionService.initialize(sdk);

        logger.info('SectionService initialized with:', {
            defaultLocale: this.defaultLocale,
            availableLocales: this.availableLocales,
            spaceId: sdk.ids.space,
            environmentId: sdk.ids.environmentAlias || sdk.ids.environment,
            graphqlEnabled: true
        });
    }

    /**
     * Get all IG sections from specified content types (GraphQL with PREVIEW for TRUE CURRENT STATE! 🎯)
     * Uses GraphQL with preview: true to get draft/published/changed state correctly
     * @param {Array} sectionTypes - Optional array of section types to fetch (defaults to all)
     * @param {number} totalLimit - Total number of sections to fetch across all types
     * @returns {Promise<Object>} - Object with sections array and metadata
     */
    async getAllIGSections(sectionTypes = null, totalLimit = 100) {
        if (!this.sdk) {
            throw new Error('SectionService not initialized');
        }

        logger.info('🎯 Fetching sections via GraphQL with PREVIEW for TRUE STATE (draft/published/changed)');

        try {
            // Use GraphQL service for fast, no-rate-limit fetching with preview: true
            const result = await graphqlSectionService.getAllIGSections(sectionTypes, totalLimit, false, true);

            logger.info(`✅ Successfully fetched ${result.sections.length} sections with TRUE STATE via GraphQL`, {
                totalSections: result.sections.length,
                statusBreakdown: this.getStatusBreakdown(result.sections),
                contentTypes: sectionTypes ? sectionTypes.length : 'all'
            });

            return result;

        } catch (error) {
            logger.error('❌ Failed to fetch sections via GraphQL with preview:', error);
            throw error;
        }
    }

    /**
     * Search all IG sections by query (GraphQL with PREVIEW for TRUE CURRENT STATE! 🎯)
     * @param {string} query - Search query
     * @param {Array} sectionTypes - Optional array of section types to search
     * @param {number} totalLimit - Total number of sections to fetch
     * @returns {Promise<Object>} - Object with sections array and metadata
     */
    async searchAllIGSections(query, sectionTypes = null, totalLimit = 100) {
        if (!this.sdk) {
            throw new Error('SectionService not initialized');
        }

        logger.info('🔍 Searching sections via GraphQL with PREVIEW for TRUE STATE', { query, totalLimit });

        try {
            // Use GraphQL service for fast, no-rate-limit searching with preview: true
            const result = await graphqlSectionService.searchAllIGSections(query, sectionTypes, totalLimit, false, true);

            logger.info(`🔍 Search completed: ${result.sections.length} results found via GraphQL with preview`);

            return result;

        } catch (error) {
            logger.error('❌ Failed to search sections via GraphQL with preview:', error);
            throw error;
        }
    }

    /**
     * Determine the current status of an entry based on its sys properties
     * @param {Object} entry - The entry object from CMA
     * @returns {string} - One of: 'draft', 'published', 'changed', 'archived'
     */
    determineEntryStatus(entry) {
        const sys = entry.sys;

        // Check if archived
        if (sys.archivedVersion) {
            return 'archived';
        }

        // Check if it's a draft (never been published)
        if (!sys.publishedVersion) {
            return 'draft';
        }

        // Check if it has unpublished changes
        if (sys.version >= sys.publishedVersion + 2) {
            return 'changed';
        }

        // It's published and current
        if (sys.version === sys.publishedVersion + 1) {
            return 'published';
        }

        // Fallback
        return 'draft';
    }

    /**
     * Get status breakdown for logging
     * @param {Array} sections - Array of sections with status
     * @returns {Object} - Breakdown of statuses
     */
    getStatusBreakdown(sections) {
        const breakdown = {
            draft: 0,
            published: 0,
            changed: 0,
            archived: 0
        };

        sections.forEach(section => {
            if (breakdown.hasOwnProperty(section.status)) {
                breakdown[section.status]++;
            }
        });

        return breakdown;
    }

    /**
     * Search sections by text query
     * @param {string} query - Search query
     * @param {Array} sections - Sections to search through
     * @returns {Array} - Filtered sections
     */
    searchSections(query, sections) {
        if (!query || !query.trim()) {
            return sections;
        }

        const searchTerm = query.toLowerCase().trim();

        return sections.filter(section => {
            const entryTitle = getLocalizedValue(section.fields?.entryTitle, this.defaultLocale) || '';
            const title = getLocalizedValue(section.fields?.title, this.defaultLocale) || '';
            const slug = getLocalizedValue(section.fields?.slug, this.defaultLocale) || '';
            const typeName = section.typeName || '';

            return (
                String(entryTitle).toLowerCase().includes(searchTerm) ||
                String(title).toLowerCase().includes(searchTerm) ||
                String(slug).toLowerCase().includes(searchTerm) ||
                String(typeName).toLowerCase().includes(searchTerm)
            );
        });
    }

    /**
     * Get a single section by ID - CMA ONLY for full field data
     * (GraphQL basic fields are insufficient for conversions)
     * @param {string} entryId - The entry ID
     * @returns {Promise<Object>} - The section object with all fields
     */
    async getSection(entryId) {
        if (!this.cmaClient) {
            throw new Error('SectionService not initialized');
        }

        // For conversions, we ALWAYS need full field data, so use CMA directly
        logger.debug(`🔧 Fetching section with FULL FIELDS via CMA for conversion: ${entryId}`);
        return await rateLimiter.enqueue(async () => {
            const entry = await this.cmaClient.get({ entryId });
            logger.debug(`✅ Successfully fetched section ${entryId} via CMA with all fields`);
            return entry;
        });
    }

    /**
     * Get all entries that reference a specific section
     * @param {string} entryId - The entry ID to find references to
     * @returns {Promise<Array>} - Array of entries that reference this section
     */
    async getSectionReferences(entryId) {
        if (!this.cmaClient) {
            throw new Error('SectionService not initialized');
        }

        try {
            logger.debug(`Finding references to section: ${entryId}`);

            const response = await rateLimiter.enqueue(async () => {
                return await this.cmaClient.getMany({
                    query: {
                        links_to_entry: entryId,
                        limit: 1000
                    }
                });
            });

            logger.debug(`Found ${response.items.length} references to section ${entryId}:`,
                response.items.map(item => ({ id: item.sys.id, type: item.sys.contentType?.sys?.id }))
            );

            return response.items;

        } catch (error) {
            logger.error(`Failed to get references for section ${entryId}:`, error);

            // If it's a 404, the entry might not exist or have no references
            if (error.status === 404) {
                logger.warn(`No references found for entry ${entryId} (404 - entry may not exist)`);
                return [];
            }

            throw error;
        }
    }

    /**
     * Create a new converted section
     * @param {string} targetType - Target content type
     * @param {Object} convertedFields - The converted field data
     * @param {string} sourceSection - Source section ID for logging
     * @param {string} originalEntryTitle - The exact original entry title to use
     * @returns {Promise<Object>} - The created entry
     */
    async createConvertedSection(targetType, convertedFields, sourceSection, originalEntryTitle) {
        if (!this.cmaClient) {
            throw new Error('SectionService not initialized');
        }

        try {
            logger.debug('Creating section with:', {
                targetType,
                sourceSection,
                originalEntryTitle
            });

            // Ensure the new section gets the exact original name
            const finalFields = {
                ...convertedFields,
                entryTitle: {
                    [this.defaultLocale]: originalEntryTitle
                }
            };

            logger.debug('Final fields for API:', finalFields);
            logger.debug('Using space default locale:', this.defaultLocale);
            logger.debug('New section will be named:', originalEntryTitle);

            // Use rate limiter for entry creation
            const newEntry = await rateLimiter.enqueue(async () => {
                return await this.cmaClient.create(
                    { contentTypeId: targetType },
                    { fields: finalFields }
                );
            });

            logger.info('Successfully created new section:', newEntry.sys.id, 'with name:', originalEntryTitle);
            return newEntry;

        } catch (error) {
            logger.error('Error creating converted section:', error);
            logger.error('Error details:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                data: error.data
            });
            throw error;
        }
    }

    /**
     * Get the source locale from section fields
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
     * Update references from old section to new section
     * @param {string} oldEntryId - The old section entry ID
     * @param {string} newEntryId - The new section entry ID
     * @param {Array} references - Array of entries that reference the old section
     * @returns {Promise<Array>} - Array of update results
     */
    async updateReferences(oldEntryId, newEntryId, references) {
        const updateResults = [];

        logger.debug('Updating references:', {
            oldEntryId,
            newEntryId,
            referenceCount: references.length
        });

        for (const reference of references) {
            try {
                logger.debug(`Processing reference: ${reference.sys.id}`);

                // Get the current entry data
                const currentEntry = await rateLimiter.enqueue(async () => {
                    return await this.cmaClient.get({ entryId: reference.sys.id });
                });

                if (!currentEntry || !currentEntry.fields) {
                    logger.warn(`Reference entry ${reference.sys.id} has no fields, skipping`);
                    continue;
                }

                // Replace references in the fields
                const updatedFields = this.replaceReferencesInFields(
                    currentEntry.fields,
                    oldEntryId,
                    newEntryId
                );

                if (Object.keys(updatedFields).length === 0) {
                    logger.debug(`No references found in entry ${reference.sys.id}, skipping update`);
                    continue;
                }

                logger.debug(`Updating entry ${reference.sys.id} with new references`);

                // Update the entry using rate limiter
                await rateLimiter.enqueue(async () => {
                    return await this.cmaClient.update(
                        { entryId: reference.sys.id },
                        {
                            ...currentEntry,
                            fields: {
                                ...currentEntry.fields,
                                ...updatedFields
                            }
                        }
                    );
                });

                updateResults.push({
                    entryId: reference.sys.id,
                    success: true,
                    updatedFields: Object.keys(updatedFields)
                });

                logger.debug(`Successfully updated reference in entry: ${reference.sys.id}`);

            } catch (error) {
                logger.error(`Error updating reference in entry ${reference.sys.id}:`, error);
                updateResults.push({
                    entryId: reference.sys.id,
                    success: false,
                    error: error.message
                });
            }
        }

        logger.info(`Reference update complete. ${updateResults.filter(r => r.success).length}/${updateResults.length} successful`);
        return updateResults;
    }

    /**
     * Rename a section with "_old" suffix and archive it
     * Also updates slug with random suffix to avoid unique constraint collisions
     * @param {string} entryId - The entry ID to rename and archive
     * @param {string} currentTitle - Current entry title
     * @returns {Promise<Object>} - The updated entry
     */
    async renameAndArchiveSection(entryId, currentTitle) {
        if (!this.cmaClient) {
            throw new Error('SectionService not initialized');
        }

        try {
            const newTitle = `${currentTitle}_old`;
            const randomSuffix = Math.floor(Math.random() * 999) + 1; // Random number 1-999

            // Get the current entry first
            const currentEntry = await this.getSection(entryId);

            if (!currentEntry || !currentEntry.fields) {
                throw new Error(`Entry ${entryId} not found or has no fields`);
            }

            logger.debug(`Renaming and archiving section ${entryId}: "${currentTitle}" → "${newTitle}"`);

            // Step 1: Update both entryTitle and slug fields
            const updatedFields = {
                ...currentEntry.fields,
                entryTitle: {
                    [this.defaultLocale]: newTitle
                }
            };

            // Update slug if it exists, adding random suffix to avoid collisions
            if (currentEntry.fields.slug) {
                const currentSlug = getLocalizedValue(currentEntry.fields.slug, this.defaultLocale) || '';
                const newSlug = `${currentSlug}-${randomSuffix}`;
                updatedFields.slug = {
                    [this.defaultLocale]: newSlug
                };
                logger.debug(`Updating slug: "${currentSlug}" → "${newSlug}"`);
            }

            // Use rate limiter for the update
            const updatedEntry = await rateLimiter.enqueue(async () => {
                return await this.cmaClient.update(
                    { entryId: entryId },
                    {
                        ...currentEntry,
                        fields: updatedFields
                    }
                );
            });

            logger.debug(`Successfully renamed section ${entryId} to "${newTitle}"`);

            // Step 2: Unpublish the section if it's published (required before archiving)
            let entryToArchive = updatedEntry;
            if (currentEntry.sys.publishedVersion) {
                logger.debug(`Unpublishing section ${entryId} before archiving`);
                entryToArchive = await rateLimiter.enqueue(async () => {
                    return await this.cmaClient.unpublish(
                        { entryId: entryId },
                        updatedEntry
                    );
                });
                logger.debug(`Successfully unpublished section ${entryId}`);
            } else {
                logger.debug(`Section ${entryId} was not published, skipping unpublish step`);
            }

            // Step 3: Archive the section
            try {
                logger.debug(`Archiving section ${entryId}`);
                const archivedEntry = await rateLimiter.enqueue(async () => {
                    return await this.cmaClient.archive(
                        { entryId: entryId },
                        entryToArchive
                    );
                });
                logger.info(`Successfully archived section ${entryId} (title: "${newTitle}", slug: "${updatedFields.slug?.[this.defaultLocale] || 'no slug'}")`);
                return archivedEntry;
            } catch (archiveError) {
                logger.error(`Failed to archive section ${entryId}:`, archiveError);
                // Don't throw here - renaming and unpublishing succeeded, archiving is the final step
                return entryToArchive;
            }

        } catch (error) {
            logger.error(`Error renaming and archiving section ${entryId}:`, error);
            throw error;
        }
    }

    /**
     * Rename a section with "_old" suffix (legacy method - kept for compatibility)
     * @param {string} entryId - The entry ID to rename
     * @param {string} currentTitle - Current entry title
     * @returns {Promise<Object>} - The updated entry
     */
    async renameSection(entryId, currentTitle) {
        if (!this.cmaClient) {
            throw new Error('SectionService not initialized');
        }

        try {
            const newTitle = `${currentTitle}_old`;

            // Get the current entry first
            const currentEntry = await this.getSection(entryId);

            if (!currentEntry || !currentEntry.fields) {
                throw new Error(`Entry ${entryId} not found or has no fields`);
            }

            logger.info(`Renaming section ${entryId}: "${currentTitle}" → "${newTitle}"`);

            // Update the entryTitle field
            const updatedFields = {
                ...currentEntry.fields,
                entryTitle: {
                    [this.defaultLocale]: newTitle
                }
            };

            // Use rate limiter for the update
            const updatedEntry = await rateLimiter.enqueue(async () => {
                return await this.cmaClient.update(
                    { entryId: entryId },
                    {
                        ...currentEntry,
                        fields: updatedFields
                    }
                );
            });

            logger.info(`Successfully renamed section ${entryId}`);
            return updatedEntry;

        } catch (error) {
            logger.error(`Error renaming section ${entryId}:`, error);
            throw error;
        }
    }

    /**
     * Publish a section with comprehensive pre-validation
     * @param {string} entryId - The entry ID to publish
     * @returns {Promise<Object>} - The published entry
     */
    async publishSection(entryId) {
        logger.debug('📢 Publishing section:', entryId);

        try {
            // 🔍 CRITICAL: Get the current entry and validate before publishing
            const section = await this.getSection(entryId);
            const contentType = section.sys.contentType.sys.id;

            // Generate comprehensive validation report
            const fieldReport = getFieldReport(section.fields, this.defaultLocale);
            logger.info('📊 Pre-publish field analysis:', {
                entryId,
                contentType,
                totalFields: fieldReport.totalFields,
                validFields: fieldReport.fieldsByStatus.valid.length,
                emptyFields: fieldReport.fieldsByStatus.empty.length,
                missingFields: fieldReport.fieldsByStatus.missing.length,
                fieldsPresent: fieldReport.fieldsByStatus.present.length
            });

            // 🚨 VALIDATE REQUIRED FIELDS BEFORE PUBLISHING
            const validation = validateRequiredFields(section.fields, contentType, this.defaultLocale);

            logger.info('🔍 Pre-publish validation result:', {
                entryId,
                isValid: validation.isValid,
                totalRequired: validation.totalRequired,
                validFields: validation.valid.length,
                missingFields: validation.missing,
                invalidFields: validation.invalid.map(f => ({
                    field: f.fieldId,
                    value: f.value,
                    type: typeof f.value,
                    isArray: Array.isArray(f.value),
                    arrayLength: Array.isArray(f.value) ? f.value.length : 'N/A'
                }))
            });

            // 🛑 STOP if validation fails
            if (!validation.isValid) {
                const errorMessage = `❌ Cannot publish entry ${entryId}. Missing required fields: [${validation.missing.join(', ')}]. Invalid fields: [${validation.invalid.map(f => `${f.fieldId}(${typeof f.value})`).join(', ')}]`;
                logger.error(errorMessage);

                // Log detailed field analysis for debugging
                logger.error('🔬 Detailed field analysis:', {
                    allFieldsInEntry: Object.keys(section.fields),
                    requiredFieldsForType: REQUIRED_FIELDS[contentType] || [],
                    fieldReport: fieldReport.localeAnalysis
                });

                throw new Error(errorMessage);
            }

            logger.info('✅ Pre-publish validation passed, proceeding with publish');

            // Proceed with publishing using rate limiter
            const result = await rateLimiter.enqueue(async () => {
                logger.debug('Publishing section', entryId, '(title:',
                    this.getLocalizedValue(section.fields.entryTitle), ')');
                return await this.cmaClient.publish({ entryId }, section);
            });

            logger.info('🎉 Successfully published section:', entryId);
            return result;

        } catch (error) {
            logger.error('❌ Error publishing section', entryId + ':', error);
            throw error;
        }
    }

    /**
     * Helper method to replace references in entry fields
     * @param {Object} fields - The entry fields
     * @param {string} oldEntryId - Old entry ID to replace
     * @param {string} newEntryId - New entry ID to use
     * @returns {Object} - Updated fields
     */
    replaceReferencesInFields(fields, oldEntryId, newEntryId) {
        if (!fields || typeof fields !== 'object') {
            logger.warn('replaceReferencesInFields: fields is null or not an object', fields);
            return {};
        }

        const updatedFields = {};
        let hasChanges = false;

        for (const [fieldId, fieldValue] of Object.entries(fields)) {
            if (!fieldValue || typeof fieldValue !== 'object') {
                logger.debug(`Skipping field ${fieldId}: value is null or not an object`);
                continue;
            }

            // Handle localized fields - fieldValue should be an object with locale keys
            const updatedFieldValue = {};
            let fieldHasChanges = false;

            for (const [locale, value] of Object.entries(fieldValue)) {
                if (!value) {
                    logger.debug(`Skipping ${fieldId}.${locale}: value is null/undefined`);
                    updatedFieldValue[locale] = value;
                    continue;
                }

                let updatedValue = value;

                // Handle single link references
                if (value.sys && value.sys.id === oldEntryId) {
                    updatedValue = {
                        sys: {
                            type: 'Link',
                            linkType: 'Entry',
                            id: newEntryId
                        }
                    };
                    logger.debug(`Updated single reference in ${fieldId}.${locale}: ${oldEntryId} → ${newEntryId}`);
                    fieldHasChanges = true;
                }
                // Handle array of links
                else if (Array.isArray(value)) {
                    let arrayHasChanges = false;
                    const updatedArray = value.map(item => {
                        if (item && item.sys && item.sys.id === oldEntryId) {
                            logger.debug(`Updated array reference in ${fieldId}.${locale}: ${oldEntryId} → ${newEntryId}`);
                            arrayHasChanges = true;
                            return {
                                sys: {
                                    type: 'Link',
                                    linkType: 'Entry',
                                    id: newEntryId
                                }
                            };
                        }
                        return item;
                    });

                    // Only update if there were actual changes
                    if (arrayHasChanges) {
                        updatedValue = updatedArray;
                        fieldHasChanges = true;
                    }
                }

                updatedFieldValue[locale] = updatedValue;
            }

            // Only include fields that have changes
            if (fieldHasChanges) {
                updatedFields[fieldId] = updatedFieldValue;
                hasChanges = true;
            }
        }

        logger.debug('replaceReferencesInFields result:', {
            originalFieldCount: Object.keys(fields).length,
            updatedFieldCount: Object.keys(updatedFields).length,
            updatedFields: Object.keys(updatedFields),
            hasChanges
        });

        return updatedFields;
    }

    /**
     * Cache management methods
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Get localized field value with fallback logic
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
const sectionService = new SectionService();

export default sectionService;

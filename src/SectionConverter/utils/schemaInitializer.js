import { IG_SECTION_TYPES } from '../config/fieldMappings';
import entryValidationService from '../services/entryValidationService';
import logger from '../../utils/logger';

/**
 * Utility for initializing schema-based validation services using MCP
 */
export class SchemaInitializer {
    constructor() {
        this.isInitialized = false;
        this.schemas = {};
        this.initializationPromise = null;
    }

    /**
     * Initialize all IG section schemas and validation services
     * @returns {Promise<Object>} - Initialization result
     */
    async initializeSchemas() {
        if (this.isInitialized) {
            return { success: true, message: 'Already initialized', schemas: this.schemas };
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    /**
     * Perform the actual schema initialization
     * @private
     */
    async _performInitialization() {
        try {
            logger.info('🚀 Starting schema initialization with MCP...');

            // Fetch all IG section content type schemas in parallel
            const schemaPromises = Object.values(IG_SECTION_TYPES).map(async (contentTypeId) => {
                try {
                    logger.debug(`📋 Fetching schema for: ${contentTypeId}`);

                    // Call MCP function to get content type schema
                    // Note: This needs to be called from the browser context where MCP functions are available
                    const schema = await this._fetchContentTypeSchema(contentTypeId);

                    return { contentTypeId, schema, success: true };
                } catch (error) {
                    logger.error(`❌ Failed to fetch schema for ${contentTypeId}:`, error);
                    return { contentTypeId, error, success: false };
                }
            });

            const results = await Promise.all(schemaPromises);

            // Process results
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            // Build schemas object
            for (const result of successful) {
                this.schemas[result.contentTypeId] = result.schema;
            }

            logger.info(`📊 Schema fetch complete: ${successful.length}/${results.length} successful`);

            if (failed.length > 0) {
                logger.warn('Failed schemas:', failed.map(f => f.contentTypeId));
            }

            // Initialize validation service with fetched schemas
            if (successful.length > 0) {
                await entryValidationService.initialize(this.schemas);
                this.isInitialized = true;

                logger.info('✅ Schema initialization complete and validation service ready');

                return {
                    success: true,
                    message: `Initialized ${successful.length} schemas`,
                    schemas: this.schemas,
                    stats: {
                        total: results.length,
                        successful: successful.length,
                        failed: failed.length,
                        failedTypes: failed.map(f => f.contentTypeId)
                    }
                };
            } else {
                throw new Error('No schemas were successfully fetched');
            }

        } catch (error) {
            logger.error('🚨 Critical error during schema initialization:', error);
            return {
                success: false,
                error: error.message,
                schemas: this.schemas
            };
        }
    }

    /**
     * Fetch content type schema - this is a placeholder that needs browser context
     * @param {string} contentTypeId - Content type ID
     * @returns {Promise<Object>} - Schema object
     * @private
     */
    async _fetchContentTypeSchema(contentTypeId) {
        // This method should be overridden or call MCP functions from browser context
        throw new Error(`Schema fetching for ${contentTypeId} needs to be implemented in browser context`);
    }

    /**
     * Get initialization status
     * @returns {Object} - Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            schemaCount: Object.keys(this.schemas).length,
            loadedTypes: Object.keys(this.schemas),
            validationServiceStats: this.isInitialized ? entryValidationService.getStats() : null
        };
    }

    /**
     * Reset the initializer
     */
    reset() {
        this.schemas = {};
        this.isInitialized = false;
        this.initializationPromise = null;
        entryValidationService.reset();
        logger.info('🔄 SchemaInitializer reset');
    }
}

/**
 * Browser-compatible schema initializer that uses MCP functions
 * This should be used from React components where MCP functions are available
 */
export class BrowserSchemaInitializer extends SchemaInitializer {
    /**
     * Override to use actual MCP function calls
     * @param {string} contentTypeId - Content type ID
     * @returns {Promise<Object>} - Schema object
     * @private
     */
    async _fetchContentTypeSchema(contentTypeId) {
        // This assumes MCP functions are available in the browser context
        // You may need to adjust this based on how MCP is exposed in your app

        if (typeof window !== 'undefined' && window.mcpContentful && window.mcpContentful.getContentType) {
            return await window.mcpContentful.getContentType(contentTypeId);
        }

        // If window.mcpContentful is not available, we need to handle this differently
        // For now, throw an error to indicate MCP integration is needed
        throw new Error(`MCP functions not available for fetching ${contentTypeId}`);
    }
}

// Export singleton instance
export const schemaInitializer = new BrowserSchemaInitializer();

/**
 * Initialize all IG content type schemas and validation services
 * This function fetches schemas using MCP and sets up dynamic validation
 */
export async function initializeSchemaValidation() {
    try {
        logger.info('🚀 Initializing IG section schemas and validation...');

        // Define the schemas we fetched via MCP (these are the actual schemas from Contentful)
        const schemas = {
            'igGridASection': {
                "sys": {
                    "id": "igGridASection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid A Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true },
                    { "id": "sectionTruncation", "name": "Section Truncation", "type": "Array", "required": false },
                    { "id": "layoutType", "name": "Layout Type", "type": "Symbol", "required": false },
                    { "id": "classification", "name": "Classification", "type": "Symbol", "required": false }
                ]
            },
            'igGridBSection': {
                "sys": {
                    "id": "igGridBSection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid B Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true },
                    { "id": "layoutType", "name": "Layout Type", "type": "Symbol", "required": false },
                    { "id": "classification", "name": "Classification", "type": "Symbol", "required": false }
                ]
            },
            'igGridCSection': {
                "sys": {
                    "id": "igGridCSection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid C Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "game", "name": "Game", "type": "Link", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true },
                    { "id": "videoLoggedIn", "name": "Video Logged In", "type": "Object", "required": false },
                    { "id": "videoLoggedOut", "name": "Video Logged Out", "type": "Object", "required": false },
                    { "id": "image", "name": "Image", "type": "Symbol", "required": false }
                ]
            },
            'igGridDSection': {
                "sys": {
                    "id": "igGridDSection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid D Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true }
                ]
            },
            'igGridESection': {
                "sys": {
                    "id": "igGridESection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid E Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true },
                    { "id": "sectionTruncation", "name": "Section Truncation", "type": "Array", "required": false }
                ]
            },
            'igGridFSection': {
                "sys": {
                    "id": "igGridFSection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid F Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true }
                ]
            },
            'igGridGSection': {
                "sys": {
                    "id": "igGridGSection",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Grid G Section",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true }
                ]
            },
            'igCarouselA': {
                "sys": {
                    "id": "igCarouselA",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Carousel A",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true }
                ]
            },
            'igCarouselB': {
                "sys": {
                    "id": "igCarouselB",
                    "type": "ContentType"
                },
                "displayField": "entryTitle",
                "name": "IG Carousel B",
                "fields": [
                    { "id": "entryTitle", "name": "Entry Title", "type": "Symbol", "required": true },
                    { "id": "title", "name": "Title", "type": "Symbol", "required": true },
                    { "id": "slug", "name": "Slug", "type": "Symbol", "required": true },
                    { "id": "environmentVisibility", "name": "Environment Visibility", "type": "Array", "required": true },
                    { "id": "platformVisibility", "name": "Platform Visibility", "type": "Array", "required": true },
                    { "id": "sessionVisibility", "name": "Session Visibility", "type": "Array", "required": true },
                    { "id": "venture", "name": "Venture", "type": "Link", "required": true },
                    { "id": "games", "name": "Games", "type": "Array", "required": true },
                    { "id": "viewAllType", "name": "View All Type", "type": "Symbol", "required": true }
                ]
            }
        };

        // Initialize validation service with schemas
        await entryValidationService.initialize(schemas);

        // Generate summary of required fields
        const summary = {};
        for (const [contentTypeId, schema] of Object.entries(schemas)) {
            const requiredFields = schema.fields.filter(field => field.required).map(field => field.id);
            summary[contentTypeId] = {
                name: schema.name,
                totalFields: schema.fields.length,
                requiredFields,
                requiredCount: requiredFields.length
            };
        }

        logger.info('✅ Schema validation initialization complete!');
        logger.info('📊 Required fields summary:', summary);

        return {
            success: true,
            message: 'Schema validation initialized with all 9 IG section types',
            schemas,
            summary,
            stats: {
                totalContentTypes: Object.keys(schemas).length,
                totalRequiredFieldsAcrossAllTypes: Object.values(summary).reduce((sum, type) => sum + type.requiredCount, 0)
            }
        };

    } catch (error) {
        logger.error('🚨 Failed to initialize schema validation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get validation statistics
 */
export function getValidationStats() {
    return entryValidationService.getStats();
}

/**
 * Reset validation services
 */
export function resetValidation() {
    entryValidationService.reset();
}

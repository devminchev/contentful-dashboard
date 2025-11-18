import { IG_SECTION_TYPES } from '../config/fieldMappings';
import logger from '../../utils/logger';

/**
 * Service for managing content type schemas and required field validation
 * Accepts pre-fetched schemas from MCP and provides validation methods
 */
class ContentTypeSchemaService {
    constructor() {
        this.schemas = new Map(); // Cache for content type schemas
        this.isInitialized = false;
    }

    /**
     * Initialize the service with pre-fetched schemas
     * @param {Object} schemas - Object with contentTypeId as key and schema as value
     * @returns {Promise<void>}
     */
    async initializeWithSchemas(schemas) {
        try {
            logger.info('🔍 Initializing ContentTypeSchemaService with schemas...');

            let successful = 0;
            let failed = 0;

            for (const [contentTypeId, schema] of Object.entries(schemas)) {
                if (schema && schema.fields) {
                    this.schemas.set(contentTypeId, schema);
                    successful++;
                    logger.debug(`✅ Loaded schema for ${contentTypeId} with ${schema.fields.length} fields`);
                } else {
                    failed++;
                    logger.warn(`❌ Invalid schema for ${contentTypeId}`);
                }
            }

            this.isInitialized = true;
            logger.info(`📊 Schema initialization complete: ${successful} successful, ${failed} failed`);

        } catch (error) {
            logger.error('🚨 Critical error during schema initialization:', error);
            throw error;
        }
    }

    /**
     * Get required fields for a specific content type
     * @param {string} contentTypeId - The content type ID
     * @returns {Array<string>} - Array of required field IDs
     */
    getRequiredFields(contentTypeId) {
        if (!this.isInitialized) {
            logger.warn('⚠️ ContentTypeSchemaService not initialized, falling back to empty array');
            return [];
        }

        const schema = this.schemas.get(contentTypeId);
        if (!schema) {
            logger.warn(`⚠️ No schema found for content type: ${contentTypeId}`);
            return [];
        }

        return this._extractRequiredFields(schema);
    }

    /**
     * Extract required field IDs from a content type schema
     * @param {Object} schema - The content type schema from Contentful
     * @returns {Array<string>} - Array of required field IDs
     * @private
     */
    _extractRequiredFields(schema) {
        if (!schema.fields || !Array.isArray(schema.fields)) {
            return [];
        }

        return schema.fields
            .filter(field => field.required === true)
            .map(field => field.id);
    }

    /**
     * Get field definition for a specific field in a content type
     * @param {string} contentTypeId - The content type ID
     * @param {string} fieldId - The field ID
     * @returns {Object|null} - The field definition or null if not found
     */
    getFieldDefinition(contentTypeId, fieldId) {
        const schema = this.schemas.get(contentTypeId);
        if (!schema || !schema.fields) {
            return null;
        }

        return schema.fields.find(field => field.id === fieldId) || null;
    }

    /**
     * Check if a content type schema is loaded
     * @param {string} contentTypeId - The content type ID
     * @returns {boolean} - Whether the schema is available
     */
    hasSchema(contentTypeId) {
        return this.schemas.has(contentTypeId);
    }

    /**
     * Get all loaded schema content type IDs
     * @returns {Array<string>} - Array of content type IDs that have schemas loaded
     */
    getLoadedContentTypes() {
        return Array.from(this.schemas.keys());
    }

    /**
     * Clear the schema cache and reset initialization state
     * @returns {void}
     */
    reset() {
        this.schemas.clear();
        this.isInitialized = false;
        logger.info('🔄 ContentTypeSchemaService cache cleared');
    }

    /**
     * Get cache statistics for debugging
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            totalSchemas: this.schemas.size,
            isInitialized: this.isInitialized,
            loadedContentTypes: this.getLoadedContentTypes(),
            missingSchemas: Object.values(IG_SECTION_TYPES).filter(
                contentTypeId => !this.schemas.has(contentTypeId)
            )
        };
    }

    /**
     * Get a comprehensive report of required vs available fields for a content type
     * @param {string} contentTypeId - The content type ID
     * @returns {Object} - Field analysis report
     */
    getFieldAnalysis(contentTypeId) {
        const schema = this.schemas.get(contentTypeId);
        if (!schema) {
            return { error: `No schema found for ${contentTypeId}` };
        }

        const requiredFields = this._extractRequiredFields(schema);
        const allFields = schema.fields.map(field => field.id);
        const optionalFields = allFields.filter(fieldId => !requiredFields.includes(fieldId));

        return {
            contentTypeId,
            totalFields: allFields.length,
            requiredFields,
            optionalFields,
            requiredCount: requiredFields.length,
            optionalCount: optionalFields.length
        };
    }
}

// Create and export singleton instance
const contentTypeSchemaService = new ContentTypeSchemaService();
export default contentTypeSchemaService;

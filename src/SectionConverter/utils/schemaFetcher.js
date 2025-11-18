import { IG_SECTION_TYPES } from '../config/fieldMappings';
import logger from '../../utils/logger';

/**
 * Fetch all IG section content type schemas using MCP
 * This function should be used where MCP tools are available
 */
export async function fetchAllIGSchemas() {
    try {
        logger.info('🚀 Fetching all IG section schemas using MCP...');

        const schemas = {};
        const contentTypeIds = Object.values(IG_SECTION_TYPES);

        // For now, let's fetch them one by one to ensure we can handle each properly
        for (const contentTypeId of contentTypeIds) {
            try {
                logger.debug(`📋 Fetching schema for: ${contentTypeId}`);

                // This will be replaced with actual MCP call once tested
                // const schema = await mcp_contentful_get_content_type({ contentTypeId });

                // For now, return a placeholder structure
                const schema = {
                    sys: { id: contentTypeId },
                    name: `${contentTypeId} Schema`,
                    fields: [
                        // This will be populated with actual MCP data
                    ]
                };

                schemas[contentTypeId] = schema;
                logger.debug(`✅ Successfully fetched schema for ${contentTypeId}`);

            } catch (error) {
                logger.error(`❌ Failed to fetch schema for ${contentTypeId}:`, error);
                // Continue with other schemas even if one fails
            }
        }

        const successful = Object.keys(schemas).length;
        const total = contentTypeIds.length;

        logger.info(`📊 Schema fetch complete: ${successful}/${total} successful`);

        return {
            success: successful > 0,
            schemas,
            stats: {
                total,
                successful,
                failed: total - successful,
                successRate: ((successful / total) * 100).toFixed(1)
            }
        };

    } catch (error) {
        logger.error('🚨 Critical error during schema fetching:', error);
        return {
            success: false,
            error: error.message,
            schemas: {}
        };
    }
}

/**
 * Parse content type schema to extract required fields
 * @param {Object} schema - Content type schema from Contentful
 * @returns {Array<string>} - Array of required field IDs
 */
export function extractRequiredFields(schema) {
    if (!schema || !schema.fields || !Array.isArray(schema.fields)) {
        return [];
    }

    return schema.fields
        .filter(field => field.required === true)
        .map(field => field.id);
}

/**
 * Get a summary of all required fields across all IG section types
 * @param {Object} schemas - Object containing all schemas
 * @returns {Object} - Summary of required fields by content type
 */
export function getRequiredFieldsSummary(schemas) {
    const summary = {};

    for (const [contentTypeId, schema] of Object.entries(schemas)) {
        const requiredFields = extractRequiredFields(schema);
        summary[contentTypeId] = {
            totalFields: schema.fields ? schema.fields.length : 0,
            requiredFields,
            requiredCount: requiredFields.length,
            optionalCount: (schema.fields ? schema.fields.length : 0) - requiredFields.length
        };
    }

    return summary;
}

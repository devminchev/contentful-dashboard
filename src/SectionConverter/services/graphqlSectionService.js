import { IG_SECTION_TYPES, SECTION_TYPE_NAMES } from '../config/fieldMappings';
import logger from '../../utils/logger';

/**
 * GraphQL service for fast IG section fetching (no rate limits!)
 */
class GraphQLSectionService {
    constructor() {
        this.graphqlClient = null;
        this.headers = {};
        this.spaceId = null;
        this.environmentId = null;
        this.defaultLocale = 'en-US'; // Will be overridden by SDK during initialize
    }

    /**
     * Initialize the service with Contentful SDK
     * @param {Object} sdk - The Contentful SDK from useSDK
     */
    initialize(sdk) {
        this.spaceId = sdk.ids.space;
        // 🎯 Use environment alias if available, otherwise use environment ID
        // This handles cases where master alias points to non-existent environments
        this.environmentId = sdk.ids.environmentAlias || sdk.ids.environment;
        // 🚨 CRITICAL: Use SDK's actual locale, with space-aware fallback
        const spaceAwareFallback = this.spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        this.defaultLocale = sdk.locales?.default || spaceAwareFallback;
        this.availableLocales = sdk.locales?.available || [this.defaultLocale];

        // Set up GraphQL client
        this.headers = {
            Authorization: `Bearer ${this.spaceId === 'nw2595tc1jdx' ? process.env.REACT_APP_GRAPHQL_TOKEN_UK : process.env.REACT_APP_GRAPHQL_TOKEN_US}`,
            'Content-Type': 'application/json'
        };

        logger.info('GraphQLSectionService initialized with:', {
            defaultLocale: this.defaultLocale,
            availableLocales: this.availableLocales,
            spaceId: this.spaceId,
            environmentId: this.environmentId
        });
    }

    /**
     * Make a GraphQL request
     * @param {string} query - GraphQL query
     * @param {Object} variables - Query variables
     * @returns {Promise<Object>} - GraphQL response data
     */
    async makeGraphQLRequest(query, variables = {}) {
        const url = `https://graphql.contentful.com/content/v1/spaces/${this.spaceId}/environments/${this.environmentId}`;

        logger.debug('Making GraphQL request to:', url);
        logger.debug('Query:', query);
        logger.debug('Variables:', variables);

        const response = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                query,
                variables
            })
        });

        const responseText = await response.text();
        logger.debug('GraphQL response status:', response.status);
        logger.debug('GraphQL response text:', responseText);

        if (!response.ok) {
            logger.error('GraphQL request failed:', {
                status: response.status,
                statusText: response.statusText,
                responseText,
                url,
                query,
                variables
            });
            throw new Error(`GraphQL request failed: ${response.status} ${response.statusText} - ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            logger.error('Failed to parse GraphQL response:', responseText);
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (result.errors) {
            logger.error('GraphQL errors:', result.errors);
            throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
        }

        return result.data;
    }

    /**
     * Build GraphQL query for fetching sections - OPTIMIZED for query size limits
     * ✨ NOW WITH PREVIEW: TRUE for current state (draft/published/changed)! 🎯
     * @param {Array} sectionTypes - Array of content type IDs
     * @param {string} searchQuery - Optional search query
     * @param {number} limit - Maximum number of items per type
     * @param {boolean} fullFields - Whether to fetch all fields (for conversions) or just basic fields (for listing)
     * @param {boolean} includeReferenceCounts - Whether to include reference count fields
     * @returns {Object} - Query and variables for GraphQL
     */
    buildSectionsQuery(sectionTypes, searchQuery = null, limit = 15, fullFields = false, includeReferenceCounts = true) {
        const searchWhere = searchQuery ?
            this.buildSearchWhereClause(searchQuery) : '';

        const typeQueries = sectionTypes.map(contentType => {
            const graphQLTypeName = this.getGraphQLTypeName(contentType);
            const collectionKey = contentType.replace(/[^a-zA-Z0-9]/g, '_');

            // Basic fields for listing (MINIMAL to stay under 8KB query limit!)
            const basicFields = `
                        sys {
                            id
                            publishedAt
                            publishedVersion
                        }
                        entryTitle
                        title
                        slug
            `;

            // Reference count fields - gets total count of all entries linking to this section
            const referenceCountFields = includeReferenceCounts ? `
                        linkedFrom {
                            entryCollection(limit: 0) {
                                total
                            }
                        }
            ` : '';

            // Full fields for conversions (large query size)
            const conversionFields = `
                        sys {
                            id
                            publishedAt
                            publishedVersion
                        }
                        # Basic fields
                        entryTitle
                        title
                        slug

                        # Required fields for conversions
                        venture {
                            sys {
                                id
                            }
                        }
                        games {
                            sys {
                                id
                            }
                        }

                        # Visibility and classification fields
                        environmentVisibility
                        platformVisibility
                        sessionVisibility
                        classification

                        # Layout and display fields
                        layoutType
                        expandedSectionLayoutType
                        sectionTruncation

                        # View all fields
                        viewAllAction {
                            sys {
                                id
                            }
                        }
                        viewAllActionText
                        viewAllType

                        # Grid C specific fields (when applicable)
                        game {
                            sys {
                                id
                            }
                        }
                        media {
                            sys {
                                id
                            }
                        }

                        # Additional fields that might be present
                        description
                        subtitle
                        backgroundMedia {
                            sys {
                                id
                            }
                        }
                        ctaText
                        ctaUrl
                        priority
                        isActive
                        displayOrder

                        # Reference counts for conversion view too
                        ${referenceCountFields}
            `;

            const fieldsToUse = fullFields ? conversionFields : (basicFields + referenceCountFields);

            return `
                ${collectionKey}: ${graphQLTypeName}Collection(
                    preview: true
                    limit: ${limit}
                    where: {
                        ${searchWhere}
                    }
                    order: [sys_publishedAt_DESC]
                ) {
                    items {
                        ${fieldsToUse}
                    }
                }
            `;
        });

        const query = `
            query GetIGSections {
                ${typeQueries.join('\n')}
            }
        `;

        return { query, variables: {} };
    }

    /**
     * Build search where clause for GraphQL
     * @param {string} searchQuery - Search term
     * @returns {string} - GraphQL where clause
     */
    buildSearchWhereClause(searchQuery) {
        return `
            OR: [
                { entryTitle_contains: "${searchQuery}" }
                { title_contains: "${searchQuery}" }
                { slug_contains: "${searchQuery}" }
            ]
        `;
    }

    /**
     * Get GraphQL type name from content type ID
     * @param {string} contentTypeId - Contentful content type ID
     * @returns {string} - GraphQL type name
     */
    getGraphQLTypeName(contentTypeId) {
        // The content type IDs are already in the correct camelCase format!
        // igGridASection, igGridBSection, igCarouselA, etc.
        return contentTypeId;
    }

    /**
     * Transform GraphQL response to match existing section format
     * @param {Object} data - GraphQL response data
     * @param {Array} sectionTypes - Section types that were queried
     * @returns {Array} - Transformed sections array
     */
    transformGraphQLResponse(data, sectionTypes) {
        const allSections = [];

        sectionTypes.forEach(contentType => {
            const collectionKey = contentType.replace(/[^a-zA-Z0-9]/g, '_');
            const collection = data[collectionKey];
            if (collection && collection.items) {
                const sectionsWithType = collection.items.map(section => {
                    // Create localized fields structure similar to CMA
                    const fields = {};

                    // Helper function to create localized field
                    const createLocalizedField = (value) => {
                        if (value === null || value === undefined) return null;
                        return { [this.defaultLocale]: value };
                    };

                    // Helper function to transform link field
                    const transformLinkField = (linkData) => {
                        if (!linkData || !linkData.sys || !linkData.sys.id) return null;
                        return {
                            [this.defaultLocale]: {
                                sys: {
                                    type: 'Link',
                                    linkType: 'Entry',
                                    id: linkData.sys.id
                                }
                            }
                        };
                    };

                    // Helper function to transform array of links
                    const transformLinkArray = (linkArray) => {
                        if (!Array.isArray(linkArray) || linkArray.length === 0) return null;
                        return {
                            [this.defaultLocale]: linkArray.map(link => ({
                                sys: {
                                    type: 'Link',
                                    linkType: 'Entry',
                                    id: link.sys.id
                                }
                            }))
                        };
                    };

                    // Transform basic text fields
                    if (section.entryTitle !== undefined) {
                        fields.entryTitle = createLocalizedField(section.entryTitle);
                    }
                    if (section.title !== undefined) {
                        fields.title = createLocalizedField(section.title);
                    }
                    if (section.slug !== undefined) {
                        fields.slug = createLocalizedField(section.slug);
                    }
                    if (section.description !== undefined) {
                        fields.description = createLocalizedField(section.description);
                    }
                    if (section.subtitle !== undefined) {
                        fields.subtitle = createLocalizedField(section.subtitle);
                    }

                    // Transform link fields
                    if (section.venture) {
                        fields.venture = transformLinkField(section.venture);
                    }
                    if (section.viewAllAction) {
                        fields.viewAllAction = transformLinkField(section.viewAllAction);
                    }
                    if (section.game) {
                        fields.game = transformLinkField(section.game);
                    }
                    if (section.media) {
                        fields.media = transformLinkField(section.media);
                    }
                    if (section.backgroundMedia) {
                        fields.backgroundMedia = transformLinkField(section.backgroundMedia);
                    }

                    // Transform array of links
                    if (section.games) {
                        fields.games = transformLinkArray(section.games);
                    }

                    // Transform visibility and classification fields
                    if (section.environmentVisibility !== undefined) {
                        fields.environmentVisibility = createLocalizedField(section.environmentVisibility);
                    }
                    if (section.platformVisibility !== undefined) {
                        fields.platformVisibility = createLocalizedField(section.platformVisibility);
                    }
                    if (section.sessionVisibility !== undefined) {
                        fields.sessionVisibility = createLocalizedField(section.sessionVisibility);
                    }
                    if (section.classification !== undefined) {
                        fields.classification = createLocalizedField(section.classification);
                    }

                    // Transform layout and display fields
                    if (section.layoutType !== undefined) {
                        fields.layoutType = createLocalizedField(section.layoutType);
                    }
                    if (section.expandedSectionLayoutType !== undefined) {
                        fields.expandedSectionLayoutType = createLocalizedField(section.expandedSectionLayoutType);
                    }
                    if (section.sectionTruncation !== undefined) {
                        fields.sectionTruncation = createLocalizedField(section.sectionTruncation);
                    }

                    // Transform view all fields
                    if (section.viewAllActionText !== undefined) {
                        fields.viewAllActionText = createLocalizedField(section.viewAllActionText);
                    }
                    if (section.viewAllType !== undefined) {
                        fields.viewAllType = createLocalizedField(section.viewAllType);
                    }

                    // Transform additional fields
                    if (section.ctaText !== undefined) {
                        fields.ctaText = createLocalizedField(section.ctaText);
                    }
                    if (section.ctaUrl !== undefined) {
                        fields.ctaUrl = createLocalizedField(section.ctaUrl);
                    }
                    if (section.priority !== undefined) {
                        fields.priority = createLocalizedField(section.priority);
                    }
                    if (section.isActive !== undefined) {
                        fields.isActive = createLocalizedField(section.isActive);
                    }
                    if (section.displayOrder !== undefined) {
                        fields.displayOrder = createLocalizedField(section.displayOrder);
                    }

                    return {
                        sys: {
                            ...section.sys,
                            // Map publishedAt to updatedAt for UI compatibility
                            updatedAt: section.sys.publishedAt,
                            contentType: {
                                sys: {
                                    id: contentType
                                }
                            }
                        },
                        // Transform GraphQL fields to match CMA structure with localized fields
                        fields,
                        typeName: SECTION_TYPE_NAMES[contentType] || contentType,
                        // 🎯 NEW: Add current status from GraphQL sys data
                        status: this.determineEntryStatus(section.sys),
                        // 🎯 NEW: Add reference count for table display
                        referenceCount: section.linkedFrom?.entryCollection?.total || 0
                    };
                });
                allSections.push(...sectionsWithType);
            }
        });

        return allSections;
    }

    /**
     * Get all IG sections (BLAZINGLY FAST! 🚀) - OPTIMIZED for initial loading
     * Now with SMART QUERY CHUNKING to avoid 8KB GraphQL limit! 🎯
     * @param {Array} sectionTypes - Optional array of section types to fetch
     * @param {number} totalLimit - Total number of sections to fetch across all types (default: 100)
     * @param {boolean} fullFields - Whether to fetch all fields (for conversions) or just basic fields (for listing)
     * @param {boolean} includeReferenceCounts - Whether to include reference counts (default: true for table display)
     * @returns {Promise<Object>} - Object with sections array and metadata
     */
    async getAllIGSections(sectionTypes = null, totalLimit = 100, fullFields = false, includeReferenceCounts = true) {
        const typesToFetch = sectionTypes || Object.values(IG_SECTION_TYPES);

        // 🛡️ GUARD: If no types to fetch, return empty result
        if (!typesToFetch || typesToFetch.length === 0) {
            logger.info('🚫 No section types specified, returning empty result');
            return {
                sections: [],
                totalCount: 0,
                errors: []
            };
        }

        // 🎯 SMART QUERY CHUNKING: Split into smaller chunks to avoid 8KB GraphQL limit
        const maxTypesPerChunk = fullFields ? 2 : 4; // Fewer types when fetching full fields
        const chunks = [];
        for (let i = 0; i < typesToFetch.length; i += maxTypesPerChunk) {
            chunks.push(typesToFetch.slice(i, i + maxTypesPerChunk));
        }

        logger.debug(`📦 Split ${typesToFetch.length} content types into ${chunks.length} chunks of max ${maxTypesPerChunk} types each to avoid GraphQL query size limit`);

        // 🎯 SMART LIMIT DISTRIBUTION: Distribute totalLimit across chunks
        const limitPerChunk = Math.ceil(totalLimit / chunks.length);

        const fieldsDescription = fullFields ? "ALL FIELDS for conversions" : "BASIC FIELDS for listing";
        const referencesDescription = includeReferenceCounts ? " + REFERENCE COUNTS" : "";
        logger.debug(`🚀 Fetching IG sections via GraphQL in ${chunks.length} chunks (${fieldsDescription}${referencesDescription}, total limit: ${totalLimit}, ~${limitPerChunk} per chunk, NO RATE LIMITS!)...`);

        try {
            const allSections = [];

            // Execute chunks in parallel for maximum speed
            const chunkPromises = chunks.map(async (chunkTypes, chunkIndex) => {
                const limitPerType = Math.max(1, Math.floor(limitPerChunk / chunkTypes.length));

                logger.debug(`📦 Processing chunk ${chunkIndex + 1}/${chunks.length}: ${chunkTypes.join(', ')} (~${limitPerType} per type)`);

                const { query } = this.buildSectionsQuery(chunkTypes, null, limitPerType, fullFields, includeReferenceCounts);
                const data = await this.makeGraphQLRequest(query);
                const chunkSections = this.transformGraphQLResponse(data, chunkTypes);

                logger.debug(`✅ Chunk ${chunkIndex + 1} completed: ${chunkSections.length} sections`);
                return chunkSections;
            });

            // Wait for all chunks to complete
            const chunkResults = await Promise.all(chunkPromises);
            chunkResults.forEach(chunkSections => {
                allSections.push(...chunkSections);
            });

            // 🎯 ENFORCE GLOBAL LIMIT: Trim to exact totalLimit if we have more sections
            let sections = allSections;
            if (sections.length > totalLimit) {
                // Sort by updatedAt desc to keep the most recent sections
                const originalCount = sections.length;
                sections.sort((a, b) => new Date(b.sys.updatedAt) - new Date(a.sys.updatedAt));
                sections = sections.slice(0, totalLimit);
                logger.debug(`📏 Trimmed sections from ${originalCount} to ${sections.length} to respect total limit`);
            }

            logger.info(`🎉 GraphQL fetch complete! Found ${sections.length} sections (${fieldsDescription}${referencesDescription}) within limit of ${totalLimit} via ${chunks.length} chunks`);

            return {
                sections,
                totalCount: sections.length,
                errors: []
            };
        } catch (error) {
            logger.error('GraphQL getAllIGSections error:', error);
            throw error;
        }
    }

    /**
     * Search IG sections (BLAZINGLY FAST! 🚀) - OPTIMIZED for query size
     * Now with SMART QUERY CHUNKING to avoid 8KB GraphQL limit! 🎯
     * @param {string} query - Search query
     * @param {Array} sectionTypes - Optional array of section types to search
     * @param {number} totalLimit - Total number of sections to fetch across all types (default: 100)
     * @param {boolean} fullFields - Whether to fetch all fields (for conversions) or just basic fields (for listing)
     * @param {boolean} includeReferenceCounts - Whether to include reference counts (default: true for table display)
     * @returns {Promise<Object>} - Object with matching sections
     */
    async searchAllIGSections(query, sectionTypes = null, totalLimit = 100, fullFields = false, includeReferenceCounts = true) {
        if (!query || query.trim() === '') {
            return await this.getAllIGSections(sectionTypes, totalLimit, fullFields, includeReferenceCounts);
        }

        const typesToSearch = sectionTypes || Object.values(IG_SECTION_TYPES);

        // 🛡️ GUARD: If no types to search, return empty result
        if (!typesToSearch || typesToSearch.length === 0) {
            logger.info('🚫 No section types specified for search, returning empty result');
            return {
                sections: [],
                totalCount: 0,
                errors: []
            };
        }

        // 🎯 SMART QUERY CHUNKING: Split into smaller chunks to avoid 8KB GraphQL limit
        const maxTypesPerChunk = fullFields ? 2 : 4; // Fewer types when fetching full fields
        const chunks = [];
        for (let i = 0; i < typesToSearch.length; i += maxTypesPerChunk) {
            chunks.push(typesToSearch.slice(i, i + maxTypesPerChunk));
        }

        logger.debug(`📦 Split ${typesToSearch.length} content types into ${chunks.length} chunks of max ${maxTypesPerChunk} types each for search`);

        // 🎯 SMART LIMIT DISTRIBUTION: Distribute totalLimit across chunks
        const limitPerChunk = Math.ceil(totalLimit / chunks.length);

        const fieldsDescription = fullFields ? "ALL FIELDS for conversions" : "BASIC FIELDS for listing";
        const referencesDescription = includeReferenceCounts ? " + REFERENCE COUNTS" : "";

        logger.debug(`🔍 Searching IG sections via GraphQL for: "${query}" in ${chunks.length} chunks (${fieldsDescription}${referencesDescription}, total limit: ${totalLimit}, ~${limitPerChunk} per chunk, NO RATE LIMITS!)...`);

        try {
            const allSections = [];

            // Execute chunks in parallel for maximum speed
            const chunkPromises = chunks.map(async (chunkTypes, chunkIndex) => {
                const limitPerType = Math.max(1, Math.floor(limitPerChunk / chunkTypes.length));

                logger.debug(`📦 Processing search chunk ${chunkIndex + 1}/${chunks.length}: ${chunkTypes.join(', ')} (~${limitPerType} per type)`);

                const { query: graphqlQuery } = this.buildSectionsQuery(chunkTypes, query, limitPerType, fullFields, includeReferenceCounts);
                const data = await this.makeGraphQLRequest(graphqlQuery);
                const chunkSections = this.transformGraphQLResponse(data, chunkTypes);

                logger.debug(`✅ Search chunk ${chunkIndex + 1} completed: ${chunkSections.length} sections`);
                return chunkSections;
            });

            // Wait for all chunks to complete
            const chunkResults = await Promise.all(chunkPromises);
            chunkResults.forEach(chunkSections => {
                allSections.push(...chunkSections);
            });

            // 🎯 ENFORCE GLOBAL LIMIT: Trim to exact totalLimit if we have more sections
            let sections = allSections;
            if (sections.length > totalLimit) {
                // Sort by updatedAt desc to keep the most recent sections
                const originalCount = sections.length;
                sections.sort((a, b) => new Date(b.sys.updatedAt) - new Date(a.sys.updatedAt));
                sections = sections.slice(0, totalLimit);
                logger.debug(`📏 Trimmed sections from ${originalCount} to ${sections.length} to respect total limit`);
            }

            logger.info(`🎉 GraphQL search complete! Found ${sections.length} matching sections (${fieldsDescription}${referencesDescription}) within limit of ${totalLimit} via ${chunks.length} chunks`);

            return {
                sections,
                totalCount: sections.length,
                errors: []
            };
        } catch (error) {
            logger.error('GraphQL searchAllIGSections error:', error);
            throw error;
        }
    }

    /**
     * Get a single section by ID - FALLBACK TO CMA for single entries
     * (GraphQL doesn't have a simple entry query, so we use CMA for this)
     * @param {string} entryId - The entry ID
     * @returns {Promise<Object>} - The section object
     */
    async getSection(entryId) {
        logger.debug(`📋 Single section fetch - falling back to CMA (GraphQL doesn't support single entry queries easily): ${entryId}`);

        // For single entry operations during conversion, we fall back to CMA
        // This is only used during write operations anyway, so no performance impact
        throw new Error('getSection should fallback to CMA - this method should not be called directly');
    }

    /**
     * Get references to a section using GraphQL linkedFrom (NOT rate limited!)
     * @param {string} entryId - The entry ID to find references to
     * @returns {Promise<Array>} - Array of entries that reference this section
     */
    async getSectionReferences(entryId) {
        logger.debug(`🔗 Finding references to section ${entryId} using GraphQL linkedFrom (no rate limits!)...`);

        try {
            // Build a query that finds all entries linking to this section
            // We need to check all possible content types that could reference sections
            const referenceQuery = `
                query GetSectionReferences($entryId: String!) {
                    # Check igView entries (primaryContent field)
                    igViewCollection(limit: 1000, where: {
                        primaryContent_contains_some: [$entryId]
                    }) {
                        items {
                            sys {
                                id
                                contentType {
                                    sys {
                                        id
                                    }
                                }
                            }
                            entryTitle
                            primaryContent {
                                sys {
                                    id
                                }
                            }
                        }
                    }

                    # Check igMiniGames entries (sections field)
                    igMiniGamesCollection(limit: 1000, where: {
                        sections_contains_some: [$entryId]
                    }) {
                        items {
                            sys {
                                id
                                contentType {
                                    sys {
                                        id
                                    }
                                }
                            }
                            entryTitle
                            sections {
                                sys {
                                    id
                                }
                            }
                        }
                    }
                }
            `;

            const variables = { entryId };
            const data = await this.makeGraphQLRequest(referenceQuery, variables);

            // Combine results from all collections
            const references = [];

            // Process igView references
            if (data.igViewCollection?.items) {
                for (const item of data.igViewCollection.items) {
                    // Verify this entry actually references our section
                    if (item.primaryContent?.some(ref => ref.sys.id === entryId)) {
                        references.push({
                            sys: {
                                id: item.sys.id,
                                contentType: item.sys.contentType
                            },
                            fields: {
                                entryTitle: item.entryTitle
                            }
                        });
                    }
                }
            }

            // Process igMiniGames references
            if (data.igMiniGamesCollection?.items) {
                for (const item of data.igMiniGamesCollection.items) {
                    // Verify this entry actually references our section
                    if (item.sections?.some(ref => ref.sys.id === entryId)) {
                        references.push({
                            sys: {
                                id: item.sys.id,
                                contentType: item.sys.contentType
                            },
                            fields: {
                                entryTitle: item.entryTitle
                            }
                        });
                    }
                }
            }

            logger.info(`🎉 Found ${references.length} references to section ${entryId} via GraphQL linkedFrom:`,
                references.map(ref => ({
                    id: ref.sys.id,
                    type: ref.sys.contentType?.sys?.id,
                    title: ref.fields?.entryTitle
                }))
            );

            return references;

        } catch (error) {
            logger.error(`Failed to get references for section ${entryId} via GraphQL:`, error);
            throw error;
        }
    }

    /**
     * Get sections with FULL FIELDS for conversions 🔧
     * Use this when you need complete field data for conversion operations
     * @param {Array} entryIds - Array of specific entry IDs to fetch
     * @param {Array} sectionTypes - Optional array of section types to limit the search
     * @returns {Promise<Object>} - Object with complete sections array
     */
    async getSectionsForConversion(entryIds, sectionTypes = null) {
        const typesToFetch = sectionTypes || Object.values(IG_SECTION_TYPES);

        logger.debug(`🔧 Fetching sections with FULL FIELDS for conversion: ${entryIds.join(', ')}`);

        try {
            // Build a query that filters by specific entry IDs
            const searchWhere = `
                sys: {
                    id_in: [${entryIds.map(id => `"${id}"`).join(', ')}]
                }
            `;

            const typeQueries = typesToFetch.map(contentType => {
                const graphQLTypeName = this.getGraphQLTypeName(contentType);
                const collectionKey = contentType.replace(/[^a-zA-Z0-9]/g, '_');

                return `
                    ${collectionKey}: ${graphQLTypeName}Collection(
                        limit: 50
                        where: {
                            ${searchWhere}
                        }
                    ) {
                        items {
                            sys {
                                id
                                publishedAt
                            }
                            # All fields needed for conversions
                            entryTitle
                            title
                            slug
                            venture { sys { id } }
                            games { sys { id } }
                            environmentVisibility
                            platformVisibility
                            sessionVisibility
                            classification
                            layoutType
                            expandedSectionLayoutType
                            sectionTruncation
                            viewAllAction { sys { id } }
                            viewAllActionText
                            viewAllType
                            game { sys { id } }
                            media { sys { id } }
                            description
                            subtitle
                            backgroundMedia { sys { id } }
                            ctaText
                            ctaUrl
                            priority
                            isActive
                            displayOrder
                        }
                    }
                `;
            });

            const query = `
                query GetSectionsForConversion {
                    ${typeQueries.join('\n')}
                }
            `;

            const data = await this.makeGraphQLRequest(query);
            const sections = this.transformGraphQLResponse(data, typesToFetch);

            logger.info(`🎉 Conversion fetch complete! Found ${sections.length} sections with full fields`);

            return {
                sections,
                totalCount: sections.length,
                errors: []
            };
        } catch (error) {
            logger.error('GraphQL getSectionsForConversion error:', error);
            throw error;
        }
    }

    /**
     * Test method to verify linkedFrom query structure (for debugging)
     * @param {string} entryId - ID of an entry to test linkedFrom on
     * @returns {Promise<Object>} - Test result
     */
    async testLinkedFromQuery(entryId = 'zlI78IfgLiaxAlf8ca1aY') {
        const testQuery = `
            query TestLinkedFrom {
                igGridASection(id: "${entryId}") {
                    sys {
                        id
                    }
                    entryTitle
                    linkedFrom {
                        entryCollection(limit: 0) {
                            total
                        }
                    }
                }
            }
        `;

        try {
            const data = await this.makeGraphQLRequest(testQuery);
            logger.info('🧪 LinkedFrom test result:', data);
            return data;
        } catch (error) {
            logger.error('🚨 LinkedFrom test failed:', error);
            throw error;
        }
    }

    /**
     * Determine the current status of an entry based on its sys properties from GraphQL
     * NOTE: Limited to available GraphQL fields (only publishedVersion available)
     * @param {Object} sys - The sys object from GraphQL
     * @returns {string} - One of: 'draft', 'published'
     */
    determineEntryStatus(sys) {
        // With GraphQL we can only determine basic status
        // Check if it has been published (has publishedVersion)
        if (sys.publishedVersion) {
            return 'published';
        }

        // It's a draft (never been published)
        return 'draft';
    }
}

// Create singleton instance
const graphqlSectionService = new GraphQLSectionService();

export default graphqlSectionService;

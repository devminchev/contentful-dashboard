// Field mapping configuration for IG section conversions
// Based on the analysis of all IG section models

// All IG section content type IDs
export const IG_SECTION_TYPES = {
    GRID_A: 'igGridASection',
    GRID_B: 'igGridBSection',
    GRID_C: 'igGridCSection',
    GRID_D: 'igGridDSection',
    GRID_E: 'igGridESection',
    GRID_F: 'igGridFSection',
    GRID_G: 'igGridGSection',
    CAROUSEL_A: 'igCarouselA',
    CAROUSEL_B: 'igCarouselB'
};

// Human-readable names for display
export const SECTION_TYPE_NAMES = {
    [IG_SECTION_TYPES.GRID_A]: 'IG Grid A Section',
    [IG_SECTION_TYPES.GRID_B]: 'IG Grid B Section',
    [IG_SECTION_TYPES.GRID_C]: 'IG Grid C Section',
    [IG_SECTION_TYPES.GRID_D]: 'IG Grid D Section',
    [IG_SECTION_TYPES.GRID_E]: 'IG Grid E Section',
    [IG_SECTION_TYPES.GRID_F]: 'IG Grid F Section',
    [IG_SECTION_TYPES.GRID_G]: 'IG Grid G Section',
    [IG_SECTION_TYPES.CAROUSEL_A]: 'IG Carousel A',
    [IG_SECTION_TYPES.CAROUSEL_B]: 'IG Carousel B'
};

// Layout type mappings for each section type
export const LAYOUT_TYPE_MAPPING = {
    [IG_SECTION_TYPES.GRID_A]: 'grid-a',
    [IG_SECTION_TYPES.GRID_B]: 'grid-b',
    [IG_SECTION_TYPES.GRID_C]: 'grid-c',
    [IG_SECTION_TYPES.GRID_D]: 'grid-d',
    [IG_SECTION_TYPES.GRID_E]: 'grid-e',
    [IG_SECTION_TYPES.GRID_F]: 'grid-f',
    [IG_SECTION_TYPES.GRID_G]: 'grid-g',
    [IG_SECTION_TYPES.CAROUSEL_A]: 'carousel-a',
    [IG_SECTION_TYPES.CAROUSEL_B]: 'carousel-b'
};

// Common fields that exist in all IG section models and are REQUIRED
export const COMMON_REQUIRED_FIELDS = [
    'entryTitle',
    'title',
    'slug',
    'environmentVisibility',
    'platformVisibility',
    'sessionVisibility',
    'venture',
    'classification',
    'viewAllType'
];

// Common fields that exist in all IG section models but are OPTIONAL
export const COMMON_OPTIONAL_FIELDS = [
    'viewAllAction',           // Optional Link to igView
    'viewAllActionText',       // Optional, has default
    'expandedSectionLayoutType' // Optional, has default
];

// All common fields (required + optional) - for backwards compatibility
export const COMMON_FIELDS = [
    ...COMMON_REQUIRED_FIELDS,
    ...COMMON_OPTIONAL_FIELDS
];

// Fields that are specific to certain models
export const SPECIAL_FIELDS = {
    // Only Grid A has section truncation (based on actual Contentful schema)
    sectionTruncation: [IG_SECTION_TYPES.GRID_A],

    // Grid C has single game instead of games array
    game: [IG_SECTION_TYPES.GRID_C],

    // Grid C has media fields
    videoLoggedIn: [IG_SECTION_TYPES.GRID_C],
    videoLoggedOut: [IG_SECTION_TYPES.GRID_C],
    image: [IG_SECTION_TYPES.GRID_C],

    // All others have games array
    games: [
        IG_SECTION_TYPES.GRID_A,
        IG_SECTION_TYPES.GRID_B,
        IG_SECTION_TYPES.GRID_D,
        IG_SECTION_TYPES.GRID_E,
        IG_SECTION_TYPES.GRID_F,
        IG_SECTION_TYPES.GRID_G,
        IG_SECTION_TYPES.CAROUSEL_A,
        IG_SECTION_TYPES.CAROUSEL_B
    ]
};

// ViewAllType validation differences
export const VIEW_ALL_TYPE_OPTIONS = {
    // Grid A supports "none" option
    [IG_SECTION_TYPES.GRID_A]: ['view', 'auto', 'none'],

    // All others only support view and auto
    default: ['view', 'auto']
};

// Conversion compatibility matrix
export const CONVERSION_COMPATIBILITY = {
    // Easy conversions (100% compatible)
    easy: [
        // Grid B, D, F, G are fully compatible with each other
        [IG_SECTION_TYPES.GRID_B, IG_SECTION_TYPES.GRID_D, IG_SECTION_TYPES.GRID_F, IG_SECTION_TYPES.GRID_G],

        // Carousel A and B are fully compatible
        [IG_SECTION_TYPES.CAROUSEL_A, IG_SECTION_TYPES.CAROUSEL_B],

        // Grid B/D/F/G are compatible with Carousels
        [IG_SECTION_TYPES.GRID_B, IG_SECTION_TYPES.GRID_D, IG_SECTION_TYPES.GRID_F, IG_SECTION_TYPES.GRID_G,
         IG_SECTION_TYPES.CAROUSEL_A, IG_SECTION_TYPES.CAROUSEL_B]
    ],

    // Moderate conversions (require field handling)
    moderate: [
        // Grid A and E (both have sectionTruncation)
        [IG_SECTION_TYPES.GRID_A, IG_SECTION_TYPES.GRID_E]
    ],

    // Complex conversions (require data transformation)
    complex: [
        // Grid C conversions (game/games field differences)
        IG_SECTION_TYPES.GRID_C
    ]
};

/**
 * Helper function to extract localized value from field
 * @param {Object} field - The field object with locale keys
 * @returns {any} - The field value in the first available locale
 */
const extractLocalizedValue = (field) => {
    if (!field || typeof field !== 'object') return field;

    // Get the first available value (since we don't have SDK access here)
    const keys = Object.keys(field);
    if (keys.length > 0) {
        return field[keys[0]];
    }

    return null;
};

/**
 * Get compatible target types for a given source type
 * @param {string} sourceType - The source content type ID
 * @returns {string[]} - Array of compatible target content type IDs
 */
export const getCompatibleTargets = (sourceType) => {
    const allTypes = Object.values(IG_SECTION_TYPES);

    // Remove the source type from possible targets
    return allTypes.filter(type => type !== sourceType);
};

/**
 * Get the conversion difficulty level between two types
 * @param {string} sourceType - Source content type ID
 * @param {string} targetType - Target content type ID
 * @returns {string} - 'easy', 'moderate', or 'complex'
 */
export const getConversionDifficulty = (sourceType, targetType) => {
    // Check if it's an easy conversion
    for (const group of CONVERSION_COMPATIBILITY.easy) {
        if (group.includes(sourceType) && group.includes(targetType)) {
            return 'easy';
        }
    }

    // Check if it's a moderate conversion
    for (const group of CONVERSION_COMPATIBILITY.moderate) {
        if (group.includes(sourceType) && group.includes(targetType)) {
            return 'moderate';
        }
    }

    // Check if Grid C is involved (complex)
    if (sourceType === IG_SECTION_TYPES.GRID_C || targetType === IG_SECTION_TYPES.GRID_C) {
        return 'complex';
    }

    // Grid A/E to other types (moderate due to field differences)
    if ((sourceType === IG_SECTION_TYPES.GRID_A || sourceType === IG_SECTION_TYPES.GRID_E) &&
        ![IG_SECTION_TYPES.GRID_A, IG_SECTION_TYPES.GRID_E].includes(targetType)) {
        return 'moderate';
    }

    if ((targetType === IG_SECTION_TYPES.GRID_A || targetType === IG_SECTION_TYPES.GRID_E) &&
        ![IG_SECTION_TYPES.GRID_A, IG_SECTION_TYPES.GRID_E].includes(sourceType)) {
        return 'moderate';
    }

    return 'easy';
};

/**
 * Check if a field is supported by a target type
 * @param {string} fieldId - The field ID to check
 * @param {string} targetType - The target content type ID
 * @returns {boolean} - Whether the field is supported
 */
export const targetSupportsField = (fieldId, targetType) => {
    // Common fields are supported by all types
    if (COMMON_REQUIRED_FIELDS.includes(fieldId) || COMMON_OPTIONAL_FIELDS.includes(fieldId)) {
        return true;
    }

    // Check special fields
    for (const [field, supportedTypes] of Object.entries(SPECIAL_FIELDS)) {
        if (field === fieldId) {
            return supportedTypes.includes(targetType);
        }
    }

    return false;
};

/**
 * Get field mapping rules for a specific conversion
 * @param {string} sourceType - Source content type ID
 * @param {string} targetType - Target content type ID
 * @returns {object} - Field mapping rules
 */
export const getFieldMappingRules = (sourceType, targetType) => {
    const rules = {
        copyDirectly: [...COMMON_REQUIRED_FIELDS, ...COMMON_OPTIONAL_FIELDS],
        transform: {},
        omit: [],
        addDefaults: {}
    };

    // Add the appropriate games/game field to copyDirectly based on target type
    if (targetType === IG_SECTION_TYPES.GRID_C) {
        // Target is Grid C, so we need 'game' field if it exists in source
        if (sourceType === IG_SECTION_TYPES.GRID_C) {
            rules.copyDirectly.push('game');
        }
    } else {
        // Target is not Grid C, so we need 'games' field if it exists in source
        if (sourceType !== IG_SECTION_TYPES.GRID_C) {
            rules.copyDirectly.push('games');
        }
    }

    // Handle layoutType (always needs to be updated)
    rules.addDefaults.layoutType = LAYOUT_TYPE_MAPPING[targetType];

    // Handle games/game field conversion based on Grid C special case
    if (sourceType === IG_SECTION_TYPES.GRID_C && targetType !== IG_SECTION_TYPES.GRID_C) {
        // Grid C to others: convert single game to games array
        // Remove any games field from copyDirectly since we're transforming it
        rules.copyDirectly = rules.copyDirectly.filter(field => field !== 'games');

        // 🚨 CRITICAL FIX: Transform function now receives locale from conversion service
        rules.transform.games = (sourceData, locale = null) => {
            const gameField = sourceData.game;
            if (!gameField) return [];

            // Use provided locale or fallback to extractLocalizedValue
            const gameValue = locale ?
                (gameField[locale] !== undefined ? gameField[locale] : extractLocalizedValue(gameField)) :
                extractLocalizedValue(gameField);
            return gameValue ? [gameValue] : [];
        };
        rules.omit.push('game', 'videoLoggedIn', 'videoLoggedOut', 'image');
    } else if (sourceType !== IG_SECTION_TYPES.GRID_C && targetType === IG_SECTION_TYPES.GRID_C) {
        // Others to Grid C: convert games array to single game
        // Remove any game field from copyDirectly since we're transforming it
        rules.copyDirectly = rules.copyDirectly.filter(field => field !== 'game');

        // 🚨 CRITICAL FIX: Transform function now receives locale from conversion service
        rules.transform.game = (sourceData, locale = null) => {
            const gamesField = sourceData.games;
            if (!gamesField) return null;

            // Use provided locale or fallback to extractLocalizedValue
            const gamesValue = locale ?
                (gamesField[locale] !== undefined ? gamesField[locale] : extractLocalizedValue(gamesField)) :
                extractLocalizedValue(gamesField);
            return gamesValue && gamesValue.length > 0 ? gamesValue[0] : null;
        };
        rules.omit.push('games');
        // Media fields will be empty for Grid C
        rules.addDefaults.videoLoggedIn = null;
        rules.addDefaults.videoLoggedOut = null;
        rules.addDefaults.image = null;
    }

    // Handle sectionTruncation
    if (targetSupportsField('sectionTruncation', targetType)) {
        rules.copyDirectly.push('sectionTruncation');
    } else {
        rules.omit.push('sectionTruncation');
    }

    // Handle viewAllType validation differences
    // 🎯 CRITICAL FIX: Transform viewAllType when target doesn't support source value
    if (VIEW_ALL_TYPE_OPTIONS[targetType] || (sourceType === IG_SECTION_TYPES.GRID_A && targetType !== IG_SECTION_TYPES.GRID_A)) {
        // Get allowed values for target type
        const targetAllowedValues = VIEW_ALL_TYPE_OPTIONS[targetType] || VIEW_ALL_TYPE_OPTIONS.default;
        const sourceAllowedValues = VIEW_ALL_TYPE_OPTIONS[sourceType] || VIEW_ALL_TYPE_OPTIONS.default;

        // Check if source supports values that target doesn't
        const needsTransformation = sourceAllowedValues.some(value => !targetAllowedValues.includes(value));

        if (needsTransformation) {
            // Remove viewAllType from copyDirectly since we're transforming it
            rules.copyDirectly = rules.copyDirectly.filter(field => field !== 'viewAllType');

            // 🚨 CRITICAL FIX: Transform function now receives locale from conversion service
            rules.transform.viewAllType = (sourceData, locale = null) => {
                const viewAllTypeField = sourceData.viewAllType;
                if (!viewAllTypeField) return 'auto'; // Default fallback

                // Use provided locale or fallback to extractLocalizedValue
                const value = locale ?
                    (viewAllTypeField[locale] !== undefined ? viewAllTypeField[locale] : extractLocalizedValue(viewAllTypeField)) :
                    extractLocalizedValue(viewAllTypeField);

                // If the value is not supported by target, transform it
                if (!targetAllowedValues.includes(value)) {
                    // Specific transformation rules
                    if (value === 'none') {
                        return 'auto'; // 'none' becomes 'auto'
                    }
                    return targetAllowedValues[0]; // Use first available option as fallback
                }

                return value; // Value is supported, keep as-is
            };
        }
    }

    return rules;
};

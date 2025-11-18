import { IG_SECTION_TYPES } from './fieldMappings';

/**
 * Required fields for each content type that must be present for publishing
 * These are fields that if missing will cause 422 validation errors
 */
export const REQUIRED_FIELDS = {
    [IG_SECTION_TYPES.GRID_A]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_B]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_C]: [
        'entryTitle', 'title', 'slug', 'venture', 'game',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_D]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_E]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_F]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.GRID_G]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.CAROUSEL_A]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ],
    [IG_SECTION_TYPES.CAROUSEL_B]: [
        'entryTitle', 'title', 'slug', 'venture', 'games',
        'environmentVisibility', 'platformVisibility', 'sessionVisibility',
        'layoutType', 'classification', 'viewAllType'
    ]
};

/**
 * Optional fields that can be empty/null without causing validation errors
 */
export const OPTIONAL_FIELDS = [
    'title', 'viewAllAction', 'viewAllActionText', 'expandedSectionLayoutType',
    'sectionTruncation', 'image', 'videoLoggedIn', 'videoLoggedOut'
];

/**
 * Default values for fields that should have defaults when missing
 */
export const FIELD_DEFAULTS = {
    'viewAllActionText': 'View All',
    'classification': 'GameSection',
    'viewAllType': 'auto'
};

/**
 * Check if a field value exists and is valid
 * @param {any} value - The field value to check
 * @param {string} fieldId - The field ID for specific logic
 * @returns {boolean} - Whether the field has a valid value
 */
export const isFieldValueValid = (value, fieldId) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return false;
    }

    // Handle different field types
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
            // For other fields, just check if they exist (including empty strings)
            return value !== null && value !== undefined;
    }
};

/**
 * Get the localized value from a field, handling different data structures
 * @param {any} field - The field data
 * @param {string} locale - The locale to extract
 * @returns {any} - The localized value
 */
export const extractLocalizedValue = (field, locale) => {
    if (!field || typeof field !== 'object') {
        return field;
    }

    // If it's already localized, return the value for the locale
    if (field[locale] !== undefined) {
        return field[locale];
    }

    // If no locale found, return the first available value
    const keys = Object.keys(field);
    if (keys.length > 0) {
        return field[keys[0]];
    }

    return null;
};

/**
 * Validate that all required fields are present and valid for a content type
 * @param {Object} fields - The entry fields object
 * @param {string} contentType - The content type ID
 * @param {string} locale - The locale to validate
 * @returns {Object} - Validation result with missing and invalid fields
 */
export const validateRequiredFields = (fields, contentType, locale) => {
    const requiredFields = REQUIRED_FIELDS[contentType] || [];
    const missing = [];
    const invalid = [];
    const valid = [];

    for (const fieldId of requiredFields) {
        const field = fields[fieldId];

        if (!field) {
            missing.push(fieldId);
            continue;
        }

        const localizedValue = extractLocalizedValue(field, locale);
        const isValid = isFieldValueValid(localizedValue, fieldId);

        if (!isValid) {
            invalid.push({ fieldId, value: localizedValue });
        } else {
            valid.push(fieldId);
        }
    }

    return {
        isValid: missing.length === 0 && invalid.length === 0,
        missing,
        invalid,
        valid,
        totalRequired: requiredFields.length
    };
};

/**
 * Get a detailed field report for debugging
 * @param {Object} fields - The entry fields object
 * @param {string} locale - The locale to check
 * @returns {Object} - Detailed field analysis
 */
export const getFieldReport = (fields, locale) => {
    const report = {
        totalFields: Object.keys(fields).length,
        fieldsByStatus: {
            present: [],
            missing: [],
            empty: [],
            valid: []
        },
        localeAnalysis: {}
    };

    // Analyze each field
    for (const [fieldId, field] of Object.entries(fields)) {
        if (!field) {
            report.fieldsByStatus.missing.push(fieldId);
            continue;
        }

        const localizedValue = extractLocalizedValue(field, locale);
        const isValid = isFieldValueValid(localizedValue, fieldId);

        if (localizedValue === null || localizedValue === undefined) {
            report.fieldsByStatus.empty.push(fieldId);
        } else if (isValid) {
            report.fieldsByStatus.valid.push(fieldId);
        } else {
            report.fieldsByStatus.present.push(fieldId);
        }

        // Analyze available locales for this field
        if (typeof field === 'object' && field !== null) {
            const availableLocales = Object.keys(field);
            report.localeAnalysis[fieldId] = {
                availableLocales,
                hasTargetLocale: availableLocales.includes(locale),
                value: localizedValue
            };
        }
    }

    return report;
};

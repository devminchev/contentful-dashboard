import { normalizeValue } from "./normalizer";

export const BOOLEAN_VALID_VALUE_CANONICALS = ['Yes', 'All'];
export const COMMON_INVALID_VALUE_CANONICALS = ['n/a', '*'];

export function isValidNormalizedValue(value) {
    if (!value) return false;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return false;

        const normalized = normalizeValue(trimmed, BOOLEAN_VALID_VALUE_CANONICALS);
        // if (normalized === 'n/a' || normalized === '*') return false;
        return BOOLEAN_VALID_VALUE_CANONICALS.includes(normalized);
    };

    return true;
};

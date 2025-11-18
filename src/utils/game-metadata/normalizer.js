import { distance as levenshtein } from 'fastest-levenshtein';
import { BOOLEAN_VALID_VALUE_CANONICALS, COMMON_INVALID_VALUE_CANONICALS, isValidNormalizedValue } from './validator';

export function normalizeValue(rawValue, canonicalList) {
    let input = rawValue;
    if (!input || !Array.isArray(canonicalList) || canonicalList.length === 0) {
        return '';
    };

    input = typeof rawValue === 'number' || !isNaN(rawValue)
        ? rawValue.toString()
        : rawValue;

    if (typeof input !== 'string') {
        return '';
    };

    const lowerInput = input.trim().toLowerCase();
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const candidate of canonicalList) {
        const candidateLower = candidate.toLowerCase();

        const distance = levenshtein(lowerInput, candidateLower);
        const maxLen = Math.max(lowerInput.length, candidateLower.length);
        const similarity = 1 - distance / maxLen;

        const prefixBonus = candidateLower.startsWith(lowerInput.slice(0, 3)) ? 0.1 : 0;

        const score = similarity + prefixBonus;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        };
    };

    return bestMatch;
};

export function normalizeValues(inputs = [], canonicalList) {
    if (!Array.isArray(inputs)) return [];

    return inputs.map((val) => normalizeValue(typeof val === 'string' ? val.trim() : '', canonicalList));
};

export function normalizeCSV(rawValue, canonicalList) {
    if (!rawValue || typeof rawValue !== 'string' || !Array.isArray(canonicalList) || canonicalList.length === 0) return [];

    const uniqueCSV = [...new Set(rawValue.split(',').map(v => v.trim()))];

    return normalizeValues(uniqueCSV.filter(Boolean), canonicalList);
};

export function normalizeBool(raw) {
    if (!isValidNormalizedValue(raw)) return false;

    const normalized = normalizeValue(raw.trim(), [
        ...BOOLEAN_VALID_VALUE_CANONICALS,
        ...COMMON_INVALID_VALUE_CANONICALS
    ]);

    return BOOLEAN_VALID_VALUE_CANONICALS.includes(normalized);
};

export function normalizeFloatNumber(value) {
    if (!value) return undefined;

    const cleaned = value.toString().replace(/[%x]/gi, '').trim();
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? undefined : parsed;
};

export function normalizeWithMetadata(input, canonicalList) {
    const normalized = normalizeValue(input, canonicalList);
    return {
        original: input,
        normalized,
        matched: Boolean(normalized && normalized.toLowerCase() === input.toLowerCase()),
    };
};

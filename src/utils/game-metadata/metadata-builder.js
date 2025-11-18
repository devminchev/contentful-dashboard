import { normalizeBool, normalizeCSV, normalizeFloatNumber, normalizeValue } from './normalizer';
import {
    GAME_TYPE_VALUE_OPTIONS,
    SUB_GAME_TYPE_VALUE_OPTIONS,
    CONTRACT_GAME_TYPE_VALUE_OPTIONS,
    TAX_PRODUCT_TYPE_VALUE_OPTIONS,
    SYMBOL_TYPES_VALUE_OPTIONS,
    FEATURES_VALUE_OPTIONS,
    THEMES_VALUE_OPTIONS,
    BRANDS_VALUE_OPTIONS,
    WIN_LINE_TYPES_VALUE_OPTIONS,
    WIN_LINES_VALUE_OPTIONS,
    REELS_VALUE_OPTIONS,
    WAYS_TO_WIN_VALUE_OPTIONS,
    GAME_PROVIDER_VALUE_OPTIONS,
    GAME_STUDIO_VALUE_OPTIONS,
    GAME_AGGREGATOR_VALUE_OPTIONS
} from './canonical-config';

function checkFloatNumberValue(value) {
    if (!value) {
        return undefined;
    };

    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    };

    if (typeof value === 'string') {
        const trimmed = value.trim();
        const floatRegex = /^-?\d+(\.\d+)?$/;

        if (floatRegex.test(trimmed)) {
            return parseFloat(trimmed);
        };
    };

    return undefined;
};

function extractMaxRTP(rtpVal) {
    const direct = checkFloatNumberValue(rtpVal);

    if (direct !== undefined) return direct;
    // If that fails, check for a range like "92.89-96.47%"
    if (typeof rtpVal === 'string' && rtpVal.includes('-') && rtpVal.includes('%')) {
        const cleaned = rtpVal.replace('%', '').trim();
        const parts = cleaned.split('-');

        if (parts.length === 2) {
            const maxRTP = checkFloatNumberValue(parts[1]);
            return maxRTP;
        };
    };
    return undefined;
};

// ----- Migration non-slots games sheet booleans to new fields -----
function mapVolatility(data) {
    if (data['Volatility - Low'] && data['Volatility - Low'].toLowerCase() === 'yes') return "low";
    if (data['Volatility - Medium'] && data['Volatility - Medium'].toLowerCase() === 'yes') return "medium";
    if (data['Volatility - High'] && data['Volatility - High'].toLowerCase() === 'yes') return "high";
    return '';
};

function mapAvgRoundLengthRange(data) {
    if (data['Average Game Round Length 0 - 29 Secs'] && data['Average Game Round Length 0 - 29 Secs'].toLowerCase() === 'yes') return "0-29 Secs";
    if (data['Average Game Round Length 30 - 59 Secs'] && data['Average Game Round Length 30 - 59 Secs'].toLowerCase() === 'yes') return "30-59 Secs";
    if (data['Average Game Round Length 60+ Secs'] && data['Average Game Round Length 60+ Secs'].toLowerCase() === 'yes') return "60+ Secs";
    return '';
};

function mapMaxMultiplierRange(data) {
    if (data['Max Multiplier 1x - 99x'] && data['Max Multiplier 1x - 99x'].toLowerCase() === 'yes') return "1-99x";
    if (data['Max Multiplier 100x - 4999x'] && data['Max Multiplier 100x - 4999x'].toLowerCase() === 'yes') return "100-4999x";
    if (data['Max Multiplier 5000x +'] && data['Max Multiplier 5000x +'].toLowerCase() === 'yes') return "5000x +";
    return '';
};

function mapLanguages(data) {
    const arrLanguages = [
        ...(data['Language - English'] && data['Language - English'].toLowerCase() === 'yes' ? ["English"] : []),
        ...(data['Language - Spanish'] && data['Language - Spanish'].toLowerCase() === 'yes' ? ["Spanish"] : [])
    ];

    return arrLanguages.join(',');
};

function mapFeatures(data) {
    const arrFeatures = [
        ...(data['Respin'] && data['Respin'].toLowerCase() === 'yes' ? ['Respin'] : []),
        ...(data['Buy Bonus'] && data['Buy Bonus'].toLowerCase() === 'yes' ? ['Buy Bonus'] : []),
        ...(data['Freespin'] && data['Freespin'].toLowerCase() === 'yes' ? ['Freespin'] : []),
        ...(data['Cash Collect'] && data['Cash Collect'].toLowerCase() === 'yes' ? ['Cash Collect'] : []),
        ...(data['Mystery Symbols'] && data['Mystery Symbols'].toLowerCase() === 'yes' ? ['Mystery Symbols'] : []),
        ...(data['Pick me'] && data['Pick me'].toLowerCase() === 'yes' ? ['Pick me'] : [])
    ];

    return arrFeatures.join(',');
};

export const buildNormalizedMetadata = (game) => {
    const metadata = {
        gameType: {
            type: normalizeValue(game['Game Type'], GAME_TYPE_VALUE_OPTIONS),
            reel: normalizeValue(game.Reel, REELS_VALUE_OPTIONS),
            winLines: normalizeValue(game['Win Lines'], WIN_LINES_VALUE_OPTIONS),
            winLineType: normalizeValue(game['Win Line Type'], WIN_LINE_TYPES_VALUE_OPTIONS),
            waysToWin: normalizeValue(game['Ways To Win'], WAYS_TO_WIN_VALUE_OPTIONS),
            brand: normalizeValue(game.Brand, BRANDS_VALUE_OPTIONS),
            symbolCount: normalizeFloatNumber(game['Symbol Count']),
            maxMultiplier: normalizeFloatNumber(game['Max Multiplier']),
            maxExposure: normalizeFloatNumber(game['Max Exposure']),
            isJackpot: normalizeBool(game['Is Jackpot']),
            isJackpotFixedPrize: normalizeBool(game['Is Jackpots Fixed Prize']),
            isJackpotInGameProgressive: normalizeBool(game['Is Jackpot In Game Progressive']),
            isJackpotPlatformProgressive: normalizeBool(game['Is Jackpot Platform Progressive']),
            isPersistence: normalizeBool(game['Is Persistence']),
            isMultiLanguage: normalizeBool(game['Multi Language']),
            symbolType: normalizeCSV(game['Symbol Type'], SYMBOL_TYPES_VALUE_OPTIONS),
            features: normalizeCSV(game['Features'] ? game['Features'] : mapFeatures(game), FEATURES_VALUE_OPTIONS),
            themes: normalizeCSV(game['Themes'], THEMES_VALUE_OPTIONS),

            liveDealer: normalizeBool(game['Live dealer']),
            sidebets: normalizeBool(game['Sidebets']),
            bonusRounds: normalizeBool(game['Bonus Rounds']),
            traditional: normalizeBool(game['Traditional']),
            brandedSkin: normalizeBool(game['Branded Skin']),

            volatility: normalizeValue(mapVolatility(game), ["low", "medium", "high"]),
            averageGameRoundLength: normalizeValue(mapAvgRoundLengthRange(game), ["0-29 Secs", "30-59 Secs", "60+ Secs"]),
            maxMultiplierRange: normalizeValue(mapMaxMultiplierRange(game), ["1-99x", "100-4999x", "5000x +"]),
            languages: normalizeCSV(mapLanguages(game), ["English", "Spanish"]),
        },
        gameAggregator: normalizeValue(game['Aggregator'], GAME_AGGREGATOR_VALUE_OPTIONS),
        gameProvider: normalizeValue(game['Provider'], GAME_PROVIDER_VALUE_OPTIONS),
        gameStudio: normalizeValue(game['Game Studio'], GAME_STUDIO_VALUE_OPTIONS),
        subGameType: normalizeValue(game['Game SubType'], SUB_GAME_TYPE_VALUE_OPTIONS),
        contractGameType: normalizeValue(game['Contract Game Type'], CONTRACT_GAME_TYPE_VALUE_OPTIONS),
        taxProductType: normalizeValue(game['Tax Product Type'], TAX_PRODUCT_TYPE_VALUE_OPTIONS),
        rtp: extractMaxRTP(game.RTP) * 100,
        defaultBet: normalizeFloatNumber(game['Default Bet']),
    };
    return metadata;
};

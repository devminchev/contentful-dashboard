import { FEATURES_MAP, SYMBOL_TYPES_MAP, THEMES_MAP } from "../constants/masterTemplateMetadataMaps";

const slotsReelValue = (str) => str.includes('~') ? str.replace('~', '-') : str;

const setMultiSelects = (value, map) => {
    if (!value || typeof value !== 'string') return [];

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => map[item] || item);
};

const normalizeGameTypeOfSlotsValue = (value) => {
    if (!value) return '';
    const val = value.trim().toLowerCase();

    if (val === 'slots' || val === 'slot') {
        return 'Slots';
    };

    return value.trim();
};

const normalizeWinLineTypeMegawaysValue = (value) => {
    if (!value) return '';
    const val = value.trim().toLowerCase();

    if (val === 'MEGAWAYS' || val === 'megaways') {
        return 'Megaways';
    };

    return value.trim();
};

const normalizeMultiplier = (val) => {
    if (typeof val === 'number') {
        return val;
    }

    if (typeof val === 'string') {
        return Number(val.replace('x', '').trim());
    }
    return undefined;
};

export const buildMetadata = (game) => {
    let metadata = {
        gameType: {
            type: normalizeGameTypeOfSlotsValue(game['Game Type']),
            reel: game.Reel && game.Reel !== 'N/A' ? slotsReelValue(game.Reel.toString()) : '',
            winLines: game['Win Lines'] && (game['Win Lines'] !== 'No' || game['Win Lines'] !== 'N/A') ? game['Win Lines'].toString() : '',
            winLineType: game['Win Line Type'] ? normalizeWinLineTypeMegawaysValue(game['Win Line Type']) : '',
            waysToWin: game['Ways To Win'] && (game['Ways To Win'] !== 'No' || game['Ways To Win'] !== 'N/A') ? game['Ways To Win'].toString() : '',
            symbolCount: game['Symbol Count'] && (game['Symbol Count'] !== 'No' || game['Symbol Count'] !== 'N/A') ? game['Symbol Count'] : '',
            maxMultiplier: game['Max Multiplier'] ? normalizeMultiplier(game['Max Multiplier']) : '',
            isJackpot: game['Is Jackpot'] && game['Is Jackpot'] === 'Yes' ? true : false,
            isJackpotFixedPrize: game['Is Jackpots Fixed Prize'] && game['Is Jackpots Fixed Prize'] === 'Yes' ? true : false,
            isJackpotInGameProgressive: game['Is Jackpot In Game Progressive'] && game['Is Jackpot In Game Progressive'] === 'Yes' ? true : false,
            isJackpotPlatformProgressive: game['Is Jackpot Platform Progressive'] && game['Is Jackpot Platform Progressive'] === 'Yes' ? true : false,
            isPersistence: game['Is Persistence'] && game['Is Persistence'] === 'Yes' ? true : false,
            isMultiLanguage: game['Multi Language'] && game['Multi Language'] === 'Yes' ? true : false,
            brand: (game.Brand && game.Brand !== 'N/A') ? game.Brand : '',
            symbolType: setMultiSelects(game['Symbol Type'], SYMBOL_TYPES_MAP),
            features: setMultiSelects(game['Features'], FEATURES_MAP),
            themes: setMultiSelects(game['Themes'], THEMES_MAP)
        },
        subGameType: normalizeGameTypeOfSlotsValue(game['Game SubType']),
        contractGameType: normalizeGameTypeOfSlotsValue(game['Contract Game Type']),
        taxProductType: normalizeGameTypeOfSlotsValue(game['Tax Product Type']),
        // federalGameType: normalizeGameTypeOfSlotsValue(game['Game SubType']),
        // gameProvider: game.Provider || '',
        // gameStudio: game['Game Studio'] || '',
        rtp: game.RTP,
        defaultBet: game['Default Bet'],
    };

    if (game['Game Type'] === 'Live Casino') {
        metadata.gameType.casinoType = normalizeGameTypeOfSlotsValue(game['Game SubType']);
    };

    if (game['Game Type'] === 'Instant') {
        metadata.gameType.type = 'Instant Win';
    };

    return metadata;
};

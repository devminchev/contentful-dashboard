import { FEATURES_MAP, FEATURES_MAP2, SYMBOL_TYPE_MAP, SYMBOL_TYPE_MAP2, THEMES_MAP, THEMES_MAP2 } from "../../constants/metadata";

const slotsReelValue = (str) => str.includes('~') ? str.replace('~', '-') : str;

const setMultiSelects = (game, map) =>
    Object.keys(map)
        .filter((key) => game[key] === 'Yes')
        .map((key) => map[key]);

export const buildMetadata = (game) => {
    let metadata = {
        gameType: { type: game.__EMPTY_4 },
        gameProvider: game.__EMPTY_2,
        gameStudio: game.__EMPTY_3 || '',
    };

    if (game.__EMPTY_4 === 'Slots') {
        metadata.gameType = {
            ...metadata.gameType,
            reel: slotsReelValue(game.__EMPTY_5.toString()),
            winLines: game.__EMPTY_6 && game.__EMPTY_6 !== 'N/A' ? game.__EMPTY_6.toString() : '',
            winLineType: game.__EMPTY_7 && game.__EMPTY_7 !== 'N/A' ? game.__EMPTY_7.toString() : '',
            waysToWin: game.__EMPTY_8 && game.__EMPTY_8 !== 'N/A' ? game.__EMPTY_8.toString() : '',
            symbolCount: game.__EMPTY_9 || '',
            maxMultiplier: game.__EMPTY_14 || '',
            isJackpot: game.__EMPTY_10 && game.__EMPTY_10 === 'Yes' ? true : false,
            isJackpotFixedPrize: game.__EMPTY_11 && game.__EMPTY_11 === 'Yes' ? true : false,
            isJackpotInGameProgressive: game.__EMPTY_12 && game.__EMPTY_12 === 'Yes' ? true : false,
            isJackpotPlatformProgressive: game.__EMPTY_13 && game.__EMPTY_13 === 'Yes' ? true : false,
            isPersistence: game.__EMPTY_15 && game.__EMPTY_15 === 'Yes' ? true : false,
            // eslint-disable-next-line
            brand: game.__EMPTY_16 && game.__EMPTY_16 !== 'N/A' || '',
            symbolType: setMultiSelects(game, SYMBOL_TYPE_MAP),
            features: setMultiSelects(game, FEATURES_MAP),
            themes: setMultiSelects(game, THEMES_MAP),
        };
    };

    if (game.__EMPTY_4 === 'Casino') {
        metadata.gameType.casinoType = game.__EMPTY_00;
    };

    if (['Instant Win', 'Slingo'].includes(game.__EMPTY_4)) {
        metadata.gameType = {
            ...metadata.gameType,
            features: setMultiSelects(game, FEATURES_MAP),
            themes: setMultiSelects(game, THEMES_MAP),
        };
    };

    return metadata;
};

export const buildMetadata2 = (game) => {
    let metadata = {
        gameType: { type: game.Type || '' },
        gameProvider: game.Provider || '',
        gameStudio: game['Game Studio'] || '',
    };

    if (game.Type === 'Slots' || game.Type === 'Slot') {
        metadata.gameType = {
            ...metadata.gameType,
            type: 'Slots',
            reel: game.Reel && game.Reel !== 'N/A' ? slotsReelValue(game.Reel.toString()) : '',
            winLines: game['Win Lines'] && (game['Win Lines'] !== 'No' || game['Win Lines'] !== 'N/A') ? game['Win Lines'].toString() : '',
            winLineType: game['Win Line Type'] && (game['Win Line Type'] !== 'No' || game['Win Line Type'] !== 'N/A') ? game['Win Line Type'].toString() : '',
            waysToWin: game['Ways To Win'] && (game['Ways To Win'] !== 'No' || game['Ways To Win'] !== 'N/A') ? game['Ways To Win'].toString() : '',
            symbolCount: game['Symbol Count'] && (game['Symbol Count'] !== 'No' || game['Symbol Count'] !== 'N/A') ? game['Symbol Count'] : '1',
            maxMultiplier: game['Max Exposure'] && (game['Max Exposure'] !== 'No' || game['Max Exposure'] !== 'N/A') ? game['Max Exposure'] : '1',
            isJackpot: game.Jackpot && game.Jackpot === 'Yes' ? true : false,
            isJackpotFixedPrize: game['Jackpots Fixed Prize'] && game['Jackpots Fixed Prize'] === 'Yes' ? true : false,
            isJackpotInGameProgressive: game['Jackpot In Game Progressive'] && game['Jackpot In Game Progressive'] === 'Yes' ? true : false,
            isJackpotPlatformProgressive: game['Jackpot Platform Progressive'] && game['Jackpot Platform Progressive'] === 'Yes' ? true : false,
            isPersistence: game.Persistence && game.Persistence === 'Yes' ? true : false,
            brand: game.Brand && (game.Brand !== 'No' || game.Brand !== 'N/A') ? game.Brand : '',
            symbolType: setMultiSelects(game, SYMBOL_TYPE_MAP2),
            features: setMultiSelects(game, FEATURES_MAP2),
            themes: setMultiSelects(game, THEMES_MAP2),
        };
    };

    if (game.Type === 'Casino' || game.Type === 'Live Casino') {
        metadata.gameType.type = 'Casino';
        metadata.gameType.casinoType = game['Casino Type'] || '';
    };

    if (game.Type === 'Instant') {
        metadata.gameType.type = 'Instant Win';
    };

    if (['Instant Win', 'Slingo', 'Instant'].includes(game.Type)) {
        metadata.gameType = {
            ...metadata.gameType,
            features: setMultiSelects(game, FEATURES_MAP2),
            themes: setMultiSelects(game, THEMES_MAP2),
        };
    };

    return metadata;
};

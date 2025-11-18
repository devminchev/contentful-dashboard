function sortGamesByTitle(gamesArray) {
    const v1Sitegames = gamesArray.filter(game => game.__typename === 'SiteGame');
    const v2Sitegames = gamesArray.filter(game => game.__typename === 'SiteGameV2');

    const v1 = v1Sitegames.sort((a, b) => {
        const titleA = a.game.gameInfo.title.toLowerCase();
        const titleB = b.game.gameInfo.title.toLowerCase();

        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });

    const v2 = v2Sitegames.sort((a, b) => {
        const titleA = a.game.title.toLowerCase();
        const titleB = b.game.title.toLowerCase();

        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });

    if (v1.length >= v2.length) {
        return [...v1, ...v2];
    };

    return [...v2, ...v1];
};

export default sortGamesByTitle;

/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import pause from "../utils/pause";
import sortGamesByTitle from "../utils/sortAtoZ";

function useSortingAllGamesSections(refresh = async () => { }) {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const [sortedSections, setSortedSections] = useState({});

    const updateSortedGamesInSection = useCallback(async ({ section, gamesOfSection }) => {
        const sortedGames = sortGamesByTitle(gamesOfSection);
        const sortedSiteGamesList = { [spaceLocale]: sortedGames.map(sitegame => ({ sys: { id: sitegame.sys.id, type: 'Link', linkType: 'Entry' } })) };

        try {
            const rawData = {
                ...section,
                fields: {
                    ...section.fields,
                    games: {
                        [spaceLocale]: sortedSiteGamesList[spaceLocale]
                    }
                }
            };
            const updatedEntry = await contentfulClient.update({ entryId: section.sys.id }, rawData);
            setSortedSections(prevSections => ({ ...prevSections, [section.sys.id]: updatedEntry }));
            await pause(250);
            notifier.success(`${section.sys.id} Updated Succesfully !`);
        } catch (err) {
            notifier.error(`Error Updating Sorted Section: ${err}`);
            console.log(`Error Updating Sorted Section: ${err}`);
        };
    }, [sortedSections]);

    const publishSortedGamesInSection = useCallback(async ({ section }) => {
        if (!sortedSections[section.sys.id]) {
            notifier.error(`Error : Section must be sorted & updated before publishing !`);
            return;
        };
        try {
            await contentfulClient.publish({ entryId: section.sys.id }, sortedSections[section.sys.id]);
            notifier.success(`${section.sys.id} Published Succesfully !`);
            await refresh();
        } catch (err) {
            notifier.error(`Error Publishing Sorted Section : ${err}`);
            console.log(`Error Publishing Sorted Section : ${err}`);
        };
    }, [sortedSections]);

    return {
        sortedSections,
        updateSortedGamesInSection,
        publishSortedGamesInSection,
    };
};

export default useSortingAllGamesSections;

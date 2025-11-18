/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { SPACE_LOCALE } from "../services/ContentfulConfig";
import * as ContentfulService from '../services/ManagementApi';
import { IGT_GAMES } from "./igtGamesList";

function removeBrackets(str) {
    return str.replace(/\[.*?\]/g, '').trim();
};

function useIGTGamesLinks() {
    const { notifier } = useSDK();
    const [isProgress, setIsProgress] = useState(false);
    const [iGTGameLinks, setiGTGameLinks] = useState({});
    const [selectedIGTGames, setselectedIGTGames] = useState([]);
    const [toggledIGTGames, settoggledIGTGames] = useState({});

    const toggleIGT = useCallback(async (siteGameId) => {
        if (!iGTGameLinks[siteGameId] && !toggledIGTGames[siteGameId]) {
            await fetchIGTGameLinks(siteGameId);
        };

        settoggledIGTGames(prevState => ({
            ...prevState,
            [siteGameId]: !prevState[siteGameId]
        }));
    }, [toggledIGTGames]);

    const fetchIGTGameLinks = useCallback(async (siteGameId) => {
        try {
            setIsProgress(true);
            const response = await ContentfulService.loadAllEntries({
                'links_to_entry': siteGameId
            });

            if (response.length < 1) {
                notifier.warning(`No linked entries found. Please check the Sitegame Id !`);
            };

            setiGTGameLinks(prev => ({ ...prev, [siteGameId]: response }));
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setIsProgress(false);
        };
    });

    const removeFromLink = useCallback(async (siteGameId, linkId) => {
        try {
            setIsProgress(true);
            const link = iGTGameLinks[siteGameId].find(item => item.sys.id === linkId);
            link.fields.games[SPACE_LOCALE] = link.fields.games[SPACE_LOCALE].filter(ref => ref.sys.id !== siteGameId);

            const entry = await link.update();
            await entry.publish();

            const updatedList = iGTGameLinks[siteGameId].filter(item => item.sys.id !== linkId);
            setiGTGameLinks(prev => ({ ...prev, [siteGameId]: updatedList }));

            notifier.success('SiteGame Unlinked Successfully !');
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setIsProgress(false);
        };
    });

    const removeIGTFromAllLinks = useCallback(async (siteGameId) => {
        try {
            setIsProgress(true);
            for (const siteGameEntry of iGTGameLinks[siteGameId]) {
                if (siteGameEntry.fields.games) {
                    siteGameEntry.fields.games[SPACE_LOCALE] = siteGameEntry.fields.games[SPACE_LOCALE].filter(ref => ref.sys.id !== siteGameId);
                    const updatedEntry = await siteGameEntry.update();
                    await updatedEntry.publish();
                }
            }

            notifier.success('Sitegame has been removed from all links successfully !');
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setIsProgress(false);
        };
    });

    useEffect(() => {
        async function fetchData() {
            setIsProgress(true);
            const selectedGames = [];
            const uniqueGames = {};

            for (const title of IGT_GAMES) {
                const igtGames = await ContentfulService.fetchEntries({
                    'fields.name': removeBrackets(title),
                    content_type: 'siteGame'
                });

                console.log('loading:');

                igtGames.items.forEach(item => {
                    if (item.fields.entryTitle['en-GB'] === title && !uniqueGames[item.sys.id]) {
                        uniqueGames[item.sys.id] = true;
                        selectedGames.push(item);
                    }
                });
            };

            setselectedIGTGames(selectedGames);
            setIsProgress(false);
        }

        if (selectedIGTGames.length < 1) {
            fetchData();
        };
    }, []);

    return {
        isProgress,
        iGTGameLinks,
        selectedIGTGames,
        toggledIGTGames,
        removeFromLink,
        removeIGTFromAllLinks,
        toggleIGT
    };
}

export default useIGTGamesLinks;

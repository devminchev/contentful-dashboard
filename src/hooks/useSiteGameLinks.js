/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { SPACE_LOCALE } from "../services/ContentfulConfig";
import * as ContentfulService from '../services/ManagementApi';

function useSiteGameLinks() {
    const { notifier, dialogs } = useSDK();
    const [isLoading, setILoading] = useState(false);
    const [siteGameLinks, setSiteGameLinks] = useState({});
    const [selectedSiteGames, setSelectedSiteGames] = useState([]);
    const [toggledSiteGames, setToggledSiteGames] = useState({});

    const toggle = useCallback(async (siteGameId) => {
        if (!siteGameLinks[siteGameId] && !toggledSiteGames[siteGameId]) {
            await fetchSiteGameLinks(siteGameId);
        }

        setToggledSiteGames(prevState => ({
            ...prevState,
            [siteGameId]: !prevState[siteGameId]
        }));
    }, [toggledSiteGames]);

    const fetchSiteGameLinks = useCallback(async (siteGameId) => {
        try {
            setILoading(true);
            const response = await ContentfulService.getPublishedContent({
                'links_to_entry': siteGameId
            });

            if (response.length < 1) {
                notifier.warning(`No linked entries found. Please check the Sitegame Id !`);
            };

            setSiteGameLinks(prev => ({ ...prev, [siteGameId]: response }));
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setILoading(false);
        };
    });

    const selectSiteGames = useCallback(async () => {
        const newEntries = await dialogs.selectMultipleEntries({ contentTypes: 'siteGame' });
        setSelectedSiteGames(entries => [...entries, ...newEntries]);

        notifier.success(`${newEntries.length} SiteGames Selected`);
    }, []);

    const unSelect = useCallback((id) => {
        const newEntries = selectedSiteGames.filter(item => item.sys.id !== id)
        setSelectedSiteGames(newEntries);

        const { [id]: _, ...toggledState } = toggledSiteGames;
        setToggledSiteGames(toggledState);

        const { [id]: __, ...linkState } = siteGameLinks;
        setSiteGameLinks(linkState);

    }, [selectedSiteGames, toggledSiteGames]);

    const removeFromLink = useCallback(async (siteGameId, linkId) => {
        try {
            setILoading(true);
            const link = siteGameLinks[siteGameId].find(item => item.sys.id === linkId);
            link.fields.games[SPACE_LOCALE] = link.fields.games[SPACE_LOCALE].filter(ref => ref.sys.id !== siteGameId);

            const entry = await link.update();
            await entry.publish();

            const updatedList = siteGameLinks[siteGameId].filter(item => item.sys.id !== linkId);
            setSiteGameLinks(prev => ({ ...prev, [siteGameId]: updatedList }));

            notifier.success('SiteGame Unlinked Successfully !');
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setILoading(false);
        };
    });

    const removeSiteGameFromAllLinks = useCallback(async (siteGameId) => {
        try {
            setILoading(true);
            for (const siteGameEntry of siteGameLinks[siteGameId]) {
                if (siteGameEntry.fields.games) {
                    siteGameEntry.fields.games[SPACE_LOCALE] = siteGameEntry.fields.games[SPACE_LOCALE].filter(ref => ref.sys.id !== siteGameId);
                    const updatedEntry = await siteGameEntry.update();
                    await updatedEntry.publish();
                }
            };
            unSelect(siteGameId);
            notifier.success('Sitegame has been removed from all links successfully !');
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setILoading(false);
        };
    });

    return {
        isLoading,
        siteGameLinks,
        selectedSiteGames,
        toggledSiteGames,
        selectSiteGames,
        removeFromLink,
        removeSiteGameFromAllLinks,
        unSelect,
        toggle
    };
}

export default useSiteGameLinks;

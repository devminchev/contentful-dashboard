/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateSitegames, getAllDocuments } from "../../services/OpenSearchService";
import pause from "../../utils/pause";
import { selectVentures } from "../../store/selectors";
import { useSelector } from "react-redux";

const INDEX_NAME = 'available-games';
const CONTENT_TYPE = 'section';

function useAvailableSitegames(categoriesContent, categoryContent) {
    const { notifier, cma: { entry: contentfulClient } } = useSDK();
    const ventures = useSelector(selectVentures);
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osAvailableGames, setOsAvailableGames] = useState([]);
    const [setAllSections] = useState([]);

    const fetchOpensearchGames = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

            if (status === 200) {
                setOsAvailableGames(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        }
    };

    const getAllActiveContentfulSections = async () => {
        setQueryProgress(0.1);

        const params = { content_type: CONTENT_TYPE, 'fields.games[exists]': true, 'sys.publishedVersion[exists]': true };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, include: 1, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 1,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(2));
            }
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
            await pause(250);
        };

        setAllSections(allEntries);

        return allEntries;
    };

    const getReferences = useCallback(async (section) => {
        if (!section.fields.show) {
            return [];
        };
        const { items: layoutLinks } = await contentfulClient.getMany({ query: { links_to_entry: section.sys.id, 'sys.publishedVersion[exists]': true } });

        if (layoutLinks.length < 1) {
            return [];
        };
        const targetVenture = ventures.find(v => v.id === layoutLinks[0].fields.venture['en-GB'].sys.id);

        if (!targetVenture) {
            return [];
        };
        const categoriesOfVenture = categoriesContent.find(c => c.fields.venture['en-GB'].sys.id === targetVenture.id);

        if (!categoriesOfVenture || categoriesOfVenture.length < 1) {
            return [];
        };
        let linkedLayouts = [];
        let visibility = [];
        let categories = [];
        const loggedIn = section.fields.show['en-GB'].includes('loggedIn');
        const loggedOut = section.fields.show['en-GB'].includes('loggedOut');

        for (let i = 0; i < layoutLinks.length; i++) {
            const ventureCategories = categoryContent.filter(c => categoriesOfVenture.fields.categories['en-GB'].find(cat => cat.sys.id === c.sys.id));
            const category = ventureCategories.find(c => c.fields.id['en-GB'] === layoutLinks[i].fields?.name?.['en-GB']);

            if (!category) {
                continue;
            };

            linkedLayouts.push({
                id: layoutLinks[i].sys.id,
                entryTitle: layoutLinks[i].fields.entryTitle['en-GB'],
                environment: layoutLinks[i].fields.environment?.['en-GB'] || []
            });

            const setting = { platform: layoutLinks[i].fields.platform['en-GB'], loggedIn, loggedOut };
            const exists = visibility.some((item) => item.platform === setting.platform && item.loggedIn === loggedIn && item.loggedOut === loggedOut);
            if (!exists) {
                visibility.push(setting);
            };

            if (category && !categories.find(cat => cat.id === category?.sys.id)) {
                categories.push({
                    id: category?.sys.id,
                    name: category?.fields.id['en-GB'],
                });
            };
        };
        if (categories.length < 1) {
            return [];
        };

        const sectionRefs = await contentfulClient.references({ entryId: section.sys.id, include: 1 });
        const siteGamesRefs = sectionRefs.includes?.Entry?.filter((ref) => ref.sys.contentType.sys.id === 'siteGameV2' && !ref.sys.archivedAt);

        if (!siteGamesRefs || siteGamesRefs.length < 1) {
            return [];
        };
        const opensearchDocs = siteGamesRefs?.map((siteGame) => {
            const doc = {
                siteGameId: siteGame.sys.id,
                section: {
                    id: section.sys.id,
                    entryTitle: section.fields.entryTitle['en-GB']
                },
                layout: linkedLayouts,
                category: categories,
                visibility,
                ventureName: targetVenture.name,
                isUsedInVenture: true
            };
            return doc;
        });

        return opensearchDocs;
    }, [selectedEnv, categoriesContent, categoryContent]);

    const syncAvailableGames = useCallback(async () => {
        try {
            const allSections = await getAllActiveContentfulSections();

            setQueryProgress(0.1);
            const totalEntries = allSections.length;
            const batchSize = 100;
            let chunk = [];
            for (let index = 150; index < totalEntries; index++) {
                const section = allSections[index];
                const docs = await getReferences(section);

                console.log('remainingDocs section:', docs.length);
                let remainingDocs = [...docs];
                while (remainingDocs.length > 0) {
                    const availableSpaceInChunk = Math.abs(batchSize - chunk.length);

                    if (remainingDocs.length > availableSpaceInChunk) {
                        chunk.push(...remainingDocs.slice(0, availableSpaceInChunk));
                        remainingDocs = remainingDocs.slice(availableSpaceInChunk);
                    } else {
                        chunk.push(...remainingDocs);
                        remainingDocs = [];
                    };

                    if (chunk.length === batchSize) {
                        console.log('bulk:', chunk.length);
                        await bulkUpdateSitegames(axiosClient, INDEX_NAME, chunk);
                        chunk = [];
                    };
                };
                setQueryProgress(Math.min(100, ((index + 1) / totalEntries) * 100).toFixed(2));

                await pause(500);
                // console.log('Processed section:', index);
            };
            console.log('+++++++++++++++++++++++++++++++++++++++++++++++');

            if (chunk.length > 0) {
                console.log('bulk:', chunk.length);
                await bulkUpdateSitegames(axiosClient, INDEX_NAME, chunk);
            };

            notifier.success(`Published ${INDEX_NAME} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        };
    }, [selectedEnv]);

    const syncOpensearch = useCallback(async () => {
        if (categoriesContent.length < 1 || categoryContent.length < 1) {
            notifier.warning('CATEGORIES INDEX SYNC IS REQUIRED FIRST !');
            return;
        };

        await syncAvailableGames();
    }, [selectedEnv, categoriesContent, categoryContent]);

    return { osAvailableGames, fetchOpensearchGames, syncOpensearch };
}

export default useAvailableSitegames;

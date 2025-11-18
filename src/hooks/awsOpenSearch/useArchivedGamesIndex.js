/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, bulkUpdateDocumentsWithRouting, getAllDocuments } from "../../services/OpenSearchService";

const INDEX_NAME = 'games-archived';
const CONTENT_TYPE = 'gameV2';
const CONTENT_TYPE2 = 'siteGameV2';

function useArchivedGamesIndex() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osArchivedGamesContent, setOsArchivedGamesContent] = useState([]);
    const validateSiteGamesFields = ['entryTitle', 'venture', 'environment', 'game'];
    const validateGamesFields = ['entryTitle', 'platform', 'gamePlatformConfig', 'vendor', 'title'];
    const isValidEntry = (entry, locale, fields) =>
        fields.every(field => entry.fields[field]?.[locale] || entry.fields[field]);

    const getOpensearchArchivedGames = async () => {
            setQueryProgress(0.1);
            try {
                const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

                if (status === 200) {
                    setOsArchivedGamesContent(data);
                    notifier.success(`Fetch ${INDEX_NAME} data successful!`);
                }
            } catch (err) {
                notifier.error(err.message);
            } finally {
                setQueryProgress(0);
            }
        };

    const getArchivedGameV2 = async () => {
        const params = { content_type: CONTENT_TYPE };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getPublished({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getPublished({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 0,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        }

        return allEntries;
    };

    const syncArchivedGame = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getArchivedGameV2();
            const totalEntries = entries.length;
            const chunkSize = 100;
            let totalFetched = 0;

            const chunkArray = (array, size) => {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            };

            const entryChunks = chunkArray(entries, chunkSize);

            for (let chunk of entryChunks) {
                const updates = chunk
                .filter(entry => isValidEntry(entry, spaceLocale, validateGamesFields))
                .map(entry => {
                    const payload = {
                        entryId: entry.sys.id,
                        payload: {
                            doc: {
                                game_to_sitegame: {
                                    name: "game"
                                },
                                game: {
                                    ...entry.fields,
                                    contentType: entry.sys.contentType.sys.id,
                                    id: entry.sys.id,
                                    cmsEnv: entry.sys.environment.sys.id,
                                    platform: entry.fields.platform[spaceLocale],
                                    updatedAt: entry.sys.updatedAt,
                                    version: entry.sys.version,
                                    firstPublishedAt: entry.sys.firstPublishedAt,
                                    publishedCounter: entry.sys.publishedCounter,
                                    archivedAt: entry.sys.archivedAt,
                                    archivedVersion: entry.sys.archivedVersion,
                                }
                            },
                            doc_as_upsert: true
                        }
                    };

                    return payload;
                });
                const syncResponse = await bulkUpdateDocuments(axiosClient, INDEX_NAME, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const getAllArchiveContentfulGameV2 = async () => {
        // const params = { content_type: CONTENT_TYPE, 'sys.archivedAt[exists]': true, 'sys.firstPublishedAt[exists]': true };
        const params = { content_type: CONTENT_TYPE, 'sys.publishedVersion[exists]': false };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 0,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        }

        return allEntries;
    };

    const syncAllArchivedContentfulGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllArchiveContentfulGameV2();
            const totalEntries = entries.length;
            const chunkSize = 100;
            let totalFetched = 0;

            const chunkArray = (array, size) => {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            };

            const entryChunks = chunkArray(entries, chunkSize);

            for (let chunk of entryChunks) {
                const updates = chunk
                    .filter(entry => isValidEntry(entry, spaceLocale, validateGamesFields))
                    .map(entry => ({
                        entryId: entry.sys.id,
                        payload: {
                            doc: {
                                game_to_sitegame: {
                                    name: "game"
                                },
                                game: {
                                    ...entry.fields,
                                    contentType: entry.sys.contentType.sys.id,
                                    id: entry.sys.id,
                                    cmsEnv: entry.sys.environment.sys.id,
                                    platform: entry.fields.platform[spaceLocale],
                                    updatedAt: entry.sys.updatedAt,
                                    version: entry.sys.version,
                                    firstPublishedAt: entry.sys.firstPublishedAt,
                                    publishedCounter: entry.sys.publishedCounter,
                                    archivedAt: entry.sys.archivedAt,
                                    archivedVersion: entry.sys.archivedVersion,
                                }
                            },
                            doc_as_upsert: true
                        }
                    }));
                // console.log('updates', updates);
                const syncResponse = await bulkUpdateDocuments(axiosClient, INDEX_NAME, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${INDEX_NAME} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncAllArchivedContentfulSiteGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllArchivedContentfulSiteGameV2();
            const totalEntries = entries.length;
            const chunkSize = 100;
            let totalFetched = 0;

            const chunkArray = (array, size) => {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            };
            const entryChunks = chunkArray(entries, chunkSize);

            for (let chunk of entryChunks) {
                const updates = chunk
                .filter(entry => isValidEntry(entry, spaceLocale, validateSiteGamesFields))
                .map(entry => {
                    const { game, ...sitegameFields } = entry.fields;
                    const gameId = entry.fields.game[spaceLocale].sys.id;
                    return {
                        entryId: entry.sys.id,
                        routeId: gameId,
                        payload: {
                            doc: {
                                game_to_sitegame: {
                                    name: "sitegame",
                                    parent: gameId
                                },

                                siteGame: {
                                    ...sitegameFields,
                                    id: entry.sys.id,
                                    contentType: entry.sys.contentType.sys.id,
                                    cmsEnv: entry.sys.environment.sys.id,
                                    gameId,
                                    createdAt: entry.sys.createdAt,
                                    updatedAt: entry.sys.updatedAt,
                                    version: entry.sys.version,
                                    venture: entry.fields.venture,
                                    entryTitle: entry.fields.entryTitle,
                                    environment: entry.fields.environment?.[spaceLocale].length > 0 ? entry.fields.environment[spaceLocale] : [],
                                    sash: entry.fields.sash,
                                    chat: entry.fields.chat,
                                    maxBet: entry.fields.maxBet,
                                    minBet: entry.fields.minBet,
                                    howToPlayContent: entry.fields.howToPlayContent,
                                    firstPublishedAt: entry.sys.firstPublishedAt,
                                    publishedCounter: entry.sys.publishedCounter,
                                    archivedAt: entry.sys.archivedAt,
                                    archivedVersion: entry.sys.archivedVersion,
                                }
                            },
                            doc_as_upsert: true
                        }
                    }
                });
                // console.log('updates', updates);
                const syncResponse = await bulkUpdateDocumentsWithRouting(axiosClient, INDEX_NAME, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                };
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${INDEX_NAME} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    // This get all the archived siteGame from the contentful
    const getAllArchivedContentfulSiteGameV2 = async () => {
        const params = { content_type: CONTENT_TYPE2, 'sys.archivedAt[exists]': true, 'sys.firstPublishedAt[exists]': true };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 0,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${CONTENT_TYPE2} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE2}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE2} failed.`);
        } finally {
            setQueryProgress(0);
        }

        return allEntries;
    };

    const syncArchivedGameV2 = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncArchivedGame();
            return;
        };
        await syncAllArchivedContentfulGameV2();
    }, [selectedEnv]);

    const syncArchivedSiteGameV2 = useCallback(async () => {
        await syncAllArchivedContentfulSiteGameV2();
    }, [selectedEnv]);

    return { osArchivedGamesContent, getOpensearchArchivedGames, syncArchivedGameV2, syncArchivedSiteGameV2 };
}

export default useArchivedGamesIndex;

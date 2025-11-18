/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, bulkUpdateDocumentsWithRouting, getAllDocuments } from "../../services/OpenSearchService";

const INDEX_NAME = 'games';
const CONTENT_TYPE = 'gameV2';
const CONTENT_TYPE2 = 'siteGameV2';

function useGamesIndex(indexName = INDEX_NAME) {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osGamesContent, setOsGamesContent] = useState([]);

    const getOpensearchGames = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, indexName, setQueryProgress);

            if (status === 200) {
                setOsGamesContent(data);
                notifier.success(`Fetch ${indexName} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        }
    };

    const getPublishedGameV2 = async () => {
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

    const getPublishedSiteGameV2 = async () => {
        const params = { content_type: CONTENT_TYPE2 };
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

    // for [STG]
    const getAllActiveContentfulGameV2 = async () => {
        const params = { content_type: CONTENT_TYPE, 'sys.archivedAt[exists]': false };
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

    // for [STG]
    const getAllActiveContentfulSiteGameV2 = async () => {
        const params = { content_type: CONTENT_TYPE2, 'sys.archivedAt[exists]': false };
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

    const syncPublishedGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedGameV2();
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
                const updates = chunk.map(entry => {

                    const gamePlatformFields = entry.fields.gamePlatformConfig?.[spaceLocale];

                    const gameType = gamePlatformFields?.gameType;

                    const typecastGameType = {
                        ...gameType,
                        ...(gameType?.winLines && {winLines: String(gameType?.winLines || "")}),
                        ...(gameType?.waysToWin && {waysToWin: String(gameType?.waysToWin || "")}),
                        ...(gameType?.symbolType && {symbolType: gameType?.symbolType || []}),
                        ...(gameType?.winLineType && {winLineType: String(gameType?.winLineType || "")}),
                        ...(gameType?.reel && {reel: String(gameType?.reel || "")})
                    }

                    const updatedPlatformFields = {
                        ...gamePlatformFields,
                        ...(gameType && {gameType: typecastGameType})
                    };

                    const updatedEntryFields = {
                        ...entry.fields,
                        gamePlatformConfig: {[spaceLocale]: updatedPlatformFields},
                    }

                    const payload = {
                        entryId: entry.sys.id,
                        payload: {
                            doc: {
                                game_to_sitegame: {
                                    name: "game"
                                },
                                game: {
                                    ...updatedEntryFields,
                                    contentType: entry.sys.contentType.sys.id,
                                    metadataTags: entry.metadata.tags,
                                    id: entry.sys.id,
                                    cmsEnv: entry.sys.environment.sys.id,
                                    platform: entry.fields?.platform?.[spaceLocale],
                                    updatedAt: entry.sys.updatedAt,
                                    publishedAt: entry.sys.publishedAt,
                                    version: entry.sys.version,
                                    publishedVersion: entry.sys.publishedVersion,
                                }
                            },
                            doc_as_upsert: true
                        }
                    };

                    return payload;
                });
                const syncResponse = await bulkUpdateDocuments(axiosClient, indexName, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
        } catch (err) {
            console.log(`Error: Published ${indexName} sync: `, err);
            notifier.error(`Error: Published ${indexName} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncPublishedSiteGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedSiteGameV2();
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
                const updates = chunk.map(entry => {
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
                                    publishedAt: entry.sys.publishedAt,
                                    publishedVersion: entry.sys.publishedVersion,
                                    venture: entry.fields.venture,
                                    entryTitle: entry.fields.entryTitle,
                                    environment: entry.fields.environment?.[spaceLocale]?.length > 0 ? entry.fields.environment[spaceLocale] : [],
                                    sash: entry.fields.sash,
                                    chat: entry.fields.chat,
                                    maxBet: entry.fields.maxBet,
                                    minBet: entry.fields.minBet,
                                    howToPlayContent: entry.fields.howToPlayContent
                                }
                            },
                            doc_as_upsert: true
                        }
                    }
                });

                const syncResponse = await bulkUpdateDocumentsWithRouting(axiosClient, indexName, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${indexName} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${indexName} sync: `, err);
            notifier.error(`Error: Published ${indexName} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncAllActiveContentfulGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulGameV2();
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
                const updates = chunk.map(entry => {
                    const gamePlatformFields = entry.fields.gamePlatformConfig?.[spaceLocale];

                    const gameType = gamePlatformFields?.gameType;

                    const typecastGameType = {
                        ...gameType,
                        ...(gameType?.winLines && {winLines: String(gameType?.winLines || "")}),
                        ...(gameType?.waysToWin && {waysToWin: String(gameType?.waysToWin || "")}),
                        ...(gameType?.symbolType && {symbolType: gameType?.symbolType || []}),
                        ...(gameType?.winLineType && {winLineType: String(gameType?.winLineType || "")}),
                        ...(gameType?.reel && {reel: String(gameType?.reel || "")})
                    }

                    const updatedPlatformFields = {
                        ...gamePlatformFields,
                        ...(gameType && {gameType: typecastGameType})
                    };

                    const updatedEntryFields = {
                        ...entry.fields,
                        gamePlatformConfig: {[spaceLocale]: updatedPlatformFields},
                    }

                    return ({
                    entryId: entry.sys.id,
                    payload: {
                        doc: {
                            game_to_sitegame: {
                                name: "game"
                            },
                            game: {
                                ...updatedEntryFields,
                                contentType: entry.sys.contentType.sys.id,
                                metadataTags: entry.metadata.tags,
                                id: entry.sys.id,
                                cmsEnv: entry.sys.environment.sys.id,
                                platform: entry.fields?.platform?.[spaceLocale],
                                updatedAt: entry.sys.updatedAt,
                                publishedAt: entry.sys.publishedAt,
                                version: entry.sys.version,
                                publishedVersion: entry.sys.publishedVersion,
                            }
                        },
                        doc_as_upsert: true
                    }
                })});

                const syncResponse = await bulkUpdateDocuments(axiosClient, indexName, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${indexName} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${indexName} sync: `, err);
            notifier.error(`Error: Published ${indexName} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncAllActiveContentfulSiteGameV2 = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulSiteGameV2();
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
                const valid = chunk.filter(
                    entry => entry.fields.game?.[spaceLocale]?.sys?.id
                );
                const updates = valid.map(entry => {
                    const { game, ...sitegameFields } = entry.fields;
                    const gameId = game[spaceLocale].sys.id;
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
                                    publishedAt: entry.sys.publishedAt,
                                    publishedVersion: entry.sys.publishedVersion,
                                    venture: entry.fields.venture,
                                    entryTitle: entry.fields.entryTitle,
                                    environment: entry.fields.environment?.[spaceLocale]?.length > 0 ? entry.fields.environment[spaceLocale] : [],
                                    sash: entry.fields.sash,
                                    chat: entry.fields.chat,
                                    maxBet: entry.fields.maxBet,
                                    minBet: entry.fields.minBet,
                                    howToPlayContent: entry.fields.howToPlayContent
                                }
                            },
                            doc_as_upsert: true
                        }
                    }
                });
                const syncResponse = await bulkUpdateDocumentsWithRouting(axiosClient, indexName, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                };
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }
            notifier.success(`Published ${indexName} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${indexName} sync: `, err);
            notifier.error(`Error: Published ${indexName} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncGameV2 = useCallback(async () => {
        if (selectedEnv === 'production' || selectedEnv === 'naProd') {
            await syncPublishedGameV2();
            return;
        };
        await syncAllActiveContentfulGameV2();
    }, [selectedEnv]);

    const syncSiteGameV2 = useCallback(async () => {
        if (selectedEnv === 'production' || selectedEnv === 'naProd') {
            await syncPublishedSiteGameV2();
            return;
        };
        await syncAllActiveContentfulSiteGameV2();
    }, [selectedEnv]);

    useEffect(() => {
        setOsGamesContent([]);
    }, [selectedEnv]);

    return { osGamesContent, getOpensearchGames, syncGameV2, syncSiteGameV2 };
}

export default useGamesIndex;

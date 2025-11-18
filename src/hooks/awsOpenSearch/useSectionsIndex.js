/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { bulkUpdateDocuments, getAllDocuments } from "../../services/OpenSearchService";
import useOpenSearchContext from "../../Context/useOpenSearchContext";

const INDEX_NAME = 'sections';
const CONTENT_TYPE = 'section';

function useSectionsIndex() {
    const { notifier, cma: { entry: contentfulClient } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osSectionsContent, setOsSectionsContent] = useState([]);

    const getOpensearchSections = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

            if (status === 200) {
                setOsSectionsContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        };
    };

    const getPublishedSections = async () => {
        let allEntries = [];
        let skip = 0;
        const params = { content_type: CONTENT_TYPE };
        const batchSize = 100;
        let totalFetched = 0;

        try {
            const jackpotGamesSectionResponse = await contentfulClient.getPublished({
                query: {
                    skip,
                    limit: 100,
                    include: 0,
                    ...{ content_type: 'jackpotGamesSection' }
                }
            });
            allEntries = [...allEntries, ...jackpotGamesSectionResponse.items];

            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published jackpotGamesSection: `, err);
            notifier.error(`Error: loading published jackpotGamesSection failed.`);
        };

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
            };
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        };

        return allEntries;
    };

    const getAllActiveContentfulSections = async () => {
        let allEntries = [];

        try {
            const jackpotGamesSectionResponse = await contentfulClient.getMany({
                query: {
                    limit: 100,
                    include: 0,
                    ...{ content_type: 'jackpotGamesSection', 'sys.archivedAt[exists]': false, 'sys.publishedVersion[exists]': true }
                }
            });
            allEntries = [...allEntries, ...jackpotGamesSectionResponse.items];

            notifier.success(`Changed State jackpotGamesSection successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading jackpotGamesSection: `, err);
            notifier.error(`Error: loading jackpotGamesSection failed.`);
        };

        const params = { content_type: CONTENT_TYPE, 'sys.archivedAt[exists]': false, 'sys.publishedVersion[exists]': true };
        const batchSize = 100;
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
        };

        return allEntries;
    };

    const syncPublishedSections = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedSections();
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
                const updates = chunk.map(entry => ({
                    entryId: entry.sys.id,
                    payload: {
                        doc: {
                            ...entry.fields,
                            contentType: entry.sys.contentType.sys.id,
                            id: entry.sys.id,
                            provider: entry.fields.provider,
                            cmsEnv: entry.sys.environment.sys.id,
                            updatedAt: entry.sys.updatedAt,
                            publishedAt: entry.sys.publishedAt,
                            version: entry.sys.version,
                            publishedVersion: entry.sys.publishedVersion,
                        },
                        doc_as_upsert: true
                    }
                }));
                const syncResponse = await bulkUpdateDocuments(axiosClient, INDEX_NAME, updates);

                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                };
                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            };

            notifier.success(`Published ${INDEX_NAME} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncAllActiveContentfulSections = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulSections();
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
                const updates = chunk.map(entry => ({
                    entryId: entry.sys.id,
                    payload: {
                        doc: {
                            ...entry.fields,
                            contentType: entry.sys.contentType.sys.id,
                            id: entry.sys.id,
                            provider: entry.fields.provider,
                            cmsEnv: entry.sys.environment.sys.id,
                            updatedAt: entry.sys.updatedAt,
                            publishedAt: entry.sys.publishedAt,
                            version: entry.sys.version,
                            publishedVersion: entry.sys.publishedVersion,
                        },
                        doc_as_upsert: true
                    }
                }));
                const syncResponse = await bulkUpdateDocuments(axiosClient, INDEX_NAME, updates);
                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                };

                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            };

            notifier.success(`Published ${INDEX_NAME} sync is successful.`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync failed.`);
        } finally {
            setQueryProgress(0);
        };
    };

    const syncSections = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedSections();
            return;
        };
        await syncAllActiveContentfulSections();
    }, [selectedEnv]);

    useEffect(() => {
        setOsSectionsContent([]);
    }, [selectedEnv]);

    return { osSectionsContent, getOpensearchSections, syncSections };
}

export default useSectionsIndex;

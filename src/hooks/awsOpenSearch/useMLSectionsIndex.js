/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, getAllDocuments } from "../../services/OpenSearchService";

const INDEX_NAME = 'ml-personalised-sections';
const GAME_SECTIONS_CONTENT_TYPES = ['igCollabBasedPersonalisedSection', 'igSimilarityBasedPersonalisedSection'];

function useMLSectionsIndex() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: _spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osMLSectionsContent, setOsMLSectionsContent] = useState([]);

    const getOpensearchMLSections = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

            if (status === 200) {
                setOsMLSectionsContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        }
    };

    const getAllContentfulEntries = async (
        contentType,
        contentfulClientMethod,
        msg,
        additionalParams = {}
    ) => {
        const params = { content_type: contentType, ...additionalParams };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClientMethod({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClientMethod({
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

            notifier.success(`${msg} ${contentType} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading ${msg} ${contentType}: `, err);
            notifier.error(`Error: loading ${msg} ${contentType} failed.`);
        } finally {
            setQueryProgress(0);
        }

        return allEntries;
    };

    const getPublishedEntries = async (contentType) =>
        await getAllContentfulEntries(
            contentType,
            contentfulClient.getPublished,
            'Published'
        );

    const getActiveEntries = async (contentType) =>
        await getAllContentfulEntries(
            contentType,
            contentfulClient.getMany,
            'Active',
            { 'sys.archivedAt[exists]': false }
        );

    const syncContentfulEntries = async (contentType, fetchEntriesMethod, successMessage) => {
        setQueryProgress(0.1);
        try {
            const entries = await fetchEntriesMethod(contentType);
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
                            id: entry.sys.id,
                            cmsEnv: entry.sys.environment.sys.id,
                            updatedAt: entry.sys.updatedAt,
                            createdAt: entry.sys.createdAt,
                            publishedAt: entry.sys.updatedAt,
                            contentType: entry.sys.contentType.sys.id,
                            ...entry.fields
                        },
                        doc_as_upsert: true,
                    },
                }));

                const syncResponse = await bulkUpdateDocuments(axiosClient, INDEX_NAME, updates);
                if (syncResponse.errors) {
                    throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
                }

                totalFetched += updates.length;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            }

            notifier.success(successMessage);
        } catch (err) {
            console.log(`Error syncing ${contentType}:`, err);
            notifier.error(`Sync failed for ${contentType}`);
        } finally {
            setQueryProgress(0);
        }
    };

    const syncAllMLSectionTypes = useCallback(async () => {
        const isProd = selectedEnv === 'production';

        for (const contentType of GAME_SECTIONS_CONTENT_TYPES) {
            const fetchFn = isProd ? getPublishedEntries : getActiveEntries;
            const envLabel = isProd ? 'Published' : 'Active';

            await syncContentfulEntries(
                contentType,
                fetchFn,
                `${envLabel} ${INDEX_NAME} sync for ${contentType} is successful.`
            );
        }
    }, [selectedEnv]);

    useEffect(() => {
        setOsMLSectionsContent([]);
    }, [selectedEnv]);

    return {
        osMLSectionsContent,
        getOpensearchMLSections,
        syncMLSections: syncAllMLSectionTypes
    };
}

export default useMLSectionsIndex;

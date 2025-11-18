/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, getAllDocuments } from "../../services/OpenSearchService";

const INDEX_NAME = 'personalisation-defaults';
// const INDEX_WRITE_ALIAS = 'personalisation-defaults-w'; // This is for later when we agree on aliases
const CONTENT_TYPE = 'lobbySuggestedGames';

function usePersDefaultIndex() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osPersDefaultContent, setOsPersDefaultContent] = useState([]);

    const getOpensearchPersDefault = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

            if (status === 200) {
                setOsPersDefaultContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        };
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
            // Fetch total entries
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

    // -------------------------------- PROD --------------------------------
    const getPublishedPersDefault = async () =>
        await getAllContentfulEntries(
            CONTENT_TYPE,
            contentfulClient.getPublished,
            'Published'
        );

    // -------------------------------- STAGING -----------------------------------
    const getAllActiveContentfulPersDefault = async () =>
        await getAllContentfulEntries(
            CONTENT_TYPE,
            contentfulClient.getMany,
            'Active',
            { 'sys.archivedAt[exists]': false } // Additional params for active entries
        );

// --------------------------- SYNC ------------------------------
const syncContentfulEntries = async (fetchEntriesMethod, successMessage) => {
    setQueryProgress(0.1);
    try {
        const entries = await fetchEntriesMethod();
        const totalEntries = entries.length;
        const chunkSize = 100;
        let totalFetched = 0;

        // Chunk array utility
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
                        contentType: entry.sys.contentType.sys.id,
                        entryTitle: entry.fields.entryTitle,
                        venture: entry.fields.venture,
                        games: entry.fields.games,
                        environment:
                            entry.fields.environment?.[spaceLocale]?.length > 0
                                ? entry.fields.environment[spaceLocale]
                                : [],
                        cmsEnv: entry.sys.environment.sys.id,
                        updatedAt: entry.sys.updatedAt,
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
        console.log(`Error: ${successMessage}:`, err);
        notifier.error(`Error: ${successMessage} failed.`);
    } finally {
        setQueryProgress(0);
    }
};

// -------------------------------- PROD SYNC --------------------------------
const syncPublishedPersDefault = async () =>
    await syncContentfulEntries(
        getPublishedPersDefault,
        `Published ${INDEX_NAME} sync is successful.`
    );

// -------------------------------- STAGING SYNC --------------------------------
const syncAllActiveContentfulPersDefault = async () =>
    await syncContentfulEntries(
        getAllActiveContentfulPersDefault,
        `Active ${INDEX_NAME} sync is successful.`
    );


    const syncPersDefault = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedPersDefault();
            return;
        };
        await syncAllActiveContentfulPersDefault();
    }, [selectedEnv]);

    useEffect(() => {
        setOsPersDefaultContent([]);
    }, [selectedEnv]);

    return { osPersDefaultContent, getOpensearchPersDefault, syncPersDefault };
}

export default usePersDefaultIndex;

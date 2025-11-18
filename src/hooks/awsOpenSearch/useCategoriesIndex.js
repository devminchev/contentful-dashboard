/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, getAllDocuments, updateDocument } from "../../services/OpenSearchService";

const INDEX_NAME = 'categories';
const CONTENT_TYPE = 'categories';

function useCategoriesIndex() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osCategoriesContent, setOsCategoriesContent] = useState([]);
    const [contentfulCategoriesEntries, setContentfulCategoriesEntries] = useState([]);
    const [contentfulCategoryEntries, setContentfulCategoryEntries] = useState([]);

    const getOpensearchCategories = async () => {
        setQueryProgress(0.1);

        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);
            if (status === 200) {
                setOsCategoriesContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            };
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        };
    };

    const getPublishedCategories = async () => {
        const params = { content_type: CONTENT_TYPE };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getPublished({
                query: { limit: 1, ...params }
            });
            const totalEntries = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getPublished({
                    query: {
                        skip,
                        limit: batchSize,
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
        setContentfulCategoriesEntries(allEntries);
        return allEntries;
    };

    const getPublishedCategory = async () => {
        const params = { content_type: 'category' };
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
            };
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        };
        setContentfulCategoryEntries(allEntries);
        return allEntries;
    };

    const getAllActiveContentfulCategories = async () => {
        const params = { content_type: CONTENT_TYPE, 'sys.publishedVersion[exists]': true };
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
            };
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        };
        setContentfulCategoriesEntries(allEntries);
        return allEntries;
    };

    const getAllActiveContentfulCategory = async () => {
        const params = { content_type: 'category', 'sys.publishedVersion[exists]': true };
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
            };
            notifier.success(`Published ${CONTENT_TYPE} successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed.`);
        } finally {
            setQueryProgress(0);
        };
        setContentfulCategoryEntries(allEntries);
        return allEntries;
    };

    const syncPublishedCategories = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedCategories();
            let totalFetched = 0;
            const totalEntries = entries.length;

            for (let entry of entries) {
                const payload = {
                    doc: {
                        ...entry.fields,
                        contentType: entry.sys.contentType.sys.id,
                        id: entry.sys.id,
                        cmsEnv: entry.sys.environment.sys.id,
                        environment: entry.fields.environment?.[spaceLocale].length > 0 ? entry.fields.environment[spaceLocale] : [],
                        updatedAt: entry.sys.updatedAt,
                        publishedAt: entry.sys.publishedAt,
                        version: entry.sys.version,
                        publishedVersion: entry.sys.publishedVersion,
                    },
                    doc_as_upsert: true
                };
                const syncResponse = await updateDocument(axiosClient, INDEX_NAME, entry.sys.id, payload);
                if (!syncResponse) {
                    throw new Error(`Failed to sync entry with ID: ${entry.sys.id}`);
                }
                totalFetched++;
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

    const syncPublishedCategory = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedCategory();
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
                            cmsEnv: entry.sys.environment.sys.id,
                            nameId: entry.fields.id,
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
                }
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

    const syncAllActiveContentfulCategories = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulCategories();
            let totalFetched = 0;
            const totalEntries = entries.length;

            for (let entry of entries) {
                const payload = {
                    doc: {
                        ...entry.fields,
                        contentType: entry.sys.contentType.sys.id,
                        id: entry.sys.id,
                        cmsEnv: entry.sys.environment.sys.id,
                        environment: entry.fields.environment?.[spaceLocale].length > 0 ? entry.fields.environment[spaceLocale] : [],
                        updatedAt: entry.sys.updatedAt,
                        publishedAt: entry.sys.publishedAt,
                        version: entry.sys.version,
                        publishedVersion: entry.sys.publishedVersion,
                    },
                    doc_as_upsert: true
                };
                const syncResponse = await updateDocument(axiosClient, INDEX_NAME, entry.sys.id, payload);
                if (!syncResponse) {
                    throw new Error(`Failed to sync entry with ID: ${entry.sys.id}`);
                }
                totalFetched++;
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

    const syncAllActiveContentfulCategory = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulCategory();
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
                            cmsEnv: entry.sys.environment.sys.id,
                            nameId: entry.fields.id,
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

    const syncCategories = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedCategories();
            await syncPublishedCategory();
            return;
        };
        await syncAllActiveContentfulCategories();
        await syncAllActiveContentfulCategory();
    }, [selectedEnv]);

    useEffect(() => {
        setOsCategoriesContent([]);
    }, [selectedEnv]);

    return { osCategoriesContent, contentfulCategoriesEntries, contentfulCategoryEntries, getOpensearchCategories, syncCategories };
}

export default useCategoriesIndex;

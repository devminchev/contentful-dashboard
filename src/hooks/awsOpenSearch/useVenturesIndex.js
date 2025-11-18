/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { getAllDocuments, updateDocument } from "../../services/OpenSearchService";

const INDEX_NAME = 'ventures';
const CONTENT_TYPE = 'venture';

function useVenturesIndex() {
    const { notifier, cma: { entry: contentfulClient } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osVentureContent, setOsVentureContent] = useState([]);

    const getOpensearchVentures = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);
            if (status === 200) {
                setOsVentureContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data succesful!`);
            };
        } catch (err) {
            notifier.error(err);
        } finally {
            setQueryProgress(0);
        };
    };

    const getPublishedVentures = async () => {
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
            notifier.success(`Published ${CONTENT_TYPE} succesfully loaded .`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed .`);
        } finally {
            setQueryProgress(0);
        };
        return allEntries;
    };

    const getAllActiveContentfulVentures = async () => {
        const params = { content_type: CONTENT_TYPE, 'sys.publishedVersion[exists]': true };
        const batchSize = 100;
        let allEntries = [];
        let skip = 0;
        let totalFetched = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, ...params }
            });
            const totalEntries = initialResponse.total;
            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
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
            notifier.success(`Published ${CONTENT_TYPE} succesfully loaded .`);
        } catch (err) {
            console.log(`Error: loading published ${CONTENT_TYPE}: `, err);
            notifier.error(`Error: loading published ${CONTENT_TYPE} failed .`);
        } finally {
            setQueryProgress(0);
        };

        return allEntries;
    };

    const syncAllActiveContentfulVentures = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getAllActiveContentfulVentures();
            let totalFetched = 0;
            const totalEntries = entries.length;
            for (let entry of entries) {
                const payload = {
                    doc: {
                        ...entry.fields,
                        contentType: entry.sys.contentType.sys.id,
                        id: entry.sys.id,
                        cmsEnv: entry.sys.environment.sys.id,
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
                };
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

    const syncPublishedVentures = async () => {
        setQueryProgress(0.1);
        try {
            const entries = await getPublishedVentures();
            let totalFetched = 0;
            const totalEntries = entries.length;
            for (let entry of entries) {
                const payload = {
                    doc: {
                        ...entry.fields,
                        contentType: entry.sys.contentType.sys.id,
                        id: entry.sys.id,
                        environment: entry.sys.environment.sys.id,
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
                };
                totalFetched++;
                setQueryProgress(Math.min(100, (totalFetched / totalEntries) * 100).toFixed(1));
            };
            notifier.success(`Published ${INDEX_NAME} sync is succesful .`);
        } catch (err) {
            console.log(`Error: Published ${INDEX_NAME} sync: `, err);
            notifier.error(`Error: Published ${INDEX_NAME} sync !`);
        } finally {
            setQueryProgress(0);
        };
    };

    const syncVentures = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedVentures();
            return;
        };
        await syncAllActiveContentfulVentures();
    }, [selectedEnv]);

    useEffect(() => {
        setOsVentureContent([]);
    }, [selectedEnv]);

    return { osVentureContent, getOpensearchVentures, syncVentures };
};

export default useVenturesIndex;

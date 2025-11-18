/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import useOpenSearchContext from "../../Context/useOpenSearchContext";
import { bulkUpdateDocuments, getAllDocuments } from "../../services/OpenSearchService";

const INDEX_NAME = 'personalised-sections';
// const INDEX_WRITE_ALIAS = 'personalised-sections-w';
const CONTENT_TYPE_COLLAB_FILTER = 'lobbyCollabBasedPersonalisedGamesSection';
const CONTENT_TYPE_SIM_FILTER = 'lobbySimilarityBasedPersonalisedGamesSection';

function usePersonalisedSectionIndex() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const { setQueryProgress, axiosClient, selectedEnv } = useOpenSearchContext();
    const [osPersonalisedSectionContent, setOsPersonalisedSectionContent] = useState([]);

    const getOpensearchPersonalisedSection = async () => {
        setQueryProgress(0.1);
        try {
            const { data, status } = await getAllDocuments(axiosClient, INDEX_NAME, setQueryProgress);

            if (status === 200) {
                setOsPersonalisedSectionContent(data);
                notifier.success(`Fetch ${INDEX_NAME} data successful!`);
            }
        } catch (err) {
            notifier.error(err.message);
        } finally {
            setQueryProgress(0);
        };
    };
// GetPublishedPersonalisedSections
const getAllContentfulPersonalisedSections = async (
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

// ------------------------------------- PROD -------------------------------------
const getPublishedCollabSection = async () =>
    await getAllContentfulPersonalisedSections(
        CONTENT_TYPE_COLLAB_FILTER,
        contentfulClient.getPublished,
        'Published'
    );

const getPublishedSimilaritySection = async () =>
    await getAllContentfulPersonalisedSections(
        CONTENT_TYPE_SIM_FILTER,
        contentfulClient.getPublished,
        'Published'
    );

// ------------------------------------ STAGING ----------------------------------
const getAllActiveContentfulCollabSection = async () =>
    await getAllContentfulPersonalisedSections(
        CONTENT_TYPE_COLLAB_FILTER,
        contentfulClient.getMany,
        'Active',
        { 'sys.archivedAt[exists]': false }
    );

const getAllActiveContentfulSimilaritySection = async () =>
    await getAllContentfulPersonalisedSections(
        CONTENT_TYPE_SIM_FILTER,
        contentfulClient.getMany,
        'Active',
        { 'sys.archivedAt[exists]': false }
    );

// ----------------- SYNC -------------------------------------------------------
const syncSection = async (fetchEntries, mapPayload) => {
    setQueryProgress(0.1);
    try {
        const entries = await fetchEntries();
        const totalEntries = entries.length;
        const chunkSize = 100;
        let totalFetched = 0;

        // Helper to chunk array into smaller parts
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
                payload: mapPayload(entry),
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

// Payload mappers
const collabSectionPayloadMapper = entry => ({
    doc: {
        id: entry.sys.id,
        contentType: entry.sys.contentType.sys.id,
        cmsEnv: entry.sys.environment.sys.id,
        environment: entry.fields.environment?.[spaceLocale]?.length > 0
            ? entry.fields.environment[spaceLocale]
            : [],
        entryTitle: entry.fields.entryTitle,
        venture: entry.fields.venture,
        platform: entry.fields.platform,
        type: entry.fields.type,
        games: entry.fields.games,
        name: entry.fields.name,
        title: entry.fields.title,
        tileSize: entry.fields.tileSize,
        show: entry.fields.show,
        updatedAt: entry.sys.updatedAt,
        publishedAt: entry.sys.publishedAt,
        version: entry.sys.version,
        publishedVersion: entry.sys.publishedVersion,
    },
    doc_as_upsert: true,
});

const similaritySectionPayloadMapper = entry => ({
    doc: {
        id: entry.sys.id,
        contentType: entry.sys.contentType.sys.id,
        cmsEnv: entry.sys.environment.sys.id,
        environment: entry.fields.environment?.[spaceLocale]?.length > 0
            ? entry.fields.environment[spaceLocale]
            : [],
        entryTitle: entry.fields.entryTitle,
        venture: entry.fields.venture,
        platform: entry.fields.platform,
        type: entry.fields.type,
        name: entry.fields.name,
        title: entry.fields.title,
        tileSize: entry.fields.tileSize,
        show: entry.fields.show,
        updatedAt: entry.sys.updatedAt,
        publishedAt: entry.sys.publishedAt,
        version: entry.sys.version,
        publishedVersion: entry.sys.publishedVersion,
    },
    doc_as_upsert: true,
});

const syncPublishedCollabSection = () => syncSection(getPublishedCollabSection, collabSectionPayloadMapper);
const syncPublishedSimilaritySection = () => syncSection(getPublishedSimilaritySection, similaritySectionPayloadMapper);
const syncAllActiveContentfulCollabSection = () => syncSection(getAllActiveContentfulCollabSection, collabSectionPayloadMapper);
const syncAllActiveContentfulSimilaritySection = () => syncSection(getAllActiveContentfulSimilaritySection, similaritySectionPayloadMapper);


// --------------------------- SYNC ALL -------------------------------------

    const syncCollabSections = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedCollabSection();
            return;
        };
        await syncAllActiveContentfulCollabSection();
    }, [selectedEnv]);

    const syncSimilaritySections = useCallback(async () => {
        if (selectedEnv === 'production') {
            await syncPublishedSimilaritySection();
            return;
        };
        await syncAllActiveContentfulSimilaritySection();
    }, [selectedEnv]);

    useEffect(() => {
        setOsPersonalisedSectionContent([]);
    }, [selectedEnv]);

    return { osPersonalisedSectionContent, getOpensearchPersonalisedSection, syncCollabSections, syncSimilaritySections };
}

export default usePersonalisedSectionIndex;

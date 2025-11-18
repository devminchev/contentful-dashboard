/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { fetchAllContent } from '../services/sdkCMA';
import useExcel from './useExcel';
import pause from '../utils/pause';
import { buildMetadata, buildMetadata2 } from '../utils/game-metadata/metadata-old';

const useExcelMetadata = () => {
    const { cma: { entry: client, bulkAction }, locales: { default: spaceLocale }, notifier, ids } = useSDK();

    const { isUploading, excelData, readExcel } = useExcel();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updatedGameEntries, setUpdatedGameEntries] = useState([]);

    const bulkPublishAction = async (updatedEntries) => {
        if (updatedEntries.length === 0) {
            console.log('There is no updated game entry to be published ...');
            return;
        }

        const CHUNK_SIZE = 200;
        const bulkList = updatedEntries.map(e => ({
            sys: { linkType: 'Entry', type: 'Link', id: e.sys.id, version: e.sys.version }
        }));
        setUpdateProgress(0.1);

        let index = 0;

        while (index < bulkList.length) {
            const currentChunk = bulkList.slice(index, index + CHUNK_SIZE);

            try {
                const bulkResponse = await bulkAction.publish(
                    {
                        spaceId: ids.space,
                        environmentId: ids.environmentAlias || ids.environment,
                    },
                    {
                        entities: {
                            sys: { type: 'Array' },
                            items: currentChunk,
                        }
                    }
                );
                // Wait for bulk status to become 'succeeded'
                let status = bulkResponse?.sys?.status;
                while (status === 'created' || status === 'inProgress') {
                    console.log(`Bulk status: ${status}. Waiting for completion...`);

                    // Retrieve the updated bulk status (simulate fetching status update)
                    const updatedResponse = await bulkAction.get({
                        spaceId: ids.space,
                        environmentId: ids.environmentAlias || ids.environment,
                        bulkActionId: bulkResponse.sys.id,
                    });

                    status = updatedResponse?.sys?.status;

                    if (status === 'failed') {
                        console.error('Bulk publish failed:', updatedResponse);
                        notifier.error(`Bulk publish failed: ${updatedResponse?.details?.message || 'Unknown error'}`);
                        break;
                    };
                };

                if (status === 'failed') {
                    break;
                };

                if (status !== 'succeeded') {
                    console.error('Unexpected status:', status);
                    notifier.error(`Unexpected status: ${status}`);
                    break;
                };

                index += CHUNK_SIZE; // Move to the next chunk only if the current one succeeds
                const progress = ((index / bulkList.length) * 100).toFixed(2);
                setUpdateProgress(progress);

                console.log(`Bulk Chunk published: ${index} / ${bulkList.length}`);
            } catch (error) {
                console.error('Error during bulk publish: ', error);
                notifier.error('Bulk publish error:', error.details?.message || error.message);
                break;
            };
        };

        if (index >= bulkList.length) {
            notifier.success('Bulk publish completed.');
            console.log('Bulk publish completed.');
        };

        setUpdateProgress(0);
    };

    const processMetadata = useCallback(async () => {
        if (excelData.length === 0) {
            notifier.error('Excel file is not ready or empty.');
            return;
        };

        if (updatedGameEntries.length > 0) {
            bulkPublishAction(updatedGameEntries);
            return;
        };

        if (excelData[0].GAMESKIN) {
            console.log('processMetadata Format 2 !', excelData.length);
            processMetadata2();
            return;
        };

        const gameV2Data = await fetchAllContent(
            { client, params: { content_type: 'gameV2', 'sys.publishedVersion[exists]': true } },
            setLoadingProgress
        );
        notifier.success('GameV2 content loaded.');

        const updatedEntries = [];
        for (let index = 1; index < excelData.length; index++) {
            const game = excelData[index];
            const progress = ((index + 1) / excelData.length) * 100;
            setUpdateProgress(progress.toFixed(2));

            if (!game.__EMPTY) continue;

            const gameV2Entries = gameV2Data.filter(g => g.fields.gamePlatformConfig?.[spaceLocale]?.gameSkin === game.__EMPTY);
            if (!gameV2Entries.length) continue;

            const metadataToUpdate = buildMetadata(game);
            for (const entry of gameV2Entries) {
                try {
                    const updated = await client.update(
                        { entryId: entry.sys.id },
                        {
                            ...entry,
                            fields: {
                                ...entry.fields,
                                gamePlatformConfig: {
                                    [spaceLocale]: {
                                        ...entry.fields.gamePlatformConfig[spaceLocale],
                                        ...metadataToUpdate,
                                    }
                                }
                            }
                        }
                    );

                    updatedEntries.push(updated);
                    await pause(100);
                } catch (error) {
                    console.error(`Error updating entry: ${entry.sys.id}`, error);
                    break;
                };
            };
        };
        notifier.success('Metadata update completed.', updatedEntries.length);
        setUpdateProgress(0);

        setUpdatedGameEntries(updatedEntries);
        bulkPublishAction(updatedEntries);
    }, [updatedGameEntries, excelData]);

    const processMetadata2 = async () => {
        const gameV2Data = await fetchAllContent({ client, params: { content_type: 'gameV2', 'sys.publishedVersion[exists]': true } }, setLoadingProgress);
        notifier.success('GameV2 content loaded.');

        const updatedEntries = [];
        for (let index = 0; index < excelData.length; index++) {
            const game = excelData[index];
            const percentage = ((index + 1) / excelData.length) * 100;
            setUpdateProgress(percentage.toFixed(2));

            // if (game.GAMESKIN !== 'play-buffalo-gold-collection') {
            //     console.log(`whatever: `, 'play-buffalo-gold-collection');
            //     continue;
            // }

            // if (!game.Provider || !game.Type) {
            //     console.log(`Skipping game due to missing gameType or gameProvider: ${game.__EMPTY}`);
            //     continue;
            // };

            const gameV2Entries = gameV2Data.filter(g => g.fields.gamePlatformConfig?.[spaceLocale]?.gameSkin === game.GAMESKIN);
            if (!gameV2Entries.length) continue;

            const metadataToUpdate = buildMetadata2(game);
            for (let entry of gameV2Entries) {
                try {
                    const rawData = {
                        ...entry,
                        fields: {
                            ...entry.fields,
                            gamePlatformConfig: {
                                [spaceLocale]: {
                                    ...entry.fields.gamePlatformConfig[spaceLocale],
                                    ...metadataToUpdate,
                                }
                            }
                        }
                    };
                    const updated = await client.update({ entryId: entry.sys.id }, rawData);
                    updatedEntries.push(updated);

                    await pause(100);
                } catch (error) {
                    console.error(`Error updating entry: ${entry.sys.id}`, error);
                    break;
                };
            };
        };
        notifier.success('Metadata update completed.', updatedEntries.length);
        setUpdateProgress(0);

        setUpdatedGameEntries(updatedEntries);
        bulkPublishAction(updatedEntries);
    };

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            readExcel(file);

            setUpdatedGameEntries([]);
        };

        if (excelData.length > 0 && !isUploading) {
            notifier.success('Excel file uploaded and ready .');
        };
    }, [isUploading, excelData]);

    return { isUploading, loadingProgress, updateProgress, handleFileChange, processMetadata };
};

export default useExcelMetadata;

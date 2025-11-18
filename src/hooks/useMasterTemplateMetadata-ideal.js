/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { fetchAllContent } from '../services/sdkCMA';
import useExcelNa from './useExcelNa';
import pause from '../utils/pause';
import { buildMetadata } from '../utils/metadataMasterTemplate';

const CHUNK_SIZE = 200;

const extractFailedEntryIds = (bulkResponse) => {
    if (bulkResponse?.error?.details?.errors?.length) {
        return bulkResponse.error.details.errors
            .map(err => err?.entity?.sys?.id)
            .filter(Boolean);
    }
    if (bulkResponse?.details?.errors?.length) {
        return bulkResponse.details.errors
            .map(err => err?.id || err?.entity?.sys?.id)
            .filter(Boolean);
    }
    return [];
};

const useMasterTemplateMetadata = () => {
    const { cma: { entry: client, bulkAction }, locales: { default: spaceLocale }, notifier, ids } = useSDK();

    const { isUploading, excelData, readExcel } = useExcelNa();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [updateProgress, setUpdateProgress] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [updatedGameEntries, setUpdatedGameEntries] = useState([]);

    const bulkPublishAction = async (updatedEntries) => {
        if (!updatedEntries.length) {
            notifier.info('No updated entries to publish.');
            console.info('[BulkPublish] No updated entries to publish.');
            return;
        };
        console.info(`[BulkPublish] Started. Total entries to publish: ${updatedEntries.length}`);
        const bulkList = updatedEntries.map(e => ({
            sys: { linkType: 'Entry', type: 'Link', id: e.sys.id, version: e.sys.version }
        }));
        setUpdateProgress(0.1);

        let index = 0;
        const failedEntryIds = [];
        let chunkNum = 1;
        const totalChunks = Math.ceil(bulkList.length / CHUNK_SIZE);

        while (index < bulkList.length) {
            let currentChunk = bulkList.slice(index, index + CHUNK_SIZE);
            let failedIds = [];
            console.info(`[BulkPublish] Processing chunk ${chunkNum} of ${totalChunks} (entries ${index + 1} to ${Math.min(index + CHUNK_SIZE, bulkList.length)})`);

            // 1st attempt
            let response;
            try {
                response = await bulkAction.publish(
                    {
                        spaceId: ids.space,
                        environmentId: ids.environmentAlias || ids.environment,
                    },
                    {
                        entities: { sys: { type: 'Array' }, items: currentChunk }
                    }
                );

                // Wait for completion
                let status = response?.sys?.status;
                let updatedResponse = response;
                while (status === 'created' || status === 'inProgress') {
                    updatedResponse = await bulkAction.get({
                        spaceId: ids.space,
                        environmentId: ids.environmentAlias || ids.environment,
                        bulkActionId: response.sys.id,
                    });
                    status = updatedResponse?.sys?.status;
                    await pause(1000);
                }

                if (status === 'succeeded') {
                    notifier.success(`Bulk publish succeeded for chunk ${chunkNum} / ${totalChunks}`);
                    console.info(`[BulkPublish] Chunk ${chunkNum}: succeeded (${currentChunk.length} entries)`);
                } else if (status === 'failed') {
                    failedIds = extractFailedEntryIds(updatedResponse);
                    if (failedIds.length > 0) {
                        failedEntryIds.push(...failedIds);
                        notifier.warning(`Bulk publish failed for IDs: ${failedIds.join(', ')}`);
                        console.warn(`[BulkPublish] Chunk ${chunkNum} failed for ${failedIds.length} entries: ${failedIds.join(', ')}`);
                        // Remove failed items for retry
                        const retryChunk = currentChunk.filter(item => !failedIds.includes(item.sys.id));
                        if (retryChunk.length > 0) {
                            // Only one retry, with good items
                            try {
                                console.info(`[BulkPublish] Retrying chunk ${chunkNum} with ${retryChunk.length} entries (excluding failed).`);
                                let retryResp = await bulkAction.publish(
                                    {
                                        spaceId: ids.space,
                                        environmentId: ids.environmentAlias || ids.environment,
                                    },
                                    {
                                        entities: { sys: { type: 'Array' }, items: retryChunk }
                                    }
                                );
                                let retryStatus = retryResp?.sys?.status;
                                let retryUpdatedResponse = retryResp;
                                while (retryStatus === 'created' || retryStatus === 'inProgress') {
                                    retryUpdatedResponse = await bulkAction.get({
                                        spaceId: ids.space,
                                        environmentId: ids.environmentAlias || ids.environment,
                                        bulkActionId: retryResp.sys.id,
                                    });
                                    retryStatus = retryUpdatedResponse?.sys?.status;
                                    await pause(1000);
                                }
                                if (retryStatus === 'succeeded') {
                                    notifier.success(`Retry chunk succeeded for remaining ${retryChunk.length} entries.`);
                                    console.info(`[BulkPublish] Retry chunk ${chunkNum}: succeeded (${retryChunk.length} entries)`);
                                } else if (retryStatus === 'failed') {
                                    const retryFailedIds = extractFailedEntryIds(retryUpdatedResponse);
                                    if (retryFailedIds.length > 0) {
                                        failedEntryIds.push(...retryFailedIds);
                                        notifier.error(`Retry failed for entries: ${retryFailedIds.join(', ')}`);
                                        console.error(`[BulkPublish] Retry chunk ${chunkNum} failed for ${retryFailedIds.length} entries: ${retryFailedIds.join(', ')}`);
                                    } else {
                                        console.error(`[BulkPublish] Retry chunk ${chunkNum} failed but could not determine failed entry IDs.`);
                                    }
                                }
                            } catch (retryError) {
                                notifier.error('Bulk publish retry error: ' + (retryError.details?.message || retryError.message));
                                console.error(`[BulkPublish] Retry error for chunk ${chunkNum}: ${retryError.details?.message || retryError.message}`);
                            }
                        } else {
                            console.warn(`[BulkPublish] All entries in chunk ${chunkNum} failed. Skipping chunk.`);
                        }
                    } else {
                        notifier.error('Bulk publish failed, but could not determine failed IDs. Skipping this chunk.');
                        console.error(`[BulkPublish] Chunk ${chunkNum} failed, but could not determine failed IDs. Skipping this chunk.`);
                    }
                }
            } catch (error) {
                notifier.error('Bulk publish error: ' + (error.details?.message || error.message));
                console.error(`[BulkPublish] Error in chunk ${chunkNum}: ${error.details?.message || error.message}`);
            }

            // Continue to next 200 entries
            index += CHUNK_SIZE;
            setUpdateProgress(((index / bulkList.length) * 100).toFixed(2));
            chunkNum += 1;
        }

        notifier.success('Bulk publish process completed.');
        console.info(`[BulkPublish] Process completed. Published: ${updatedEntries.length - failedEntryIds.length}. Failed: ${failedEntryIds.length}.`);
        if (failedEntryIds.length > 0) {
            console.warn(`[BulkPublish] Entries failed to publish (${failedEntryIds.length}): ${failedEntryIds.join(', ')}`);
        }
        setUpdateProgress(0);
    };

    const processMetadata = useCallback(async () => {
        if (!excelData.length) return notifier.error('Excel file is not ready or empty.');

        const gameV2Data = await fetchAllContent(
            { client, params: { content_type: 'gameV2' } },
            setLoadingProgress
        );
        notifier.success('GameV2 content loaded.');

        const updatedEntries = [];
        const notExistingCodes = [];

        for (let index = 0; index < excelData.length; index++) {
            const game = excelData[index];
            setUpdateProgress(((index + 1) / excelData.length * 100).toFixed(2));

            if (!game['Game Code']) continue;

            const gameV2Entry = gameV2Data.find(g => g.fields.launchCode?.[spaceLocale] === game['Game Code']);
            if (!gameV2Entry) {
                notExistingCodes.push(game['Game Code']);
                continue;
            }

            try {
                const metadataToUpdate = buildMetadata(game);
                const updated = await client.update(
                    { entryId: gameV2Entry.sys.id },
                    {
                        ...gameV2Entry,
                        fields: {
                            ...gameV2Entry.fields,
                            gamePlatformConfig: {
                                [spaceLocale]: {
                                    ...gameV2Entry.fields.gamePlatformConfig[spaceLocale],
                                    ...metadataToUpdate,
                                }
                            },
                            ...(game['Min Bet'] && {
                                minBet: {
                                    ...gameV2Entry.fields.minBet,
                                    [spaceLocale]: `$${game['Min Bet'].toString()}`
                                }
                            }),
                            ...(game['Max Bet'] && {
                                maxBet: {
                                    ...gameV2Entry.fields.maxBet,
                                    [spaceLocale]: `$${game['Max Bet'].toString()}`
                                }
                            })
                        }
                    }
                );
                updatedEntries.push(updated);
                await pause(100);
            } catch (error) {
                console.error(`Error updating entryId: ${gameV2Entry.sys.id}, gameCode: ${game['Game Code']}`, error);
                continue;
            };
        };

        notifier.success(`Metadata update completed. Updated entries: ${updatedEntries.length}`);
        setUpdateProgress(0);

        setUpdatedGameEntries(updatedEntries);
        await bulkPublishAction(updatedEntries);
    }, [excelData]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setUpdatedGameEntries([]);
            readExcel(file);
        }
        if (excelData.length > 0 && !isUploading) {
            notifier.success('Excel file uploaded and ready.');
        }
    }, [isUploading, excelData]);

    return { isUploading, loadingProgress, updateProgress, handleFileChange, processMetadata };
};

export default useMasterTemplateMetadata;

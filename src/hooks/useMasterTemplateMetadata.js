/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { fetchAllContent } from '../services/sdkCMA';
import pause from '../utils/pause';
import { buildNormalizedMetadata } from '../utils/game-metadata/metadata-builder';
import { isChanged, isPublished } from '../utils/entryStates';

const CHUNK_SIZE = 200;

const extractFailedEntryIds = (bulkResponse) => {
    if (bulkResponse?.error?.details?.errors?.length) {
        return bulkResponse.error.details.errors
            .map(err => err?.entity?.sys?.id)
            .filter(Boolean);
    };
    if (bulkResponse?.details?.errors?.length) {
        return bulkResponse.details.errors
            .map(err => err?.id || err?.entity?.sys?.id)
            .filter(Boolean);
    };
    return [];
};

function entryGameCodeLookup(entries, locale) {
    return entries.reduce((lookup, entry) => {
        const code = entry.fields.launchCode?.[locale] || entry.fields.gamePlatformConfig?.[locale]?.gameSkin;
        if (code && entry.fields.gamePlatformConfig?.[locale]?.gameSkin !== entry.fields.entryTitle?.[locale]) {
            lookup[entry.fields.entryTitle?.[locale]] = entry;
        };
        if (code && entry.fields.gamePlatformConfig?.[locale]?.gameSkin === entry.fields.entryTitle?.[locale]) {
            lookup[code] = entry;
        };
        if (code && entry.fields.gamePlatformConfig?.[locale]?.mobileGameSkin) {
            lookup[entry.fields.gamePlatformConfig?.[locale]?.mobileGameSkin] = entry;
        };

        return lookup;
    }, {});
};

const useMasterTemplateMetadata = ({ uniqueKey = 'Game Code', optionalLocale }) => {
    const { cma: { entry: client, bulkAction }, locales: { default: defaultLocale }, notifier, ids } = useSDK();
    const targetLocale = optionalLocale || defaultLocale;
    const currencySymbol = !optionalLocale ? (defaultLocale === 'en-GB' ? '£' : '$') : '€';
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [invalidEntryIds, setInvalidEntryIds] = useState([]);

    const bulkPublishAction = async (entriesToPublish) => {
        if (!entriesToPublish.length) {
            notifier.success('No entries to publish in this chunk.');
            console.info('[BulkPublish] No entries to publish in this chunk.');
            return;
        }

        const bulkList = entriesToPublish.map(e => ({
            sys: { linkType: 'Entry', type: 'Link', id: e.sys.id, version: e.sys.version }
        }));

        try {
            let response = await bulkAction.publish(
                {
                    spaceId: ids.space,
                    environmentId: ids.environmentAlias || ids.environment,
                },
                {
                    entities: { sys: { type: 'Array' }, items: bulkList }
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
                await pause(500);
            }

            if (status === 'succeeded') {
                notifier.success(`[BulkPublish] Published ${bulkList.length} entries.`);
                console.info(`[BulkPublish] Published ${bulkList.length} entries.`);
            } else {
                notifier.error('[BulkPublish] Failed to publish entries (unexpected).');
                console.error('[BulkPublish] Failed to publish entries (unexpected).');
            }
        } catch (error) {
            notifier.error('Bulk publish error: ' + (error.details?.message || error.message));
            console.error(`[BulkPublish] Error: ${error.details?.message || error.message}`);
        };
    };

    const bulkValidateAction = async (updatedEntries) => {
        if (!updatedEntries.length) {
            notifier.warning('No entries to validate.');
            console.warn('[BulkValidate] No entries to validate.');
            return;
        }

        console.info(`[BulkValidate] Started. Total entries: ${updatedEntries.length}`);
        const bulkList = updatedEntries.map(e => ({
            sys: { linkType: 'Entry', type: 'Link', id: e.sys.id }
        }));

        setUpdateProgress(0.1);
        let index = 0;
        let chunkNum = 1;
        const totalChunks = Math.ceil(bulkList.length / CHUNK_SIZE);
        const invalidGameV2EntryIdList = [];

        while (index < bulkList.length) {
            const currentChunk = bulkList.slice(index, index + CHUNK_SIZE);
            let validChunk = currentChunk;
            let invalidGameV2EntryIds = [];
            console.info(`[BulkValidate] Chunk ${chunkNum}/${totalChunks} (entries ${index + 1}–${Math.min(index + CHUNK_SIZE, bulkList.length)})`);

            try {
                let response = await bulkAction.validate(
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
                    notifier.success(`[BulkValidate] Chunk ${chunkNum} validated. Publishing ${currentChunk.length} entries.`);
                    console.info(`[BulkValidate] Chunk ${chunkNum}: all entries validated. Publishing...`);
                } else if (status === 'failed') {
                    invalidGameV2EntryIds = extractFailedEntryIds(updatedResponse);
                    invalidGameV2EntryIdList.push(...invalidGameV2EntryIds);
                    validChunk = currentChunk.filter(item => !invalidGameV2EntryIds.includes(item.sys.id));
                    notifier.warning(`[BulkValidate] Chunk ${chunkNum} failed for ${invalidGameV2EntryIds.length} entries: ${invalidGameV2EntryIds.join(', ')}`);
                    console.warn(`[BulkValidate] Chunk ${chunkNum} validation failed for: ${invalidGameV2EntryIds.join(', ')}. Publishing only valid entries (${validChunk.length})`);
                }
            } catch (error) {
                notifier.error('Validation error: ' + (error.details?.message || error.message));
                console.error(`[BulkValidate] Error in chunk ${chunkNum}: ${error.details?.message || error.message}`);
                validChunk = [];
            };

            const entriesToPublish = updatedEntries.filter(e =>
                validChunk.some(v => v.sys.id === e.sys.id)
            );

            if (entriesToPublish.length > 0) {
                await bulkPublishAction(entriesToPublish);
            } else {
                console.warn(`[BulkValidate] No valid entries to publish in chunk ${chunkNum}.`);
            };

            index += CHUNK_SIZE;
            chunkNum += 1;
            setUpdateProgress(((index / bulkList.length) * 100).toFixed(2));
        }

        notifier.success('[BulkValidate] Validation & publishing process completed.');
        if (invalidGameV2EntryIdList.length > 0) {
            setInvalidEntryIds(invalidGameV2EntryIdList);
            console.warn(`[BulkValidate] Entries failed to validate: ${invalidGameV2EntryIdList.join(', ')}`);
        };
        setUpdateProgress(0);
    };

    const processMetadata = useCallback(async (excelData) => {
        if (!excelData.length) return notifier.error('Excel file is not ready or empty.');

        const gameV2Data = await fetchAllContent(
            { client, params: { content_type: 'gameV2', 'sys.archivedAt[exists]': false } },
            setLoadingProgress
        );
        const entryLookupMap = entryGameCodeLookup(gameV2Data, defaultLocale);
        notifier.success('GameV2 content loaded.');

        const synchedPublishedStatusEntries = [];
        const notExistingCodes = [];
        for (let index = 0; index < excelData.length; index++) {
            const game = excelData[index];
            setUpdateProgress(((index + 1) / excelData.length * 100).toFixed(2));

            let lookupKey = game[uniqueKey];
            if (game[uniqueKey] === 'STL_BRANDED_ROULETTE') {
                if (game['Gamename'].toLowerCase().includes('virgin games')) {
                    lookupKey = `${game[uniqueKey]} (vg)`
                };

                if (game['Gamename'].toLowerCase().includes('jackpotjoy')) {
                    lookupKey = `${game[uniqueKey]} (jpj)`;
                };

                if (game['Gamename'].toLowerCase().includes('ballycasino')) {
                    lookupKey = `${game[uniqueKey]} (buk)`;
                };
            };

            const gameV2Entry = entryLookupMap[lookupKey];
            if (!gameV2Entry) {
                notExistingCodes.push(game[uniqueKey]);
                continue;
            };
            if (synchedPublishedStatusEntries.some(e => e.sys.id === gameV2Entry.sys.id)) {
                continue;
            };

            try {
                const metadataToUpdate = buildNormalizedMetadata(game);
                const updated = await client.update(
                    { entryId: gameV2Entry.sys.id },
                    {
                        ...gameV2Entry,
                        fields: {
                            ...gameV2Entry.fields,
                            gamePlatformConfig: {
                                [defaultLocale]: {
                                    ...gameV2Entry.fields.gamePlatformConfig[defaultLocale],
                                    ...metadataToUpdate,
                                }
                            },
                            ...(game['Min Bet'] && {
                                minBet: {
                                    ...gameV2Entry.fields.minBet,
                                    [targetLocale]: !targetLocale ? `${currencySymbol}${game['Min Bet'].toString()}` : `${game['Min Bet'].toString()}${currencySymbol}`
                                }
                            }),
                            ...(game['Max Bet'] && {
                                maxBet: {
                                    ...gameV2Entry.fields.maxBet,
                                    [targetLocale]: !targetLocale ? `${currencySymbol}${game['Max Bet'].toString()}` : `${game['Max Bet'].toString()}${currencySymbol}`
                                }
                            })
                        }
                    }
                );
                if (isPublished(gameV2Entry) || isChanged(gameV2Entry)) {
                    synchedPublishedStatusEntries.push(updated);
                };
                await pause(100);
            } catch (error) {
                console.error(`Error updating entryId: ${gameV2Entry.sys.id}, gameCode: ${lookupKey}`, error);
                continue;
            };
        };
        console.log('notExistingCodes :', notExistingCodes)
        notifier.success(`Metadata update completed.Metadata Synced Published Status entries: ${synchedPublishedStatusEntries.length}`);
        setUpdateProgress(0);

        await bulkValidateAction(synchedPublishedStatusEntries);
    }, []);

    return { loadingProgress, updateProgress, invalidEntryIds, processMetadata, setInvalidEntryIds };
};

export default useMasterTemplateMetadata;

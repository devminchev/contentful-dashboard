import { opsAdminRolesBackup } from "../utils/opsRolesBackupData";
import { CONTENTFUL_CLIENT, SPACE_CLIENT, SPACE_ENVIRONMENT_CLIENT, SPACE_LOCALE } from "./ContentfulConfig";

export const getUser = async (id) => await SPACE_CLIENT.getSpaceUser(id);

const isRelease = (name) => name.startsWith('release');
const parseDate = (dateString) => new Date(dateString);

export const getMembersIdInfos = async (teamId) => {
    const org = await CONTENTFUL_CLIENT.getOrganization('5g9nTPsFS5kqSXBosgetK0');
    const teamMemberships = await org.getTeamMemberships({ limit: 100, include: 'sys.organizationMembership,sys.teamSpaceMembership,sys.user', teamId });

    return teamMemberships.items;
};

export const getReleases = async () => {
    const releases = (await SPACE_CLIENT.getEnvironments()).items;
    const releaseItems = releases.filter(env => isRelease(env.name));
    releaseItems.sort((a, b) => parseDate(b.sys.createdAt) - parseDate(a.sys.createdAt));

    return releaseItems;
};

export async function prepareRelease(releases) {
    await releases.oldestReleaseEnv.delete();

    const newRelease = await SPACE_CLIENT.createEnvironmentWithId(`release-${releases.nextReleaseNumber}`, {
        name: `release-${releases.nextReleaseNumber}`,
    }, `release-${releases.nextReleaseNumber - 1}`);

    return newRelease;
};

export async function freezeOpsRoles() {
    const roles = await SPACE_CLIENT.getRoles();
    const rolesToBeUpdated = roles.items.filter(role => role.name === 'Game Ops Admin' || role.name === 'Product Ops Admin' || role.name === 'Release Admin');

    if (rolesToBeUpdated.length > 0) {
        await updateOpsRolesReadOnly(rolesToBeUpdated);

        return rolesToBeUpdated;
    }

    return [];
};

export async function updateMasterAliasToNewRelease(nextReleaseNumber) {
    const rolesToBeUpdated = await freezeOpsRoles();

    setTimeout(async () => {
        const alias = await SPACE_CLIENT.getEnvironmentAlias('master');
        alias.environment.sys.id = `release-${nextReleaseNumber}`;
        await alias.update();
    }, 5000);

    if (rolesToBeUpdated.length > 0) {
        setTimeout(async () => {
            await updateBackOpsRoles(rolesToBeUpdated);
        }, 10000);
    }
};

export async function updateOpsRolesReadOnly(roles) {
    for (const role of roles) {
        if (role.name === 'Release Admin') {
            role.policies = role.policies.map(policy => {
                return {
                    ...policy,
                    actions: 'read'
                };
            });

            await role.update();
        }
    };

    console.log('UPDATED policy ROLE');
};

async function updateBackOpsRoles(roles) {
    for (const role of roles) {
        if (role.name === 'Release Admin') {
            role.policies = opsAdminRolesBackup[role.name].policies;

            await role.update();
        }
    };
}

export const updateEntries = async (id, newGameEntries) => {
    const entry = await SPACE_ENVIRONMENT_CLIENT.getEntry(id);

    entry.fields.games = newGameEntries;

    const updatedEntry = await entry.update();
    return updatedEntry;
};

export const publishEntry = async (updatedEntry) => {
    await updatedEntry.publish();
};

// duplciations api

export const findDuplicateGamesAndSiteGames = async (venture, contentType) => {
    const games = await getPublishedContent({ content_type: contentType, 'fields.venture.sys.id': venture });

    const duplications = findDuplicates(games);

    return duplications;
};

const findDuplicates = (items) => {
    const gameMap = new Map();
    const duplicates = [];
    const seenGames = [];
    const matches = [];

    items.forEach((game) => {
        const gameId = game.fields.entryTitle[SPACE_LOCALE];
        if (gameMap.has(gameId)) {
            const seen = gameMap.get(gameId);
            seenGames.push(seen);
            duplicates.push(game);
            const match = `${game.sys.id} - ${seen.sys.id}`;
            matches.push(match);
        } else {
            gameMap.set(gameId, game);
        }
    });

    return {
        gameContent: seenGames,
        duplicateGameContent: duplicates,
        matchContent: matches
    };
};

//////////////////// NEW ORGANIZED CODE
export const createType = async (id, info) => {
    const contentType = await SPACE_ENVIRONMENT_CLIENT.createContentTypeWithId(id, info);

    await contentType.publish();
};

export const getEntry = async (entryId) => await SPACE_ENVIRONMENT_CLIENT.getEntry(entryId);

export const fetchEntries = async (query) => {
    const response = await SPACE_ENVIRONMENT_CLIENT.getEntries({
        ...query
    });

    return response;
};

const allEntries = async (query, setProgress, count = null) => {
    let skip = 0;
    let totalFetched = 0;
    let totalEntries;
    const allEntries = [];

    const initialResponse = await SPACE_ENVIRONMENT_CLIENT.getEntries({
        limit: 1,
        ...query
    });
    totalEntries = count ? count : initialResponse.total;
    while (totalFetched < totalEntries) {
        const response = await SPACE_ENVIRONMENT_CLIENT.getEntries({
            skip: skip,
            limit: count ? count : 100,
            include: 2,
            ...query
        });

        allEntries.push(...response.items);
        totalFetched += response.items.length;
        skip += response.items.length;

        const newProgress = ((totalFetched / totalEntries) * 100).toFixed(1);
        if (setProgress) {
            setProgress(newProgress);
        }
    }

    return allEntries;
};

const publishedEntries = async (query, setProgress, count = null) => {
    let skip = 0;
    let totalFetched = 0;
    let totalEntries;
    const allEntries = [];

    const initialResponse = await SPACE_ENVIRONMENT_CLIENT.getPublishedEntries({
        limit: 1,
        include: 0,
        ...query
    });
    totalEntries = count ? count : initialResponse.total;
    while (totalFetched < totalEntries) {
        const response = await SPACE_ENVIRONMENT_CLIENT.getPublishedEntries({
            skip: skip,
            limit: count ? count : 100,
            include: 0,
            ...query
        });

        allEntries.push(...response.items);
        totalFetched += response.items.length;
        skip += response.items.length;

        const newProgress = ((totalFetched / totalEntries) * 100).toFixed(1);
        if (setProgress) {
            setProgress(newProgress);
        }
    }

    return allEntries;
};

export const loadAllEntries = async (query = {}, setProgress, count = null) => {
    const response = await allEntries(query, setProgress, count);

    if (response.items) {
        return response.items.filter(item => Object.keys(item.fields).length > 0);
    }

    return response;
};

export const loadPublishedEntries = async (query = {}, setProgress, count = null) => {
    const response = await publishedEntries(query, setProgress, count);

    if (response.items) {
        return response.items.filter(item => Object.keys(item.fields).length > 0);
    }

    return response;
};

export const getArchivedContent = async (setProgress) => {
    return await loadAllEntries({
        'sys.archivedAt[exists]': true,
    }, setProgress);
};

export const getDraftContent = async (setProgress) => {
    return await loadAllEntries({
        'sys.publishedAt[exists]': false,
        'sys.archivedAt[exists]': false
    }, setProgress);
};

export const getPublishedContent = async (query, setProgress, count = null) => {
    return await loadPublishedEntries(query, setProgress, count);
};

export const bulkUnpublishContent = async (entries, setProgress) => {
    const bulkList = entries.map(e => ({ sys: { linkType: 'Entry', type: 'Link', id: e.sys.id } }));

    let skip = 200;
    let index = 0;
    while (index < entries.length) {
        const bulkActionInProgress = await SPACE_ENVIRONMENT_CLIENT.createUnpublishBulkAction({
            entities: {
                sys: { type: 'Array' },
                items: bulkList.slice(index, index + skip)
            },
        });
        const bulkActionCompleted = await bulkActionInProgress.waitProcessing();

        if (bulkActionCompleted) {
            index += skip;
            const newProgress = ((index / entries.length) * 100).toFixed(2);
            setProgress(newProgress);
        };
    };
};

export const deleteUnpublishedContent = async (entries, setProgress) => {
    if (entries.length === 0) {
        return;
    }

    let index = 0;
    for (let entry of entries) {
        await entry.delete();
        index++;
        const newProgress = ((index / entries.length) * 100).toFixed(2);
        setProgress(newProgress);
    };
};

export const deletePublishedContent = async (entries, setProgress) => {
    if (entries.length === 0) {
        return;
    }

    let index = 0;
    for (let entry of entries) {
        await entry.unpublish();
        await entry.delete();

        index++;
        const newProgress = ((index / entries.length) * 100).toFixed(2);
        setProgress(newProgress);
    };
};

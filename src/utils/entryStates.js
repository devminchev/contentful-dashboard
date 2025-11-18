//Determine the state of entries in contentful
export function isArchived(entry) {
    return !!entry.sys.archivedVersion;
};

export function isDraft(entry) {
    return !entry.sys.publishedVersion;
};

export function isPublished(entry) {
    if (!entry.sys.publishedVersion || !entry.sys.updatedAt || !entry.sys.publishedAt) return false;
    const updatedAt = new Date(entry.sys.updatedAt);
    const publishedAt = new Date(entry.sys.publishedAt);

    if (Number.isNaN(updatedAt.getTime()) || Number.isNaN(publishedAt.getTime())) return false;

    return entry.sys.version === entry.sys.publishedVersion + 1 && updatedAt.getTime() === publishedAt.getTime();
};

export function isChanged(entry) {
    if (!entry.sys.publishedVersion || !entry.sys.updatedAt || !entry.sys.publishedAt) return false;
    const updatedAt = new Date(entry.sys.updatedAt);
    const publishedAt = new Date(entry.sys.publishedAt);

    if (Number.isNaN(updatedAt.getTime()) || Number.isNaN(publishedAt.getTime())) return false;

    return entry.sys.version > entry.sys.publishedVersion + 1 && updatedAt.getTime() > publishedAt.getTime();
};

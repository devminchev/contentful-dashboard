export const fetchAllContent = async ({ client, params }, setProgress = null) => {
    const batchSize = 250;
    const allEntries = [];
    let skip = 0;
    let totalFetched = 0;
    const initialResponse = await client.getMany({
        query: { limit: 1, ...params }
    });
    const totalEntries = initialResponse.total;

    while (totalFetched < totalEntries) {
        const response = await client.getMany({
            query: {
                skip,
                limit: batchSize,
                include: 0,
                ...params
            }
        });

        allEntries.push(...response.items);
        totalFetched += response.items.length;
        skip += response.items.length;

        const progress = ((totalFetched / totalEntries) * 100).toFixed(2);
        if (setProgress) {
            setProgress(progress);
        }
    }

    if (setProgress) {
        setProgress(0);
    }
    return allEntries;
};

export const getAllDocuments = async (client, index, setProgress) => {
    let contents = [];
    const size = 500;
    let status = null;
    let totalDocs = 0;

    try {
        let initialResponse = await client.post(`/${index}/_search?scroll=1m`, {
            size: size,
            query: {
                match_all: {}
            }
        });

        status = initialResponse.status;
        totalDocs = initialResponse.data.hits.total.value;
        let scrollId = initialResponse.data._scroll_id;
        let hits = initialResponse.data.hits.hits;
        contents = [...contents, ...hits];
        setProgress(Math.min(100, (contents.length / totalDocs) * 100).toFixed(1));

        while (hits.length > 0) {
            const response = await client.post(`/_search/scroll`, {
                scroll: '1m',
                scroll_id: scrollId
            });

            scrollId = response.data._scroll_id;
            hits = response.data.hits.hits;
            if (hits.length > 0) {
                contents = [...contents, ...hits];

                if (setProgress) {
                    setProgress(Math.min(100, (contents.length / totalDocs) * 100).toFixed(1));
                };
            } else {
                break;
            };
        };

        await client.delete(`/_search/scroll`, {
            data: {
                scroll_id: scrollId
            }
        });

    } catch (error) {
        console.error(`Error ${index}:`, error);
        status = error.response?.status || 500;
        contents = [];
    };

    return {
        status,
        data: contents.map(doc => doc._source)
    };
};

export const updateDocument = async (client, index, entryId, payload) => {
    try {
        const response = await client.post(`/${index}/_update/${entryId}`, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error adding/updating ${index}:`, error);
    };
};

export const updateDocumentRoute = async (client, index, entryId, payload, routeId) => {
    try {
        const response = await client.post(`/${index}/_update/${entryId}${`?routing=${routeId}`}`, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Error adding/updating ${index}:`, error);
    };
};

export const bulkUpdateDocuments = async (client, index, updates) => {
    try {
        let bulkPayload = '';

        updates.forEach(({ entryId, payload }) => {
            bulkPayload += JSON.stringify({ update: { _index: index, _id: entryId } }) + '\n';
            bulkPayload += JSON.stringify(payload) + '\n';
        });

        if (!bulkPayload.endsWith('\n')) {
            bulkPayload += '\n';
        }

        const response = await client.post('/_bulk', bulkPayload, {
            headers: {
                'Content-Type': 'application/x-ndjson'
            }
        });

        if (response.data.errors) {
            console.error('Errors occurred during the bulk update:', response.data);
        };

        return response.data;
    } catch (error) {
        console.error('Error performing bulk update:', error.response ? error.response.data : error.message);
        throw error;
    };
};

export const bulkUpdateDocumentsWithRouting = async (client, index, updates) => {
    try {
        let bulkPayload = '';

        updates.forEach(({ entryId, payload, routeId }) => {
            bulkPayload += JSON.stringify({ update: { _index: index, _id: entryId, routing: routeId } }) + '\n';
            bulkPayload += JSON.stringify(payload) + '\n';
        });

        if (!bulkPayload.endsWith('\n')) {
            bulkPayload += '\n';
        }

        const response = await client.post('/_bulk', bulkPayload, {
            headers: {
                'Content-Type': 'application/x-ndjson',
            }
        });
        if (response.data.errors) {
            console.error('Errors occurred during the bulk update:', response.data.items);
        };

        return response.data;
    } catch (error) {
        console.error('Error performing bulk update:', error.response ? error.response.data : error.message);
        throw error;
    };
};

export const bulkUpdateSitegames = async (client, indexName, opensearchDocs) => {
    const updates = opensearchDocs.map((doc) => ({
        entryId: doc.siteGameId,
        payload: {
            script: {
                source: `
                    if (ctx._source.siteGame == null) {
                        return;
                    }

                    if (ctx._source.siteGame.inSections == null) {
                        ctx._source.siteGame.inSections = [];
                    }

                    if (ctx._source.siteGame.inLayouts == null) {
                        ctx._source.siteGame.inLayouts = [];
                    }

                    if (ctx._source.siteGame.inCategories == null) {
                        ctx._source.siteGame.inCategories = [];
                    }

                    if (ctx._source.siteGame.visibility == null) {
                        ctx._source.siteGame.visibility = [];
                    }

                    if (!ctx._source.siteGame.inSections.stream().anyMatch(section -> section.id == params.updatedData.section.id)) {
                        ctx._source.siteGame.inSections.add(params.updatedData.section);
                    }

                    for (layout in params.updatedData.layout) {
                        boolean exists = false;
                        for (existingLayout in ctx._source.siteGame.inLayouts) {
                            if (existingLayout.id == layout.id) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            ctx._source.siteGame.inLayouts.add(layout);
                        }
                    }

                    for (category in params.updatedData.category) {
                        boolean exists = false;
                        for (existingCategory in ctx._source.siteGame.inCategories) {
                            if (existingCategory.id == category.id) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            ctx._source.siteGame.inCategories.add(category);
                        }
                    }

                    for (newVisibility in params.updatedData.visibility) {
                        boolean exists = false;
                        for (existingVisibility in ctx._source.siteGame.visibility) {
                            if (existingVisibility.loggedIn == newVisibility.loggedIn &&
                                existingVisibility.loggedOut == newVisibility.loggedOut &&
                                existingVisibility.platform == newVisibility.platform) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            ctx._source.siteGame.visibility.add(newVisibility);
                        }
                    }

                    ctx._source.siteGame.ventureName = params.updatedData.ventureName;
                    ctx._source.siteGame.isUsedInVenture = params.updatedData.isUsedInVenture;
                `,
                lang: 'painless',
                params: { updatedData: doc }
            }
        }
    }));
    const syncResponse = await bulkUpdateDocuments(client, indexName, updates);
    if (syncResponse.errors) {
        throw new Error(`Bulk sync failed with errors: ${JSON.stringify(syncResponse.items)}`);
    };
};

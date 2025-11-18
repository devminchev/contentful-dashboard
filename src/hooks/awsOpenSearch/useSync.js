const contentful = require('contentful');

const client = contentful.createClient({
    host: 'preview.contentful.com',
    space: 'nw2595tc1jdx',
    accessToken: '48af7b4dadb6e200dad2fe16c4601533c7759ceb500a9f2565df7c412fd0545a',
    environment: 'release-56',
});

function useSync() {
    const syncContentful = async () => {
        client.sync({
            initial: true,
            type: 'Entry',
            content_type: 'categories'
        }).then((response) => {
            console.log({
                entries: response.entries,
                nextSyncToken: response.nextSyncToken,
                deletedEntries: response.deletedEntries
            });

        }).catch(console.error)
    };
    return syncContentful;
};

export default useSync;

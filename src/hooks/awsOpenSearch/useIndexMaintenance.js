// src/hooks/awsOpenSearch/useIndexMaintenance.js
import { useState } from 'react';
import useOpenSearchContext from '../../Context/useOpenSearchContext';

export default function useIndexMaintenance() {
    const {
        axiosClient,
        setQueryProgress,
        selectedEnv
    } = useOpenSearchContext();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [indicesStats, setIndicesStats] = useState([]);

    const indexes = [
        'game-sections',
        'games-v2',
        'marketing-sections',
        'navigation',
        'themes',
        'ventures',
        'views',
        'ml-personalised-sections',
        'ml-personalised-sections-defaults'
    ];

    const clearAllIndexes = async () => {
        setLoading(true);
        setError(null);
        setQueryProgress(0.1);

        try {
            for (let i = 0; i < indexes.length; i++) {
                const idx = indexes[i];
                // advance progress through the loop
                setQueryProgress(Math.min(100, 10 + ((i + 1) / indexes.length) * 80));
                await axiosClient.post(`/${idx}/_delete_by_query`, {
                    query: { match_all: {} }
                });
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            setQueryProgress(0);
        }
    };

    const clearIndex = async (indexName) => {
        setLoading(true);
        setError(null);
        setQueryProgress(0.1);

        try {
            console.log(`Clearing index “${indexName}” on ${selectedEnv}`);

            await axiosClient.post(`/${indexName}/_delete_by_query`, {
                query: { match_all: {} }
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            setQueryProgress(0);
        }
    };

    const fetchIndicesStats = async () => {
        setLoading(true);
        setError(null);
        setQueryProgress(0.1);

        try {
            const response = await axiosClient.get('/_cat/indices', {
                params: { v: true, s: 'index', format: 'json' }
            });

            // 1) Filter by your predefined list, 2) then map to {index, docsCount}
            const stats = response.data
                .filter(item => indexes.includes(item.index))
                .map(item => ({
                    index: item.index,
                    docsCount: Number(item['docs.count'])
                }));

            setIndicesStats(stats);
            return stats;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
            setQueryProgress(0);
        }
    };

    return {
        clearAllIndexes,
        clearIndex,
        fetchIndicesStats,
        loading,
        error,
        indicesStats
    };
}

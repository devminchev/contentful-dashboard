/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { healthCheck } from "../services/Redis";

function useRedisCache() {
    const { notifier, user } = useSDK();
    const [isRedisAvailable, setIsRedisAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await healthCheck();
            const redisStatus = data.responses?.find(res => res.service === 'redis');

            if (redisStatus.status === 200) {
                setIsRedisAvailable(true);
                notifier.success(`Redis is Available !`);
            } else {
                setIsRedisAvailable(false);
                notifier.error(`Error ${redisStatus.message}`,);
            };
        } catch (err) {
            setIsRedisAvailable(false);
            notifier.error(`Error : Api Failure ${err.message || err.response?.data?.message}`);
        } finally {
            setIsLoading(false);
        };
    });

    useEffect(() => {
        const team = user.teamMemberships?.find(team => team.sys.team.sys.id === '7xbeHv9x9HZsDKnXjwsiUU');
        if (user.spaceMembership.admin || team) {
            load();
            return;
        }

        notifier.error('You have no permissions !');
    }, []);

    return { isRedisAvailable, isLoading };
}

export default useRedisCache;

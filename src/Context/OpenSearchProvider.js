/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useSDK } from "@contentful/react-apps-toolkit";
import { OS_DEV_ENV } from '../constants/awsEnvironment';

const openSearchClients = {
    dev: axios.create({
        timeout: 30000,
        baseURL: `https://search-lobby-opensearch-nsv4wbtlhyi5rtkzy62lf6s7su.eu-west-1.es.amazonaws.com`,
        auth: {
            username: 'lobbydev1',
            password: 'GRham8uX2YN*12'
        }
    }),
    staging: axios.create({
        timeout: 60000,
        baseURL: `https://lobbycontent-opsearch.stg.eu00.aws.ballys.tech`,
        auth: {
            username: 'contentful',
            password: 'uwNHo1Z$M3&6BkRZ'
        }
    }),
    production: axios.create({
        timeout: 60000,
        baseURL: `https://lobbycontent-opsearch.prod.eu00.aws.ballys.tech`,
        auth: {
            username: 'contentful',
            password: 'dD58Urr4$1qh4Loy'
        }
    }),
    genAiDev: axios.create({
        timeout: 30000,
        baseURL: `https://search-lobby-opensearch-akxsd3t2fhkh4chftnk2yq77n4.eu-west-1.es.amazonaws.com`,
        auth: {
            username: 'lobbydev1',
            password: 'GRham8uX2YN*12'
        }
    })
};

export const openSearchDefaultValues = {
    selectedEnv: OS_DEV_ENV,
    axiosClient: openSearchClients[OS_DEV_ENV],
    isAvailable: false,
    queryProgress: 0,
    indexList: [],
    setQueryProgress: () => { },
    setOpensearchClient: () => { },
};

export const OpenSearchContext = createContext(openSearchDefaultValues);

const getIndexList = ({ data }) => {
    const lines = data.split('\n');
    const headers = lines[0].split(/\s+/);
    const indicesData = lines.slice(1).map(line => {
        const values = line.split(/\s+/);
        return headers.reduce((obj, header, index) => ({
            ...obj,
            [header]: values[index]
        }), {});
    }).filter(i => i.index && !i.index?.startsWith('.'));

    return indicesData;
}

export const OpenSearchProvider = ({ children }) => {
    const { notifier } = useSDK();
    const [state, setState] = useState({ ...openSearchDefaultValues });

    const setOpensearchClient = (env) => {
        setState((currentValues) => ({
            ...currentValues,
            selectedEnv: env,
            axiosClient: openSearchClients[env]
        }));
    };

    const connect = (val) => {
        setState((currentValues) => ({
            ...currentValues,
            isAvailable: val
        }));
    };

    const setQueryProgress = (val) => {
        setState((currentValues) => ({
            ...currentValues,
            queryProgress: val
        }));
    };

    const checkConnection = useCallback(async () => {
        setQueryProgress(0.1);
        try {
            const healthResponse = await state.axiosClient.get('/_cluster/health');
            if (healthResponse.status === 200) {
                connect(true);
                notifier.success(`Opensearch Connected Env: ${state.selectedEnv}`);

                const indexList = await state.axiosClient.get('/_cat/indices?v');
                if (indexList.status === 200) {
                    setState((currentValues) => ({
                        ...currentValues,
                        indexList: getIndexList(indexList)
                    }));
                }
            }
        } catch (err) {
            connect(false);
            notifier.error(`Opensearch Connection Error: ${state.selectedEnv}`);
        } finally {
            setQueryProgress(0);
        };
    }, [state.selectedEnv]);

    useEffect(() => {
        let isCancelled = false;

        if (!isCancelled) {
            checkConnection();
        }

        return () => {
            isCancelled = true;
        };
    }, [state.selectedEnv]);

    return (
        <OpenSearchContext.Provider value={{ ...state, setOpensearchClient, setQueryProgress }}>
            {children}
        </OpenSearchContext.Provider>
    );
};

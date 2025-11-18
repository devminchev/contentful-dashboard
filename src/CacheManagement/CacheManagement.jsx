import React from 'react';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { useRedisCache } from '../hooks';
import CacheDataControl from './CacheDataControl';
import { PageWrapper } from '../common/styles/mixins';

const CacheManagement = () => {
    const { isRedisAvailable, isLoading } = useRedisCache();
    return (
        <PageWrapper>
            <h1>Cache Management</h1>
            {isLoading && <LoadingBar />}
            {!isLoading && isRedisAvailable ? <CacheDataControl /> : <div> Redis is not reachable ! Please check with dev team ... </div>}
        </PageWrapper>
    );
};

export default CacheManagement;

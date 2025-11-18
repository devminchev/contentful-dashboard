// src/locations/OSV3IndexManagement.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useOpenSearchContext from '../Context/useOpenSearchContext';
import useIndexMaintenance from '../hooks/awsOpenSearch/useIndexMaintenance';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import SpaceEnvBanner from '../components/ActiveSpaceEnvBanner';
import { ConfirmModal } from '../components/ConfirmModal';
import { IndexStatsList } from '../components/StatsList';
import {
    ListContainer,
    ListItemBtn,
    PageWrapper,
    RowWrapper,
} from '../common/styles/mixins';
import { OS_DEV_ENV, OS_PRODUCTION_ENV, OS_STAGING_ENV } from '../constants/awsEnvironment';
import { useFilteredAdminAccess } from '../hooks/useAdminAccess';
import EnvHeader from '../components/EnvHeader';

const HoverRedButton = styled(ListItemBtn)`
  padding: 12px 12px;
  white-space: normal;
  word-break: break-word;
  text-align: center;
  width: 300px;
  font-weight: 800;
  font-size: 1.1rem;
  height: 40px;
  background-image: linear-gradient(to bottom, rgb(7 65 115), #292a2f);

  &:hover {
    background-color: #d9534f; /* red on hover */
    background-image: none;
    color: white;
  }
`;

const OSV3IndexManagement = () => {
    const {
        selectedEnv,
        setOpensearchClient,
        queryProgress,
    } = useOpenSearchContext();
    const showAdmin = useFilteredAdminAccess();

    const {
        clearAllIndexes,
        clearIndex,
        fetchIndicesStats,
        loading: maintenanceLoading,
        error: maintenanceError,
        indicesStats
    } = useIndexMaintenance();

    // default to NA Dev on first mount
    useEffect(() => {
        setOpensearchClient(OS_DEV_ENV);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const allIndexes = [
        'game-sections',
        'games-v2',
        'marketing-sections',
        'navigation',
        'themes',
        'ventures',
        'views'
    ];
    const [selectedIndex, setSelectedIndex] = useState(allIndexes[0]);

    // popup state
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);

    const onConfirmSingle = async () => {
        setShowSingleModal(false);
        await clearIndex(selectedIndex);
    };

    const onConfirmAll = async () => {
        setShowAllModal(false);
        await clearAllIndexes();
    };

    return (
        <PageWrapper>
            {showAdmin ? (
                <>
                    <h1>Open Search index cleanup</h1>
                    <SpaceEnvBanner />

                    <EnvHeader env={selectedEnv} />

                    <RowWrapper style={{margin: '24px auto', width: 'fit-content'}}>
                        <ListItemBtn
                            className={selectedEnv === OS_DEV_ENV ? 'active' : ''}
                            onClick={() => setOpensearchClient(OS_DEV_ENV)}
                        >
                            Connect to OS EU [DEV]
                        </ListItemBtn>
                        <ListItemBtn
                            className={selectedEnv === OS_STAGING_ENV ? 'active' : ''}
                            onClick={() => setOpensearchClient(OS_STAGING_ENV)}
                        >
                            Connect to OS EU [STAGING]
                        </ListItemBtn>
                        <ListItemBtn
                            className={selectedEnv === OS_PRODUCTION_ENV ? 'active' : ''}
                            onClick={() => setOpensearchClient(OS_PRODUCTION_ENV)}
                        >
                            Connect to OS EU [PRODUCTION]
                        </ListItemBtn>
                    </RowWrapper>

                    {/* 2) Single-index dropdown + clear */}
                    <RowWrapper style={{ margin: '60px auto 30px', gap: '12px', width: 'fit-content', display: 'block'}}>
                        <select
                            value={selectedIndex}
                            onChange={e => setSelectedIndex(e.target.value)}
                            style={{ width: '220px', padding: '8px 12px', borderRadius: '4px', fontSize: '1rem', height: '40px'}}>
                            {allIndexes.map(idx => (
                                <option key={idx} value={idx}>
                                    {idx}
                                </option>
                            ))}
                        </select>

                        {/* now triggers popup instead of direct call */}
                        <HoverRedButton
                            onClick={() => setShowSingleModal(true)}
                            disabled={maintenanceLoading}
                        >
                            Clear “{selectedIndex}” Only
                        </HoverRedButton>
                    </RowWrapper>

                    {/* 3) Global maintenance buttons */}
                    <ListContainer style={{ marginTop: '24px' }}>
                        <ListItemBtn
                            onClick={fetchIndicesStats}
                            disabled={maintenanceLoading}
                            style={{backgroundImage: 'linear-gradient(to bottom, rgb(7 65 115), #292a2f)', width: '520px'}}
                        >
                            Refresh Stats
                        </ListItemBtn>
                    </ListContainer>


                    <ListContainer style={{ marginTop: '70px' }}>
                        <ListItemBtn
                            onClick={() => setShowAllModal(true)}
                            disabled={maintenanceLoading}
                            style={{ background: '#d9534f', borderColor: '#d43f3a', width: '520px', fontSize: '1.1rem', fontWeight: '700' }}>
                            Clear All Indexes
                        </ListItemBtn>
                    </ListContainer>


                    {/* 4) Index stats list */}
                    {indicesStats.length > 0 && <IndexStatsList stats={indicesStats} />}

                    {/* 5) Feedback */}
                    {maintenanceLoading && (
                        <LoadingBar message="Running maintenance…" />
                    )}
                    {maintenanceError && (
                        <p style={{ color: 'red' }}>
                            Error: {maintenanceError.message}
                        </p>
                    )}
                    {queryProgress > 0 && (
                        <LoadingBar message={`Processing – ${queryProgress}%`} />
                    )}

                    {/* Confirmation Modals */}
                    <ConfirmModal
                        isShown={showSingleModal}
                        title="Confirm Delete"
                        message={<>You are about to delete <strong>all documents</strong> in the index <strong>{selectedIndex}</strong> on environment <strong>{selectedEnv}</strong>. This cannot be undone.</>}
                        onConfirm={onConfirmSingle}
                        onCancel={() => setShowSingleModal(false)}
                        confirmText="OK, Delete"
                    />
                    <ConfirmModal
                        isShown={showAllModal}
                        title="Confirm Delete All"
                        message={<>You are about to delete <strong>all documents</strong> in every index on environment <strong>{selectedEnv}</strong>. This cannot be undone.</>}
                        onConfirm={onConfirmAll}
                        onCancel={() => setShowAllModal(false)}
                        confirmText="OK, Delete All"
                    />
                </>
            ) : (
                <h1>No Permissions to Access This Page</h1>
            )}
        </PageWrapper>
    );
};

export default OSV3IndexManagement;

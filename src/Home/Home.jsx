import React from 'react';
import { Heading } from '@contentful/f36-components';
import { useContentCleanup, useEntries } from '../hooks';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ListHeader, ListItemBtn, PageWrapper } from '../common/styles/mixins';

const Home = () => {
    const { loadingProgress, draftContent, archivedContent, loadDraftAndArchivedContent } = useEntries();
    const { deleteProgress } = useContentCleanup();

    return (
        <PageWrapper>
            <Heading fontColor='white' fontWeight='900' fontSize='36px'>Welcome To Ballys Contentful</Heading>

            <ListHeader>
                Load Archived & Entries Entries
            </ListHeader>
            <ListItemBtn onClick={loadDraftAndArchivedContent}>LOAD</ListItemBtn>

            <ListHeader>
                Archived Entries {archivedContent.length}
            </ListHeader>
            {/* <ListItemBtn disabled={archivedContent.length === 0} onClick={() => deleteUnpublishedContent(archivedContent)}>Delete Archived</ListItemBtn> */}

            <ListHeader>
                Draft Entries {draftContent.length}
            </ListHeader>
            {/* <ListItemBtn disabled={draftContent.length === 0} onClick={() => deleteUnpublishedContent(draftContent)}>Delete Draft</ListItemBtn> */}

            {loadingProgress > 0 && <LoadingBar message={`Loading - ${loadingProgress}%`} />}
            {deleteProgress > 0 && <LoadingBar message={`Cleaning - ${deleteProgress}%`} />}
        </PageWrapper>
    );
};

export default Home;

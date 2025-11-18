import React from 'react';
import useOpenSearchContext from '../Context/useOpenSearchContext';
import useVenturesIndex from '../hooks/awsOpenSearch/useVenturesIndex';
import useCategoriesIndex from '../hooks/awsOpenSearch/useCategoriesIndex';
import useLayoutsIndex from '../hooks/awsOpenSearch/useLayoutsIndex';
import useSectionsIndex from '../hooks/awsOpenSearch/useSectionsIndex';
import usePersDefaultIndex from '../hooks/awsOpenSearch/usePersonalisationDefaultsIndex';
import usePersonalisedSectionIndex from '../hooks/awsOpenSearch/usePersonalisedSectionsIndex';
import useArchivedGamesIndex from '../hooks/awsOpenSearch/useArchivedGamesIndex';

import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import useGamesIndex from '../hooks/awsOpenSearch/useGamesIndex';
import useAvailableSitegames from '../hooks/awsOpenSearch/useAvailableSitegames';
import { ColumnListContainer, ListContainer, ListHeader, ListItemBtn, PageWrapper, RowWrapper } from '../common/styles/mixins';
import { OS_DEV_ENV, OS_PRODUCTION_ENV, OS_STAGING_ENV } from '../constants/awsEnvironment';

const OpensearchContentSync = () => {
    const { selectedEnv, setOpensearchClient, isAvailable, queryProgress, indexList } = useOpenSearchContext();
    const { osVentureContent, getOpensearchVentures, syncVentures } = useVenturesIndex();
    const { osCategoriesContent, contentfulCategoriesEntries, contentfulCategoryEntries, getOpensearchCategories, syncCategories } = useCategoriesIndex();
    const { osLayoutsContent, getOpensearchLayouts, syncLayouts } = useLayoutsIndex();
    const { osSectionsContent, getOpensearchSections, syncSections } = useSectionsIndex();

    const { osPersDefaultContent, getOpensearchPersDefault, syncPersDefault } = usePersDefaultIndex();
    const { osPersonalisedSectionContent, getOpensearchPersonalisedSection, syncCollabSections, syncSimilaritySections } = usePersonalisedSectionIndex();

    const { osGamesContent, getOpensearchGames, syncGameV2, syncSiteGameV2 } = useGamesIndex();
    const { osAvailableGames, syncOpensearch, fetchOpensearchGames } = useAvailableSitegames(contentfulCategoriesEntries, contentfulCategoryEntries);
    const { osArchivedGamesContent, getOpensearchArchivedGames, syncArchivedGameV2, syncArchivedSiteGameV2 } = useArchivedGamesIndex();
    return (
        <PageWrapper>
            <h1>Opensearch Content Sync</h1>
            <ListHeader>
                Selected Environment - {selectedEnv}
            </ListHeader>
            <ListItemBtn className={selectedEnv === OS_DEV_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_DEV_ENV)}>Use Dev</ListItemBtn>
            <ListItemBtn className={selectedEnv === OS_STAGING_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_STAGING_ENV)}>Use Staging</ListItemBtn>
            <ListItemBtn className={selectedEnv === OS_PRODUCTION_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_PRODUCTION_ENV)}>Use Production</ListItemBtn>
            <ListContainer>
                {isAvailable && indexList?.map((({ index }, i) => (
                    <ColumnListContainer key={i}>
                        <RowWrapper>
                            {index === 'ventures' &&
                                <>
                                    <ListHeader>{index} - {osVentureContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchVentures()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncVentures()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'categories' &&
                                <>
                                    <ListHeader>{index} - {osCategoriesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchCategories()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncCategories()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'layouts' &&
                                <>
                                    <ListHeader>{index} - {osLayoutsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchLayouts()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncLayouts()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'sections' &&
                                <>
                                    <ListHeader>{index} - {osSectionsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchSections()}>Fetchsss</ListItemBtn>
                                    <ListItemBtn onClick={() => syncSections()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'personalisation-defaults' &&
                                <>
                                    <ListHeader>{index} - {osPersDefaultContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchPersDefault()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncPersDefault()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'personalised-sections' &&
                                <>
                                    <ListHeader>{index} - {osPersonalisedSectionContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchPersonalisedSection()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncCollabSections()}>Sync Collab Based Sections</ListItemBtn>
                                    <ListItemBtn onClick={() => syncSimilaritySections()}>Sync Similarity Based Sections</ListItemBtn>
                                </>
                            }
                            {index === 'games' &&
                                <>
                                    <ListHeader>{index} - {osGamesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchGames()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncGameV2()}>Sync GameV2</ListItemBtn>
                                    <ListItemBtn onClick={() => syncSiteGameV2()}>Sync SiteGameV2</ListItemBtn>
                                </>
                            }
                            {index === 'games-archived' &&
                                <>
                                    <ListHeader>{index} - {osArchivedGamesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchArchivedGames()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncArchivedGameV2()}>Sync Archived GameV2</ListItemBtn>
                                    <ListItemBtn onClick={() => syncArchivedSiteGameV2()}>Sync Archived SiteGameV2</ListItemBtn>
                                </>
                            }
                        </RowWrapper>
                    </ColumnListContainer>
                )))}
            </ListContainer>
            <>
                <ListHeader>Available Games index - {osAvailableGames.length} </ListHeader>
                <ListItemBtn onClick={() => fetchOpensearchGames()}>Fetch</ListItemBtn>
                <ListItemBtn onClick={() => syncOpensearch()}>Sync available games</ListItemBtn>
            </>
            {queryProgress > 0 && <LoadingBar message={`Processing - ${queryProgress}%`} />}
        </PageWrapper>
    );
};

export default OpensearchContentSync;

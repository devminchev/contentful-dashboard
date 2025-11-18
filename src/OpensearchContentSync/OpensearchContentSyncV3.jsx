import useOpenSearchContext from '../Context/useOpenSearchContext';
import useVenturesIndex from '../hooks/awsOpenSearch/useVenturesIndex';
import useGameSectionsIndex from '../hooks/awsOpenSearch/useGameSectionsIndex';
import useMLSectionsIndex from '../hooks/awsOpenSearch/useMLSectionsIndex';
import useNavigationIndex from '../hooks/awsOpenSearch/useNavigationIndex';
import useMlDefaultGamesIndex from '../hooks/awsOpenSearch/useMLDefaultsIndex';
import useMarketingSectionsIndex from '../hooks/awsOpenSearch/useMarketingSectionsIndex';
import useViewsIndex from '../hooks/awsOpenSearch/useViewsIndex';
import useThemesIndex from '../hooks/awsOpenSearch/useThemesIndex';
import SpaceEnvBanner from '../components/ActiveSpaceEnvBanner';
import EnvHeader from '../components/EnvHeader';

import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import useGamesIndex from '../hooks/awsOpenSearch/useGamesIndex';
import { ColumnListContainer, ListContainer, ListHeader, ListItemBtn, PageWrapper, RowWrapper } from '../common/styles/mixins';
import { OS_DEV_ENV, OS_PRODUCTION_ENV, OS_STAGING_ENV, OS_GEN_AI_DEV_ENV } from '../constants/awsEnvironment';

const OpensearchContentSyncV3 = () => {
    const { selectedEnv, setOpensearchClient, isAvailable, queryProgress, indexList } = useOpenSearchContext();
    const { osGamesContent, getOpensearchGames, syncGameV2, syncSiteGameV2 } = useGamesIndex('games-v2');

    const { osGameSectionsContent, getOpensearchGameSections, syncIgSections } = useGameSectionsIndex();
    const { osMLSectionsContent, getOpensearchMLSections, syncMLSections } = useMLSectionsIndex();
    const { osNavigationContent, getOpensearchNavigation, syncNavigation } = useNavigationIndex();
    const { osMlDefaultGamesContent, getOpensearchMlDefaultGames, syncMlDefaultGamesType } = useMlDefaultGamesIndex();
    const { osMarketingSectionsContent, getOpensearchMarketingSections, syncMarketingSections } = useMarketingSectionsIndex();
    const { osViewsContent, getOpensearchViews, syncViews } = useViewsIndex();
    const { osThemesContent, getOpensearchThemes, syncAllThemes } = useThemesIndex();
    const { osVentureContent, getOpensearchVentures, syncVentures } = useVenturesIndex();

    return (
        <PageWrapper>
            <h1>Opensearch Content Sync for lobby V3 for EU</h1>
            <SpaceEnvBanner />
            <EnvHeader env={selectedEnv} />

            <RowWrapper style={{margin: '24px auto', width: 'fit-content'}}>
                <h1> 🇬🇧 EU Jurisdiciton</h1>
            </RowWrapper>

                    <>
                        <ListItemBtn className={selectedEnv === OS_DEV_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_DEV_ENV)}>Use EU Dev</ListItemBtn>
                        <ListItemBtn className={selectedEnv === OS_STAGING_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_STAGING_ENV)}>Use EU Staging</ListItemBtn>
                        <ListItemBtn className={selectedEnv === OS_PRODUCTION_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_PRODUCTION_ENV)}>Use EU Production</ListItemBtn>
                        <ListItemBtn className={selectedEnv === OS_GEN_AI_DEV_ENV ? 'active' : ''} onClick={() => setOpensearchClient(OS_GEN_AI_DEV_ENV)}>Use GEN_AI Dev</ListItemBtn>
                    </>


            <ListContainer>
                {isAvailable && indexList?.map((({ index }, i) => (
                    <ColumnListContainer key={i}>
                        <RowWrapper>
                            {/* TODO: Verify sync is correct */}
                            {index === 'games-v2' &&
                                <>
                                    <ListHeader>{index} - {osGamesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchGames()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncGameV2()}>Sync GameV2</ListItemBtn>
                                    <ListItemBtn onClick={() => syncSiteGameV2()}>Sync SiteGameV2</ListItemBtn>
                                </>
                            }
                            {index === 'game-sections' &&
                                <>
                                    <ListHeader>{index} - {osGameSectionsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchGameSections()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncIgSections()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'ml-personalised-sections' &&
                                <>
                                    <ListHeader>{index} - {osMLSectionsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchMLSections()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncMLSections()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'navigation' &&
                                <>
                                    <ListHeader>{index} - {osNavigationContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchNavigation()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncNavigation()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'ml-personalised-sections-defaults' &&
                                <>
                                    <ListHeader>{index} - {osMlDefaultGamesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchMlDefaultGames()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncMlDefaultGamesType()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'marketing-sections' &&
                                <>
                                    <ListHeader>{index} - {osMarketingSectionsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchMarketingSections()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncMarketingSections()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'views' &&
                                <>
                                    <ListHeader>{index} - {osViewsContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchViews()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncViews()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'themes' &&
                                <>
                                    <ListHeader>{index} - {osThemesContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchThemes()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncAllThemes()}>Sync</ListItemBtn>
                                </>
                            }
                            {index === 'ventures' &&
                                <>
                                    <ListHeader>{index} - {osVentureContent.length} </ListHeader>
                                    <ListItemBtn onClick={() => getOpensearchVentures()}>Fetch</ListItemBtn>
                                    <ListItemBtn onClick={() => syncVentures()}>Sync</ListItemBtn>
                                </>
                            }
                        </RowWrapper>
                    </ColumnListContainer>
                )))}
            </ListContainer>
            {queryProgress > 0 && <LoadingBar message={`Processing - ${queryProgress}%`} />}
        </PageWrapper>
    );
};

export default OpensearchContentSyncV3;

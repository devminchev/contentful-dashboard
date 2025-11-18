import React from 'react';
import { useAtoZSectionGames, useSortingAllGamesSections } from '../hooks';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ColumnListContainer, ListContainer, ListHeader, ListItem, ListItemBtn, PageWrapper, RowWrapper } from '../common/styles/mixins';
import { RefreshBtn } from './AtoZSectionsGames.style';
import { ToggleContentWrapper } from '../SiteGameOperations/SiteGameOperations.style';

const AtoZSectionsGames = () => {
    const { isLoading: isLoadingGames, gamesRequestProgress, ventures, sectionsOfVenture, toggleSectionsOfVenture, refresh } = useAtoZSectionGames();
    const { sortedSections, updateSortedGamesInSection, publishSortedGamesInSection } = useSortingAllGamesSections(refresh);

    return (
        <PageWrapper>
            <h1>AllGames(A-Z) Sections Sorting</h1>
            <RefreshBtn onClick={refresh} disabled={isLoadingGames}>
                Refresh
            </RefreshBtn>
            <ListContainer>
                {ventures.length > 0 && ventures.map(((venture, i) => (
                    <ColumnListContainer key={i}>
                        <RowWrapper>
                            <ListHeader onClick={() => toggleSectionsOfVenture(venture.name)}>{venture.name}</ListHeader>
                        </RowWrapper>
                        {sectionsOfVenture[venture.name] && Object.keys(sectionsOfVenture[venture.name]).length > 0 && Object.keys(sectionsOfVenture[venture.name])?.map((key) => (
                            <ToggleContentWrapper isOpen={Object.keys(sectionsOfVenture[venture.name])?.length > 0} key={key}>
                                <ListItem>{key}</ListItem>
                                <ListItemBtn onClick={() => updateSortedGamesInSection(sectionsOfVenture[venture.name][key])} disabled={sortedSections[sectionsOfVenture[venture.name][key].section.sys.id]}>
                                    {!sortedSections[sectionsOfVenture[venture.name][key].section.sys.id] ? 'Sort & Update' : 'Updated !'}
                                </ListItemBtn>
                                <ListItemBtn onClick={() => publishSortedGamesInSection(sectionsOfVenture[venture.name][key])}>
                                    Publish
                                </ListItemBtn>
                            </ToggleContentWrapper>
                        ))}
                    </ColumnListContainer>
                )))}
            </ListContainer>

            {isLoadingGames && <LoadingBar />}
            {gamesRequestProgress > 0 && <LoadingBar message={`In Progress - ${gamesRequestProgress} %`} />}
            {/* {(isVentureSorting || isLoading) && <LoadingBar message={'A-Z Order Processing ... '} />}
            {isPublishing && <LoadingBar message={'A-Z Order Publishing ... '} />} */}
        </PageWrapper >
    );
};

export default AtoZSectionsGames;

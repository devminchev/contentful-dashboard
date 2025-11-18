import React from 'react';
import { useSiteGameLinks } from '../hooks';
import { SPACE_LOCALE } from '../services/ContentfulConfig';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ListItem, ListItemBtn, PageWrapper } from '../common/styles/mixins';
import { ColumnListContainer, ListContainer, RowWrapper, SelectButton, SiteGameHeader, ToggleContentWrapper } from './SiteGameOperations.style';
// import useIGTGamesLinks from '../hooks/useIGTGamesLinks';

const SiteGameOperations = () => {
    const {
        isLoading,
        selectedSiteGames,
        toggledSiteGames,
        siteGameLinks,
        selectSiteGames,
        toggle,
        removeFromLink,
        removeSiteGameFromAllLinks,
        unSelect,
    } = useSiteGameLinks();

    return (
        <PageWrapper>
            <h1>SiteGames Unlink Operations</h1>

            <SelectButton onClick={selectSiteGames} disabled={isLoading}>
                Select New Sitegame
            </SelectButton>

            <ListContainer>
                {selectedSiteGames.length > 0 && selectedSiteGames.map(((sitegame, ind) => (
                    <ColumnListContainer key={ind}>
                        <RowWrapper>
                            <SiteGameHeader onClick={() => toggle(sitegame.sys.id)}>{sitegame.fields.entryTitle[SPACE_LOCALE]}</SiteGameHeader>
                            <ListItemBtn onClick={() => unSelect(sitegame.sys.id)}>
                                Unselect
                            </ListItemBtn>
                            {siteGameLinks[sitegame.sys.id] &&
                                <ListItemBtn onClick={() => removeSiteGameFromAllLinks(sitegame.sys.id)} disabled={siteGameLinks[sitegame.sys.id]?.length === 0}>
                                    {siteGameLinks[sitegame.sys.id]?.length > 0 ? 'Unlink All' : 'No Links'}
                                </ListItemBtn>}
                        </RowWrapper>
                        {siteGameLinks[sitegame.sys.id]?.map((link, linkIndex) => (
                            <ToggleContentWrapper isOpen={toggledSiteGames[sitegame.sys.id]} key={linkIndex}>
                                <ListItem>{link.fields.entryTitle[SPACE_LOCALE]}</ListItem>
                                <ListItemBtn onClick={() => removeFromLink(sitegame.sys.id, link.sys.id)}>
                                    Unlink
                                </ListItemBtn>
                            </ToggleContentWrapper>
                        ))}
                    </ColumnListContainer>
                )))}
            </ListContainer>

            {/* <ListContainer>
                {selectedIGTGames.length > 0 && selectedIGTGames.map(((sitegame, ind) => (
                    <ColumnListContainer key={ind}>
                        <RowWrapper>
                            <SiteGameHeader onClick={() => toggleIGT(sitegame.sys.id)}>{sitegame.fields.entryTitle[SPACE_LOCALE]}</SiteGameHeader>
                            {iGTGameLinks[sitegame.sys.id] &&
                                <ListItemBtn onClick={() => removeIGTFromAllLinks(sitegame.sys.id)} disabled={iGTGameLinks[sitegame.sys.id]?.length === 0}>
                                    {iGTGameLinks[sitegame.sys.id]?.length > 0 ? 'Unlink All' : 'No Links'}
                                </ListItemBtn>}
                        </RowWrapper>
                        {iGTGameLinks[sitegame.sys.id]?.map((link, linkIndex) => (
                            <ToggleContentWrapper isOpen={toggledIGTGames[sitegame.sys.id]} key={linkIndex}>
                                <ListItem>{link.fields.entryTitle[SPACE_LOCALE]}</ListItem>
                                <ListItemBtn onClick={() => removeFromLink(sitegame.sys.id, link.sys.id)}>
                                    Unlink
                                </ListItemBtn>
                            </ToggleContentWrapper>
                        ))}
                    </ColumnListContainer>
                )))}
            </ListContainer>
            {isProgress && <LoadingBar />} */}

            {isLoading && <LoadingBar />}
        </PageWrapper>
    );
};

export default SiteGameOperations;

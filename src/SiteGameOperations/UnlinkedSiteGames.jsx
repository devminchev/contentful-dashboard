import React, { useCallback, useState } from 'react';

import useGraphQlContext from '../Context/useGraphQlContext';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ListHeader,ListRowItem, PageWrapper } from '../common/styles/mixins';
import { ColumnListContainer, RowWrapper, SelectButton } from './SiteGameOperations.style';
import { Checkbox, FormControl } from '@contentful/f36-components';

const UnlinkedSiteGames = () => {
    const { queryProgress, setQueryProgress, getSiteGameV2Links } = useGraphQlContext();
    const [filteredUnlinkSitegames, setFilteredUnlinkSitegames] = useState([]);

    const [filters, setFilters] = useState({
        environment: [],
    });

    const handleEnvironmentChange = (event) => {
        const { name, checked } = event.target;

        setFilters((prevFilters) => {
            const environmentSet = new Set(prevFilters.environment);

            if (checked) {
                environmentSet.add(name);
            } else {
                environmentSet.delete(name);
            }

            return {
                ...prevFilters,
                environment: Array.from(environmentSet)
            };
        });
    };

    const filter = useCallback(async () => {
        setQueryProgress(0.1);
        const graphQlFilter = {
            environment_exists: filters.environment.length > 0,
            ...(filters.environment.length > 0 && {
                environment_contains_some: filters.environment,
            })
        };

        let allEntries = [];
        let skip = 0;
        let total = null;

        while (total === null || skip < total) {
            const { data: { data: { siteGameV2Collection } } } = await getSiteGameV2Links(skip, graphQlFilter);
            const { items, total: fetchedTotal } = siteGameV2Collection;

            allEntries = allEntries.concat(items);
            total = fetchedTotal;
            skip += 100;
        };

        const unlinkedSiteGames = allEntries.filter(
            item => item.linkedFrom.sectionCollection.total === 0
        );

        setFilteredUnlinkSitegames(unlinkedSiteGames);

        setQueryProgress(0);
        return allEntries;
        // eslint-disable-next-line
    }, [filters]);

    return (
        <PageWrapper>
            <h1>Unlinked SiteGames Filters</h1>

            <FormControl id="environment">
                <Checkbox
                    name="staging"
                    isChecked={filters.environment.includes("staging")}
                    onChange={handleEnvironmentChange}
                >
                    On Staging Environment
                </Checkbox>
                <Checkbox
                    name="production"
                    isChecked={filters.environment.includes("production")}
                    onChange={handleEnvironmentChange}
                >
                    On Production Environment
                </Checkbox>
            </FormControl>
            <SelectButton onClick={filter} disabled={queryProgress > 0}>
                Filter
            </SelectButton>

            <ListHeader>Total Content :   {filteredUnlinkSitegames.length}</ListHeader>
            <ColumnListContainer>
                {filteredUnlinkSitegames.length > 0 && filteredUnlinkSitegames.map(((sitegame, ind) => (
                    <RowWrapper key={ind}>
                        <ListRowItem>{sitegame.sys.id}</ListRowItem>
                        <ListRowItem>{sitegame.entryTitle}</ListRowItem>
                    </RowWrapper>
                )))}
            </ColumnListContainer>

            {queryProgress > 0 && <LoadingBar />}
        </PageWrapper>
    );
};

export default UnlinkedSiteGames;

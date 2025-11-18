import { createSelector } from "reselect";

const releasesSelector = state => state.release;

export const selectReleases = createSelector(
    releasesSelector,
    state => state.releases
);

export const selectReleasesLoading = createSelector(
    releasesSelector,
    state => state.loading
);

export const selectReleaseStatus = createSelector(
    releasesSelector,
    state => state.status
);

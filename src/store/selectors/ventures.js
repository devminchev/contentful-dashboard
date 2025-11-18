import { createSelector } from "reselect";
const venturesSelector = state => state.ventures;

const exludeVentures = [
    'canalbingo',
    'heart',
    'starspins',
    'megawayscasino',
    'tropicana',
    'virgincasino'
];

export const selectVentures = createSelector(
    venturesSelector,
    state => state.items.filter(v => !exludeVentures.includes(v.name))
);

export const selectVenturesLoading = createSelector(
    venturesSelector,
    state => state.loading
);

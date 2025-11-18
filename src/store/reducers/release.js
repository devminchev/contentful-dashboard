import { COMPLETE_RELEASE, COMPLETE_RELEASE_FAILURE, COMPLETE_RELEASE_SUCCESS, FETCH_RELEASES, FETCH_RELEASES_FAILURE, FETCH_RELEASES_SUCCESS, PREPARE_RELEASE, PREPARE_RELEASE_FAILURE, PREPARE_RELEASE_SUCCESS } from "../actions/types";

const initialState = {
    loading: false,
    releases: {},
    status: { isPreparing: false, isPrepared: null, isReleasing: false, isDone: null }
};

const release = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_RELEASES:
            return { ...state, loading: true };
        case FETCH_RELEASES_SUCCESS:
            const currentMasterAlias = action.payload.find(item => item.sys?.aliases.length > 0 && item.sys.aliases[0].sys.id === 'master');
            const needsRelease = !state.status.isDone ? currentMasterAlias.name !== action.payload[0].name : false;
            const latestReleaseNumber = needsRelease ? Number(currentMasterAlias.name.match(/\d+$/)[0]) : Number(action.payload[0].name.match(/\d+$/)[0]);

            const releases = {
                needsRelease,
                nextReleaseNumber: latestReleaseNumber + 1,
                latestReleaseEnv: needsRelease ? currentMasterAlias : action.payload[0],
                oldestReleaseEnv: action.payload[action.payload.length - 1],
            };
            return {
                ...state,
                loading: false,
                releases,
                status: { ...state.status, isPrepared: needsRelease ? action.payload[0] : null, isDone: null }
            };
        case FETCH_RELEASES_FAILURE:
            return { ...state, loading: false };
        case PREPARE_RELEASE:
            return { ...state, status: { ...state.status, isPreparing: true } };
        case PREPARE_RELEASE_SUCCESS:
            return { ...state, status: { ...state.status, isPreparing: false, isPrepared: action.payload } };
        case PREPARE_RELEASE_FAILURE:
            return { ...state, status: { ...state.status, isPreparing: false } };
        case COMPLETE_RELEASE:
            return { ...state, status: { ...state.status, isReleasing: true } };
        case COMPLETE_RELEASE_SUCCESS:
            return { ...state, status: { ...state.status, isReleasing: false, isPrepared: null, isDone: state.status.isPrepared } };
        case COMPLETE_RELEASE_FAILURE:
            return { ...state, status: { ...state.status, isReleasing: false } };
        default:
            return state;
    }
};

export default release;

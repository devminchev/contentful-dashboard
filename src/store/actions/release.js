import { FETCH_RELEASES, FETCH_RELEASES_SUCCESS, FETCH_RELEASES_FAILURE, PREPARE_RELEASE, PREPARE_RELEASE_SUCCESS, PREPARE_RELEASE_FAILURE, COMPLETE_RELEASE, COMPLETE_RELEASE_SUCCESS, COMPLETE_RELEASE_FAILURE } from './types';

import * as ContentfulService from '../../services/ManagementApi';

export const fetchReleases = () => ({ type: FETCH_RELEASES });
export const fetchReleasesSuccess = payload => ({ type: FETCH_RELEASES_SUCCESS, payload });
export const fetchReleasesFailure = payload => ({ type: FETCH_RELEASES_FAILURE, payload });

export const getReleases = () => async (dispatch) => {
    dispatch(fetchReleases());

    try {
        const response = await ContentfulService.getReleases();
        return dispatch(fetchReleasesSuccess(response));
    } catch (err) {
        return dispatch(fetchReleasesFailure(err.message));
    };
};

export const prepareRelease = () => ({ type: PREPARE_RELEASE });
export const prepareReleaseSuccess = payload => ({ type: PREPARE_RELEASE_SUCCESS, payload });
export const prepareReleaseFailure = () => ({ type: PREPARE_RELEASE_FAILURE });

export const prepareNewRelease = (releases) => async (dispatch) => {
    dispatch(prepareRelease());

    try {
        const newRelease = await ContentfulService.prepareRelease(releases);
        return dispatch(prepareReleaseSuccess(newRelease));
    } catch (err) {
        return dispatch(prepareReleaseFailure(err.message));
    };
};

export const completeRelease = () => ({ type: COMPLETE_RELEASE });
export const completeReleaseSuccess = () => ({ type: COMPLETE_RELEASE_SUCCESS });
export const completeReleaseFailure = () => ({ type: COMPLETE_RELEASE_FAILURE });

export const completeNewRelease = (newReleaseNumber) => async (dispatch) => {
    dispatch(completeRelease());

    try {
        await ContentfulService.updateMasterAliasToNewRelease(newReleaseNumber);
        return dispatch(completeReleaseSuccess());
    } catch (err) {
        return dispatch(completeReleaseFailure(err.message));
    };
};

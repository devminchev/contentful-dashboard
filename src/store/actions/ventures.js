import { FETCH_VENTURES, FETCH_VENTURES_SUCCESS, FETCH_VENTURES_FAILURE } from './types';
import * as ContentfulService from '../../services/ManagementApi';

export const fetchVentures = () => ({ type: FETCH_VENTURES });
export const fetchVenturesSuccess = (payload, locale) => ({ type: FETCH_VENTURES_SUCCESS, payload, locale });
export const fetchVenturesFailure = payload => ({ type: FETCH_VENTURES_FAILURE, payload });

export const getVentures = (locale) => dispatch => {
    dispatch(fetchVentures());

    return ContentfulService.getPublishedContent({ content_type: 'venture' })
        .then(res => {
            dispatch(fetchVenturesSuccess(res, locale));
        })
        .catch(err => {
            dispatch(fetchVenturesFailure(err.message));
        });
};

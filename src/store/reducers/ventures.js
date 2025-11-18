import { FETCH_VENTURES, FETCH_VENTURES_FAILURE, FETCH_VENTURES_SUCCESS } from "../actions/types";

const initialState = { items: [], loading: true, error: null };

const ventures = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_VENTURES:
            return { ...state, loading: true };
        case FETCH_VENTURES_SUCCESS:
            const items = action.payload.filter(v => v.fields.name).map(venture => ({
                name: venture.fields.name[action.locale],
                id: venture.sys.id
            }));

            return { ...state, items, loading: false };
        case FETCH_VENTURES_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    };
};

export default ventures;

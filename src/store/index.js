import thunk from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export default function configureAppStore(initialState) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
        preloadedState: initialState
    });
};

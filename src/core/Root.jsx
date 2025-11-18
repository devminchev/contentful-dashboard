import axios from 'axios';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from '../store';
import Routes from './Routes';
import { GraphQlProvider } from '../Context/GraphQlProvider';

window.axios = axios;

const store = configureStore();
const Root = (props) => {
    return (
        <Provider store={store}>
            <Router {...props}>
                <GraphQlProvider>
                    <Routes store={store} />
                </GraphQlProvider>
            </Router>
        </Provider>
    );
};

export default Root;

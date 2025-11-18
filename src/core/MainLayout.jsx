import React, { useState } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import { useVentures } from '../hooks';
import { SPACE_LOCALE } from '../services/ContentfulConfig';

import routes from '../routes';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayoutStyle = styled.div`
    padding: 1px 5px;
    background: #020a18;
    min-height: 100vh;
    color: white;
`;

const MainLayout = props => {
    useVentures(SPACE_LOCALE);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleSidebarToggle = (isOpen) => {
        setSidebarOpen(isOpen);
    };

    return (
        <StyleSheetManager shouldForwardProp={propName => isValidProp(propName)}>
            <MainLayoutStyle>
                <Header setSidebarOpen={setSidebarOpen} />
                <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} items={routes()} />
                {props.children}
            </MainLayoutStyle>
        </StyleSheetManager>

    );
};

export default MainLayout;

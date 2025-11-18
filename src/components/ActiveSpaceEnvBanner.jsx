// src/components/SpaceEnvBanner.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSDK } from '@contentful/react-apps-toolkit';

// A styled banner with dynamic gradient: red gradient on master, blue gradient otherwise
const Banner = styled.div`
  background: ${props =>
        props.isMaster
            ? 'linear-gradient(90deg, #d9534f 0%, #c9302c 100%)'
            : 'linear-gradient(90deg, #004aad 0%, #007fff 100%)'};
  color: white;
  padding: 16px 24px;
  margin: 0 -24px 14px;    /* full–width inside your wrapper */
  font-size: 1.5rem;       /* 24px-ish */
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

const spaceIdToName = (spaceId) => {
    return spaceId === 'nw2595tc1jdx' ? 'Europe' : 'North America';
};

export default function SpaceEnvBanner() {
    const sdk = useSDK();
    const [spaceId, setSpaceId] = useState(() => spaceIdToName(sdk.ids.space));
    const [envId, setEnvId] = useState(sdk.ids.environment);
    const [envAlias, setEnvAlias] = useState(sdk.ids.environmentAlias);

    // Update when SDK IDs change
    useEffect(() => {
        setSpaceId(spaceIdToName(sdk.ids.space));
        setEnvId(sdk.ids.environment);
        setEnvAlias(sdk.ids.environmentAlias);
    }, [sdk.ids.space, sdk.ids.environment, sdk.ids.environmentAlias]);

    const currentEnv = envAlias || envId;
    const isMaster = currentEnv.trim().toLowerCase() === 'master';

    return (
        <Banner isMaster={isMaster}>
            You are currently on Contentful Space: <strong>{spaceId}</strong> &nbsp;|&nbsp;
            Environment: <strong>{currentEnv}</strong>
        </Banner>
    );
}

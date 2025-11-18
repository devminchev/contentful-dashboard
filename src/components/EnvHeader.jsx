// src/components/EnvHeader.jsx
import React from 'react';
import styled from 'styled-components';

// A styled header that colors itself based on the env
const ColoredHeader = styled.div`
  background: ${props => `linear-gradient(90deg, ${props.color} 0%, ${props.color} 100%)`};
  color: white;
  padding: 16px 24px;
  margin: 0 -24px 24px;    /* full–width inside your wrapper */
  font-size: 1.5rem;       /* 24px-ish */
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

// Map env string to a color
const getEnvColor = (env) => {
    const e = env.trim().toLowerCase();
    if (['naprod', 'production', 'prod'].includes(e)) return '#d9534f';   // red
    if (['nastg', 'nastaging', 'staging', 'stg'].includes(e)) return '#ff764a';   // orange
    if (['nadev', 'dev'].includes(e)) return '#5cb85c';   // green
    return '#004aad'; // fallback blue
};

// Utility to capitalize first letter and lowercase the rest
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * EnvHeader shows a label and environment name, with coloring based on env.
 * If env starts with 'na', displays 'NA <Suffix>'.
 * Otherwise, prefixes 'EU <Env>'.
 */
export default function EnvHeader({ env, label = 'You are currently on OpenSearch Environment' }) {
    const color = getEnvColor(env);

    const normalized = env.trim();
    const lower = normalized.toLowerCase();
    let displayEnv;
    let displaySymbol;

    if (lower.startsWith('na')) {
        // strip the 'na' prefix and format the rest
        const suffix = lower.slice(2).replace(/[-_]/g, ' ').trim();
        displayEnv = `North America ${capitalize(suffix)}`;
        displaySymbol = `🇺🇸`
    } else {
        displayEnv = `Europe ${capitalize(normalized)}`;
        displaySymbol = `🇬🇧🇪🇺`

    }

    return (
        <ColoredHeader color={color}>
            {label} : {displaySymbol} <strong>{displayEnv}</strong>
        </ColoredHeader>
    );
}

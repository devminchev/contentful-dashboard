import axios from 'axios';

const TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
const contentfulManagement = require("contentful-management");

export const CONTENTFUL_CLIENT = contentfulManagement.createClient({
    accessToken: TOKEN,
});

export let SPACE_CLIENT = null;
export let SPACE_ENVIRONMENT_CLIENT = null;
export let GraphQlClient = null;
export let GraphQlHeaders = {};
export let SPACE_LOCALE = '';

export const setupContentfulService = async (environments, spaceId) => {
    try {
        console.log('🚀 Setting up Contentful service...');
        console.log('  Management Environment:', environments.management);
        console.log('  GraphQL Environment:', environments.graphql);
        console.log('  Space ID:', spaceId);

        SPACE_CLIENT = await CONTENTFUL_CLIENT.getSpace(spaceId);
        console.log('✅ Space client created successfully');

        // Try to get the management environment with detailed error handling
        try {
            SPACE_ENVIRONMENT_CLIENT = await SPACE_CLIENT.getEnvironment(environments.management);
            console.log('✅ Management environment client created successfully for:', environments.management);
        } catch (envError) {
            console.error('❌ Failed to get management environment:', environments.management);
            console.error('Environment error details:', envError);

            // Try to get available environments for debugging
            try {
                const environmentsList = await SPACE_CLIENT.getEnvironments();
                console.log('🏛️ Available environments in space:',
                    environmentsList.items.map(env => ({ id: env.sys.id, name: env.name }))
                );
            } catch (listError) {
                console.error('Could not list environments:', listError);
            }

            throw envError;
        }

        SPACE_LOCALE = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        console.log('🌍 Using locale:', SPACE_LOCALE);

        GraphQlHeaders = {
            Authorization: `Bearer ${spaceId === 'nw2595tc1jdx' ? process.env.REACT_APP_GRAPHQL_TOKEN_UK : process.env.REACT_APP_GRAPHQL_TOKEN_US}`,
            'Content-Type': 'application/json'
        };

        // Use the GraphQL environment for GraphQL API calls
        const graphqlUrl = `https://graphql.contentful.com/content/v1/spaces/${SPACE_CLIENT?.sys?.id}/environments/${environments.graphql}`;
        console.log('🔗 GraphQL URL:', graphqlUrl);

        GraphQlClient = axios.create({
            baseURL: graphqlUrl
        });

        console.log('✅ Contentful service setup complete');
        console.log('  Management API will use environment:', environments.management);
        console.log('  GraphQL API will use environment:', environments.graphql);

    } catch (err) {
        console.error('🚨 Contentful setup failed:');
        console.error('Error details:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        throw err; // Re-throw so the caller knows it failed
    };
};

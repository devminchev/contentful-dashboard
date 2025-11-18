import React, { useMemo } from 'react';
import { locations } from '@contentful/app-sdk';
import ConfigScreen from './locations/ConfigScreen';
import Page from './locations/Page';
import Home from './locations/Home';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useSetApi } from './hooks';
import { OpenSearchProvider } from './Context/OpenSearchProvider';

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_PAGE]: Page,
  [locations.LOCATION_HOME]: Home,
};

const App = () => {
  const sdk = useSDK();

  // Handle environment vs alias properly
  // The SDK sometimes provides invalid environment IDs, so we need to be smart about this
  const managementEnvironment = sdk.ids.environmentAlias || sdk.ids.environment;

  // For GraphQL: Use alias if available, otherwise use environment
  // This handles cases where the SDK gives us a non-existent environment ID
  const graphqlEnvironment = sdk.ids.environmentAlias || sdk.ids.environment;

  console.log('🔍 Contentful SDK Environment Info:');
  console.log('  Space ID:', sdk.ids.space);
  console.log('  Environment (actual):', sdk.ids.environment);
  console.log('  Environment Alias:', sdk.ids.environmentAlias);
  console.log('  Using for Management API:', managementEnvironment);
  console.log('  Using for GraphQL API:', graphqlEnvironment);
  console.log('  Full SDK IDs:', sdk.ids);

  // Pass both environment values to the hook
  const isApiSet = useSetApi({
    management: managementEnvironment,
    graphql: graphqlEnvironment
  }, sdk.ids.space);

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component && isApiSet ?
    <OpenSearchProvider>
      <Component />
    </OpenSearchProvider> :
    null;
};

export default App;

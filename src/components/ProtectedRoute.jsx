import React from 'react';
import { Note, Heading, Text } from '@contentful/f36-components';
import { useRouteAccess } from '../hooks/useRouteAccess';
import {
  PageWrapper,
} from '../common/styles/mixins';

const ProtectedRoute = ({ children, route }) => {
  const { hasRouteAccess } = useRouteAccess();

  if (!hasRouteAccess(route)) {
    return (
      <PageWrapper>
        <Note variant="negative">
          <Heading as="h3" marginBottom="spacingS">
            Access Restricted
          </Heading>
          <Text as="p" marginBottom="spacingS">
            You do not have permission to access <strong>"{route?.name}"</strong>.
          </Text>
          {route?.meta?.description && (
            <Text as="p" fontSize="fontSizeS" fontColor="gray600">
              {route.meta.description}
            </Text>
          )}
        </Note>
      </PageWrapper>
    );
  }

  return children;
};

export default ProtectedRoute;

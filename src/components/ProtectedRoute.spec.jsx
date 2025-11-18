import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

import { useRouteAccess } from '../hooks/useRouteAccess';

// Mock styled-components to prevent import issues
jest.mock('styled-components', () => ({
  __esModule: true,
  default: () => () => 'div',
}));

// Mock the routes to prevent styled-component import issues
jest.mock('../routes', () => ({
  ROUTE_PERMISSIONS: {
    RESTRICTED_NIGHTWATCH: 'restrictedNightWatch'
  },
  routes: () => []
}));

// Mock the useRouteAccess hook
jest.mock('../hooks/useRouteAccess', () => ({
  useRouteAccess: jest.fn(),
}));

// Mock Contentful F36 components with correct data-test-id attribute
jest.mock('@contentful/f36-components', () => ({
  Note: ({ children, variant, ...props }) => (
    <div data-test-id="note" data-variant={variant} {...props}>
      {children}
    </div>
  ),
  Heading: ({ children, as, marginBottom, ...props }) => (
    <div data-test-id="heading" data-as={as} data-margin-bottom={marginBottom} {...props}>
      {children}
    </div>
  ),
  Text: ({ children, as, marginBottom, fontSize, fontColor, ...props }) => (
    <div
      data-test-id="text"
      data-as={as}
      data-margin-bottom={marginBottom}
      data-font-size={fontSize}
      data-font-color={fontColor}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock PageWrapper with correct data-test-id attribute
jest.mock('../common/styles/mixins', () => ({
  PageWrapper: ({ children }) => (
    <div data-test-id="page-wrapper">{children}</div>
  ),
}));

describe('ProtectedRoute', () => {
  const mockHasRouteAccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouteAccess.mockReturnValue({
      hasRouteAccess: mockHasRouteAccess,
    });
  });

  describe('when user has access to the route', () => {
    beforeEach(() => {
      mockHasRouteAccess.mockReturnValue(true);
    });

    it('should render children when user has access', () => {
      const TestChild = () => <div data-test-id="test-child">Test Content</div>;
      const mockRoute = { name: 'Test Route' };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument();
    });

    it('should call hasRouteAccess with the provided route', () => {
      const TestChild = () => <div>Test Content</div>;
      const mockRoute = { name: 'Test Route', permission: 'restrictedNightWatch' };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(mockHasRouteAccess).toHaveBeenCalledWith(mockRoute);
    });
  });

  describe('when user does not have access to the route', () => {
    beforeEach(() => {
      mockHasRouteAccess.mockReturnValue(false);
    });

    it('should render access restriction message and not render children', () => {
      const TestChild = () => <div data-test-id="restricted-child">Restricted Content</div>;
      const mockRoute = { name: 'Restricted Route' };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(screen.queryByTestId('restricted-child')).not.toBeInTheDocument();
    });

    it('should display the route name in the restriction message', () => {
      const TestChild = () => <div>Restricted Content</div>;
      const mockRoute = { name: 'Super Secret Route' };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.getByText(/You do not have permission to access/)).toBeInTheDocument();
      expect(screen.getByText(/"Super Secret Route"/)).toBeInTheDocument();
    });
  });

  describe('route description handling', () => {
    beforeEach(() => {
      mockHasRouteAccess.mockReturnValue(false);
    });

    it('should display route description when available', () => {
      const TestChild = () => <div>Restricted Content</div>;
      const mockRoute = {
        name: 'Restricted Route',
        meta: {
          description: 'This route contains sensitive operations'
        }
      };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.getByText('This route contains sensitive operations')).toBeInTheDocument();
    });

    it('should not display description when not available', () => {
      const TestChild = () => <div>Restricted Content</div>;
      const mockRoute = { name: 'Restricted Route' };

      render(
        <ProtectedRoute route={mockRoute}>
          <TestChild />
        </ProtectedRoute>
      );

      expect(screen.queryByText(/This route contains/)).not.toBeInTheDocument();
    });
  });
});

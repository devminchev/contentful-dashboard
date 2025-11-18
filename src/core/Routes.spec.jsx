import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Routes from './Routes';

import { useRouter } from '../hooks';
import routesList from '../routes';

// Mock the useRouter hook
jest.mock('../hooks', () => ({
  useRouter: jest.fn(),
}));

// Mock the routes list
jest.mock('../routes', () => jest.fn());

// Mock MainLayout
jest.mock('./MainLayout', () => ({ children }) => (
  <div data-test-id="main-layout">{children}</div>
));

// Mock ProtectedRoute
jest.mock('../components/ProtectedRoute', () => ({ children, route }) => (
  <div data-test-id="protected-route" data-route-name={route?.name}>
    {children}
  </div>
));

// Mock NotFound
jest.mock('./NotFound', () => () => (
  <div data-test-id="not-found">Not Found Page</div>
));

// Mock components for routes
const MockHomeComponent = () => <div data-test-id="home-component">Home</div>;

describe('Routes', () => {
  const mockLocation = { pathname: '/' };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({
      location: mockLocation,
      pathname: '/',
      go: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      params: {},
      query: {},
    });
  });

  it('should render MainLayout wrapper', () => {
    routesList.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('should render matching route with ProtectedRoute wrapper', () => {
    const mockRoutes = [
      {
        name: 'Home',
        path: '/',
        exact: true,
        component: MockHomeComponent,
        meta: { title: 'Home' }
      }
    ];

    routesList.mockReturnValue(mockRoutes);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('protected-route')).toHaveAttribute('data-route-name', 'Home');
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('should call routesList to get routes configuration', () => {
    routesList.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    );

    expect(routesList).toHaveBeenCalled();
  });

  it('should use location from useRouter hook', () => {
    const customLocation = { pathname: '/custom' };
    useRouter.mockReturnValue({
      location: customLocation,
      pathname: '/custom',
      go: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      params: {},
      query: {},
    });

    routesList.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    );

    expect(useRouter).toHaveBeenCalled();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});

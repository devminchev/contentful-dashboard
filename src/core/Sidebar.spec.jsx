import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

import { useRouteAccess } from '../hooks/useRouteAccess';

// Mock the useRouteAccess hook
jest.mock('../hooks/useRouteAccess', () => ({
  useRouteAccess: jest.fn(),
}));

// Mock the useClickOutside hook
jest.mock('../hooks', () => ({
  useClickOutside: jest.fn(),
}));

// Mock styled components
jest.mock('./Sidebar.style', () => ({
  SidebarContainer: ({ children, isOpen }) => (
    <div data-test-id="sidebar-container" data-is-open={isOpen}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }) => (
    <div data-test-id="sidebar-content">{children}</div>
  ),
  SidebarItemList: ({ children }) => (
    <ul data-test-id="sidebar-item-list">{children}</ul>
  ),
  SidebarItemName: ({ children }) => (
    <span data-test-id="sidebar-item-name">{children}</span>
  ),
}));

describe('Sidebar', () => {
  const mockHasRouteAccess = jest.fn();
  const mockOnToggle = jest.fn();

  const mockRoutes = [
    { name: 'Home', path: '/', permission: null },
    { name: 'Admin Panel', path: '/admin', permission: 'restrictedNightWatch' },
    { name: 'Public Page', path: '/public', permission: null }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useRouteAccess.mockReturnValue({
      hasRouteAccess: mockHasRouteAccess,
    });
  });

  it('should render visible routes', () => {
    // Mock to allow access to Home and Public Page, but deny Admin Panel
    mockHasRouteAccess.mockImplementation((route) => {
      return route.name !== 'Admin Panel';
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onToggle={mockOnToggle} items={mockRoutes} />
      </MemoryRouter>
    );

    // Visible routes should be rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Public Page')).toBeInTheDocument();
  });

  it('should not render non-visible routes', () => {
    // Mock to allow access to Home and Public Page, but deny Admin Panel
    mockHasRouteAccess.mockImplementation((route) => {
      return route.name !== 'Admin Panel';
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onToggle={mockOnToggle} items={mockRoutes} />
      </MemoryRouter>
    );

    // Non-visible route should not be rendered
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});

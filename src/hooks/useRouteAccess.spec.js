import { renderHook } from '@testing-library/react';
import { useRouteAccess } from './useRouteAccess';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ROUTE_PERMISSIONS } from '../routes';

// Mock the Contentful SDK
jest.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: jest.fn(),
}));

// Mock the routes constants
jest.mock('../routes', () => ({
  ROUTE_PERMISSIONS: {
    RESTRICTED_NIGHTWATCH: 'restrictedNightWatch',
    RESTRICTED_ADMIN: 'restrictedAdmin',
    RESTRICTED_SUPER_USER: 'restrictedSuperUsers'
  }
}));

// Mock the userRoles with test data
jest.mock('../constants/userRoles', () => ({
  USER_ROLES: {
    NIGHTWATCH_TEAM: '6me8C5DWHxZHgzXmORBE9f',
    SUPER_USERS: ['dGVzdC5zdXBlcnVzZXJAZXhhbXBsZS5jb20=']
  }
}));

describe('useRouteAccess', () => {
  const mockSDK = {
    user: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    useSDK.mockReturnValue(mockSDK);
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Admin users', () => {
    it('should grant access to restricted routes for admin users', () => {
      mockSDK.user = {
        email: 'test.superuser@example.com',
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(true);
      expect(result.current.isNightwatchTeam).toBe(false);
      expect(result.current.restrictedAdminAccess).toBe(true);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(true);
    });

    it('should grant access to unrestricted routes for admin users', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const unrestrictedRoute = { permission: null };

      expect(result.current.hasRouteAccess(unrestrictedRoute)).toBe(true);
    });

    it('should deny access to restricted nightwatch routes for admin users without super user access', () => {
      mockSDK.user = {
        email: 'regular.admin@example.com', // Not in SUPER_USERS
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(true);
      expect(result.current.restrictedAdminAccess).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(false);
    });

    it('should grant access to restricted admin routes for admin users', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_ADMIN };

      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(true);
    });
  });

  describe('Nightwatch users', () => {
    it('should grant access to restricted admin routes for nightwatch users', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: false,
          roles: []
        },
        teamMemberships: [
          {
            admin: false,
            sys: {
              type: "TeamMembership",
              id: "3lXdXbToePGYhRYfUXuJ5T",
              version: 0,
              team: {
                sys: {
                  type: "Link",
                  linkType: "Team",
                  id: "6me8C5DWHxZHgzXmORBE9f"
                }
              }
            }
          }
        ]
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_ADMIN };

      expect(result.current.hasAdminRole).toBe(false);
      expect(result.current.isNightwatchTeam).toBe(true);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(true);
    });

    it('should grant access to restricted nightwatch routes for nightwatch users (even without super user access)', () => {
      mockSDK.user = {
        email: 'nw_team.user@example.com', // Not in SUPER_USERS
        spaceMembership: {
          admin: false,
          roles: []
        },
        teamMemberships: [
          {
            admin: false,
            sys: {
              type: "TeamMembership",
              id: "3lXdXbToePGYhRYfUXuJ5T",
              version: 0,
              team: {
                sys: {
                  type: "Link",
                  linkType: "Team",
                  id: "6me8C5DWHxZHgzXmORBE9f"
                }
              }
            }
          }
        ]
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(false);
      expect(result.current.isNightwatchTeam).toBe(true);
      expect(result.current.restrictedAdminAccess).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(true); // Nightwatch team members have access
    });

    it('should deny access to restricted nightwatch routes for non-nightwatch, non-super users', () => {
      mockSDK.user = {
        email: 'regular.user@example.com', // Not in SUPER_USERS
        spaceMembership: {
          admin: false,
          roles: []
        },
                 // No teamMemberships - not part of nightwatch team
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(false);
      expect(result.current.isNightwatchTeam).toBe(false);
      expect(result.current.restrictedAdminAccess).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(false);
    });
  });

  describe('Regular users', () => {
    it('should deny access to restricted routes for regular users', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: false,
          roles: [{ name: 'Editor' }, { name: 'Viewer' }]
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(false);
      expect(result.current.isNightwatchTeam).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(false);
    });

    it('should grant access to unrestricted routes for regular users', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: false,
          roles: [{ name: 'Editor' }]
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const unrestrictedRoute = { permission: null };
      const undefinedPermissionRoute = {};

      expect(result.current.hasRouteAccess(unrestrictedRoute)).toBe(true);
      expect(result.current.hasRouteAccess(undefinedPermissionRoute)).toBe(true);
    });
  });

  describe('Super users', () => {
    it('should grant access to restricted super user routes', () => {
      mockSDK.user = {
        email: 'test.superuser@example.com',
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_SUPER_USER };

      expect(result.current.restrictedAdminAccess).toBe(true);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(true);
    });

    it('should deny access to restricted super user routes for non-super users', () => {
      mockSDK.user = {
        email: 'regular.user@example.com',
        spaceMembership: {
          admin: true,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_SUPER_USER };

      expect(result.current.restrictedAdminAccess).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing spaceMembership', () => {
      mockSDK.user = {};

      const { result } = renderHook(() => useRouteAccess());
      const restrictedRoute = { permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH };

      expect(result.current.hasAdminRole).toBe(false);
      expect(result.current.isNightwatchTeam).toBe(false);
      expect(result.current.hasRouteAccess(restrictedRoute)).toBe(false);
    });

    it('should handle missing teamMemberships', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: false
        }
      };

      const { result } = renderHook(() => useRouteAccess());

      expect(result.current.isNightwatchTeam).toBe(false);
    });
  });

  describe('Route permission types', () => {
    it('should handle unknown permission types as unrestricted', () => {
      mockSDK.user = {
        spaceMembership: {
          admin: false,
          roles: []
        }
      };

      const { result } = renderHook(() => useRouteAccess());
      const unknownPermissionRoute = { permission: 'unknownPermission' };

      expect(result.current.hasRouteAccess(unknownPermissionRoute)).toBe(true);
    });
  });
});

import { useSDK } from '@contentful/react-apps-toolkit';
import { useMemo } from 'react';
import { ROUTE_PERMISSIONS } from '../routes';
import { USER_ROLES } from '../constants/userRoles';
import { superUserAccess } from '../utils/superUserAccess';

export const useRouteAccess = () => {
  const sdk = useSDK();
  const user = sdk.user;

  const accessInfo = useMemo(() => {
    const hasAdminRole = user.spaceMembership?.admin || false;
    const teams = user?.teamMemberships || [];
    const userTeams = teams.map(team => team?.sys?.team?.sys?.id);
    const isNightwatchTeam = userTeams.includes(USER_ROLES.NIGHTWATCH_TEAM);
    const restrictedAdminAccess = superUserAccess(user);

    console.log('ContentFulDashBoard > userSettings', `allowedTeam: ${isNightwatchTeam}, admin: ${hasAdminRole}, additionalPermissions: ${restrictedAdminAccess}`);

    return {
      hasAdminRole,
      isNightwatchTeam,
      restrictedAdminAccess
    };
  }, [user]);

  const hasRouteAccess = useMemo(() => (route) => {
    const { permission } = route;

    switch (permission) {
      case ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH:
        return accessInfo.isNightwatchTeam || accessInfo.restrictedAdminAccess;
      case ROUTE_PERMISSIONS.RESTRICTED_SUPER_USER:
        return accessInfo.restrictedAdminAccess;
      case ROUTE_PERMISSIONS.RESTRICTED_ADMIN:
        return accessInfo.hasAdminRole || accessInfo.isNightwatchTeam;
      default:
        return true;
    }
  }, [accessInfo]);

  return {
    ...accessInfo,
    hasRouteAccess
  };
};

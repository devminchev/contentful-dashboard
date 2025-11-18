import { USER_ROLES } from '../constants/userRoles';

/**
 * Simple base64 encoding for email
 */
const emailToBase64 = (email) => {
    return btoa(email.trim().toLowerCase());
};

/**
 * Synchronous super user access check using base64
 */
export const superUserAccess = (user) => {
    if (!user) return false;

    const { email, spaceMembership } = user;

    if (!email) return false;

    // 1) Encode current user email to base64
    const encodedEmail = emailToBase64(email);

    // 2) Check if base64 email is in our SUPER_USERS array
    const allowedEmail = USER_ROLES.SUPER_USERS.includes(encodedEmail);

    // 3) Check admin role
    const hasAdminRole = spaceMembership?.admin === true;

    return hasAdminRole && allowedEmail;
};

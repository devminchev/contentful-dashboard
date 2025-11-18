import { useState, useEffect } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { sha256Base64 } from '../utils/cryptoEncrypt';
import { allowedUserHashes } from '../constants/allowedUserHashes';

/**
 * Returns `true` if the current user:
 *   • Their email’s SHA256/Base64 is in the allow-list
 *   • AND they have the “admin” flag on their Space membership
 */
export const useFilteredAdminAccess = () => {
    const sdk = useSDK();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const { email, spaceMembership } = sdk.user;

            // 1) Check email against your precomputed hashes
            const hash = await sha256Base64(email);
            const allowedEmail = allowedUserHashes.includes(hash);

            // 2) Check the “admin” flag on their Space membership
            //    (adjust as needed if you use roles instead of a boolean)
            const hasAdminRole = spaceMembership?.admin === true;

            if (mounted) {
                setIsAdmin(allowedEmail && hasAdminRole);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [sdk]);

    return isAdmin;
}

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { setupContentfulService } from "../services/ContentfulConfig";

function useSetApi(environments, space) {
    const [isApiSet, setIsApiSet] = useState(false);

    useEffect(() => {
        async function load() {
            // Handle both old single environment format and new dual environment format
            if (typeof environments === 'string') {
                // Legacy format - use same environment for both
                await setupContentfulService({
                    management: environments,
                    graphql: environments
                }, space);
            } else {
                // New format with separate management and graphql environments
                await setupContentfulService(environments, space);
            }
            setIsApiSet(true);
        };

        load();
    }, []);

    return isApiSet;
};

export default useSetApi;

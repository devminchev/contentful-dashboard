import { useEffect, useState } from 'react';

function useTabVisibility(onTabVisible) {
    const [isTabVisible, setIsTabVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setIsTabVisible(true);
                if (onTabVisible) {
                    onTabVisible();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [onTabVisible]);

    return isTabVisible;
};

export default useTabVisibility;

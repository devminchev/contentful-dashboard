import { useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

function useRouter() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    return useMemo(() => {
        return {
            go: (path) => navigate(path),
            goBack: () => navigate(-1),
            replace: (path) => navigate(path, { replace: true }),
            pathname: location.pathname,
            params,
            query: {
                ...params
            },
            location
        };
    }, [params, location, navigate]);
}

export default useRouter;

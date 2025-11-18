import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRouter } from '../hooks';
import MainLayout from './MainLayout';
import routesList from '../routes';
import NotFound from './NotFound';
import ProtectedRoute from '../components/ProtectedRoute';


const RoutePage = () => {
    const { location } = useRouter();

    return (
        <MainLayout>
            <Routes location={location}>
                {routesList().map(({ component: Component, meta, ...props }) => {
                    return (
                        <Route
                            {...props}
                            key={props.name}
                            element={
                                <>
                                    {/* <DocumentMeta {...meta} /> */}
                                    <ProtectedRoute route={props}>
                                        <Component />
                                    </ProtectedRoute>
                                </>
                            }
                        />
                    );
                })}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </MainLayout>
    );
};

export default RoutePage;

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../hooks';
import { SidebarContainer, SidebarContent, SidebarItemList, SidebarItemName } from './Sidebar.style';
import { useRouteAccess } from '../hooks/useRouteAccess';

const Sidebar = ({ isOpen, onToggle, items:routes }) => {
    const sidebarRef = useRef(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const { hasRouteAccess } = useRouteAccess();


    useClickOutside(sidebarRef, () => {
        if (isOpen) {
            onToggle(false);
        };
    });

    const visibleRoutes = routes.filter(route => hasRouteAccess(route));

    const handleItemClick = (item) => {
        setSelectedRouteIndex(item);
    };

    return (
        <SidebarContainer isOpen={isOpen} ref={sidebarRef}>
            <SidebarContent>
                <SidebarItemList>
                    {visibleRoutes.map((route, index) => (
                        <li key={index} onClick={() => handleItemClick(index)}>
                            <Link to={route.path} className={index === selectedRouteIndex ? 'active' : ''}>
                                <SidebarItemName>{route.name}</SidebarItemName>
                            </Link>
                        </li>
                    ))}
                </SidebarItemList>
            </SidebarContent>
        </SidebarContainer>
    )
};

export default Sidebar;

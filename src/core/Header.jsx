import React from 'react';

import { HeaderStyle, MenuBtn, MenuBtnIcon, TitleStyled } from './Header.style';

const Header = ({ setSidebarOpen }) => {
    return (
        <HeaderStyle>
            <MenuBtn onClick={() => setSidebarOpen(prev => !prev)}>
                <MenuBtnIcon />
            </MenuBtn>
            <TitleStyled>Editor Admin Panel</TitleStyled>
        </HeaderStyle>
    );
};

export default Header;

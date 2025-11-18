import styled from 'styled-components';

export const SidebarContainer = styled.div`
    position: fixed;
    top: 0;
    background: #0f1624;
    padding: 10px;
    border-radius: 5px;
    left: ${props => (props.isOpen ? '0' : '-300px')};
    width: 300px;
    transition: left 0.3s;
    z-index: 100;
`;

export const SidebarContent = styled.div`
    height: 100vh;
    margin: 0 0 5px 0;
`;

export const SidebarItemHeader = styled.button`
    width: 100%;
    display: block;
    height: 60px;
    border: none;
    overflow: hidden;
    padding: 0 5px 0 0;
    border-radius: 5px;
    background-image: linear-gradient(to bottom, #494f57, #2f3338);
`;

export const SidebarItemText = styled.span`
    display: block;
    width: calc(100% - 135px);
    float: left;
    line-height: 60px;
    padding: 0 0 0 10px;
    text-align: left;
    font-size: em(18);
    text-transform: uppercase;
    font-weight: 900;
`;

export const SidebarItemList = styled.ul`
    padding: 0;
    margin: 0;

    li {
        list-style: none;
        margin-bottom: 10px;

        a {
            display: block;
            position: relative;
            width: 100%;
            height: 50px;
            line-height: 50px;
            padding: 0 15px;
            margin: 2px 0;
            overflow: hidden;
            color: #fff;
            border-radius: 5px;
            @include box-shadow-inset(0, 0, 1px, 0, false);
            background-image: linear-gradient(to bottom, #242d3d, #0a0e17);
            text-decoration: none;

            &:hover, &.active {
                background-image: linear-gradient(to bottom, #1d2b5b, #314994);
            }

            &:after {
                content: '';
                position: absolute;
                display: block;
                top: 0;
                left: 0;
                right: 0;
                height: 25px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }
`;


export const SidebarItemName = styled.span`
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

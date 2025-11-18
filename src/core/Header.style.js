import styled from 'styled-components';

export const HeaderStyle = styled.header`
  display: flex;
  align-items: center;
  background-color: rgb(12, 20, 28);
  color: white;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  position: fixed;
  width: 100%;
  height: 80px;
  z-index: 99;
`;

export const MenuIconStyle = styled.div`
  font-size: 2rem;
  cursor: pointer;
`;

export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: white;
    display: block;
    width: 100%;
    padding: 0;
    cursor: pointer;

    &:hover {
        background: #1e212c;
    }
`;

export const MenuBtn = styled.button`
    background: transparent;
    border: none;
    color: white;
    display: block;
    padding: 0;
    cursor: pointer;
    width: 50px;
    height: 50px;

    &:hover {
        background: #1e212c;
    }
`;

export const MenuBtnIcon = styled.span`
    position: relative;
    height: 4px;
    width: 40px;
    display: block;
    margin: 0 auto;
    background: white;
    transition: transform ease .2s;
    border-radius: 2px;

    &:after {
        content: '';
        position: absolute;
        display: block;
        width: 40px;
        height: 4px;
        background: white;
        top: -10px;
    }

    &:before {
        content: '';
        position: absolute;
        display: block;
        width: 40px;
        height: 4px;
        background: white;
        top: 10px;
    }

    ${MenuBtn}:hover & {
        background: transparent;
        &:after {
            top: -9px;
            transform: translateY(9px) rotate(-45deg);
        }
        &:before {
            bottom: -9px;
            transform: translateY(-9px) rotate(45deg);
        }
    }

`;


export const TitleStyled = styled.h3`
    margin: 0 1rem;
    width: 100%;
    justify-content: center;
    display: flex;
`;

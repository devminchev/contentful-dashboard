import styled, { css } from 'styled-components';

export const ListContainer = styled.div`
    width: 100%;
`;

export const ColumnListContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px;
    position: relative;
`;

export const RowWrapper = styled.div`
    display: flex;
    margin: 2px;
`;

export const SiteGameHeader = styled.header`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 900;
    font-size:24px;
    padding:10px;
    background-image: linear-gradient(to right, #263a7b, #020a18 95%);
    border-radius: 3px;
    text-transform: uppercase;
    width: 100%;
`;

export const ToggleContentWrapper = styled.div`
    display: flex;
    position: relative;
    padding: 0;
    margin: 0;
    overflow: hidden;
    transition: max-height 1s;
    max-height: 0px;

    ${({ isOpen }) => isOpen && css`max-height: 100px`}
`;

export const SelectButton = styled.button`
    width: 250px;
    height: 60px;
    line-height: 60px;
    border: none;
    background-image: linear-gradient(to bottom, #a3a9b5, #697182);
    border-radius: 3px;
    font-size: 16px;
    color: #000;
    margin-bottom: 20px;

    &:focus, &:active {
        outline: 0;
    }
    &:hover {
        background: #fff;
    }
`;

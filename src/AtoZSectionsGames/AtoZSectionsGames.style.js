import styled from 'styled-components';

export const RefreshBtn = styled.button`
    width: 200px;
    align-self: center;
    height: 50px;
    color: #fff;
    border: none;
    transition: all ease .05s;
    box-shadow: inset 0 0 1px 0 rgba(255, 255, 255, .1);
    background-image: linear-gradient(to right, #0a334d, #3b6b9e);
    border-radius: 30px;
    text-transform: uppercase;
    margin-bottom: 20px;

    &:hover,
    &.active {
        box-shadow: inset 0 0 49px 0 #000;
        background-image: linear-gradient(to right, #3b6b9e, #6dafe5);
    }

    &:disabled {
        background: #808080;
        box-shadow: none;
        cursor: not-allowed;
        &:hover {
            box-shadow: none;
            background: #808080;
        }
    }
`;

import styled from 'styled-components';

export const ReleaseInfoWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const ReleaseItemsRow = styled.div`
    display: flex;
    width: 100%;
`;

export const ReleaseItemWrapper = styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    box-sizing: border-box;
`;

export const ReleaseItemHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 900;
    font-size:24px;
    padding:10px;
    background-image: linear-gradient(to right, #263a7b 80%, #020a18);
    border-radius: 3px;
    text-transform: uppercase;
    width: 100%;
`;

export const ReleaseItemDetail = styled.div`
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 3px;
    background: linear-gradient(to right, #2f3644 80%, #020a18);
    color: #fff;
    border: none;
    border-radius: 5px;
`;

export const ReleaseBtn = styled.button`
    width: 300px;
    align-self: center;
    height: 80px;
    color: #fff;
    border: none;
    transition: all ease .05s;
    box-shadow: inset 0 0 1px 0 rgba(255, 255, 255, .1);
    // background-image: linear-gradient(to right, #ff7f50, #ff8c00);
    background-image: linear-gradient(to right, #0a334d, #3b6b9e);
    border-radius: 30px;
    text-transform: uppercase;

    &:hover,
    &.active {
        box-shadow: inset 0 0 49px 0 #000;
        // background-image: linear-gradient(to right, #ff8c00, #ffa500);
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

export const RowBtnWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;
`;

import styled from 'styled-components';

export const Input = styled.input`
    width: 20%;
    height: 40px;
    line-height: 40px;
    padding: 10px;
    border: none;
    transition: all ease .2s;
    color: #fff;
    opacity: 0.6;
    background-image: linear-gradient(to bottom, #a3a9b5, #697182 95%);
    border-radius: 3px;
    text-align: center;
    font-size: 16px;
    margin: 2px;

    &:focus {
      opacity: 0.85;
      outline: 0;
      color: #fff;
    }

    &::placeholder,
    &::-webkit-input-placeholder  {
        color: #fff;
        font-style: italic;
        font-weight: 600;
        font-size: 10px;
    }
`;

export const MultipleInputBtn = styled.button`
    height: 40px;
    line-height: 40px;
    border: none;
    background-image: linear-gradient(to bottom, #a3a9b5, #697182);
    border-radius: 3px;
    font-size: 14px;
    color: #000;
    margin: 2px;

    &:focus, &:active {
        outline: 0;
    }
    &:hover {
        background: #fff;
    }
`;

export const MultipleInputContainer = styled.div`
    width: 100%;
    position: relative;
    margin: 10px 0;
`;

export const MultipleInputLabel = styled.label`
    line-height: 40px;
`;

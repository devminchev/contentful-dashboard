import styled from 'styled-components';
import searchIcon from './search-icon.png';

export const SearchInput = styled.input`
    width: 100%;
    height: 60px;
    line-height: 60px;
    padding: 0 70px 0 10px;
    border: none;
    transition: all ease .2s;
    color: #fff;
    opacity: 0.6;
    background-image: linear-gradient(to bottom, #a3a9b5, #697182 95%);
    border-radius: 3px;
    text-align: center;
    text-transform: uppercase;
    font-size: 20px;

    &:focus {
      opacity: 0.85;
      outline: 0;
      color: #fff;
    }

    &::placeholder,
    &::-webkit-input-placeholder  {
        color: #fff;
        font-style: italic;
        font-weight: 900;
        font-size: 12px;
    }
`;

export const SearchBtn = styled.button`
    width: 60px;
    height: 60px;
    line-height: 60px;
    border: none;
    background-image: linear-gradient(to bottom, #a3a9b5, #697182);
    border-radius: 3px;

    &:focus, &:active {
        outline: 0;
    }
    &:hover {
        background: #fff;
    }
`;

export const SearchIcon = styled.span`
    display: block;
    height: 60px;
    background: url(${searchIcon}) no-repeat center;
`;

export const SearchForm = styled.div`
    width: 100%;
    position: relative;
    height: 60px;
    margin: 9px 0;
`;

export const SearchLabel = styled.label`
    width: 300px;
    line-height: 60px;
`;

export const SearchBtnContainer = styled.label`
    position: absolute;
    top: 0;
    right: 0;
`;

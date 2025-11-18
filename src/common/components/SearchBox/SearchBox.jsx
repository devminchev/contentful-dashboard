/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useState } from 'react';
import { SearchBtn, SearchBtnContainer, SearchForm, SearchIcon, SearchInput, SearchLabel } from './SearchBox.style';

const SearchBox = ({ search, disabled, minInputLength = 3 }) => {
    const [value, setValue] = useState('');

    const handleSearch = useCallback(() => {
        search(value);
    }, [value]);

    return (
        <SearchForm>
            <SearchLabel>
                <SearchInput type="text" placeholder="Search SiteGame ID ..." value={value} onChange={(event) => setValue(event.target.value)} />
            </SearchLabel>
            <SearchBtnContainer>
                <SearchBtn onClick={handleSearch} disabled={disabled || value.length < minInputLength}>
                    <SearchIcon></SearchIcon>
                </SearchBtn>
            </SearchBtnContainer>
        </SearchForm>
    );
}

export default SearchBox;

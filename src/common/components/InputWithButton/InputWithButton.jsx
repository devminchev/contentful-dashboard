import React from 'react';
import { Input, InputBtnContainer, InputButton, InputContainer, InputLabel } from './InputWithButton.style';

const InputWithButton = ({ value, onChange, onClick, placeholder, btnText, disabled }) => {
    return (
        <InputContainer>
            <InputLabel>
                <Input type="text" placeholder={placeholder} value={value} onChange={onChange} />
            </InputLabel>
            <InputBtnContainer>
                <InputButton onClick={onClick} disabled={disabled}>
                    {btnText}
                </InputButton>
            </InputBtnContainer>
        </InputContainer>
    );
}

export default InputWithButton;

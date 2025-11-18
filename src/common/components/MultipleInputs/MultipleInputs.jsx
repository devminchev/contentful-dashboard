import React from 'react';
import { Input, MultipleInputBtn, MultipleInputContainer } from './MultipleButton.style';

const MultipleInputs = ({ btnOnClick, inputs }) => {
    return (
        <MultipleInputContainer>
            {inputs.map((i, ind) => (
                <Input key={ind} type="text" placeholder={i.placeholder} value={i.value} onChange={i.onChange} />
            ))}

            <MultipleInputBtn onClick={btnOnClick}>
                Delete Cache Key
            </MultipleInputBtn>
        </MultipleInputContainer>
    );
}

export default MultipleInputs;

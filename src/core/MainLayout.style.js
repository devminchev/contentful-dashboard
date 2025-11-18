import styled from 'styled-components';
import { PageMainStyled } from '../common';

export const MainStyled = styled(PageMainStyled)`
    padding: 5px 20px 10px 20px;

    & > div {
        display: flex;
        justify-content: center;
    }
`;

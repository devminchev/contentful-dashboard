import { css, keyframes } from 'styled-components';

const bounce = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
`;

const bounceOut = keyframes`
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0);
    }
`;

const floatUp = keyframes`
	from {
        transform: translatey(0px);
        opacity: 0;
	}
	to {
        transform: translatey(-30px);
        opacity: 1;
	}
`;

const floatDown = keyframes`
	from {
        transform: translatey(-30px);
        opacity: 1;
    }
    to {
        transform: translatey(0px);
        opacity: 0;
	}
`;

export const bounceAnimation = css`
    ${bounce} 0.5s linear;
`;

export const bounceOutAnimation = css`
    ${bounceOut} 0.5s linear;
`;

export const floatUpAnimation = css`
    ${floatUp} 0.5s ease-in-out;
`;

export const floatDownAnimation = css`
    ${floatDown} 0.5s ease-in-out;
`;


export const scaleIn = keyframes`
    0% {
        transform: scaleY(0);
        transform-origin: 100% 0%;
        opacity: 1;
    }
    100% {
        transform: scaleY(1);
        transform-origin: 100% 0%;
        opacity: 1;
    }
`;

export const scaleInAnimation = css`
    ${scaleIn} 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
`;

const slideIn = keyframes`
    0% {
        transform: translateX(320px);
    }
    100% {
        transform: translateX(0);
    }
`;

const slideOut = keyframes`
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(320px);
    }
`;

const moveIn = keyframes`
    0% {
        transform: translateX(-300px);
    }
    100% {
        transform: translateX(0px);
    }
`;

const moveOut = keyframes`
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-300px);
    }
`;

export const slideInAnimation = css`
    ${slideIn} 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
`;

export const slideOutAnimation = css`
    ${slideOut} 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
`;

export const moveInAnimation = css`
    ${moveIn} 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
`;

export const moveOutAnimation = css`
    ${moveOut} 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
`;

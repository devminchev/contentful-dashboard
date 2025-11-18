/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { getVentures } from '../store/actions';

function useVentures(locale) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getVentures(locale));
    }, []);
};

export default useVentures;

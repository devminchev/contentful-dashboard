/* eslint-disable react-hooks/exhaustive-deps */
import * as XLSX from 'xlsx';
import { useCallback, useEffect, useRef, useState } from 'react';

const repairEscapes = (v) => {
    if (typeof v !== 'string') return v;
    // Replace any non-ASCII char with Excel-style escape _Xhhhh_
    return v.replace(/[^\x20-\x7E]/g, ch =>
        `_X${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}_`
    );
};

export const useExcelFile = ({
    sheetName = 'Game Data Template',
    validateRow = (item) => item.hasOwnProperty('Game Code'),
    uniqueKey = 'Game Code',
    alternativeKey,
} = {}) => {
    const [excelData, setExcelData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const createUniqueArray = useCallback((array) => {
        const uniqueItems = {};
        return array.filter(item => {
            const key = !alternativeKey ? item[uniqueKey] : `${item[uniqueKey]}-${item[alternativeKey]}`;
            if (!uniqueItems[key]) {
                uniqueItems[key] = true;
                return true;
            };
            return false;
        });
    }, [uniqueKey]);

    const parseFile = useCallback((file) => {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const arrayBuffer = event.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array', raw: true, cellText: true });

                // const allSheetsData = [];
                // workbook.SheetNames.forEach((sheetName) => {
                //     const worksheet = workbook.Sheets[sheetName];
                //     const sheetData = XLSX.utils.sheet_to_json(worksheet, { raw: true, header: 1 });

                //     // const sheetHeaders =
                //     const isValidSheet = sheetData[0].some(h => String(h).trim().toLowerCase() === 'sc mapping' || String(h).trim().toLowerCase() === 'game code');
                //     if (isValidSheet) {
                //         console.log('isValidSheet:', sheetName);
                //         // console.log('sheetData:', sheetData);
                //     }
                //     // allSheetsData.push(...sheetData);
                // });
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) throw new Error(`Sheet "${sheetName}" not found.`);

                const sheetRows = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '', cellText: true });
                // Fix only the target column
                const sheetData = sheetRows.map(r => ({
                    ...r,
                    [uniqueKey]: repairEscapes(r[uniqueKey])
                }));
                const validData = sheetData.filter(validateRow);
                const uniqueData = createUniqueArray(validData);
                console.log('excel rows data:', uniqueData);
                if (isMountedRef.current) setExcelData(uniqueData);
            } catch (err) {
                if (isMountedRef.current) setExcelData([]);
            } finally {
                if (isMountedRef.current) setIsUploading(false);
            }
        };
        reader.onerror = () => {
            if (isMountedRef.current) setIsUploading(false);
        };
        reader.readAsArrayBuffer(file);
    }, [sheetName, validateRow]);

    const reset = useCallback(() => {
        setExcelData([]);
    }, []);

    return { excelData, isUploading, parseFile, reset };
};

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const createUniqueArray = (array) => {
    const uniqueItems = {};
    return array.filter((item) => {
        if (!uniqueItems[item.GAMESKIN]) {
            uniqueItems[item.GAMESKIN] = true;
            return true;
        }
        return false;
    });
};

const useExcel = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();

            reader.onload = (event) => {
                const binaryStr = event.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const allSheetsData = [];

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const sheetData = XLSX.utils.sheet_to_json(worksheet);
                    allSheetsData.push(...sheetData);
                });

                const uniqueData = createUniqueArray(allSheetsData);
                setExcelData(uniqueData);
                setIsUploading(false);
            };
            reader.readAsBinaryString(file);
        }
    }, [file]);

    const readExcel = (newFile) => {
        setFile(newFile);
    };

    return { excelData, isUploading, readExcel };
};

export default useExcel;

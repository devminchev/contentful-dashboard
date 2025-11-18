import React, { useRef } from 'react';
import useMasterTemplateMetadata from '../hooks/useMasterTemplateMetadata';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ListHeader, ListItemBtn, PageWrapper } from '../common/styles/mixins';
import { useExcelFile } from '../hooks/useExcelFile';
import { Subheading, List, ListItem, FormControl, TextInput } from '@contentful/f36-components';

const GameMetadataUploadByMasterTemplate = () => {
    const fileInputRef = useRef(null);
    const { excelData, isUploading, parseFile, reset } = useExcelFile({
        // sheetName: 'UK_Live',
        // sheetName: 'Spain_Live',
        // sheetName: 'Spain_RNG_Table',
        // sheetName: 'UK_RNG_Table',
        // sheetName: 'Slots_Metadata_EU'
        sheetName: 'Instants',
        validateRow: (item) => item.hasOwnProperty('SC Mapping'),
        uniqueKey: 'SC Mapping',
        alternativeKey: 'Gamename'
    });
    // const { loadingProgress, updateProgress, invalidEntryIds, processMetadata, setInvalidEntryIds } = useMasterTemplateMetadata({ uniqueKey: 'SC Mapping', optionalLocale: 'es' });
    const { loadingProgress, updateProgress, invalidEntryIds, processMetadata, setInvalidEntryIds } = useMasterTemplateMetadata({ uniqueKey: 'SC Mapping' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            parseFile(file);
            setInvalidEntryIds([]);
        };
    };

    const handleProcessAndReset = async () => {
        await processMetadata(excelData);
        fileInputRef.current.value = '';
        reset();
    };

    return (
        <PageWrapper>
            <FormControl>
                <FormControl.Label style={{ color: 'white' }}>Upload Metadata Excel File</FormControl.Label>
                <TextInput
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.xlsm,.csv"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </FormControl>
            <ListHeader>
                Update & Publish GameV2 Entries via Metadata Template
            </ListHeader>
            <ListItemBtn onClick={handleProcessAndReset} disabled={isUploading || excelData.length === 0}>
                Run Excel Metadata Sync
            </ListItemBtn>
            <br></br>
            <br></br>
            <br></br>
            {invalidEntryIds.length > 0 && (
                <List>
                    <Subheading fontColor='white'>Invalid GameV2 Entry IDs to Publish</Subheading>
                    {invalidEntryIds.map(((eid, ind) => (
                        <ListItem key={ind}>{eid}</ListItem>
                    )))}
                </List>)
            }
            {isUploading && <LoadingBar message={'Uploading & Preparing Template'} />}
            {loadingProgress > 0 && <LoadingBar message={`Loading - ${loadingProgress}%`} />}
            {updateProgress > 0 && <LoadingBar message={`Processing - ${updateProgress}%`} />}
        </PageWrapper>
    );
};

export default GameMetadataUploadByMasterTemplate;

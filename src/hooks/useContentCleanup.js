/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import * as ContentfulService from '../services/ManagementApi';

function useContentCleanup() {
    const [bulkUnpublishProgress, setBulkUnpublishProgress] = useState(0);
    const [deleteProgress, setDeleteProgress] = useState(0);

    const bulkUnpublishContent = async (entries) => {
        console.log('Bulk-Unpublishing started .');

        setBulkUnpublishProgress(1);
        try {
            await ContentfulService.bulkUnpublishContent(entries, setBulkUnpublishProgress);
            console.log('Bulk-Unpublishing completed .')
        } catch (err) {
            console.log(`Error Bulk-Unpublishing content :`, err);
        } finally {
            setBulkUnpublishProgress(0);
        }
    };

    const deleteUnpublishedContent = async (entries) => {
        if (entries.length < 1) {
            return;
        };
        console.log('Content delete started .');

        setDeleteProgress(1);
        try {
            await ContentfulService.deleteUnpublishedContent(entries, setDeleteProgress);
            console.log('Content delete completed .')
        } catch (err) {
            console.log(`Error delete entry :`, err);
        } finally {
            setDeleteProgress(0);
        }
    };

    const deletePublishedContent = async (entries) => {
        if (entries.length < 1) {
            return;
        };
        console.log('Content delete started .');

        setDeleteProgress(1);
        try {
            await ContentfulService.deletePublishedContent(entries, setDeleteProgress);
            console.log('Content delete completed .')
        } catch (err) {
            console.log(`Error delete entry :`, err);
        } finally {
            setDeleteProgress(0);
        }
    };

    return { bulkUnpublishProgress, deleteProgress, bulkUnpublishContent, deletePublishedContent, deleteUnpublishedContent };
}

export default useContentCleanup;

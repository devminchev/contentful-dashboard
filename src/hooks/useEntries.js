/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import * as ContentfulService from '../services/ManagementApi';

function useEntries() {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [archivedContent, setArchivedContent] = useState([]);
    const [draftContent, setDraftContent] = useState([]);
    const [publishedContent, setPublishedContent] = useState({});

    const getArchivedContent = async () => {
        setLoadingProgress(1);
        try {
            const response = await ContentfulService.getArchivedContent(setLoadingProgress);

            setArchivedContent(response);
        } catch (err) {
            console.log(`Error archived content :`, err);
        } finally {
            setLoadingProgress(0);
        };
    };

    const getDraftContent = async () => {
        setLoadingProgress(1);
        try {
            const response = await ContentfulService.getDraftContent(setLoadingProgress);

            setDraftContent(response);
        } catch (err) {
            console.log(`Error draft content :`, err);
        } finally {
            setLoadingProgress(0);
        };
    };

    const loadDraftAndArchivedContent = async () => {
        try {
            await getArchivedContent();
            await getDraftContent();
        } catch (err) {
            console.log(`Error draft content :`, err);
        };
    };

    const loadPublishedContent = async (query) => {
        setLoadingProgress(1);
        try {
            const response = await ContentfulService.getPublishedContent(query, setLoadingProgress);

            setPublishedContent(prevEntries => ({
                ...prevEntries,
                [query.content_type]: [...prevEntries[query.content_type] || [], ...response]
            }));
        } catch (err) {
            console.log(`Error published content :`, err);
        } finally {
            setLoadingProgress(0);
        };
    };

    return {
        loadingProgress,
        archivedContent,
        draftContent,
        publishedContent,
        getDraftContent,
        getArchivedContent,
        loadPublishedContent,
        loadDraftAndArchivedContent
    };
}

export default useEntries;

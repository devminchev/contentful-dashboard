/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import * as ContentfulService from '../services/ManagementApi';

function usePublishSortedAllGamesSections(sortedSections, sortedVentures) {
    const { notifier } = useSDK();
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedSections, setPublishedSections] = useState({});
    const [publishedVentures, setPublishedVentures] = useState({});

    const publishSection = async (sectionId) => {
        if (!sortedSections[sectionId]) {
            notifier.error(`Error : Section must be sorted & updated before publishing !`);
            return;
        };

        setIsPublishing(true);
        try {
            await ContentfulService.publishEntry(sortedSections[sectionId]);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPublishedSections(prevSections => ({ ...prevSections, [sectionId]: true }));
            notifier.success(`${sectionId} Published Succesfully !`);
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        } finally {
            setIsPublishing(false);
        };
    };

    const publishVentureSections = async (venture) => {
        if (!sortedVentures[venture]) {
            notifier.error(`Error : ${venture.toUpperCase()} venture must be sorted & updated before publishing !`);
            return;
        };

        for (const section of sortedVentures[venture]) {
            await publishSection(section.sys.id, section.games);
        };
        setPublishedVentures(prevVentures => ({ ...prevVentures, [venture]: true }));
        notifier.success(`${venture.toUpperCase()} Published Succesfully !`);
    };

    return {
        isPublishing,
        publishedSections,
        publishedVentures,
        publishSection,
        publishVentureSections,
        setPublishedSections,
        setPublishedVentures
    };
}

export default usePublishSortedAllGamesSections;

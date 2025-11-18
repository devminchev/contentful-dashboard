/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { deleteCache } from "../services/Redis";

function useRedisCacheControl() {
    const { ids: { environmentAlias, environment }, notifier } = useSDK();
    const [venture, setVenture] = useState('');
    const [layoutName, setLayoutName] = useState('');
    const [platform, setPlatform] = useState('');
    const [gameName, setGameName] = useState('');
    const [section, setSection] = useState('');
    const [policyType, setPolicyType] = useState('');
    const [locale, setLocale] = useState('');
    const [isPartnerSite, setIsPartnerSite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const ENV = environmentAlias || environment;
    const deleteCacheKey = async (prefix) => {
        setIsLoading(true);

        let cacheKey = null;
        switch (prefix) {
            case 'ALL_GAMES':
                cacheKey = `${prefix}_${venture}_${isPartnerSite}_${platform}_${locale}_${ENV}`;
                break;
            case 'CAS_LAYOUT':
                cacheKey = `${prefix}_${venture}_${isPartnerSite}_${layoutName}_${platform}_${locale}_${ENV}`;
                break;
            case 'CATEGORIES':
                cacheKey = `${prefix}_${venture}_${isPartnerSite}_${locale}_${ENV}`;
                break;
            case 'INFO':
                cacheKey = `${prefix}_${gameName}_${venture}_${locale}_${ENV}`;
                break;
            case 'CONFIG':
                cacheKey = `${prefix}_${gameName}_${venture}_${locale}_${ENV}`;
                break;
            case 'GAME_TITLES':
                cacheKey = `${prefix}_${venture}_${locale}_${ENV}`;
                break;
            case 'FOOTER':
                cacheKey = `${prefix}_${venture}_${ENV}_${isPartnerSite}`;
                break;
            case 'POLICY':
                cacheKey = `${prefix}_${venture}_${isPartnerSite}_${locale}_${policyType}_${ENV}`;
                break;
            case 'MINI_GAMES':
                cacheKey = `${prefix}_${venture}_${locale}_${ENV}`;
                break;
            case 'RECOMMENDED_GAMES':
                cacheKey = `${prefix}_${venture}_${locale}_${ENV}`;
                break;
            case 'LOCALISATIONS':
                cacheKey = `${prefix}_${venture}_${locale}_${ENV}`;
                break;
            default:
                console.log('Command not recognized');
                break;
        };
        try {
            await deleteCache({ contentKey: cacheKey });
            notifier.success(`Cache Key Deleted Succesfully : ${cacheKey}`);
        } catch (err) {
            notifier.error(`Error ${err.response?.status || ''}: ${err.response?.data?.message || err.message}`,);
        } finally {
            setIsLoading(false);
        };
    };

    return {
        environment, venture, platform, gameName, section, policyType, locale, isPartnerSite, layoutName,
        setVenture, setPlatform, setGameName, setSection, setPolicyType, setLocale, setIsPartnerSite, setLayoutName,
        isLoading, deleteCacheKey
    };
}

export default useRedisCacheControl;

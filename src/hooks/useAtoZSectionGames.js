/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useSelector } from 'react-redux';
import { selectVentures } from "../store/selectors";
import useTabVisibility from "./useTabVisibility";
import useGraphQlContext from "../Context/useGraphQlContext";
import pause from '../utils/pause';

const usVentures = [
    'ballybetpa',
    'ballybetny',
    'ballybetaz',
    'ballybeton',
    'ballybetin',
    'ballycasinonj'
];

const euVentures = [
    'doublebubblebingo',
    'jackpotjoy',
    'virgingames',
    'ballyuk',
    'rainbowriches',
    'monopolycasino',
    'botemania',
    'monopolycasinospain'
];

function useAtoZSectionGames() {
    const { notifier, cma: { entry: contentfulClient }, locales: { default: spaceLocale } } = useSDK();
    const ventures = useSelector(selectVentures).filter(v => spaceLocale === 'en-GB' ? !usVentures.includes(v.name) : !euVentures.includes(v.name));

    const { getV1SitegameRefs } = useGraphQlContext();
    const [isLoading, setIsLoading] = useState(false);
    const [allSections, setAllSections] = useState([]);
    const [sectionsOfVenture, setSectionsOfVenture] = useState({});
    const [gamesRequestProgress, setGamesRequestProgress] = useState(0);

    const handleTabVisible = () => {
        window.location.reload();
    };

    useTabVisibility(handleTabVisible);
    const loadSectionsWithAllGames = async () => {
        setIsLoading(true);
        try {
            // const { data: { data: { sectionCollection: { items: sectionContent } } } } = await getAllGamesSections();
            // console.log('graph :', sectionContent);
            const { items: sectionWithAll } = await contentfulClient.getMany({
                query: {
                    limit: 200,
                    include: 1,
                    content_type: 'section',
                    'fields.entryTitle[match]': 'all'
                }
            });

            const { items: sectionWithAZ } = await contentfulClient.getMany({
                query: {
                    content_type: 'section',
                    include: 1,
                    'fields.entryTitle[match]': 'a-z'
                }
            });

            const { items: sectionWithAM } = await contentfulClient.getMany({
                query: {
                    content_type: 'section',
                    include: 1,
                    'fields.entryTitle[match]': 'a-m'
                }
            });

            const { items: sectionWithNZ } = await contentfulClient.getMany({
                query: {
                    content_type: 'section',
                    include: 1,
                    'fields.entryTitle[match]': 'n-z'
                }
            });
            const sections = [...sectionWithAll, ...sectionWithAZ, ...sectionWithAM, ...sectionWithNZ];
            const uniqueSections = sections.filter(item => item.fields.games?.[spaceLocale] || item.fields.games?.[spaceLocale].length > 0).filter((item, index, self) =>
                index === self.findIndex((t) => t.sys.id === item.sys.id)
            );
            setAllSections(uniqueSections);
            notifier.success('Loading All Games Successful!');
        } catch (err) {
            notifier.error(`Error All Games Sections: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSectionsOfVenture = useCallback(async (ventureName) => {
        setGamesRequestProgress(0.1);

        const sections = allSections.filter(item => item.fields.entryTitle?.[spaceLocale].includes(ventureName));
        const updatedSections = await sectionGamesListOfVenture(sections, ventureName);

        setSectionsOfVenture((prev) => {
            if (!prev[ventureName]) {
                return { ...prev, [ventureName]: updatedSections };
            } else {
                const { [ventureName]: _, ...rest } = prev;
                return rest;
            }
        });
        setGamesRequestProgress(0);
    }, [allSections]);

    const sectionGamesListOfVenture = useCallback(async (sections, ventureName) => {
        const updatedVenture = {};
        for (let index = 0; index < sections.length; index++) {
            const section = sections[index];
            if (sectionsOfVenture[ventureName] && sectionsOfVenture[ventureName][section.sys.id]) {
                updatedVenture[section.sys.id] = sectionsOfVenture[ventureName][section.sys.id];
            } else {
                const locale = (ventureName === "botemania" || ventureName === "monopolycasinospain") ? 'es' : spaceLocale;
                const { data: { data: { section: { gamesCollection: { items: gamesOfSection } } } } } = await getV1SitegameRefs(section.sys.id, locale);

                updatedVenture[section.fields.entryTitle?.[spaceLocale]] = {
                    section,
                    gamesOfSection
                };
                const percentage = ((index + 1) / sections.length) * 100;
                setGamesRequestProgress(percentage.toFixed(2));
            };
            await pause(500);
        };

        return updatedVenture;
    }, [sectionsOfVenture]);

    const refresh = async () => {
        setAllSections([]);
        setSectionsOfVenture({});

        await loadSectionsWithAllGames();
    };

    useEffect(() => {
        loadSectionsWithAllGames();
    }, []);

    return { ventures, isLoading, allSections, gamesRequestProgress, sectionsOfVenture, refresh, toggleSectionsOfVenture };
}

export default useAtoZSectionGames;

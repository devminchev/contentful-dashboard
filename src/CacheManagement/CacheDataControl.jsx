import React from 'react';
import { useRedisCacheControl } from '../hooks';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import ToggleSection from '../common/components/ToggleSection/ToggleSection';
import MultipleInputs from '../common/components/MultipleInputs/MultipleInputs';

const CacheDataControl = () => {
    const {
        venture, platform, gameSkin, layoutName, locale, policyType, isLoading,
        setVenture, setLayoutName, setPlatform, setLocale, setGameName, setPolicyType,
        deleteCacheKey
    } = useRedisCacheControl();

    const layoutInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: layoutName, onChange: (e) => setLayoutName(e.target.value), placeholder: "Enter section name" },
        { value: platform, onChange: (e) => setPlatform(e.target.value), placeholder: "Enter platform type" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const allGamesInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: platform, onChange: (e) => setPlatform(e.target.value), placeholder: "Enter platform type" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const titleInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const miniGamesinputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const recommendedGamesinputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const gameConfigInputs = [
        { value: gameSkin, onChange: (e) => setGameName(e.target.value), placeholder: "Enter Game Name" },
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const gameInfoInputs = [
        { value: gameSkin, onChange: (e) => setGameName(e.target.value), placeholder: "Enter Game Name" },
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const categoriesInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const policyInputs = [
        { value: policyType, onChange: (e) => setPolicyType(e.target.value), placeholder: "Enter Policy Type" },
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const footerInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    const localisationInputs = [
        { value: venture, onChange: (e) => setVenture(e.target.value), placeholder: "Enter venture name" },
        { value: locale, onChange: (e) => setLocale(e.target.value), placeholder: "Enter locale type" },
    ];

    return (
        <>
            <ToggleSection title="LAYOUT">
                <MultipleInputs inputs={layoutInputs} btnOnClick={() => deleteCacheKey('CAS_LAYOUT')} />
            </ToggleSection>

            <ToggleSection title="All Games">
                <MultipleInputs inputs={allGamesInputs} btnOnClick={() => deleteCacheKey('ALL_GAMES')} />
            </ToggleSection>

            <ToggleSection title="Game Titles">
                <MultipleInputs inputs={titleInputs} btnOnClick={() => deleteCacheKey('GAME_TITLES')} />
            </ToggleSection>

            <ToggleSection title="Mini Games">
                <MultipleInputs inputs={miniGamesinputs} btnOnClick={() => deleteCacheKey('MINI_GAMES')} />
            </ToggleSection>

            <ToggleSection title="Recommended Games">
                <MultipleInputs inputs={recommendedGamesinputs} btnOnClick={() => deleteCacheKey('RECOMMENDED_GAMES')} />
            </ToggleSection>

            <ToggleSection title="Game Config">
                <MultipleInputs inputs={gameConfigInputs} btnOnClick={() => deleteCacheKey('CONFIG')} />
            </ToggleSection>

            <ToggleSection title="Game Info">
                <MultipleInputs inputs={gameInfoInputs} btnOnClick={() => deleteCacheKey('INFO')} />
            </ToggleSection>

            <ToggleSection title="Categories">
                <MultipleInputs inputs={categoriesInputs} btnOnClick={() => deleteCacheKey('CATEGORIES')} />
            </ToggleSection>

            <ToggleSection title="Policy">
                <MultipleInputs inputs={policyInputs} btnOnClick={() => deleteCacheKey('POLICY')} />
            </ToggleSection>

            <ToggleSection title="Footer">
                <MultipleInputs inputs={footerInputs} btnOnClick={() => deleteCacheKey('FOOTER')} />
            </ToggleSection>

            <ToggleSection title="Localisations">
                <MultipleInputs inputs={localisationInputs} btnOnClick={() => deleteCacheKey('LOCALISATIONS')} />
            </ToggleSection>
            {isLoading && <LoadingBar />}
        </>
    );
};

export default CacheDataControl;

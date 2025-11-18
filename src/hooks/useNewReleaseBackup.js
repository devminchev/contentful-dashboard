/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import * as ContentfulService from '../services/ManagementApi';

const useStartNewRelease = () => {
    const sdk = useSDK();
    const [releases, setReleases] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({
        isPreparing: false,
        isPrepared: false,
        isReleasing: false,
        isDone: false
    });

    const fetchReleases = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await ContentfulService.getReleases();

            setReleases(res);
            sdk.notifier.success('Releases loaded successfully !');
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            sdk.notifier.error(`Error ${status}: ${message}`);
        } finally {
            setIsLoading(false);
        }
    });

    const prepareRelease = useCallback(async () => {
        setStatus(prev => ({ ...prev, isPreparing: true }));
        try {
            // const isConfirmed = await sdk.dialogs.openConfirm({
            //     title: `PREPARE NEW RELEASE`,
            //     message: `Are you sure to delete oldest release environment ${releases.oldestReleaseEnv.name} AND create new environment RELEASE-${releases.latestReleaseNumber + 1} ?`
            // });

            // if (!isConfirmed) {
            //     setStatus(prev => ({ ...prev, isPreparing: false, isPrepared: false }));
            //     return;
            // }

            await ContentfulService.prepareRelease(releases);
            setStatus(prev => ({ ...prev, isPreparing: false, isPrepared: true }));

            sdk.notifier.warning(`Oldest Release Env : ${releases.oldestReleaseEnv.name} deleted successfully !`);
            sdk.notifier.success(`New Release Env : release-${releases.latestReleaseNumber + 1} created successfully !`);
        } catch (err) {
            setStatus(prev => ({ ...prev, isPreparing: false, isPrepared: false }));

            const { status, message } = JSON.parse(err.message);
            sdk.notifier.error(`Error ${status}: ${message}`);
        };
    });

    const completeRelease = useCallback(async () => {
        if (!sdk.user.spaceMembership.admin) {
            sdk.notifier.error('You have to have Contentful Admin Rights !');
            return;
        };

        // if (status.isPrepared) {
        //     await sdk.dialogs.openAlert({
        //         title: `PREPAREd but not completed !`,
        //         message: `alalallala`
        //     });

        //     sdk.notifier.warning('New release created but hasnt finished yet !');
        //     return;
        // }

        // const promptMsg = await sdk.dialogs.openPrompt({
        //     title: 'Have you made your changes to target release env before completing the release process !',
        //     message: `Type in target new release environment ! ex: release-1111`
        // });

        // if (promptMsg === `release-${releases.latestReleaseNumber + 1}`) {
        //     console.log('yaaaaay');
        // }

        setStatus(prev => ({ ...prev, isReleasing: true, isPrepared: false }));
        try {
            // const isConfirmed = await sdk.dialogs.openConfirm({
            //     title: `NEW RELEASE-${releases.latestReleaseNumber + 1}`,
            //     message: `Are you sure to create new environement RELEASE-${releases.latestReleaseNumber + 1} ?`
            // });

            // if (!isConfirmed) {
            //     setStatus(prev => ({ ...prev, isReleasing: false, isDone: false }));
            //     return;
            // }

            await new Promise(resolve => setTimeout(resolve, 5000));

            await ContentfulService.updateMasterAliasToNewRelease(releases.latestReleaseNumber + 1);

            setStatus(prev => ({ ...prev, isReleasing: false, isDone: true }));

            sdk.notifier.success(`New RELEASE-${releases.latestReleaseNumber + 1} Successful !`);

            await fetchReleases();
        } catch (err) {
            console.log(err);
            const { status, message } = JSON.parse(err.message);
            sdk.notifier.error(`Error ${status}: ${message}`);
        } finally {
            setStatus(prev => ({ ...prev, isReleasing: false, isDone: true }));
        };
    }, [releases]);

    useEffect(() => {
        fetchReleases();
    }, []);

    return { isLoading, releases, canRelease: sdk.user.spaceMembership.admin, status, prepareRelease, completeRelease };
};

export default useStartNewRelease;

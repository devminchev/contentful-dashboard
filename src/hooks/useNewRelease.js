/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useSDK } from "@contentful/react-apps-toolkit";

import { completeNewRelease, getReleases, prepareNewRelease } from '../store/actions';
import { selectReleaseStatus, selectReleases, selectReleasesLoading } from "../store/selectors";

function useNewRelease() {
    const dispatch = useDispatch();
    const { notifier, user, dialogs } = useSDK();
    const releases = useSelector(selectReleases);
    const isLoading = useSelector(selectReleasesLoading);
    const status = useSelector(selectReleaseStatus);

    const prepareRelease = useCallback(async () => {
        const isConfirmed = await dialogs.openConfirm({
            title: `PREPARE NEW RELEASE`,
            message: `Are you sure to delete oldest release environment ${releases.oldestReleaseEnv.name} AND create new environment RELEASE-${releases.nextReleaseNumber} ?`,
            intent: 'positive'
        });

        if (!isConfirmed) {
            return;
        }

        try {
            dispatch(prepareNewRelease(releases));

            notifier.warning(`Oldest Release Env : ${releases.oldestReleaseEnv.name} deleted successfully !`);
            notifier.success(`New Release Env : release-${releases.nextReleaseNumber} created successfully !`);
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        }
    });

    const confirmReleaseCompletion = useCallback(async () => {
        const promptMsg = await dialogs.openPrompt({
            title: `Confirm Master Alias`,
            message: 'Have you made your changes to target release env before completing the release process ? Enter the new alias environment! ex: release-1111',
        });

        if (!promptMsg || promptMsg !== `release-${releases.nextReleaseNumber}`) {
            notifier.warning(`Completing release process is CANCELLED !`);
            return false;
        };

        const isConfirmed = await dialogs.openConfirm({
            title: `MASTER alias RELEASE-${releases.nextReleaseNumber}`,
            message: `Are you sure to set new environement RELEASE-${releases.nextReleaseNumber} as master alias?`,
            intent: 'positive',
        });

        if (!isConfirmed) {
            return false;
        };

        return true;
    });

    const completeRelease = useCallback(async () => {
        if (!user.spaceMembership.admin) {
            notifier.error('You have to have Contentful Admin Rights !');
            return;
        }

        const isConfirmed = await confirmReleaseCompletion();

        if (!isConfirmed) {
            return;
        }

        try {
            dispatch(completeNewRelease(releases.nextReleaseNumber));
            dispatch(getReleases());

            notifier.success(`New RELEASE-${releases.nextReleaseNumber} Successful !`);
        } catch (err) {
            const { status, message } = JSON.parse(err.message);
            notifier.error(`Error ${status}: ${message}`);
        }
    }, [releases]);

    const inCompleteAlert = useCallback(async () => {
        await dialogs.openAlert({
            title: 'INCOMPLETE RELEASE !',
            message: `There is prepared but incompleted release environment ${status.isPrepared.name}`
        });
    }, [status.isPrepared]);

    useEffect(() => {
        dispatch(getReleases());
    }, []);

    useEffect(() => {
        if (releases.needsRelease && status.isPrepared) {
            inCompleteAlert();
        }
    }, [releases.needsRelease]);

    return { releases, isLoading, status, prepareRelease, completeRelease, canRelease: user.spaceMembership.admin };
}

export default useNewRelease;

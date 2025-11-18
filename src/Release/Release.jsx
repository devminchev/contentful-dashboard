import React from 'react';
import { useNewRelease } from '../hooks';
import { PageWrapper } from '../common/styles/mixins';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { RowBtnWrapper, ReleaseBtn, ReleaseInfoWrapper, ReleaseItemDetail, ReleaseItemHeader, ReleaseItemWrapper, ReleaseItemsRow } from './Release.style';

const Release = () => {
    const { isLoading, status, releases, prepareRelease, completeRelease, canRelease } = useNewRelease();
    const disablePrepare = !isLoading && status.isPrepared && canRelease;
    const disableComplete = !isLoading && !status.isPrepared && canRelease;

    return (
        <PageWrapper>
            <h1>Release Automation</h1>
            <ReleaseInfoWrapper>
                <ReleaseItemsRow>
                    <ReleaseItemWrapper>
                        <ReleaseItemHeader>
                            Current Master
                        </ReleaseItemHeader>
                        <ReleaseItemDetail>{releases.latestReleaseEnv?.name.toUpperCase()}</ReleaseItemDetail>
                    </ReleaseItemWrapper>
                    <ReleaseItemWrapper>
                        <ReleaseItemHeader>
                            NEW release
                        </ReleaseItemHeader>
                        <ReleaseItemDetail>RELEASE-{releases.nextReleaseNumber}</ReleaseItemDetail>
                    </ReleaseItemWrapper>
                </ReleaseItemsRow>

                <RowBtnWrapper>
                    <ReleaseBtn onClick={prepareRelease} disabled={disablePrepare}>
                        Prepare New Release
                    </ReleaseBtn>
                </RowBtnWrapper>
                <RowBtnWrapper>
                    <ReleaseBtn onClick={completeRelease} disabled={disableComplete}>
                        Complete New Release
                    </ReleaseBtn>
                </RowBtnWrapper>
            </ReleaseInfoWrapper>

            {isLoading && <LoadingBar />}
            {status.isReleasing && <LoadingBar message={`Completing Release-${releases.nextReleaseNumber} !`} />}
        </PageWrapper>
    );
};

export default Release;

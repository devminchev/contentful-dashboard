import React from 'react';
import {
    Box,
    Flex,
    Text,
    Spinner,
    Card,
    Badge
} from '@contentful/f36-components';
import { CheckCircleIcon, ErrorCircleIcon } from '@contentful/f36-icons';

const DetailedProgressIndicator = ({ progress }) => {
    if (!progress) return null;

    const { message, current, total, percentage, stepDetails } = progress;

    // Calculate more accurate progress - don't hit 100% until everything is truly done
    const adjustedPercentage = message.includes('completed') ? 100 : Math.min(percentage, 95);

    // Step progress component
    const StepProgress = ({ stepDetails }) => {
        if (!stepDetails) return null;

        const { currentSection, stepStatus, stepMessage, stepData, sectionProgress } = stepDetails;

        const getStepIcon = (status) => {
            switch (status) {
                case 'completed':
                    return <CheckCircleIcon variant="positive" />;
                case 'failed':
                    return <ErrorCircleIcon variant="negative" />;
                default:
                    return <Spinner size="small" />;
            }
        };

        const getStepColor = (status) => {
            switch (status) {
                case 'completed':
                    return '#22c55e'; // green
                case 'failed':
                    return '#ef4444'; // red
                default:
                    return '#3b82f6'; // blue
            }
        };

        return (
            <Box marginTop="spacingM">
                <Card padding="spacingM" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Flex flexDirection="column" gap="spacingS">
                        {/* Current Section Header */}
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="fontSizeM" fontWeight="fontWeightMedium" fontColor="gray700">
                                Section {sectionProgress.current} of {sectionProgress.total}
                            </Text>
                            <Badge variant="secondary">
                                Section {Math.round((sectionProgress.current / sectionProgress.total) * 100)}%
                            </Badge>
                        </Flex>

                        {/* Section Title */}
                        <Text fontSize="fontSizeL" fontWeight="fontWeightDemiBold" style={{
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#1f2937'
                        }}>
                            "{currentSection}"
                        </Text>

                        {/* Current Step */}
                        <Flex alignItems="center" gap="spacingS" style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            border: `2px solid ${getStepColor(stepStatus)}`,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            {getStepIcon(stepStatus)}
                            <Text fontSize="fontSizeM" fontWeight="fontWeightMedium">
                                {stepMessage}
                            </Text>
                            {stepData && stepData.referenceCount !== undefined && (
                                <Badge variant="secondary" size="small">
                                    {stepData.referenceCount} refs
                                </Badge>
                            )}
                            {stepData && stepData.successful !== undefined && (
                                <Badge variant="positive" size="small">
                                    {stepData.successful}/{stepData.total}
                                </Badge>
                            )}
                        </Flex>
                    </Flex>
                </Card>
            </Box>
        );
    };

    return (
        <Box>
            {/* Main Progress Header */}
            <Flex justifyContent="space-between" alignItems="center" marginBottom="spacingS">
                <Flex alignItems="center" gap="spacingS">
                    {!message.includes('completed') && <Spinner size="small" />}
                    <Text fontSize="fontSizeL" fontWeight="fontWeightDemiBold">
                        Converting Sections
                    </Text>
                </Flex>
                <Flex alignItems="center" gap="spacingS">
                    <Text fontSize="fontSizeM" fontColor="gray600">
                        {current} of {total}
                    </Text>
                    <Badge variant="primary" size="large">
                        {adjustedPercentage}%
                    </Badge>
                </Flex>
            </Flex>

            {/* Animated Progress Bar */}
            <Box
                style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
                marginBottom="spacingM"
            >
                <Box
                    style={{
                        width: `${adjustedPercentage}%`,
                        height: '100%',
                        background: adjustedPercentage === 100
                            ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                            : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '8px',
                        transition: 'all 0.5s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated shine effect - only when not completed */}
                    {!message.includes('completed') && (
                        <Box
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                animation: 'progressShine 2s infinite linear'
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* Overall Status Message - Only show if different from step details */}
            {!stepDetails && (
                <Flex alignItems="center" gap="spacingS" marginBottom="spacingS">
                    <Text fontSize="fontSizeM" fontColor="gray600">
                        {message}
                    </Text>
                </Flex>
            )}

            {/* Detailed Step Progress */}
            <StepProgress stepDetails={stepDetails} />

            {/* Global CSS for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes progressShine {
                        0% { left: -100%; }
                        50% { left: 100%; }
                        100% { left: 100%; }
                    }
                `
            }} />
        </Box>
    );
};

export default DetailedProgressIndicator;

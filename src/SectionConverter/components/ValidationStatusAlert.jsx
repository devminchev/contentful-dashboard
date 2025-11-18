import React, { useState } from 'react';
import {
    Note,
    Stack,
    Text,
    Badge,
    Button,
    Collapse,
    Box
} from '@contentful/f36-components';
import { ChevronDownIcon, ChevronUpIcon } from '@contentful/f36-icons';

/**
 * Component for displaying validation status and errors
 * Shows dismissible alerts for validation failures with detailed information
 */
export const ValidationStatusAlert = ({
    validationResults,
    onDismiss,
    showDetails = false
}) => {
    const [isExpanded, setIsExpanded] = useState(showDetails);
    const [isDismissed, setIsDismissed] = useState(false);

    if (!validationResults || isDismissed) {
        return null;
    }

    const { validationFailed = [], skipped = [] } = validationResults;
    const totalIssues = validationFailed.length + skipped.length;

    if (totalIssues === 0) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        if (onDismiss) {
            onDismiss();
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Note
            variant="warning"
            title={`${totalIssues} section${totalIssues > 1 ? 's' : ''} cannot be converted`}
            onClose={handleDismiss}
        >
            <Stack direction="column" spacing="spacingS">
                <Text>
                    Some sections have validation issues that prevent conversion.
                    Please fix these issues before attempting conversion.
                </Text>

                <Stack direction="row" spacing="spacingXs" alignItems="center">
                    <Button
                        variant="transparent"
                        size="small"
                        startIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        onClick={toggleExpanded}
                    >
                        {isExpanded ? 'Hide' : 'Show'} Details
                    </Button>

                    {validationFailed.length > 0 && (
                        <Badge variant="negative">
                            {validationFailed.length} missing required fields
                        </Badge>
                    )}

                    {skipped.length > 0 && (
                        <Badge variant="warning">
                            {skipped.length} conversion incompatible
                        </Badge>
                    )}
                </Stack>

                <Collapse isExpanded={isExpanded}>
                    <Box paddingTop="spacingS">
                        <Stack direction="column" spacing="spacingM">
                            {validationFailed.length > 0 && (
                                <ValidationFailedSection entries={validationFailed} />
                            )}

                            {skipped.length > 0 && (
                                <SkippedSection entries={skipped} />
                            )}
                        </Stack>
                    </Box>
                </Collapse>
            </Stack>
        </Note>
    );
};

/**
 * Section showing entries that failed schema validation
 */
const ValidationFailedSection = ({ entries }) => (
    <Stack direction="column" spacing="spacingS">
        <Text fontWeight="fontWeightMedium" fontSize="fontSizeM">
            Missing Required Fields ({entries.length})
        </Text>
        <Text fontSize="fontSizeS" fontColor="gray600">
            These sections are missing required fields and cannot be converted:
        </Text>

        <Stack direction="column" spacing="spacingXs">
            {entries.map((entry, index) => (
                <ValidationFailedEntry key={index} entry={entry} />
            ))}
        </Stack>
    </Stack>
);

/**
 * Individual entry that failed validation
 */
const ValidationFailedEntry = ({ entry }) => {
    // Use space-aware locale
    const spaceId = entry.section?.sys?.space?.sys?.id || 'unknown';
    const primaryLocale = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
    const secondaryLocale = primaryLocale === 'en-GB' ? 'en-US' : 'en-GB';

    const entryTitle = entry.section?.fields?.entryTitle?.[primaryLocale] ||
                      entry.section?.fields?.entryTitle?.[secondaryLocale] ||
                      'Untitled';

    return (
        <Box
            padding="spacingXs"
            style={{
                backgroundColor: 'var(--gray100)',
                borderRadius: '4px',
                border: '1px solid var(--gray300)'
            }}
        >
            <Stack direction="column" spacing="spacingXs">
                <Stack direction="row" spacing="spacingXs" alignItems="center">
                    <Text fontWeight="fontWeightMedium" fontSize="fontSizeS">
                        {entryTitle}
                    </Text>
                    <Badge variant="negative" size="small">
                        {entry.missingFields?.length || 0} missing
                    </Badge>
                </Stack>

                {entry.missingFields && entry.missingFields.length > 0 && (
                    <Text fontSize="fontSizeS" fontColor="gray600">
                        Missing: {entry.missingFields.join(', ')}
                    </Text>
                )}

                {entry.invalidFields && entry.invalidFields.length > 0 && (
                    <Text fontSize="fontSizeS" fontColor="gray600">
                        Invalid: {entry.invalidFields.join(', ')}
                    </Text>
                )}
            </Stack>
        </Box>
    );
};

/**
 * Section showing entries that were skipped due to conversion incompatibility
 */
const SkippedSection = ({ entries }) => (
    <Stack direction="column" spacing="spacingS">
        <Text fontWeight="fontWeightMedium" fontSize="fontSizeM">
            Conversion Incompatible ({entries.length})
        </Text>
        <Text fontSize="fontSizeS" fontColor="gray600">
            These sections cannot be converted to the target type:
        </Text>

        <Stack direction="column" spacing="spacingXs">
            {entries.map((entry, index) => (
                <SkippedEntry key={index} entry={entry} />
            ))}
        </Stack>
    </Stack>
);

/**
 * Individual entry that was skipped
 */
const SkippedEntry = ({ entry }) => {
    // Use space-aware locale
    const spaceId = entry.section?.sys?.space?.sys?.id || 'unknown';
    const primaryLocale = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
    const secondaryLocale = primaryLocale === 'en-GB' ? 'en-US' : 'en-GB';

    const entryTitle = entry.section?.fields?.entryTitle?.[primaryLocale] ||
                      entry.section?.fields?.entryTitle?.[secondaryLocale] ||
                      'Untitled';

    return (
        <Box
            padding="spacingXs"
            style={{
                backgroundColor: 'var(--orange100)',
                borderRadius: '4px',
                border: '1px solid var(--orange300)'
            }}
        >
            <Stack direction="column" spacing="spacingXs">
                <Text fontWeight="fontWeightMedium" fontSize="fontSizeS">
                    {entryTitle}
                </Text>

                <Text fontSize="fontSizeS" fontColor="gray600">
                    Reason: {entry.reason}
                </Text>

                {entry.errors && entry.errors.length > 0 && (
                    <Text fontSize="fontSizeS" fontColor="gray600">
                        Issues: {entry.errors.join(', ')}
                    </Text>
                )}
            </Stack>
        </Box>
    );
};

export default ValidationStatusAlert;

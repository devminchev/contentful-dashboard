import React from 'react';
import {
    Box,
    Heading,
    Text,
    Flex,
    Card,
    Badge,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Note
} from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { SECTION_TYPE_NAMES } from '../config/fieldMappings';
import conversionService from '../services/conversionService';

/**
 * Helper function to get localized field value using SDK locale information
 * @param {Object} field - The field object with locale keys
 * @param {Object} sdk - The Contentful SDK
 * @returns {any} - The field value in the first available locale
 */
const getLocalizedValue = (field, sdk) => {
    if (!field || typeof field !== 'object') return field;

    // Try SDK's default locale first
    const defaultLocale = sdk.locales?.default;
    if (defaultLocale && field[defaultLocale] !== undefined && field[defaultLocale] !== null) {
        return field[defaultLocale];
    }

    // Try SDK's available locales in order
    const availableLocales = sdk.locales?.available || [];
    for (const locale of availableLocales) {
        if (field[locale] !== undefined && field[locale] !== null) {
            return field[locale];
        }
    }

    // If no available locale found, get the first available value
    const keys = Object.keys(field);
    if (keys.length > 0) {
        return field[keys[0]];
    }

    return '';
};

const ConversionPreview = ({ selectedSections, targetType, onClose }) => {
    const sdk = useSDK();
    // Get validation results for all selected sections
    const validationResults = conversionService.batchValidateConversions(selectedSections, targetType);

    // Get preview for first section as example
    const examplePreview = selectedSections.length > 0
        ? conversionService.getConversionPreview(selectedSections[0], targetType)
        : null;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'positive';
            case 'moderate': return 'warning';
            case 'complex': return 'negative';
            default: return 'secondary';
        }
    };

    return (
        <Box>
            <Flex flexDirection="column" gap="spacingM">
                {/* Summary */}
                <Card padding="spacingM">
                    <Heading as="h3" marginBottom="spacingS">
                        Conversion Summary
                    </Heading>
                    <Text marginBottom="spacingS">
                        Converting {selectedSections.length} section(s) to <strong>{SECTION_TYPE_NAMES[targetType]}</strong>
                    </Text>

                    <Flex gap="spacingS" flexWrap="wrap">
                        <Badge variant="positive">
                            {validationResults.valid.length} Valid
                        </Badge>
                        {validationResults.invalid.length > 0 && (
                            <Badge variant="negative">
                                {validationResults.invalid.length} Invalid
                            </Badge>
                        )}
                        {validationResults.warnings.length > 0 && (
                            <Badge variant="warning">
                                {validationResults.warnings.length} Warnings
                            </Badge>
                        )}
                    </Flex>
                </Card>

                {/* Warnings */}
                {validationResults.warnings.length > 0 && (
                    <Note variant="warning">
                        <Heading as="h4" fontSize="fontSizeM" marginBottom="spacingXs">
                            Conversion Warnings
                        </Heading>
                        <ul>
                            {validationResults.warnings.map((warning, index) => (
                                <li key={index}>
                                    <strong>Section {warning.sectionId}:</strong> {warning.warning}
                                </li>
                            ))}
                        </ul>
                    </Note>
                )}

                {/* Invalid Sections */}
                {validationResults.invalid.length > 0 && (
                    <Note variant="negative">
                        <Heading as="h4" fontSize="fontSizeM" marginBottom="spacingXs">
                            Invalid Conversions
                        </Heading>
                        <Text>The following sections cannot be converted:</Text>
                        <ul>
                            {validationResults.invalid.map((result, index) => (
                                <li key={index}>
                                    {getLocalizedValue(result.section.fields?.entryTitle, sdk) || 'Untitled'}
                                    ({result.section.typeName})
                                </li>
                            ))}
                        </ul>
                    </Note>
                )}

                {/* Section Details */}
                <Card padding="spacingM">
                    <Heading as="h3" marginBottom="spacingS">
                        Section Details
                    </Heading>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Section</TableCell>
                                <TableCell>Current Type</TableCell>
                                <TableCell>Target Type</TableCell>
                                <TableCell>Difficulty</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedSections.map(section => {
                                const sourceType = section.sys.contentType.sys.id;
                                const validation = conversionService.validateConversion(sourceType, targetType);
                                const entryTitle = getLocalizedValue(section.fields?.entryTitle, sdk) || 'Untitled';

                                return (
                                    <TableRow key={section.sys.id}>
                                        <TableCell>
                                            <Text fontWeight="fontWeightMedium">
                                                {entryTitle}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {section.typeName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="primary">
                                                {SECTION_TYPE_NAMES[targetType]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getDifficultyColor(validation.difficulty)}>
                                                {validation.difficulty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={validation.isValid ? 'positive' : 'negative'}>
                                                {validation.isValid ? 'Ready' : 'Invalid'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>

                {/* Field Changes Example */}
                {examplePreview && (
                    <Card padding="spacingM">
                        <Heading as="h3" marginBottom="spacingS">
                            Field Changes Example
                        </Heading>
                        <Text marginBottom="spacingS" fontColor="gray600">
                            Example showing field changes for: {getLocalizedValue(selectedSections[0].fields?.entryTitle, sdk) || 'Untitled'}
                        </Text>

                        {/* Copied Fields */}
                        {examplePreview.fieldChanges.copied.length > 0 && (
                            <Box marginBottom="spacingS">
                                <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">
                                    ✅ Fields copied unchanged ({examplePreview.fieldChanges.copied.length}):
                                </Text>
                                <Text fontFamily="fontStackMonospace" fontSize="fontSizeS">
                                    {examplePreview.fieldChanges.copied.map(change => change.field).join(', ')}
                                </Text>
                            </Box>
                        )}

                        {/* Transformed Fields */}
                        {examplePreview.fieldChanges.transformed.length > 0 && (
                            <Box marginBottom="spacingS">
                                <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">
                                    🔄 Fields transformed ({examplePreview.fieldChanges.transformed.length}):
                                </Text>
                                {examplePreview.fieldChanges.transformed.map((change, index) => (
                                    <Box key={index} marginLeft="spacingS">
                                        <Text fontSize="fontSizeS">
                                            <strong>{change.field}:</strong> {change.originalValue} → {String(change.newValue)}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Added Fields */}
                        {examplePreview.fieldChanges.added.length > 0 && (
                            <Box marginBottom="spacingS">
                                <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">
                                    ➕ Fields added ({examplePreview.fieldChanges.added.length}):
                                </Text>
                                {examplePreview.fieldChanges.added.map((change, index) => (
                                    <Box key={index} marginLeft="spacingS">
                                        <Text fontSize="fontSizeS">
                                            <strong>{change.field}:</strong> {String(change.value)}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Omitted Fields */}
                        {examplePreview.fieldChanges.omitted.length > 0 && (
                            <Box marginBottom="spacingS">
                                <Text fontWeight="fontWeightMedium" marginBottom="spacingXs">
                                    ❌ Fields omitted ({examplePreview.fieldChanges.omitted.length}):
                                </Text>
                                {examplePreview.fieldChanges.omitted.map((change, index) => (
                                    <Box key={index} marginLeft="spacingS">
                                        <Text fontSize="fontSizeS">
                                            <strong>{change.field}:</strong> {change.value}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                )}

                {/* Conversion Process */}
                <Card padding="spacingM">
                    <Heading as="h3" marginBottom="spacingS">
                        Conversion Process
                    </Heading>
                    <Text marginBottom="spacingS">
                        The conversion will follow these steps for each section:
                    </Text>
                    <ol>
                        <li>Convert field data to target section type</li>
                        <li>Find all entries that reference the original section</li>
                        <li>Archive original section with "_old" suffix</li>
                        <li>Create new section with converted fields</li>
                        <li>Update references to point to the new section</li>
                        <li>Publish the new section</li>
                    </ol>

                    <Note variant="primary" marginTop="spacingS">
                        <Text>
                            <strong>Note:</strong> Original sections will be preserved with "_old" suffix and can be restored if needed.
                        </Text>
                    </Note>
                </Card>
            </Flex>
        </Box>
    );
};

export default ConversionPreview;

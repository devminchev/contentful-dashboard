import React, { useState, useEffect, useCallback } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import {
    Box,
    Heading,
    Text,
    Flex,
    Card,
    Button,
    Spinner,
    Note,
    TextInput,
    Select,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    Badge,
    Collapse,
    Modal
} from '@contentful/f36-components';
import { SearchIcon, ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@contentful/f36-icons';

import sectionService from './services/sectionService';
import conversionService from './services/conversionService';
import conversionOrchestrator from './services/conversionOrchestrator';
import rateLimiter from './services/rateLimiter';
import ConversionPreview from './components/ConversionPreview';
import DetailedProgressIndicator from './components/DetailedProgressIndicator';
import { SECTION_TYPE_NAMES, IG_SECTION_TYPES, getCompatibleTargets } from './config/fieldMappings';
import logger from '../utils/logger';

const SectionConverter = () => {
    const sdk = useSDK();

    const [state, setState] = useState({
        sections: [],
        filteredSections: [],
        selectedSections: [],
        searchQuery: '',
        targetType: '',
        selectedSectionTypes: Object.values(IG_SECTION_TYPES), // Default to all types selected
        totalLimit: 100, // 🎯 NEW: Global total limit for sections to fetch
        isLoading: false,
        isConverting: false,
        conversionProgress: null,
        conversionResults: null,
        errors: [],
        initialized: false,
        showPreview: false,
        showResults: false,
        rateLimiterStatus: { queueLength: 0, isProcessing: false },
        isDebugMode: true,
        showProgressFadeOut: false,
        sectionTypeDropdownOpen: false
    });

    const updateState = (updates) => {
        logger.debug('updateState called with:', updates);
        setState(prev => {
            const newState = { ...prev, ...updates };
            logger.debug('State updated:', {
                sectionsCount: newState.sections.length,
                filteredSectionsCount: newState.filteredSections.length,
                isLoading: newState.isLoading
            });
            return newState;
        });
    };

    // Load initial sections
    const loadSections = useCallback(async () => {
        logger.debug('loadSections called');
        updateState({ isLoading: true, errors: [] });

        try {
            const result = await sectionService.getAllIGSections(state.selectedSectionTypes, state.totalLimit);
            logger.debug('loadSections result:', {
                sectionsCount: result.sections.length
            });
            updateState({
                sections: result.sections,
                filteredSections: result.sections,
                isLoading: false,
                errors: result.errors || []
            });
        } catch (error) {
            logger.error('loadSections error:', error);
            updateState({
                errors: [error.message],
                isLoading: false
            });
        }
    }, [state.selectedSectionTypes, state.totalLimit]);

    // Handle search
    const handleSearch = useCallback(async (query) => {
        logger.debug('handleSearch called with query:', query);
        updateState({ isLoading: true });

        try {
            const result = await sectionService.searchAllIGSections(query, state.selectedSectionTypes, state.totalLimit);
            logger.debug('handleSearch result:', {
                sectionsCount: result.sections.length,
                errors: result.errors
            });
            updateState({
                filteredSections: result.sections,
                isLoading: false,
                errors: result.errors || []
            });
        } catch (error) {
            logger.error('handleSearch error:', error);
            updateState({
                errors: [error.message],
                isLoading: false
            });
        }
    }, [state.selectedSectionTypes, state.totalLimit]);

    // Debounced search effect
    useEffect(() => {
        if (!state.initialized) {
            logger.debug('Debounced search effect: not initialized yet');
            return;
        }

        logger.debug('Debounced search effect triggered:', {
            searchQuery: state.searchQuery,
            initialized: state.initialized
        });

        const timeoutId = setTimeout(() => {
            if (state.searchQuery.trim() === '') {
                logger.debug('Empty search query, loading all sections');
                loadSections();
            } else {
                logger.debug('Non-empty search query, performing search');
                handleSearch(state.searchQuery);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [state.searchQuery, state.initialized, state.selectedSectionTypes, state.totalLimit, handleSearch, loadSections]);

    // Initialize services with SDK
    useEffect(() => {
        const initializeServices = async () => {
            try {
                // Initialize services with the SDK
                sectionService.initialize(sdk);
                conversionService.initialize(sdk);
                conversionOrchestrator.initialize(sectionService, conversionService);

                logger.info('Services initialized successfully');

                // Set initialized flag
                updateState({ initialized: true });

                // Load initial sections
                await loadSections();
            } catch (error) {
                logger.error('Error initializing services:', error);
                updateState({ errors: [error.message], isLoading: false });
            }
        };

        if (sdk) {
            initializeServices();
        }
    }, [sdk, loadSections]);

    // Debug mode management
    useEffect(() => {
        const handleDebugChange = (isDebug) => {
            updateState({ isDebugMode: isDebug });
        };

        // Set initial debug state
        updateState({ isDebugMode: logger.isDebug() });

        // Listen for debug mode changes
        logger.addDebugChangeListener(handleDebugChange);

        // Cleanup listener on unmount
        return () => {
            logger.removeDebugChangeListener(handleDebugChange);
        };
    }, []);

    // Toggle debug mode
    const handleToggleDebug = () => {
        logger.toggleDebug();
    };

    // Handle search input change
    const handleSearchInputChange = (query) => {
        updateState({ searchQuery: query });
        // The actual search will be triggered by the useEffect with debounce
    };

    // Perform search based on current input
    const performCurrentSearch = useCallback(async () => {
        if (state.searchQuery.trim() === '') {
            await loadSections();
        } else {
            await handleSearch(state.searchQuery);
        }
    }, [state.searchQuery, loadSections, handleSearch]);

    // Handle Enter key in search input
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            performCurrentSearch();
        }
    };

    // Handle section selection
    const handleSectionToggle = (section, isSelected) => {
        let newSelected;

        if (isSelected) {
            newSelected = [...state.selectedSections, section];
        } else {
            newSelected = state.selectedSections.filter(s => s.sys.id !== section.sys.id);
        }

        updateState({ selectedSections: newSelected });
    };

    // Handle select all/none
    const handleSelectAll = () => {
        updateState({ selectedSections: [...state.filteredSections] });
    };

    const handleSelectNone = () => {
        updateState({ selectedSections: [] });
    };

    // Toggle preview section
    const handleTogglePreview = () => {
        updateState({ showPreview: !state.showPreview });
    };

    // Close preview section
    const handleClosePreview = () => {
        updateState({ showPreview: false });
    };

    // Execute conversion
    const handleStartConversion = async () => {
        if (state.selectedSections.length === 0 || !state.targetType) {
            return;
        }

        updateState({
            isConverting: true,
            conversionProgress: null,
            conversionResults: null,
            errors: [],
            showPreview: false
        });

        try {
            const results = await conversionOrchestrator.executeConversion(
                state.selectedSections,
                state.targetType,
                (progress) => {
                    updateState({ conversionProgress: progress });
                }
            );

            const summaryReport = conversionOrchestrator.generateSummaryReport(results);

            // Show completed progress for 1 second, then fade out
            setTimeout(() => {
                updateState({ showProgressFadeOut: true });

                // After fade animation (0.5s), hide progress and show results
                setTimeout(() => {
                    updateState({
                        conversionResults: summaryReport,
                        isConverting: false,
                        conversionProgress: null,
                        showResults: true,
                        showProgressFadeOut: false,
                        // Clear selections after successful conversion
                        selectedSections: [],
                        targetType: ''
                    });
                }, 500);
            }, 1000);

            // Refresh sections list to show updated data
            await performCurrentSearch();

        } catch (error) {
            updateState({
                errors: [error.message],
                isConverting: false,
                conversionProgress: null
            });
        }
    };

    // Close results modal
    const handleCloseResults = () => {
        updateState({
            showResults: false,
            conversionResults: null
        });
    };

    // Get target type options
    const getTargetTypeOptions = () => {
        if (state.selectedSections.length === 0) {
            return Object.entries(SECTION_TYPE_NAMES).map(([id, name]) => ({
                label: name,
                value: id
            }));
        }

        // Find common compatible targets for all selected sections
        const firstSectionType = state.selectedSections[0].sys.contentType.sys.id;
        let compatibleTargets = getCompatibleTargets(firstSectionType);

        for (let i = 1; i < state.selectedSections.length; i++) {
            const sectionType = state.selectedSections[i].sys.contentType.sys.id;
            const sectionTargets = getCompatibleTargets(sectionType);
            compatibleTargets = compatibleTargets.filter(target => sectionTargets.includes(target));
        }

        return compatibleTargets.map(id => ({
            label: SECTION_TYPE_NAMES[id],
            value: id
        }));
    };

    // Helper function to get localized field value
    const getLocalizedValue = (field) => {
        if (!field || typeof field !== 'object') return '';

        // 🎯 Use same space-aware locale logic as services
        const spaceId = sdk.ids.space;
        const spaceAwareFallback = spaceId === 'nw2595tc1jdx' ? 'en-GB' : 'en-US';
        const defaultLocale = sdk.locales?.default || spaceAwareFallback;

        // Try the determined default locale first
        if (field[defaultLocale] !== undefined && field[defaultLocale] !== null) {
            return field[defaultLocale];
        }

        // Try SDK's available locales in order
        const availableLocales = sdk.locales?.available || [defaultLocale];
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

    // Format section for display
    const formatSectionForDisplay = (section) => {
        // Use the helper function to get localized values
        const entryTitle = getLocalizedValue(section.fields?.entryTitle) || 'Untitled';
        const title = getLocalizedValue(section.fields?.title) || '';
        const slug = getLocalizedValue(section.fields?.slug) || '';

        return {
            id: section.sys.id,
            entryTitle: String(entryTitle), // Ensure it's a string
            title: String(title),
            slug: String(slug),
            type: section.typeName,
            status: section.status || 'unknown', // Preserve status from CMA API
            updatedAt: new Date(section.sys.updatedAt).toLocaleDateString(),
            isSelected: state.selectedSections.some(s => s.sys.id === section.sys.id)
        };
    };

    // Get status badge variant based on Contentful's design system
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'published': return 'positive';   // Green - Published and current
            case 'draft': return 'warning';        // Orange - Never been published
            case 'changed': return 'primary';      // Blue - Published but has changes
            case 'archived': return 'negative';    // Red - Archived/unpublished
            default: return 'secondary';           // Gray - Unknown status
        }
    };

    // Capitalize status text for display
    const formatStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Check if conversion can be started
    const canStartConversion = () => {
        return state.selectedSections.length > 0 &&
               state.targetType &&
               !state.isConverting &&
               state.initialized;
    };

    // Update rate limiter status periodically
    useEffect(() => {
        const updateRateLimiterStatus = () => {
            const status = rateLimiter.getStatus();
            updateState({ rateLimiterStatus: status });
        };

        // Update immediately
        updateRateLimiterStatus();

        // Update every 500ms when there's activity
        const interval = setInterval(() => {
            const status = rateLimiter.getStatus();
            if (status.queueLength > 0 || status.isProcessing) {
                updateState({ rateLimiterStatus: status });
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Rate limiter status component
    const RateLimiterStatus = () => {
        // Only show in debug mode and during conversions (write operations only)
        if (!state.isDebugMode || !state.isConverting) {
            return null;
        }

        if (state.rateLimiterStatus.queueLength === 0 && !state.rateLimiterStatus.isProcessing) {
            return null;
        }

        return (
            <Note variant="primary">
                <Flex alignItems="center" gap="spacingXs">
                    <Spinner size="small" />
                    <Text fontSize="fontSizeS">
                        Rate limiting write operations: {state.rateLimiterStatus.queueLength} requests queued
                        {state.rateLimiterStatus.isProcessing && ' (processing...)'}
                    </Text>
                </Flex>
            </Note>
        );
    };

    // Toggle section type dropdown
    const toggleSectionTypeDropdown = () => {
        updateState({ sectionTypeDropdownOpen: !state.sectionTypeDropdownOpen });
    };

    // Handle individual section type toggle
    const handleSectionTypeToggle = (sectionType) => {
        const newSelected = state.selectedSectionTypes.includes(sectionType)
            ? state.selectedSectionTypes.filter(type => type !== sectionType)
            : [...state.selectedSectionTypes, sectionType];

        updateState({ selectedSectionTypes: newSelected });
    };

    // Select all section types
    const handleSelectAllSectionTypes = () => {
        updateState({ selectedSectionTypes: Object.values(IG_SECTION_TYPES) });
    };

    // Deselect all section types
    const handleDeselectAllSectionTypes = () => {
        updateState({ selectedSectionTypes: [] });
    };

    // Close section type dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (state.sectionTypeDropdownOpen && !event.target.closest('[data-section-type-dropdown]')) {
                updateState({ sectionTypeDropdownOpen: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [state.sectionTypeDropdownOpen]);

    return (
        <Box padding="spacingL" paddingTop="spacing2Xl" style={{ marginTop: '80px' }}>
            <Flex flexDirection="column" gap="spacingM">
                {/* Header */}
                <Box style={{ textAlign: 'center' }} marginBottom="spacingL">
                    <Heading
                        as="h1"
                        fontSize="fontSize2Xl"
                        fontWeight="fontWeightBold"
                        marginBottom="spacingS"
                        style={{ color: 'white' }}
                    >
                        Section Converter
                    </Heading>
                    <Text as="p" fontSize="fontSizeL" style={{ maxWidth: '600px', margin: '0 auto', color: '#e1e1e1' }}>
                        Convert IG sections from one model type to another. Shows true current state (draft/published/changed) via GraphQL with preview! 🎯
                    </Text>
                </Box>

                {/* Rate Limiter Status */}
                <RateLimiterStatus />

                {/* Search and Controls */}
                <Card padding="spacingM">
                    <Flex flexDirection="column" gap="spacingM">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading as="h2" fontSize="fontSizeL">
                                Search & Select Sections
                            </Heading>

                            {/* Debug Toggle Button - in top-right corner of this card */}
                            <Button
                                variant={state.isDebugMode ? "primary" : "secondary"}
                                size="small"
                                onClick={handleToggleDebug}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    padding: 0,
                                    minWidth: 'unset'
                                }}
                                title={state.isDebugMode ? "Debug mode ON - Click to disable" : "Debug mode OFF - Click to enable"}
                            >
                                🐛
                            </Button>
                        </Flex>

                        {/* Search Bar */}
                        <Flex gap="spacingS" alignItems="flex-end">
                            <Box style={{ flex: 1 }}>
                                <TextInput
                                    placeholder="Search sections by title, slug, or type..."
                                    value={state.searchQuery}
                                    onChange={(e) => handleSearchInputChange(e.target.value)}
                                    onKeyDown={handleSearchKeyPress}
                                    isDisabled={state.isConverting}
                                />
                            </Box>
                            <Box style={{ minWidth: '120px' }}>
                                <Text as="label" fontSize="fontSizeS" fontColor="gray600" marginBottom="spacingXs">
                                    Total Limit
                                </Text>
                                <Select
                                    value={state.totalLimit}
                                    onChange={(e) => updateState({ totalLimit: parseInt(e.target.value) })}
                                    isDisabled={state.isConverting}
                                >
                                    <Select.Option value={50}>50 items</Select.Option>
                                    <Select.Option value={100}>100 items</Select.Option>
                                    <Select.Option value={200}>200 items</Select.Option>
                                    <Select.Option value={300}>300 items</Select.Option>
                                    <Select.Option value={500}>500 items</Select.Option>
                                    <Select.Option value={1000}>1000 items</Select.Option>
                                </Select>
                            </Box>
                            <Box style={{ minWidth: '200px' }}>
                                <Text as="label" fontSize="fontSizeS" fontColor="gray600" marginBottom="spacingXs">
                                    Section Types
                                </Text>
                                <Box style={{ position: 'relative' }} data-section-type-dropdown>
                                    <Button
                                        variant="secondary"
                                        onClick={toggleSectionTypeDropdown}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            textAlign: 'left',
                                            backgroundColor: state.selectedSectionTypes.length === Object.values(IG_SECTION_TYPES).length
                                                ? 'white'
                                                : state.selectedSectionTypes.length === 0
                                                    ? '#fef2f2'
                                                    : '#f0f9ff'
                                        }}
                                        endIcon={state.sectionTypeDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        isDisabled={state.isConverting}
                                    >
                                        <Flex alignItems="center" gap="spacingXs">
                                            <Text>
                                                {state.selectedSectionTypes.length === Object.values(IG_SECTION_TYPES).length
                                                    ? 'All types'
                                                    : state.selectedSectionTypes.length === 0
                                                        ? 'No types'
                                                        : `${state.selectedSectionTypes.length} types`}
                                            </Text>
                                            {state.selectedSectionTypes.length > 0 && state.selectedSectionTypes.length < Object.values(IG_SECTION_TYPES).length && (
                                                <Badge variant="primary" size="small">
                                                    Filtered
                                                </Badge>
                                            )}
                                        </Flex>
                                    </Button>

                                    {state.sectionTypeDropdownOpen && (
                                        <Card
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                zIndex: 1000,
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                marginTop: '4px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                            padding="spacingS"
                                        >
                                            <Flex flexDirection="column" gap="spacingXs">
                                                {/* Select All/None buttons */}
                                                <Flex gap="spacingXs" marginBottom="spacingXs">
                                                    <Button
                                                        variant="transparent"
                                                        size="small"
                                                        onClick={handleSelectAllSectionTypes}
                                                    >
                                                        All
                                                    </Button>
                                                    <Button
                                                        variant="transparent"
                                                        size="small"
                                                        onClick={handleDeselectAllSectionTypes}
                                                    >
                                                        None
                                                    </Button>
                                                </Flex>

                                                {/* Section type checkboxes */}
                                                {Object.entries(SECTION_TYPE_NAMES).map(([typeId, typeName]) => (
                                                    <Flex key={typeId} alignItems="center" gap="spacingXs">
                                                        <Checkbox
                                                            isChecked={state.selectedSectionTypes.includes(typeId)}
                                                            onChange={() => handleSectionTypeToggle(typeId)}
                                                            id={`section-type-${typeId}`}
                                                        />
                                                        <Text as="label" htmlFor={`section-type-${typeId}`} fontSize="fontSizeS">
                                                            {typeName}
                                                        </Text>
                                                    </Flex>
                                                ))}
                                            </Flex>
                                        </Card>
                                    )}
                                </Box>
                            </Box>
                            <Button
                                variant="secondary"
                                startIcon={<SearchIcon />}
                                onClick={performCurrentSearch}
                                isLoading={state.isLoading}
                                isDisabled={state.isConverting}
                            >
                                Search
                            </Button>
                        </Flex>

                        {/* Selection Controls */}
                        <Flex gap="spacingS" alignItems="center">
                            <Text fontWeight="fontWeightMedium">
                                {state.selectedSections.length} of {state.filteredSections.length} selected
                            </Text>
                            <Button
                                variant="transparent"
                                size="small"
                                onClick={handleSelectAll}
                                isDisabled={state.filteredSections.length === 0 || state.isConverting}
                            >
                                Select All
                            </Button>
                            <Button
                                variant="transparent"
                                size="small"
                                onClick={handleSelectNone}
                                isDisabled={state.selectedSections.length === 0 || state.isConverting}
                            >
                                Select None
                            </Button>
                        </Flex>

                        {/* Target Type Selection */}
                        {state.selectedSections.length > 0 && (
                            <Box>
                                <Text as="label" fontWeight="fontWeightMedium" marginBottom="spacingXs">
                                    Convert to:
                                </Text>
                                <Select
                                    value={state.targetType}
                                    onChange={(e) => updateState({ targetType: e.target.value })}
                                    isDisabled={state.isConverting}
                                >
                                    <Select.Option value="" disabled>
                                        Select target type...
                                    </Select.Option>
                                    {getTargetTypeOptions().map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Box>
                        )}

                        {/* Conversion Actions - Moved to top */}
                        {state.selectedSections.length > 0 && (
                            <Box>
                                {state.targetType ? (
                                    <Text marginBottom="spacingS">
                                        Ready to convert {state.selectedSections.length} section(s) to {SECTION_TYPE_NAMES[state.targetType]}
                                    </Text>
                                ) : (
                                    <Text marginBottom="spacingS" fontColor="gray600">
                                        Select a target type above to enable conversion
                                    </Text>
                                )}
                                <Flex gap="spacingS">
                                    <Button
                                        variant="primary"
                                        onClick={handleStartConversion}
                                        isDisabled={!canStartConversion()}
                                        isLoading={state.isConverting}
                                    >
                                        {state.isConverting ? 'Converting...' : 'Start Conversion'}
                                    </Button>
                                    {state.isDebugMode && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleTogglePreview}
                                            isDisabled={!state.targetType || state.isConverting}
                                            startIcon={state.showPreview ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        >
                                            {state.showPreview ? 'Hide Preview' : 'Preview Changes'}
                                        </Button>
                                    )}
                                </Flex>
                            </Box>
                        )}
                    </Flex>
                </Card>

                {/* Conversion Progress - Moved up for visibility */}
                {state.isConverting && state.conversionProgress && (
                    <Card
                        padding="spacingM"
                        style={{
                            opacity: state.showProgressFadeOut ? 0 : 1,
                            transform: state.showProgressFadeOut ? 'translateY(-10px)' : 'translateY(0)',
                            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                        }}
                    >
                        <Flex flexDirection="column" gap="spacingS">
                            <DetailedProgressIndicator
                                progress={state.conversionProgress}
                            />
                        </Flex>
                    </Card>
                )}

                {/* Collapsible Preview Section - only show in debug mode */}
                {state.selectedSections.length > 0 && state.targetType && state.isDebugMode && (
                    <Collapse isExpanded={state.showPreview}>
                        <Card padding="spacingM">
                            <Flex flexDirection="column" gap="spacingM">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Heading as="h2" fontSize="fontSizeL">
                                        Conversion Preview
                                    </Heading>
                                    <Button
                                        variant="transparent"
                                        size="small"
                                        onClick={handleClosePreview}
                                        startIcon={<ChevronUpIcon />}
                                    >
                                        Hide
                                    </Button>
                                </Flex>

                                {(() => {
                                    try {
                                        return (
                                            <ConversionPreview
                                                selectedSections={state.selectedSections}
                                                targetType={state.targetType}
                                                onClose={handleClosePreview}
                                            />
                                        );
                                    } catch (error) {
                                        logger.error('Error rendering ConversionPreview:', error);
                                        return (
                                            <Box padding="spacingM">
                                                <Text>Error loading preview: {error.message}</Text>
                                            </Box>
                                        );
                                    }
                                })()}
                            </Flex>
                        </Card>
                    </Collapse>
                )}

                {/* Sections Table */}
                <Card padding="spacingM">
                    <Flex flexDirection="column" gap="spacingM">
                        <Heading as="h2" fontSize="fontSizeL">
                            Sections ({state.filteredSections.length}/{state.totalLimit} limit)
                        </Heading>

                        {state.isLoading ? (
                            <Flex justifyContent="center" padding="spacingL">
                                <Spinner />
                            </Flex>
                        ) : state.filteredSections.length === 0 ? (
                            <Box padding="spacingL" style={{ textAlign: 'center' }}>
                                <Text fontColor="gray600">
                                    {state.sections.length === 0 ? 'No IG sections found' : 'No sections match your search'}
                                </Text>
                            </Box>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Select</TableCell>
                                        <TableCell>Entry Title</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Slug</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>References</TableCell>
                                        <TableCell>Updated</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.filteredSections.map(section => {
                                        const displaySection = formatSectionForDisplay(section);
                                        return (
                                            <TableRow key={displaySection.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        isChecked={displaySection.isSelected}
                                                        onChange={(e) => handleSectionToggle(section, e.target.checked)}
                                                        isDisabled={state.isConverting}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Text fontWeight="fontWeightMedium">
                                                        {displaySection.entryTitle}
                                                    </Text>
                                                </TableCell>
                                                <TableCell>{displaySection.title}</TableCell>
                                                <TableCell>
                                                    <Text fontFamily="fontStackMonospace" fontSize="fontSizeS">
                                                        {displaySection.slug}
                                                    </Text>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {displaySection.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(displaySection.status)}>
                                                        {formatStatusText(displaySection.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Flex alignItems="center" gap="spacingXs">
                                                        <Badge variant={section.referenceCount > 0 ? "positive" : "secondary"}>
                                                            {section.referenceCount || 0}
                                                        </Badge>
                                                        {section.referenceCount > 0 && (
                                                            <Text fontSize="fontSizeS" fontColor="gray600">
                                                                {section.referenceCount === 1 ? 'link' : 'links'}
                                                            </Text>
                                                        )}
                                                    </Flex>
                                                </TableCell>
                                                <TableCell>{displaySection.updatedAt}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="transparent"
                                                        size="small"
                                                        startIcon={<ExternalLinkIcon />}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const envId = sdk.ids.environmentAlias || sdk.ids.environment;
                                                            const entryUrl = `https://app.contentful.com/spaces/${sdk.ids.space}/environments/${envId}/entries/${displaySection.id}`;
                                                            window.open(entryUrl, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        isDisabled={state.isConverting}
                                                    >
                                                        Open
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </Flex>
                </Card>

                {/* Status Messages */}
                {state.errors.length > 0 && (
                    <Note variant="negative">
                        <Text>Errors occurred:</Text>
                        <ul>
                            {state.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Note>
                )}

                {/* Results Modal */}
                {state.showResults && state.conversionResults && (
                    <Modal onClose={handleCloseResults} size="large">
                        <Modal.Header
                            title="Conversion Results"
                            onClose={handleCloseResults}
                        />
                        <Modal.Content>
                            <Flex flexDirection="column" gap="spacingM">
                                {/* Summary */}
                                <Card padding="spacingM">
                                    <Heading as="h3" marginBottom="spacingS">
                                        Summary
                                    </Heading>
                                    <Flex gap="spacingS" flexWrap="wrap">
                                        <Badge variant="positive">
                                            {state.conversionResults.summary.successful} Successful
                                        </Badge>
                                        {state.conversionResults.summary.failed > 0 && (
                                            <Badge variant="negative">
                                                {state.conversionResults.summary.failed} Failed
                                            </Badge>
                                        )}
                                        {state.conversionResults.summary.skipped > 0 && (
                                            <Badge variant="warning">
                                                {state.conversionResults.summary.skipped} Skipped
                                            </Badge>
                                        )}
                                        <Badge variant="secondary">
                                            {state.conversionResults.summary.duration}s duration
                                        </Badge>
                                        <Badge variant="primary">
                                            {state.conversionResults.summary.successRate}% success rate
                                        </Badge>
                                    </Flex>
                                </Card>

                                {/* Details */}
                                {state.conversionResults.details.successful.length > 0 && (
                                    <Card padding="spacingM">
                                        <Heading as="h4" marginBottom="spacingS">
                                            Successfully Converted
                                        </Heading>
                                        <ul>
                                            {state.conversionResults.details.successful.map((success, index) => (
                                                <li key={index}>
                                                    <strong>{success.originalTitle}</strong> → New ID: {success.newId}
                                                    {success.referencesUpdated > 0 && (
                                                        <Text fontSize="fontSizeS" fontColor="gray600">
                                                            {success.referencesUpdated} references updated
                                                        </Text>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {state.conversionResults.details.failed.length > 0 && (
                                    <Card padding="spacingM">
                                        <Heading as="h4" marginBottom="spacingS">
                                            Failed Conversions
                                        </Heading>
                                        <ul>
                                            {state.conversionResults.details.failed.map((failure, index) => (
                                                <li key={index}>
                                                    <strong>{failure.title}</strong>: {failure.error}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}
                            </Flex>
                        </Modal.Content>
                        <Modal.Controls>
                            <Button variant="primary" onClick={handleCloseResults}>
                                Close
                            </Button>
                        </Modal.Controls>
                    </Modal>
                )}
            </Flex>
        </Box>
    );
};

export default SectionConverter;

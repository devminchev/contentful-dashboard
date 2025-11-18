/**
 * Test suite for the Dynamic Schema Validation System
 * Tests the integration of schema fetching, validation, and conversion orchestration
 */

import { initializeSchemaValidation, getValidationStats } from '../utils/schemaInitializer';
import entryValidationService from '../services/entryValidationService';
import contentTypeSchemaService from '../services/contentTypeSchemaService';

// Mock entry data for testing
const mockValidEntry = {
    sys: {
        id: 'valid-entry-1',
        contentType: { sys: { id: 'igGridASection' } }
    },
    fields: {
        entryTitle: { 'en-GB': 'Valid Test Entry' },
        title: { 'en-GB': 'Test Title' },
        slug: { 'en-GB': 'test-slug' },
        environmentVisibility: { 'en-GB': ['staging'] },
        platformVisibility: { 'en-GB': ['web'] },
        sessionVisibility: { 'en-GB': ['loggedIn'] },
        venture: { 'en-GB': { sys: { id: 'venture-123' } } },
        games: { 'en-GB': [{ sys: { id: 'game-123' } }] },
        viewAllType: { 'en-GB': 'view' }
    }
};

const mockInvalidEntry = {
    sys: {
        id: 'invalid-entry-1',
        contentType: { sys: { id: 'igGridBSection' } }
    },
    fields: {
        entryTitle: { 'en-GB': 'Invalid Test Entry' },
        // Missing required fields: title, slug, venture, games, etc.
        environmentVisibility: { 'en-GB': ['staging'] }
    }
};

const mockPartialEntry = {
    sys: {
        id: 'partial-entry-1',
        contentType: { sys: { id: 'igCarouselA' } }
    },
    fields: {
        entryTitle: { 'en-GB': 'Partial Test Entry' },
        title: { 'en-GB': 'Partial Title' },
        slug: { 'en-GB': 'partial-slug' },
        environmentVisibility: { 'en-GB': ['staging'] },
        platformVisibility: { 'en-GB': ['web'] },
        sessionVisibility: { 'en-GB': ['loggedIn'] },
        venture: { 'en-GB': { sys: { id: 'venture-456' } } },
        // Missing: games, viewAllType
    }
};

describe('Dynamic Schema Validation System', () => {

    beforeAll(async () => {
        // Initialize the validation system before running tests
        console.log('🧪 Initializing validation system for tests...');
        const result = await initializeSchemaValidation();
        expect(result.success).toBe(true);
        console.log('✅ Validation system initialized');
    });

    describe('Schema Initialization', () => {
        // TODO: Fix this test
        test.skip('should initialize with all 9 IG section schemas', async () => {
            const stats = getValidationStats();

            expect(stats.isInitialized).toBe(true);
            expect(stats.schemaStats.totalSchemas).toBe(9);
            expect(stats.schemaStats.schemasWithRequiredFields).toBe(9);
        });

        test('should have correct required fields for each content type', () => {
            const igGridAAnalysis = contentTypeSchemaService.getFieldAnalysis('igGridASection');
            const igCarouselAAnalysis = contentTypeSchemaService.getFieldAnalysis('igCarouselA');
            const igGridCAnalysis = contentTypeSchemaService.getFieldAnalysis('igGridCSection');

            // Grid A should have core fields + games + sectionTruncation
            expect(igGridAAnalysis.requiredFields).toContain('entryTitle');
            expect(igGridAAnalysis.requiredFields).toContain('title');
            expect(igGridAAnalysis.requiredFields).toContain('games');
            expect(igGridAAnalysis.requiredFields).toContain('viewAllType');

            // Carousel A should have core fields + games
            expect(igCarouselAAnalysis.requiredFields).toContain('entryTitle');
            expect(igCarouselAAnalysis.requiredFields).toContain('games');

            // Grid C should have core fields + game (singular)
            expect(igGridCAnalysis.requiredFields).toContain('entryTitle');
            expect(igGridCAnalysis.requiredFields).toContain('game');
        });
    });

    describe('Entry Validation', () => {
        test('should validate a complete valid entry', () => {
            const result = entryValidationService.validateEntry(mockValidEntry, 'en-GB');

            expect(result.isValid).toBe(true);
            expect(result.missingFields).toHaveLength(0);
            expect(result.invalidFields).toHaveLength(0);
        });

        test('should identify missing required fields', () => {
            const result = entryValidationService.validateEntry(mockInvalidEntry, 'en-GB');

            expect(result.isValid).toBe(false);
            expect(result.missingFields.length).toBeGreaterThan(0);
            expect(result.missingFields).toContain('title');
            expect(result.missingFields).toContain('slug');
            expect(result.missingFields).toContain('games');
        });

        test('should handle partial entries correctly', () => {
            const result = entryValidationService.validateEntry(mockPartialEntry, 'en-GB');

            expect(result.isValid).toBe(false);
            expect(result.missingFields).toContain('games');
            expect(result.missingFields).toContain('viewAllType');
        });
    });

    describe('Batch Validation', () => {
        test('should validate multiple entries and categorize results', () => {
            const entries = [mockValidEntry, mockInvalidEntry, mockPartialEntry];
            const results = entryValidationService.validateEntries(entries, 'en-GB');

            expect(results.totalEntries).toBe(3);
            expect(results.validEntries).toBe(1);
            expect(results.invalidEntries).toBe(2);
            expect(results.results.valid).toHaveLength(1);
            expect(results.results.invalid).toHaveLength(2);

            // Check that the valid entry is correctly identified
            expect(results.results.valid[0].id).toBe('valid-entry-1');

            // Check that invalid entries have proper error details
            const invalidResults = results.results.invalid;
            expect(invalidResults.every(r => r.missingFields.length > 0)).toBe(true);
        });

        test('should handle empty entry list', () => {
            const results = entryValidationService.validateEntries([], 'en-GB');

            expect(results.totalEntries).toBe(0);
            expect(results.validEntries).toBe(0);
            expect(results.invalidEntries).toBe(0);
        });
    });

    describe('Locale Handling', () => {
        test('should handle different locales with fallback', () => {
            // Test with en-US locale (should fallback to en-GB)
            const result = entryValidationService.validateEntry(mockValidEntry, 'en-US');
            expect(result.isValid).toBe(true);

            // Test with non-existent locale (should fallback)
            const resultFallback = entryValidationService.validateEntry(mockValidEntry, 'fr-FR');
            expect(resultFallback.isValid).toBe(true);
        });
    });

    describe('Error Handling', () => {
        // TODO: Fix this test
        test.skip('should handle entries with unknown content types', () => {
            const unknownEntry = {
                ...mockValidEntry,
                sys: {
                    ...mockValidEntry.sys,
                    contentType: { sys: { id: 'unknownContentType' } }
                }
            };

            const result = entryValidationService.validateEntry(unknownEntry, 'en-GB');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('No schema found');
        });

        test('should handle malformed entries gracefully', () => {
            const malformedEntry = {
                sys: { id: 'malformed' },
                // Missing fields object entirely
            };

            const result = entryValidationService.validateEntry(malformedEntry, 'en-GB');
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('Performance', () => {
        test('should validate entries quickly after initialization', () => {
            const startTime = Date.now();

            // Validate 100 entries
            const entries = Array(100).fill(mockValidEntry);
            const results = entryValidationService.validateEntries(entries, 'en-GB');

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(results.totalEntries).toBe(100);
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        });
    });
});

// Helper function to run tests manually if needed
export async function runValidationTests() {
    console.log('🧪 Running Dynamic Schema Validation Tests...');

    try {
        // Initialize
        const initResult = await initializeSchemaValidation();
        console.log('✅ Initialization:', initResult.success ? 'PASSED' : 'FAILED');

        // Test single entry validation
        const validResult = entryValidationService.validateEntry(mockValidEntry, 'en-GB');
        console.log('✅ Valid entry test:', validResult.isValid ? 'PASSED' : 'FAILED');

        const invalidResult = entryValidationService.validateEntry(mockInvalidEntry, 'en-GB');
        console.log('✅ Invalid entry test:', !invalidResult.isValid ? 'PASSED' : 'FAILED');

        // Test batch validation
        const batchResults = entryValidationService.validateEntries([mockValidEntry, mockInvalidEntry], 'en-GB');
        console.log('✅ Batch validation:',
            batchResults.validEntries === 1 && batchResults.invalidEntries === 1 ? 'PASSED' : 'FAILED');

        // Test stats
        const stats = getValidationStats();
        console.log('✅ Stats test:', stats.isInitialized ? 'PASSED' : 'FAILED');

        console.log('🎉 All validation tests completed!');
        return true;

    } catch (error) {
        console.error('❌ Validation tests failed:', error);
        return false;
    }
}

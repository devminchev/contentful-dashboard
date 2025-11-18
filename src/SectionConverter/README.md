# Section Converter

A comprehensive tool for converting IG (Interactive Gaming) sections between different content models in Contentful.

## Overview

The Section Converter allows content managers to migrate sections from one IG model type to another while preserving data integrity and maintaining all references. It supports conversions between:

- **Grid Sections**: igGridASection, igGridBSection, igGridCSection, igGridDSection, igGridESection, igGridFSection, igGridGSection
- **Carousel Sections**: igCarouselA, igCarouselB

## Features

### 🔍 **Search & Selection**
- Search sections by title, slug, or content type
- Multi-select with checkboxes
- Bulk selection controls (Select All/None)
- Real-time filtering

### 📋 **Conversion Preview**
- Detailed preview of field changes before conversion
- Validation warnings for complex conversions
- Compatibility checking between source and target types
- Field mapping visualization

### ⚙️ **Smart Conversion Process**
1. **Field Mapping**: Intelligent mapping between different content models
2. **Reference Management**: Automatically updates all entries that reference the converted sections
3. **Data Preservation**: Original sections are renamed with "_old" suffix for safety
4. **Publishing**: New sections are automatically published

### 📊 **Progress Tracking**
- Real-time progress updates during conversion
- Step-by-step status tracking
- Detailed results reporting
- Error handling and recovery

## Architecture

### Core Components

#### **SectionConverter.jsx**
Main component providing the user interface for section selection, preview, and conversion execution.

#### **ConversionPreview.jsx**
Modal component showing detailed preview of conversion changes, warnings, and field mappings.

### Services Layer

#### **sectionService.js**
Handles all Contentful SDK operations:
- Fetching IG sections with pagination
- Searching and filtering sections
- Creating new sections
- Managing references and updates
- Publishing operations

#### **conversionService.js**
Manages field mapping and conversion logic:
- Field-to-field mapping rules
- Data transformation functions
- Validation and compatibility checking
- Conversion preview generation

#### **conversionOrchestrator.js**
Orchestrates the complete conversion workflow:
- Progress tracking and reporting
- Error handling and recovery
- Batch processing of multiple sections
- Results summarization

### Configuration

#### **fieldMappings.js**
Comprehensive configuration defining:
- Content type definitions and human-readable names
- Field mapping rules between different IG types
- Conversion difficulty levels (easy/moderate/complex)
- Compatibility matrix
- Default values and transformations

## Conversion Rules

### Field Mapping Categories

#### **Direct Copy Fields**
Fields that are copied unchanged between compatible types:
- `entryTitle`, `title`, `slug`
- `environmentVisibility`, `sectionVisibility`
- `viewAllType`, `viewAllUrl`

#### **Transformed Fields**
Fields that require transformation:
- **Grid C Conversions**: `games` array → single `game` field (first item)
- **To Grid C**: Single `game` field → `games` array
- **Layout Types**: Automatic mapping between grid/carousel layouts

#### **Special Handling**
- **Grid C Media Fields**: `videoLoggedIn`, `videoLoggedOut`, `image` (lost when converting from Grid C)
- **Section Truncation**: Only available in Grid A and E
- **View All Types**: Grid A supports "none" option, others support "view" and "auto"

### Conversion Difficulty Levels

#### **Easy** 🟢
- Same layout type (grid-to-grid, carousel-to-carousel)
- No special field handling required
- Direct field mapping

#### **Moderate** 🟡
- Different layout types (grid-to-carousel, carousel-to-grid)
- Some fields may be lost or modified
- Requires field transformation

#### **Complex** 🔴
- Involves Grid C conversions
- Significant data transformation required
- Media fields may be lost
- Array-to-single field conversions

## Usage Guide

### 1. **Section Selection**
- Use the search bar to find specific sections
- Select individual sections with checkboxes
- Use "Select All" for bulk operations
- Filter by content type using the search

### 2. **Target Type Selection**
- Choose the target content type from the dropdown
- Only compatible target types are shown based on selected sections
- Compatibility is determined by the field mapping configuration

### 3. **Preview Changes**
- Click "Preview Changes" to see detailed conversion preview
- Review field mappings, warnings, and compatibility issues
- Check the conversion difficulty and potential data loss

### 4. **Execute Conversion**
- Click "Start Conversion" to begin the process
- Monitor real-time progress with the progress bar
- View detailed results after completion

### 5. **Review Results**
- Check the summary of successful, failed, and skipped conversions
- Review any error messages for failed conversions
- Verify that references have been updated correctly

## Error Handling

### Validation Errors
- Invalid field mappings
- Missing required fields
- Incompatible content types

### Runtime Errors
- Contentful API failures
- Network connectivity issues
- Permission errors

### Recovery Mechanisms
- Original sections preserved with "_old" suffix
- Failed conversions leave new sections as drafts
- Detailed error logging for troubleshooting

## Best Practices

### Before Conversion
1. **Backup**: Ensure you have recent backups of your content
2. **Test**: Try conversions on a small subset first
3. **Review**: Check the preview carefully for any warnings
4. **Plan**: Consider the impact on published content

### During Conversion
1. **Monitor**: Watch the progress and check for errors
2. **Don't Navigate**: Stay on the page during conversion
3. **Network**: Ensure stable internet connection

### After Conversion
1. **Verify**: Check that converted sections display correctly
2. **Test**: Verify that all references are working
3. **Cleanup**: Remove "_old" sections when satisfied
4. **Document**: Keep records of what was converted

## Troubleshooting

### Common Issues

#### **"No compatible targets" Error**
- Selected sections have no common compatible target types
- Try selecting sections of the same type or compatible types

#### **"Conversion failed" Errors**
- Check Contentful permissions
- Verify network connectivity
- Review error details in the results modal

#### **Missing References**
- Some references may not update automatically
- Manually check and update complex reference structures

### Support

For technical issues or questions:
1. Check the browser console for detailed error messages
2. Review the conversion results for specific failure reasons
3. Contact the development team with error details and section IDs

## Development

### Adding New Content Types
1. Update `IG_SECTION_TYPES` in `fieldMappings.js`
2. Add human-readable name to `SECTION_TYPE_NAMES`
3. Define field mapping rules in `FIELD_MAPPING_RULES`
4. Update compatibility matrix

### Extending Field Mappings
1. Add new field definitions to `COMMON_FIELDS` or `SPECIAL_FIELDS`
2. Create transformation functions for complex mappings
3. Update validation rules as needed

### Testing
- Test with various section types and combinations
- Verify field mappings are correct
- Check reference updates work properly
- Test error handling scenarios

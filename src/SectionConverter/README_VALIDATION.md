# Dynamic Schema Validation System

## Overview

The Dynamic Schema Validation System provides robust, schema-based validation for IG section entries before conversion. Instead of hardcoded field requirements, it dynamically fetches content type schemas from Contentful using MCP and validates entries against their actual schema definitions.

## Features

- 🔍 **Dynamic Schema Fetching**: Uses MCP to fetch real content type schemas from Contentful
- ✅ **Required Field Validation**: Validates entries against dynamically determined required fields
- 🚫 **Pre-Conversion Filtering**: Prevents conversion of incomplete entries
- 📊 **Detailed Reporting**: Provides comprehensive validation reports with missing/invalid fields
- 🎨 **UI Integration**: Beautiful F36-based components for displaying validation results
- 🔄 **Automatic Integration**: Seamlessly integrates with existing conversion workflow

## Architecture

### Core Services

1. **ContentTypeSchemaService** (`services/contentTypeSchemaService.js`)
   - Manages content type schema cache
   - Extracts required fields from schemas
   - Provides field analysis and reporting

2. **EntryValidationService** (`services/entryValidationService.js`)
   - Validates individual entries against schemas
   - Handles localized field validation
   - Provides batch validation capabilities

3. **Schema Initializer** (`utils/schemaInitializer.js`)
   - Fetches all IG section schemas using MCP
   - Initializes validation services
   - Provides utility functions for validation management

### UI Components

4. **ValidationStatusAlert** (`components/ValidationStatusAlert.jsx`)
   - Displays validation results to users
   - Shows detailed error information
   - Dismissible alerts with expandable details

## Usage

### Basic Integration

```javascript
import { initializeSchemaValidation } from '../utils/schemaInitializer';
import entryValidationService from '../services/entryValidationService';

// Initialize validation (call once at app startup)
const result = await initializeSchemaValidation();
if (result.success) {
    console.log('✅ Validation ready!');
}

// Validate entries
const validationResults = entryValidationService.validateEntries(sections, 'en-GB');
console.log(`${validationResults.validEntries} valid, ${validationResults.invalidEntries} invalid`);
```

### React Component Usage

```jsx
import ValidationStatusAlert from './components/ValidationStatusAlert';

function ConversionPage() {
    const [validationResults, setValidationResults] = useState(null);

    const handleConversion = async () => {
        // Validation happens automatically in conversion orchestrator
        const results = await conversionOrchestrator.executeConversion(sections, targetType);
        setValidationResults(results);
    };

    return (
        <div>
            <ValidationStatusAlert
                validationResults={validationResults}
                onDismiss={() => setValidationResults(null)}
                showDetails={true}
            />
            {/* Rest of your UI */}
        </div>
    );
}
```

### Conversion Integration

The validation system is automatically integrated into the conversion process:

```javascript
// In ConversionOrchestrator.executeConversion()
// 1. Initialize schema validation
await this.ensureValidationInitialized();

// 2. Validate entry completeness
const validationResults = entryValidationService.validateEntries(sections, 'en-GB');

// 3. Filter out invalid entries
const validEntries = validationResults.results.valid.map(validEntry => {
    return sections.find(section => section.sys.id === validEntry.id);
}).filter(Boolean);

// 4. Continue with conversion compatibility validation
// 5. Process only fully valid entries
```

## Validation Rules

### Required Fields by Content Type

The system dynamically determines required fields from Contentful schemas. Current required fields include:

**All IG Section Types:**
- `entryTitle` - Entry title (unique identifier)
- `title` - Display title
- `slug` - URL slug
- `environmentVisibility` - Environment visibility array
- `platformVisibility` - Platform visibility array
- `sessionVisibility` - Session visibility array
- `venture` - Venture link
- `viewAllType` - View all type

**Grid A & E Sections:**
- `games` - Games array
- `sectionTruncation` - Section truncation (Grid A only)

**Grid B, D, F, G Sections:**
- `games` - Games array

**Grid C Section:**
- `game` - Single game link (instead of games array)

**Carousel A & B:**
- `games` - Games array

### Field Validation Logic

The system validates fields based on their type and content:

- **String fields** (`title`, `entryTitle`, `slug`): Must be non-empty strings
- **Array fields** (`games`, `environmentVisibility`): Must have at least one item
- **Link fields** (`venture`, `game`): Must be valid link objects with `sys.id`
- **Other fields**: Must exist and not be null/undefined

## Error Handling

### Validation Results Structure

```javascript
{
    totalEntries: 10,
    validEntries: 7,
    invalidEntries: 3,
    validationRate: "70.0",
    results: {
        valid: [
            { id: "entry1", contentType: "igGridASection", entryTitle: "Valid Entry" }
        ],
        invalid: [
            {
                entry: { id: "entry2", contentType: "igGridBSection", entryTitle: "Invalid Entry" },
                error: "Missing required fields",
                missingFields: ["games", "venture"],
                invalidFields: ["title"]
            }
        ],
        warnings: [
            { entry: { id: "entry3" }, warning: "No schema validation available" }
        ]
    }
}
```

### Conversion Results Structure

```javascript
{
    successful: [...],
    failed: [...],
    skipped: [...],           // Conversion compatibility issues
    validationFailed: [...],  // Schema validation failures
    totalProcessed: 5
}
```

## Configuration

### Locale Support

The system supports multiple locales with fallback logic:

```javascript
// Primary locale (default)
const results = entryValidationService.validateEntries(sections, 'en-GB');

// Fallback order: en-GB → en-US → en → first available
```

### Schema Caching

Schemas are cached in memory after first fetch:

```javascript
// Check cache status
const stats = entryValidationService.getStats();
console.log(`Initialized: ${stats.isInitialized}`);
console.log(`Schemas loaded: ${stats.schemaStats.totalSchemas}`);

// Reset cache if needed
entryValidationService.reset();
```

## Debugging

### Validation Statistics

```javascript
import { getValidationStats } from '../utils/schemaInitializer';

const stats = getValidationStats();
console.log('Validation Stats:', stats);
```

### Field Analysis

```javascript
import contentTypeSchemaService from '../services/contentTypeSchemaService';

const analysis = contentTypeSchemaService.getFieldAnalysis('igGridASection');
console.log('Field Analysis:', analysis);
// Output: { requiredFields: [...], optionalFields: [...], totalFields: 12 }
```

### Logging

The system provides comprehensive logging:

```javascript
// Enable debug logging
logger.setLevel('debug');

// Logs include:
// 🚀 Schema initialization
// 🔍 Entry validation progress
// ✅ Successful validations
// ❌ Validation failures
// 📊 Summary statistics
```

## Best Practices

1. **Initialize Early**: Call `initializeSchemaValidation()` at app startup
2. **Handle Failures Gracefully**: Always check validation results before conversion
3. **Show User Feedback**: Use `ValidationStatusAlert` to inform users of issues
4. **Monitor Performance**: Schema fetching happens once, validation is fast
5. **Test Thoroughly**: Validate with various entry states (draft, published, incomplete)

## Migration from Hardcoded Validation

The new system replaces the hardcoded field requirements in `config/fieldRequirements.js`:

```javascript
// OLD: Hardcoded requirements
import { REQUIRED_FIELDS } from '../config/fieldRequirements';
const required = REQUIRED_FIELDS[contentType];

// NEW: Dynamic schema-based validation
import entryValidationService from '../services/entryValidationService';
const results = entryValidationService.validateEntry(entry, locale);
```

## Future Enhancements

- **Real-time Schema Updates**: Automatically refresh schemas when content types change
- **Custom Validation Rules**: Support for business logic beyond required fields
- **Validation Caching**: Cache validation results for performance
- **Bulk Validation API**: Server-side validation for large datasets
- **Integration Testing**: Automated tests with real Contentful data

## Troubleshooting

### Common Issues

1. **"Validation service not initialized"**
   - Solution: Call `initializeSchemaValidation()` before using validation

2. **"No schema found for content type"**
   - Solution: Ensure content type exists and MCP has access

3. **"MCP functions not available"**
   - Solution: Ensure MCP integration is properly configured

4. **Validation seems too strict/lenient**
   - Solution: Check actual Contentful schema vs expected requirements

### Support

For issues or questions about the validation system:
1. Check the logs for detailed error information
2. Verify schema initialization completed successfully
3. Test with a single entry to isolate issues
4. Review the validation results structure for debugging data

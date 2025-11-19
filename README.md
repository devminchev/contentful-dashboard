# Contentful Dashboard

## What this project is
The Contentful Dashboard is Bally's internal developer-experience hub that lives directly inside the Contentful UI and exposes the operational tooling that GameOps editors, Release managers, and Nightwatch support teams use every day. Each location registered with the Contentful App Framework loads a curated page—Home, Section Converter, OpenSearch sync panels, cache controls, and more—so non-technical users can reason about the same workflows engineers automate (GraphQL reads, CMA writes, OpenSearch sync jobs, Redis invalidations) without juggling scripts or external consoles.【F:src/routes.js†L20-L229】

## Key capabilities for Dev Hub teams
| Area | Why it exists |
| --- | --- |
| Content hygiene | The **Home** screen batches draft and archived entries so the Release team can clean up a backlog with one click while the UI shows progress bars driven by shared hooks.【F:src/Home/Home.jsx†L7-L33】 |
| Model migration | **Section Converter** discovers legacy IG sections, previews compatible targets, throttles conversion jobs, and reports errors to editors so they can modernize structures confidently.【F:src/SectionConverter/SectionConverter.jsx†L1-L200】 |
| Section QA | **A-Z Sections Games** ensures every "all games" section stays alphabetized per venture, showing refresh and publish buttons for each section wrapper.【F:src/AtoZSectionsGames/AtoZSectionsGames.jsx†L8-L44】 |
| Link integrity | **SiteGame Operations** and the **Unlinked SiteGame Filter** expose the relationships between SiteGame/SiteGameV2 entries and every section that consumes them, letting editors unlink or mass-remove problematic references with guard rails provided by CMA dialogs and GraphQL filters.【F:src/SiteGameOperations/SiteGameOperations.jsx†L9-L79】【F:src/hooks/useSiteGameLinks.js†L7-L115】【F:src/SiteGameOperations/UnlinkedSiteGames.jsx†L9-L105】 |
| Release automation | The **Release Automation** module wraps Contentful environment creation, alias flips, and admin confirmations into a guided wizard that enforces two-step confirmation before production promotions finish.【F:src/Release/Release.jsx†L7-L45】【F:src/hooks/useNewRelease.js†L9-L103】 |
| Bulk metadata | **Game Metadata Upload** parses Excel master templates, normalizes metadata, and streams CMA updates + bulk publish/validate jobs in chunks so hundreds of GameV2 entries update safely in one pass.【F:src/GameMetadataUpload/GameMetadataUploadByMasterTemplate.jsx†L8-L70】【F:src/hooks/useMasterTemplateMetadata.js†L1-L239】 |
| Cache controls | **Cache Management** links Redis invalidation patterns to human-friendly forms, so GameOps can drop specific layout/game keys without memorizing naming conventions.【F:src/CacheManagement/CacheManagement.jsx†L1-L15】【F:src/CacheManagement/CacheDataControl.jsx†L7-L123】【F:src/hooks/useRedisCacheControl.js†L6-L75】 |
| Search sync | **Opensearch Content Sync** (legacy), **Opensearch Content Sync V3**, and **OSV3 Index Management** orchestrate all data pushes from Contentful into OpenSearch clusters, including EU/NA environments, personalised ML indexes, and destructive maintenance tools with admin gating.【F:src/OpensearchContentSync/OpensearchContentSync.jsx†L17-L113】【F:src/OpensearchContentSync/OpensearchContentSyncV3.jsx†L18-L123】【F:src/OpensearchContentSync/OpensearchNonProdIndexManagement.jsx†L38-L201】 |
| Observability | **Team Content Stats** runs CMA queries to chart who updated or published content across date ranges, giving managers a live productivity dashboard.【F:src/TeamContentStats/TeamContentStats.jsx†L1-L200】 |

## Tech stack & platform integrations
- **Framework & tooling:** React 18 + react-scripts, Redux Toolkit, styled-components, Forma 36, and Jest/RTL for tests as defined in `package.json` dependencies.【F:package.json†L1-L58】
- **Routing & permissions:** Hash-based routing with guarded routes and role flags (Nightwatch, Admin, Super Users) ensures only the right teams see high-risk tools such as release automation or OpenSearch index cleanup.【F:src/routes.js†L14-L229】
- **Contentful APIs:** `useSetApi` bootstraps Contentful Management & GraphQL clients per environment, so hooks can invoke CMA, GraphQL, and Bulk Action endpoints without extra wiring.【F:src/App.jsx†L16-L54】【F:src/hooks/useSetApi.js†L5-L28】【F:src/services/ContentfulConfig.js†L3-L74】
- **GraphQL data plane:** `GraphQlProvider` centralizes Contentful GraphQL queries for heavy workflows like fetching A-Z sections, site-game references, or SiteGameV2 link audits.【F:src/Context/GraphQlProvider.js†L6-L152】
- **Search & ops plane:** `OpenSearchProvider` stores authenticated axios clients for dev/staging/prod/GenAI clusters, exposes health/index metadata, and powers every OpenSearch tool in the routes table.【F:src/Context/OpenSearchProvider.js†L7-L135】
- **Scripting:** Yarn/NPM scripts provide start/build/test/lint plus Contentful App uploads for manual or CI releases.【F:package.json†L20-L45】

## Architecture at a glance
1. **Contentful locations** – `App.jsx` detects whether the app is mounted in Config, Page, or Home locations and lazy-loads the matching component inside the OpenSearch provider once CMA/GraphQL clients are initialized.【F:src/App.jsx†L10-L54】
2. **Service bootstrap** – `useSetApi` invokes `setupContentfulService`, which in turn creates re-usable CMA, environment, and GraphQL axios clients plus locale metadata so downstream hooks all agree on the correct space/env aliases.【F:src/hooks/useSetApi.js†L5-L28】【F:src/services/ContentfulConfig.js†L16-L66】
3. **Context providers** – `GraphQlProvider` and `OpenSearchProvider` each encapsulate authenticated axios instances, long-running query progress, and helper methods (e.g., get all A-Z sections, load `_cat/indices`) exposed via React context hooks consumed by feature modules.【F:src/Context/GraphQlProvider.js†L18-L152】【F:src/Context/OpenSearchProvider.js†L7-L135】
4. **Routing shell** – `routes.js` lists every feature module, path, label, and required permission key. The root shell renders `ProtectedRoute` wrappers so unauthorized users see an explanation instead of the tool itself.【F:src/routes.js†L14-L229】
5. **Feature isolation** – Each tool (SectionConverter, Release, SiteGameOperations, etc.) keeps its own state machines, hooks, and services, but relies on shared primitives (`useSDK`, `GraphQlProvider`, `OpenSearchProvider`, CMA service helpers) to avoid bespoke API wiring.

## Feature deep dive
### Home & cleanup
`Home.jsx` uses the shared `useEntries` and `useContentCleanup` hooks to fetch draft/archived entries and optionally delete them, while progress indicators update as background jobs run. This page gives Release managers a quick signal of outstanding cleanup work before a release.【F:src/Home/Home.jsx†L7-L33】

### Section Converter (Dev Experience Hub)
The converter initializes `sectionService`, `conversionService`, and `conversionOrchestrator` with the Contentful SDK, fetches up to 100 IG sections per type, debounces search/filter updates, and uses a rate limiter + progress indicator so editors can migrate sections without hitting CMA rate limits. Debug toggles and conversion previews make the job transparent for both engineers and GameOps specialists.【F:src/SectionConverter/SectionConverter.jsx†L26-L200】

### A-Z Section Games
This module consumes the `GraphQlProvider` to collect every "all games" section across ventures, lets editors sort/publish each section individually, and surfaces progress bars when GraphQL requests are in-flight. The refresh button re-runs the aggregation so ops teams can iterate quickly after editing content in Contentful.【F:src/AtoZSectionsGames/AtoZSectionsGames.jsx†L8-L44】

### SiteGame Operations & Unlinked filters
`useSiteGameLinks` orchestrates CMA dialogs, linking lookups, and update/publish sequences so an editor can select SiteGames, inspect every linked section, unlink individual references, or purge all relationships in one go. The companion `UnlinkedSiteGames` page reuses the GraphQL context to stream SiteGameV2 entries, apply environment filters, and return only those with zero inbound section links—ideal for audit and remediation efforts.【F:src/hooks/useSiteGameLinks.js†L7-L115】【F:src/SiteGameOperations/SiteGameOperations.jsx†L9-L79】【F:src/SiteGameOperations/UnlinkedSiteGames.jsx†L9-L105】

### Release automation
`Release.jsx` delegates to `useNewRelease`, which wraps Redux actions for preparing environments, uses Contentful dialogs to double-confirm destructive actions, and enforces admin-only access before flipping the master alias. Status flags expose whether a release is prepared, in progress, or blocked so the workflow stays transparent.【F:src/Release/Release.jsx†L7-L45】【F:src/hooks/useNewRelease.js†L9-L103】

### Game Metadata Upload
`GameMetadataUploadByMasterTemplate.jsx` feeds Excel files through `useExcelFile` and `useMasterTemplateMetadata`, which build lookups of all GameV2 entries, normalize metadata fields, perform incremental CMA updates, then run bulk validation/publish cycles (200 entries at a time) while tracking failed IDs. This turns a tedious manual update into a deterministic pipeline that both engineers and editors can monitor.【F:src/GameMetadataUpload/GameMetadataUploadByMasterTemplate.jsx†L8-L70】【F:src/hooks/useMasterTemplateMetadata.js†L1-L239】

### Cache Management
`CacheManagement.jsx` checks Redis availability via `useRedisCache`; once connected, `CacheDataControl` exposes toggle sections for every key namespace and builds deterministic cache-key patterns (layout, all games, policies, etc.) based on venture/platform/locale form inputs before invoking the delete endpoint. That means ops folks no longer need CLI access to flush stale widgets across ventures.【F:src/CacheManagement/CacheManagement.jsx†L1-L15】【F:src/CacheManagement/CacheDataControl.jsx†L7-L123】【F:src/hooks/useRedisCacheControl.js†L6-L75】

### OpenSearch sync suite
- **Legacy sync** focuses on ventures, categories, layouts, sections, games, personalisation defaults, and archived data, letting Nightwatch engineers fetch index snapshots or trigger sync jobs per index. Buttons are powered by specialized hooks for each OpenSearch index while the shared provider injects the correct axios client based on the selected environment.【F:src/OpensearchContentSync/OpensearchContentSync.jsx†L17-L113】
- **V3 sync (EU/GenAI)** adds lobby V3 indexes—game sections, ML sections/defaults, marketing sections, navigation, views, themes, etc.—and expands environment toggles to GenAI dev clusters. This keeps EU personalization/search experiences in lock-step with Contentful changes.【F:src/OpensearchContentSync/OpensearchContentSyncV3.jsx†L18-L123】
- **OSV3 Index Management** is an admin-only guardrail for destructive operations, providing dropdowns and confirmation modals for clearing individual or all indexes plus stats refreshes. It forces explicit environment selection and shows live maintenance state before running delete jobs.【F:src/OpensearchContentSync/OpensearchNonProdIndexManagement.jsx†L38-L201】

### Team Content Stats
This dashboard queries CMA for all entries updated or published by members of a selected team between two dates, groups the events by day/week/month, and renders Line/Bar charts via Chart.js so editors can prove throughput or identify bottlenecks. Date pickers, filters, and refresh actions keep the data interactive.【F:src/TeamContentStats/TeamContentStats.jsx†L1-L200】

## Cross-platform sync flows
- **GraphQL reads** – Centralized queries inside `GraphQlProvider` expose helper methods (`getAllGamesSections`, `getSiteGameV2Links`, etc.) so components like A-Z Sections and Unlinked SiteGames can make high-volume GraphQL calls with consistent auth headers and progress tracking.【F:src/Context/GraphQlProvider.js†L18-L152】
- **CMA writes** – Hooks such as `useMasterTemplateMetadata`, `useSiteGameLinks`, and `useNewRelease` combine CMA clients, dialog confirmations, and notifier feedback to wrap multi-step operations (bulk publish, unlink entries, manage environments) into safe UI commands.【F:src/hooks/useMasterTemplateMetadata.js†L42-L239】【F:src/hooks/useSiteGameLinks.js†L7-L115】【F:src/hooks/useNewRelease.js†L9-L103】
- **OpenSearch integration** – `OpenSearchProvider` authenticates against dev/staging/prod clusters, surfaces `_cat/indices` responses, and gives every sync tool an axios client plus environment switchers. Hook modules (`useVenturesIndex`, `useGamesIndex`, etc.) plug into that provider to fetch/sync specific indexes.【F:src/Context/OpenSearchProvider.js†L7-L135】【F:src/OpensearchContentSync/OpensearchContentSync.jsx†L17-L113】
- **Cache invalidation** – `useRedisCacheControl` encodes each cache namespace’s key structure and calls the Redis service delete endpoint with the proper composite key, preventing typos or accidental production flushes.【F:src/hooks/useRedisCacheControl.js†L6-L75】

## Local development
1. **Prerequisites** – Install Node.js 18+ and Yarn/NPM, along with Contentful CLI access for app uploads (the scripts rely on `contentful-app-scripts`).【F:package.json†L1-L58】
2. **Environment variables** – Create a `.env` file with:
   - `REACT_APP_CONTENTFUL_ACCESS_TOKEN` for CMA write access.【F:src/services/ContentfulConfig.js†L3-L63】
   - `REACT_APP_GRAPHQL_TOKEN_UK` / `REACT_APP_GRAPHQL_TOKEN_US` so GraphQL requests authenticate in UK (`nw2595tc1jdx`) vs US spaces.【F:src/Context/GraphQlProvider.js†L13-L30】
3. **Install dependencies** – `yarn install` (or `npm install`).【F:package.json†L1-L58】
4. **Start the dashboard** – `yarn start` / `npm start` runs `react-scripts start` with `BROWSER=none`, so the Contentful App Framework opens the embedded iframe itself.【F:package.json†L20-L26】
5. **Run tests & linting** – `yarn test`, `yarn test:watch`, and `yarn lint` wrap the configured React Scripts test runner and ESLint glob defined in `package.json`.【F:package.json†L26-L33】

## Deployment
1. **Build:** `yarn build` produces the production bundle with source maps disabled (see the `GENERATE_SOURCEMAP=false react-scripts build` script).【F:package.json†L26-L28】
2. **Manual upload:** `yarn upload` uses `contentful-app-scripts upload --bundle-dir ./build` and will prompt for organization, definition, and token unless already configured.【F:package.json†L33-L36】
3. **CI upload:** `yarn upload-ci` reads `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, and `CONTENTFUL_ACCESS_TOKEN`, annotates the bundle with the latest commit message, and uploads without prompts—perfect for GitHub Actions or CircleCI flows.【F:package.json†L33-L41】

## Contributing & dev experience tips
- Follow the existing pattern: each feature owns its folder, hooks live under `src/hooks`, and API logic sits in `src/services`. Reuse the `GraphQlProvider`, `OpenSearchProvider`, and CMA helpers so new pages automatically benefit from existing authentication flows.
- When adding routes, update `src/routes.js` with the path, permission key, and label so it shows up in the sidebar and inherits the permission guardrails already in place.【F:src/routes.js†L14-L229】
- Lean on Forma 36 components and shared styled mixins (`PageWrapper`, `ListHeader`, etc.) to keep the UI consistent across GameOps tooling.

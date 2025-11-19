# Contentful Dashboard

## Introduction
Contentful Dashboard is Bally's internal Contentful App that bundles a curated set of operational tools inside the Contentful UI. Non-technical Content, Release, and Nightwatch teams use the dashboard to audit game metadata, migrate section models, keep OpenSearch in sync, trigger cache refreshes, and upload curated Excel sheets without leaving Contentful. The app loads directly inside Contentful, so everyone interacts with a single, familiar interface rather than juggling ad-hoc scripts.

## Tech Stack
- **Framework:** React 18 with Create Contentful App (Create React App under the hood)
- **UI:** Contentful Forma 36 component library and icons
- **State:** Redux Toolkit, React Context (GraphQL + OpenSearch providers), and custom hooks
- **Routing:** React Router (hash-based) with custom permission guarding
- **Data & APIs:** Contentful Management SDK, Contentful GraphQL API, Axios/axios-hooks, OpenSearch REST endpoints, Excel parsing (xlsx)
- **Tooling:** react-scripts, cross-env, Jest/React Testing Library, ESLint, pre-commit hooks

## How the project works
1. **Locations and bootstrap** (`src/App.jsx`, `src/locations/`): the app registers handlers for Contentful App locations (Config, Page, Home). `useSetApi` wires the Contentful Management and GraphQL clients with the space + environment provided by the SDK.
2. **Core shell** (`src/core/`): `Root.jsx` injects Redux, React Router, and the `GraphQlProvider` inside the `OpenSearchProvider`. `Routes.jsx` renders the feature modules defined in `src/routes.js`.
3. **Permission layer:** `ProtectedRoute` and `useRouteAccess` read the user's Contentful team memberships (e.g., Nightwatch, Super Users) and gate specific tools.
4. **Feature modules:** Each folder under `src/` (e.g., `SectionConverter`, `Release`, `SiteGameOperations`, `GameMetadataUpload`) encapsulates UI, hooks, and services for a tool. Modules lean on shared hooks (`src/hooks/`), services (`src/services/`), and styled helpers (`src/common/`).
5. **Data providers:**
   - `OpenSearchProvider` maintains authenticated axios clients for the dev/staging/prod OpenSearch clusters and streams index metadata to the UI.
   - `GraphQlProvider` exposes helper methods for high-volume Contentful GraphQL queries (sections, site games, etc.).
6. **Workflow automation:** Hooks such as `useNewRelease`, `useRedisCache`, `useExcelMetadata`, and `useSiteGameLinks` bundle Contentful operations (fetch, transform, publish) alongside Excel parsing utilities to drive the UI workflows.

## Purpose & architecture overview
The dashboard centralizes recurring operational workflows for Bally's interactive gaming catalog:
- **Content introspection:** `Home`, `AtoZSectionsGames`, `TeamContentStats`, and `SiteGameOperations` report on draft/archived content, site game linkages, and per-team output.
- **Bulk editing & migration:** `SectionConverter` migrates IG sections between model types, `GameMetadataUploadByMasterTemplate` ingests Excel templates, and `Release` automates multi-step publishing.
- **Search/index health:** `OpensearchContentSync` (legacy + V3) and `OSV3 Index Management` keep Contentful content synchronized with multiple OpenSearch clusters, while `CacheManagement` triggers Redis cache invalidations.
- **Quality control:** `UnlinkedSiteGames` and supporting hooks scan for orphaned entries so editors can fix issues before release.

A high-level architecture map:
- **Presentation:** React components (Forma 36-based) organized by feature modules.
- **State management:** Redux Toolkit store (`src/store/`) plus localized hook state inside modules.
- **API layer:** `ContentfulConfig` builds reusable Management + GraphQL clients per space/environment. Feature services orchestrate long-running tasks via rate limiters, batching, and Excel helpers.
- **Context providers:** `GraphQlProvider` and `OpenSearchProvider` expose heavy-weight clients and progress tracking to descendant components.
- **Routing & permissions:** `routes.js` defines all navigable tools, metadata, and optional permission keys enforced by `ProtectedRoute`.

## Repository layout
```
src/
├── App.jsx, index.jsx            # Entry points wired to Contentful locations
├── core/                         # Root shell, layout, router, protected routes
├── routes.js                     # Feature map & permission metadata
├── Context/                      # GraphQL and OpenSearch providers
├── hooks/, services/, utils/     # Shared data-fetching + transformation logic
├── Home/, Release/, SectionConverter/, ...  # Feature-specific modules
├── store/                        # Redux setup, reducers, selectors
└── common/                       # Shared styles and components
```

## Prerequisites
- Node.js 18+ and npm 9+ (or the matching Yarn release) are recommended for parity with `react-scripts` 5.
- A Contentful space with the app installed (use the Contentful App Framework) and API tokens with permissions to manage entries.
- Optional: access to the Bally's OpenSearch clusters if you need to exercise the synchronization tooling.

## Installation & local development
1. **Install dependencies**
   ```bash
   # using yarn
   yarn install
   # or npm
   npm install
   ```
2. **Configure environment variables** (create a `.env` file at the repo root):

   | Variable | Description |
   | --- | --- |
   | `REACT_APP_CONTENTFUL_ACCESS_TOKEN` | Contentful Management API token used by `ContentfulConfig`.
   | `REACT_APP_GRAPHQL_TOKEN_UK` | GraphQL Content Delivery token for the UK space (`nw2595tc1jdx`).
   | `REACT_APP_GRAPHQL_TOKEN_US` | GraphQL token for the US space.

   _CLI uploads_: when running `npm run upload-ci`, also export `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, and `CONTENTFUL_ACCESS_TOKEN` (Personal Access Token).

3. **Start the app locally**
   ```bash
   npm start
   # or
   yarn start
   ```
   The Contentful CLI registers or updates the app definition, starts the dev server (`http://localhost:3000`), and opens the app inside the Contentful UI (browser launching is disabled via `BROWSER=none`).

4. **Run tests and linting**
   ```bash
   npm test           # Single run; use npm run test:watch for watch mode
   npm run lint       # ESLint over src/**/*.js,jsx
   ```

## Usage
- Log into Contentful, open the environment where the app is installed, and navigate to the "Dashboard" tab provided by the custom app.
- Use the sidebar (defined in `src/routes.js`) to switch between tools:
  - **Section Converter** (`/section-converter`): fetches IG sections, previews target conversions, and orchestrates conversion jobs with progress tracking and rate limiting.
  - **Site Game Operations & Unlinked SiteGame Filter**: audit, link, and fix SiteGame/SiteGameV2 entries with helpers backed by `useSiteGameLinks` and GraphQL queries.
  - **A-Z Section Games**: inspect large all-games sections, using the GraphQL provider for batched requests.
  - **Release Automation**: step through release pipelines, leveraging hooks such as `useNewRelease` and Contentful Management mutations.
  - **Game Metadata Upload**: parse Excel templates (via `useExcelMetadata`/`xlsx`) and push structured metadata to Contentful.
  - **Cache & OpenSearch tools**: `CacheManagement`, `OpensearchContentSync`, `OpensearchContentSyncV3`, and `OSV3 Index Management` connect through `OpenSearchProvider` to run health checks, sync jobs, and index cleanups.
  - **Team Content Stats**: visualize output using `react-chartjs-2` and Chart.js.
- Role-based visibility (Nightwatch, Admin, Super Users) is enforced automatically; unauthorized users will see a contextual note.

## Building & deployment
- **Production build:**
  ```bash
  npm run build
  ```
  Bundles the app into `build/` with hashes and source maps disabled.
- **Upload manually:**
  ```bash
  npm run upload
  ```
  Prompts for the organization, app definition, and token, then uploads the `build/` directory as a bundle and activates it.
- **CI upload:**
  ```bash
  npm run upload-ci
  ```
  Reads configuration from the `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, and `CONTENTFUL_ACCESS_TOKEN` environment variables and annotates the bundle with the latest commit message (`scripts/extractCommitMessage.js`).

## Contributing
1. Install the pre-commit hooks (one-time per machine):
   ```bash
   brew install pre-commit   # or pip install pre-commit
   pre-commit install
   ```
2. Hooks automatically trim whitespace, enforce newlines, look for merge conflicts, detect accidental secrets/large files, and validate YAML before every commit. You can run them manually with `pre-commit run --all-files`.
3. Create a feature branch, make your changes, and keep modules consistent with the existing patterns (hooks for data orchestration, services for API calls, Forma 36 UI components).
4. Run `npm test` and `npm run lint` before opening a pull request.

## Further reading
- [Create Contentful App docs](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/)
- [Create React App docs](https://create-react-app.dev/docs/getting-started/)
- [Contentful Management SDK](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Contentful GraphQL API](https://www.contentful.com/developers/docs/references/graphql/)
- [Forma 36 Design System](https://f36.contentful.com/)

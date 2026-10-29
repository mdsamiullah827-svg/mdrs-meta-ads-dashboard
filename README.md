# Meta Pulse — complete Vercel project

The original dashboard is included in full in src/App.jsx. This project uses
React + Vite + Tailwind CSS. The uploaded source was JavaScript/JSX despite its
.tsx extension, so this deliverable uses .jsx without disabling TypeScript checks.

## GitHub se Vercel deploy
1. ZIP extract karein.
2. Is folder ke CONTENTS GitHub repository root me upload karein.
   package.json aur index.html root me hone chahiye; src folder bhi upload karein.
   Sirf App.jsx ya ZIP file upload karna enough nahi hai.
3. Existing React project replace kar rahe hain to purane conflicting config files
   (for example old vite.config.ts / tailwind.config.cjs) retain na karein.
   Existing repository ka backup pehle rakhein.
4. Vercel me repository import karein. Settings:
   - Framework Preset: Vite
   - Root Directory: directory containing package.json (normally repository root)
   - Node.js: 24.x
   - Install Command: npm ci
   - Build Command: npm run build
   - Output Directory: dist
5. Deploy karein. Existing Vercel project me conflicting old settings reset karein.
   vercel.json already supplies install/build/output settings.
6. No environment variables are required to build or open the demo dashboard.

## Local run
Use Node.js 24.
npm ci
npm run dev

Production verification:
npm run build
npm run preview

## API setup
- Meta: open Data Sync & API Setup / Live API connector and paste your authorized
  Meta token. The existing API version selector, account discovery, insights,
  date filters, auto-sync and account controls remain.
- Gemini: open AI Optimization Hub, paste your own Gemini API key into the new
  password input, then generate a strategy. This key is held in React state only;
  refreshing the page clears it. Requests go directly from your browser to Google.
- No credentials are included. Live service success depends on valid credentials,
  permissions, API/model availability, quota and the selected API version.
- Gemini failure shows an explicit error; the original example strategy remains
  available as a labeled fallback, not a successful AI analysis.
- Do not put secret tokens in VITE_ environment variables: these are compiled
  into public browser JavaScript. Legacy support in the original app is retained,
  but entering a token through the UI is recommended for this personal dashboard.
- The existing optional "remember token" setting stores Meta tokens in localStorage.
- Client-view links remain available. Including a token is now opt-in and clearly
  labeled as Base64, not encryption. The client view is a UI filter, not server
  authorization. Anyone receiving a token-bearing URL can recover that token.
  This project has no authenticated, multi-tenant backend.

## Features retained
Overview KPIs and trends; campaign table, search, sorting and status controls;
audience, demographic, device and geography views; placements; currency handling;
date selection; custom campaign input; CSV export; AI optimization suggestions,
forecasts, strategy and hooks; Meta API controls and live refresh; client sharing;
dark/light theme and responsive desktop/mobile navigation.

Existing limitations are retained: campaign pause/optimization actions are local
dashboard simulations, not writes to Meta; demo and some illustrative metrics
are not live telemetry. Live refresh runs while the browser page is open, not as
a 24/7 server worker. Multi-account aggregation and large-account API pagination
have not been comprehensively audited in this deployment repair.

## Fixes
- Fixed the undefined exactCpr reference in account summary:
  exactCpr: exactAccountCpr.
- Added complete entry point, dependency manifest and npm lockfile.
- Added Tailwind/PostCSS/Vite/Vercel configuration.
- Added build-time checks for undefined variables, duplicate keys and unreachable code.
- Replaced the empty Gemini key with a session-only key input and useful errors.
- Corrected AI account name lookup to use discovered accounts.
- Corrected token-sharing and deployment wording.
- Split production charts/vendor bundles to avoid the 500 kB chunk warning.

## Validation
- npm run build: PASS (includes npm run check).
- React render and navigation through all five tabs in jsdom: PASS.
- Missing Gemini key validation: PASS.
- Mocked Meta account summary, campaign sync and breakdown requests: PASS;
  regression path containing the original exactCpr ReferenceError is exercised.
- No real Meta/Gemini calls or Vercel deployment were performed.
- Full browser visual QA was unavailable: Chromium download failed in the
  execution environment. jsdom chart-size warnings are expected because it
  does not perform browser layout; they are not visual verification.

The supplied screenshot contains deployment statuses, not the actual build log.
The exact cause of that earlier Vercel failure therefore cannot be established.
This complete project builds successfully in the provided environment.

Reference documentation:
https://vite.dev/guide/static-deploy
https://vercel.com/docs/builds/configure-a-build

## Theme, PDF and campaign-builder update
- Light theme now remaps fixed dark text/panel styles, including cards, tables,
  dialogs and accent colors. Existing dark theme is retained.
- Export captures campaign data when opened; CSV and a paginated landscape PDF
  are available. PDF renders Unicode campaign names as an image for font fidelity.
  Print / Save as PDF is an additional browser-native fallback.
- Create Campaign supports real Website Traffic campaigns: single-image
  Facebook Feed ads, country/age targeting, daily budget, headline, text and CTA.
  All campaign/ad-set/ad objects are PAUSED; activate only through Ads Manager.
  Messaging, leads/forms, video, special categories and other objectives are not
  implemented in this builder.
- Requires the client's authorized Meta token with ads_management and Page access.
  Client-view mode requires its own session token for creation, not a shared
  reporting token. Account currency is verified before writes.
- Only two-decimal account currencies listed in the UI are currently supported.
- Gemini setup assistant sends only the entered brief and non-secret setup fields.
  Recommendations are not applied or published automatically.
- There is no automatic write retry. Partial success shows IDs so a user can
  inspect and complete the setup in Ads Manager rather than creating duplicates.
- node --test tests/campaignApi.test.js verifies ordered writes, PAUSED status,
  minor-unit conversion, currency mismatch, input validation and partial failures.
- Real Meta writes / Gemini responses were not tested without user credentials.

# MDRS Meta Ads — secure client portal

React/Vite reporting dashboard with Vercel Node API functions, Neon Postgres and Better Auth. Client users sign in with a unique username/password and can read only accounts assigned to their business. Meta and Gemini keys are never sent to the browser.

## Roles and access

- **Client:** assigned account reports, filters, charts, CSV/PDF exports and AI explanations. No campaign writes, client management or secret access.
- **Admin:** client/user management, account verification and assignment, disabling access, password resets and paused campaign creation. Admin MFA is mandatory.
- Temporary passwords must be changed before any account data is accessible. Public signup is disabled. Passwords are hashed by Better Auth; sessions use HttpOnly cookies.
- Every backend account request verifies the session, current user status, active business and account assignment. An account cannot be assigned to two businesses. Reports are private/no-store; no shared tenant cache is used.

## Hosting configuration

- Vercel project: `mdrs-meta-ads-dashboard`
- Framework: Vite; Node 24; install: `npm ci`; build: `npm run build:vercel`; output: `dist`.
- `build:vercel` builds the app then applies additive auth/portal migrations to the production database. Preview builds do not mutate the production database.
- Neon built-in Auth remains enabled. This portal uses its own Better Auth tables in Postgres so username/password, mandatory admin MFA and invite-only account creation are controlled by the application.

### Server-only environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Provisioned Neon connection |
| `BETTER_AUTH_SECRET` | Random 32+ byte auth secret, Sensitive |
| `BETTER_AUTH_URL` | Canonical HTTPS production origin |
| `ADMIN_EMAIL` | Initial admin email |
| `ADMIN_INITIAL_PASSWORD` | Random initial admin password; only used if no admin exists |
| `META_TOKEN_DEFAULT` | Existing Meta credential, Sensitive |
| `META_TOKEN_CLIENTNAME` | Additional per-client Meta credential, Sensitive |
| `META_API_VERSION` | Server-selected supported Graph API version, e.g. v23.0 |
| `GEMINI_API_KEY` | Server-only Gemini key, Sensitive |
| `GEMINI_MODEL` | Optional model name; defaults to gemini-2.5-flash |

Never prefix a secret with `VITE_`. The integration's `VITE_NEON_AUTH_URL` is a public service URL, not a token, and is not consumed by this application. Do not put tokens in query strings, localStorage, GitHub, exported reports or support messages. If a token was used in a previous public frontend deployment, rotate it in Meta and update its server environment variable.

Environment changes require redeployment. Database connection strings are never returned through the application APIs. No secrets are present in this repository.

## Initial administrator

The migration initializes username `mdrs_admin` only when no admin exists. The owner receives the initial password separately, outside Git. First sign-in requires choosing a new password and enrolling an authenticator app. Store recovery codes privately. Clear `ADMIN_INITIAL_PASSWORD` after the owner completes setup; an existing admin is never reset by later deployments.

## Onboard each client

1. Admin signs in and opens **Manage clients**.
2. Create the client's business.
3. Add that client's Meta token to Vercel as a Sensitive server-only variable such as `META_TOKEN_MOLABIS`, then redeploy. No token goes into the client browser.
4. Select the business, enter its actual `act_...` account ID and select the token reference. The server verifies the ID, account name and currency with Meta before assigning it.
5. Create the client's username using their name and email. A strong temporary password is shown once to the administrator.
6. Share the portal URL, username and temporary password privately with that client. The application does not automatically email credentials.
7. The client chooses their own password on first login and sees only their assigned business accounts.

Disabling a user revokes their sessions. Disabling a business blocks its reporting requests immediately. Password recovery requests appear in the admin panel; the administrator must verify the client's identity before resetting. Email delivery/automatic email reset is not configured.

## Existing dashboard features

The existing light/dark dashboard, account currency handling, date filters, charts, breakdowns, campaign tables, CSV and PDF report exports, AI strategy screen and campaign builder remain. Clients cannot use campaign creation or local data editing. Custom campaign inputs and optimization simulations are admin-only local scenarios; they do not claim to update Meta. Campaign creation is admin-only and creates paused website-traffic / single-image Facebook Feed objects, with duplicate-attempt protection. Other objectives still require Ads Manager.

Live Meta reporting replaces demo data. Failed requests show an error instead of a fabricated AI audit. Page polling runs every 60 seconds while open; this is not an always-running data collection worker. Meta data may be delayed by Meta. Actual currency is verified from Meta.

## Local checks

```sh
npm ci
npm test
npm run build
```

`npm run dev` runs the frontend only; Vercel functions require `vercel dev` with a dedicated development database and environment. Do not point development or untrusted preview branches at production secrets. No client accounts or live ad mutations are created during tests.

Tests cover the real Better Auth username/password/session flow using a temporary SQLite database, signup rejection, password hashing, password change/logout, tenant authorization, admin MFA gates, query allowlisting, secret redaction, origin checks and paused campaign sequencing/failure handling.

## Reporting update

Clients can switch between the active accounts returned by their authenticated account list. Backend membership checks still apply on every request. Today is the initial period; Meta account timezone and returned reporting dates are shown. Custom time accepts inclusive YYYY-MM-DD start/end dates, validated in both UI and backend and reused for all breakdowns and AI account summaries. Report errors are visible and block exports.

PDF exports use direct text/table pagination for Latin reports, and small canvas-rendered text cells for non-Latin names (no full-page screenshots). Period headers wrap above the table on every page.

Gemini uses server-only GEMINI_API_KEY and optional GEMINI_MODEL (default gemini-3.8-flash). Add the API key as a Production Secret in Vercel and redeploy; it is never entered into the client dashboard. Missing key, rejected configuration, quota limits and unavailable models produce explicit errors.

## Lifetime, calendar and PDF fixes

Lifetime requests are converted on the server to an explicit approximately 37-month range in the ad account timezone, inside the historical retention boundary. Responses include the covered dates, displayed in the dashboard. This is available API history, not an assurance of all-time totals. Lifetime charts use monthly granularity.

Custom time opens a two-month clickable range calendar (one month on narrow screens) with month/year navigation, inclusive endpoints, Apply/Cancel and keyboard controls.

Download PDF generates a PDF and triggers the download directly; the modal retains a download link as a fallback. CSV metadata no longer activates slow rasterization. Non-Latin names use small canvas text images, with a bundled Devanagari font, while other table content stays selectable text.

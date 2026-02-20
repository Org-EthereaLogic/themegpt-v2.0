# UTM Attribution Audit

**Audited:** 2026-02-19
**Scope:** All outbound links originating from the Chrome extension popup
**Trigger:** Bridge Gate 1 investigation — reducing unassigned GA4 traffic to ≤10%

---

## Section 1 — Current Coverage (Built Surfaces)

As of v2.3.0, the extension has one UI surface that produces outbound links: `apps/extension/src/popup.tsx`. All 7 outbound links from this surface are UTM-tagged.

| # | Destination | `utm_source` | `utm_medium` | `utm_campaign` | `extension_version` | File location |
|---|-------------|-------------|-------------|----------------|---------------------|---------------|
| 1 | `/auth/extension` | `extension` | `popup` | `auth_flow` | Yes | `popup.tsx:135` — `handleConnect()` |
| 2 | `/?...#pricing` | `extension` | `popup` | `trial_teaser` | Yes | `popup.tsx:260` — 2nd premium click nudge |
| 3 | `/?...#pricing` | `extension` | `popup` | `trial_teaser` | Yes | `popup.tsx:263` — 3rd+ premium click nudge |
| 4 | `/?...#pricing` | `extension` | `popup` | `trial_teaser` | Yes | `popup.tsx:361` — account panel trial CTA |
| 5 | `/account` | `extension` | `popup` | `account_management` | Yes | `popup.tsx:371` — canceled state link |
| 6 | `/account` | `extension` | `popup` | `account_management` | Yes | `popup.tsx:380` — past_due state link |
| 7 | `/account` | `extension` | `popup` | `account_management` | Yes | `popup.tsx:521` — footer "Manage Account" |

Links 2, 3, and 4 share `utm_campaign=trial_teaser` — intentional for funnel cohesion.
Links 5, 6, and 7 share `utm_campaign=account_management` — intentional, all lead to the account page.

---

## Section 2 — No Gaps in Built Surfaces

As of v2.3.0 all 7 outbound links from the popup — the only built surface — are properly tagged. There are no UTM attribution gaps in currently-built extension code.

The v2.2.2 remediation fixed the original gaps (missing UTM params, wrong URL parameter order with hash fragment before query string). The v2.3.0 release added `extension_version` attribution to all 7 links.

---

## Section 3 — Unbuilt Surfaces: `ext_sidebar` and `ext_app_menu`

These UTM identifiers were referenced in the measurement plan as future surfaces. Neither surface exists in the codebase today. No `ext_sidebar` or `ext_app_menu` strings appear anywhere in the repository.

### When `ext_sidebar` is built

A Chrome MV3 sidebar panel (using `chrome.sidePanel` API). All outbound links from this surface should use:

| Parameter | Value |
|-----------|-------|
| `utm_source` | `extension` |
| `utm_medium` | `sidebar` |
| `utm_campaign` | context-specific (e.g., `auth_flow`, `trial_teaser`, `account_management`) |
| `extension_version` | `${getExtensionVersion()}` (reuse existing helper) |

### When `ext_app_menu` is built

A browser toolbar or context menu entry. All outbound links from this surface should use:

| Parameter | Value |
|-----------|-------|
| `utm_source` | `extension` |
| `utm_medium` | `app_menu` |
| `utm_campaign` | context-specific |
| `extension_version` | `${getExtensionVersion()}` |

**Convention note:** Keep `utm_source=extension` consistent across all extension surfaces. The surface identity goes in `utm_medium` (popup, sidebar, app_menu). This matches the existing popup convention and makes per-surface filtering in GA4 straightforward.

---

## Section 4 — Gate 1 Relevance

The unassigned traffic at 25% (Gate 1) is **not caused by missing UTM tags on built surfaces**. All built links are properly tagged as of v2.2.2/v2.3.0.

The most likely cause is internal and staging traffic reaching GA4 without being filtered:
- Staging URL: `https://theme-gpt-web-dufb63uofq-uc.a.run.app`
- Local development sessions

**Fix:** Apply the GA4 internal traffic filter per `docs/ga4-filter-guide.md`. Once the filter is activated, track daily unassigned % in `doc/dev/gate-tracking-log.md`.

The unbuilt `ext_sidebar` and `ext_app_menu` surfaces will not affect Gate 1 until those features are built and shipped.

# GA4 Internal Traffic Filtering Guide

To fulfill **Priority 3** of the Bridge Week roadmap (v2.2.2), follow these steps to filter out traffic from the staging URL and local development. This will reduce "Unassigned" noise caused by internal testing.

## Step 1: Define Internal Traffic in GA4

1. Log in to [Google Analytics](https://analytics.google.com/) and go to **Admin**.
2. Under **Data collection and modification**, click on **Data Streams**.
3. Select your Web data stream.
4. Click on **Configure tag settings** (at the bottom).
5. Click **Show all** to reveal more settings.
6. Click **Define internal traffic**.
7. Click **Create**.
8. **Configuration Name:** `Staging and Local Dev`
9. **traffic_type value:** `internal` (leave as default)
10. **IP address Match type:** `IP address equals`
    * *Note: Since the staging URL is a shared Cloud Run instance, filtering by IP may not be feasible if you don't have a static IP. Alternatively, we use the `internal` parameter.*
    * **Manual Action Required:** The internal traffic IP definition must be added manually in the GA4 Admin console because automated tools (like gcloud or unauthenticated browser sessions) lack the required scopes. Add IP `50.53.12.179`, set the type to `IP address equals`, and save. The existing filter will automatically catch it.

## Step 2: Create the Data Filter

1. Go back to **Admin**.
2. Under **Data collection and modification**, click on **Data Filters**.
3. Click **Create filter**.
4. Select **Internal Traffic**.
5. **Data Filter Name:** `Internal Traffic`
6. **Filter Operation:** `Exclude`
7. **Filter State:** `Testing` (Recommended: keeps the data but marks it so you can verify before permanent exclusion).
8. Click **Create**.

## Step 3: Verify and Activate

1. Go to the **Realtime** report.
2. Add a comparison: **Test data filter name** exactly matches `Internal Traffic`.
3. Perform actions on the staging site: `https://themegpt-web-dufb63uofq-uc.a.run.app`
4. Once verified that your staging traffic is being caught by the filter, go back to **Data Filters** and change the state from `Testing` to `Active`.

> [!IMPORTANT]
> Once a filter is **Active**, the data is permanently excluded from your reports and cannot be recovered. Always use `Testing` first.

---

## Filter Application Status

Current verified status:

| Field | Value |
|-------|-------|
| Clarity IP block (`50.53.12.179`) | Live (Feb 22, 2026) — project `vky4a128au` |
| GA4 internal traffic rule (`EthereaLogic Dev`, `50.53.12.179`) | Added (Feb 22, 2026) — property `516189580`, stream `G-41BZB7X7H7` |
| Filter applied (Testing state) | Applied (Feb 20, 2026) |
| Verified in Realtime report | Verified (Feb 20, 2026) |
| Filter activated (Active state) | Activated (Feb 20, 2026); re-confirmed Active (Feb 22, 2026) on correct property `516189580` |
| Staging URL reachability check | Verified live (Feb 20, 2026) — redirects to `https://themegpt.ai/` |

> Once activated, the Gate 1 observation window begins in earnest. Track daily unassigned traffic % in `doc/dev/gate-tracking-log.md`.

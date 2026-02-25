# CWS Listing Audit - 2026-02-25

- Live listing: https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba
- Required promo video: https://youtu.be/TFgUKvVzA6U
- JSON artifact: `doc/report/audit-artifacts/cws/cws-listing-checks.json`

## Live Media
- Screenshot URLs found: 5
- Video embed URLs found: 1
- Required video embeds found: 1

## Checks
| Check ID | Status | Severity | Details | Evidence |
|---|---|---|---|---|
| draft_short_description_length | pass | blocker | Short description length is 125 characters. | doc/chrome-store-listing.md |
| draft_contains_required_video_url | pass | blocker | Draft listing includes required promo video URL https://youtu.be/TFgUKvVzA6U. | doc/chrome-store-listing.md |
| draft_theme_counts_match_production | pass | blocker | Draft claims total/free/premium = 15/7/8; production is 15/7/8. | doc/chrome-store-listing.md |
| live_screenshot_media_present | pass | blocker | Live listing screenshot count: 5. | https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba |
| live_screenshot_media_compliance | pass | blocker | All live screenshots meet dimension and size limits (>=1280x800, <=5MB). | https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba |
| live_required_video_embed_present | pass | blocker | Found 1 unique embed URLs containing TFgUKvVzA6U. | https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba |
| live_support_link_status | pass | blocker | Support URL returned HTTP 200. | https://themegpt.ai/support |
| live_privacy_link_status | pass | blocker | Privacy URL returned HTTP 200. | https://themegpt.ai/privacy |
| live_contains_video_url_evidence | pass | info | Video embed URLs: https://www.youtube.com/embed/TFgUKvVzA6U?rel=0&wmode=opaque&enablejsapi=1 | https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba |

# Popup Integration Audit

- Extension ID: pcdkcdlpchehllcamnklnijdcfgnnofk
- Popup screenshot: `doc/report/audit-artifacts/popup/popup-full.png`
- Card screenshots directory: `doc/report/audit-artifacts/popup/theme-cards`
- JSON artifact: `doc/report/audit-artifacts/popup/popup-checks.json`

| Check ID | Status | Severity | Details | Evidence |
|---|---|---|---|---|
| popup_theme_card_count | pass | blocker | Expected 15 theme cards, found 15. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_theme_names_present | pass | blocker | All production theme names are visible in popup cards. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_thumbnails_loaded | pass | blocker | All 15 theme cards render loaded screenshot thumbnails. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_canvas_selector_options | pass | blocker | Canvas options rendered: Off, Side Top, Compose Right. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_session_tokens_visible | pass | blocker | Session Tokens block is visible in popup. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_theme_cards_clickable | pass | warning | All 7 apply-state theme cards accepted click interactions. | doc/report/audit-artifacts/popup/popup-full.png |
| popup_theme_card_screenshots_created | pass | warning | Expected 15 per-card screenshots, wrote 15. | doc/report/audit-artifacts/popup/theme-cards |

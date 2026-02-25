# Theme Catalog Audit - 2026-02-25

## Scope
- Production source of truth: `packages/shared/src/index.ts`
- Popup thumbnail requirement: real screenshot PNG files in `apps/extension/assets/themes`
- Drift checks: preview tool catalog and web screenshot mapping

## Summary
- Production themes: 15 (free 7, premium 8)
- Total checks: 12
- Blocker failures: 0
- Warning failures: 3
- JSON artifact: `doc/report/audit-artifacts/theme-catalog/theme-catalog-checks.json`

## Checks
| Check ID | Status | Severity | Details | Evidence |
|---|---|---|---|---|
| production_theme_total | pass | blocker | Expected 15 production themes, found 15. | packages/shared/src/index.ts |
| production_theme_split | pass | blocker | Expected 7 free / 8 premium. Found 7 free / 8 premium. | packages/shared/src/index.ts |
| theme_ids_unique | pass | blocker | All 15 production theme IDs are unique. | packages/shared/src/index.ts |
| theme_required_color_keys | pass | blocker | All production themes include required color keys. | packages/shared/src/index.ts |
| theme_hex_color_values | pass | blocker | All production color values are valid 6-digit hex strings. | packages/shared/src/index.ts |
| theme_contrast_thresholds | fail | warning | Contrast warnings: themegpt-light:accent/bg=1.69<3, solarized-dark:text/surface=4.11<4.5, one-dark:muted/bg=2.32<3. | packages/shared/src/index.ts |
| popup_thumbnail_files_present | pass | blocker | All 15 production themes have popup thumbnails. | apps/extension/assets/themes |
| popup_thumbnail_dimensions | pass | blocker | All popup thumbnails are 280x160 PNG. | apps/extension/assets/themes |
| preview_missing_production_themes | fail | warning | Production IDs missing from preview tool: themegpt-dark, themegpt-light. | apps/extension/tools/theme-preview/index.html |
| preview_extra_non_production_themes | fail | warning | Preview-only IDs: vscode-dark-plus, stellar-drift, candy-cane-chat, purple-twilight, snowfall-serenity, holiday-gift-wrapping, sage-forest-gift, festive-tree-gift, gingerbread-warmth, winter-wonderland, starry-christmas-eve, apple-ii-phosphor, tomorrow-night-blue, dark-forest, chocolate-caramel. | apps/extension/tools/theme-preview/index.html |
| web_theme_screenshot_mapping_missing | pass | warning | Web theme screenshot mapping covers all production IDs. | apps/web/components/ui/ThemeCard.tsx |
| web_theme_screenshot_mapping_extra | pass | warning | Web theme screenshot mapping has no non-production IDs. | apps/web/components/ui/ThemeCard.tsx |

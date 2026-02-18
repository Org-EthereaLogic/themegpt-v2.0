# Changelog

All notable changes to ThemeGPT will be documented in this file.

## [2.2.0] - 2026-02-18

### Added

- Escalating lifecycle nudges for premium theme clicks (3-step: soft teaser → stronger CTA + redirect → persistent interest copy + redirect)
- Non-incentivized Chrome Web Store review prompt after 3rd successful theme apply (one-time, permanently dismissible)
- Trial state display: "Trial" header label, "Trial Active" badge, days-remaining countdown
- Canceled subscription state with contextual reactivation message and account page link
- Past-due payment state with billing failure message and billing page link

### Improved

- Subscribe CTA changed from "Subscribe" to "Start free 30-day trial" (risk-free framing)
- Header button changed from "Connect" to "Sign In" (universal web convention)
- Account panel description updated to highlight "8 animated premium themes"
- Token counter footer simplified to "Estimated · No data leaves your browser"

## [2.1.0] - 2026-02-16

### Improved

- Enhanced reliability of premium theme access and subscription management
- Strengthened authentication flow for seamless login and theme downloading
- Improved extension stability across Chrome updates

### Security

- Applied latest security patches and dependency updates

## [2.0.2] - 2026-02-14

### Fixed

- Resolved critical connection issue between Chrome Extension and Web App
- Fixed authentication flow for seamless login
- Verified secure token exchange for premium theme downloads

## [2.0.1] - 2026-01-26

### Changed

- Submitted for Chrome Web Store review
- Updated store listing URLs to themegpt.ai domain
- Updated Privacy tab with proper "Single Purpose" description
- Added test instructions for reviewer access to premium features

### Fixed

- Version increment required for new submission (2.0.0 was already published)

## [2.0.0] - 2026-01-13

### Added

- Premium theme collection with animated effects
- Aurora Borealis, Synthwave, Woodland Retreat, and more premium themes
- Subscription system with Google/GitHub authentication
- Real-time token counting with local processing
- Support for chatgpt.com domain

### Changed

- Complete UI redesign with "Cream & Chocolate" brand identity
- Migrated to Plasmo framework
- Improved theme injection performance

### Security

- Privacy-first architecture: all data stays local
- No analytics or tracking

# Security Policy

ThemeGPT is a **local-only extension**. All data processing happens entirely within your browser—no information is ever sent to external servers.

## Reporting Security Issues

If you discover a way data can be exfiltrated, please report it immediately.

## Reporting Process

1. **Email:** Send details to [security@themegpt.app](mailto:security@themegpt.app)
2. **GitHub:** Alternatively, use [GitHub Security Advisories](https://github.com/themegpt/themegpt-v2.0/security/advisories) for private disclosure

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Resolution:** Depends on severity (critical: 7 days, high: 14 days, medium: 30 days)

## Scope

We accept reports for:

- Data exfiltration vulnerabilities
- Cross-site scripting (XSS) in extension UI
- Chrome extension permission escalation
- Bypass of local-only architecture constraints
- Injection attacks in theme CSS

Out of scope:

- Self-XSS requiring user action
- Issues in third-party dependencies without exploitable path
- Social engineering attacks

We take privacy and security seriously. Any vulnerability that could compromise our local-first architecture is a critical issue.

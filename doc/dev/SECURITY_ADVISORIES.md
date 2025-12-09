# Security Advisories

## Active Advisories

### CVE-2025-56648: Parcel Dev Server Origin Validation Error

**Status:** Acknowledged - No upstream patch available  
**Severity:** Moderate (CVSS 6.5)  
**Affected Component:** `@parcel/reporter-dev-server` (transitive via Plasmo)  
**Scope:** Development environment only  

#### Risk Assessment

This vulnerability allows malicious websites to steal source code from developers
running the Parcel dev server. It does NOT affect:

- Production builds
- End users of the extension
- Any user data

#### Mitigation Measures

1. **Behavioral:** Do not browse untrusted websites while `pnpm dev` is running
2. **Technical:** Use a separate browser profile for development
3. **Monitoring:** Track upstream PR parcel-bundler/parcel#10138 for fix release

#### Tracking

- GitHub Advisory: https://github.com/advisories/GHSA-qm9p-f9j5-w83w
- Upstream Fix PR: https://github.com/parcel-bundler/parcel/pull/10138

**Last reviewed:** 2025-12-09

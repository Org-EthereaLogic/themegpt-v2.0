# Security Advisories

This file tracks known security vulnerabilities affecting the development environment. Production builds and end users are not affected by these advisories.

## Active Advisories

### CVE-2025-56648: Parcel Dev Server Origin Validation Error

**Status:** Mitigated (local patch applied; upstream release pending)  
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
3. **Local patch:** Backported origin validation from parcel-bundler/parcel#10138 via `pnpm patchedDependencies` (`@parcel/reporter-dev-server@2.9.3`, hash `5bcqxyiiwql5uaktkpoxfohksq`)
4. **Monitoring:** Track upstream PR parcel-bundler/parcel#10138 for fix release

#### Tracking

- GitHub Advisory: <https://github.com/advisories/GHSA-qm9p-f9j5-w83w>
- Upstream Fix PR: <https://github.com/parcel-bundler/parcel/pull/10138>

**Last reviewed:** 2025-12-19

---

## Archived Advisories

*No archived advisories yet.*

When an advisory is resolved (upstream patch applied and dependency updated), move it here with resolution details:

```markdown
### [RESOLVED] CVE-YYYY-NNNNN: Description

**Resolved:** YYYY-MM-DD  
**Resolution:** Upgraded dependency-name from X.X.X to Y.Y.Y  
**Original Severity:** Moderate/High/Critical  

Brief description of the original issue and how it was resolved.
```

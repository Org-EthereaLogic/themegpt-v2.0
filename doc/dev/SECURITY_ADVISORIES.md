# Security Advisories

This file tracks known security vulnerabilities affecting the development environment. Production builds and end users are not affected by these advisories.

## Active Advisories

### CVE-2025-56648: Parcel Dev Server Origin Validation Error

**Status:** Mitigated (local patch applied; upstream fix available but upgrade blocked)  
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

1. **Local patch:** Backported origin validation from parcel-bundler/parcel#10138 via `pnpm patchedDependencies` (`@parcel/reporter-dev-server@2.9.3`, hash `xt2unzxfr53j7rty5vp4fmgzpe`)
2. **Behavioral:** Do not browse untrusted websites while `pnpm dev` is running
3. **Technical:** Use a separate browser profile for development
4. **Dependabot:** Ignore rule in `.github/dependabot.yml` suppresses **version-update PRs** only. Security alerts are a separate Dependabot system and must be dismissed manually via the GitHub API (see Re-Dismissal section below)

#### Upgrade Path

The upstream fix shipped in `@parcel/reporter-dev-server@2.16.4` (~Feb 2, 2026).
However, upgrading is **blocked** because Plasmo (`^0.90.5`) pins Parcel at `2.9.3`,
and `@parcel/reporter-dev-server@2.16.4` requires `@parcel/core@2.16.x`.
The local patch and Dependabot ignore rule should be removed once Plasmo updates its
Parcel dependency to ≥2.16.4.

#### Tracking

- GitHub Advisory: <https://github.com/advisories/GHSA-qm9p-f9j5-w83w>
- Upstream Fix: <https://github.com/parcel-bundler/parcel/pull/10138> (merged, released in v2.16.4)

**Last reviewed:** 2026-02-16

#### Re-Dismissal

Dependabot will reopen this alert whenever it re-evaluates the lockfile because
`first_patched_version` is `null` and it does not understand pnpm patches. To
re-dismiss, run:

```bash
gh api \
  --method PATCH \
  /repos/Org-EthereaLogic/themegpt-v2.0/dependabot/alerts/7 \
  -f state=dismissed \
  -f dismissed_reason=tolerable_risk \
  -f dismissed_comment="Mitigated via pnpm patchedDependencies. Patch backports origin/host validation from parcel-bundler/parcel#10138. Upstream upgrade blocked by Plasmo pinning @parcel/core@2.9.3. Dev-only; no production impact. See doc/dev/SECURITY_ADVISORIES.md."
```

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

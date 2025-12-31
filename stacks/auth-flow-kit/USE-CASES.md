# Auth Flow Kit - Use Cases

## Who This Is For

Developers building full-stack apps who need production-grade authentication without reinventing session management, OAuth flows, or security validation. Avoids common vulnerabilities (CSRF, token theft, redirect hijacking).

## Use Case 1: Secure Multi-Provider Social Login

**Scenario:** App needs Google, GitHub, Discord login with proper CSRF protection and redirect validation.

**Prompt:** `/better-auth Add OAuth providers (Google, GitHub) with CSRF token validation and secure redirect_uri handling`

**Outcome:** Configured socialProviders with state parameter validation, prevent redirect hijacking attacks, complete `/sign-in/social` endpoint.

## Use Case 2: Session Invalidation & Device Logout

**Scenario:** Users need "logout from all devices" and security breach requires immediate session revocation.

**Prompt:** `/better-auth Set up token revocation system with rotating refresh tokens and per-device session tracking`

**Outcome:** Implement `revokeSession()` per-token, optional emergency token revocation for all sessions, refresh token rotation strategy.

## Use Case 3: JWT vs Session Cookie Decision

**Scenario:** Uncertain whether to use JWT or traditional sessions for your API.

**Prompt:** `/security-auditor Analyze JWT vs session cookies for this architecture: [your stack]. What's the right approach?`

**Outcome:** Security audit recommending hybrid approach (HttpOnly cookies + short JWT expiry), identify hidden risks.

## Use Case 4: Sensitive Action Verification

**Scenario:** High-security actions (password change, payment) need re-verification despite valid session.

**Prompt:** `/better-auth Add step-up authentication for sensitive endpoints using JWT validation and fresh token check`

**Outcome:** Verify token freshness, re-prompt user for sensitive ops, prevent token replay attacks.

## Quick Start Workflow

1. Run `/security-audit` on current auth setup → get baseline report
2. Use `/add-authentication-system` to scaffold OAuth + JWT/session config
3. Add providers via `/better-auth` configuration
4. Implement token rotation for refresh tokens
5. Re-run security audit to verify OWASP compliance

## Pro Tips

- **HttpOnly cookies > localStorage.** Better Auth uses httpOnly + Secure flags by default. Never store JWTs in localStorage.
- **Validate state param.** CSRF attacks succeed when state parameter is ignored. Better Auth validates automatically.
- **Short-lived tokens.** Use 5-15 min access tokens + 7-day refresh tokens. Reduces compromise window.
- **Redirect URI whitelist.** Exact HTTPS match prevents OAuth account takeover. Better Auth enforces this.
- **Never skip JWT validation.** Always verify `iss` (issuer) and `aud` (audience) claims, even on internal networks.

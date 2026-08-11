# Security Anti-Patterns

Five interactive walk-throughs of everyday security habits that feel safe but
aren't, built for technical and non-technical readers alike. Each module opens
in plain language, with a collapsed **Technical detail** panel wherever there's
real math or protocol-level mechanics underneath.

No backend, no build step: static HTML/CSS and vanilla ES modules, served
as-is. Open [`index.html`](index.html) directly or through any static file
server.

1. **File transfer** ([`js/modules/fileTransfer.js`](js/modules/fileTransfer.js)) -
   email vs. SFTP: a slider scrubs through 90 days showing how many copies of
   a file exist outside your control under each transfer method, and whether
   recall/revoke actually work.
2. **Password-protected files** ([`js/modules/passwordCrack.js`](js/modules/passwordCrack.js)) -
   a crack-time calculator over password length, character set, file/encryption
   scheme, and attacker hardware, anchored to published hashcat benchmarks
   ([`js/data/crackSpeeds.js`](js/data/crackSpeeds.js)).
3. **Credential reuse** ([`js/modules/credentialReuse.js`](js/modules/credentialReuse.js)) -
   simulates a single site breach cascading into every account sharing that
   password, and how MFA and a password manager each break the cascade.
4. **Phishing** ([`js/modules/phishing.js`](js/modules/phishing.js)) -
   a mock email with seven clickable red flags
   ([`js/data/phishingFlags.js`](js/data/phishingFlags.js)).
5. **Data at rest** ([`js/modules/dataAtRest.js`](js/modules/dataAtRest.js)) -
   what actually happens to a lost laptop, a misconfigured bucket, or an
   unlocked phone once the "device is on and locked" assumption breaks.

Built for education and security-awareness purposes only. Figures used
throughout (crack speeds, breach mechanics) are illustrative approximations
for teaching relative risk, not audited security measurements or pentesting
guidance.

## Deployment

This repo is a git submodule of [demo-site](https://github.com/bryanmehsmith/demo-site)
at `apps/security-anti-patterns`, served directly by Caddy's `file_server`
(no process needed, since there's no backend). `.github/workflows/bump-demo-site.yml`
bumps demo-site's submodule pointer on every push to `main`.

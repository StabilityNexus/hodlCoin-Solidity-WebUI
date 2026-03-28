# Security Test Report (Burp Suite)

## Scope
- App: hodlCoin-Solidity-WebUI
- Pages: Home, Create Vault, Explorer, Favorites, My Vaults, Vault Detail
- Assets: Static export

## Environment
- Local dev server: `npm run dev`
- Browser proxied through Burp Suite
- Wallet: MetaMask (test accounts)

## Methodology
- Passive scan while navigating all pages
- Active scan on form inputs and query params
- Manual checks:
  - Input validation for vault address and chain ID
  - Navigation links and route handling
  - IndexedDB caching operations
  - External links and target attributes

## Findings
- Cross-Site Scripting (XSS): No injection vectors observed; no `dangerouslySetInnerHTML` usage.
- Open Redirect: Navigation uses internal router; no user-controlled redirect targets.
- Input Validation:
  - Address and chain ID validation added via `utils/validation.ts`.
  - Invalid values prevented from routing or contract reads.
- CSP/Headers: Static export limits header enforcement; recommend hosting-level CSP.
- External Links: Transaction explorer links use `target="_blank"`. Recommend `rel="noreferrer"`.

## Recommendations
- Enforce CSP at hosting (script-src 'self', object-src 'none').
- Add `rel="noreferrer"` to external links.
- Monitor dependency updates for security patches.

## Test Results
- Create Vault: Validations block invalid inputs and negative fees.
- Explorer Card: Enter Vault guarded by address and chain ID checks.
- Find Vault: Validations and error messages for incorrect inputs.
- Vault Detail: Path and query parsing validated; manual sync safe.

## Conclusion
- Current UI resistant to basic client-side attack vectors.
- Hosting CSP and external link rel attributes recommended.

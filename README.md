# hodlCoin Staking Platform (Web UI)

Self-stabilizing staking vaults where the price is mathematically proven to always increase. Unstaking fees reward vault creators and long-term stakers.

## Table of Contents
- Overview
- Features
- Tech Stack
- Architecture
- File Structure
- Setup
- Environment Variables
- Development
- Debugging
- Deployment
- Contributing
- License for Assets

## Features
- Create new staking vaults for ERC‑20 tokens (`/createVault`)
- Explore all vaults across supported chains (`/explorer`)
- Track your created vaults (`/myVaults`)
- Save and revisit favorite vaults (`/favorites`)
- Detailed vault view: balances, fees, price, and manual sync (`/v/[vaultId]`)
- Wallet connection via RainbowKit/Wagmi with multi-chain support
- Fast UI built with Tailwind and shadcn/ui components
- Local caching using IndexedDB for snappy UX

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Wagmi + RainbowKit + Reown AppKit
- Ethers v5 and Viem utilities
- TanStack Query
- Lottie animations

## Architecture
- Wallet and chain:
  - Wagmi/RainbowKit configuration reads `NEXT_PUBLIC_PROJECT_ID` in `utils/config.ts:16`.
  - Custom chain definitions under `components/CitreaTestnet.tsx` and `components/EthereumClassic.tsx`.
- Data access:
  - Vault discovery via on-chain factories (`utils/addresses.ts`, ABIs under `utils/contracts/`).
  - Cached lists and details stored in IndexedDB (`utils/indexedDB.ts`).
- UI pages:
  - App Router under `app/` with route segments for explorer, favorites, my vaults, vault detail.
  - Vault detail client handles sync, fees, balances (`app/[vaultId]/InteractionClient.tsx:76`, `app/[vaultId]/InteractionClient.tsx:311`).
- Styling and components:
  - Tailwind and shadcn/ui components in `components/ui/`.
  - Reusable feature modules in `components/Vault/`, `components/Explorer/`, etc.

## File Structure
```
app/
  [vaultId]/           # Vault detail route
    InteractionClient.tsx
    page.tsx
  createVault/         # Create vault flow
  explorer/            # Explore vaults
  favorites/           # Favorite vaults
  myVaults/            # User-created vaults
  layout.tsx           # Root layout and providers
  page.tsx             # Home page
components/
  Home/                # Hero + About sections
  Explorer/            # Explorer cards and lists
  FavoriteVaults/      # Favorites listing
  FindVault/           # Vault search dialog
  Vault/               # Vault UI: actions, hero, info
  hooks/               # UI hooks (matrix effect, token list)
  ui/                  # shadcn/ui primitives
  ChainDropdown.tsx    # Chain selector
  Header.tsx, Footer.tsx, NavBar.tsx, etc.
contexts/
  EthersContext.tsx    # Metamask context values
providers/
  WalletProvider.tsx   # Wagmi/RainbowKit provider
  theme-provider.tsx   # Theme support
utils/
  contracts/           # ABIs for HodlCoin, ERC20, Factory
  addresses.ts         # Chain factory addresses
  chains.ts            # Chain name helpers
  config.ts            # Wagmi/RainbowKit config
  favorites.ts         # Favorite handling
  indexedDB.ts         # Caching layer
  props.ts             # Shared types
lib/
  utils.ts             # Utility functions
public/
  animations/          # Lottie JSON
  images/              # Avatars and brand assets
  hodlcoin*.svg/png    # Logos and license
next.config.mjs        # Static export + basePath for GH Pages
tailwind.config.ts     # Tailwind config
tsconfig.json          # TS strict mode + path aliases
.eslintrc.json         # ESLint config
.prettierrc            # Prettier config
.env.example           # Required env vars
```

## Requirements
- Node.js 18+
- npm, pnpm, or yarn
- A Web3 wallet (e.g., MetaMask) or WalletConnect-compatible wallet

## Quick Start
1. Clone the repository and install dependencies:
   ```bash
   npm install
   # or: yarn, pnpm
   ```
2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set `NEXT_PUBLIC_PROJECT_ID` with your Reown Cloud project ID
   - Optionally set `NEXT_PUBLIC_API_URL` if an API is used

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

## Environment Variables
- `NEXT_PUBLIC_PROJECT_ID`: Required for WalletConnect/Reown integration  
  Used in `utils/config.ts:16`.
- `NEXT_PUBLIC_API_URL`: Optional backend/API base URL (if applicable)

## Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production (static export to `out`)
- `npm run start`: Start production server
- `npm run lint`: Run Next.js ESLint checks

## Development
- TypeScript
  - Strict mode enabled in `tsconfig.json:11`
  - Path alias `@/*` to project root in `tsconfig.json:25`
- Linting and formatting
  - ESLint: `next/core-web-vitals` (`.eslintrc.json:2`)
  - Prettier config in `.prettierrc`
- UI conventions
  - shadcn/ui primitives in `components/ui/`
  - Tailwind utility-first CSS in `app/globals.css` and components
- Data and caching
  - IndexedDB manager in `utils/indexedDB.ts` for vault lists/details caching

## Debugging
- Wallet/project ID issues
  - Ensure `NEXT_PUBLIC_PROJECT_ID` is set in `.env` and not empty
  - Configuration reads this in `utils/config.ts:16`
- Chain/client errors
  - If `getPublicClient` returns null, verify supported chains and wallet network
  - Check `components/ChainDropdown.tsx` and `utils/addresses.ts` for chain mapping
- Stale cache
  - Use manual sync in vault detail (`app/[vaultId]/InteractionClient.tsx:311`)
  - Or clear site data via DevTools: Application → Storage → Clear Site Data
- Static export routing
  - `next.config.mjs:8` uses `basePath: '/hodlCoin-Solidity-WebUI'`. Ensure your GitHub Pages repo name matches
  - When serving under a subpath, all links and asset paths include the base path automatically
- Common local fixes
  - Delete `.next/` and `out/`, reinstall dependencies, and retry build/run
  - Confirm Node 18+ and a working `npm`/`yarn`/`pnpm` installation

## Deployment
This project is configured for static export:
- `next.config.mjs:4` sets `output: 'export'` and `distDir: 'out'`
- `next.config.mjs:8` sets `basePath: '/hodlCoin-Solidity-WebUI'` for GitHub Pages

Build and publish:
```bash
npm run build
npx gh-pages -d out
```
You can deploy `out/` to any static host (GitHub Pages, Vercel static, Netlify, etc.).

## Project Structure
- `app/`: Routes and pages (App Router)
- `components/`: UI and feature components (e.g., Vault, Explorer, Home)
- `providers/`: Wagmi/RainbowKit and theme providers
- `utils/`: Chains, addresses, ABIs, config, favorites, caching
- `public/`: Static assets and animations

## Contributing
- Open an issue with a clear description and steps to reproduce
- Make focused PRs with clear titles and descriptions
- Run `npm run lint` and ensure builds pass before submitting
- See `CONTRIBUTING.md` for detailed guidelines

## Assets License
Logo and brand assets are licensed separately. See `public/hodlcoin-logo-license.md`.


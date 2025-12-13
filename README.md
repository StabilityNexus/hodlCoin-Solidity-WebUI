# HodlCoin Web UI

A decentralized application (dApp) for interacting with HodlCoin vaults and the HodlCoin Factory smart contracts. This frontend enables users to create time-locked token vaults, stake assets, and earn rewards for long-term holding (hodling).

Built with Next.js 14, TypeScript, Tailwind CSS, Wagmi/RainbowKit, and Ethers.js v5.

## What is HodlCoin?

HodlCoin is a **staking protocol that encourages holding assets for extended periods**. The protocol uses a vault system where:

- **Hodling (Staking)**: Users deposit tokens into a vault and receive proportional hodlCoins (vault-specific ERC-20 tokens representing their stake)
- **Unhodling (Unstaking)**: Users burn their hodlCoins to withdraw the underlying asset, but must pay an unstaking fee that benefits vault creators and remaining hodlers
- **Rewards Distribution**: Vault creators and anyone else can distribute rewards to incentivize longer holding periods
- **Fee Structure**: Unstaking fees are split between the vault creator and users who continue holding, creating a sustainable incentive mechanism

> Based on research paper: [HodlCoin: A Staking Protocol with Optimal Rewards](https://eprint.iacr.org/2023/1029)

## Key Features

✅ **Create Custom Vaults** - Launch your own hodlCoin vaults with customizable parameters (fees, underlying token, etc.)  
✅ **Multi-Chain Support** - Works on Ethereum, Polygon, Base, BSC, Ethereum Classic, Scroll Sepolia, and Citrea Testnet  
✅ **Wallet Integration** - Seamless connection via RainbowKit supporting MetaMask, WalletConnect, and more  
✅ **Vault Explorer** - Browse all vaults across supported chains with search and filtering  
✅ **Favorites System** - Mark vaults as favorites and track them using IndexedDB  
✅ **My Vaults** - View all vaults you've created or interacted with  
✅ **Deposit & Withdraw** - Hodl (deposit) and unhodl (withdraw) with real-time fee calculations  
✅ **Responsive Design** - Works on desktop and mobile with dark/light theme support

## Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router for server-side rendering and optimized performance
- **TypeScript** - Type-safe JavaScript for better development experience and fewer runtime errors
- **React 18** - Core UI library with latest features (hooks, concurrent rendering)

### Styling & UI Components
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Accessible, unstyled component primitives (dialogs, dropdowns, tabs, etc.)
- **Lucide React** - Beautiful, customizable icon library
- **Framer Motion** - Animation library for smooth transitions and effects
- **next-themes** - Theme management for dark/light mode switching
- **Lottie** - Animated graphics support (@lottiefiles/react-lottie-player)

### Blockchain & Wallet Integration
- **Wagmi v2** - React hooks for Ethereum interactions (accounts, contracts, transactions)
- **RainbowKit** - Beautiful, customizable wallet connection UI
- **Viem** - Modern TypeScript library for Ethereum (used by Wagmi internally)
- **Ethers.js v5** - Ethereum library for smart contract interactions, signing, and providers
- **@reown/appkit** - WalletConnect integration for multi-wallet support

### State Management & Data Fetching
- **React Query (@tanstack/react-query)** - Async state management, caching, and data synchronization
- **React Context** - Global state management for wallet providers and Ethers contexts

### Additional Tools
- **IndexedDB** - Browser storage for favorites and user preferences
- **react-blockies** - Ethereum address identicons
- **react-window** - Virtualization for rendering large lists efficiently

## Prerequisites

- Node.js 18+ and npm (or Yarn/Pnpm/Bun)
- A wallet supported by RainbowKit (e.g., MetaMask)
- Project ID from Reown Cloud for WalletConnect

## Environment Setup

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_PROJECT_ID=your-project-id
```

How to obtain `your-project-id`:
- Go to https://cloud.reown.com/sign-in
- Create/login to your account and create a project
- Copy the Project ID/API Key and paste it into `.env`

## Running Locally

### Installation

Install dependencies:

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Create production build
npm run start     # Start production server (requires build first)
npm run lint      # Run ESLint to check code quality
```

## How to Use the Application

### 1. Connect Your Wallet

1. Click **"Connect Wallet"** in the top navigation bar
2. Select your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection request
4. Ensure you're on a supported network (or switch when prompted)

### 2. Create a New Vault

Creating a vault allows you to define the staking parameters for a specific token.

**Steps:**
1. Navigate to **"Create Vault"** from the navigation menu
2. Fill in the vault parameters:
   - **Coin Name**: Display name for your hodlCoin (e.g., "Hodl USDC")
   - **Symbol**: Token symbol (e.g., "hUSDC")
   - **Underlying Token**: Select or paste the ERC-20 token address users will stake
   - **Vault Creator**: Your wallet address (pre-filled, this receives creator fees)
   - **Vault Fee**: Percentage fee deducted on unstaking (distributed to remaining hodlers)
   - **Vault Creator Fee**: Percentage fee that goes to you as the vault creator
3. Click **"Create Vault"**
4. Confirm the transaction in your wallet
5. Wait for confirmation, then you'll see your new vault address

**Example Configuration:**
- Coin Name: `Hodl Ethereum`
- Symbol: `hETH`
- Underlying Token: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` (WETH)
- Vault Fee: `5` (5% fee to remaining holders)
- Vault Creator Fee: `2` (2% fee to creator)

### 3. Explore Vaults

Browse existing vaults across all supported chains.

**Steps:**
1. Go to **"Explorer"** from the navigation
2. Use the search bar to find vaults by:
   - Vault name
   - Token symbol
   - Contract address
3. Filter by chain using the chain selector
4. Click on any vault card to view details
5. Add vaults to favorites by clicking the star icon

### 4. View Your Vaults

**Steps:**
1. Navigate to **"My Vaults"**
2. View two categories:
   - **Vaults You Created**: Vaults where you are the creator
   - **Vaults You Hodl**: Vaults where you have staked tokens
3. Click any vault to manage it

### 5. Deposit Tokens (HODL)

Stake tokens into a vault to receive hodlCoins.

**Steps:**
1. Open a vault detail page
2. In the **"Hodl"** section (left panel):
   - Enter the amount of underlying tokens you want to stake
   - View the estimated hodlCoins you'll receive
   - Check the current exchange rate
3. Click **"Approve"** (first-time only) to allow the vault to access your tokens
4. Click **"Hodl"** to stake your tokens
5. Confirm the transaction in your wallet
6. Your hodlCoins will appear in your balance after confirmation

**How It Works:**
- You deposit underlying tokens (e.g., 100 USDC)
- You receive hodlCoins based on the current price (e.g., 95 hUSDC)
- The price reflects accumulated fees from previous unstakers
- Your share grows as others unstake and pay fees

### 6. Withdraw Tokens (UNHODL)

Burn hodlCoins to withdraw the underlying asset (minus fees).

**Steps:**
1. In the **"Unhodl"** section (right panel):
   - Enter the amount of hodlCoins you want to burn
   - View:
     - Underlying tokens you'll receive
     - Vault fee percentage
     - Creator fee percentage
     - Net amount after fees
2. Click **"Approve"** (first-time only) for hodlCoin spending
3. Click **"Unhodl"** to withdraw
4. Confirm the transaction
5. Underlying tokens will be sent to your wallet

**Fee Distribution:**
- Vault Fee: Stays in the vault, benefiting remaining hodlers
- Creator Fee: Sent directly to the vault creator
- Your received amount = (hodlCoins × price) - fees

### 7. Manage Favorites

Keep track of interesting vaults.

**Steps:**
1. Click the **star icon** on any vault card to favorite
2. Access all favorites from **"Favorites"** in the navigation
3. Favorites are stored locally in your browser (IndexedDB)
4. Click the star again to unfavorite

## Project Structure

### Directory Tree

```
hodlCoin-Solidity-WebUI/
├── app/                          # Next.js App Router (pages & routes)
│   ├── [vaultId]/               # Dynamic vault detail pages
│   │   ├── page.tsx
│   │   └── InteractionClient.tsx
│   ├── createVault/             # Vault creation page
│   │   └── page.tsx
│   ├── explorer/                # Vault explorer page
│   │   └── page.tsx
│   ├── favorites/               # Favorited vaults page
│   │   └── page.tsx
│   ├── myVaults/                # User's vaults page
│   │   └── page.tsx
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── manifest.json            # PWA manifest
│   └── page.tsx                 # Home page
│
├── components/                   # React components
│   ├── CreateVault/             # Vault creation components
│   │   ├── CreateForm.tsx
│   │   └── TokenPicker.tsx
│   ├── Explorer/                # Vault explorer components
│   │   ├── CardExplorer.tsx
│   │   └── ExplorerVaults.tsx
│   ├── FavoriteVaults/          # Favorites components
│   │   └── FavoriteVaults.tsx
│   ├── FindVault/               # Search components
│   │   └── FindVaultForm.tsx
│   ├── Home/                    # Home page components
│   │   ├── About.tsx
│   │   ├── gradient.css
│   │   └── Hero.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useMatrixEffect.ts
│   │   ├── useTokenList.ts
│   │   └── useTokenSearch.ts
│   ├── MyVaults/                # User vaults components
│   │   └── AllVaults.tsx
│   ├── ui/                      # Reusable UI components (Radix/shadcn)
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── loading.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   ├── Vault/                   # Vault detail components
│   │   ├── Actions.tsx
│   │   ├── HeroVault.tsx
│   │   ├── HodlBox.tsx
│   │   ├── UnhodlBox.tsx
│   │   └── VaultInformation.tsx
│   ├── ChainDropdown.tsx        # Network selector
│   ├── CitreaTestnet.tsx        # Chain-specific components
│   ├── EthereumClassic.tsx
│   ├── Footer.tsx               # Footer component
│   ├── Header.tsx               # Header/navbar
│   ├── Milkomeda.tsx
│   ├── NavBar.tsx               # Navigation menu
│   ├── Profile.tsx              # User profile
│   ├── toast-button.tsx         # Toast trigger
│   └── toggle-theme.tsx         # Theme switcher
│
├── contexts/                     # React Context
│   └── EthersContext.tsx        # Ethers.js provider context
│
├── lib/                         # Utility libraries
│   └── utils.ts                 # Helper functions
│
├── providers/                    # Application providers
│   ├── EthersProvider.tsx       # Ethers context wrapper
│   ├── index.ts                 # Provider exports
│   ├── theme-provider.tsx       # Theme provider
│   └── WalletProvider.tsx       # Wagmi/RainbowKit config
│
├── public/                       # Static assets
│   ├── animations/              # Lottie animations
│   │   ├── coin_animation.json
│   │   └── congrats_animation.json
│   ├── images/                  # Images and icons
│   ├── hodlcoin-logo-license.md
│   └── manifest.json
│
├── types/                        # TypeScript definitions
│   └── ethereum.d.ts            # Window.ethereum types
│
├── utils/                        # Utility functions & config
│   ├── contracts/               # Smart contract ABIs
│   │   ├── ERC20.ts
│   │   ├── HodlCoin.ts
│   │   ├── HodlCoinFactory.ts
│   │   └── IHodlCoinFactory.ts
│   ├── addresses.ts             # Contract addresses per chain
│   ├── chains.ts                # Chain configurations
│   ├── config.ts                # Wagmi configuration
│   ├── connectMetamask.ts       # MetaMask helper
│   ├── favorites.ts             # Favorites management
│   ├── indexedDB.ts             # IndexedDB wrapper
│   ├── mock.ts                  # Mock data
│   └── props.ts                 # TypeScript interfaces
│
├── .env                         # Environment variables (create this)
├── components.json              # shadcn/ui config
├── next.config.mjs              # Next.js config
├── package.json                 # Dependencies & scripts
├── postcss.config.mjs           # PostCSS config
├── README.md                    # This file
├── tailwind.config.ts           # Tailwind config
└── tsconfig.json                # TypeScript config
```

### Detailed breakdown of the application architecture:

### `/app` - Next.js App Router Pages
Application routes and page components using the App Router pattern:

- **`page.tsx`** - Home page with hero section and about HodlCoin
- **`layout.tsx`** - Root layout with providers, theme, and navigation
- **`globals.css`** - Global styles and Tailwind CSS imports
- **`manifest.json`** - PWA manifest for mobile app capabilities
- **`/[vaultId]`** - Dynamic route for individual vault pages
  - `page.tsx` - Vault details page displaying vault info and actions
  - `InteractionClient.tsx` - Client-side component for vault interactions
- **`/createVault`** - Vault creation flow
- **`/explorer`** - Browse and search all vaults across chains
- **`/favorites`** - User's favorited vaults
- **`/myVaults`** - Vaults created or interacted with by the connected user

### `/components` - React Components
Reusable UI components organized by feature:

#### Chain Components
- **`ChainDropdown.tsx`** - Network selector dropdown
- **`CitreaTestnet.tsx`, `EthereumClassic.tsx`, `Milkomeda.tsx`** - Chain-specific components

#### Layout Components
- **`Header.tsx`** - Top navigation bar with wallet connection
- **`Footer.tsx`** - Footer with links and information
- **`NavBar.tsx`** - Main navigation menu
- **`Profile.tsx`** - User profile and wallet info display

#### Feature Components
- **`/CreateVault`**
  - `CreateForm.tsx` - Form for creating new vaults with validation
  - `TokenPicker.tsx` - Token selection interface with search
- **`/Explorer`**
  - `ExplorerVaults.tsx` - Grid view of all vaults
  - `CardExplorer.tsx` - Individual vault card component
- **`/FavoriteVaults`**
  - `FavoriteVaults.tsx` - Display user's favorited vaults
- **`/FindVault`**
  - `FindVaultForm.tsx` - Search form for finding specific vaults
- **`/Home`**
  - `Hero.tsx` - Landing page hero section with animations
  - `About.tsx` - Explanation of HodlCoin protocol
  - `gradient.css` - Custom gradient styles
- **`/MyVaults`**
  - `AllVaults.tsx` - Display all user-owned vaults
- **`/Vault`**
  - `VaultInformation.tsx` - Vault stats and metadata display
  - `HeroVault.tsx` - Vault page header
  - `Actions.tsx` - Hodl/Unhodl action buttons
  - `HodlBox.tsx` - Deposit (staking) interface
  - `UnhodlBox.tsx` - Withdraw (unstaking) interface

#### Hooks
- **`useMatrixEffect.ts`** - Matrix rain animation effect
- **`useTokenList.ts`** - Fetch and manage token lists
- **`useTokenSearch.ts`** - Search functionality for tokens

#### UI Components (`/ui`)
Radix-based shadcn/ui components:
- `alert-dialog.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`
- `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `loading.tsx`
- `navigation-menu.tsx`, `pagination.tsx`, `select.tsx`, `separator.tsx`
- `skeleton.tsx`, `tabs.tsx`, `toast.tsx`, `toaster.tsx`, `use-toast.ts`

#### Utility Components
- **`toast-button.tsx`** - Toast notification trigger
- **`toggle-theme.tsx`** - Dark/light mode toggle

### `/contexts` - React Context Providers
- **`EthersContext.tsx`** - Provides Ethers.js provider, signer, and account info to child components

### `/providers` - Application Providers
- **`EthersProvider.tsx`** - Wraps app with Ethers context
- **`WalletProvider.tsx`** - Configures Wagmi and RainbowKit wallet connection
- **`theme-provider.tsx`** - Theme (dark/light mode) provider
- **`index.ts`** - Exports all providers

### `/utils` - Utility Functions & Configuration
Core application logic and blockchain configuration:

- **`addresses.ts`** - Smart contract addresses for each supported chain
- **`chains.ts`** - Chain configurations (RPC URLs, explorers, native currency)
- **`config.ts`** - Wagmi configuration with supported chains and transports
- **`connectMetamask.ts`** - MetaMask connection helper
- **`favorites.ts`** - Favorites management functions
- **`indexedDB.ts`** - IndexedDB wrapper for local storage
- **`mock.ts`** - Mock data for development/testing
- **`props.ts`** - TypeScript interfaces and type definitions

#### `/utils/contracts` - Smart Contract ABIs
- **`ERC20.ts`** - ERC-20 token ABI
- **`HodlCoin.ts`** - HodlCoin vault ABI (stake, unstake, fees, rewards)
- **`HodlCoinFactory.ts`** - Factory contract ABI (create vaults, list vaults)
- **`IHodlCoinFactory.ts`** - Factory interface

### `/lib` - Libraries
- **`utils.ts`** - Utility functions (classNames merger, etc.)

### `/types` - TypeScript Type Definitions
- **`ethereum.d.ts`** - Window.ethereum types for MetaMask integration

### `/public` - Static Assets
- **`manifest.json`** - PWA manifest
- **`hodlcoin-logo-license.md`** - Logo licensing information
- **`/animations`** - Lottie animation files (coin_animation.json, congrats_animation.json)
- **`/images`** - Static images and icons

### Configuration Files
- **`next.config.mjs`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS customization
- **`tsconfig.json`** - TypeScript compiler options
- **`postcss.config.mjs`** - PostCSS configuration
- **`components.json`** - shadcn/ui components configuration

## Chains & Configuration

### Supported Blockchain Networks

The application supports multiple EVM-compatible chains. Contract addresses are defined in [`utils/addresses.ts`](utils/addresses.ts):

| Chain | Chain ID | Factory Contract | Explorer |
|-------|----------|------------------|----------|
| Ethereum Mainnet | 1 | `0x51a11e08643c9df6ceb5f7fb41a72334cfa7d1d6` | [Etherscan](https://etherscan.io) |
| Polygon | 137 | `0x89572326c048053fb0efa14bcc2dd4dfffdcc4a9` | [PolygonScan](https://polygonscan.com) |
| Base | 8453 | `0xa482c35b3fd47f93ae381ee3f8ca1d4d3a565194` | [BaseScan](https://basescan.org) |
| BSC | 56 | `0x9aa272a104d413e3702d6a28901f3998c16c802f` | [BscScan](https://bscscan.com) |
| Ethereum Classic | 61 | `0x9aA272a104d413e3702D6a28901f3998c16C802F` | [Blockscout](https://blockscout.com/etc/mainnet) |
| Scroll Sepolia | 534351 | `0x85af2b6326cd004749b894879d88fca9ac51dd48` | [Scroll Explorer](https://sepolia.scrollscan.com) |
| Citrea Testnet | 5115 | `0xD4406380c9A1BBACcb1a6Ab426C49997f8Abc944` | [Citrea Explorer](https://explorer.testnet.citrea.xyz) |

### Adding New Chains

To add support for a new chain:

1. **Add chain config** in [`utils/chains.ts`](utils/chains.ts):
```typescript
export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  // ... existing chains
  YOUR_CHAIN_ID: {
    id: YOUR_CHAIN_ID,
    name: 'Your Chain Name',
    shortName: 'Short Name',
    explorerUrl: 'https://explorer.url',
    nativeCurrency: {
      name: 'Token Name',
      symbol: 'SYMBOL',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.url'],
    blockExplorers: {
      default: { name: 'Explorer', url: 'https://explorer.url' }
    },
    color: 'bg-color-400/10 text-color-500 border-color-400/20',
  }
}
```

2. **Add factory address** in [`utils/addresses.ts`](utils/addresses.ts):
```typescript
export const HodlCoinVaultFactories = {
  // ... existing chains
  YOUR_CHAIN_ID: '0xYourFactoryContractAddress',
}
```

3. **Update Wagmi config** in [`utils/config.ts`](utils/config.ts) to include the new chain in the Wagmi configuration.

## Development Tips

### Working with Smart Contracts

- Contract ABIs are located in [`utils/contracts/`](utils/contracts/)
- Update ABIs if smart contracts are modified or redeployed
- Use Wagmi hooks (`useReadContract`, `useWriteContract`) for new contract interactions
- Ethers.js v5 is available via `EthersContext` for complex operations

### State Management

- **Wagmi/React Query**: Handles blockchain data caching and synchronization
- **React Context**: Used for Ethers provider/signer (`EthersContext`)
- **IndexedDB**: Stores user preferences and favorites locally

### Styling Guidelines

- Use Tailwind utility classes for consistent styling
- Radix UI components are pre-styled with Tailwind in [`components/ui/`](components/ui/)
- Custom gradients and effects in [`components/Home/gradient.css`](components/Home/gradient.css)
- Theme variables defined in [`app/globals.css`](app/globals.css)

### Adding New Features

1. **New Page**: Create in `app/` directory following App Router conventions
2. **New Component**: Add to appropriate `components/` subdirectory
3. **New Contract Function**: Add to relevant ABI file in `utils/contracts/`
4. **New Chain**: Update `chains.ts`, `addresses.ts`, and `config.ts`

## Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next/` directory.

### Running Production Build Locally

```bash
npm run start
```

Serves the production build on http://localhost:3000

### Deployment Platforms

**Vercel** (Recommended for Next.js):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Other Platforms:**
- Netlify: Follow their Next.js deployment guide
- AWS Amplify: Connect your Git repository
- Docker: Create a Dockerfile for containerized deployment
- Static Export: Configure Next.js for static export if needed

### Environment Variables for Production

Ensure `NEXT_PUBLIC_PROJECT_ID` is set in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Docker: Use `.env` file or pass as build args

## Troubleshooting

### Wallet Connection Issues

**Problem**: Wallet not connecting or showing errors

**Solutions**:
- Verify `NEXT_PUBLIC_PROJECT_ID` is correctly set in `.env`
- Clear browser cache and cookies
- Try a different wallet (MetaMask, Coinbase Wallet, etc.)
- Check if the wallet extension is updated to the latest version
- Disable other wallet extensions that might conflict

### Wrong Network

**Problem**: "Wrong network" or "Unsupported chain" error

**Solutions**:
- Click the network dropdown in your wallet
- Switch to a supported chain (Ethereum, Polygon, Base, BSC, etc.)
- If chain doesn't appear, add it manually using details from [`utils/chains.ts`](utils/chains.ts)

### Contract Interaction Failures

**Problem**: Transactions fail or contract calls return errors

**Solutions**:
- Confirm contract addresses in [`utils/addresses.ts`](utils/addresses.ts) match your deployment
- Check if you have sufficient native tokens for gas fees
- Ensure token approvals are granted (click "Approve" before "Hodl" or "Unhodl")
- Verify you're on the correct network where the vault exists
- Check block explorer for specific error messages

### Token Not Appearing

**Problem**: HodlCoins or underlying tokens not showing in wallet

**Solutions**:
- Add token to your wallet manually using the contract address
- Transaction might still be pending - check block explorer
- Refresh the page and reconnect wallet
- Check if transaction was successful on the block explorer

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

- Ensure Node.js version is 18 or higher
- Check for TypeScript errors: `npm run lint`
- Verify environment variables are set

### API Rate Limiting

**Problem**: RPC errors or slow responses

**Solutions**:
- Use a custom RPC endpoint in [`utils/config.ts`](utils/config.ts)
- Get API keys from Infura, Alchemy, or QuickNode
- Wait a few moments and retry if rate limited

### Favorites Not Saving

**Problem**: Favorited vaults disappear after refresh

**Solutions**:
- Check browser allows IndexedDB (not in private/incognito mode)
- Clear browser cache and re-favorite vaults
- Ensure JavaScript is enabled and not blocked

### Dark/Light Mode Not Working

**Problem**: Theme toggle doesn't change appearance

**Solutions**:
- Clear browser local storage
- Check if `next-themes` is properly initialized in [`app/layout.tsx`](app/layout.tsx)
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

## Learn More

### Documentation & Resources

**Next.js**
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Next.js App Router](https://nextjs.org/docs/app) - Understanding the App Router architecture
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial

**Blockchain Libraries**
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI and documentation
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- [Ethers.js v5](https://docs.ethers.org/v5/) - Complete Ethers v5 documentation

**UI & Design**
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix and Tailwind
- [Lucide Icons](https://lucide.dev/) - Icon library

**HodlCoin Protocol**
- [Research Paper](https://eprint.iacr.org/2023/1029) - "HodlCoin: A Staking Protocol with Optimal Rewards"
- Smart Contracts: Check the respective chain explorers using addresses from [`utils/addresses.ts`](utils/addresses.ts)

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add TypeScript types for new functions and components
- Test on multiple chains before submitting
- Update documentation if adding new features
- Ensure `npm run lint` passes without errors

## License

See [`public/hodlcoin-logo-license.md`](public/hodlcoin-logo-license.md) for logo licensing information.

Code license: [Specify your license here - MIT, Apache 2.0, etc.]

---

**Built with ❤️ for the HodlCoin community**

For questions or support, check the [research paper](https://eprint.iacr.org/2023/1029) or explore the code!


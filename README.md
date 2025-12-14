<!-- Don't delete it -->
<div name="readme-top"></div>

<!-- Organization Logo -->
<div align="center" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
  <img alt="Stability Nexus" src="public/logo-animated.gif" width="175">
  <!-- <img src="public/cross.svg" width="30" style="margin: 0;" /> -->
  <img src="public/hodlcoin.svg" width="175" />
</div>

&nbsp;

<!-- Organization Name -->
<div align="center">


<!-- Correct deployed url to be added -->

</div>

<!-- Organization/Project Social Handles -->
<p align="center">
<!-- Telegram -->
<a href="https://t.me/StabilityNexus">
<img src="https://img.shields.io/badge/Telegram-black?style=flat&logo=telegram&logoColor=white&logoSize=auto&color=24A1DE" alt="Telegram Badge"/></a>
&nbsp;&nbsp;
<!-- X (formerly Twitter) -->
<a href="https://x.com/StabilityNexus">
<img src="https://img.shields.io/twitter/follow/StabilityNexus" alt="X (formerly Twitter) Badge"/></a>
&nbsp;&nbsp;
<!-- Discord -->
<a href="https://discord.gg/YzDKeEfWtS">
<img src="https://img.shields.io/discord/995968619034984528?style=flat&logo=discord&logoColor=white&logoSize=auto&label=Discord&labelColor=5865F2&color=57F287" alt="Discord Badge"/></a>
&nbsp;&nbsp;
<!-- Medium -->
<a href="https://news.stability.nexus/">
  <img src="https://img.shields.io/badge/Medium-black?style=flat&logo=medium&logoColor=black&logoSize=auto&color=white" alt="Medium Badge"></a>
&nbsp;&nbsp;
<!-- LinkedIn -->
<a href="https://linkedin.com/company/stability-nexus">
  <img src="https://img.shields.io/badge/LinkedIn-black?style=flat&logo=LinkedIn&logoColor=white&logoSize=auto&color=0A66C2" alt="LinkedIn Badge"></a>
&nbsp;&nbsp;
<!-- Youtube -->
<a href="https://www.youtube.com/@StabilityNexus">
  <img src="https://img.shields.io/youtube/channel/subscribers/UCZOG4YhFQdlGaLugr_e5BKw?style=flat&logo=youtube&logoColor=white&logoSize=auto&labelColor=FF0000&color=FF0000" alt="Youtube Badge"></a>
</p>

---

<div align="center">
<h1>hodlCoin</h1>
</div>

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). The platform provides a modern web interface for decentralized auction trading, built with cutting-edge web technologies.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

---

## Tech Stack

### Frontend

- Next.js 14+ (React)
- TypeScript
- TailwindCSS
- shadcn/ui

### Blockchain

- Wagmi
- Solidity Smart Contracts
- Ethers.js
- Rainbow-Kit Wallet Integration

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- MetaMask or any other web3 wallet browser extension

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/StabilityNexus/hodlCoin-Solidity-WebUI.git
cd hodlCoin-Solidity-WebUI
```

#### 2. Install Dependencies

Using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Local Setup with Project ID

Before running the project locally, you need to set up an environment variable with your Project ID. Follow these steps:

### Create a `.env` File

In the root directory of the project, create a file named `.env` and add the following line:

```env
NEXT_PUBLIC_PROJECT_ID=your-project-id
```

### Obtain Your Project ID

To get your `your-project-id` value:

1. Visit [Reown Cloud](https://cloud.reown.com/sign-in).
2. Create an account or log in if you already have one.
3. Create a new project within the dashboard.
4. Once the project is created, locate your project key (this may be labeled as "Project ID" or "API Key").
5. Copy the key and paste it into your `.env` file in place of `your-project-id`.

#### 4. Run the Development Server

Start the app locally:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

#### 5. Open your Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

---

## Contributing

We welcome contributions of all kinds! To contribute:

1. Fork the repository and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3. Run the development workflow commands to ensure code quality:
   - `npm run format:write`
   - `npm run lint:fix`
   - `npm run typecheck`
4. Push your branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for review.

If you encounter bugs, need help, or have feature requests:

- Please open an issue in this repository providing detailed information.
- Describe the problem clearly and include any relevant logs or screenshots.

We appreciate your feedback and contributions!
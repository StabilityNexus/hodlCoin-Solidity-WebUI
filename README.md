ODO is a modern Web3-enabled frontend application built using Next.js 14 and TypeScript.
It provides a clean, performant, and scalable foundation for blockchain-based interactions, wallet connectivity, and decentralized application workflows, following Stability Nexus standards.

Project Maturity

The following checklist reflects the current state of the project. Items not yet completed are intentionally left unchecked.

❌ The project has a logo

❌ The project has a favicon

The Protocol

❌ Has been described and formally specified in a paper

❌ Has had its main properties mathematically proven

❌ Has been formally verified

Smart Contracts

❌ Were thoroughly reviewed by at least two knights of The Stable Order

❌ Were deployed to:

Ergo

Cardano

EVM Chains:

Ethereum Classic

Ethereum

Polygon

BSC

Base

Mobile App

❌ Has an About page containing the Stability Nexus logo and social media links

❌ Is available for download as a release in this repository

❌ Is available in the relevant app stores

Web Frontend

✅ Has proper title and metadata

❌ Has proper Open Graph metadata for social sharing (Discord, Telegram, Twitter, LinkedIn)

❌ Has a footer containing the Stability Nexus logo and social media links

✅ Is fully static and client-side

❌ Is deployed to GitHub Pages via a GitHub Workflow

❌ Is accessible through the https://odo.stability.nexus domain

❌ The project is listed at https://stability.nexus/protocols

Tech Stack
Frontend

Next.js 14+ (React)

TypeScript

Tailwind CSS

shadcn/ui

Blockchain

Wagmi

Solidity Smart Contracts

Ethers.js

Getting Started
Prerequisites

Ensure the following are installed on your system:

Node.js 18+

npm / yarn / pnpm

MetaMask or any compatible Web3 wallet browser extension

Installation
1. Clone the Repository
git clone https://github.com/StabilityNexus/ODO.git
cd ODO

2. Install Dependencies

Using your preferred package manager:

npm install
# or
yarn install
# or
pnpm install

3. Environment Configuration

Create a .env file in the root of the project and add:

NEXT_PUBLIC_PROJECT_ID=your-project-id

How to obtain the Project ID

Visit Reown Cloud

Create an account or log in

Create a new project from the dashboard

Copy the generated Project ID / API Key

Paste it into the .env file

4. Run the Development Server
npm run dev
# or
yarn dev
# or
pnpm dev

5. Open in Browser

Navigate to:

http://localhost:3000


The application will automatically reload when you modify the source files.

Contributing

We welcome contributions of all kinds and appreciate community involvement.

Contribution Steps

Fork the repository and create your feature branch

git checkout -b feature/AmazingFeature


Commit your changes

git commit -m "Add AmazingFeature"


Run development workflow commands to ensure code quality

npm run format:write
npm run lint:fix
npm run typecheck


Push your branch

git push origin feature/AmazingFeature


Open a Pull Request for review

Issues & Support

Please open an issue for bugs, feature requests, or questions

Provide clear descriptions, logs, and screenshots where applicable

We appreciate your feedback and contributions to the project 🤝

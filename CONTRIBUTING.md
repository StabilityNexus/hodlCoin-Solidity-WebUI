# Contributing Guide

## Table of Contents
- Getting Started
- Branching and Commits
- Coding Standards
- UI/UX Conventions
- Pull Request Checklist
- Issue Reporting

## Getting Started
- Fork the repository and create a feature branch from `main`.
- Install dependencies and set up environment variables:
  - Copy `.env.example` to `.env`
  - Set `NEXT_PUBLIC_PROJECT_ID` from Reown Cloud (used in `utils/config.ts:16`)
- Run the app locally:
  - `npm run dev`

## Branching and Commits
- Use descriptive branch names, e.g., `feat/explorer-pagination`, `fix/vault-sync-error`.
- Prefer Conventional Commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactors
  - `chore:` for maintenance tasks

## Coding Standards
- TypeScript strict mode is enabled (`tsconfig.json:11`); keep types explicit.
- Use path alias `@/*` for imports (`tsconfig.json:25`).
- Run `npm run lint` and fix issues before committing.
- Follow Prettier formatting (`.prettierrc`).
- Keep functions small and reusable; prefer composable components under `components/`.

## UI/UX Conventions
- Use shadcn/ui components from `components/ui/` for consistency.
- Tailwind for styling; avoid inline styles unless necessary.
- Keep interactive features client-side (`'use client'`) when needed.
- Keep animations lightweight (Lottie assets under `public/animations/`).

## Pull Request Checklist
- Clear PR title and summary of changes.
- Reference related issues.
- Include code references when relevant:
  - Env usage: `utils/config.ts:16`
  - Static export: `next.config.mjs:4`, `next.config.mjs:8`
  - Vault sync: `app/[vaultId]/InteractionClient.tsx:311`
- Ensure `npm run lint` passes.
- Verify local build if applicable: `npm run build`.

## Issue Reporting
- Provide steps to reproduce, expected vs actual behavior, and environment details.
- Attach console errors or network logs when relevant.

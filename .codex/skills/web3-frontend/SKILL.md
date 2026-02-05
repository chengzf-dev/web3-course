---
name: web3-frontend
description: Build the Web3 University (web3-course) frontend UI using Next.js, wagmi+viem, TailwindCSS, and shadcn/ui. Use when implementing student/author/admin pages, wallet connect, course list/detail, approve+buy flow, YD swap, AAVE staking UI, learning progress, NFT certificates, and analytics dashboards from docs/task.md and docs/web3-prd.md.
---

# Web3 Frontend

## Overview
Build the Web3 University UI from the product task and PRD, wiring wallet state, onchain calls, and Web2 API reads for courses, certificates, and progress.

## Workflow
1. Read `references/ui-spec.md` for screen requirements and components.
2. Read `references/paths.md` for route structure and file layout.
3. Read `references/flows.md` for wallet, approve+buy, swap, and staking flows.
4. Read `references/data-contracts.md` for UI data shapes and state.
5. Read `references/advanced-features.md` for NFT certificates, admin, progress, analytics.
6. Use assets in `assets/` for visual reference; do not copy HTML blindly.

## Build Steps
1. Implement layout and navigation skeleton that matches the screens (desktop + mobile).
2. Add wallet connect and ENS/address display with network selector.
3. Render course list cards and purchase state badges.
4. Implement course detail view with ownership checks and gated content display.
5. Implement approve → buy transaction flow with explicit status states.
6. Implement ETH ↔ YD swap form with fixed-rate calculation UI.
7. Implement author course creation form (title/content/price in YD).
8. Implement author staking page for AAVE (ETH path first), with 3-step tx UX.
9. Implement learning progress UI and course completion CTA.
10. Implement NFT certificate UI (mint/status/view on explorer).
11. Implement admin moderation views and analytics dashboard.
12. Add error states and empty states per reference.

## Quality Bar
- Each transaction flow shows: idle → wallet popup → pending → success/fail.
- Wallet/network mismatch is surfaced before any tx.
- Mobile layout is functional and readable.
- Admin views are gated and do not appear for non-admin.

## Resources
- `references/ui-spec.md`
- `references/paths.md`
- `references/flows.md`
- `references/data-contracts.md`
- `references/advanced-features.md`
- `assets/` (screenshots, sketch, optional HTML)

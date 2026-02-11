# Changelog

## 2026-02-06

### Scope
- Validation against `/Users/zane/yd/web3-course/docs/task.md` for `http://localhost:3000/`.
- Focus on core required flows: wallet, course purchase, author create, ETH<->YD swap, and platform controls.

### Issues Found
- Home page staking CTA (`Go to staking`) was not navigable.
- No repository-level automated end-to-end script covering both course purchase and swap directions.
- Build/type reliability risk from contract address type mismatch in frontend contract typing.

### Fixes Applied
- Made staking CTA navigable with route link:
  - `/Users/zane/yd/web3-course/apps/frontend/app/page.tsx`
- Added full local verification script for core onchain flows:
  - `/Users/zane/yd/web3-course/apps/contracts/scripts/verify-local-full.ts`
  - Added npm script:
  - `/Users/zane/yd/web3-course/apps/contracts/package.json` (`verify:local:full`)
- Tightened contract address typing for frontend contract bindings:
  - `/Users/zane/yd/web3-course/packages/lib/src/contracts.ts`
- Added exchange withdraw events to improve observability/history:
  - `/Users/zane/yd/web3-course/apps/contracts/contracts/Exchange.sol`

### Automated Verification
- Executed local deployment/export/seed:
  - `pnpm run deploy:local`
  - `pnpm run export:abi:local`
  - `pnpm exec hardhat run scripts/seed-course.ts --network localhost`
- Browser automation checks (DevTools):
  - `/exchange` shows liquidity and recent swaps.
  - Swap flow confirms and updates status/history.
  - `/admin/exchange` shows `Withdraw YD` and `Recent changes`.
- Contract automation script available:
  - `pnpm run verify:local:full`

### Notes
- `NEXT_PUBLIC_EXPLORER_URL` controls whether tx links are rendered as full explorer links; otherwise short tx hash is shown.

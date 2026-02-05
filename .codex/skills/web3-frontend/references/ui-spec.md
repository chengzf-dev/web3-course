# UI Spec (Web3 University)

## Primary Sources
- `docs/task.md` for core features and flows
- `docs/web3-prd.md` for advanced features (NFT, admin, analytics)
- `docs/ui/**/screen.png` for layout reference
- `docs/web3-course-ui.jpg` for overall sketch

## Required Screens
- Home / course list (student)
- Course detail (student)
- Author dashboard (course management)
- Course creation (basic info, outline, pricing/publish)
- Author earnings
- Exchange/swap
- Author stake (AAVE)
- Admin dashboard (moderation + metrics)
- Learning progress (profile or course detail section)

## Shared UI Elements
- Wallet connect button + ENS/address display
- Network selector (ETH main/test/local)
- Token balances (YD, ETH, USDT optional)
- Global toasts for tx status

## Course Cards
- Title, short description, price (YD)
- Purchase status badge (owned / not owned)
- Progress indicator (if owned)
- CTA: Approve / Buy

## Course Detail
- Header: title, author
- Price + action
- Owned: show content sections + progress
- Not owned: show lock / prompt to buy
- Completion: certificate CTA

## Author Creation
- Fields: title, content/description, price in YD
- Save to Web2 + createCourse onchain

## Author Earnings
- Show total YD earned and recent purchases
- CTA to swap to ETH/USDT

## Exchange UI
- Fixed rate: 1 ETH = 4000 YD
- Input for amount + confirm
- Show estimated output

## AAVE Staking UI (M1 ETH)
- Asset selector (default ETH)
- Balance + aToken balance
- Deposit and Withdraw panels
- 3-step tx explanation: approve/supply/confirm

## NFT Certificate UI
- Badge on course completion
- Detail view with tokenId + explorer link

## Admin UI
- Moderation table for courses
- Freeze/unpublish actions
- Metrics panel (DAU/WAU, revenue, conversion)

## Mobile Notes
- Stack sections vertically
- Use accordion for course detail content
- Buttons full-width

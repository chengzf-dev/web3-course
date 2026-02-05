---
name: web3-contract
description: Design and implement Web3 University smart contracts in Solidity/Hardhat, including YD ERC20 token, course registry/purchase, fixed-rate swap, NFT certificates, and optional AAVE staking integration. Use when creating or updating onchain logic for course purchase, ownership mapping, and certificate minting.
---

# Web3 Contracts

## Overview
Implement Solidity contracts for YD token, course creation/purchase, mock swap, certificate NFT, and AAVE integration stubs.

## Workflow
1. Read `references/contracts.md` for contract responsibilities.
2. Read `references/events.md` for event schema.
3. Read `references/fees.md` for platform fee logic.
4. Read `references/aave.md` for staking integration approach.

## Build Steps
1. Implement YD ERC20 token contract.
2. Implement Courses contract with createCourse, buyCourse, and ownership mapping.
3. Implement platform fee distribution (bps).
4. Implement MockSwap contract for fixed ETH↔YD rate.
5. Implement Certificate NFT contract and mint flow on completion.
6. Export ABI + addresses for frontend usage.

## Quality Bar
- Ownership mapping is updated only on successful purchase.
- Fees are transparent and configurable by admin.
- Events emitted for course creation, purchase, and certificate mint.

## Resources
- `references/contracts.md`
- `references/events.md`
- `references/fees.md`
- `references/aave.md`

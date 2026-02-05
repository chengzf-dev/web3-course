---
name: web3-backend
description: Design and implement the Web3 University backend (NestJS + Prisma + Swagger) for course metadata, ownership checks, purchase flow, swap quotes, learning progress, NFT certificates, and admin moderation APIs. Use when creating APIs and schemas that bridge Web2 data with onchain checks for course access.
---

# Web3 Backend

## Overview
Provide REST APIs and storage for course metadata and user access, while validating ownership via onchain contracts and supporting PRD features.

## Workflow
1. Read `references/api.md` for endpoints and payloads.
2. Read `references/schema.md` for data models.
3. Read `references/onchain.md` for contract calls and ownership checks.
4. Read `references/security.md` for fee/auth/idempotency guidance.

## Build Steps
1. Implement course CRUD (author create, list, detail).
2. Implement purchase status endpoint backed by onchain ownership check.
3. Implement gated course content endpoint for owned users only.
4. Implement swap quote endpoint (fixed rate) and optional transaction metadata.
5. Implement learning progress endpoints (read/update per user/course).
6. Implement certificate endpoints (issue/read by wallet).
7. Implement admin moderation endpoints (approve/unpublish/freeze).
8. Add webhooks or polling hooks for onchain purchase sync (optional for MVP).
9. Document APIs in Swagger.

## Quality Bar
- Ownership checks are authoritative onchain.
- APIs are idempotent where applicable.
- Clear error responses for unauthorized, not found, insufficient allowance.

## Resources
- `references/api.md`
- `references/schema.md`
- `references/onchain.md`
- `references/security.md`

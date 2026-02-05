# Prisma Model Outline

## User
- id (uuid)
- walletAddress (unique)
- ens (nullable)
- role (student|author|admin)
- status (active|frozen)
- createdAt

## Course
- id (uuid)
- title
- description
- content (text)
- priceYd (string or decimal)
- authorAddress
- status (draft|published|unpublished)
- createdAt

## Purchase (optional mirror)
- id (uuid)
- courseId (fk)
- buyerAddress
- txHash
- createdAt

## Progress
- id (uuid)
- courseId (fk)
- userAddress
- percent (int)
- lastSectionId (nullable)
- updatedAt

## Certificate
- id (uuid)
- courseId (fk)
- userAddress
- tokenId (string)
- txHash (nullable)
- createdAt

## SwapQuote (not persisted)
- inputToken
- inputAmount
- outputAmount
- rate

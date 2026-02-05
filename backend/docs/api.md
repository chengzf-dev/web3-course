# Web3-Course Backend API (NestJS)

## Overview
These endpoints power the Next.js UI in `web/` and provide Web2 course metadata, author tools, and admin moderation. On-chain ownership checks are performed via the Courses contract mapping (`courseId => user => bool`) and mirrored in cache tables for faster reads.

- **Base URL**: `/api`
- **Auth**: Wallet signature + JWT (recommended). For MVP, pass wallet address in headers and verify on chain.
- **Chain ownership**: Use `Courses.owned(courseId, user)` or `mapping` accessor.

## Course APIs (Learner)

### GET `/courses`
List courses with ownership state for a viewer.

**Query**
- `viewer` (optional, wallet address)

**Response**
```json
{
  "items": [
    {
      "id": "defi-101",
      "title": "Introduction to DeFi",
      "description": "Build a DeFi foundation...",
      "priceYd": "800",
      "authorAddress": "0x1234...ABCD",
      "owned": true,
      "progress": 72,
      "status": "PUBLISHED"
    }
  ]
}
```

### GET `/courses/:id`
Returns course details plus ownership and progress.

**Query**
- `viewer` (optional, wallet address)

**Response**
```json
{
  "id": "defi-101",
  "title": "Introduction to DeFi",
  "description": "Build a DeFi foundation...",
  "priceYd": "800",
  "authorAddress": "0x1234...ABCD",
  "owned": true,
  "progress": 72,
  "content": "Course content unlocked..."
}
```

### GET `/courses/:id/content`
Fetches gated content. Server checks `owned` on chain; if false, return `403`.

### POST `/courses/:id/purchase`
Records a purchase after on-chain confirmation. This is optional but allows analytics.

**Body**
```json
{
  "walletAddress": "0xabc...",
  "chainId": 1,
  "txHash": "0x...",
  "priceYd": "800"
}
```

## Author APIs

### GET `/author/courses`
Lists courses owned by the author.

**Headers**
- `x-wallet-address`: author wallet

### POST `/author/courses`
Creates course metadata in Web2 storage (step 1 of the creation flow).

**Body**
```json
{
  "id": "defi-101",
  "title": "Introduction to DeFi",
  "description": "Build a DeFi foundation...",
  "priceYd": "800",
  "content": "Full course content",
  "coverImageUrl": "https://.../cover.png"
}
```

### PATCH `/author/courses/:id`
Updates metadata (title/description/content/status).

### GET `/author/analytics`
Returns earnings, enrollments, and progress aggregates.

**Response**
```json
{
  "totalCourses": 3,
  "totalEarningsYd": "18400",
  "activeLearners": 2410,
  "courseBreakdown": [
    { "courseId": "defi-101", "purchases": 214, "avgProgress": 62 }
  ]
}
```

## Progress APIs

### GET `/courses/:id/progress`
Returns learner progress for a course.

### PUT `/courses/:id/progress`
Updates learner progress.

**Body**
```json
{
  "walletAddress": "0xabc...",
  "progress": 72
}
```

## Swap APIs (Mock swap)

### GET `/swap/quote`
Returns a quote for YD <> ETH/USDT.

**Query**
- `from` ("ETH" | "YD" | "USDT")
- `to`
- `amount`

**Response**
```json
{
  "rate": "4000",
  "amountOut": "0.25",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

## Admin APIs

### GET `/admin/moderation`
Returns pending/flagged courses.

### POST `/admin/moderation/:id/approve`
Approves a course.

### POST `/admin/moderation/:id/freeze`
Freezes/unpublishes a course.

### GET `/admin/metrics`
Returns platform metrics (DAU/WAU/conversion/revenue).

## Swagger
Expose OpenAPI at `/docs` with schemas for all DTOs above.

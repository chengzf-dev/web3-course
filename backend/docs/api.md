# Web3-Course Backend API (NestJS)

Base URL: `/api`

## Courses
- `GET /courses`
  - Query: `owned` (optional, by address)
  - Response: `Course[]`

- `GET /courses/:id`
  - Response: `CourseDetail`

- `POST /courses`
  - Body: `{ title, description, content, priceYd, authorAddress }`
  - Response: `{ id, txIntent }`

## Ownership
- `GET /courses/:id/ownership?address=0x...`
  - Response: `{ owned: boolean }`

## Course Content (gated)
- `GET /courses/:id/content?address=0x...`
  - Response: `{ content }` if owned, else 403

## Swap Quote
- `GET /swap/quote?input=ETH&amount=1.2`
  - Response: `{ rate, outputAmount }`

## Learning Progress
- `GET /courses/:id/progress?address=0x...`
  - Response: `{ percent, lastSectionId }`

- `POST /courses/:id/progress`
  - Body: `{ address, percent, lastSectionId }`
  - Response: `{ ok: true }`

## Certificates (NFT)
- `GET /certificates?address=0x...`
  - Response: `Certificate[]`

- `POST /certificates`
  - Body: `{ address, courseId }`
  - Response: `{ tokenId, txIntent }`

## Admin Moderation
- `POST /admin/courses/:id/approve`
- `POST /admin/courses/:id/unpublish`
- `POST /admin/users/:address/freeze`

## Purchase Sync (optional)
- `POST /hooks/purchase`
  - Body: `{ txHash, courseId, buyer }`
  - Response: `{ ok: true }`

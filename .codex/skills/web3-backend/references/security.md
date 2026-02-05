# Backend Rules

## Auth
- Treat wallet address as principal (signed message if needed)
- Never trust client-owned flag; always check chain

## Fees
- Platform fee bps is applied onchain; backend only displays

## Idempotency
- Course creation: ignore duplicate courseId
- Purchase sync: ignore duplicate txHash

## Errors
- 400: invalid params
- 401/403: not owned / unauthorized
- 404: course not found
- 409: duplicate create

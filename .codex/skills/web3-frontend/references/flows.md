# Interaction Flows

## Wallet Connect
1. User clicks connect
2. Show ENS/address
3. Verify chain; prompt switch if mismatch

## Course Purchase (Student)
1. User clicks course detail
2. Backend checks onchain ownership
3. If not owned, show approve + buy buttons
4. Approve YD token allowance for Courses contract
5. Call buyCourse(courseId)
6. Update UI: owned badge + show content

## Course Creation (Author)
1. Fill title/content/price (YD)
2. Save metadata to Web2
3. Call createCourse(courseId, price, author)
4. Show tx status + created state

## Swap ETH ↔ YD
1. User enters amount
2. Show fixed-rate quote (1 ETH = 4000 YD)
3. Confirm swap
4. Execute mock swap contract tx

## AAVE Staking (Author, M1 ETH)
1. User selects ETH
2. Call WETHGateway.depositETH(pool, onBehalfOf=user)
3. Show pending + success
4. For withdraw: WETHGateway.withdrawETH(pool, amount, to=user)

## Error States
- Not connected → show connect prompt
- Wrong chain → show switch network
- Insufficient balance → show disabled CTA + message
- Tx failure → show retry

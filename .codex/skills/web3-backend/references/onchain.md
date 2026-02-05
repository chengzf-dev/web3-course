# Onchain Checks

## Ownership Mapping
- `Courses.owned(courseId, user)` or `mapping(courseId => mapping(user => bool))`
- Use this as the source of truth for access control

## Purchase Flow
- Client performs `approve` + `buyCourse` onchain
- Backend only reads chain to verify access

## Certificate Mint
- NFT certificate contract mints to user on completion
- Backend may trigger mint intent, but chain is source of truth

## Events
- `CourseCreated(courseId, author, price)`
- `CoursePurchased(courseId, user, price)`
- `CertificateMinted(courseId, user, tokenId)`
- If syncing, index these events to update mirrors

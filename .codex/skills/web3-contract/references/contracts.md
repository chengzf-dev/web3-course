# Contract Responsibilities

## YDToken (ERC20)
- Mint initial supply to deployer
- Standard ERC20 methods

## Courses
- `createCourse(courseId, priceYd, author)`
- `buyCourse(courseId)`
- `mapping(courseId => mapping(user => bool))` ownership
- Transfer YD from buyer to author minus platform fee

## Certificates (NFT)
- ERC721 or ERC1155
- Mint on course completion
- `mintCertificate(courseId, to)` gated by backend/admin

## MockSwap
- Fixed rate: 1 ETH = 4000 YD
- Swap functions:
  - `swapEthToYd()` payable
  - `swapYdToEth(amount)`

## Exports
- Export ABI + addresses to `contracts/exports/<chainId>.json`

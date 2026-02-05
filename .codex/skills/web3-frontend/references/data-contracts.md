# UI Data Contracts

## Course
```
{
  id: string
  title: string
  description: string
  priceYd: string
  authorAddress: string
  owned: boolean
}
```

## CourseDetail
```
{
  ...Course
  content: string | null
}
```

## WalletState
```
{
  address: string
  ens?: string
  chainId: number
  ydBalance: string
  ethBalance: string
}
```

## PurchaseState
```
{
  courseId: string
  allowance: string
  canBuy: boolean
  step: 'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error'
}
```

## SwapQuote
```
{
  inputToken: 'ETH' | 'YD'
  outputToken: 'YD' | 'ETH'
  rate: string
  inputAmount: string
  outputAmount: string
}
```

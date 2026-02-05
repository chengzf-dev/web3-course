# AAVE Integration (M1 ETH)

- Use AAVE V3 Pool + WETHGateway
- ETH deposit:
  - `WETHGateway.depositETH(pool, onBehalfOf, 0)` with msg.value
- ETH withdraw:
  - `WETHGateway.withdrawETH(pool, amount, to)`
- For ERC20 (USDT), use `Pool.supply` and `Pool.withdraw`
- Keep adapter contract optional; prefer direct calls in M1

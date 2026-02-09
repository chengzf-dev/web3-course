export type MetaMaskNetworkConfig = {
  chainId: `0x${string}`;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): EthereumProvider {
  const provider = (globalThis as { ethereum?: EthereumProvider }).ethereum;
  if (!provider) {
    throw new Error("MetaMask not installed");
  }
  return provider;
}

export const NETWORK_CONFIGS: Record<string, MetaMaskNetworkConfig> = {
  hardhat: {
    chainId: "0x7a69",
    chainName: "Hardhat Local",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: []
  },
  ethereum: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://etherscan.io/"]
  },
  polygon: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  bsc: {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed1.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"]
  },
  arbitrum: {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"]
  },
  optimism: {
    chainId: "0xa",
    chainName: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io/"],
    blockExplorerUrls: ["https://optimistic.etherscan.io/"]
  },
  base: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org/"],
    blockExplorerUrls: ["https://basescan.org/"]
  },
  sepolia: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
    rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_KEY"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"]
  }
};

export function getNetworkName(chainId: string): string {
  const key = Object.keys(NETWORK_CONFIGS).find(
    (name) => NETWORK_CONFIGS[name].chainId.toLowerCase() === chainId.toLowerCase()
  );
  return key ? NETWORK_CONFIGS[key].chainName : `Unknown (${chainId})`;
}

export async function getAccounts(): Promise<string[]> {
  const provider = getProvider();
  return (await provider.request({ method: "eth_accounts" })) as string[];
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getProvider();
  return (await provider.request({ method: "eth_requestAccounts" })) as string[];
}

export async function requestAccountPicker(): Promise<string[]> {
  const provider = getProvider();
  try {
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });
  } catch {
    // Some wallets don't support permission picker reliably; fall through.
  }
  // Force a standard account request so MetaMask can prompt account selection.
  return requestAccounts();
}

export async function getCurrentChainId(): Promise<string> {
  const provider = getProvider();
  return (await provider.request({ method: "eth_chainId" })) as string;
}

export async function getBalance(account: string): Promise<{ wei: string; eth: number; formatted: string }> {
  const provider = getProvider();
  const wei = (await provider.request({
    method: "eth_getBalance",
    params: [account, "latest"]
  })) as string;
  const eth = parseInt(wei, 16) / Math.pow(10, 18);
  return {
    wei,
    eth,
    formatted: `${eth.toFixed(4)} ETH`
  };
}

export async function getAccountsWithBalance(): Promise<
  { index: number; address: string; balance: string }[]
> {
  const accounts = await getAccounts();
  const rows = await Promise.all(
    accounts.map(async (address, index) => {
      try {
        const balance = await getBalance(address);
        return { index, address, balance: balance.formatted };
      } catch {
        return { index, address, balance: "N/A" };
      }
    })
  );
  return rows;
}

export async function switchToNetwork(networkName: string): Promise<void> {
  const provider = getProvider();
  const config = NETWORK_CONFIGS[networkName];
  if (!config) {
    throw new Error(`Unsupported network: ${networkName}`);
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: config.chainId }]
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [config]
    });
  }
}

export function onMetaMaskEvent(
  event: "accountsChanged" | "chainChanged",
  handler: (...args: unknown[]) => void
): () => void {
  const provider = getProvider();
  provider.on?.(event, handler);
  return () => provider.removeListener?.(event, handler);
}

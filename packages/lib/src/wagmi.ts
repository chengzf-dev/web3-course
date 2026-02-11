import { createConfig, http } from "wagmi";
import { hardhat } from "viem/chains";
import { injected } from "wagmi/connectors";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";

const chain = {
  ...hardhat,
  id: chainId,
  rpcUrls: {
    default: { http: [rpcUrl] }
  }
};

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: {
    [chain.id]: http(rpcUrl)
  }
});

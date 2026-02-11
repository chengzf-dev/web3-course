// Local dev contracts exported by Hardhat (chainId 31337)
// Requires next.config.js experimental.externalDir = true
import exportsJson from "../../../apps/contracts/exports/31337.json";

export const contracts = exportsJson as {
  chainId: number;
  network: string;
  addresses: {
    YDToken: `0x${string}`;
    CourseCertificate: `0x${string}`;
    Courses: `0x${string}`;
    Exchange: `0x${string}`;
  };
  abis: {
    YDToken: unknown[];
    CourseCertificate: unknown[];
    Courses: unknown[];
    Exchange: unknown[];
  };
};

import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";
import { parseUnits } from "ethers";

loadEnv();

function getEnvNumber(key: string, fallback: number) {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for ${key}`);
  }
  return parsed;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const chainId = Number(await hre.network.provider.send("eth_chainId"));

  const owner = process.env.OWNER_ADDRESS ?? deployer.address;
  const feeRecipient = process.env.FEE_RECIPIENT ?? deployer.address;
  const feeBps = getEnvNumber("PLATFORM_FEE_BPS", 300);
  const swapRate = getEnvNumber("SWAP_RATE", 4000);
  const swapFeeBps = getEnvNumber("SWAP_FEE_BPS", 200);
  const swapYdLiquidity = process.env.SWAP_YD_LIQUIDITY ?? "500000";
  const swapEthLiquidity = process.env.SWAP_ETH_LIQUIDITY ?? "100";

  const tokenName = process.env.YD_TOKEN_NAME ?? "YuanDao Token";
  const tokenSymbol = process.env.YD_TOKEN_SYMBOL ?? "YD";
  const tokenDecimals = getEnvNumber("YD_TOKEN_DECIMALS", 18);
  const initialSupplyTokens = process.env.YD_TOKEN_INITIAL_SUPPLY ?? "1000000";
  const initialSupply = parseUnits(initialSupplyTokens, tokenDecimals);

  const YDToken = await hre.ethers.getContractFactory("YDToken");
  const ydToken = await YDToken.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    initialSupply,
    owner
  );
  await ydToken.waitForDeployment();

  const CourseCertificate = await hre.ethers.getContractFactory("CourseCertificate");
  const certificate = await CourseCertificate.deploy(owner);
  await certificate.waitForDeployment();

  const Courses = await hre.ethers.getContractFactory("Courses");
  const courses = await Courses.deploy(
    await ydToken.getAddress(),
    await certificate.getAddress(),
    owner,
    feeRecipient,
    feeBps
  );
  await courses.waitForDeployment();

  const tx = await certificate.setMinter(await courses.getAddress());
  await tx.wait();

  const Exchange = await hre.ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(
    await ydToken.getAddress(),
    swapRate,
    feeRecipient,
    swapFeeBps,
    owner
  );
  await exchange.waitForDeployment();

  const ydLiquidity = parseUnits(swapYdLiquidity, tokenDecimals);
  const ydTransferTx = await ydToken.transfer(await exchange.getAddress(), ydLiquidity);
  await ydTransferTx.wait();

  const ethLiquidity = parseUnits(swapEthLiquidity, 18);
  const ethTransferTx = await deployer.sendTransaction({
    to: await exchange.getAddress(),
    value: ethLiquidity
  });
  await ethTransferTx.wait();

  const deployments = {
    chainId,
    network: hre.network.name,
    addresses: {
      YDToken: await ydToken.getAddress(),
      CourseCertificate: await certificate.getAddress(),
      Courses: await courses.getAddress(),
      Exchange: await exchange.getAddress()
    }
  };

  const deploymentsDir = path.resolve("deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const filePath = path.join(deploymentsDir, `${chainId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));

  console.log("Deployed successfully:");
  console.log(deployments);
  console.log(`Saved deployments to ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { config as loadEnv } from "dotenv";
import hre from "hardhat";
import { parseUnits } from "ethers";
import fs from "node:fs";
import path from "node:path";

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
  const deploymentsPath = path.resolve("deployments", `${chainId}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(`Missing deployments file: ${deploymentsPath}`);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const courses = await hre.ethers.getContractAt("Courses", deployments.addresses.Courses);

  const courseId = process.env.COURSE_ID ?? "9cda16d0-2e9f-436d-b25c-6a81c6272977";
  const author = process.env.COURSE_AUTHOR ?? deployer.address;
  const priceYd = process.env.COURSE_PRICE_YD ?? "500";
  const tokenDecimals = getEnvNumber("YD_TOKEN_DECIMALS", 18);
  const price = parseUnits(priceYd, tokenDecimals);

  const info = await courses.courseInfo(courseId);
  const exists = Array.isArray(info) ? Boolean(info[2]) : Boolean(info?.exists);
  if (exists) {
    console.log(`Course already exists onchain: ${courseId}`);
    return;
  }

  const tx = await courses.createCourse(courseId, price, author);
  await tx.wait();

  console.log(`Course created onchain: ${courseId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

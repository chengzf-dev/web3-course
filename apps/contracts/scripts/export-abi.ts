import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";

loadEnv();

async function main() {
  const chainId = Number(await hre.network.provider.send("eth_chainId"));
  const deploymentsPath = path.resolve("deployments", `${chainId}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(`Missing deployments file: ${deploymentsPath}`);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  const ydToken = await hre.artifacts.readArtifact("YDToken");
  const courses = await hre.artifacts.readArtifact("Courses");
  const certificate = await hre.artifacts.readArtifact("CourseCertificate");
  const exchange = await hre.artifacts.readArtifact("Exchange");

  const exportsPayload = {
    chainId,
    network: hre.network.name,
    addresses: deployments.addresses,
    abis: {
      YDToken: ydToken.abi,
      Courses: courses.abi,
      CourseCertificate: certificate.abi,
      Exchange: exchange.abi
    }
  };

  const exportsDir = path.resolve("exports");
  fs.mkdirSync(exportsDir, { recursive: true });
  const exportFile = path.join(exportsDir, `${chainId}.json`);
  fs.writeFileSync(exportFile, JSON.stringify(exportsPayload, null, 2));

  console.log(`Exported ABI + addresses to ${exportFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

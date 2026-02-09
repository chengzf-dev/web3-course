import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";
import { parseEther, parseUnits } from "ethers";

async function main() {
  const chainId = Number(await hre.network.provider.send("eth_chainId"));
  const deploymentsPath = path.resolve("deployments", `${chainId}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(`Missing deployments file: ${deploymentsPath}. Run deploy:local first.`);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const { YDToken, Courses, CourseCertificate, Exchange } = deployments.addresses;

  const [owner, author, student] = await hre.ethers.getSigners();
  const ydToken = await hre.ethers.getContractAt("YDToken", YDToken);
  const courses = await hre.ethers.getContractAt("Courses", Courses);
  const certificate = await hre.ethers.getContractAt("CourseCertificate", CourseCertificate);
  const exchange = await hre.ethers.getContractAt("Exchange", Exchange);

  const decimals = Number(await ydToken.decimals());
  const coursePrice = parseUnits("100", decimals);
  const courseId = "verify-local-full-course";

  // 1) Course flow: fund -> create -> approve -> buy -> verify ownership + certificate.
  await (await ydToken.connect(owner).transfer(student.address, coursePrice)).wait();
  await (await courses.connect(author).createCourse(courseId, coursePrice, author.address)).wait();
  await (await ydToken.connect(student).approve(Courses, coursePrice)).wait();
  await (await courses.connect(student).buyCourse(courseId)).wait();

  const purchased = await courses.hasPurchased(courseId, student.address);
  if (!purchased) throw new Error("Course purchase verification failed");
  const nextTokenId = await certificate.nextTokenId();
  const mintedTokenId = nextTokenId - 1n;
  const certOwner = await certificate.ownerOf(mintedTokenId);
  if (certOwner.toLowerCase() !== student.address.toLowerCase()) {
    throw new Error("Certificate owner mismatch");
  }

  // 2) Swap flow: ETH -> YD.
  const studentYdBeforeEthSwap = await ydToken.balanceOf(student.address);
  const ethIn = parseEther("1");
  await (await exchange.connect(student).swapEthToYd({ value: ethIn })).wait();
  const studentYdAfterEthSwap = await ydToken.balanceOf(student.address);
  if (studentYdAfterEthSwap <= studentYdBeforeEthSwap) {
    throw new Error("ETH -> YD swap did not increase YD balance");
  }

  // 3) Swap flow: YD -> ETH (approve required).
  const ydIn = parseUnits("10", decimals);
  await (await ydToken.connect(student).approve(Exchange, ydIn)).wait();
  const studentYdBeforeYdSwap = await ydToken.balanceOf(student.address);
  await (await exchange.connect(student).swapYdToEth(ydIn)).wait();
  const studentYdAfterYdSwap = await ydToken.balanceOf(student.address);
  if (studentYdAfterYdSwap >= studentYdBeforeYdSwap) {
    throw new Error("YD -> ETH swap did not decrease YD balance");
  }

  console.log("verify-local-full passed", {
    chainId,
    purchased,
    mintedTokenId: mintedTokenId.toString(),
    studentYdBeforeEthSwap: studentYdBeforeEthSwap.toString(),
    studentYdAfterEthSwap: studentYdAfterEthSwap.toString(),
    studentYdBeforeYdSwap: studentYdBeforeYdSwap.toString(),
    studentYdAfterYdSwap: studentYdAfterYdSwap.toString()
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

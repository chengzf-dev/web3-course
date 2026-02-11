import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";
import { parseUnits } from "ethers";

async function main() {
  const chainId = Number(await hre.network.provider.send("eth_chainId"));
  const deploymentsPath = path.resolve("deployments", `${chainId}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(`Missing deployments file: ${deploymentsPath}. Run deploy:local first.`);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const { YDToken, Courses, CourseCertificate } = deployments.addresses;

  const [owner, author, student] = await hre.ethers.getSigners();

  const ydToken = await hre.ethers.getContractAt("YDToken", YDToken);
  const courses = await hre.ethers.getContractAt("Courses", Courses);
  const certificate = await hre.ethers.getContractAt("CourseCertificate", CourseCertificate);

  const decimals = Number(await ydToken.decimals());
  const price = parseUnits("100", decimals);

  // Fund student for purchase
  const transferTx = await ydToken.connect(owner).transfer(student.address, price);
  await transferTx.wait();

  // Create course by author
  const courseId = "local-course-001";
  const createTx = await courses
    .connect(author)
    .createCourse(courseId, price, author.address);
  await createTx.wait();

  // Approve and buy
  const approveTx = await ydToken.connect(student).approve(Courses, price);
  await approveTx.wait();

  const buyTx = await courses.connect(student).buyCourse(courseId);
  await buyTx.wait();

  const purchased = await courses.hasPurchased(courseId, student.address);
  const nextTokenId = await certificate.nextTokenId();
  const mintedTokenId = Number(nextTokenId) - 1;
  const certOwner = await certificate.ownerOf(mintedTokenId);

  const feeBps = Number(await courses.platformFeeBps());
  const fee = (price * BigInt(feeBps)) / 10_000n;
  const authorAmount = price - fee;

  const ownerBalance = await ydToken.balanceOf(owner.address);
  const authorBalance = await ydToken.balanceOf(author.address);
  const studentBalance = await ydToken.balanceOf(student.address);

  console.log("Verification results:");
  console.log({
    chainId,
    purchased,
    mintedTokenId,
    certOwner,
    feeBps,
    fee: fee.toString(),
    authorAmount: authorAmount.toString(),
    balances: {
      owner: ownerBalance.toString(),
      author: authorBalance.toString(),
      student: studentBalance.toString()
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

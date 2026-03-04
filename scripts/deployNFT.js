// const hre = require("hardhat");

import hre from "hardhat";
async function main() {
  const AgriShareAssetNFT = await hre.ethers.getContractFactory(
    "AgriShareAssetNFT",
  );
  const nft = await AgriShareAssetNFT.deploy();

  await nft.deployed();

  console.log("AgriShareAssetNFT deployed to:", nft.address);

  // Save to .env manually or use fs to append (for demo)
  console.log("Add to .env:");
  console.log(`NFT_CONTRACT_ADDRESS=${nft.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

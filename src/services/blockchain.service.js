import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.POLYGON_AMOY_RPC,
);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const NFT_ABI = [
  "function safeMint(address to, string memory uri) public returns (uint256)",
  "function owner() view returns (address)",
];

export const mintNFT = async (toAddress, metadataURI) => {
  if (!process.env.NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS not configured in .env file");
  }

  const nftContract = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    NFT_ABI,
    wallet,
  );

  try {
    const tx = await nftContract.safeMint(toAddress, metadataURI);
    const receipt = await tx.wait();

    const tokenId = receipt.events
      .find((e) => e.event === "Transfer")
      .args.tokenId.toNumber();

    console.log(`Minted NFT #${tokenId} to ${toAddress} - tx: ${tx.hash}`);
    return { tokenId, txHash: tx.hash };
  } catch (error) {
    console.error("Mint error:", error);
    throw new Error(`NFT mint failed: ${error.message}`);
  }
};

export const deployShareToken = async (
  name,
  symbol,
  totalSupply = 100n * 10n ** 18n,
) => {
  try {
    const factory = new ethers.ContractFactory(
      YieldShareTokenABI, // you'll need ABI/bytecode or use artifacts
      YieldShareTokenBytecode,
      wallet,
    );

    const contract = await factory.deploy(name, symbol, totalSupply);
    await contract.deployed();

    console.log(`ShareToken deployed: ${contract.address}`);
    return contract.address;
  } catch (err) {
    throw new Error(`Deploy failed: ${err.message}`);
  }
};

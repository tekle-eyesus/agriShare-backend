import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Asset from "../models/Asset.js";
import Listing from "../models/Listing.js";

export const createListing = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    throw new ApiError(403, "Only farmers can list assets");
  }

  const {
    assetId,
    investmentGoalBirr,
    sharesToSellPercent,
    expectedTotalYieldBirr,
    paydayDate,
    minSharesPerInvestor = 1,
  } = req.body;

  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  if (asset.farmer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not your asset");
  }
  if (asset.status !== "verified") {
    throw new ApiError(400, "Asset must be verified before listing");
  }
  if (asset.currentListing) {
    throw new ApiError(400, "Asset already listed");
  }

  // Calculate price per share token (100 total shares)
  const sharesToSell = Math.round(100 * (sharesToSellPercent / 100));
  const sharePrice = investmentGoalBirr / sharesToSell;

  const listing = await Listing.create({
    asset: asset._id,
    farmer: req.user._id,
    investmentGoalBirr,
    sharesToSellPercent,
    expectedTotalYieldBirr,
    paydayDate: new Date(paydayDate),
    minSharesPerInvestor,
    sharePricePerTokenBirr: sharePrice,
    // shareTokenAddress: 'pending deploy...',   // later real address after ERC-20 deployment
  });

  // Mock for now - in real - deploy ERC-20 & transfer fractions
  listing.shareTokenAddress = "0xMockShareTokenAddressForTesting";
  listing.shareTokenSymbol = `YS-${asset._id.toString().slice(-6)}`;
  await listing.save();

  asset.currentListing = listing._id;
  asset.status = "listed";
  await asset.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { listing },
        "Asset listed for investment successfully",
      ),
    );
});

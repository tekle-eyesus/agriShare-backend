import express from "express";
const router = express.Router();
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { createListing } from "../controllers/listing.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

router.post("/", protect, restrictTo("farmer"), asyncHandler(createListing));

// Later: GET /my-listings, GET /active, etc.

export default router;

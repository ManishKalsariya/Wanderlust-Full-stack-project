const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); // ✅ MUST import
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");

console.log("validateReview is:", validateReview);

const reviewController = require("../controllers/reviews.js")


// Add review
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
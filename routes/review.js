const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/reviews.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// ------------------- ROUTES -------------------

// Add a new review
router.post("/", isLoggedIn, validateReview, reviewController.createReview);

// Delete a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviewController.destroyReview);

module.exports = router;
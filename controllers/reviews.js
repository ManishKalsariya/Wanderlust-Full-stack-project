const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// Helper to wrap async routes and forward errors
const wrapAsync = (fn) => {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
};

module.exports.createReview = wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review added, thanks!");
  console.log("New review saved!");
  return res.redirect(`/listings/${req.params.id}`);
});

module.exports.destroyReview = wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  return res.redirect(`/listings/${id}`);
});
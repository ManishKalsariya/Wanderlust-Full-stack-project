const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");

const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

router
    .route("/")
    .get( wrapAsync(listingController.index))
    .post(
    isLoggedIn,
    upload.single('listing[image][url]'),

    (req, res, next) => {
        if (!req.body.listing) {
        req.body.listing = {};
        }

        if (req.file) {
        req.body.listing.image = {
            url: req.file.path,
            fileName: req.file.filename
        };
        }

        next();
    },

    validateListing,
    wrapAsync(listingController.createListing)
    );

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),

    // Inject old image if no new file
    async (req, res, next) => {
      const existingListing = await listing.findById(req.params.id);
      if (!req.body.listing) req.body.listing = {};

      if (!req.body.listing.image || !req.body.listing.image.url) {
        req.body.listing.image = {
          url: existingListing.image.url,
          fileName: existingListing.image.fileName
        };
      }
      next();
    },

    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
    
        

//Edit route...
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))


module.exports = router;


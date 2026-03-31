const listing = require("../models/listing");
const axios = require("axios");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index = async (req,res)=>{
    const allListings = await listing.find({});
    res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{

    
    res.render("./listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listinggg = await listing.findById(id).populate({path: "reviews", populate: {
        path : "author",
    }
    }).populate("owner");
    if(!listinggg){
        req.flash("error","Listing you requested for doesn't exist");
        return res.redirect("/listings");

    }

    res.render("./listings/show.ejs",{listinggg});
}


module.exports.createListing = async (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  const { location, country } = req.body.listing;

  // Concatenate location + country for better geocoding accuracy
  const fullLocation = `${location}, ${country}`;

  let coordinates = [78.9629, 20.5937]; // Default India fallback [lng, lat]

  try {
    const geoRes = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(fullLocation)}.json?key=21pyEZsxAMnpEdwx4Lgd`
    );

    if (geoRes.data.features && geoRes.data.features.length > 0) {
      coordinates = geoRes.data.features[0].geometry.coordinates; // [lng, lat]
    }
  } catch (err) {
    console.log("Geocoding failed, using India fallback:", err.message);
  }

  // Create new listing
  const newList = new listing(req.body.listing);
  newList.owner = req.user._id;

  // Handle uploaded image
  if (req.file) {
    newList.image = { url: req.file.path, fileName: req.file.filename };
  }

  // Save coordinates
  newList.geometry = { type: "Point", coordinates };

  await newList.save();

  req.flash("success", "New listing created");
  res.redirect("/listings");
};


module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listingggz = await listing.findById(id);
    if(!listingggz){
        req.flash("error","Listing you requested for doesn't exist");
        return res.redirect("/listings");

    }
    let originalImageUrl = listingggz.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/w_250")
    res.render("./listings/edit.ejs",{listingggz,originalImageUrl});

}

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const existingListing = await listing.findById(id);

  if (!existingListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Store old values BEFORE updating
  const oldLocation = existingListing.location;
  const oldCountry = existingListing.country;

  // Update fields
  existingListing.set(req.body.listing);

  // Handle image
  if (req.file) {
    existingListing.image = {
      url: req.file.path,
      fileName: req.file.filename
    };
  }

  // ✅ Correct comparison
  if (
    req.body.listing.location !== oldLocation ||
    req.body.listing.country !== oldCountry
  ) {
    const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;
    let coordinates = [78.9629, 20.5937];

    try {
      const geoRes = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(fullLocation)}.json?key=21pyEZsxAMnpEdwx4Lgd`
      );

      if (geoRes.data.features.length > 0) {
        coordinates = geoRes.data.features[0].geometry.coordinates;
      }
    } catch (err) {
      console.log("Geocoding failed:", err.message);
    }

    existingListing.geometry = { type: "Point", coordinates };
  }

  await existingListing.save();

  req.flash("success", "Listing updated!");
  return res.redirect(`/listings/${id}`); // ✅ add return
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
     req.flash("success","Listing deleted");
    res.redirect("/listings");
}
const { ref } = require('joi');
const mongoose = require('mongoose');
const Review = require("./review.js")
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required : true,
    },
    description:{
        type: String,
        reuqired:true,
    },
    image: {
        fileName : {
            type : String,
        },
        url : {
            type:String,
            default: "https://plus.unsplash.com/premium_photo-1669750817438-3f7f3112de8d?q=80&w=776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            set : (v) => v === "" ? "https://plus.unsplash.com/premium_photo-1669750817438-3f7f3112de8d?q=80&w=776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
            
        },
    },
    price : {
        type : Number,
        required:true,
    },
    location : {
        type : String,
        required:true,
    },
    country :{
        type : String,
        required:true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review"
        }
    ],
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    geometry: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [lng, lat]
}



})

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){

        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
})

const listing = mongoose.model("listing",listingSchema);
module.exports = listing;
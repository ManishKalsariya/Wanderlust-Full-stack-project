const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");


main().then(()=>{
    console.log("connected to dataBase");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoo
  // use.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDb = async ()=>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"69c535405bc0deda4fe31459"}));
    await listing.insertMany(initData.data);
    console.log("data was initialized !!")
    
}

initDb();
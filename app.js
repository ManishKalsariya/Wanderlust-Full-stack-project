if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
require('dotenv').config();


const express = require('express');
const app = express();
const path = require("path");
const mongoose = require('mongoose');
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const ExpressError = require("./utils/ExpressError.js");

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const user = require("./models/user.js");

const listingsRouter = require("./routes/Listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
const port = process.env.PORT || 8080;

main()
  .then(() => {
    console.log(" connected to dataBase");

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch(err => console.log(" DB connection failed:", err));

async function main() {
  await mongoose.connect(dbUrl);
}



const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "fallbacksecret"
  },
  touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
  console.log("Session store error", e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now()+1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly: true,
  }

}

// app.get("/",(req,res)=>{
//     res.send("listening");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next) => {  
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

app.get("/demouser", async (req,res)=>{
  let fakeUser = new user({
    email: "student@apnacollege.com",
    username:"delta-studentt",
  });
  let registeredUser = await user.register(fakeUser,"helloworld");
  res.send(registeredUser);
  console.log(registeredUser);
})



// index route...
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/listings",listingsRouter);
app.use("/",userRouter);



// All routes above this
// 404 handler (must be AFTER all routes)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // ✅ prevents crash
  }
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
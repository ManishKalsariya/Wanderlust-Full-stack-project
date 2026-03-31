if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
const port = process.env.PORT || 8080;

// ---------------- VIEW ENGINE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ---------------- MIDDLEWARE ----------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ---------------- START SERVER ----------------
async function startServer() {
  try {
    // 1️⃣ Connect DB first
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");

   // Session store FIRST
    const store = MongoStore.create({
      mongoUrl: dbUrl,
      touchAfter: 24 * 60 * 60,
      crypto: {
        secret: process.env.SECRET || "fallbacksecret",
      },
      autoRemove: "native",
    });

    store.on("error", (e) => console.log("Session store error", e));

    const sessionOptions = {
      store,
      secret: process.env.SECRET || "fallbacksecret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    // 5️⃣ Passport setup
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // 6️⃣ Locals middleware
    app.use((req, res, next) => {
      res.locals.currUser = req.user || null;
      res.locals.success = req.flash("success") || [];
      res.locals.error = req.flash("error") || [];
      next();
    });

    // ---------------- ROUTES ----------------
    app.get("/", (req, res) => {
      res.redirect("/listings");
    });

    app.use("/listings/:id/reviews", reviewsRouter);
    app.use("/listings", listingsRouter);
    app.use("/", userRouter);

    // ---------------- 404 ----------------
    app.use((req, res, next) => {
      next(new ExpressError(404, "Page Not Found!"));
    });

    // ---------------- ERROR HANDLER ----------------
    app.use((err, req, res, next) => {
      if (res.headersSent) return next(err);
      const { statusCode = 500, message = "Something went wrong!" } = err;
      res.status(statusCode).render("error.ejs", { message });
    });

    // 7️⃣ Start server LAST
    app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
    });

  } catch (err) {
    console.log("❌ DB connection failed:", err);
  }
}

startServer();
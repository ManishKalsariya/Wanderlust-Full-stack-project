const user = require("../models/user");

// Render signup page
module.exports.renderSignUpForm = (req, res) => {
    return res.render("users/signup.ejs");
}

// Render login page
module.exports.renderLogInForm = (req, res) => {
    return res.render("users/login.ejs");
}

// Sign up a new user
module.exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            req.flash("error", "All fields are required!");
            return res.redirect("/signup");
        }

        const newUser = new user({ username, email });
        const registeredUser = await user.register(newUser, password);

        // Wrap req.login in a promise to ensure only one response
        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        req.flash("success", "Welcome to Wanderlust!");
        return res.redirect("/listings"); // ✅ always return

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup"); // ✅ always return
    }
};

// Log in an existing user
module.exports.logIn = (req, res, next) => {
    try {
        req.flash("success", "Welcome back to Wanderlust!");
        return res.redirect("/listings"); // ✅ always return
    } catch (err) {
        return next(err); // handle unexpected errors
    }
};

// Log out a user
module.exports.logOut = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err); // ✅ propagate error properly
        req.flash("success", "Logged Out!");
        return res.redirect("/login"); // ✅ always return
    });
};
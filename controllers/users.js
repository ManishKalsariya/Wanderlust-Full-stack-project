const user = require("../models/user");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.renderLogInForm = (req,res)=>{
    res.render("users/login.ejs")
}

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new user({ email, username });
        const registeredUser = await user.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // ✅ now works
            }

            req.flash("success", "welcome to Wanderlust !");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.logIn = async (req,res)=>{
    req.flash("success","welcome back to wanderLust !");
    res.redirect(res.locals.redirectUrl || "/listings");
}



  module.exports.logOut = (req,res,next)=>{
    req.logout((err)=>{
        if (err) {
            return next(err); // ✅ correct
}
        req.flash("success", "Logged Out !");
        res.redirect("/login");
    })
}
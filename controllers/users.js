const user = require("../models/user");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.renderLogInForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            req.flash("error", "All fields are required!");
            return res.redirect("/signup");
        }

        const newUser = new user({ username, email });
        const registeredUser = await user.register(newUser, password);

        // Wrap req.login in a promise to avoid callback issues
        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        req.flash("success", "Welcome to Wanderlust!");
        return res.redirect("/listings");

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

module.exports.logIn = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    return res.redirect("/listings");
};

module.exports.logOut = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err); // ✅ pass the error
        }
        req.flash("success", "Logged Out !");
        return res.redirect("/login");
    })
};
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const keysecret = "krishmotookankfjaifjfnkefnkfddiy";

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;  // Extract the token after "Bearer"

        const verifytoken = jwt.verify(token, keysecret);  // Verifies the token

        const rootUser = await User.findOne({_id: verifytoken._id});  // Finds the user with the _id from the token

        if (!rootUser) {
            throw new Error("User not found");
        }

        // Attach token and user info to the request object
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();  // Proceed to the next middleware or route

    } catch (error) {
        res.status(401).json({status: 401, message: "Unauthorized: Invalid or missing token"});
    }
};

module.exports = authenticate;

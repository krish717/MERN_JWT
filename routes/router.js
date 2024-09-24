const express = require('express');
const router = new express.Router();
const User = require("../models/userSchema.js");
const bcrypt = require('bcryptjs');
const authenticate = require("../middleware/authenticate.js");
// For user registration
router.post("/register", async (req, res) => {
    const { fname, email, password, cpassword } = req.body;
    if (!fname || !email || !password || !cpassword) {
        return res.status(422).json({ error: "Please fill All Details" });
    }

    try {
        const preuser = await User.findOne({ email: email });
        if (preuser) {
            return res.status(409).json({ error: "This email already exists" });
        } else if (password !== cpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        } else {
            const finalUser = new User({ fname, email, password, cpassword });
            const storeData = await finalUser.save();
            return res.status(201).json({ message: "User registered successfully!" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Something Went Wrong" });
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please fill all details" });
    }

    try {
        const userValid = await User.findOne({ email: email });
        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password);
            if (!isMatch) {
                 res.status(422).json({ error: "Invalid Details" });
            } else {
                // Token generation
                const token = await userValid.generateAuthtoken();
                // console.log("Generated Token:", token);
                res.cookie("usercookie",token,{
                    expires: new Date(Date.now()+9000000),
                    httpOnly:true
                });

                const result = {
                    userValid,
                    token
                }
                return res.status(201).json({status:201,result});
            }
        } else {
            return res.status(422).json({ error: "User does not exist" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});




//user Valid 
router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUserOne = await User.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        res.status(401).json({status:401,error});
    }
})



// user logout

router.get("/logout",authenticate,async(req,res)=>{
    try {
        req.rootUser.tokens =  req.rootUser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie",{path:"/"});

        req.rootUser.save();

        res.status(201).json({status:201})

    } catch (error) {
        res.status(401).json({status:401,error})
    }
})

module.exports = router;

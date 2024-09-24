const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keysecret = "krishmotookankfjaifjfnkefnkfddiy"; // Secret key for JWT

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email is unique
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

// Password hashing before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Token generation method
userSchema.methods.generateAuthtoken = async function () {
    try {
        const token1 = jwt.sign({ _id: this._id.toString() }, keysecret, {
            expiresIn: "1d"
        });
        this.tokens.push({ token: token1 }); // Use push instead of concat for simplicity
        await this.save();
        return token1;
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

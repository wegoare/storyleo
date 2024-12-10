const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/user Avatar.jpeg",
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare hashed passwords
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static method to sign in a user
userSchema.statics.signIn = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found!');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Incorrect password!');

    const token = createTokenForUser(user);
    return token;
};

const User = model('User', userSchema);

module.exports = User;

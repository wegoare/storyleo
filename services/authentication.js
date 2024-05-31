// utils/jwt.js
const JWT = require('jsonwebtoken');

const secret = 'superman';

function createTokenForUser(user) {
    const payload = {

        _id: user._id,
        email: user.email,
        profileImageUrl: user.profileImageURL, // Ensure this matches your schema field name
        role: user.role,
    };
    const token = JWT.sign(payload, secret);
    return token;
}

function validateToken(token) {
    try {
        const payload = JWT.verify(token, secret);
        return payload;
    } catch (error) {
        console.error('Token validation error:', error);
        throw new Error('Invalid token');
    }
}

module.exports = {
    createTokenForUser,
    validateToken,
};

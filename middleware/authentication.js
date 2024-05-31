const { validateToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        console.log("Token cookie value:", tokenCookieValue); // Debugging
        console.log("Request Cookies:", req.cookies); // Debugging
        if (!tokenCookieValue) {
            console.log("No token found, proceeding without authentication."); // Debugging
            return next();
        }
        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
        } catch (error) {
            console.error('Token validation error:', error);
        }
        next();
    };
}

module.exports = {
    checkForAuthenticationCookie,
};

// utils/validators.js
function isCloudinaryURL(url) {
    try {
        const parsedURL = new URL(url);
        return parsedURL.hostname === 'res.cloudinary.com';
    } catch (err) {
        return false; // If the URL is invalid
    }
}

module.exports = { isCloudinaryURL };

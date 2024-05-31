const express = require('express');
const User = require('../models/user');
const { createTokenForUser } = require('../services/authentication');
const { checkForAuthenticationCookie } = require('../middleware/authentication');
const cookieParser = require('cookie-parser');

const router = express.Router();
router.use(cookieParser());

router.get('/signin', (req, res) => {
    
    res.render('signin', { user: req.user }); // Pass req.user to the signin view
});

router.get('/signup', (req, res) => {
    res.render('signup', { user: req.user }); // Pass req.user to the signup view
});

router.get('/', checkForAuthenticationCookie('token'), (req, res) => {
    console.log("User in request:", req.user); // Debugging
    res.render('home', { user: req.user }); // Pass req.user to the home view
});

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const newUser = await User.create({ fullName, email, password });
        return res.redirect('/user/signin');
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(400).render('signup', { error: 'Error creating user' });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await user.matchPassword(password)) {
            const token = createTokenForUser(user);
            res.cookie('token', token, { httpOnly: true }); // Set the token in the cookie
            return res.redirect('/');
        } else {
            return res.render('signin', { error: 'Incorrect Email or Password' });
        }
    } catch (error) {
        console.error('Error signing in:', error);
        return res.status(500).render('signin', { error: 'Internal server error' });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/user/signin');
});

module.exports = router;

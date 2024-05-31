const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/user'); // Import User model
const Blog = require('../models/blog'); // Import Blog model
const Comment = require('../models/comment'); // Import Comment model
const { checkForAuthenticationCookie } = require('../middleware/authentication');
const mongoose = require('mongoose');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve('./public/uploads'));
    },
    filename: function(req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});
const upload = multer({ storage: storage });


// Route to fetch and display all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).populate("createdBy");
        return res.render('home', {
            user: req.user,
            blogs: blogs,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("An error occurred while fetching the blogs.");
    }
});

// Route to display form for adding a new blog
router.get('/add-new', checkForAuthenticationCookie('token'), (req, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized: No user logged in.");
    }
    return res.render('addBlog', {
        user: req.user,
    });
});

// Route to fetch and display a specific blog along with its comments
router.get('/:id', async (req, res) => {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).send('Invalid blog ID');
    }

    try {
        const blog = await Blog.findById(blogId).populate('createdBy');
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        const comments = await Comment.find({ blogId }).populate('createdBy');
        return res.render('blog', {
            user: req.user,
            blog,
            comments
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send(`An error occurred while fetching the blog: ${err.message}`);
    }
});

// Route to handle adding a new blog
router.post('/add-new', checkForAuthenticationCookie('token'), upload.single("coverImageURL"), async (req, res) => {
    const { title, body } = req.body;
    try {
        if (!req.user) {
            return res.status(401).send("Unauthorized: No user logged in.");
        }

        if (!req.file) {
            return res.status(400).send("Cover image is required.");
        }

        const coverImageURL = `/uploads/${req.file.filename}`;

        // Construct the blog object to be inserted into the database
        const blogData = {
            title,
            body,
            coverImageURL,
            createdBy: req.user._id,
        };

        // Create a new blog document in the database
        const blog = await Blog.create(blogData);

        // Redirect the user to the home page after successfully creating the blog
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return res.status(500).send("An error occurred while creating the blog post.");
    }
});

// Route to handle adding a comment to a blog
router.post('/comment/:blogId', checkForAuthenticationCookie('token'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Unauthorized: No user logged in.");
        }

        const comment = await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send("An error occurred while adding the comment.");
    }
});

module.exports = router;

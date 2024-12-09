// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const User = require('../models/user'); // Import User model
// const Blog = require('../models/blog'); // Import Blog model
// const Comment = require('../models/comment'); // Import Comment model
// const { checkForAuthenticationCookie } = require('../middleware/authentication');
// const mongoose = require('mongoose');


// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.resolve('./public/uploads'));
//     },
//     filename: function(req, file, cb) {
//         const fileName = `${Date.now()}-${file.originalname}`;
//         cb(null, fileName);
//     },
// });
// const upload = multer({ storage: storage });


// // Route to fetch and display all blogs
// router.get('/', async (req, res) => {
//     try {
//         const blogs = await Blog.find().sort({ createdAt: 1 }).populate("createdBy");
//         return res.render('home', {
//             user: req.user,
//             blogs: blogs,
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send("An error occurred while fetching the blogs.");
//     }
// });

// // Route to display form for adding a new blog
// router.get('/add-new', checkForAuthenticationCookie('token'), (req, res) => {
//     if (!req.user) {
//         return res.status(401).send("Unauthorized: No user logged in.");
//     }
//     return res.render('addBlog', {
//         user: req.user,
//     });
// });

// // Route to fetch and display a specific blog along with its comments
// router.get('/:id', async (req, res) => {
//     const blogId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(blogId)) {
//         return res.status(400).send('Invalid blog ID');
//     }

//     try {
//         const blog = await Blog.findById(blogId).populate('createdBy');
//         if (!blog) {
//             return res.status(404).send('Blog not found');
//         }

//         const comments = await Comment.find({ blogId }).populate('createdBy');
//         return res.render('blog', {
//             user: req.user,
//             blog,
//             comments
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send(`An error occurred while fetching the blog: ${err.message}`);
//     }
// });

// // Route to handle adding a new blog
// router.post('/add-new', checkForAuthenticationCookie('token'), upload.single("coverImageURL"), async (req, res) => {
//     const { title, body } = req.body;
//     try {
//         if (!req.user) {
//             return res.status(401).send("Unauthorized: No user logged in.");
//         }

//         if (!req.file) {
//             return res.status(400).send("Cover image is required.");
//         }

//         const coverImageURL = `/uploads/${req.file.filename}`;

//         // Construct the blog object to be inserted into the database
//         const blogData = {
//             title,
//             body,
//             coverImageURL,
//             createdBy: req.user._id,
//         };

//         // Create a new blog document in the database
//         const blog = await Blog.create(blogData);

//         // Redirect the user to the home page after successfully creating the blog
//         return res.redirect('/');
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send("An error occurred while creating the blog post.");
//     }
// });

// // Route to handle adding a comment to a blog
// router.post('/comment/:blogId', checkForAuthenticationCookie('token'), async (req, res) => {
//     try {
//         if (!req.user) {
//             return res.status(401).send("Unauthorized: No user logged in.");
//         }

//         const comment = await Comment.create({
//             content: req.body.content,
//             blogId: req.params.blogId,
//             createdBy: req.user._id,
//         });
//         return res.redirect(`/blog/${req.params.blogId}`);
//     } catch (err) {
//         console.error(err);
//         return res.status(500).send("An error occurred while adding the comment.");
//     }
// });

// router.delete('/blog/:id', checkForAuthenticationCookie('token'), async (req, res) => {
//     try {
//         const blog = await Blog.findById(req.params.id);
        
//         // Check if the blog post exists
//         if (!blog) {
//             return res.status(404).json({ msg: 'Blog not found' });
//         }
        
//         // Check if the logged-in user is the creator of the blog post
//         if (blog.user.toString() !== req.user.id) {
//             return res.status(401).json({ msg: 'User not authorized' });
//         }

//         await blog.remove();
//         res.json({ msg: 'Blog removed' });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinaryConfig');
const User = require('../models/user');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const { checkForAuthenticationCookie } = require('../middleware/authentication');
const mongoose = require('mongoose');
const { isCloudinaryURL } = require('../utils/validators');



// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blogify', // Folder in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Allowed file types
    },
});
const upload = multer({ storage: storage });

// Fetch and display all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).populate('createdBy');
        res.render('home', { user: req.user, blogs: blogs });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching the blogs.");
    }
});

// Display form for adding a new blog
router.get('/add-new', checkForAuthenticationCookie('token'), (req, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized: No user logged in.");
    }
    res.render('addBlog', { user: req.user });
});

// Add a new blog
// router.post('/add-new', checkForAuthenticationCookie('token'), upload.single('coverImageURL'), async (req, res) => {
//     const { title, body } = req.body;

//     try {
//         if (!req.user) {
//             return res.status(401).send("Unauthorized: No user logged in.");
//         }

//         if (!req.file) {
//             return res.status(400).send("Cover image is required.");
//         }

//         const blogData = {
//             title,
//             body,
//             coverImageURL: req.file.path, // Cloudinary URL
//             createdBy: req.user._id,
//         };

//         const blog = await Blog.create(blogData);
//         res.redirect('/');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("An error occurred while creating the blog post.");
//     }
// });
router.post('/add-new', checkForAuthenticationCookie('token'), upload.single('coverImageURL'), async (req, res) => {
    const { title, body } = req.body;

    try {
        if (!req.user) {
            return res.status(401).send("Unauthorized: No user logged in.");
        }

        if (!req.file) {
            return res.status(400).send("Cover image is required.");
        }

        // Extract Cloudinary URL after file upload
        const coverImageURL = req.file.path; // Assuming `req.file.path` holds the Cloudinary URL
        
        // Validate the Cloudinary URL
        if (!isCloudinaryURL(coverImageURL)) {
            return res.status(400).send("Invalid image URL. Please upload a valid Cloudinary image.");
        }

        const blogData = {
            title,
            body,
            coverImageURL,
            createdBy: req.user._id,
        };

        const blog = await Blog.create(blogData);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while creating the blog post.");
    }
});

// Fetch and display a specific blog
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
        res.render('blog', { user: req.user, blog, comments });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching the blog.");
    }
});

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

// Delete a blog post
router.delete('/:id', checkForAuthenticationCookie('token'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await blog.remove();
        return res.json({ msg: 'Blog removed' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;

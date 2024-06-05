require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/authentication');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const addUserToLocals = require('./middleware/addUserToLocals');

// Import User, Blog, and Comment models
const User = require('./models/user');
const Blog = require('./models/blog');
const Comment = require('./models/comment');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(addUserToLocals);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Routes
app.use('/user', userRoute);
app.use('/blog', blogRoute);

// MongoDB Connection
mongoose.connect(process.env.Mongo_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
    // Start server after MongoDB connection is established
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}).catch(err => console.error('Connection error', err));

// Home Route
app.get('/', async (req, res) => {
    try {
        // Find all blogs and render the home page
        const allBlogs = await Blog.find({});
        res.render('home', {
            user: req.user,
            blogs: allBlogs,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching the blogs.");
    }
});

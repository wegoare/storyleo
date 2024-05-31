const { Schema, model } = require('mongoose');
const User = require('./user'); // Ensure the User model is imported
const Blog = require('./blog'); // Ensure the Blog model is imported

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: "Blog", // Correctly reference the Blog model
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User", // Correctly reference the User model
    },
}, {
    timestamps: true
});

const Comment = model('Comment', commentSchema); // Model names are usually capitalized

module.exports = Comment;

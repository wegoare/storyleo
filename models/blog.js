const {Schema,model}=require("mongoose");
const User= require('./user');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImageURL: {
        type: String, // Ensure it's defined as a string
        required: false, // Assuming it's optional
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});


const Blog=model("blog",blogSchema);

module.exports=Blog;
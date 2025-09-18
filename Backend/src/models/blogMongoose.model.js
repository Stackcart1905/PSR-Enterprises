
import mongoose from 'mongoose' ; 

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  coverImage : {
    type : String , 
    required : true  , 
  } ,
  // store public id from cloudinary of image it will help to delete image from cloudinary 
  publicId : {
    type : String , 
    required : true , 
  }  , 
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  tags: [String], // Categories for the blog post
});

const Blog  = mongoose.model('Blog', blogSchema);

export default Blog;

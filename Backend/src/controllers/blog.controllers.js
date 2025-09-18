import Blog from "../models/blogMongoose.model.js";
import {cloudinaryUpload , deleteFromCloudinary} from "../lib/cloudinary.js";

// get blog

// need to update when there will be more blog fields becauuse we need to send blog according to scroll
const getAllBlog = async (req, res) => {
  try {
    const posts = await Blog.find();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}

// get blogby id 
const getBlogById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}


// create blog 

const createBlogPost = async (req, res) => {
  try {
    // Destructure fields from req.body and check for other required fields
    const { title, content, author, tags } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ success: false, error: 'Title, content, and author are required.' });
    }

    // Handle the image upload. The image file is in req.file, not req.body.
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'A cover image is required.' });
    }

    //  Upload the image to Cloudinary
    const uploadedImage = await cloudinaryUpload(req.file); // Assuming memoryStorage()
    // If you used diskStorage(), the argument would be req.file.path

    if (!uploadedImage || !uploadedImage.secure_url || !uploadedImage.public_id) {
      return res.status(500).json({ success: false, error: 'Image upload failed.' });
    }

    // Create the new blog post document
    const newPost = new Blog({
      title,
      coverImage: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      content,
      author,
      tags: tags ? tags.split(',') : [], // Safely handle tags
    });

    // Save the document to the database
    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error("Error in blog controller in creating blog post:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

//  update blog

const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing blog post to get its current image publicId
    const existingPost = await Blog.findById(id);
    if (!existingPost) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    // Initialize an empty object for the fields to be updated
    const updateFields = { ...req.body };

    // Check if a new file was uploaded
    if (req.file) {
      //  Delete the old image from Cloudinary
      if (existingPost.publicId) {
        await deleteFromCloudinary(existingPost.publicId);
      }

      //  Upload the new image to Cloudinary
      const uploadedImage = await cloudinaryUpload(req.file); 
      if (!uploadedImage || !uploadedImage.secure_url || !uploadedImage.public_id) {
        return res.status(500).json({ success: false, error: 'New image upload failed' });
      }

      //  Add the new image's URL and publicId to the update object
      updateFields.coverImage = uploadedImage.secure_url;
      updateFields.publicId = uploadedImage.public_id;
    }

    //  Update the blog post in the database
    const updatedPost = await Blog.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(400).json({ success: false, error: 'Bad Request' });
  }
};


//   delete blog 

const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    //Find the blog post to get the publicId of the image
    const blogPost = await Blog.findById(id);
    if (!blogPost) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    //  Delete the image from Cloudinary using its publicId
    if (blogPost.publicId) {
      const isDeleted = await deleteFromCloudinary(blogPost.publicId);
      if (!isDeleted) {
        console.warn(`Could not delete image with publicId: ${blogPost.publicId}. Proceeding with database deletion.`);
      }
    }

    // Delete the blog post from the database
    const result = await Blog.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Blog post deleted successfully.' });
    
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}

export {
  getAllBlog,
  getBlogById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
}; 
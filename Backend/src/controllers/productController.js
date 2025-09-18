import Product from "../models/productSchema.js";
import { cloudinaryUpload, deleteFromCloudinary } from "../lib/cloudinary.js";


// Create Product
const createProduct = async (req, res) => {
  try {

    const { name, description, price, categories, tags, companyName , stock , discount} = req.body;

    const imgList = req.files;

    if (!name || !description || !price || !categories || !imgList || imgList.length === 0 || !companyName) {
      return res.status(400).json({
        message: "All fields are required ",
      });
    }

    // Upload image on Cloudinary 

    const images = [];

    for (const file of imgList) {
      const result = await cloudinaryUpload(file);

      if (result) {
        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        })
      }

    }

    const newProduct = new Product({
      name,
      description,
      price,
      images,
      discount : discount !== undefined ? discount : 0 , 
      stock : stock !== undefined ? stock : 0 ,  
      categories,
      companyName,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product Created Successfully",
      newProduct, 
    })
  }

  catch (error) {
    console.log("Server Errior Product Create Controller ", error);
    return res.status(500).json({
      message: "Internal Server Error ",
    })
  }

}


// get Product + search product 

const getProducts = async (req, res) => {
  try {
    const {
      name,
      companyName,
      categories,
      minPrice,
      maxPrice,
      tags,
      page = 1,
      limit = 10,
      sort
    } = req.query;

    let filter = {};

    // name filter
    if (name) filter.name = { $regex: name, $options: "i" };

    // company name filter
    if (companyName) filter.companyName = { $regex: companyName, $options: "i" };

    // categories filter
    if (categories) filter.categories = { $regex: categories, $options: "i" };

    // tag filter
    if (tags) filter.tags = { $regex: tags, $options: "i" };

    // price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // sorting
    let sortOption = {};
    if (sort) {
      const [key, order] = sort.split(":");
      sortOption[key] = order === "desc" ? -1 : 1;
    } else {
      sortOption.createdAt = -1; // default newest first
    }

    // pagination
    const skip = (Number(page) - 1) * Number(limit);

    // fetch products
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // total count
    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Product fetch success",
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    console.log("Error in getProducts: ", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// getProdcut by id 
// Get Single Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log("Error in getProductById:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// update product here 

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      companyName,
      stock , 
      tags,
      discount , 
      categories,

    } = req.body;

    const imgList = req.files;

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) return res.status(404).json({
      message: "Product Not Found",
    });

    let images = product.images;

    if (imgList && imgList.length > 0) {
      // delte old images form cloudinary 

      for (const img of product.images) {
        await deleteFromCloudinary(img.public_id);
      }
      // upload new images 

      images = [];

      for (const file of imgList) {
        const result = await cloudinaryUpload(file);
        if (result) {
          images.push({
            url: result.secure_url,
            public_id: result.public_id,
          })
        }
      }

    }

    product.name = name !== undefined ? name : product.name ;
    product.stock = stock !== undefined ? stock : product.stock ; 

    product.description = description !== undefined ? description : product.description ;
    product.discount = discount !== undefined ? discount : product.discount ;

    product.price = price !== undefined ? price : product.price ;

    product.categories = categories !== undefined ? categories : product.categories ;

    product.companyName = companyName !== undefined ? companyName :  product.companyName ;

    product.tags = tags ? tags.split(",").map((t)=>t.trim()) : product.tags ; 

    product.images = images ; 

    await product.save() ; 

    return res.status(200).json({
      message : "Product Updated Sucessfully" , 
      product , 
    })




  } catch (error) {
    console.log("Error in updateProduct: ", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
}

// delete product 

const deleteProduct = async(req , res) => {
    try {
      
      const {id} = req.params ; 

      const product = await Product.findById(id) ; 

      if(!product) return res.status(404).json({
        message : "Product Not Found" , 
      }) ; 

      // delete images from clodinary 
      for(const img of product.images) {
        await deleteFromCloudinary(img.public_id) ; 
      }

      // dellte the product 

      await Product.findByIdAndDelete(id) ; 

      return res.status(200).json({
        message : "Product Deleted Successfully" , 
      }) ; 
    } catch (error) {
      console.log("Error in deleteProduct: ", error);
      return res.status(500).json({
        message: "Server Error",
        error: error.message
      });
    }
}


export {createProduct , getProductById, getProducts , updateProduct , deleteProduct} ; 

import Product from "../models/product.model.js";
import { redis } from "../config/redis.js"; // this is not a default export so we need curly braces
import cloudinary from "../config/cloudinary.js"; // this is a default export so we dont need curly braces

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // {} means find all documents in the collection
    res.json({ products });
  } catch (err) {
    console.log("Error in getAllProducts controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts)); // redis store data as string so we need to parse it
    }
    //if not in redis,fetch from database
    featuredProducts = await Product.find({ isfeatured: true }).lean();
    // instead of returning mongodb document, lean() will return plain javascript object
    // which is good for performance
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // store in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts)); // JSON.stringify converts object to string
    res.json(featuredProducts);
  } catch (err) {
    console.log("Error in getFeaturedProducts controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "", // if we got the value from cloudinary use it else cloudinaryResponse if it is null if image is not uploaded
      category,
    });

    res.status(201).json(product);
  } catch (err) {
    console.log("Error in createProduct controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // we call this as id because in the route we pass it as :id
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // split the image url and get the publicId
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`); // delete from cloudinary
        console.log("Image deleted from cloudinary");
      } catch (err) {
        console.log("Error in deleteProduct controller", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
      }
    }

    await product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.log("Error in deleteProduct controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: {
          size: 3,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]); // this will give us 3 differnt products with populated 5 field. the 1 in the $project stage is used to include specific fields in the output documents. When you set a field to 1, it means that field will be included in the output.
  } catch (err) {
    console.log("Error in getRecommendedProducts controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params.category;
  try {
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (err) {
    console.log("Error in getProductsByCategory controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updateProduct = await product.save();
      // Update the cash in redis
      await updateFeaturedProductsInCache();
      res.status(200).json(updateProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsInCache() {
  try {
    // the lean method is used to return plain javascript object instead of full mongoose document. This can significantly improve performance
    const products = await Product.find({ isfeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(products));
  } catch (error) {
    console.log("Error in updateFeaturedProductsInCache", error.message);
  }
}

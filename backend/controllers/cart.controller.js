import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } }); //we would like to find the products where the product model  _id field is in req.user.cartItems

    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );

      return {
        ...product.toJSON(),
        quantity: item ? item.quantity : 0,
      };
    });

    res.status(200).json(cartItems);
  } catch (err) {
    console.log("Error in getCartProducts controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addToCard = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user; // req.user is set on protectRoute

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) existingItem.quantity += 1;
    else user.cartItems.push(productId);

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (err) {
    console.log("Error in addToCard controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user; // req.user is set on protectRoute
    if (!productId) user.cartItems = [];
    else
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (err) {
    console.log("Error in removeAllFromCart controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    // if the quantity is 1 and user click -1 it will become 0..so if the user sends 0 to us we
    //have to delete that product from the cart items.

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }

      // else we just incremented or decremented by what ever the quantity..
      existingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.log("Error in updateQuantity controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

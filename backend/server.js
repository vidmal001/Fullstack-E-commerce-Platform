// packages
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// routes
import authRoutes from "./routes/auth.route.js"; // when you import something from a local file you need to use .js
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
// database
import { connectDB } from "./config/db.js";

dotenv.config(); // load environment variables from .env
const app = express(); // create express app
const PORT = process.env.PORT || 5000; // get port from environment variable or use 5000 as default

app.use(express.json({ limit: "10mb" })); // this allows you to parse JSON data from the request body of an HTTP request
app.use(cookieParser()); // this allows you to parse cookie data from an HTTP request

app.use("/api/auth", authRoutes); // use auth route
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/coupons",couponRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/analytics",analyticsRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on http://localhost:" + PORT);
});

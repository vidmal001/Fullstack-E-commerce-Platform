// packages
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// routes
import authRoutes from "./routes/auth.route.js"; // when you import something from a local file you need to use .js
// database
import { connectDB } from "./config/db.js";

dotenv.config(); // load environment variables from .env
const app = express(); // create express app
const PORT = process.env.PORT || 5000; // get port from environment variable or use 5000 as default

app.use(express.json()); // this allows you to parse JSON data from the request body of an HTTP request
app.use(cookieParser()); // this allows you to parse cookie data from an HTTP request

app.use("/api/auth", authRoutes); // use auth route

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on http://localhost:" + PORT);
});

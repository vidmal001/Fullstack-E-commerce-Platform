import express from "express";
import { login, logout, signup , refreshToken , getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from './../middleware/auth.middleware.js';

const router = express.Router(); // create express router

router.post("/signup", signup); // http://localhost:5000/api/auth/signup

router.post("/login", login); // http://localhost:5000/api/auth/login

router.post("/logout", logout); // http://localhost:5000/api/auth/logout

router.post("/refresh-token",refreshToken) // http://localhost:5000/api/auth/refresh-token

router.get("/profile",protectRoute,getProfile) // http://localhost:5000/api/auth/profile
export default router;

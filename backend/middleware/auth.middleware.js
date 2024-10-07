import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Check if the access token is present in cookies
    const accessToken = req.cookies.accessToken;

    // If there's no token, the user is not authenticated, so respond with an "Unauthorized" status
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No access token provided" });
    }
    try {
      // 2. Decode the access token
      // Here we use jwt.verify() to ensure the token is valid and extract the payload (like userId) from it
      // If the token is invalid or expired, jwt.verify will throw an error and the catch block will handle it
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      /**
     You have an access token that contains information about the user, like their userId. 
     But When the token is decoded using jwt.verify(), you're extracting that userId. 
     But why would you need to check the database again to see if that user exists after decoding the token? 
     Because Isn’t the user guaranteed to be valid because they have the token?
     */

      // - Scenario 1: The user might have been deleted AFTER the token was issued.
      // Imagine a user gets an access token today. But tomorrow, the admin deletes their account from the database.
      //The token is still valid because it hasn't expired yet, but now the userId stored in the token no longer exists in the database.
      // - Scenario 2: The user's account might have been deactivated or suspended. If you don't check the user,
      //   they can still access protected routes using an old valid token.
      // - Scenario 3: Someone might tamper with the token and put a fake userId in it.
      //   In this case, decoding the token will still work, but the user won't exist in the database.
      // Hence, checking if the user exists is necessary to handle all these edge cases.

      const user = await User.findById(decoded.userId).select("-password"); // Exclude password from the user object

      // 4. Check if the user exists in the database
      // If no user is found, it means the userId in the token does not match any user in the database
      // This could happen if the user was deleted, or the token was tampered with, etc.
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 5. If the user is found, attach the user object to the request so it can be accessed by the next middleware/route
      req.user = user;

      // Call the next middleware in the stack
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (err) {
    // 6. Catch any errors, which could happen due to:
    // - Invalid access token
    console.log("Error in protectRoute middleware", err.message);
    res.status(401).json({ message: "Unauthorized - Invalid access token" });
  }
};

// next is a callback function if we in the protectedRoute then it will call adminRoute

export const adminRoute = (req, res, next) => {
  // req.user is set on protectRoute
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized - Not an admin" });
  }
};

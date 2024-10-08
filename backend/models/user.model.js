// packages
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// schema

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true, // remove whitespace
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should be at least 6 characters long"],
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"], // enum: ["customer", "admin"] means only these two values are allowed
      default: "customer",
    },
  },
  { timestamps: true }
); // timestamps: true will add createdAt and updatedAt fields to the schema

// methods

// When you try to save a new user with a password, this middleware will run first before actually saving the data.
// this below method is for signup flow

userSchema.pre("save", async function (next) {
  // next is a callback function
  if (!this.isModified("password")) return next(); // if password is not modified we don't need to hash it
  // for example If a user is updating their profile but didn’t change the password, this condition will ensure the password isn't rehashed unnecessarily.

  // if password is modified we need to hash it
  try {
    //salt is a random string added to the password before hashing it.
    const salt = await bcrypt.genSalt(10); // 10 is the number of rounds
    this.password = await bcrypt.hash(this.password, salt); // hash the password with salt - If you pass a simple password like 12345, adding a salt ensures that the hash is unique, even for similar passwords across different users.
    next(); // After hashing the password, it calls next() so that the user can be saved in the database.
  } catch (error) {
    next(error); // If the bcrypt library fails to hash the password for some reason, the error will be caught and the user save process will fail gracefully.
  }
});


// this below method is for login flow
// if the correct username is john and password is mySecret123!
// if they send "my secret" as password in the login this function will say invalid credentials

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password); 
  // password is mySecret123! (the plain-text password the user enters during login).
  // this.password is $2a$12$ZrAOugLDpB1eWOhjOWKhM.QZCwD8R.P1X7RyXaJQRoRfNJ0.EW2J6.
};

const User = mongoose.model("User", userSchema); // User is the name of the collection
export default User;

// Whole Process

// Registration: The user enters password as mySecret123! is hashed and saved in the database as $2a$12$ZrAOugLDpB1eWOhjOWKhM.QZCwD8R.P1X7RyXaJQRoRfNJ0.EW2J6.

// Login: The user enters mySecret123!, and bcrypt.compare() compares the entered password with the stored hash.

// If correct: It returns true, allowing the user to log in.
// If incorrect: It returns false, denying access.
// This ensures that the password comparison is secure, without ever exposing the plain-text password during storage or the comparison process.








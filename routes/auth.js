const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { body } = require("express-validator/check");
const authController = require("../controllers/auth");

router.post(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please Enter a valid Email.")
      .custom(value => {
        return User.find({ email: value }).then(user => {
          if (user.length > 0) {
            return Promise.reject("User already exists.");
          }
        });
      })
      .normalizeEmail(),
    body("name")
      .trim()
      .isLength({ min: 3 })
      .isAlphanumeric(),
    body("password")
      .trim()
      .isLength({ min: 5, max: 32 })
  ],
  authController.signup
);

router.post("/signin", authController.signin);

module.exports = router;

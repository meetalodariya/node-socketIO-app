const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const { body } = require("express-validator");
const isAuth = require("../middlewares/is-Auth").isauth;

router.get("/posts", isAuth, feedController.getPosts);

router.post(
  "/post",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .matches("^[a-zA-Z0-9 ]*$"),
    body("content")
      .trim()
      .isLength({ min: 7 })
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .matches("^[a-zA-Z0-9 ]*$"),
    body("content")
      .trim()
      .isLength({ min: 7 })
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;

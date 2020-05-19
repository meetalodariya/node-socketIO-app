const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const io = require("../socket");

exports.getPosts = (req, res, next) => {
  let page = req.query.page || 1;
  const perPage = 2;
  let numOfDoc;
  Post.find()
    .countDocuments()
    .then(count => {
      numOfDoc = count;
      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ crdatedAt: -1 });
    })
    .then(posts => {
      return res.status(200).json({
        posts: posts,
        totalItems: numOfDoc
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Server error";
      }
      next(err);
    });
};

exports.createPost = async (req, res, next) => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      error.message = "validation failed";
      error.statusCode = 422;
      throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
      title: title,
      content: content,
      creator: req.userId,
      imageUrl: imageUrl
    });
    const savedPost = await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    user.save();
    io.getIO().emit("posts", { action: "create", post: savedPost });
    return res.status(201).json({
      message: "created",
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Server error";
    }
    next(err);
  }
  // .then(post => {

  //   return ;
  // })
  // .then(user => {
  //   user.posts.push(post);
  //   return user.save();
  // })
  // .then(result => {
  //   io.emit('posts'  , )
  //   return res.status(201).json({
  //     message: "created",
  //     post: post,
  //     creator: { _id: result._id, name: result.name }
  //   });
  // })
  // .catch(err => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //     err.message = "Server error";
  //   }
  //   next(err);
  // });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        err.statusCode = 404;
        err.message = "post not found";
        throw err;
      }
      return res.status(200).json({ post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Server error";
      }
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    error.message = "validation failed";
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        err.statusCode = 404;
        err.message = "post not found";
        throw err;
      }
      if (req.file) {
        fs.unlink(path.join(__dirname, "..", post.imageUrl), err => {});
        post.imageUrl = req.file.path;
      }
      post.title = title;
      post.content = content;
      return post.save();
    })
    .then(result => {
      io.getIO().emit("posts", { action: "update", post: result });
      return res.status(201).json({ message: "updated", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Server error";
      }
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        err.statusCode = 404;
        err.message = "post not found";
        throw err;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Unauthorized operation");
        error.statusCode = 403;
        throw error;
      }
      fs.unlink(path.join(__dirname, "..", post.imageUrl), err => {});
      post.remove();
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      io.getIO().emit("posts", { action: "delete", posts: postId });
      return res.status(201).json({ message: "deleted", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = "Server error";
      }
    });
};

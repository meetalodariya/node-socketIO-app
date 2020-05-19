const mongoose = require("mongoose");
const Post = require("./post");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "I love this blog!!",
    },
    posts: [
      {
        postId: Schema.Types.ObjectId,
        ref: Post,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString() + "-" + file.originalname.toLocaleLowerCase()
    );
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/PNG" ||
    file.mimetype === "image/JPG" ||
    file.mimetype === "image/JPEG"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// application/json
app.use(bodyParser.json());
app.use(
  multer({ fileFilter: fileFilter, storage: fileStorage }).single("image")
);
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
//configuration
app.use("/images", express.static(path.join(__dirname, "images")));
// Allow CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  console.log(error);
  let message = error.message;
  return res.status(error.statusCode).json({ message: message });
});

mongoose
  .connect(
    "mongodb://meet:1sSJFLRoMa1ZuPsj@cluster0-shard-00-00-nptjv.mongodb.net:27017,cluster0-shard-00-01-nptjv.mongodb.net:27017,cluster0-shard-00-02-nptjv.mongodb.net:27017/blog?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true"
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", socket => {
      console.log("Client Connected");
    });
  })
  .catch(err => {
    console.log(err);
  });

const jwt = require("jsonwebtoken");

exports.isauth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  let decodedToken;
  // try {
  if (!authHeader) {
    const error = new Error("Authorization failed");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  decodedToken = jwt.verify(token, "secretkey");
  if (!decodedToken) {
    const error = new Error("Authorization failed");
    error.statusCode = 417;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
  // } catch (err) {
  // if (!err.statusCode) {
  //   err.statusCode = 500;
  //   err.message = "Server Error";
  // }
  // next(err);
  // }
};

const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const userModel = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token)
    return res.status(401).send("You are not authorize for this page!");
  var decoded = jwt.verify(token.split(" ")[1], keys.adminSecretOrKey);
  if (!decoded)
    return res.status(401).send("You are not authorize for this page!");

  let user = await userModel.findOne({ _id: decoded.id });
  req.user = user;

  next();
};

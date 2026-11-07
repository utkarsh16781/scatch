const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

module.exports = async function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/?error=Please log in first");

  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded.role !== "user") throw new Error("Not a user token");
    user = await userModel.findById(decoded.id).select("-password");
    if (!user) throw new Error("User not found");
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/?error=Please log in again");
  }

  req.user = user;
  next();
};

const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners");

module.exports = async function isOwner(req, res, next) {
  const token = req.cookies.ownerToken;
  if (!token) return res.redirect("/owners/login?error=Please log in as the owner first");

  let owner;
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded.role !== "owner") throw new Error("Not an owner token");
    owner = await ownerModel.findById(decoded.id).select("-password");
    if (!owner) throw new Error("Owner not found");
  } catch (err) {
    res.clearCookie("ownerToken");
    return res.redirect("/owners/login?error=Please log in again");
  }

  req.owner = owner;
  next();
};

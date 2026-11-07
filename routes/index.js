const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product");
const userModel = require("../models/user");

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.redirect("/shop?error=Product not found");
  }
  next();
};

router.get("/", (req, res) => {
  res.render("index", { title: "Welcome" });
});

router.get("/shop", isLoggedIn, async (req, res) => {
  const products = await productModel.find().sort({ _id: -1 });
  res.render("shop", { title: "Shop", user: req.user, products });
});

router.get("/cart", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id).populate("cart.product");

  // Skip entries whose product was deleted by the owner
  const items = user.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));

  const mrp = items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0);
  const discount = items.reduce((sum, i) => sum + (i.product.discount || 0) * i.quantity, 0);

  res.render("cart", { title: "Your cart", items, mrp, discount, total: mrp - discount });
});

router.post("/cart/add/:id", isLoggedIn, checkId, async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) return res.redirect("/shop?error=Product not found");

  const user = await userModel.findById(req.user._id);
  const item = user.cart.find((i) => String(i.product) === req.params.id);

  if (item) item.quantity += 1;
  else user.cart.push({ product: product._id, quantity: 1 });

  await user.save();
  res.redirect("/shop?success=Added to cart");
});

router.post("/cart/decrease/:id", isLoggedIn, checkId, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const item = user.cart.find((i) => String(i.product) === req.params.id);

  if (item && item.quantity > 1) item.quantity -= 1;
  else user.cart = user.cart.filter((i) => String(i.product) !== req.params.id);

  await user.save();
  res.redirect("/cart");
});

router.post("/cart/remove/:id", isLoggedIn, checkId, async (req, res) => {
  await userModel.updateOne(
    { _id: req.user._id },
    { $pull: { cart: { product: req.params.id } } }
  );
  res.redirect("/cart?success=Removed from cart");
});

module.exports = router;

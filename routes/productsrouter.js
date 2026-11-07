const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const isOwner = require("../middlewares/isOwner");
const upload = require("../config/multer-config");
const productModel = require("../models/product");
const userModel = require("../models/user");

const backToAdmin = (res, type, message) =>
  res.redirect(`/owners/admin?${type}=${encodeURIComponent(message)}`);

const colorOr = (value, fallback) => (/^#[0-9a-fA-F]{6}$/.test(value || "") ? value : fallback);

const removeFile = (filePath) => fs.promises.unlink(filePath).catch(() => {});

// Runs multer and turns upload errors (wrong type, too large) into a message on the admin page
const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : err.message;
      return backToAdmin(res, "error", message);
    }
    next();
  });
};

router.get("/", (req, res) => {
  res.redirect("/shop");
});

router.post("/create", isOwner, handleUpload, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const discount = Number(body.discount || 0);

  const problem =
    !name ? "Product name is required"
    : !Number.isFinite(price) || price <= 0 ? "Price must be a number above 0"
    : !Number.isFinite(discount) || discount < 0 || discount > price ? "Discount must be between 0 and the price"
    : null;

  if (problem) {
    if (req.file) await removeFile(req.file.path);
    return backToAdmin(res, "error", problem);
  }

  await productModel.create({
    image: req.file ? `/images/uploads/${req.file.filename}` : undefined,
    name,
    price,
    discount,
    bgcolor: colorOr(body.bgcolor, "#dfe3e8"),
    panelcolor: colorOr(body.panelcolor, "#ffffff"),
    textcolor: colorOr(body.textcolor, "#15191e"),
  });

  backToAdmin(res, "success", "Product created");
});

router.post("/delete/:id", isOwner, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return backToAdmin(res, "error", "Product not found");
  }

  const product = await productModel.findByIdAndDelete(req.params.id);
  if (!product) return backToAdmin(res, "error", "Product not found");

  if (product.image && product.image.startsWith("/images/uploads/")) {
    await removeFile(path.join(__dirname, "..", "public", product.image));
  }
  await userModel.updateMany({}, { $pull: { cart: { product: product._id } } });

  backToAdmin(res, "success", "Product deleted");
});

module.exports = router;

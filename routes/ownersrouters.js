const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const ownerModel = require("../models/owners");
const productModel = require("../models/product");
const isOwner = require("../middlewares/isOwner");
const { generateToken, cookieOptions } = require("../utilis/generatetoken");

// One-time helper to create the owner account. Only exists when NODE_ENV=development.
if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    try {
      const owners = await ownerModel.find();
      if (owners.length > 0) {
        return res.status(400).json({ message: "Owner already exists" });
      }

      const body = req.body || {};
      const fullname = String(body.fullname || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!fullname || !email || password.length < 6) {
        return res.status(400).json({ message: "fullname, email and a password of 6+ characters are required" });
      }

      const hash = await bcrypt.hash(password, 10);
      const owner = await ownerModel.create({ fullname, email, password: hash });
      const { password: _pw, ...safeOwner } = owner.toObject();
      res.status(201).json(safeOwner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

router.get("/", (req, res) => {
  res.redirect("/owners/admin");
});

router.get("/login", (req, res) => {
  res.render("owner-login", { title: "Owner login" });
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const owner = email ? await ownerModel.findOne({ email }) : null;
    const match = owner ? await bcrypt.compare(password, owner.password) : false;
    if (!match) {
      return res.redirect("/owners/login?error=Email or password is incorrect");
    }

    res.cookie("ownerToken", generateToken(owner, "owner"), cookieOptions);
    res.redirect("/owners/admin");
  } catch (error) {
    console.error(error);
    res.redirect("/owners/login?error=Could not log in. Try again.");
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("ownerToken");
  res.redirect("/owners/login?success=You are logged out");
});

router.get("/admin", isOwner, async (req, res) => {
  const products = await productModel.find().sort({ _id: -1 });
  res.render("admin", { title: "Owner panel", owner: req.owner, products });
});

module.exports = router;

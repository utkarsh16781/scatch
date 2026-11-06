const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("hey users");
});

router.post("/register", async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "fullname, email and password are required" });
    }

    let existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    let user = await userModel.create({
      fullname,
      email,
      password: hash,
    });

    const token = jwt.sign({ id: user._id }, "heyyyeyeyeyey");
    res.cookie("token", token); // 1 day
    res.send( "User registered successfully");
    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
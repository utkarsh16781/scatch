const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const { generateToken, cookieOptions } = require("../utilis/generatetoken");

// Forms get a redirect with a message; JSON requests (Postman) get JSON.
const wantsJson = (req) => Boolean(req.is("application/json"));

const fail = (req, res, status, message) =>
  wantsJson(req)
    ? res.status(status).json({ message })
    : res.redirect(`/?error=${encodeURIComponent(message)}`);

const succeed = (req, res, status, user, token) => {
  if (wantsJson(req)) return res.status(status).json({ user, token });
  res.redirect("/shop");
};

const withoutPassword = (user) => {
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    const fullname = String(body.fullname || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!fullname || !email || !password) {
      return fail(req, res, 400, "Full name, email and password are required");
    }
    if (password.length < 6) {
      return fail(req, res, 400, "Password must be at least 6 characters");
    }
    if (await userModel.findOne({ email })) {
      return fail(req, res, 400, "An account with this email already exists");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ fullname, email, password: hash });

    const token = generateToken(user, "user");
    res.cookie("token", token, cookieOptions);
    succeed(req, res, 201, withoutPassword(user), token);
  } catch (error) {
    if (error.code === 11000) {
      return fail(req, res, 400, "An account with this email already exists");
    }
    console.error(error);
    fail(req, res, 500, "Could not create the account. Try again.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return fail(req, res, 400, "Email and password are required");
    }

    const user = await userModel.findOne({ email });
    const match = user ? await bcrypt.compare(password, user.password) : false;
    if (!match) {
      return fail(req, res, 401, "Email or password is incorrect");
    }

    const token = generateToken(user, "user");
    res.cookie("token", token, cookieOptions);
    succeed(req, res, 200, withoutPassword(user), token);
  } catch (error) {
    console.error(error);
    fail(req, res, 500, "Could not log in. Try again.");
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  if (wantsJson(req)) return res.json({ message: "Logged out" });
  res.redirect("/?success=You are logged out");
});

module.exports = router;

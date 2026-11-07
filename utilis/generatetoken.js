const jwt = require("jsonwebtoken");

const generateToken = (account, role = "user") => {
  return jwt.sign(
    { id: account._id, email: account.email, role },
    process.env.JWT_KEY,
    { expiresIn: "7d" }
  );
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports.generateToken = generateToken;
module.exports.cookieOptions = cookieOptions;

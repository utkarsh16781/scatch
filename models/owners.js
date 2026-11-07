const mongoose = require("mongoose");

const ownerSchema = mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  products: { type: Array, default: [] },
  gstin: String,
  picture: String,
});

module.exports = mongoose.model("owner", ownerSchema);

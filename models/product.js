const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  image: String,
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  bgcolor: { type: String, default: "#dfe3e8" },
  panelcolor: { type: String, default: "#ffffff" },
  textcolor: { type: String, default: "#15191e" },
});

module.exports = mongoose.model("product", productSchema);

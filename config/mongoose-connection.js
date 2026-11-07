const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const config = require("config");

mongoose
  .connect(config.get("mongo_URI"), { dbName: "scatch" })
  .then(() => dbgr("MongoDB Connected"))
  .catch((err) => {
    dbgr(err);
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = mongoose.connection;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "public", "images", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// The extension comes from the checked mime type, never from the uploaded file name.
const extensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + extensions[file.mimetype]);
  },
});

const fileFilter = (req, file, cb) => {
  if (extensions[file.mimetype]) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

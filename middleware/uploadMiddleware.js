const multer = require("multer");
const path = require("path");

// 1. Configure the disk storage destination and custom filename policies
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tells multer to write incoming file streams into your local uploads directory folder
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamps to prevent overlapping collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    // Combines the original field name + timestamp extension name (e.g., resume-17382.pdf)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Add an optional type validator filter to accept only PDFs or typical images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".jpeg", ".jpg", ".png"];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(extension)) {
    cb(null, true); // File accepted safely
  } else {
    cb(new Error("Invalid file extension. Only PDFs, JPEGs, and PNGs are supported!"), false);
  }
};

// 3. Instantiate the configured multer utility instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional limit restriction: 5 Megabytes max size
});

module.exports = upload;
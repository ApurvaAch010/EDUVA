import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed."), false);
  }
};

// ← single instance
const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploader = {
  single: (fieldName) => multerInstance.single(fieldName),
  array: (fieldName, maxCount = 5) => multerInstance.array(fieldName, maxCount),
  fields: (fields) => multerInstance.fields(fields),

  // error handler wrapper
  handle: (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.code === "LIMIT_UNEXPECTED_FILE"
            ? `Unexpected field '${err.field}'`
            : err.message,
        });
      }
      if (err) return res.status(500).json({ success: false, message: err.message });
      next();
    });
  },
};

export default uploader;
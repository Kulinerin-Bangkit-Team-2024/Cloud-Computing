const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");

const keyFilePath = path.resolve(__dirname, "../key.json");
const gcs = new Storage({ keyFilename: keyFilePath });
const bucketName = process.env.BUCKET_NAME;

if (!bucketName) {
  throw new Error("Bucket name is not defined in the environment variables.");
}

const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error("Only .jpg, .jpeg, and .png files are allowed.");
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

const ImgUpload = {};

ImgUpload.uploadToGcs = upload.single("profile_pic");

ImgUpload.handleUpload = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No file provided. Please upload a valid image.",
    });
  }

  const sanitizeFileName = (name) => name.replace(/[^a-z0-9.\-_]/gi, "_");
  const gcsname = `${uuidv4()}-${sanitizeFileName(req.file.originalname)}`;
  const file = bucket.file(gcsname);

  try {
    console.log(`Uploading file ${req.file.originalname} as ${gcsname}`);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: { uploadDate: new Date().toISOString() },
      },
    });

    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  } catch (error) {
    console.error("Error uploading file:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload file to Google Cloud Storage.",
      error: error.message,
    });
  }
};

ImgUpload.multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.statusCode === 400) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message || "File upload error. Please try again.",
    });
  }
  next(err);
};

module.exports = ImgUpload;

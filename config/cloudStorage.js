const { Storage } = require("@google-cloud/storage");
const { nanoid } = require("nanoid");
const multer = require("multer");

const gcs = new Storage();
const bucketName = process.env.BUCKET_NAME;

if (!bucketName) {
  throw new Error("Bucket name is not defined in the environment variables.");
}

const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let ImgUpload = {};

ImgUpload.uploadToGcs = upload.single("image");

ImgUpload.handleUpload = async (req, res, next) => {
  if (!req.file) return next();

  const sanitizeFileName = (name) => name.replace(/[^a-z0-9.\-_]/gi, "_");
  const gcsname = `${nanoid()}-${sanitizeFileName(req.file.originalname)}`;
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
    res.status(500).json({
      status: "error",
      message: "Failed to upload file to Google Cloud Storage.",
    });
  }
};

ImgUpload.uploadResponse = (req, res) => {
  if (req.file && req.file.cloudStoragePublicUrl) {
    return res.status(200).json({
      status: "success",
      message: "File uploaded successfully!",
      fileUrl: req.file.cloudStoragePublicUrl,
    });
  }
  res.status(400).json({
    status: "error",
    message: "Failed to upload file.",
  });
};

module.exports = ImgUpload;

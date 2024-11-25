const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];
const maxFileSize = 5 * 1024 * 1024;

const validateFile = (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      status: "error",
      message: "No file uploaded. Please upload an image.",
    });
  }

  if (!allowedFileTypes.includes(file.mimetype)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid file type. Only JPEG, PNG, and GIF are allowed.",
    });
  }

  if (file.size > maxFileSize) {
    return res.status(400).json({
      status: "error",
      message: `File size exceeds the limit of ${maxFileSize / 1024 / 1024}MB.`,
    });
  }

  next();
};

module.exports = validateFile;

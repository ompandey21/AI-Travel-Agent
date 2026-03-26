const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "documents",
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
    }
});

const upload = multer({storage});

module.exports = upload;
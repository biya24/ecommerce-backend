const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products', // ✅ Uploads go to 'products' folder
        allowed_formats: ['jpg', 'png', 'jpeg'], // ✅ Only these formats
    },
});

// ✅ Set file size limit to 1MB
const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPG, PNG, and JPEG formats are allowed'));
        }
        cb(null, true);
    },
});

module.exports = upload;

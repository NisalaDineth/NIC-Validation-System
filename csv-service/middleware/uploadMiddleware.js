const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Generate a more unique filename using timestamp + random number + original name
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${timestamp}-${randomNum}-${originalName}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage }); // Accepts multiple files, max 4

module.exports = upload;
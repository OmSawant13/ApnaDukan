const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif)!'));
    }
});

// UPLOAD ROUTE
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        // Construct Public URL
        // Assuming server is running on port 5000 and accessible via IP
        // The host will be dynamic based on request
        const protocol = req.protocol;
        const host = req.get('host'); // e.g., 192.168.1.5:5000
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mime = require('mime-types');
const { protect, authorize } = require('../middleware/auth');
const { createEncryptStream } = require('../utils/encryption');
const User = require('../models/User');
const Book = require('../models/Book');
const Video = require('../models/Video');
const Access = require('../models/Access');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'temp_uploads') });

router.use(protect);
router.use(authorize('admin'));

// @desc    Get content by type
// @route   GET /api/admin/content?type=book|video
// @access  Private/Admin
router.get('/content', async (req, res) => {
    const { type } = req.query;

    try {
        let ContentModel;
        if (type === 'book') {
            ContentModel = Book;
        } else if (type === 'video') {
            ContentModel = Video;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid content type specified' });
        }

        const contentList = await ContentModel.find({});
        res.status(200).json({ success: true, count: contentList.length, data: contentList });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Grant access to a user for a specific content
// @route   POST /api/admin/grant-access
// @access  Private/Admin
router.post('/grant-access', async (req, res) => {
    const { userId, contentId, contentType } = req.body;

    if (!userId || !contentId || !contentType) {
        return res.status(400).json({ success: false, message: 'Please provide userId, contentId, and contentType' });
    }

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if content exists
        let ContentModel = contentType === 'Book' ? Book : Video;
        const content = await ContentModel.findById(contentId);
        if (!content) {
            return res.status(404).json({ success: false, message: `${contentType} not found` });
        }

        // Create or find the access record
        const access = await Access.findOneAndUpdate(
            { user: userId, content: contentId },
            { contentType: contentType }, // Ensure contentType is set
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: access });
    } catch (err) {
        // Handle potential duplicate key error from the unique index
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'User already has access to this content' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Upload a new book or video
// @route   POST /api/admin/upload
// @access  Private/Admin
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, contentType, price } = req.body;

    if (!title || !description || !contentType) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: 'Missing required fields (title, description, contentType)' });
    }

    if (!['Book', 'Video'].includes(contentType)) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: 'contentType must be Book or Video' });
    }

    try {
        const originalFileName = req.file.originalname;
        const finalFileName = `${originalFileName}.encrypted`;
        const finalFilePath = path.join(__dirname, '..', 'content', finalFileName);

        const encryptStream = createEncryptStream(finalFilePath);
        const readStream = fs.createReadStream(req.file.path);

        readStream.pipe(encryptStream);

        const cleanupTemp = () => fs.unlink(req.file.path, () => {});

        encryptStream.on('finish', async () => {
            try {
                const ContentModel = contentType === 'Book' ? Book : Video;
                const detectedMimeType = mime.lookup(originalFileName) || 'application/octet-stream';
                const newContent = await ContentModel.create({
                    title,
                    description,
                    encryptedFilePath: finalFilePath,
                    mimeType: detectedMimeType,
                    originalFileSize: req.file.size || 0,
                    price: Number(price) || 0,
                });
                cleanupTemp();
                return res.status(201).json({ success: true, data: newContent });
            } catch (dbErr) {
                cleanupTemp();
                console.error(dbErr);
                return res.status(500).json({ success: false, message: 'Error saving content metadata' });
            }
        });

        const handleError = (err) => {
            console.error('Encryption stream error:', err);
            cleanupTemp();
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error encrypting file' });
            }
        };

        encryptStream.on('error', handleError);
        readStream.on('error', handleError);
    } catch (err) {
        fs.unlink(req.file.path, () => {});
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;

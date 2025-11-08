const express = require('express');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');
const Access = require('../models/Access');
const Book = require('../models/Book');
const Video = require('../models/Video');
const { createDecryptedStream } = require('../utils/encryption');

const router = express.Router();

// All routes in this file will require the user to be logged in
router.use(protect);

// @desc    Get all content (books and videos) for the logged-in user
// @route   GET /api/user/my-library
// @access  Private
router.get('/my-library', async (req, res) => {
    try {
        // Find all access documents for the logged-in user
        const accessRecords = await Access.find({ user: req.user.id })
            .populate({
                path: 'content',
                // Select specific fields to return for the content
                select: 'title description coverImagePath price contentType'
            });

        // The 'contentType' field in the Access model tells us if it's a Book or Video
        // The 'populate' method will automatically fetch the correct document.

        res.status(200).json({
            success: true,
            count: accessRecords.length,
            data: accessRecords
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get a single content file (book or video)
// @route   GET /api/user/content/:contentId
// @access  Private
router.get('/content/:contentId', async (req, res) => {
    try {
        const contentId = req.params.contentId;
        const userId = req.user.id;

        // 1. Verify user has access
        const accessRecord = await Access.findOne({ user: userId, content: contentId });
        if (!accessRecord) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this content' });
        }

        // 2. Find content to get file path and MIME type
        let content;
        if (accessRecord.contentType === 'Book') {
            content = await Book.findById(contentId);
        } else {
            content = await Video.findById(contentId);
        }

        if (!content || !content.encryptedFilePath) {
            return res.status(404).json({ success: false, message: 'Content file not found' });
        }

        const filePath = content.encryptedFilePath;
        const mimeType = content.mimeType || 'application/octet-stream';
        const downloadName = path.basename(filePath).replace(/\.encrypted$/, '');

        // 3. Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        // 4. Handle Range Requests
        const stat = fs.statSync(filePath);
        const fileSize = content.originalFileSize > 0 ? content.originalFileSize : Math.max(0, stat.size - 16); // subtract IV if size unknown
        const range = req.headers.range;

        const setCommonHeaders = (status, extra = {}) => {
            res.writeHead(status, {
                'Content-Disposition': `attachment; filename="${downloadName || path.basename(filePath)}"`,
                'Accept-Ranges': 'bytes',
                ...extra,
            });
        };

        if (range && fileSize > 0) {
            const parts = range.replace(/bytes=/, '').split('-');
            let start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
                return res.status(416).set({
                    'Content-Range': `bytes */${fileSize}`,
                }).end();
            }

            end = Math.min(end, fileSize - 1);
            const chunkSize = end - start + 1;
            setCommonHeaders(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
            });

            const decryptedStream = createDecryptedStream(filePath);
            let processed = 0;
            let sent = 0;
            let finished = false;

            const finishResponse = () => {
                if (finished) return;
                finished = true;
                decryptedStream.destroy();
                if (!res.writableEnded) {
                    res.end();
                }
            };

            decryptedStream.on('data', (chunk) => {
                if (finished) return;

                let chunkStart = 0;
                let chunkEnd = chunk.length;

                if (processed + chunk.length <= start) {
                    processed += chunk.length;
                    return;
                }

                if (processed < start) {
                    chunkStart = start - processed;
                }

                const bytesAvailable = chunkEnd - chunkStart;
                const bytesNeeded = chunkSize - sent;

                if (bytesAvailable > bytesNeeded) {
                    chunkEnd = chunkStart + bytesNeeded;
                }

                if (chunkEnd > chunkStart) {
                    res.write(chunk.slice(chunkStart, chunkEnd));
                    sent += chunkEnd - chunkStart;
                }

                processed += chunk.length;

                if (sent >= chunkSize) {
                    finishResponse();
                }
            });

            decryptedStream.on('end', finishResponse);
            decryptedStream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Error streaming file' });
                } else if (!res.writableEnded) {
                    res.end();
                }
            });

            req.on('close', finishResponse);
        } else {
            const headers = {
                'Content-Type': mimeType,
            };
            if (fileSize > 0) {
                headers['Content-Length'] = fileSize;
            }
            setCommonHeaders(200, headers);
            const decryptedStream = createDecryptedStream(filePath);
            decryptedStream.pipe(res);
            decryptedStream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Error streaming file' });
                } else {
                    res.end();
                }
            });
            req.on('close', () => decryptedStream.destroy());
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;

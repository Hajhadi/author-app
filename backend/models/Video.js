const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    // This will store the path to the encrypted MP4 file on the server
    encryptedFilePath: {
        type: String,
        required: [true, 'Please add a file path'],
    },
    coverImagePath: {
        type: String, // Path to the thumbnail image
    },
    mimeType: {
        type: String,
        required: true,
        default: 'video/mp4',
    },
    originalFileSize: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    price: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Video', VideoSchema);

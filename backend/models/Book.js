const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    // This will store the path to the encrypted PDF file on the server
    encryptedFilePath: {
        type: String,
        required: [true, 'Please add a file path'],
    },
    coverImagePath: {
        type: String, // Path to the cover image
    },
    mimeType: {
        type: String,
        required: true,
        default: 'application/pdf',
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

module.exports = mongoose.model('Book', BookSchema);

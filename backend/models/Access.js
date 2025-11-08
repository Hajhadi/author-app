const mongoose = require('mongoose');

const AccessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    // This can store the ID of either a Book or a Video
    content: {
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'contentType',
    },
    // This field tells Mongoose which model to use for the 'content' field
    contentType: {
        type: String,
        required: true,
        enum: ['Book', 'Video'],
    },
    grantedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only have one access record per content item
AccessSchema.index({ user: 1, content: 1 }, { unique: true });

module.exports = mongoose.model('Access', AccessSchema);

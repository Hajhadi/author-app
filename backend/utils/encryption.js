const crypto = require('crypto');
const fs = require('fs');
const stream = require('stream');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET;
const ivLength = 16;

function ensureSecret() {
    if (!secretKey) {
        throw new Error('ENCRYPTION_SECRET is not defined in .env file');
    }
}

function createDecryptedStream(filePath) {
    ensureSecret();

    const fd = fs.openSync(filePath, 'r');
    const iv = Buffer.alloc(ivLength);
    fs.readSync(fd, iv, 0, ivLength, 0);

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);

    const readStream = fs.createReadStream(null, {
        fd,
        start: ivLength,
        autoClose: true,
    });

    return readStream.pipe(decipher);
}

function createEncryptStream(destinationPath) {
    ensureSecret();

    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    const writeStream = fs.createWriteStream(destinationPath);

    writeStream.write(iv);

    const encryptStream = new stream.Transform({
        transform(chunk, encoding, callback) {
            try {
                const encryptedChunk = cipher.update(chunk);
                callback(null, encryptedChunk);
            } catch (err) {
                callback(err);
            }
        },
        flush(callback) {
            try {
                const finalChunk = cipher.final();
                callback(null, finalChunk);
            } catch (err) {
                callback(err);
            }
        },
    });

    encryptStream.pipe(writeStream);

    writeStream.on('error', (err) => encryptStream.emit('error', err));

    return encryptStream;
}

module.exports = {
    createDecryptedStream,
    createEncryptStream,
};

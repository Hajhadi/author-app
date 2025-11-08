const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET;
const iv = crypto.randomBytes(16);
const filePath = './content/sample-book.txt';
const encryptedFilePath = './content/sample-book-encrypted.txt';

const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);

const input = fs.createReadStream(filePath);
const output = fs.createWriteStream(encryptedFilePath);

// Write the IV at the beginning of the file
output.write(iv);

input.pipe(cipher).pipe(output);

output.on('finish', () => {
    console.log('File encrypted successfully to', encryptedFilePath);
});

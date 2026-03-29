const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads' // Bucket name in MongoDB
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

module.exports = upload;

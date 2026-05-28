const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const allowedFormats = ["image/jpeg", "image/png", "image/webp"];

const createStorage = (folderName) =>
  new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: folderName
    }),
  });

module.exports = {
  cloudinary,
  createStorage
};

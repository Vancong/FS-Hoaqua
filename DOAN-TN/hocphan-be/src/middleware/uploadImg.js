const multer = require('multer');
const { createStorage } = require("../helper/cloudinary")

const typesFile = ['image/jpeg', 'image/png', 'image/jpg','image/webp']; 


const fileFilter = (req, file, cb) => {
  if (typesFile.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('chi duoc up file anh '), false);
  }
};

const upload = (folderName) =>
  multer({
    storage: createStorage(folderName),
    fileFilter
  });

module.exports = {
    upload
};

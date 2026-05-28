const validateImgs = (req, res, next) => {
  const newImagesCount = req.files?.length || 0;
  console.log(req.files.length)
  let oldImages = [];
  try {
    if (req.body.oldImages) {
      oldImages = JSON.parse(req.body.oldImages);
      console.log(oldImages.length)
    }
  } catch (error) {
    return res.status(400).json({
      status: 'ERR'
    });
  }

  const totalImages = newImagesCount + oldImages.length;

  if (totalImages < 1) {
    return res.status(400).json({
      status: 'ERR',
      message: 'Can it nha 1 anh'
    });
  }

  if (totalImages > 5) {
    return res.status(400).json({
      status: 'ERR',
      message: 'Khong duoc tai len qua 5 anh'
    });
  }

  next();
};

module.exports = {
  validateImgs
};

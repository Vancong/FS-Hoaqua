const mongoose=require('mongoose');

module.exports.connect= async () => {
   try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!uri) {
      throw new Error('Thiếu MONGO_URI hoặc MONGO_URL trong file .env');
    }
    await mongoose.connect(uri);
    console.log('ket noi database thanh cong')
   } catch (error) {
    console.log('ket noi dtb that bai');
    console.log(error);
   }

}

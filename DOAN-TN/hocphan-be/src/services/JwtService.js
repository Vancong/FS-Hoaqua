const jwt=require('jsonwebtoken')
const dotenv=require('dotenv');
dotenv.config();


module.exports.genneralAccessToken= (payload) =>{
   
    const accessToken=jwt.sign({
        ...payload
    }
    , process.env.ACCESS_TOKEN,{expiresIn:'1h'})
    return accessToken
}

module.exports.genneralRefreshToken= (payload) =>{

    const refreshToken=jwt.sign({
        ...payload
    }
    ,process.env.REFRESH_TOKEN,{expiresIn:'365d'})

    return refreshToken
}



module.exports.refreshTokenJwtServices =  (token) => {
    try {
        return new Promise(async (resolve, reject) => {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    return resolve({
                        status: 'ERR',
                        message: 'Token không hợp lệ'
                    });
                }

                const { id, email } = user;
                
                // Lấy thông tin user mới nhất từ database để đảm bảo isAdmin được cập nhật
                const UserDtb = require('../models/User.Model');
                const currentUser = await UserDtb.findById(id).select('isAdmin isActive');
                
                if (!currentUser) {
                    return resolve({
                        status: 'ERR',
                        message: 'Người dùng không tồn tại'
                    });
                }
                
                if (!currentUser.isActive) {
                    return resolve({
                        status: 'ERR',
                        message: 'Tài khoản đã bị khoá'
                    });
                }

                // Sử dụng isAdmin mới nhất từ database
                const newAccessToken = module.exports.genneralAccessToken({
                    id,
                    isAdmin: currentUser.isAdmin,
                    email
                });
                
                // Cập nhật refresh_token mới với isAdmin mới nhất
                const newRefreshToken = module.exports.genneralRefreshToken({
                    id,
                    isAdmin: currentUser.isAdmin,
                    email
                });

                return  resolve({
                    status: 'OK',
                    message: 'Thành công',
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken
                });
            });
        });
    } catch (error) {
        return {
            status: 'ERR',
            message: 'Lỗi server'
        };
    }
};

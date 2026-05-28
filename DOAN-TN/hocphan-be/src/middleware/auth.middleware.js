const jwt=require('jsonwebtoken');
const UserDtb = require('../models/User.Model');



const authMiddleware= async (req,res,next) =>{
    const authHeader = req.headers.token;
    let token = authHeader && authHeader.split(' ')[1];   
    token = token.replace(/^"(.*)"$/, '$1').trim();
    
    jwt.verify(token,process.env.ACCESS_TOKEN, async function(err,user) {
         if(err) {
               console.error( err.message);
            return res.status(404).json({
                status: 'ERROR'
            })
        }

        try {
            // Lấy thông tin user mới nhất từ database để kiểm tra quyền admin
            const currentUser = await UserDtb.findById(user.id).select('isAdmin isActive email');
            
            if (!currentUser) {
                return res.status(404).json({
                    message: 'Người dùng không tồn tại',
                    status: 'ERROR'
                })
            }

            if (!currentUser.isActive) {
                return res.status(403).json({
                    message: 'Tài khoản đã bị khoá',
                    status: 'ERROR'
                })
            }

            // Kiểm tra quyền admin từ database (không phải từ token)
            if(currentUser.isAdmin) {
                // Cập nhật req.user với thông tin mới nhất từ database
                req.user = {
                    id: currentUser._id,
                    isAdmin: currentUser.isAdmin,
                    email: currentUser.email
                };
                next();
            }
            else {
                return res.status(404).json({
                    message: ' Khong co quyen adm',
                    status: 'ERROR'
                })
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra quyền admin:', error);
            return res.status(500).json({
                message: 'Lỗi server',
                status: 'ERROR'
            })
        }
    })
}



const authUserMiddleware= (req,res,next) =>{
    const userId=req.params.userId;
    
    // Kiểm tra xem có token không
    if (!req.headers.token) {
        return res.status(401).json({
            message: 'Thiếu token',
            status: 'ERR'
        })
    }
    
    let token = req.headers.token.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: 'Token không hợp lệ',
            status: 'ERR'
        })
    }
    
    token = token.replace(/^"(.*)"$/, '$1').trim();
    jwt.verify(token,process.env.ACCESS_TOKEN, async function(err,user) {
         if(err) {
            console.log('JWT Verify Error:', err.message)
            return res.status(401).json({
                message: 'Token không hợp lệ hoặc đã hết hạn',
                status: 'ERR'
            })
        }
        
        try {
            // Lấy thông tin user mới nhất từ database để kiểm tra quyền admin
            const currentUser = await UserDtb.findById(user.id).select('isAdmin isActive email');
            
            if (!currentUser) {
                return res.status(404).json({
                    message: 'Người dùng không tồn tại',
                    status: 'ERR'
                })
            }

            if (!currentUser.isActive) {
                return res.status(403).json({
                    message: 'Tài khoản đã bị khoá',
                    status: 'ERR'
                })
            }

            // Cho phép nếu: user là admin (từ database) HOẶC user đang cập nhật chính mình
            const isUpdatingSelf = user?.id && userId && (String(user.id) === String(userId));
            const isAdmin = currentUser.isAdmin === true; // Kiểm tra từ database
            
            if(isAdmin || isUpdatingSelf) {
                // Cập nhật req.user với thông tin mới nhất từ database
                req.user = {
                    id: currentUser._id,
                    isAdmin: currentUser.isAdmin,
                    email: currentUser.email
                };
                next();
            }
            else {
                return res.status(403).json({
                    message: ' Khong co quyen ',
                    status: 'ERR'
                })
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra quyền:', error);
            return res.status(500).json({
                message: 'Lỗi server',
                status: 'ERR'
            })
        }
    })
}

module.exports ={
    authMiddleware,
    authUserMiddleware
}
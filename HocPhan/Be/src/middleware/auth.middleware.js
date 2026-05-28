const jwt=require('jsonwebtoken');
const UserDtb = require('../models/User.Model');

const extractToken = (authHeader) => {
    if (!authHeader) return null;
    const parts = String(authHeader).trim().split(' ');
    const raw = parts.length > 1 ? parts[1] : parts[0];
    return raw.replace(/^"(.*)"$/, '$1').trim();
};

const getTokenFromRequest = (req) =>
    extractToken(req.headers.token) || extractToken(req.headers.authorization);

const authMiddleware= async (req,res,next) =>{
    const token = getTokenFromRequest(req);

    if (!token) {
        return res.status(401).json({
            message: 'Thiếu token. Thêm header: Authorization = Bearer <access_token> (hoặc token = Bearer ...)',
            status: 'ERR'
        });
    }
    
    jwt.verify(token,process.env.ACCESS_TOKEN, async function(err,user) {
         if(err) {
               console.error( err.message);
            return res.status(404).json({
                status: 'ERROR'
            })
        }

        try {
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

            if(currentUser.isAdmin) {
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
    const userId=req.params.userId || req.params.id;
    
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({
            message: 'Thiếu token. Thêm header: Authorization = Bearer <access_token> (hoặc token = Bearer ...)',
            status: 'ERR'
        })
    }
    jwt.verify(token,process.env.ACCESS_TOKEN, async function(err,user) {
         if(err) {
            console.log('JWT Verify Error:', err.message)
            return res.status(401).json({
                message: 'Token không hợp lệ hoặc đã hết hạn',
                status: 'ERR'
            })
        }
        
        try {
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

            const isUpdatingSelf = user?.id && userId && (String(user.id) === String(userId));
            const isAdmin = currentUser.isAdmin === true; // Kiểm tra từ database
            
            if(isAdmin || isUpdatingSelf) {
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
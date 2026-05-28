const ForgotPassDtb = require('../models/forgot-password.models');
const UserDtb = require('../models/User.Model');
const createError = require('../helper/createError');
const generateOtp = require('../helper/generateOtp.helpers');
const JwtService = require('./JwtService');
const bcrypt = require('bcrypt');
const sendMailHelpers = require('../helper/sendEmail.helpers');
const htmlOtp = require('../helper/htmlSendMailOtp');
const WebSiteInfoDtb = require('../models/WebSiteInfo.Model');

module.exports.sendOtp = async (email) => {
    const normalized = email.trim();
    const user = await UserDtb.findOne({
        email: { $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true,
    });
    if (!user) {
        throw createError(400, 'Email không tồn tại hoặc tài khoản đã bị khóa');
    }

    const otp = generateOtp(4);
    const expireAt = new Date(Date.now() + 5 * 60 * 1000);

    await ForgotPassDtb.findOneAndUpdate(
        { email: user.email },
        { otp, expireAt },
        { upsert: true, new: true }
    );

    const websiteInfo = await WebSiteInfoDtb.findOne().lean();
    const shopName = (websiteInfo?.name || '').trim() || 'Fruit Shop';

    const html = htmlOtp(otp, 'Đặt lại mật khẩu', `Mã xác thực ${shopName}`);
    await sendMailHelpers(user.email, `Mã OTP đặt lại mật khẩu - ${shopName}`, html, shopName);

    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP cho ${user.email}: ${otp}`);
    }

    return {
        status: 'OK',
        message: 'Đã gửi mã OTP đến email của bạn',
    };
};

module.exports.verifyOtp = async (otp, email) => {
    const normalized = email.trim();
    const user = await UserDtb.findOne({
        email: { $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true,
    });
    if (!user) {
        throw createError(400, 'Email không hợp lệ');
    }

    const checkOtp = await ForgotPassDtb.findOne({ email: user.email, otp: String(otp).trim() });
    if (!checkOtp) {
        throw createError(400, 'Mã OTP không đúng');
    }
    if (checkOtp.expireAt < new Date()) {
        throw createError(400, 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới');
    }

    const access_token = JwtService.genneralAccessToken({
        id: user.id,
        isAdmin: user.isAdmin,
        email: user.email,
    });
    const refresh_token = JwtService.genneralRefreshToken({
        id: user.id,
        isAdmin: user.isAdmin,
        email: user.email,
    });

    return {
        status: 'OK',
        access_token,
        refresh_token,
        userId: user._id,
    };
};

module.exports.resetPassword = async (userId, password) => {
    const user = await UserDtb.findOne({ _id: userId, isActive: true });
    if (!user) {
        throw createError(400, 'Không tồn tại người dùng');
    }

    const hash = await bcrypt.hash(password, 10);
    await UserDtb.updateOne({ _id: userId }, { password: hash });
    await ForgotPassDtb.deleteMany({ email: user.email });

    return {
        status: 'OK',
        message: 'Đặt lại mật khẩu thành công',
        data: {
            email: user.email,
            password,
        },
    };
};

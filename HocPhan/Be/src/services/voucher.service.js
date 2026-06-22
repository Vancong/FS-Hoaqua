const Voucher = require('../models/Voucher.Model');
const paginationHelper = require('../helper/pagination');
const createError = require('../helper/createError');

const createVoucher = async (data) => {
    const exists = await Voucher.findOne({ code: data.code.toUpperCase() });
    if (exists) {
        throw createError(409, 'Mã giảm giá đã tồn tại');
    }

    const voucher = await Voucher.create({
        ...data,
        code: data.code.toUpperCase()
    });

    return {
        status: 'OK',
        message: 'Tạo mã giảm giá thành công',
        data: voucher,
    };
};

const getAllVouchers = async (page = 1, limit = 8, search = '') => {
    const query = {};
    if (search && search.trim()) {
        query.code = { $regex: search.trim(), $options: 'i' };
    }

    return paginationHelper({
        model: Voucher,
        page,
        limit,
        sort: { createdAt: -1 },
        query,
    });
};

const updateVoucher = async (id, data) => {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw createError(404, 'Mã giảm giá không tồn tại');
    }

    if (data.code && data.code.toUpperCase() !== voucher.code) {
        const exists = await Voucher.findOne({ code: data.code.toUpperCase() });
        if (exists) {
            throw createError(409, 'Mã giảm giá đã tồn tại');
        }
    }

    const updateData = { ...data };
    if (data.code) {
        updateData.code = data.code.toUpperCase();
    }

    const updated = await Voucher.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    return {
        status: 'OK',
        message: 'Cập nhật mã giảm giá thành công',
        data: updated,
    };
};

const deleteVoucher = async (id) => {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw createError(404, 'Mã giảm giá không tồn tại');
    }

    await Voucher.findByIdAndDelete(id);
    return {
        status: 'OK',
        message: 'Xóa mã giảm giá thành công',
    };
};

const deleteManyVouchers = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw createError(400, 'Danh sách ID không hợp lệ');
    }

    await Voucher.deleteMany({ _id: { $in: ids } });
    return {
        status: 'OK',
        message: 'Xóa các mã giảm giá thành công',
    };
};

const checkVoucher = async (code, userId, cartTotal) => {
    if (!code) {
        throw createError(400, 'Vui lòng nhập mã giảm giá');
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
        throw createError(404, 'Mã giảm giá không tồn tại');
    }

    if (!voucher.isActive) {
        throw createError(400, 'Mã giảm giá đã dừng hoạt động');
    }

    const now = new Date();
    if (now < new Date(voucher.startDate)) {
        throw createError(400, 'Mã giảm giá chưa đến thời gian sử dụng');
    }
    if (now > new Date(voucher.endDate)) {
        throw createError(400, 'Mã giảm giá đã hết hạn');
    }

    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
        throw createError(400, 'Mã giảm giá đã hết lượt sử dụng');
    }

    if (cartTotal < voucher.minOrderValue) {
        throw createError(400, `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ để sử dụng mã này`);
    }

    if (voucher.userLimit > 0 && userId) {
        const userUsage = voucher.usedBy.find(u => u.userId.toString() === userId.toString());
        if (userUsage && userUsage.count >= voucher.userLimit) {
            throw createError(400, 'Bạn đã sử dụng mã này đạt giới hạn cho phép');
        }
    }

    return {
        status: 'OK',
        message: 'Áp dụng mã giảm giá thành công',
        data: voucher
    };
};

module.exports = {
    createVoucher,
    getAllVouchers,
    updateVoucher,
    deleteVoucher,
    deleteManyVouchers,
    checkVoucher
};

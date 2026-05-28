const ProductDtb = require('../models/Product.Model');
const paginationHelper = require('../helper/pagination');
const createError = require('../helper/createError');

const parseProductData = (data) => {
    const parsed = { ...data };

    if (parsed.price !== undefined) parsed.price = Number(parsed.price);
    if (parsed.stock !== undefined) parsed.stock = Number(parsed.stock);
    if (parsed.discount !== undefined) parsed.discount = Number(parsed.discount);
    if (parsed.sold !== undefined) parsed.sold = Number(parsed.sold);
    if (parsed.isFeatured !== undefined) {
        parsed.isFeatured = parsed.isFeatured === true || parsed.isFeatured === 'true';
    }

    return parsed;
};

module.exports.createProduct = async (data) => {
    const newProduct = parseProductData(data);

    const exists = await ProductDtb.findOne({ name: newProduct.name });
    if (exists) {
        throw createError(409, 'Tên sản phẩm đã tồn tại');
    }

    if (!newProduct.image) {
        throw createError(400, 'Vui lòng tải ảnh sản phẩm');
    }

    const product = await ProductDtb.create(newProduct);
    return {
        status: 'OK',
        message: 'Tạo sản phẩm thành công',
        data: product,
    };
};

module.exports.getAllProducts = async (page = 1, limit = 10, filters = {}) => {
    const { search, isFeatured, key, value } = filters;
    const query = {};

    if (search && search.trim()) {
        const trimmedSearch = search.trim();
        if (trimmedSearch === 'nội địa' || trimmedSearch === 'nhập khẩu') {
            query.type = trimmedSearch;
        } else {
            query.$or = [
                { name: { $regex: trimmedSearch, $options: 'i' } },
                { description: { $regex: trimmedSearch, $options: 'i' } },
            ];
        }
    }
    if (isFeatured !== undefined && isFeatured !== '') {
        query.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (filters.hasDiscount === 'true' || filters.hasDiscount === true) {
        query.discount = { $gt: 0 };
    }

    const sort = {};
    if (key && value) sort[key] = Number(value);
    else sort.createdAt = -1;

    return paginationHelper({
        model: ProductDtb,
        page,
        limit,
        sort,
        query,
    });
};

module.exports.getProductById = async (id) => {
    const product = await ProductDtb.findById(id);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }
    return {
        status: 'OK',
        message: 'Thành công',
        data: product,
    };
};

module.exports.updateProduct = async (id, data) => {
    const product = await ProductDtb.findById(id);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    const dataUpdate = parseProductData(data);

    if (dataUpdate.name && dataUpdate.name !== product.name) {
        const exists = await ProductDtb.findOne({ name: dataUpdate.name });
        if (exists) {
            throw createError(409, 'Tên sản phẩm đã tồn tại');
        }
    }

    const updated = await ProductDtb.findByIdAndUpdate(id, dataUpdate, {
        new: true,
        runValidators: true,
    });

    return {
        status: 'OK',
        message: 'Cập nhật sản phẩm thành công',
        data: updated,
    };
};

module.exports.deleteProduct = async (id) => {
    const product = await ProductDtb.findById(id);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    await ProductDtb.findByIdAndDelete(id);
    return {
        status: 'OK',
        message: 'Xóa sản phẩm thành công',
    };
};

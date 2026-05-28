const Joi = require('joi');
const ProductDtb = require('../models/Product.Model');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Dữ liệu không hợp lệ',
            details: error.details.map((e) => e.message),
        });
    }
    next();
};

const productSchema = Joi.object({
    name: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().trim().allow('').optional(),
    image: Joi.string().trim().required(),
    stock: Joi.number().integer().min(0).required(),
    sold: Joi.number().integer().min(0).optional(),
    discount: Joi.number().min(0).max(100).optional(),
    isFeatured: Joi.boolean().optional(),
    type: Joi.string().valid('nội địa', 'nhập khẩu').default('nội địa').required(),
});

const parseBodyNumbers = (req, res, next) => {
    if (req.body.price !== undefined) req.body.price = Number(req.body.price);
    if (req.body.stock !== undefined) req.body.stock = Number(req.body.stock);
    if (req.body.discount !== undefined) req.body.discount = Number(req.body.discount);
    if (req.body.sold !== undefined) req.body.sold = Number(req.body.sold);
    if (req.body.isFeatured !== undefined) {
        req.body.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    next();
};

const validateCreateProduct = async (req, res, next) => {
    if (!req.file && !req.body.image) {
        return res.status(400).json({ status: 'ERR', message: 'Vui lòng tải ảnh sản phẩm' });
    }
    if (req.file) req.body.image = req.file.path;

    const exists = await ProductDtb.findOne({ name: req.body.name });
    if (exists) {
        return res.status(409).json({ status: 'ERR', message: 'Tên sản phẩm đã tồn tại' });
    }

    return parseBodyNumbers(req, res, () => validate(productSchema)(req, res, next));
};

const validateUpdateProduct = async (req, res, next) => {
    if (req.file) req.body.image = req.file.path;

    const id = req.params.id;
    if (req.body.name) {
        const exists = await ProductDtb.findOne({ name: req.body.name });
        if (exists && exists._id.toString() !== id) {
            return res.status(409).json({ status: 'ERR', message: 'Tên sản phẩm đã tồn tại' });
        }
    }

    const updateSchema = productSchema.fork(
        ['name', 'price', 'stock', 'image'],
        (field) => field.optional()
    );
    return parseBodyNumbers(req, res, () => validate(updateSchema)(req, res, next));
};

module.exports = {
    validateCreateProduct,
    validateUpdateProduct,
};

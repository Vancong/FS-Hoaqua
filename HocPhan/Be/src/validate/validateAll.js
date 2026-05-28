const Joi = require('joi');
const UserDtb = require('../models/User.Model');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Du lieu khong hop le',
            details: error.details.map(e => e.message)
        });
    }
    next();
};

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required()
});

const validateSignup = async (req, res, next) => {
    const checkUser = await UserDtb.findOne({ email: req.body.email });
    if (checkUser) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    if (req.body.password.length < 6 || req.body.confirmPassword.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải 6 kí tự' });
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu không trùng' });
    }
    return validate(signupSchema)(req, res, next);
};

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validateLogin = async (req, res, next) => {
    const checkUser = await UserDtb.findOne({ email: req.body.email });
    if (!checkUser) {
        return res.status(400).json({ message: 'Email khong tồn tại' });
    }
    return validate(loginSchema)(req, res, next);
};

const updateUserSchemaForAdmin = Joi.object({
    name: Joi.string().optional().allow('', null),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    phone: Joi.number().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    avt: Joi.string().optional().allow('', null),
    isAdmin: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
});

const updateUserSchemaForUser = Joi.object({
    name: Joi.string().optional().allow('', null),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    phone: Joi.number().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    avt: Joi.string().optional().allow('', null),
    isAdmin: Joi.forbidden(),
    isActive: Joi.forbidden()
});

const validateUpdateUser = async (req, res, next) => {
    const newEmail = req.body.email;
    const id = req.params.userId;
    const userToUpdate = await UserDtb.findOne({ _id: id });
    if (!userToUpdate) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    if (newEmail !== userToUpdate.email) {
        const checkAllUser = await UserDtb.findOne({ email: newEmail });
        if (checkAllUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
    }
    const schema = req.user.isAdmin ? updateUserSchemaForAdmin : updateUserSchemaForUser;
    return validate(schema)(req, res, next);
};

module.exports = {
    validateSignup,
    validateLogin,
    validateUpdateUser
};

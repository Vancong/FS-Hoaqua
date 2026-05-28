
const Joi = require('joi');

const validate= (schema) => (req, res, next)   =>{
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
        status: 'ERR',
        message: 'Du lieu khong hop le',
        details: error.details.map(e => e.message)    
        });
    }
    next();
}


const VoucherSchema = Joi.object({
  code: Joi.string().required(), 
  discountType: Joi.string().required().valid("percentage","fixed"),
  discountValue: Joi.number().required(),
  maxDiscountValue: Joi.number().allow(null, ''),
  minOrderValue: Joi.number(),
  startDate: Joi.alternatives().try(
    Joi.string().isoDate(),
    Joi.date(),
  ).required(),
  endDate: Joi.alternatives().try(
    Joi.string().isoDate(),
    Joi.date
  ).required(),
  usageLimit: Joi.number(),
  usageCount: Joi.number(),
  userLimit: Joi.number(),
  isActive: Joi.boolean()
});

const validateVoucher= validate(VoucherSchema);
module.exports={
    validateVoucher
}

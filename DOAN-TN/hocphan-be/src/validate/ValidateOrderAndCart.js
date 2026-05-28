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


const orderSchema = Joi.object({
  user: Joi.string().required(), 

  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().optional().allow(null, ''),
  discountCode: Joi.string().optional().allow(null, ''),
  discountValue: Joi.number().optional().allow(null),
  address: Joi.object({
    province: Joi.string().required(),
    district: Joi.string().required(),
    ward: Joi.string().required(),
    detail: Joi.string().allow('').optional()
  }).required(),

  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      volume: Joi.number().required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required(),

  totalPrice: Joi.number().min(0).required(),
  shipping: Joi.number().min(0).default(0),
  finalPrice: Joi.number().min(0).required(),

  paymentMethod: Joi.string().valid('cod', 'paypal').required(),

  isPaid: Joi.boolean(),

  paidAt:Joi.date(),

  paypalOrderId: Joi.string(),

  status: Joi.string().valid('pending', 'confirmed', 'shipping', 'completed', 'cancelled').optional(),

  note: Joi.string().allow('').optional()
});

const validateOrder =validate(orderSchema)

module.exports={
    validateOrder
}
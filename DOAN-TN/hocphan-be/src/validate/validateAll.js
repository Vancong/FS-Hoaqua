const Joi = require('joi');
const BrandDtb=require('../models/Brand.Model')
const ProductDtb=require('../models/Product.Model')
const UserDtb=require('../models/User.Model')
const NoteDtb=require("../models/Note.Model")
const NoteGroupDtb=require("../models/NoteGroup.Model")
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

//product
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  brand: Joi.string().optional().allow(null, ''),
  gender: Joi.string().valid('Male', 'Female', 'Unisex').required(),
  concentration: Joi.string().required(),
  scentDuration: Joi.string().required(),
  discount: Joi.number().min(0).max(100).default(0),
  isActive: Joi.boolean().optional(),
  sizes: Joi.array().items(
    Joi.object({
      volume: Joi.number().positive().required(),
      price: Joi.number().min(0).required(),
      countInStock: Joi.number().integer().min(0).required()
    })
  ).min(1).required(),
  notes: Joi.object({
    top: Joi.array().items(Joi.string().required()).min(1).required(),
    middle: Joi.array().items(Joi.string().required()).min(1).required(),
    base: Joi.array().items(Joi.string().required()).min(1).required()
  }).required(),
  oldImages: Joi.string().optional(),

});

const validateProduct =async (req, res, next) => {
    try {
      const checkProduct= await ProductDtb.findOne({name:req.body.name});
      if(checkProduct) {
        if(!req.params.id||checkProduct._id.toString()!==req.params.id) {
          return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
        }
      }

      if (typeof req.body.sizes === 'string') {
        req.body.sizes = JSON.parse(req.body.sizes);
      }
      if (typeof req.body.notes === 'string') {
        req.body.notes = JSON.parse(req.body.notes);
      
        }
        if (!Array.isArray(req.body.sizes)) {
            return res.status(400).json({
                status: 'ERR',
                message: '"sizes" phải là mảng',
            });
        }
        req.body.sizes = req.body.sizes.map(size => ({
            volume: Number(size.volume),
            price: Number(size.price),
            countInStock: Number(size.countInStock)
        }));
         req.body.sizes.sort((a, b) => a.volume - b.volume);  
          if(req.body.discount!== undefined) {
            req.body.discount = Number(req.body.discount);
         }
        return validate(productSchema)(req, res, next);  

    } catch (err) {
        return res.status(400).json({
          status: 'ERR',
          message: err.message || 'Loi dau vao',
        });
    }
   
};


//user

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required()
});
const validateSignup= async (req,res,next) =>{ 
    const checkUser = await UserDtb.findOne({ email: req.body.email });
    if (checkUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if(req.body.password.length<6||req.body.confirmPassword.length<6) {
        return res.status(400).json({ message: "Mật khẩu phải 6 kí tự" });
    }
     if(req.body.password!==req.body.confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu không trùng" });
    }
    return validate(signupSchema)(req, res, next);  
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateLogin= async(req,res,next) =>{
  const checkUser = await UserDtb.findOne({ email: req.body.email });
  if (!checkUser) {
    return res.status(400).json({ message: 'Email khong tồn tại' });
  }
  console.log('ok')
  return validate(loginSchema)(req, res, next);  
}

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
  const id=req.params.userId;
  const userToUpdate = await UserDtb.findOne({_id:id});
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

const brandSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  logo: Joi.string().optional().allow('', null),
  isActive: Joi.boolean().default(true),
});

const validateBrand = async (req, res, next) => {
  const checkBrand= await BrandDtb.findOne({name:req.body.name})
  if (checkBrand) {
  if (!req.params.id || checkBrand._id.toString() !== req.params.id) {
    return res.status(400).json({ message: "Tên thương hiệu đã tồn tại" });
  }
  }
  if (req.file && req.file.path) {
     req.body.logo = req.file.path; 
  }
  if(!req.body.logo) {
     return res.status(400).json({ message: "Vui lòng tải ảnh lên" })
  }
  return validate(brandSchema)(req, res, next);
};

const noteSchema = Joi.object({
  name: Joi.string().trim().required(),
  type: Joi.string().valid('top', 'middle', 'base').required(),
  group: Joi.string().trim().required(),
});

const validateNote = async (req, res, next) => {
  const checkNote= await NoteDtb.findOne({name:req.body.name})
  if (checkNote) {
  if (!req.params.id || checkNote._id.toString() !== req.params.id) {
    return res.status(400).json({ message: "Tên mùi hương đã tồn tại" });
  }
  }
  return validate(noteSchema)(req, res, next);

};

const noteGroupSchema = Joi.object({
  name: Joi.string().trim().required(),
});

const validateNoteGroup = async (req, res, next) => {
  const checkNoteGroup= await NoteGroupDtb.findOne({name:req.body.name})
  if (checkNoteGroup) {
    if (!req.params.id || checkNoteGroup._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Tên mùi hương đã tồn tại" });
    }
  }

  return validate(noteGroupSchema)(req, res, next);
};



module.exports = {
  validateProduct,
  validateSignup,
  validateLogin,
  validateUpdateUser,
  validateBrand,
  validateNote,
  validateNoteGroup
};
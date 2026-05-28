const express=require('express');
const router=express.Router();
const userControllers=require("../controllers/user.controller");
const {authMiddleware,authUserMiddleware}=require("../middleware/auth.middleware");
const uploadImg = require("../middleware/uploadImg").upload("users");
const {validateSignup,validateLogin,validateUpdateUser}=require("../validate/validateAll");

router.post('/sign-up',validateSignup,userControllers.createUser);

router.post('/sign-in',validateLogin,userControllers.loginUser);

router.post('/log-out',userControllers.logoutUser);

router.post('/change-password/:userId',authUserMiddleware,userControllers.ChangePassword);

router.put('/update-user/:userId',uploadImg.single('avt'),
 authUserMiddleware,validateUpdateUser, userControllers.updateUser);

router.delete('/delete-user/:id',authMiddleware, userControllers.deleteUser);

router.post('/delete-many',authMiddleware,userControllers.deleteManyUser);

router.get('/getAll',authMiddleware, userControllers.getAllUser);

router.get('/get-detail/:id',userControllers.getDetailUser); 


router.post('/refresh-token',userControllers.refreshToken);


module.exports=router;
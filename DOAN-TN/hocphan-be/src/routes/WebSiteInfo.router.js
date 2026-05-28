const express=require('express');
const router=express.Router();
const webSiteInfoControllers=require('../controllers/webSite.controllers');
const {authMiddleware}=require("../middleware/auth.middleware");
const uploadImg=require('../middleware/uploadImg').upload('web-site')

router.post("/update",authMiddleware,
  uploadImg.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 5 }
  ]),
webSiteInfoControllers.update);

router.get("/get-info",webSiteInfoControllers.getInfo);  

 



module.exports=router;
const express=require('express');
const router=express.Router();
const noteGroupControllers=require('../controllers/noteGroup.controller')
const {authMiddleware}=require("../middleware/auth.middleware");
const {validateNoteGroup}=require("../validate/validateAll")


router.post("/create",authMiddleware, validateNoteGroup,noteGroupControllers.createNoteGroup);

router.put("/update/:id",authMiddleware,validateNoteGroup,
            noteGroupControllers.update);  


router.get("/detail/:id",noteGroupControllers.getDetail);  


router.delete("/delete/:id",authMiddleware, noteGroupControllers.delete);  


router.get("/get-all", noteGroupControllers.getAll);  

module.exports=router;
const express=require('express');
const router=express.Router();
const noteControllers=require('../controllers/note.controllers');
const {authMiddleware}=require("../middleware/auth.middleware");
const {validateNote}=require("../validate/validateAll");



router.post("/create",authMiddleware,validateNote,noteControllers.createNote);

router.put("/update/:id",authMiddleware,validateNote,
            noteControllers.updateNote);  


router.get("/detail/:id",noteControllers.getDetail);  


router.delete("/delete/:id",authMiddleware, noteControllers.deleteNote);  

  

router.get("/get-all", noteControllers.getAll);  

module.exports=router;
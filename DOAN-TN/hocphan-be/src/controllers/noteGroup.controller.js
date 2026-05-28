const  NoteGroupService=require('../services/noteGroup.service')
const asyncHandler =require('express-async-handler')

// [POST] /api/note-group/create
module.exports.createNoteGroup= asyncHandler(async(req,res) =>{

    const noteGroup=await NoteGroupService.create(req.body); 
    return res.status(200).json(noteGroup);
  
})



// // [DELETE] /api/note-group/delete/:id
module.exports.delete= asyncHandler(async (req,res) =>{

        const id=req.params.id;
        const response= await NoteGroupService.delete(id);
        return res.status(200).json(response);
})



// [POST] /api/note-group/get-detail/:id
module.exports.getDetail= asyncHandler(async (req,res) =>{
 
    const id=req.params.id;
    const response=await NoteGroupService.getDetail(id);
    return res.status(200).json(response);
  
})


// [GET] /api/note-group/getAll
module.exports.getAll=  asyncHandler(async (req,res) =>{
    const page=parseInt(req.query.page);
    const limit=parseInt(req.query.limit)
    const {key,value,search}=req.query;
    const response=await NoteGroupService.getAll(limit,page,key,value,search);
    return res.status(200).json(response);
})

// [PUT] /api/note-group/update/:id
module.exports.update= asyncHandler(async (req,res) =>{

    const id=req.params.id;
    const data=req.body;

    const dataChange= await NoteGroupService.update(id,data);
    return res.status(200).json(dataChange)

 
})
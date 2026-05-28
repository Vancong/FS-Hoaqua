const  NoteService=require('../services/Note.service')
const asyncHandler =require('express-async-handler')

// [POST] /api/note/create
module.exports.createNote=  asyncHandler(async (req,res) =>{
    const note=await NoteService.createNote(req.body); 
    return res.status(200).json(note);
  
})



// [DELETE] /api/note/delete/:id
module.exports.deleteNote=asyncHandler(async (req,res) =>{
    const nodeId=req.params.id;
    const response= await NoteService.deleteNode(nodeId);
    return res.status(200).json(response);
  
})



// [POST] /api/note/get-detail/:id
module.exports.getDetail= asyncHandler(async (req,res) =>{

    const noteId=req.params.id;
    
    const response=await NoteService.getDetail(noteId);
    return res.status(200).json(response);
    
})


// [GET] /api/brand/getAll

module.exports.getAll=asyncHandler(async (req,res) =>{

    const page=parseInt(req.query.page);
    const limit=parseInt(req.query.limit)
    const {key,value,search}=req.query;
    const response=await NoteService.getAllNote(limit,page,key,value,search);
    return res.status(200).json(response);
    
})

// [PUT] /api/note/update/:id
module.exports.updateNote= async (req,res) =>{

    const nodeId=req.params.id;
    const data=req.body;

    const dataChange= await NoteService.update(nodeId,data);
    return res.status(200).json(dataChange)

}
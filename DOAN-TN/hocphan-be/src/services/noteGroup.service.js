const NoteGroupDtb= require("../models/NoteGroup.Model.js");
const paginationHelper=require("../helper/pagination.js");
const createError=require("../helper/createError.js")
module.exports.create = async (noteGroup) => {
    const createNoteGroup = await NoteGroupDtb.create(noteGroup);
    return {
        status: 'OK',
        message: 'Thành công ',
        data: createNoteGroup
    }; 
}

module.exports.getDetail= async (id) =>{

    const checkNoteGroup=await NoteGroupDtb.findOne({
        _id: id
    });
    if(!checkNoteGroup) {
      throw createError(404,"Nhom huong khong ton tai")
    }
    return {
        status: 'OK',
        message: 'Thanh cong',
        data: checkNoteGroup
    }
  
}


module.exports.getAll= async (limit,page = 1,key,value,search='') =>{

    const sort = {};
    if (key && value){
        sort[key] = value;
    }
    else sort.name = 'asc';

    let query = {}; 
    if (search && search.trim() !== '') {
        query.name = { $regex: search.trim(), $options: 'i' };

    }

    return await paginationHelper({
        model: NoteGroupDtb,
        page,
        limit,
        sort,
        query
    });
    
  
}

module.exports.update= async (id,dataChange) =>{
    const noteGroup=await NoteGroupDtb.findById(id);
    if(!noteGroup) {
         throw createError(404,"Nhom huong khong ton tai")
    }
    const updateNoteGroup= await NoteGroupDtb.findByIdAndUpdate(id,dataChange,{new:true});
    
    return {
        status: 'OK',
        message: 'Thành công ',
        data: updateNoteGroup
    };
      
   
}

module.exports.delete= async (id) => {
  
        const checkNoteGroup= await NoteGroupDtb.findOne({
            _id: id
        })
        if (!checkNoteGroup) {
            throw createError(404,"Nhom huong khong ton tai")
          
        }
        await NoteGroupDtb.findByIdAndDelete(id);
        return {
            status: 'OK',
            message: "Xoa nhom huong thanh cong"
        }
   
}


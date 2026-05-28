const NoteDtb= require("../models/Note.Model.js");
const paginationHelper=require("../helper/pagination.js");
const createError=require("../helper/createError.js")

module.exports.createNote = async (newNote) => {
    const createNote = await NoteDtb.create(newNote);
    return {
        status: 'OK',
        message: 'Thành công ',
        data: createNote
    };
      
   
};

module.exports.getDetail= async (id) =>{
 
    const checkNote=await NoteDtb.findOne({
        _id: id
    });
    if(!checkNote) {
        throw createError(404,'Note khong ton tai')
    }
    return {
        status: 'OK',
        message: 'Thanh cong',
        data: checkNote
    }
}


module.exports.getAllNote= async (limit,page = 1,key,value,search='') =>{

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
        model: NoteDtb,
        page,
        limit,
        sort,
        query,
        populate: { path: 'group', select: 'name' },
        
    });

}

module.exports.update= async (noteId,dataChange) =>{
     
    const updateNode= await NoteDtb.findByIdAndUpdate(noteId,dataChange,{new:true});
    if(!updateNode) {
            throw createError(404,'Note khong ton tai')
    }
    return {
        status: 'OK',
        message: 'Thành công ',
        data: updateNode
    };

}

module.exports.deleteNode= async (nodeId) => {

    const checkNote= await NoteDtb.findOne({
        _id: nodeId
    })
    if (!checkNote) {
        throw createError(404,'Note khong ton tai')
        
    }
    await NoteDtb.findByIdAndDelete(nodeId);
    return {
        status: 'OK',
        message: "Xoa note thanh cong"
    }

}



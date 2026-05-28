const mongoose=require('mongoose');
const userSchema= new mongoose.Schema(
    {
        name: {type:String,trim: true },
        email: {type:String,required:true, unique:true,trim: true },
        password: {type:String,required:true,trim: true },
        isAdmin:{type:Boolean,required:true,default:false},
        phone:{type:Number,trim: true},
        address: {type: String,trim: true },
        avt: {type:String},
        isActive: {type: Boolean,default:true}
    },
    {
        timestamps:true
    }
)

const Users=mongoose.model("Users",userSchema,"Users");
module.exports=Users;


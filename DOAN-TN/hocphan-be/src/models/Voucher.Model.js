const mongoose=require('mongoose');
const VoucherSchema= new mongoose.Schema(
    {
        code: {type:String,required: true,unique:true},
        description:{type:String},
        discountType: {
            type: String,
            enum: ['percentage','fixed'],
            required: true
        },
        discountValue: {type: Number, required: true},
        maxDiscountValue:{type: Number,default :null},
        minOrderValue: {type: Number,default:0},
        startDate: {type :Date,required:true},
        endDate: {type:Date,required:true},
        usageLimit: { type: Number, default: null }, 
        usageCount: { type: Number, default: 0 }, 
        userLimit: {type: Number },
        usedBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
                count: { type: Number, default: 1 }, 
            },
        ],
        isActive:{type: Boolean,default:true}
    },
    {
        timestamps:true
    }
)

const Voucher=mongoose.model("Vouchers",VoucherSchema,"Vouchers");
module.exports=Voucher;


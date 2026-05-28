const mongoose=require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const ProductSchema= new mongoose.Schema(
    {
        name: {type:String, required: true, unique: true,trim: true },
        images: [{ type: String }], 
        description:{type:String,trim: true },
        discount:{type:Number,default:0},
        sizes: [
        {
            volume: { type: Number, required: true ,default:10},
            price: { type: Number, required: true,min:0 },
            countInStock: { type: Number, default: 0 },
            sold: {
                type: Number,
                default: 0,
                min: 0
            }
        }
        ],
        notes: {
            top: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }
            ],
            middle: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }
            ],
            base: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }
            ],
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brands',
            required: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Unisex'],
            required: true,
        },
        concentration: {
            type: String,
            enum: ['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Body Mist'],
            required: true,
        },
        scentDuration: {
            type: String,
            required: true,
        },
        isActive: { type: Boolean, default: true },
        slug: {
                type: String,
                slug: 'name', 
                unique: true
            }
    },
    {
         timestamps: true,
    }
)

const Products=mongoose.model("Products",ProductSchema,"Products");
module.exports=Products;

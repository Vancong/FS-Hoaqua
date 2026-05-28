const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const BrandSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true,trim: true  },
        description: { type: String ,trim: true },
        logo: { type: String }, 
        isActive: {type: Boolean, default :true},
        slug: {
            type: String,
            slug: 'name', 
            unique: true
        }
    }, {
    timestamps: true
});

const Brand = mongoose.model('Brands', BrandSchema, 'Brands');
module.exports = Brand;

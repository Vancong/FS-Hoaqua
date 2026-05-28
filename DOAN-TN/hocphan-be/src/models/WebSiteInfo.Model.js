const mongoose=require('mongoose');

const WebSiteInfoSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    socialLinks: {
      facebook: { type: String },
      tiktok: { type: String },
      zalo: { type: String },
    },
    email: {type:String},
    phone: {type: String},
    banner: [{type:String}],
    address: {type: String},
    updateBy: {type: String}
},{
    timestamps:true
})

module.exports=mongoose.model("WebSiteInfos",WebSiteInfoSchema,"WebSiteInfos")
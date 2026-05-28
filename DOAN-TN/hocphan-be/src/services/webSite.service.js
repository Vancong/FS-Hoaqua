const WebSiteInfoDtb=require('../models/WebSiteInfo.Model');
const createError=require('../helper/createError')

module.exports.update= async(data) =>{
    let webInfo=await WebSiteInfoDtb.findOne();
    if(!webInfo){
        webInfo = new WebSiteInfoDtb(data);
    }
    else {
        Object.keys(data).forEach(key =>{
            webInfo[key]=data[key]
        })
    }
    await webInfo.save();
    return {
        status:'OK',
        data: webInfo
    }
}



module.exports.getInfo= async(data) =>{
    const websiteInfo= await WebSiteInfoDtb.findOne();
    if(!websiteInfo){
        // Trả về object mặc định thay vì throw error
        return {
            status:'OK',
            data: {
                name: '',
                logo: '',
                socialLinks: {
                    facebook: '',
                    tiktok: '',
                    zalo: ''
                },
                email: '',
                phone: '',
                banner: [],
                address: ''
            }
        }
    }
    return {
        status:'OK',
        data: websiteInfo
    }
}
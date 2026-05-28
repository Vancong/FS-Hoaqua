const asyncHandler =require('express-async-handler')
const webSiteService=require('../services/webSite.service');

module.exports.update=asyncHandler(async(req,res)=>{
    
    if(req.files.logo && req.files.logo[0].path) {
        req.body.logo = req.files.logo[0].path
    } else if(req.body.oldImglogo) {
        req.body.logo = req.body.oldImglogo; 
    }

    // Xử lý banner
    let banner = [];
    const hasNewBanners = req.files.banner && req.files.banner.length > 0;
    let oldBanners = [];
    
    // Parse oldImgBanner nếu có
    if(req.body.oldImgBanner) {
        try {
            const parsed = JSON.parse(req.body.oldImgBanner);
            if(Array.isArray(parsed)) {
                oldBanners = parsed;
            }
        } catch(error) {
            console.error('Error parsing oldImgBanner:', error);
        }
    }
    
    // Nếu có banner mới upload, thêm vào mảng
    if(hasNewBanners) {
        banner = req.files.banner.map(item => item.path);
    }
   
    // Thêm oldBanners vào mảng banner (nếu có)
    if(oldBanners.length > 0) {
        oldBanners.forEach(imgUrl => {
            if(imgUrl) { // Chỉ thêm nếu imgUrl không rỗng
                banner.push(imgUrl);
            }
        });
    }

    // Chỉ cập nhật banner nếu:
    // 1. Có banner mới upload, HOẶC
    // 2. Có oldImgBanner và nó không rỗng (có ít nhất 1 banner)
    // Nếu không có banner mới và oldImgBanner rỗng, không cập nhật để giữ nguyên banner cũ
    if(hasNewBanners || oldBanners.length > 0) {
        req.body.banner = banner;
    }

    if(req.body.socialLinks) {
         req.body.socialLinks = JSON.parse(req.body.socialLinks);
    }

    const response=await webSiteService.update(req.body);
    return res.status(200).json(response);
})

module.exports.getInfo=asyncHandler(async(req,res)=>{
    
    const response=await webSiteService.getInfo();
    return res.status(200).json(response);
})
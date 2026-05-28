const asyncHandler = require('express-async-handler');
const webSiteService = require('../services/webSite.service');

module.exports.update = asyncHandler(async (req, res) => {
    if (req.files && req.files.logo && req.files.logo[0] && req.files.logo[0].path) {
        req.body.logo = req.files.logo[0].path;
    } else if (req.body.oldImglogo) {
        req.body.logo = req.body.oldImglogo; 
    }

    let banner = [];
    const hasNewBanners = req.files && req.files.banner && req.files.banner.length > 0;
    let oldBanners = [];
    
    if (req.body.oldImgBanner) {
        try {
            const parsed = JSON.parse(req.body.oldImgBanner);
            if (Array.isArray(parsed)) {
                oldBanners = parsed;
            }
        } catch (error) {
            console.error('Error parsing oldImgBanner:', error);
        }
    }
    
    if (hasNewBanners) {
        banner = [req.files.banner[0].path];
    }
   
    if (!hasNewBanners && oldBanners.length > 0 && oldBanners[0]) {
        banner = [oldBanners[0]];
    }

    const hasAnyBanner = hasNewBanners || (oldBanners.length > 0 && oldBanners[0]);
    if (hasAnyBanner) {
        req.body.banner = banner;
    }

    if (req.body.socialLinks) {
         try {
             req.body.socialLinks = JSON.parse(req.body.socialLinks);
         } catch (error) {
             console.error('Error parsing socialLinks:', error);
         }
    }

    const response = await webSiteService.update(req.body);
    return res.status(200).json(response);
});

module.exports.getInfo = asyncHandler(async (req, res) => {
    const response = await webSiteService.getInfo();
    return res.status(200).json(response);
});

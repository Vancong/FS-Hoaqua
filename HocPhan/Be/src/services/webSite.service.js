const WebSiteInfoDtb = require('../models/WebSiteInfo.Model');

module.exports.update = async (data) => {
    let webInfo = await WebSiteInfoDtb.findOne();
    if (!webInfo) {
        webInfo = new WebSiteInfoDtb(data);
    } else {
        Object.keys(data).forEach(key => {
            webInfo[key] = data[key];
        });
    }
    await webInfo.save();
    return {
        status: 'OK',
        data: webInfo
    };
};

module.exports.getInfo = async () => {
    const websiteInfo = await WebSiteInfoDtb.findOne();
    if (!websiteInfo) {
        return {
            status: 'OK',
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
        };
    }
    return {
        status: 'OK',
        data: websiteInfo
    };
};

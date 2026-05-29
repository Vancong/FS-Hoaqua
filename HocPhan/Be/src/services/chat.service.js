const ProductDtb = require('../models/Product.Model');
const WebSiteInfoDtb = require('../models/WebSiteInfo.Model');
const createError = require('../helper/createError');
const { generateAIResponse } = require('./aiChat.service');

const isGreetingMessage = (message) =>
    /^(alo|hello|hi|chào|chao|xin chào|xin chao|hey)\s*[!?.]?$/i.test(String(message || '').trim());

const mapProductsForClient = (products) =>
    (products || []).map((p) => ({
        _id: String(p._id),
        name: p.name,
        slug: String(p._id),
        price: p.price,
        discount: p.discount || 0,
        type: p.type,
    }));

const parsePriceAmount = (rawNum, unit = '') => {
    const n = parseFloat(String(rawNum).replace(',', '.'));
    if (Number.isNaN(n)) return null;
    const u = String(unit || '').toLowerCase();
    if (u.startsWith('tr') || u === 'm') return Math.round(n * 1_000_000);
    if (u === 'k' || u.includes('ngh') || u.includes('ngàn') || u.includes('ngan')) {
        return Math.round(n * 1_000);
    }
    if (n < 1000) return Math.round(n * 1_000);
    return Math.round(n);
};

const extractPriceFilters = (text) => {
    const result = { priceMin: null, priceMax: null };

    const rangeMatch =
        text.match(/từ\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?\s*(?:đến|den|-)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?/i) ||
        text.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?\s*-\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?/i);

    if (rangeMatch) {
        result.priceMin = parsePriceAmount(rangeMatch[1], rangeMatch[2]);
        result.priceMax = parsePriceAmount(rangeMatch[3], rangeMatch[4]);
        return result;
    }

    const overMatch = text.match(
        /(?:trên|tren|hơn|hon|lớn hơn|lon hon|>=)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?/i
    );
    if (overMatch) {
        result.priceMin = parsePriceAmount(overMatch[1], overMatch[2]);
        return result;
    }

    const underMatch = text.match(
        /(?:dưới|duoi|nhỏ hơn|nho hon|<=)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|ngan|triệu|tr)?/i
    );
    if (underMatch) {
        result.priceMax = parsePriceAmount(underMatch[1], underMatch[2]);
        return result;
    }

    return result;
};

const getFinalPrice = (product) =>
    product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

const extractFiltersFromMessage = (message = '') => {
    const text = message.toLowerCase();
    const filters = {
        type: null,
        hasDiscount: false,
        isFeatured: false,
        search: null,
        sortBy: null,
        priceMin: null,
        priceMax: null,
    };

    const priceFilters = extractPriceFilters(text);
    filters.priceMin = priceFilters.priceMin;
    filters.priceMax = priceFilters.priceMax;

    if (text.includes('nhập khẩu')) filters.type = 'nhập khẩu';
    if (text.includes('nội địa') || text.includes('noi dia')) filters.type = 'nội địa';
    if (
        text.includes('khuyến mãi') ||
        text.includes('khuyen mai') ||
        text.includes('giảm giá') ||
        text.includes('giam gia') ||
        text.includes('ưu đãi') ||
        text.includes('uu dai') ||
        text.includes('deal')
    ) {
        filters.hasDiscount = true;
    }
    if (text.includes('nổi bật') || text.includes('noi bat') || text.includes('bán chạy')) {
        filters.isFeatured = true;
    }
    if (text.includes('rẻ nhất') || text.includes('re nhat') || text.includes('giá thấp')) {
        filters.sortBy = 'cheap';
    }
    if (text.includes('đắt nhất') || text.includes('dat nhat') || text.includes('cao cấp')) {
        filters.sortBy = 'expensive';
    }

    const isGeneralFruitQuestion = /trái cây|trai cay/.test(text);
    const fruitKeywords = [
        'chuối',
        'chuoi',
        'xoài',
        'xoai',
        'bưởi',
        'buoi',
        'kiwi',
        'nho',
        'dưa hấu',
        'dua hau',
        'táo',
        'tao',
        'cam',
        'chanh',
        'dâu',
        'dau',
        'ổi',
    ];
    if (!isGeneralFruitQuestion) {
        const found = fruitKeywords.find((k) => {
            const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(^|[\\s,.!?])${escaped}([\\s,.!?]|$)`, 'i').test(text);
        });
        if (found) filters.search = found;
    }

    return filters;
};

const hasContactInfoIntent = (message) => {
    const text = message.toLowerCase();
    const keywords = [
        'liên hệ',
        'lien he',
        'số điện thoại',
        'so dien thoai',
        'điện thoại',
        'dien thoai',
        'email',
        'địa chỉ',
        'dia chi',
        'facebook',
        'zalo',
        'tiktok',
    ];
    return keywords.some((k) => text.includes(k));
};

const hasProductIntent = (message, filters) => {
    const text = message.toLowerCase();

    if (
        filters.type ||
        filters.hasDiscount ||
        filters.isFeatured ||
        filters.search ||
        filters.sortBy ||
        filters.priceMin != null ||
        filters.priceMax != null
    ) {
        return true;
    }

    const keywords = [
        'tư vấn',
        'tu van',
        'gợi ý',
        'goi y',
        'sản phẩm',
        'san pham',
        'trái cây',
        'trai cay',
        'giá',
        'gia',
        'mua',
        'nào',
        'nao',
        'gì',
        'gi',
        'có gì',
        'co gi',
        'vitamin',
        'tươi',
        'tuoi',
    ];

    return keywords.some((k) => text.includes(k)) && !isGreetingMessage(message);
};

const isAskingAboutPreviousProducts = (message, recentMessages) => {
    const text = message.toLowerCase();
    const lastBotMessage = [...(recentMessages || [])]
        .reverse()
        .find((msg) => msg.sender === 'bot' && msg.products?.length > 0);

    if (!lastBotMessage) return false;

    const referenceKeywords = [
        'đó',
        'do',
        'này',
        'nay',
        'vừa rồi',
        'vua roi',
        'trước đó',
        'truoc do',
        'loại đó',
        'loai do',
        'sản phẩm đó',
        'san pham do',
        'thế',
        'the',
        'vậy',
        'vay',
    ];

    return referenceKeywords.some((k) => text.includes(k));
};

const queryProducts = async (filters, limit = 10) => {
    const query = { stock: { $gt: 0 } };

    if (filters.type) query.type = filters.type;
    if (filters.hasDiscount) query.discount = { $gt: 0 };
    if (filters.isFeatured) query.isFeatured = true;
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
        ];
    }

    let products = await ProductDtb.find(query)
        .select('name price discount type description stock isFeatured sold')
        .lean();

    products = products.map((p) => ({
        ...p,
        _finalPrice: getFinalPrice(p),
    }));

    if (filters.priceMin != null) {
        products = products.filter((p) => p._finalPrice >= filters.priceMin);
    }
    if (filters.priceMax != null) {
        products = products.filter((p) => p._finalPrice <= filters.priceMax);
    }

    if (filters.sortBy === 'cheap') {
        products.sort((a, b) => a._finalPrice - b._finalPrice);
    } else if (filters.sortBy === 'expensive' || filters.priceMin != null) {
        products.sort((a, b) => b._finalPrice - a._finalPrice);
    } else {
        products.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    }

    return products.slice(0, limit).map(({ _finalPrice, ...rest }) => rest);
};

const processMessageWithoutSaving = async (userMessageText, recentMessagesFromClient = []) => {
    const extractedFilters = extractFiltersFromMessage(userMessageText);
    const askingAboutPrevious = isAskingAboutPreviousProducts(
        userMessageText,
        recentMessagesFromClient
    );

    let products = [];

    if (askingAboutPrevious) {
        const lastBotMessage = [...recentMessagesFromClient]
            .reverse()
            .find((msg) => msg.sender === 'bot' && msg.products?.length > 0);

        if (lastBotMessage?.products?.length) {
            const first = lastBotMessage.products[0];
            if (first?.name) {
                products = lastBotMessage.products;
            } else {
                const ids = lastBotMessage.products
                    .map((p) => (typeof p === 'string' ? p : p._id))
                    .filter(Boolean);
                if (ids.length) {
                    products = await ProductDtb.find({ _id: { $in: ids } })
                        .select('name price discount type description stock')
                        .lean();
                }
            }
        }
    } else if (hasProductIntent(userMessageText, extractedFilters)) {
        products = await queryProducts(extractedFilters, 5);
    }

    const isAskingContactInfo = hasContactInfoIntent(userMessageText);
    let websiteInfo = null;
    if (isAskingContactInfo) {
        websiteInfo = await WebSiteInfoDtb.findOne().lean();
    }

    const chatHistory = (recentMessagesFromClient || [])
        .slice(-12)
        .map((msg) => {
            let content = msg.text;
            if (msg.sender === 'bot' && msg.products?.length) {
                const names = msg.products
                    .filter((p) => p?.name)
                    .map((p) => p.name)
                    .join(', ');
                if (names) content += ` [Đã gợi ý: ${names}]`;
            }
            return {
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content,
            };
        });

    const isGreeting = isGreetingMessage(userMessageText);
    const needsProducts =
        !isGreeting &&
        !isAskingContactInfo &&
        (askingAboutPrevious || products.length > 0 || hasProductIntent(userMessageText, extractedFilters));

    const botText = await generateAIResponse(
        userMessageText,
        products,
        extractedFilters,
        chatHistory,
        needsProducts,
        askingAboutPrevious,
        websiteInfo
    );

    const productsToReturn = isGreeting ? [] : products;

    return {
        botText,
        products: mapProductsForClient(productsToReturn.slice(0, 5)),
        extractedFilters,
    };
};

module.exports.sendMessage = async ({ text, recentMessages = [] }) => {
    const userText = String(text || '').trim();
    if (!userText) {
        throw createError(400, 'Tin nhắn không được để trống');
    }

    const result = await processMessageWithoutSaving(userText, recentMessages);

    return {
        status: 'OK',
        data: {
            botMessage: result.botText,
            products: result.products,
        },
    };
};

module.exports.processMessageWithoutSaving = processMessageWithoutSaving;

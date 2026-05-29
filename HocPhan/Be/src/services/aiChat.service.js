const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const formatProductPrice = (product) => {
    const final =
        product.discount > 0
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;
    return `${final.toLocaleString('vi-VN')}đ/kg`;
};

const isGreetingMessage = (message) =>
    /^(alo|hello|hi|chào|chao|xin chào|xin chao|hey)\s*[!?.]?$/i.test(String(message || '').trim());

const buildPriceHint = (filters = {}) => {
    if (filters.priceMin != null && filters.priceMax != null) {
        return `từ ${filters.priceMin.toLocaleString('vi-VN')}đ đến ${filters.priceMax.toLocaleString('vi-VN')}đ/kg`;
    }
    if (filters.priceMin != null) {
        return `trên ${filters.priceMin.toLocaleString('vi-VN')}đ/kg`;
    }
    if (filters.priceMax != null) {
        return `dưới ${filters.priceMax.toLocaleString('vi-VN')}đ/kg`;
    }
    return '';
};

const buildFallbackResponse = (products, message, filters = {}) => {
    if (isGreetingMessage(message)) {
        return 'Xin chào! Mình là trợ lý cửa hàng trái cây. Bạn cần tư vấn loại trái nội địa, nhập khẩu hay sản phẩm đang khuyến mãi ạ?';
    }

    const priceHint = buildPriceHint(filters);

    if (!products || products.length === 0) {
        if (priceHint) {
            return `Hiện chưa có sản phẩm nào ${priceHint} trong cửa hàng. Bạn thử hỏi mức giá khác hoặc loại trái khác nhé.`;
        }
        return 'Hiện tại mình chưa tìm được sản phẩm phù hợp. Bạn thử hỏi theo tên trái, loại (nội địa/nhập khẩu) hoặc mức giá nhé.';
    }

    const first = products[0];
    const pricePart = priceHint ? ` (${priceHint})` : '';
    return `Mình tìm được ${products.length} sản phẩm phù hợp${pricePart}. Ví dụ: ${first.name} với giá ${formatProductPrice(first)}. Bạn có muốn xem thêm chi tiết không?`;
};

const generateAIResponse = async (
    message,
    products,
    filters,
    chatHistory = [],
    needsProducts = true,
    askingAboutPrevious = false,
    websiteInfo = null
) => {
    if (!openai) {
        return buildFallbackResponse(products, message, filters);
    }

    try {
        let websiteInfoText = '';
        if (websiteInfo) {
            const parts = [];
            if (websiteInfo.name) parts.push(`Tên cửa hàng: ${websiteInfo.name}`);
            if (websiteInfo.phone) parts.push(`Số điện thoại: ${websiteInfo.phone}`);
            if (websiteInfo.email) parts.push(`Email: ${websiteInfo.email}`);
            if (websiteInfo.address) parts.push(`Địa chỉ: ${websiteInfo.address}`);
            if (parts.length) {
                websiteInfoText = `\n\nTHÔNG TIN LIÊN HỆ:\n${parts.join('\n')}`;
            }
        }

        let productList = '';
        if ((needsProducts || askingAboutPrevious) && products?.length) {
            productList = products
                .slice(0, 5)
                .map(
                    (p, idx) =>
                        `${idx + 1}. ${p.name} - ${formatProductPrice(p)} - Loại: ${p.type} - Còn ${p.stock}kg`
                )
                .join('\n');
            productList = `\n\nDanh sách sản phẩm:\n${productList}`;
        } else if (needsProducts) {
            productList = '\n\nKhông tìm thấy sản phẩm phù hợp.';
        }

        const filterInfo = [];
        if (filters.type) filterInfo.push(`Loại: ${filters.type}`);
        if (filters.hasDiscount) filterInfo.push('Đang khuyến mãi');
        if (filters.isFeatured) filterInfo.push('Sản phẩm nổi bật');
        if (filters.search) filterInfo.push(`Từ khóa: ${filters.search}`);
        if (filters.priceMin != null) {
            filterInfo.push(`Giá tối thiểu: ${filters.priceMin.toLocaleString('vi-VN')}đ/kg`);
        }
        if (filters.priceMax != null) {
            filterInfo.push(`Giá tối đa: ${filters.priceMax.toLocaleString('vi-VN')}đ/kg`);
        }

        let systemPrompt = `Bạn là chuyên gia tư vấn trái cây cho cửa hàng online tại Việt Nam.
- Trả lời tiếng Việt, thân thiện, CỰC NGẮN (1-3 câu).
- CHỈ gợi ý sản phẩm trong danh sách được cung cấp, ghi ĐÚNG tên sản phẩm.
- Đọc lịch sử chat để hiểu ngữ cảnh (hỏi tiếp về sản phẩm đã gợi ý).
- Không thêm link, không bịa giá/tồn kho.`;

        if (askingAboutPrevious) {
            systemPrompt +=
                '\n- Khách đang hỏi về sản phẩm đã gợi ý trước đó: CHỈ trả lời về sản phẩm trong danh sách, không gợi ý sản phẩm mới.';
        }

        let userPrompt = `Khách hàng vừa hỏi: "${message}"`;

        if (websiteInfo && websiteInfoText) {
            userPrompt += `${websiteInfoText}\nTrả lời thông tin liên hệ nếu khách hỏi.`;
        } else if (needsProducts) {
            userPrompt += `\nTiêu chí: ${filterInfo.length ? filterInfo.join(', ') : 'Không có'}${productList}`;
        } else {
            userPrompt += '\nĐây là lời chào/câu hỏi chung. Trả lời thân thiện, hỏi khách cần tư vấn gì.';
        }

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...(chatHistory || []),
                { role: 'user', content: userPrompt },
            ],
            temperature: askingAboutPrevious ? 0.3 : 0.7,
            max_tokens: askingAboutPrevious ? 120 : 180,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (content) return content;
        return buildFallbackResponse(products, message, filters);
    } catch (error) {
        console.error('OpenAI Error:', error?.message || error);
        return buildFallbackResponse(products, message, filters);
    }
};

module.exports = {
    generateAIResponse,
    buildFallbackResponse,
};

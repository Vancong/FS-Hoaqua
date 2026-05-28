const OpenAI = require('openai');

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Tạo câu trả lời AI dựa trên message của user, danh sách sản phẩm và filters
 * @param {string} message - Câu hỏi gốc của user
 * @param {Array} products - Danh sách sản phẩm đã query từ database
 * @param {Object} filters - Filters đã extract (priceMin, priceMax, gender, notes, scentDuration)
 * @param {Array} chatHistory - Lịch sử chat gần nhất để AI hiểu ngữ cảnh
 * @param {boolean} needsProducts - Có cần đưa ra sản phẩm không (false nếu chỉ là câu chào/thông thường)
 * @param {boolean} askingAboutPrevious - Đang hỏi về sản phẩm đã được gợi ý trước đó
 * @param {Object} websiteInfo - Thông tin website (email, phone, address, socialLinks) nếu có
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
const generateAIResponse = async (message, products, filters, chatHistory = [], needsProducts = true, askingAboutPrevious = false, websiteInfo = null) => {
  try {
    // Chuẩn bị thông tin website để đưa vào prompt (nếu có)
    let websiteInfoText = '';
    if (websiteInfo) {
      const infoParts = [];
      if (websiteInfo.name) infoParts.push(`Tên cửa hàng: ${websiteInfo.name}`);
      if (websiteInfo.phone) infoParts.push(`Số điện thoại: ${websiteInfo.phone}`);
      if (websiteInfo.email) infoParts.push(`Email: ${websiteInfo.email}`);
      if (websiteInfo.address) infoParts.push(`Địa chỉ: ${websiteInfo.address}`);
      if (websiteInfo.socialLinks) {
        const socialParts = [];
        if (websiteInfo.socialLinks.facebook) socialParts.push(`Facebook: ${websiteInfo.socialLinks.facebook}`);
        if (websiteInfo.socialLinks.tiktok) socialParts.push(`TikTok: ${websiteInfo.socialLinks.tiktok}`);
        if (websiteInfo.socialLinks.zalo) socialParts.push(`Zalo: ${websiteInfo.socialLinks.zalo}`);
        if (socialParts.length > 0) {
          infoParts.push(`Mạng xã hội: ${socialParts.join(', ')}`);
        }
      }
      if (infoParts.length > 0) {
        websiteInfoText = `\n\n═══════════════════════════════════════
THÔNG TIN LIÊN HỆ CỬA HÀNG:
═══════════════════════════════════════
${infoParts.join('\n')}
═══════════════════════════════════════`;
      }
    }

    // Chuẩn bị thông tin sản phẩm để đưa vào prompt (chỉ khi cần hoặc khi đang hỏi về sản phẩm cũ)
    let productList = '';
    if (needsProducts || askingAboutPrevious) {
      if (products && products.length > 0) {
        const productInfo = products.slice(0, 5).map((p, idx) => {
          const baseMinPrice = Math.min(...(p.sizes || []).map(s => s.price));
          const discount = p.discount || 0;
          const finalMinPrice = discount > 0
            ? Math.round(baseMinPrice * (1 - discount / 100))
            : baseMinPrice;
          const priceFormatted = finalMinPrice.toLocaleString('vi-VN');
          return `${idx + 1}. ${p.name} (slug: ${p.slug}) - Giá từ ${priceFormatted}₫ - Giới tính: ${p.gender} - Nồng độ: ${p.concentration}`;
        }).join('\n');
        productList = `\n\nDanh sách sản phẩm tìm được:\n${productInfo}`;
      } else {
        productList = '\n\nKhông tìm thấy sản phẩm nào phù hợp.';
      }
    }

    // Chuẩn bị thông tin filters
    const filterInfo = [];
    if (filters.priceMin || filters.priceMax) {
      filterInfo.push(`Khoảng giá: ${filters.priceMin || '?'} - ${filters.priceMax || '?'} triệu VNĐ`);
    }
    if (filters.gender) {
      filterInfo.push(`Giới tính: ${filters.gender}`);
    }
    if (filters.notes && filters.notes.length > 0) {
      filterInfo.push(`Mùi hương: ${filters.notes.join(', ')}`);
    }
    if (filters.scentDuration) {
      filterInfo.push(`Lưu hương: ${filters.scentDuration}`);
    }

    let systemPrompt = `Bạn là chuyên gia tư vấn nước hoa chuyên nghiệp cho một cửa hàng nước hoa online tại Việt Nam.
Nhiệm vụ của bạn:
1. Trả lời bằng tiếng Việt, giọng điệu thân thiện, chuyên nghiệp.
2. Trả lời CỰC KỲ NGẮN GỌN, chỉ 1-2 câu, không dài dòng.
3. Đọc KỸ câu hỏi của khách hàng để hiểu ý định thực sự của họ.
4. CỰC KỲ QUAN TRỌNG: BẠN PHẢI ĐỌC KỸ TOÀN BỘ LỊCH SỬ CHAT TRƯỚC ĐÓ để hiểu ngữ cảnh cuộc trò chuyện. 
   - Nếu khách hàng đang hỏi về sản phẩm đã được đề cập trước đó (ví dụ: "2 loại đó", "sản phẩm nào tốt nhất trong danh sách vừa rồi", "có dành cho nữ k", "thế có loại nào 2 triệu k"), bạn PHẢI:
     + Đọc lại lịch sử chat để biết những sản phẩm nào đã được gợi ý
     + Chỉ trả lời về các sản phẩm đã được gợi ý trong lịch sử chat
     + KHÔNG được gợi ý sản phẩm mới nếu khách hàng đang hỏi về sản phẩm cũ
   - Nếu khách hàng hỏi câu hỏi mới (có tiêu chí mới như giá, giới tính mới), thì mới tìm sản phẩm mới.
   - Nếu khách hàng hỏi về thông tin liên hệ (số điện thoại, email, địa chỉ, mạng xã hội), bạn PHẢI sử dụng thông tin được cung cấp để trả lời chính xác.
5. Luôn tham khảo lịch sử chat để hiểu ngữ cảnh trước khi trả lời.`;
    
    if (askingAboutPrevious) {
      systemPrompt += `
5. ⚠️ CỰC KỲ QUAN TRỌNG - TUYỆT ĐỐI KHÔNG VI PHẠM: Khách hàng đang hỏi về sản phẩm đã được gợi ý trước đó. 
   - Bạn PHẢI CHỈ trả lời về các sản phẩm trong danh sách được cung cấp
   - TUYỆT ĐỐI KHÔNG được nhắc đến, gợi ý, hoặc thêm BẤT KỲ sản phẩm nào khác
   - KHÔNG được kết thúc câu bằng cách thêm tên sản phẩm mới
   - CHỈ trả lời câu hỏi, KHÔNG gợi ý thêm sản phẩm`;
    }

    if (!askingAboutPrevious) {
      if (needsProducts && products && products.length > 0) {
        systemPrompt += `
${askingAboutPrevious ? '6' : '5'}. Nếu có danh sách sản phẩm được cung cấp, chỉ được sử dụng thông tin sản phẩm trong danh sách đó.
${askingAboutPrevious ? '7' : '6'}. Chỉ gợi ý 1-2 sản phẩm tốt nhất, nhắc đúng tên sản phẩm như trong danh sách.
${askingAboutPrevious ? '8' : '7'}. KHÔNG thêm đoạn (link: ...) hay bất kỳ đường dẫn nào trong câu trả lời, chỉ nhắc tên sản phẩm. Phần link sẽ do frontend tự xử lý.
${askingAboutPrevious ? '9' : '8'}. KHÔNG được bịa thêm sản phẩm ngoài danh sách.`;
      } else if (needsProducts) {
        systemPrompt += `
${askingAboutPrevious ? '6' : '5'}. Nếu không có sản phẩm phù hợp, thông báo ngắn gọn và đề xuất điều chỉnh tiêu chí.
${askingAboutPrevious ? '7' : '6'}. KHÔNG được bịa thêm sản phẩm ngoài danh sách.`;
      } else {
        systemPrompt += `
${askingAboutPrevious ? '6' : '5'}. Nếu câu hỏi chỉ là lời chào hoặc câu hỏi thông thường (không yêu cầu tư vấn sản phẩm), hãy trả lời thân thiện và hỏi xem khách hàng cần tư vấn gì.
${askingAboutPrevious ? '7' : '6'}. KHÔNG đưa ra sản phẩm nếu khách hàng không yêu cầu.`;
      }
    } else {
      systemPrompt += `
6. CHỈ được trả lời về các sản phẩm trong danh sách được cung cấp, nhắc đúng tên sản phẩm.
7. KHÔNG thêm đoạn (link: ...) hay bất kỳ đường dẫn nào trong câu trả lời, chỉ nhắc tên sản phẩm.
8. TUYỆT ĐỐI KHÔNG được bịa thêm sản phẩm ngoài danh sách.
9. KHÔNG được kết thúc câu bằng cách gợi ý thêm sản phẩm mới.
10. CHỈ trả lời câu hỏi của khách hàng về các sản phẩm đã được liệt kê, KHÔNG thêm bất kỳ sản phẩm nào khác vào cuối câu trả lời.`;
    }

    // Chuẩn bị lịch sử chat để đưa vào prompt (bao gồm cả thông tin sản phẩm đã gợi ý)
    let chatHistoryText = '';
    if (chatHistory && chatHistory.length > 0) {
      const historyLines = chatHistory.map((msg, idx) => {
        const role = msg.role === 'user' ? 'Khách hàng' : 'Bạn (AI)';
        return `${role}: ${msg.content}`;
      }).join('\n');
      chatHistoryText = `\n\n═══════════════════════════════════════
LỊCH SỬ CUỘC TRÒ CHUYỆN (ĐỌC KỸ ĐỂ HIỂU NGỮ CẢNH):
═══════════════════════════════════════
${historyLines}
═══════════════════════════════════════

QUAN TRỌNG: Hãy đọc kỹ lịch sử trên để hiểu:
- Khách hàng đã hỏi gì?
- Bạn đã gợi ý những sản phẩm nào?
- Khách hàng đang hỏi về sản phẩm cũ hay yêu cầu sản phẩm mới?`;
    }

    let userPrompt = `Khách hàng vừa hỏi: "${message}"${chatHistoryText}`;

    // Nếu hỏi về thông tin liên hệ
    if (websiteInfo) {
      userPrompt += `${websiteInfoText}

QUAN TRỌNG: Khách hàng đang hỏi về thông tin liên hệ của cửa hàng. Bạn PHẢI sử dụng thông tin trên để trả lời chính xác. Trả lời ngắn gọn, rõ ràng về số điện thoại, email, địa chỉ hoặc mạng xã hội tùy theo câu hỏi của khách hàng.`;
    } else if (askingAboutPrevious) {
      userPrompt += `\n\n═══════════════════════════════════════
⚠️ CỰC KỲ QUAN TRỌNG - ĐỌC KỸ - TUYỆT ĐỐI KHÔNG VI PHẠM:
═══════════════════════════════════════
Khách hàng đang hỏi về sản phẩm ĐÃ ĐƯỢC GỢI Ý TRƯỚC ĐÓ trong lịch sử chat.

BẠN PHẢI TUYỆT ĐỐI:
1. CHỈ trả lời về các sản phẩm trong danh sách dưới đây
2. KHÔNG được nhắc đến, gợi ý, hoặc thêm BẤT KỲ sản phẩm nào khác ngoài danh sách này
3. KHÔNG được kết thúc câu bằng cách gợi ý thêm sản phẩm mới
4. CHỈ trả lời câu hỏi của khách hàng về các sản phẩm đã được liệt kê
5. KHÔNG được tự động thêm tên sản phẩm khác vào cuối câu trả lời
6. Nếu khách hỏi "sản phẩm nào được dùng nhiều hơn", chỉ so sánh các sản phẩm trong danh sách, KHÔNG thêm sản phẩm mới

Danh sách sản phẩm đã được gợi ý trước đó (CHỈ được nhắc đến các sản phẩm này):
${productList}

Hãy trả lời câu hỏi của khách hàng về các sản phẩm này một cách chính xác và thân thiện. 
⚠️ TUYỆT ĐỐI KHÔNG thêm bất kỳ tên sản phẩm nào khác vào cuối câu trả lời. 
⚠️ CHỈ trả lời câu hỏi, KHÔNG gợi ý thêm sản phẩm mới.`;
    } else if (needsProducts) {
      // Kiểm tra xem có yêu cầu giá cụ thể không
      let priceNote = '';
      if (filters.priceMin && filters.priceMax && Math.abs(filters.priceMin - filters.priceMax) < 1) {
        const targetPrice = ((filters.priceMin + filters.priceMax) / 2).toFixed(1);
        priceNote = `\n\nLƯU Ý: Khách hàng đang hỏi về sản phẩm giá khoảng ${targetPrice} triệu. Nếu có sản phẩm trong danh sách gần với giá này, hãy ưu tiên gợi ý sản phẩm đó. Nếu không có sản phẩm đúng giá, hãy gợi ý sản phẩm gần nhất với giá yêu cầu.`;
      }
      
      userPrompt += `\n\nCác tiêu chí đã trích xuất từ câu hỏi:
${filterInfo.length > 0 ? filterInfo.join('\n') : 'Không có tiêu chí cụ thể'}${priceNote}
${productList}

Hãy tư vấn cho khách hàng một cách chuyên nghiệp và thân thiện.`;
    } else {
      userPrompt += `\n\nĐây là câu hỏi thông thường, không yêu cầu tư vấn sản phẩm. Hãy trả lời thân thiện và hỏi xem khách hàng cần tư vấn gì về nước hoa.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Hoặc 'gpt-3.5-turbo' nếu muốn rẻ hơn
      messages: [
        { role: 'system', content: systemPrompt },
        ...(chatHistory || []), // Thêm lịch sử chat vào messages để AI hiểu ngữ cảnh
        { role: 'user', content: userPrompt }
      ],
      temperature: askingAboutPrevious ? 0.3 : 0.7, // Giảm temperature khi hỏi về sản phẩm cũ để trả lời chính xác hơn, ít sáng tạo hơn
      max_tokens: askingAboutPrevious ? 100 : 150 // Giảm max_tokens khi hỏi về sản phẩm cũ để tránh thêm nội dung không cần thiết
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI Error:', error);
    
    // Fallback response nếu AI lỗi
    if (!products || products.length === 0) {
      return 'Hiện tại mình chưa tìm được sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể điều chỉnh lại khoảng giá, giới tính hoặc mùi hương giúp mình nhé.';
    }
    
    const first = products[0];
    const minPrice = Math.min(...(first.sizes || []).map(s => s.price));
    return `Mình tìm được ${products.length} sản phẩm phù hợp. Ví dụ: ${first.name} với giá từ ${minPrice.toLocaleString('vi-VN')}₫. Bạn có muốn xem thêm chi tiết không?`;
  }
};

module.exports = {
  generateAIResponse
};


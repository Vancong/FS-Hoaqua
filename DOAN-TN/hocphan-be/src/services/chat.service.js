const Products = require('../models/Product.Model');
const WebSiteInfoDtb = require('../models/WebSiteInfo.Model');
const Notes = require('../models/Note.Model');
const NoteGroups = require('../models/NoteGroup.Model');
const { generateAIResponse } = require('./aiChat.service');

// TODO: sau này sẽ thay bằng AI thực sự
// Hiện tại chỉ parse rất đơn giản dựa vào 4 loại câu hỏi bạn đã định nghĩa:
// - khoảng giá
// - mùi hương
// - giới tính
// - lưu hương lâu / vừa
const extractFiltersFromMessage = (message = '') => {
  const text = message.toLowerCase();

  const filters = {
    priceMin: null,
    priceMax: null,
    gender: null,
    notes: [],
    scentDuration: null,
    sortBy: null // 'expensive' hoặc 'cheap'
  };

  // Giá: "từ X đến Y triệu" hoặc "từ X - Y triệu"
  const rangeMatch =
    text.match(/từ\s*(\d+\.?\d*)\s*[-đến]*\s*(\d+\.?\d*)\s*triệu/) ||
    text.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*triệu/);

  if (rangeMatch) {
    filters.priceMin = Number(rangeMatch[1]);
    filters.priceMax = Number(rangeMatch[2]);
  } else {
    // "dưới X triệu"
    const underMatch = text.match(/dưới\s*(\d+\.?\d*)\s*triệu/);
    if (underMatch) {
      filters.priceMax = Number(underMatch[1]);
    }

    // "trên X triệu"
    const overMatch = text.match(/trên\s*(\d+\.?\d*)\s*triệu/);
    if (overMatch) {
      filters.priceMin = Number(overMatch[1]);
    }

    // "X triệu" hoặc "X triệu k" hoặc "X triệu không" - giá cụ thể, tạo khoảng xung quanh
    const exactPriceMatch = text.match(/(?:có|co|loại|loai|nào|nao|gì|gi|what|which).*?(\d+\.?\d*)\s*triệu(?:\s*k|\s*khong|\s*không)?/i) ||
                            text.match(/(\d+\.?\d*)\s*triệu(?:\s*k|\s*khong|\s*không)?(?:\s*$|\s*[?.,!])/i);
    if (exactPriceMatch) {
      const price = Number(exactPriceMatch[1]);
      // Tạo khoảng giá xung quanh: ±30% hoặc tối thiểu ±0.5 triệu
      const margin = Math.max(price * 0.3, 0.5);
      filters.priceMin = Math.max(0, price - margin);
      filters.priceMax = price + margin;
    }
  }

  // Giới tính
  if (text.includes('nam')) filters.gender = 'Male';
  if (text.includes('nữ') || text.includes('nu ')) filters.gender = 'Female';
  if (text.includes('unisex')) filters.gender = 'Unisex';

  // Mùi hương đơn giản (sau này có thể map với NoteGroup)
  if (text.includes('hoa')) filters.notes.push('hoa');
  if (text.includes('gỗ')) filters.notes.push('gỗ');
  if (text.includes('cam') || text.includes('chanh')) filters.notes.push('cam chanh');
  if (text.includes('ngọt') || text.includes('ngot')) filters.notes.push('ngọt');
  if (text.includes('fresh') || text.includes('tươi')) filters.notes.push('fresh');

  // Lưu hương
  if (text.includes('lưu hương lâu')) filters.scentDuration = 'lâu';
  else if (text.includes('lưu hương vừa')) filters.scentDuration = 'vừa';
  else if (text.includes('lưu hương ngắn')) filters.scentDuration = 'ngắn';

  // Detect sort intent: đắt nhất, rẻ nhất
  if (text.includes('đắt nhất') || text.includes('dat nhat') || text.includes('cao nhất') || text.includes('cao nhat')) {
    filters.sortBy = 'expensive';
  } else if (text.includes('rẻ nhất') || text.includes('re nhat') || text.includes('thấp nhất') || text.includes('thap nhat')) {
    filters.sortBy = 'cheap';
  }

  return filters;
};

// Các hàm createOrGetChat, processMessage, getChatHistory đã được xóa vì không còn dùng
// Chat history hiện được lưu ở localStorage trên frontend, không lưu vào database nữa

// Kiểm tra xem câu hỏi có yêu cầu thông tin liên hệ không
const hasContactInfoIntent = (message) => {
  const text = message.toLowerCase();
  const contactKeywords = [
    'liên hệ', 'lien he', 'contact', 'thông tin liên hệ', 'thong tin lien he',
    'số điện thoại', 'so dien thoai', 'phone', 'điện thoại', 'dien thoai',
    'email', 'mail', 'gmail',
    'địa chỉ', 'dia chi', 'address', 'địa điểm', 'dia diem',
    'facebook', 'tiktok', 'zalo', 'mạng xã hội', 'mang xa hoi',
    'cửa hàng', 'cua hang', 'shop', 'store', 'địa chỉ cửa hàng', 'dia chi cua hang'
  ];
  
  return contactKeywords.some(keyword => text.includes(keyword));
};

// Kiểm tra xem câu hỏi có yêu cầu tư vấn sản phẩm không
const hasProductIntent = (message, filters) => {
  const text = message.toLowerCase();
  
  // Nếu có filters thì chắc chắn cần query sản phẩm
  if (filters.priceMin || filters.priceMax || filters.gender || filters.notes?.length > 0 || filters.scentDuration || filters.sortBy) {
    return true;
  }
  
  // Các từ khóa cho thấy yêu cầu tư vấn sản phẩm
  const productKeywords = [
    'tư vấn', 'tu van', 'gợi ý', 'goi y', 'đề xuất', 'de xuat',
    'nước hoa', 'nuoc hoa', 'sản phẩm', 'san pham', 'perfume',
    'mùi', 'mui', 'hương', 'huong', 'scent',
    'giá', 'gia', 'price', 'giá rẻ', 'gia re', 'đắt', 'dat',
    'nam', 'nữ', 'nu', 'unisex', 'giới tính', 'gioi tinh',
    'lưu hương', 'luu huong', 'longevity', 'lâu', 'lau',
    'tìm', 'tim', 'find', 'search', 'có gì', 'co gi',
    'nào', 'nao', 'gì', 'gi', 'what', 'which'
  ];
  
  // Kiểm tra xem có từ khóa nào không
  const hasKeyword = productKeywords.some(keyword => text.includes(keyword));
  
  // Nếu là câu chào đơn giản thì không cần sản phẩm
  const greetingOnly = /^(alo|hello|hi|chào|chao|xin chào|xin chao|hey)\s*[!?.]?$/i.test(message.trim());
  
  return hasKeyword && !greetingOnly;
};

// Kiểm tra xem câu hỏi có đang hỏi về sản phẩm đã được gợi ý trước đó không
const isAskingAboutPreviousProducts = (message, recentMessages) => {
  const text = message.toLowerCase();
  
  // Tìm tin nhắn bot gần nhất có products
  const lastBotMessage = recentMessages
    .slice()
    .reverse()
    .find(msg => msg.sender === 'bot' && msg.products && msg.products.length > 0);
  
  // Nếu không có sản phẩm nào được gợi ý trước đó, thì không phải hỏi về sản phẩm cũ
  if (!lastBotMessage || !lastBotMessage.products || lastBotMessage.products.length === 0) {
    return false;
  }
  
  // Các từ khóa cho thấy đang hỏi về sản phẩm đã được gợi ý (câu hỏi tiếp theo)
  const referenceKeywords = [
    'đó', 'do', 'này', 'nay', 'đây', 'day', 'vừa rồi', 'vua roi', 'trước đó', 'truoc do',
    'vừa nói', 'vua noi', 'vừa gợi ý', 'vua goi y', 'vừa đề xuất', 'vua de xuat',
    'sản phẩm đó', 'san pham do', 'sản phẩm này', 'san pham nay',
    'loại đó', 'loai do', 'loại này', 'loai nay',
    'cái đó', 'cai do', 'cái này', 'cai nay',
    'thế', 'the', 'vậy', 'vay', 'thì', 'thi' // "Thế có loại nào 2 triệu k" - hỏi tiếp về sản phẩm đã gợi ý
  ];
  
  // Các câu hỏi về tính chất của sản phẩm đã gợi ý (có phải, có, là, v.v.)
  const propertyQuestionPatterns = [
    /^(đây|cái này|sản phẩm này|loại này|này)\s+(có phải|có|là|phải)/i,
    /^(có phải|có|phải)\s+(đây|cái này|sản phẩm này|loại này|này|đó|cái đó|sản phẩm đó|loại đó)/i,
    /^(đây|cái này|sản phẩm này|loại này|này|đó|cái đó|sản phẩm đó|loại đó)\s+(có|phải|là)\s+/i
  ];
  
  // Kiểm tra xem có phải câu hỏi về tính chất của sản phẩm đã gợi ý không
  const isPropertyQuestion = propertyQuestionPatterns.some(pattern => pattern.test(text.trim()));
  
  // Kiểm tra số lượng (2 loại, 3 sản phẩm, v.v.) - có thể là "2 sản phẩm đó", "3 cái này"
  const hasNumber = /\d+\s*(loại|loai|sản phẩm|san pham|cái|cai)/.test(text);
  
  // Kiểm tra xem có từ khóa tham chiếu không
  const hasReference = referenceKeywords.some(keyword => text.includes(keyword));
  
  // Kiểm tra pattern "X sản phẩm đó/cái đó" - chắc chắn là hỏi về sản phẩm đã gợi ý
  const hasNumberWithReference = /\d+\s*(sản phẩm|san pham|cái|cai|loại|loai)\s*(đó|do|này|nay|đây|day)/.test(text);
  
  // Nếu có từ "thế", "vậy", "thì" và có giá trong câu, có thể là hỏi về sản phẩm đã gợi ý
  const hasContinuationWord = /^(thế|the|vậy|vay|thì|thi)\s/.test(text.trim());
  const hasPriceInQuestion = /\d+\.?\d*\s*triệu/.test(text);
  
  // Nếu có từ tiếp nối (thế, vậy, thì) và có giá, và có sản phẩm đã gợi ý trước đó
  // thì có thể là hỏi về sản phẩm đã gợi ý với tiêu chí mới
  if (hasContinuationWord && hasPriceInQuestion && lastBotMessage) {
    return true; // Hỏi về sản phẩm đã gợi ý với tiêu chí mới (giá)
  }
  
  // Nếu là câu hỏi về tính chất của sản phẩm đã gợi ý (ví dụ: "đây có phải hương cam đâu")
  if (isPropertyQuestion && lastBotMessage) {
    return true;
  }
  
  // Nếu có pattern "X sản phẩm đó" - chắc chắn là hỏi về sản phẩm đã gợi ý
  if (hasNumberWithReference && lastBotMessage) {
    return true;
  }
  
  return (hasReference || hasNumber || isPropertyQuestion) && !!lastBotMessage;
};

// Xử lý message KHÔNG lưu vào DB (chỉ xử lý AI và trả về)
const processMessageWithoutSaving = async (sessionId, userMessageText, recentMessagesFromClient = []) => {
  // 1. Tách filter cơ bản từ message
  const extractedFilters = extractFiltersFromMessage(userMessageText);
  
  // 2. Kiểm tra xem có đang hỏi về sản phẩm đã được gợi ý không
  const askingAboutPrevious = isAskingAboutPreviousProducts(userMessageText, recentMessagesFromClient);
  
  let products = [];
  
  // 3. Nếu đang hỏi về sản phẩm đã được gợi ý, lấy từ tin nhắn bot gần nhất
  if (askingAboutPrevious) {
    const lastBotMessage = recentMessagesFromClient
      .slice()
      .reverse()
      .find(msg => msg.sender === 'bot' && msg.products && msg.products.length > 0);
    
    if (lastBotMessage && lastBotMessage.products && lastBotMessage.products.length > 0) {
      // Kiểm tra xem products đã có full info hay chỉ là IDs
      const firstProduct = lastBotMessage.products[0];
      if (firstProduct && firstProduct.name) {
        // Đã có full info, dùng luôn
        products = lastBotMessage.products;
      } else {
        // Chỉ có IDs, cần populate từ database
        const productIds = lastBotMessage.products.map(p => {
          if (typeof p === 'string') return p;
          return p._id || p;
        }).filter(Boolean);
        
        if (productIds.length > 0) {
          products = await Products.find({ _id: { $in: productIds } })
            .select('name images slug sizes gender concentration description discount')
            .lean();
        }
      }
    }
  }
  
  // 4. Nếu không hỏi về sản phẩm cũ, kiểm tra xem có cần query sản phẩm mới không
  if (!askingAboutPrevious) {
    const needsProducts = hasProductIntent(userMessageText, extractedFilters);
    
    // 5. Chỉ query sản phẩm nếu thực sự cần
    if (needsProducts) {
    // Tạo query MongoDB từ filters
    const query = { isActive: true };

    // Giá (sizes.price là VNĐ, filters là triệu)
    if (extractedFilters.priceMin || extractedFilters.priceMax) {
      query['sizes.price'] = {};
      if (extractedFilters.priceMin) {
        query['sizes.price'].$gte = extractedFilters.priceMin * 1_000_000;
      }
      if (extractedFilters.priceMax) {
        query['sizes.price'].$lte = extractedFilters.priceMax * 1_000_000;
      }
    }

    // Giới tính
    if (extractedFilters.gender) {
      query.gender = extractedFilters.gender;
    }

    // Lưu hương (map đơn giản qua concentration)
    if (extractedFilters.scentDuration === 'lâu') {
      query.concentration = { $in: ['Parfum', 'Eau de Parfum'] };
    } else if (extractedFilters.scentDuration === 'vừa') {
      query.concentration = 'Eau de Toilette';
    } else if (extractedFilters.scentDuration === 'ngắn') {
      query.concentration = { $in: ['Eau de Cologne', 'Body Mist'] };
    }

    // Query sản phẩm với populate notes nếu có filter mùi hương
    const limit = extractedFilters.sortBy ? 50 : 10;
    let productsRaw;
    
    if (extractedFilters.notes && extractedFilters.notes.length > 0) {
      // Nếu có filter mùi hương, cần populate notes và filter sau
      productsRaw = await Products.find(query)
        .select('name images slug sizes gender concentration description discount')
        .populate({
          path: 'notes.top',
          populate: { path: 'group' }
        })
        .populate({
          path: 'notes.middle',
          populate: { path: 'group' }
        })
        .populate({
          path: 'notes.base',
          populate: { path: 'group' }
        })
        .limit(limit * 3) // Lấy nhiều hơn để filter sau
        .lean();
      
      // Filter theo mùi hương
      const noteKeywords = extractedFilters.notes.map(n => n.toLowerCase());
      productsRaw = productsRaw.filter(p => {
        const allNotes = [
          ...(p.notes?.top || []),
          ...(p.notes?.middle || []),
          ...(p.notes?.base || [])
        ];
        
        // Kiểm tra tên note hoặc tên noteGroup có chứa từ khóa không
        return allNotes.some(note => {
          if (!note) return false;
          const noteName = (note.name || '').toLowerCase();
          const groupName = (note.group?.name || '').toLowerCase();
          
          return noteKeywords.some(keyword => {
            // Map từ khóa đơn giản sang tên note/group thực tế
            if (keyword.includes('cam') || keyword.includes('chanh')) {
              return noteName.includes('cam') || noteName.includes('chanh') || 
                     noteName.includes('citrus') || noteName.includes('orange') ||
                     groupName.includes('cam') || groupName.includes('chanh') ||
                     groupName.includes('citrus') || groupName.includes('citrusy');
            }
            if (keyword.includes('hoa')) {
              return noteName.includes('hoa') || noteName.includes('flower') ||
                     groupName.includes('hoa') || groupName.includes('floral');
            }
            if (keyword.includes('gỗ')) {
              return noteName.includes('gỗ') || noteName.includes('wood') ||
                     groupName.includes('gỗ') || groupName.includes('woody');
            }
            if (keyword.includes('ngọt') || keyword.includes('ngot')) {
              return noteName.includes('ngọt') || noteName.includes('sweet') ||
                     groupName.includes('ngọt') || groupName.includes('sweet');
            }
            if (keyword.includes('fresh') || keyword.includes('tươi')) {
              return noteName.includes('fresh') || noteName.includes('tươi') ||
                     groupName.includes('fresh') || groupName.includes('tươi');
            }
            return noteName.includes(keyword) || groupName.includes(keyword);
          });
        });
      });
      
      // Giới hạn lại số lượng
      productsRaw = productsRaw.slice(0, limit);
    } else {
      // Không có filter mùi hương, query bình thường
      productsRaw = await Products.find(query)
        .select('name images slug sizes gender concentration description discount')
        .limit(limit)
        .lean();
    }

    // Tính giá sau discount và sort nếu cần
    let productsSorted = productsRaw.map(p => {
      const baseMinPrice = Math.min(...(p.sizes || []).map(s => s.price));
      const discount = p.discount || 0;
      const finalMinPrice = discount > 0
        ? Math.round(baseMinPrice * (1 - discount / 100))
        : baseMinPrice;
      return {
        ...p,
        _finalMinPrice: finalMinPrice
      };
    });

    // Sort theo giá nếu có yêu cầu
    if (extractedFilters.sortBy === 'expensive') {
      productsSorted = productsSorted.sort((a, b) => b._finalMinPrice - a._finalMinPrice);
    } else if (extractedFilters.sortBy === 'cheap') {
      productsSorted = productsSorted.sort((a, b) => a._finalMinPrice - b._finalMinPrice);
    } else if (extractedFilters.priceMin && extractedFilters.priceMax && 
               Math.abs(extractedFilters.priceMin - extractedFilters.priceMax) < 1) {
      // Nếu là giá cụ thể (khoảng nhỏ), ưu tiên sản phẩm gần giá yêu cầu nhất
      const targetPrice = (extractedFilters.priceMin + extractedFilters.priceMax) / 2 * 1_000_000;
      productsSorted = productsSorted.sort((a, b) => {
        const diffA = Math.abs(a._finalMinPrice - targetPrice);
        const diffB = Math.abs(b._finalMinPrice - targetPrice);
        return diffA - diffB; // Sản phẩm gần giá yêu cầu hơn sẽ đứng trước
      });
    }

      // Chỉ lấy tối đa 3 sản phẩm
      const maxProducts = extractedFilters.sortBy ? 2 : 3;
      products = productsSorted.slice(0, maxProducts).map(p => {
        const { _finalMinPrice, ...rest } = p;
        return rest;
      });
    }
  }

  // 6. Kiểm tra xem có hỏi về thông tin liên hệ không
  const isAskingContactInfo = hasContactInfoIntent(userMessageText);
  let websiteInfo = null;
  
  if (isAskingContactInfo) {
    // Lấy thông tin website từ database
    websiteInfo = await WebSiteInfoDtb.findOne().lean();
  }

  // 7. Chuyển đổi recentMessages từ client sang format cho AI (bao gồm cả thông tin sản phẩm)
  const recentMessages = recentMessagesFromClient
    .slice(-12) // Lấy 12 tin nhắn gần nhất để có đủ ngữ cảnh
    .map(msg => {
      let content = msg.text;
      // Nếu là tin nhắn bot có sản phẩm, thêm thông tin sản phẩm vào content
      if (msg.sender === 'bot' && msg.products && msg.products.length > 0) {
        const productNames = msg.products
          .filter(p => p && p.name)
          .map(p => p.name)
          .join(', ');
        if (productNames) {
          content += ` [Đã gợi ý các sản phẩm: ${productNames}]`;
        }
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: content
      };
    });

  // 8. Xác định needsProducts cho AI (không cần sản phẩm nếu đang hỏi về thông tin liên hệ)
  const needsProducts = !isAskingContactInfo && (askingAboutPrevious || (products.length > 0));

  // 9. Tạo câu trả lời bằng AI (có ngữ cảnh từ lịch sử chat và thông tin website nếu cần)
  const botText = await generateAIResponse(userMessageText, products, extractedFilters, recentMessages, needsProducts, askingAboutPrevious, websiteInfo);

  return {
    products,
    extractedFilters,
    botText
  };
};

module.exports = {
  extractFiltersFromMessage,
  processMessageWithoutSaving
};



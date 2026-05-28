const { VNPay, HashAlgorithm } = require('vnpay');
const createError = require('../helper/createError');

let vnpayClient = null;
let vnpayClientKey = '';

const resolveHashAlgorithm = () => {
    const raw = (process.env.VNP_HASH_ALGORITHM || 'SHA512').trim().toUpperCase();
    if (HashAlgorithm[raw]) return HashAlgorithm[raw];
    throw createError(500, 'VNP_HASH_ALGORITHM phải là SHA512, SHA256 hoặc MD5');
};

const getVnpayClient = () => {
    const tmnCode = (process.env.VNP_TMN_CODE || '').trim();
    const secureSecret = (process.env.VNP_HASH_SECRET || '').trim();
    const returnUrl = (process.env.VNP_RETURN_URL || '').trim();
    const hashAlgorithm = resolveHashAlgorithm();
    const cacheKey = `${tmnCode}:${secureSecret}:${hashAlgorithm}`;

    if (vnpayClient && vnpayClientKey === cacheKey) return vnpayClient;

    if (!tmnCode || !secureSecret || !returnUrl) {
        throw createError(
            500,
            'Chưa cấu hình VNPay (VNP_TMN_CODE, VNP_HASH_SECRET, VNP_RETURN_URL trong .env)'
        );
    }

    const isSandbox =
        process.env.VNP_TEST_MODE !== 'false' &&
        (process.env.VNP_URL || '').includes('sandbox');

    vnpayClient = new VNPay({
        tmnCode,
        secureSecret,
        vnpayHost: isSandbox
            ? 'https://sandbox.vnpayment.vn'
            : 'https://vnpayment.vn',
        testMode: isSandbox,
        hashAlgorithm,
        enableLog: process.env.VNP_DEBUG === 'true',
    });
    vnpayClientKey = cacheKey;

    return vnpayClient;
};

const normalizeIp = (ip) => {
    if (!ip) return '127.0.0.1';
    let raw = String(ip).split(',')[0].trim();
    if (raw.startsWith('::ffff:')) raw = raw.replace('::ffff:', '');
    if (raw === '::1' || raw.includes(':')) return '127.0.0.1';
    return raw;
};

const sanitizeOrderInfo = (text) => {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 255);
};

module.exports.createPaymentUrl = ({ orderCode, amount, orderInfo, ipAddr }) => {
    const returnUrl = (process.env.VNP_RETURN_URL || '').trim();
    const vnpay = getVnpayClient();

    const vnpAmount = Math.round(Number(amount));
    if (!Number.isFinite(vnpAmount) || vnpAmount < 5000) {
        throw createError(400, 'Số tiền thanh toán tối thiểu 5.000đ');
    }

    return vnpay.buildPaymentUrl({
        vnp_Amount: vnpAmount,
        vnp_IpAddr: normalizeIp(ipAddr),
        vnp_TxnRef: String(orderCode).trim(),
        vnp_OrderInfo: sanitizeOrderInfo(orderInfo || `Thanh toan don hang ${orderCode}`),
        vnp_ReturnUrl: returnUrl,
    });
};

module.exports.verifyReturnParams = (query) => {
    try {
        const vnpay = getVnpayClient();
        const result = vnpay.verifyReturnUrl(query);

        if (!result.isVerified) {
            return { isValid: false, message: 'Chữ ký không hợp lệ' };
        }

        return {
            isValid: true,
            isSuccess: result.isSuccess,
            orderCode: result.vnp_TxnRef,
            transactionNo: result.vnp_TransactionNo,
            responseCode: result.vnp_ResponseCode,
            message: result.isSuccess
                ? 'Thanh toán thành công'
                : `Thanh toán thất bại (mã ${result.vnp_ResponseCode})`,
        };
    } catch (err) {
        return { isValid: false, message: err.message || 'Chữ ký không hợp lệ' };
    }
};

module.exports.normalizeIp = normalizeIp;

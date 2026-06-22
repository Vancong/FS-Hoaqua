
const userRouter = require('./user.router');
const productRoutes = require('./productRoutes');
const websiteInfoRouter = require('./websiteInfo.router');
const cartRouter = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const statsRouter = require('./stats.router');
const forgotPasswordRouter = require('./forgot-password.router');
const favoriteRouter = require('./favoriteRoutes');
const chatRouter = require('./chat.router');
const voucherRoutes = require('./voucherRoutes');
const errorHandler = require('../middleware/errorHandler.middeware');

module.exports.index = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/forgot-password', forgotPasswordRouter);
    app.use('/api/products', productRoutes);
    app.use('/api/website-info', websiteInfoRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/order', orderRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/stats', statsRouter);
    app.use('/api/favorite', favoriteRouter);
    app.use('/api/chat', chatRouter);
    app.use('/api/voucher', voucherRoutes);
    app.use(errorHandler);
};

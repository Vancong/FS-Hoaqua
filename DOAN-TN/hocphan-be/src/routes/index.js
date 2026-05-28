
const userRouter=require('./user.router');
const productRouter=require('./product.router');
const brandRouter=require('./brand.router');
const noteRouter=require ('./note.router');
const noteGroupRouter=require('./noteGroup.router');
const cartRouter=require('./cart.router')
const orderRouter=require('./order.router')
const favoriteRouter=require('./favorite.router');
const voucherRouter=require('./voucher.router');
const paymentRouter=require('./payment.router')
const forgotPasswordsRouter=require('./forgot-password.router');
const websiteInfoRouter=require('./WebSiteInfo.router')
const statsRouter=require('./stats.router')
const chatRouter=require('./chat.router')
const errorHandler =require('../middleware/errorHandler.middeware');

module.exports.index= (app) =>{
    app.use('/api/user',userRouter);
    app.use('/api/product',productRouter);
    app.use('/api/brand',brandRouter)
    app.use('/api/note',noteRouter);
    app.use('/api/note-group',noteGroupRouter);
    app.use('/api/cart',cartRouter);
    app.use('/api/order',orderRouter);
    app.use('/api/favorite',favoriteRouter);
    app.use('/api/voucher',voucherRouter)
    app.use('/api/payment',paymentRouter)
    app.use('/api/forgot-password',forgotPasswordsRouter)
    app.use('/api/website-info',websiteInfoRouter);
    app.use('/api/stats',statsRouter)
    app.use('/api/chat',chatRouter)
    app.use(errorHandler);
}


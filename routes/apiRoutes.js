const route = require('express').Router();
const userCtrl = require('../controllers/userCtrl')
const otpCtrl = require('../controllers/otpCtrl')
const productCtrl = require('../controllers/productsCtrl')
const wishlistCtrl = require('../controllers/wishlistCtrl')
const orderCtrl = require('../controllers/orderCtrl')
const cartCtrl = require('../controllers/cartCtrl')
const { CheckAuthenticated, CheckNotauthenticated } = require('../middlewares/authMiddleware');
const{adminAuthenticated,adminNotAuthenticated} = require('../middlewares/adminMiddleware')
const {isBlocked} = require('../middlewares/userBlockMiddleware');
const store = require('../services/multer');
const validation = require('../middlewares/validationMiddleware');
const paymentCtrl = require('../controllers/PaymentCtrl')
const couponCtrl = require('../controllers/couponCtrl')
const walletCtrl = require('../controllers/walletCtrl')
const offerCtrl = require('../controllers/offerCtrl')


// User
route.post('/register',validation.strongPassword,userCtrl.create)
route.patch('/update',validation.strongPassword, userCtrl.updatepass)
route.post('/getotp', otpCtrl.getOtp)
route.post('/checkotp', otpCtrl.checkOtp)
route.patch('/user/changepassword',CheckAuthenticated,validation.strongPassword,userCtrl.changePassword)
route.get('/user/get/:id',userCtrl.getUser)
route.patch('/user/changeinfo',CheckAuthenticated,userCtrl.changeInfo)
route.delete('/user/address/delete/:id',CheckAuthenticated,userCtrl.deleteAddress)
route.delete('/user/cart/clear',CheckAuthenticated,cartCtrl.clearCart)
route.get('/user/cart/clearafterpurchase',CheckAuthenticated,cartCtrl.clearAfterPurchase)
route.post('/user/changeprofile',store.array('images',1),userCtrl.changeProfile)
route.post('/user/block/:id',userCtrl.block)
route.post('/user/unblock/:id',userCtrl.unblock)
route.post('/user/addtocart/:id',CheckAuthenticated,isBlocked,cartCtrl.addtoCart)
route.get('/user/getCart/:id',cartCtrl.getCart)
route.delete('/cart/delete/:id',cartCtrl.deleteCartitem)
route.patch('/cart/updatequantity/:id',cartCtrl.updateQuantity)
route.get('/user/getaddress/:id',userCtrl.getAddress)
route.post('/user/addaddress',validation.checkAddress,userCtrl.addAddress)
route.patch('/user/address/makedefault/:id',userCtrl.makeaddressDefault)
route.get('/getusers',userCtrl.getuser)
route.get('/user/cartcount/:id',userCtrl.getcartCount)

// Wishlist
route.put('/wishlist/:pid',wishlistCtrl.addtoWishlist)
route.get('/getwishlist/:id',wishlistCtrl.getWishlist)



// Product
route.get('/products',productCtrl.getProducts )
route.get('/unlistedproducts',productCtrl.unlistedProd)
route.get('/getproduct/:id',productCtrl.getProducts )
route.put('/addproducts',store.array('images',4),productCtrl.addProducts )
route.post('/addproductsfromunlisted/:id',productCtrl.addProductsfromUnlisted )
route.post('/addcategoryfromunlisted/:id',productCtrl.addategoryFromUnlisted )
route.put('/editproducts/:id',store.array('images',4),productCtrl.editProducts )
route.post('/createcategory',store.array('images',1),productCtrl.createCategory)
route.get('/getcategory',productCtrl.getCategory)
route.get('/getcategory/unlisted',productCtrl.getUnlistedCategory)
route.delete('/delete/product/:id',productCtrl.deleteProducts)
route.delete('/delete/category/:id',productCtrl.deleteCategory)
route.delete('/deleteimage',productCtrl.deleteImage)



// Order
route.get('/admin/getorders',orderCtrl.getallOrders)
route.get('/admin/getorders/userdetails',orderCtrl.getallorderwithuser)
route.post('/order/changestatus/:id/:pid',orderCtrl.changeorderStatus)
route.post('/order/cancel/:oid/:pid',CheckAuthenticated,orderCtrl.cancelOrder)
route.post('/order/return/:oid/:pid',CheckAuthenticated,orderCtrl.returnOrder)
route.get('/admin/getorder/:orderid',orderCtrl.getSingleOrder)
route.post('/checkout/:id',CheckAuthenticated,userCtrl.checkout)
route.get('/user/getorders/:userid/:orderid',orderCtrl.getOrders)
route.get('/user/getorders/products/:userid/:orderid',orderCtrl.getOrderProducts)
route.get('/user/order/success/:userid/:orderid',userCtrl.setcodSuccess)
route.get('/admin/salesreport',orderCtrl.salesReport);
route.get('/admin/ordersreportforgraph',orderCtrl.ordersreportforgraph);



// Razorpay 
route.post('/user/payment',CheckAuthenticated,paymentCtrl.payment)
route.post('/user/payment/verify',CheckAuthenticated,paymentCtrl.paymentVerification);

// Coupon
route.post('/admin/addcoupon',validation.validateCoupon,couponCtrl.addCoupon)
route.get('/getcoupon',couponCtrl.getCoupon)
route.delete('/admin/delete/coupon/:id',couponCtrl.deleteCoupon)
route.get('/getsinglecoupon/:id',couponCtrl.getSinglecoupon)
route.put('/admin/editcoupon/:id',validation.validateCoupon,couponCtrl.editCoupon)
route.post('/apply/coupon',couponCtrl.applyCoupon)
route.delete('/coupon/remove',couponCtrl.couponRemove)

// Invoice
route.get('/get/invoice/:id',orderCtrl.generateInvoice)

// Wallet
route.post('/user/wallet/addmoney',CheckAuthenticated,walletCtrl.walletaddmoney);
route.get('/user/getwallet/:id',walletCtrl.getWallet);
route.post('/user/wallet/addmoney/verify',CheckAuthenticated,walletCtrl.paymentVerification);
route.get('/user/wallet/balance/:id',walletCtrl.walletBalance)
route.put('/wallet/refund/:orderid/:pid',walletCtrl.refundtoWallet)

// Offer
route.get('/admin/getoffers',offerCtrl.showOffers)
route.post('/admin/offer/add',adminAuthenticated,validation.validateOffer,offerCtrl.createOffer)
route.put('/admin/offer/edit/:id',adminAuthenticated,offerCtrl.editOffer)
route.delete('/admin/offer/remove/:id',adminAuthenticated,offerCtrl.removeOffer)

module.exports = route
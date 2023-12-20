const route = require('express').Router();
const productCtrl = require('../controllers/productsCtrl')
const productRender = require('../services/productRender')
const userRender=require('../services/userRender')
const session = require('express-session')
const { CheckAuthenticated, CheckNotauthenticated } = require('../middlewares/authMiddleware');
const {isBlocked} = require('../middlewares/userBlockMiddleware');





route.get('/',userRender.homepage,)
route.get('/login', CheckNotauthenticated,userRender.login)
route.get('/register', CheckNotauthenticated,userRender.register)
route.get('/forgotpass',CheckNotauthenticated,userRender.forgotpass)
route.get('/changepassword',CheckNotauthenticated,userRender.changepassword)
route.get('/newaccount',CheckNotauthenticated,userRender.newaccount)
route.get('/otpreg',CheckNotauthenticated,userRender.otpreg)
route.get('/otpregfpass',CheckNotauthenticated,userRender.otpregfpass)
route.post('/logout',userRender.logout)
route.get('/products',productRender.productsbyCategory)
route.get('/sproduct/:id',productCtrl.singlepdtRender)
route.get('/account',CheckAuthenticated,userRender.userAccount)
route.get('/cart',CheckAuthenticated,isBlocked,userRender.cart)
route.get('/checkout',CheckAuthenticated,isBlocked,userRender.checkoutPage)
route.post('/checkout',CheckAuthenticated,isBlocked,userRender.paymentCheck)
route.get('/ordersummary/:type',CheckAuthenticated,isBlocked,userRender.orderSummary)
route.get('/manageaddress',CheckAuthenticated,isBlocked,userRender.manageAddress)
route.get('/myorders',CheckAuthenticated,isBlocked,userRender.userOrders)
route.get('/editaccount',CheckAuthenticated,isBlocked,userRender.editAccount)
route.get('/orders/:id',CheckAuthenticated,isBlocked,userRender.orderitemInfo)




module.exports = route;
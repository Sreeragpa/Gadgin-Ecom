const route = require('express').Router();
const adminRender = require('../services/adminRender')
const productRender = require('../services/productRender')
const {adminAuthenticated,adminNotAuthenticated} = require('../middlewares/adminMiddleware')
// Route /admin/..
const store = require('../services/multer');
route.get('/',adminAuthenticated,adminRender.admindash)
route.get('/login',adminNotAuthenticated,adminRender.loginpage)
route.post('/login',adminNotAuthenticated,adminRender.loginvalidate)
route.get('/logout',adminRender.logout)
route.get('/productmgmt',adminAuthenticated,productRender.productmanagement)
route.get('/productmgmt/unlisted',adminAuthenticated,productRender.Unlistedproductmanagement)
route.get('/addproduct',adminAuthenticated,productRender.addproductform)
route.get('/addcategory',adminAuthenticated,productRender.addCategory)
route.get('/categorymgmt',adminAuthenticated,productRender.categoryManagement)
route.get('/categorymgmt/unlisted',adminAuthenticated,productRender.unlistedCategorymgmt)
route.get('/usermgmt',adminAuthenticated,adminRender.usermgmt)
route.get('/getproduct/:id',productRender.getProductdetails)
route.get('/ordermgmt',adminAuthenticated,adminRender.ordermgmt)
route.get('/ordermgmt/:id',adminAuthenticated,adminRender.ordersmgmtsingle)





module.exports = route
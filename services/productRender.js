const axios = require('axios');
const store = require('../services/multer');


exports.productmanagement = (req, res, next) => {
    axios.get(`http://localhost:${process.env.PORT}/api/products`)
        .then(function (response) {
            res.render('adminproductmgmt.ejs', { products: response.data })
        })
        .catch((error) => {
            next(error)
        })

}
exports.Unlistedproductmanagement = (req, res, next) => {
    axios.get(`http://localhost:${process.env.PORT}/api/unlistedproducts`)
        .then(function (response) {
            res.render('adminUnlistedproductmgmt.ejs', { products: response.data })
        })
        .catch((error) => {
            next(error)
        })

}

exports.addproductform = (req, res, next) => {
    axios.get(`http://localhost:${process.env.PORT}/api/getcategory`)
        .then(function (response) {
            res.render('adminaddproductform.ejs', { categories: response.data })
        })
        .catch((error) => {
            next(error)
        })
}



exports.addCategory = async (req, res) => {
    res.render('adminaddcategory.ejs')
}

exports.unlistedCategorymgmt = async (req, res, next) => {
    try {
        const response = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory/unlisted`)
        res.render("adminUnlistedcategorymgmt.ejs", { categories: response.data })
    } catch (error) {
        next(error)
    }

}


exports.categoryManagement = async (req, res, next) => {
    try {
        const response = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory`)

        if (response) {
            res.render('admincategorymgmt.ejs', { categories: response.data })
        }
    } catch (error) {
        next(error)
    }

}

exports.productsbyCategory = async (req, res,next) => {
    const userid = req.session?.passport?.user;
    let wishlistset=new Set();
    if(userid){
        const cartcount =  await axios.get(`http://localhost:${process.env.PORT}/api/user/cartcount/${userid}`);
         const wishlist = await axios.get(`http://localhost:${process.env.PORT}/api/getwishlist/${userid}`);
        req.flash('cartcount',cartcount.data.itemCount);
        if(wishlist.data){
            wishlistset = new Set(wishlist.data[0].products);
        }
    }
    if (req.query.category) {
        if(req.query.sortBy){
            axios.get(`http://localhost:${process.env.PORT}/api/products?category=${req.query.category}&sortBy=${req.query.sortBy}`)
            .then(function (response) {
                if (!response.data) {
                    res.send("No products")
                } else {
   
                    res.render('productpage.ejs', { products: response.data, isInCart: null,wishlist:wishlistset })
                }

            }).catch(error => {
                next(error)
            })
        }else{

            axios.get(`http://localhost:${process.env.PORT}/api/products?category=${req.query.category}`)
                .then(function (response) {
                    if (!response.data) {
                        res.send("No products")
                    } else {
           
                        res.render('productpage.ejs', { products: response.data, isInCart: null,wishlist:wishlistset })
                    }
    
                }).catch(error => {
                    next(error)
                })
        }
    } else if(req.query.search){
        
        axios.get(`http://localhost:${process.env.PORT}/api/products?search=${req.query.search}`)
        .then(function (response) {
            if (!response.data) {
                res.send("No products")
            } else {
              
                res.render('productpage.ejs', { products: response.data, isInCart: null ,wishlist:wishlistset})
            }

        }).catch(error => {
            next(error)
        })
    }else{
        axios.get(`http://localhost:${process.env.PORT}/api/products`)
        .then(function (response) {
   
            res.render('productpage.ejs', { products: response.data, isInCart: null ,wishlist:wishlistset})
        }).catch(err => {
            next(error)
        })
    }
}

exports.getProductdetails = async (req, res, next) => {
    axios.all([
        axios.get(`http://localhost:${process.env.PORT}/api/getproduct/${req.params.id}`),
        axios.get(`http://localhost:${process.env.PORT}/api/getcategory`)
    ])

        .then(axios.spread((response1, response2) => {
            res.render('admineditproductform.ejs', { product: response1.data, categories: response2.data })
        }))
        .catch((error)=>{
            next(error)
        })
}
const axios = require('axios');
const Productdb = require('../models/productModel')

const store = require('../services/multer');
const Categorydb = require('../models/categoryModel');

const fs = require('fs');
const path = require('path');
const { log } = require('console');
const Cartdb = require('../models/cartModel');
exports.getProducts = async (req, res, next) => {
    if (req.query.category) {
        if (req.query.sortBy) {
            try {
                const category = (req.query.category == "all") ? "" : req.query.category;
                const sortby = (req.query.sortBy == "priceLowToHigh") ? 1 : -1;
                const products = await Productdb.find({ category: { $regex: new RegExp(category, 'i') }, unlisted: false }).sort({ price: sortby }).populate('offer')
                if (products.length === 0) {
                    const nop = false;
                    res.send();
                } else {

                    res.send(products)
                }
            } catch (error) {
                const err = {
                    status: 500
                    
                }
                console.error("Error in getProductcategory:", error);
                next(err)
               
            }
        } else {

            try {
                const category = req.query.category;
                const products = await Productdb.find({ category: { $regex: new RegExp(category, 'i') }, unlisted: false }).populate('offer')
                if (products.length === 0) {
                    const nop = false;
                    res.send();
                } else {
                    res.send(products)
                }
            } catch (error) {
                const err = {
                    status: 500
                }
                console.error("Error in getProductcategory:", error);
                next(err)
               
            }
        }


    } else if (req.params.id) {
        try {
            const id = req.params.id
            const response = await Productdb.findOne({ _id: id, unlisted: false }).populate('offer')
            res.send(response)
        } catch (error) {
            const err = {
                status: 500
            }
            console.error("Error in getProductsingle:", error);
            next(err)
           
        }
    }
    else if (req.query.search) {
        try {
            const products = await Productdb.find({
                unlisted: false,
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { category: { $regex: req.query.search, $options: 'i' } },

                ]
            }).populate('offer');

            res.send(products)
        } catch (error) {
            const err = {
                status: 500
            }
            console.error("Error in getProducts:", error);
            next(err)
           
        }
    } else {
        try {
            const products = await Productdb.find({ unlisted: false }).populate('offer');
            res.send(products)
        } catch (error) {
            const err = {
                status: 500
            }
            console.error("Error in getProducts:", error);
            next(err)
           
        }
    }

}

exports.singlepdtRender = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userid = req.session.passport?.user;
        let isInCart = null;
        let wishlistset = new Set();

        const response = await Productdb.findById(req.params.id).populate('offer');
        if (userid) {
            const cartcount = await axios.get(`http://localhost:${process.env.PORT}/api/user/cartcount/${userid}`);

            isInCart = await Cartdb.findOne({ userid: userid, 'cartitems.productid': id });
            const wishlist = await axios.get(`http://localhost:${process.env.PORT}/api/getwishlist/${userid}`);

            wishlistset = new Set(wishlist.data[0].products);
            req.flash('cartcount', cartcount.data.itemCount);

        }
        res.render('singleproductpage.ejs', { product: response, isInCart: isInCart, wishlist: wishlistset });

    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error fetching product from external API:', error);
        next(err)
        // res.status(500).send('Internal Server Error');
    }
}

exports.unlistedProd = async (req, res, next) => {
    try {
        const unlistedproducts = await Productdb.find({ unlisted: true });
        res.send(unlistedproducts)
    } catch (error) {
        const err = {
            status: 500
        }
        console.error("Error in unlistedProd:", error);
        next(err)
       
    }

}

exports.addProducts = async (req, res, next) => {
    try {
        const files = req.files;
        imag = files.map((file) => {
            return "/uploads/" + file.filename
        })

        const newProduct = new Productdb({
            name: req.body.name,
            mrp: req.body.mrp,
            price: req.body.price,
            discount: req.body.discount,
            category: req.body.category,
            description: req.body.description,
            brand: req.body.brand,
            color: req.body.color,
            quantity: req.body.quantity,
            images: imag
        })
        product = await newProduct.save()
        res.redirect('/admin/productmgmt')
    } catch (error) {
        const err = {
            status: 500
        }
        console.error("Error in addProducts:", error);
        next(err)
       
    }



}

exports.addProductsfromUnlisted = async (req, res, next) => {
    try {
        const id = req.params.id;
        const addsuccess = await Productdb.findOneAndUpdate({ _id: id }, { $set: { unlisted: false } });
        if (addsuccess) {
            res.redirect('/admin/productmgmt')
        } else {
            res.send("Error deleting")
        }
    } catch (error) {
        const err = {
            status: 500
        }
        console.error("Error in addProductsfromUnlisted:", error);
        next(err)
       
    }


}

exports.addategoryFromUnlisted = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await Categorydb.findOneAndUpdate({ _id: id }, { $set: { unlisted: false } }, { new: true })
        res.redirect('/admin/categorymgmt');
    } catch (error) {
        const err = {
            status: 500
        }
        console.error("Error in addcategoryFromUnlisted:", error);
        next(err)
       
    }

}

exports.editProducts = async (req, res, next) => {
    try {
        id = req.params.id;
        const files = req.files;
        let imag;
        if (files) {
            imag = files.map((file) => {
                return "/uploads/" + file.filename
            })

        }

        let updateFields = {
            name: req.body.name,
            mrp: req.body.mrp,
            price: req.body.price,
            discount: req.body.discount,
            category: req.body.category,
            description: req.body.description,
            brand: req.body.brand,
            color: req.body.color,
            quantity: req.body.quantity,
        };
        if (imag && imag.length > 0) {
            await Productdb.findByIdAndUpdate({ _id: id }, { $push: { images: imag } }, { new: true });
        }
        updatedProduct = await Productdb.findByIdAndUpdate({ _id: id }, { $set: updateFields }, { new: true });
        res.redirect('/admin/productmgmt')
    } catch (error) {
        const err = {
            status: 500
        }
        console.error("Error in editProducts:", error);
        next(err)
       
    }

}

exports.deleteProducts = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deletesuccess = await Productdb.findOneAndUpdate({ _id: id }, { $set: { unlisted: true } });

        if (deletesuccess) {
            res.status(200).redirect('/admin/productmgmt');
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error deleting product:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }

}

exports.deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;


        const result = await Categorydb.findOneAndUpdate({ _id: id }, { $set: { unlisted: true } }, { new: true })


        if (result) {
            res.status(200).redirect('/admin/categorymgmt');
        } else {

            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error deleting Category:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }

}


exports.deleteImage = async (req, res, next) => {

    try {
        const productid = req.query.pid;
        const index = req.query.index;
        const product = await Productdb.findById(productid);
        const img = product.images[index];
        product.images.splice(index, 1);
        imgfilepath = path.join(__dirname, '../' + '/public' + img)
        const updatedProduct = await product.save();
        const category = await Categorydb.find()
        res.render('admineditproductform.ejs', { product: updatedProduct, categories: category })
    }
    catch (error) {
        const err = {
            status: 500,
            message:"Internal Server Error"
        }
        console.error('Error deleteImage:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        cat = req.body.category;
        cat = cat.toLowerCase();

        const categories = await Categorydb.findOne({ categoryName: cat })


        if (categories) {

            res.render('adminaddcategory.ejs', { messages: { error: "Category Exists" } })
        } else {
            const files = req.files;

            imag = "/uploads/" + files[0].filename;


            const newCate = new Categorydb({
                categoryName: cat,
                images: imag
            })
            result = await newCate.save()
            res.redirect('/admin/categorymgmt')
        }
    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error createCategory:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }


}

exports.getCategory = async (req, res, next) => {
    try {
        const categories = await Categorydb.find({ unlisted: false })
        res.send(categories)
    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error getCategory:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }

}
exports.getUnlistedCategory = async (req, res, next) => {
    try {
        const categories = await Categorydb.find({ unlisted: true })
        res.send(categories)
    } catch (error) {
        const err = {
            status: 500
        }
        console.error('Error getUnlistedCategory:', error);
        next(err)
        // res.status(500).json({ message: 'Internal Server Error' });
    }

}

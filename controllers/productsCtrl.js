const axios = require('axios');
const Productdb = require('../models/productModel')

const store = require('../services/multer');
const Categorydb = require('../models/categoryModel');

const fs = require('fs');
const path = require('path');
const { log } = require('console');
const Cartdb = require('../models/cartModel');
exports.getProducts = async (req, res) => {
    if (req.query.category) {
        if(req.query.sortBy){
            try {
                const category = (req.query.category=="all")?"":req.query.category;
                const sortby = (req.query.sortBy=="priceLowToHigh")?1:-1;
                const products = await Productdb.find({ category: { $regex: new RegExp(category, 'i') },unlisted: false }).sort({price:sortby})
                if (products.length === 0) {
                    const nop = false;
                    res.send();
                } else {
                    res.send(products)
                }
            } catch (error) {
                console.error("Error in getProductcategory:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        }else{

            try {
                const category = req.query.category;
                const products = await Productdb.find({ category: { $regex: new RegExp(category, 'i') },unlisted: false })
                if (products.length === 0) {
                    const nop = false;
                    res.send();
                } else {
                    res.send(products)
                }
            } catch (error) {
                console.error("Error in getProductcategory:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        }


    } else if (req.params.id) {
        try {
            const id = req.params.id
            const response = await Productdb.findOne({ _id: id, unlisted: false })
            res.send(response)
        } catch (error) {
            console.error("Error in getProductsingle:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    }
    else if(req.query.search){
        try {
            const products = await Productdb.find({
                unlisted: false,
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
        
                ]
            });
            console.log(products);
            res.send(products)
        } catch (error) {
            console.error("Error in getProducts:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    }else{
        try {
            const products = await Productdb.find({ unlisted: false });
            res.send(products)
        } catch (error) {
            console.error("Error in getProducts:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    }
    // if(req.query.search){
    //     const name = req.query.search;
    //     console.log(name);
    //     const products = await Productdb.find({name:name});
    //     res.send(products)
    // }


}

exports.singlepdtRender = async (req, res) => {
    try {
        const id = req.params.id;
        const userid = req.session.passport?.user;
        let isInCart = null;
        let wishlistset=new Set();

        const response = await Productdb.findById(req.params.id);
        if (userid) {
            const cartcount =  await axios.get(`http://localhost:${process.env.PORT}/api/user/cartcount/${userid}`);

            isInCart = await Cartdb.findOne({ userid: userid, 'cartitems.productid': id });
            const wishlist = await axios.get(`http://localhost:${process.env.PORT}/api/getwishlist/${userid}`);
            
             wishlistset = new Set(wishlist.data[0].products);
             req.flash('cartcount',cartcount.data.itemCount);

        }
        res.render('singleproductpage.ejs', { product: response, isInCart: isInCart,wishlist:wishlistset });

    } catch (error) {
        console.error('Error fetching product from external API:', error.message);
        res.status(500).send('Internal Server Error');
    }
}

exports.unlistedProd = async (req, res) => {
    try {
        const unlistedproducts = await Productdb.find({ unlisted: true });
        res.send(unlistedproducts)
    } catch (error) {
        console.error("Error in unlistedProd:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.addProducts = async (req, res) => {
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
        console.error("Error in addProducts:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }



}

exports.addProductsfromUnlisted = async (req, res) => {
    try {
        const id = req.params.id;
        const addsuccess = await Productdb.findOneAndUpdate({ _id: id }, { $set: { unlisted: false } });
        if (addsuccess) {
            res.redirect('/admin/productmgmt')
        } else {
            res.send("Error deleting")
        }
    } catch (error) {
        console.error("Error in addProductsfromUnlisted:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }


}

exports.addategoryFromUnlisted = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Categorydb.findOneAndUpdate({_id:id},{$set:{unlisted:false}},{ new: true })
        res.redirect('/admin/categorymgmt');
    } catch (error) {
        console.error("Error in addcategoryFromUnlisted:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.editProducts = async (req, res) => {
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
        console.error("Error in editProducts:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.deleteProducts = async (req, res) => {
    try {
        const id = req.params.id;
        const deletesuccess = await Productdb.findOneAndUpdate({ _id: id }, { $set: { unlisted: true } });

        if (deletesuccess) {
            res.status(200).redirect('/admin/productmgmt');
        } else {
            console.log('Product not found.');
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);

        const result = await Categorydb.findOneAndUpdate({_id:id},{$set:{unlisted:true}},{ new: true })


        if (result) {
            res.status(200).redirect('/admin/categorymgmt');
        } else {
            console.log('Category not found.');
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error deleting Category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}


exports.deleteImage = async (req, res) => {

    try {
        const productid = req.query.pid;
        const index = req.query.index;
        const product = await Productdb.findById(productid);
        const img = product.images[index];
        product.images.splice(index, 1);
        imgfilepath = path.join(__dirname, '../' + '/public' + img)
      
        // fs.unlink(imgfilepath, (err) => {
        //     if (err) {
        //         console.log(err);
        //     }
        // })
        const updatedProduct = await product.save();
        const category = await Categorydb.find()
        res.render('admineditproductform.ejs', { product: updatedProduct, categories: category })
    }
    catch (err) {
        console.error('Error deleteImage:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.createCategory = async (req, res) => {
    try {
        cat = req.body.category;
        cat = cat.toLowerCase();

        const categories = await Categorydb.findOne({ categoryName: cat })


        if (categories) {

            res.render('adminaddcategory.ejs', { messages: { error: "Category Exists" } })
        } else {
            const files = req.files;
            // console.log(files);
            imag = "/uploads/" + files[0].filename;


            const newCate = new Categorydb({
                categoryName: cat,
                images: imag
            })
            result = await newCate.save()
            res.redirect('/admin/categorymgmt')
        }
    } catch (error) {
        console.error('Error createCategory:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

exports.getCategory = async (req, res) => {
    try {
        const categories = await Categorydb.find({unlisted:false})
        res.send(categories)
    } catch (error) {
        console.error('Error getCategory:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}
exports.getUnlistedCategory = async (req, res) => {
    try {
        const categories = await Categorydb.find({unlisted:true})
        res.send(categories)
    } catch (error) {
        console.error('Error getUnlistedCategory:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

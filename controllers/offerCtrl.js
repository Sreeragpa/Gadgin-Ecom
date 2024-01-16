const Offerdb = require('../models/offerModel');
const Productdb = require('../models/productModel')
const axios = require('axios');
const { validationResult } = require('express-validator');

exports.createOffer = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Errors = errors.array();
        Errors.forEach((errelem) => {
            req.flash(errelem.path + 'error', errelem.msg)
        })
        const referer = req.get('referer');
        return res.redirect(referer);
    }else{
        const category = req.body.category;
        const product = req.body.product || 'all';
        const productquery = req.body.product || '';
        const categoryquery = (req.body.category == 'all') ? '' : req.body.category;
        const discount = req.body.discount;
        const date = req.body.offerexpiry;
        try {
            const offer = new Offerdb({
                category: category,
                product: product,
                discount: discount,
                offerexpiry: date,
            });
        
            await offer.save();
            const updateproduct = await Productdb.updateMany({
                brand: { $regex: productquery, $options: 'i' },
                category: { $regex: categoryquery, $options: 'i' }
            },
                {
                    $set: {
                        offer: offer._id
                    },
        
                },
                {
                    new: true
                }
        
            );
        
            res.redirect('/admin/offermgmt')
        
        } catch (error) {
            next(error)
        }
    }


   
}
exports.showOffers = async (req, res, next) => {
    try {
        if (req.query.id) {
            const offers = await Offerdb.findById(req.query.id);
            res.send(offers)
        } else {
            const offers = await Offerdb.find();
            res.send(offers)
        }
    
    } catch (error) {
        next(error)
    }

}

exports.removeOffer = async (req, res, next) => {
    try {
        const id =req.params.id;
        await Offerdb.deleteOne({_id:id});
        res.redirect('/admin/offermgmt')
    } catch (error) {
        next(error)
    }

}
exports.editOffer = async (req, res, next) => {
        const id =req.params.id;
        const category = req.body.category;
        const product = req.body.product || 'all';
        const productquery = req.body.product || '';
        const categoryquery = (req.body.category == 'all') ? '' : req.body.category;
        const discount = req.body.discount;
        const date = req.body.offerexpiry;
        try {
            
        const result = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getoffers?id=${id}`)

        let {category:prevcategory ,product:prevproduct} = result.data;
        if(prevcategory == 'all'){
            prevcategory=''
        }
        if(prevproduct == 'all'){
            prevproduct=''
        }
    
        await Productdb.updateMany({
            brand: { $regex: prevproduct, $options: 'i' },
            category: { $regex: prevcategory, $options: 'i' }
        },
            {
                $set: {
                    offer: null
                },
    
            },
            {
                new: true
            }
    
        );



        const offer = await Offerdb.findOneAndUpdate(
            {_id:id},
            {$set:{
                category: category,
                product: product,
                discount: discount,
                offerexpiry: date,
            }},
            {
                new: true
            }
            )

    
    
      
        const updateproduct = await Productdb.updateMany({
            brand: { $regex: productquery, $options: 'i' },
            category: { $regex: categoryquery, $options: 'i' }
        },
            {
                $set: {
                    offer: offer._id
                },
    
            },
            {
                new: true
            }
    
        );

        res.redirect('/admin/offermgmt')
        } catch (error) {
            next(error)
        }

    

   
}
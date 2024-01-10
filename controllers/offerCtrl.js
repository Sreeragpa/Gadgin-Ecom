const Offerdb = require('../models/offerModel');
const Productdb = require('../models/productModel')
exports.createOffer = async(req,res)=>{
    const category = req.body.category;
    const product = req.body.product || 'all';
    const productquery = req.body.product || '';
    const categoryquery = (req.body.category=='all')?'':req.body.category;
    const discount = req.body.discount;
    const date = req.body.offerexpiry;
    console.log(date);
    const offer = new Offerdb({
        category:category,
        product:product,
        discount:discount,
        offerexpiry:date,
    });

    await offer.save();
    console.log(productquery,categoryquery);

    const updateproduct = await Productdb.updateMany({
        brand: { $regex: productquery, $options: 'i' },
        category: { $regex: categoryquery, $options: 'i' }
    },
    {
        // $inc:{
        //     discount:discount,
        //     price:-
        // }
    }
    
    
    );
    
    console.log(updateproduct);

}
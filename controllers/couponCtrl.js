const Coupondb = require('../models/couponModel');
const {validationResult} = require('express-validator');
const Orderdb = require('../models/orderModel');
const { login } = require('../services/userRender');

exports.addCoupon = async (req, res) => {
    // Add Coupon body Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Errors = errors.array();
        Errors.forEach((errelem) => {

            req.flash(errelem.path + 'error', errelem.msg)
        })
        const referer = req.get('referer');
        res.redirect(referer);
    } else {
        // Finding Coupon with the provided coupon code
        const couponcode = req.body.couponcode.toUpperCase();
        const existing = await Coupondb.findOne({ couponcode: couponcode });
        if (existing) {  
            // If the coupon code entered already exists, User is redirected with flash message

            req.flash('couponexists', "Coupon already exists");
            const referrer = req.get('Referrer');
            res.redirect(referrer)
        } else {
            // If the Coupon Code is Unique. Adding the coupon to the database

            const priceabove = (!req.body.priceabove) ? 1 : req.body.priceabove;
            const pricebelow = (!req.body.pricebelow) ? Infinity : req.body.pricebelow;
            const couponcount = (!req.body.couponcount) ? Infinity : req.body.couponcount;

            const newcoupon = new Coupondb({
                couponcode: req.body.couponcode.toUpperCase(),
                coupondiscount: req.body.coupondiscount,
                couponcount: couponcount,
                couponexpiry: req.body.couponexpiry,
                'offertype.category': req.body.category,
                'offertype.priceabove': priceabove,
                'offertype.pricebelow': pricebelow,
            })
            await newcoupon.save();
    
            req.flash('success',"Coupon Added")
            res.redirect('/admin/couponmgmt')
        }
    }

}

exports.getCoupon = async (req, res) => {
    // Fetching all coupons from the database
    const coupons = await Coupondb.find();
    res.send(coupons)
}

exports.deleteCoupon = async (req, res) => {
    // Deleting a particular coupon by the id of the document
    const result = await Coupondb.findByIdAndDelete(req.params.id);
    if (result) {
        res.redirect('/admin/couponmgmt');
    }
}

exports.getSinglecoupon = async(req,res)=>{
    // Fetching a particular coupon detail
    const coupons = await Coupondb.findOne({_id:req.params.id});

    res.send(coupons);

}

exports.editCoupon = async (req, res) => {
    // Edit Coupon Validation 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Errors = errors.array();
        Errors.forEach((errelem) => {
            req.flash(errelem.path + 'error', errelem.msg)
        })
        const referer = req.get('referer');
        res.redirect(referer);
    } else {
        const id = req.params.id;
        const couponcode = req.body.couponcode.toUpperCase();
        // finding whether the coupon code already exists in coupondb
        const existing = await Coupondb.findOne({ couponcode: couponcode });
        
        if (existing?._id!=id) {
            // If the couponcode exists, but the coupon document id is different ,the couponcode already exists for other document which means duplicated couponcodes ,So redirecting with a flash message.

            req.flash('couponexists', "Coupon already exists");
            const referrer = req.get('Referrer');
            res.redirect(referrer)
       
        } else {
            // If there is no exisiting coupons or if the exisiting coupon has the document id same of the editing coupon , then we can edit the couponwith the coupon code

            const priceabove = (!req.body.priceabove) ? 1 : req.body.priceabove;
            const pricebelow = (!req.body.pricebelow) ? Infinity : req.body.pricebelow;
            const couponcount = (!req.body.couponcount) ? Infinity : req.body.couponcount;

            const result = await Coupondb.findOneAndUpdate({_id:id},{$set:{  couponcode: req.body.couponcode.toUpperCase(),
                coupondiscount: req.body.coupondiscount,
                couponcount: couponcount,
                couponexpiry: req.body.couponexpiry,
                'offertype.category': req.body.category,
                'offertype.priceabove': priceabove,
                'offertype.pricebelow': pricebelow,}})

            req.flash('success',"Coupon Added")
            res.redirect('/admin/couponmgmt')
        }
    }

}

exports.applyCoupon = async(req,res)=>{
    // Applying Coupon in the Checkout Page 
    const pendingorderid = req.session.pendingorderid;
    const couponcode = (req.body.couponcode).toUpperCase();

    const isCoupon = await Coupondb.findOne({couponcode:couponcode});

    // Code for Invalid Coupon
    if(!isCoupon){
        return res.json({error:"Invalid Coupon"})
    }


    // Conditions if Coupon is Valid
        const order = await Orderdb.findOne({_id:pendingorderid});
        const couponcategory = isCoupon.offertype.category;
        const coupondiscount = isCoupon.coupondiscount;
        const orderabove = isCoupon.offertype.priceabove;

    
        const couponExpiryDate = new Date(isCoupon.couponexpiry);
    // Checking Coupon Expiry
        if(couponExpiryDate<Date.now() || isCoupon.couponcount==0){
            res.json({error:"Coupon Expired"})
        }
        // Conditions if Coupon is a category coupon
        else if(couponcategory!='all'){
            const findcategory = order.orderitems.some((item)=>{
                if(item.category==couponcategory){
                    return true
                }
            })
          
            if(!findcategory){
                res.json({error:"Cannot be applied"})
            }else{
        
                const totalapplied = order.orderitems.reduce((sum,product)=>{
                    if(product.category==couponcategory){
                        return sum+=product.price;
                    }
                    return sum;
                },0);
           
                const totaldiscount = totalapplied*(isCoupon.coupondiscount/100);
                const finalvalue = Number(order.ordervalue - totaldiscount)

                // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
                if(orderabove>order.ordervalue){
                    return res.json({error:"Cannot be applied"})
                }
                await applyCouponinOrder(finalvalue,totaldiscount,coupondiscount,res);
       
            }
        }
        else{
        //   Logic for:  If Coupon can be applied to all categories
            const totaldiscount = order.ordervalue*(isCoupon.coupondiscount/100);
            const finalvalue = Number(order.ordervalue - totaldiscount);
             // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
            if(orderabove>order.ordervalue){
                return res.json({error:"Cannot be applied"})
            }
            await applyCouponinOrder(finalvalue,totaldiscount,coupondiscount,res)
 
        }

        // Function for applying coupon in the Orderdb 
        async function applyCouponinOrder(finalvalue,totaldiscount,coupondiscount,res){
            const finalv = parseInt(finalvalue)
            await Orderdb.findOneAndUpdate({_id:pendingorderid},{$set:{appliedcoupon:couponcode,finalvalue:finalv,coupondiscount:coupondiscount}})
            res.json({couponcode:couponcode,coupondiscount:coupondiscount,totaldiscount:totaldiscount})
        }
        

}

exports.couponRemove = async(req,res)=>{
    // Removing the coupon from the orderdb when user remove the coupon from the checkout page
    
    const pendingorderid = req.session.pendingorderid;

    const order = await Orderdb.findOne({_id:pendingorderid},{ordervalue:1})
    await Orderdb.findOneAndUpdate({_id:pendingorderid},{$set:{finalvalue:order.ordervalue,appliedcoupon:null}});
    res.send('success');
}
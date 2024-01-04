const Coupondb = require('../models/couponModel');
const {validationResult} = require('express-validator');
const Orderdb = require('../models/orderModel');

exports.addCoupon = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Errors = errors.array();
        Errors.forEach((errelem) => {

            req.flash(errelem.path + 'error', errelem.msg)
        })
        const referer = req.get('referer');
        res.redirect(referer);
    } else {
        const couponcode = req.body.couponcode;
        const existing = await Coupondb.findOne({ couponcode: couponcode });
        if (existing) {
            req.flash('couponexists', "Coupon already exists");
            res.send("Coupon already exists")
        } else {

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
            // const referrer = req.get('Referrer');
            req.flash('success',"Coupon Added")
            res.redirect('/admin/couponmgmt')
        }
    }

}

exports.getCoupon = async (req, res) => {
    const coupons = await Coupondb.find();
    res.send(coupons)
}

exports.deleteCoupon = async (req, res) => {
    const result = await Coupondb.findByIdAndDelete(req.params.id);
    if (result) {
        res.redirect('/admin/couponmgmt');
    }
}

exports.getSinglecoupon = async(req,res)=>{
    const coupons = await Coupondb.findOne({_id:req.params.id});

    res.send(coupons);

}

exports.editCoupon = async (req, res) => {
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
        const couponcode = req.body.couponcode;
        const existing = await Coupondb.findOne({ couponcode: couponcode });
        
        if (existing?._id!=id) {
            req.flash('couponexists', "Coupon already exists");
            const referrer = req.get('Referrer');
            res.redirect(referrer)
       
        } else {

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
    const pendingorderid = req.session.pendingorderid;
    const couponcode = (req.body.couponcode).toUpperCase();

    const isCoupon = await Coupondb.findOne({couponcode:couponcode});

    if(!isCoupon){
        return res.json({error:"Invalid Coupon"})
    }

        const order = await Orderdb.findOne({_id:pendingorderid});
        const couponcategory = isCoupon.offertype.category;
        const coupondiscount = isCoupon.coupondiscount;
        console.log(isCoupon);
    
        const couponExpiryDate = new Date(isCoupon.couponexpiry);

        if(couponExpiryDate<Date.now() || isCoupon.couponcount==0){
            res.json({error:"Coupon Expired"})
        }
        else if(couponcategory!='all'){
            const findcategory = order.orderitems.some((item)=>{
                if(item.category==couponcategory){
                    return true
                }
            })
          
            if(!findcategory){
                res.json({error:"Cannot be applied"})
            }else{
                await applyCouponinOrder();
                const totalapplied = order.orderitems.reduce((sum,product)=>{
                    if(product.category==couponcategory){
                        return sum+=product.price;
                    }
                    return sum;
                },0);
                console.log('totalapplied'+totalapplied);
                const totaldiscount = totalapplied*(isCoupon.coupondiscount/100);
                const finalvalue = Number(order.ordervalue - totaldiscount)
                await applyCouponinOrder(finalvalue);
                res.json({couponcode:couponcode,coupondiscount:coupondiscount,totaldiscount:totaldiscount})
            }
        }
        else{
            console.log(order.orderitems);

            const totaldiscount = order.ordervalue*(isCoupon.coupondiscount/100);
            const finalvalue = Number(order.ordervalue - totaldiscount);
            await applyCouponinOrder(finalvalue)
            res.json({couponcode:couponcode,coupondiscount:coupondiscount,totaldiscount:totaldiscount})
        }

        async function applyCouponinOrder(finalvalue){
            const finalv = parseInt(finalvalue)
            await Orderdb.findOneAndUpdate({_id:pendingorderid},{$set:{appliedcoupon:couponcode,finalvalue:finalv}})
        }
        

}

exports.couponRemove = async(req,res)=>{
    const pendingorderid = req.session.pendingorderid;

    const order = await Orderdb.findOne({_id:pendingorderid},{ordervalue:1})
    await Orderdb.findOneAndUpdate({_id:pendingorderid},{$set:{finalvalue:order.ordervalue,appliedcoupon:null}});
    res.send('success');
}
const { default: axios } = require('axios');
const Razorpay = require('razorpay');
const Walletdb = require('../models/walletModel');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Orderdb = require('../models/orderModel');
const Coupondb = require('../models/couponModel');


exports.walletaddmoney = async (req, res) => {
    const userid = req.session.passport.user;
    const amount = parseFloat(req.body.amount);

    const instance = new Razorpay({ key_id: process.env.raz_keyid, key_secret: process.env.raz_key_secret })

    var options = {
        amount: amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "wallet_rcptid_11"
    };
    let order = await instance.orders.create(options, async function (err, order) {

        if (order) {
      
            const initializewallet = await Walletdb.updateOne({ userid: userid }, { $set: { userid: userid } }, { upsert: true });
            const wallettransaction = await Walletdb.findOneAndUpdate({ userid: userid }, { $push: { transactions: { amount: amount, credit: true, status: "pending", transactionid: order.id } } }, { new: true });
      

            res.status(201).json({
                statusCode: 200,
                success: true,
                order,
                amount: amount * 100
            })
        } else {
            console.log(err);
            req.flash('error', err.description)
            res.json(err)
        }


    });

}

exports.paymentVerification = async (req, res) => {
    const orderid = req.session.pendingorderid;
    const userid = req.session.passport.user;
    const instance = new Razorpay({ key_id: process.env.raz_keyid, key_secret: process.env.raz_key_secret })

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const body_data = razorpay_order_id + "|" + razorpay_payment_id;

    const generated_signature = crypto.createHmac('sha256', process.env.raz_key_secret)
        .update(body_data)
        .digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (isValid) {
   
        const wallettransaction = await Walletdb.findOneAndUpdate(
            { 'transactions.transactionid': razorpay_order_id },
            {
                $set: {
                    'transactions.$.status': "success",
                    'transactions.$.razorpay_payment_id': razorpay_payment_id,
                    'transactions.$.razorpay_order_id': razorpay_order_id,
                    'transactions.$.razorpay_signature': razorpay_signature
                },
    
            },

            { new: true }
        );
    
        const transaction = wallettransaction.transactions.find((transaction) => {
            return transaction.transactionid == razorpay_order_id
        })
 
        const amount = parseFloat(transaction.amount);

        await Walletdb.findOneAndUpdate(
            { 'transactions.transactionid': razorpay_order_id },
            { $inc: { walletbalance: amount } }
        )
        res.redirect('/wallet')

    } else {
        res.redirect('/wallet')
    }

}




exports.getWallet = async (req, res) => {
    const userid = req.params.id;
   
    const wallet = await Walletdb.aggregate([
        { $match: { userid: new mongoose.Types.ObjectId(userid) } },
        { $unwind: "$transactions" },
        { $sort: { "transactions.timestamp": -1 } },
        { $limit: 5 },
        { $group: { _id: "$_id", transactions: { $push: "$transactions" }, walletbalance: { $first: "$walletbalance" } } },
    ]);

    res.send(wallet[0]);
}

exports.walletBalance = async (req, res) => {
    const userid = req.params.id;
    const wallet = await Walletdb.findOne({ userid: userid }, { walletbalance: 1 });
    if (wallet) {
        res.send(wallet)
    } else {
        res.send(false)
    }

}

exports.refundtoWallet = async (req, res) => {
    const orderid = req.params.orderid;
    const pid = req.params.pid;
    const order = await Orderdb.findOne({ _id: orderid });

    if (order.paymentstatus) {
        const { userid, coupondiscount,appliedcoupon } = order;
        const initializewallet = await Walletdb.updateOne({ userid: userid }, { $set: { userid: userid } }, { upsert: true });
        const product = order.orderitems.find((product) => {
            return product.pid == pid
        })
        const { price,quantity,category } = product;
        let amounttoRefund = 0;
        
        

        if (coupondiscount  ) {
            const coupon = await Coupondb.findOne({couponcode:appliedcoupon});
            if(coupon?.offertype?.category==category ||coupon?.offertype?.category=="all"){
                amounttoRefund = (price - price * coupondiscount / 100)*quantity;
            }else{
                amounttoRefund = price*quantity;
            }

        } else {
            amounttoRefund = price*quantity;
        }
        await Walletdb.findOneAndUpdate(
            { userid: userid },
            {
                $push: {
                    transactions: {
                        amount: amounttoRefund,
                        credit: true,
                        status: "success",
                        transactionid: orderid
                    }
                },
                $inc: {
                    walletbalance: amounttoRefund
                }
            }
        );
        
        res.send(true)
    } else {
        res.send(false)
    }

}
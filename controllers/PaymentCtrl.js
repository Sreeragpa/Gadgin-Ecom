const { default: axios } = require('axios');
const Razorpay = require('razorpay');
const Orderdb = require('../models/orderModel');


exports.payment = async (req, res) => {
    const pendingorderid  = req.session.pendingorderid;
    const userid = req.session.passport.user;
    delete req.session.pendingorderid;

    // const myorder = axios.get(`/user/getorders/products/${userid}/${pendingorderid}`);
    const myorder = await Orderdb.find({_id:pendingorderid});
    const amount = myorder[0].ordervalue;
    var instance = new Razorpay({ key_id: process.env.raz_keyid, key_secret: process.env.raz_key_secret })
    
    var options = {
        amount: amount*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    let order = await instance.orders.create(options, function (err, order) {
        console.log(order);
        res.status(201).json({
            success: true,
            order,
            amount: amount*100
        })
    });

}

exports.paymentSuccess = async (req, res) => {

}
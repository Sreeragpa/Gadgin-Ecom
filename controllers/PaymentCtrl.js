const { default: axios } = require('axios');
const Razorpay = require('razorpay');
const Orderdb = require('../models/orderModel');
const crypto = require('crypto')


exports.payment = async (req, res) => {
    const pendingorderid = req.session.pendingorderid;
    const userid = req.session.passport.user;


    // const myorder = axios.get(`/user/getorders/products/${userid}/${pendingorderid}`);
    const myorder = await Orderdb.find({ _id: pendingorderid });
    const amountt = myorder[0].finalvalue.toFixed(2);
    const amount = Number(amountt)
    console.log(typeof(amount));
    const instance = new Razorpay({ key_id: process.env.raz_keyid, key_secret: process.env.raz_key_secret })

    var options = {
        amount: amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    let order = await instance.orders.create(options, function (err, order) {
        res.status(201).json({
            success: true,
            order,
            amount: amount * 100
        })
        console.log(err);
    });

}

exports.paymentVerification = async (req, res) => {
    const orderid = req.session.pendingorderid;
    const userid = req.session.passport.user;
    const instance = new Razorpay({ key_id: process.env.raz_keyid, key_secret: process.env.raz_key_secret })

    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;

    const body_data = razorpay_order_id+"|"+razorpay_payment_id;

    const generated_signature = crypto.createHmac('sha256',process.env.raz_key_secret)
        .update(body_data)
        .digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if(isValid){
        delete req.session.pendingorderid;
        const ordersuccess = await axios.get(`http://localhost:3001/api/user/order/success/${userid}/${orderid}?paymentmethod=razorpay`);

        if(ordersuccess.data){
            const order = await Orderdb.findOneAndUpdate({_id:orderid},{$set:{razorpay_payment_id:razorpay_payment_id,razorpay_order_id:razorpay_order_id,razorpay_signature:razorpay_signature}},{upsert:true});
            res.status(200).render('paymentstatuspage.ejs', { paymentstatus: "Order Success", orderdetails: order });
        }else {
            res.render('paymentstatuspage.ejs', { paymentstatus: "Order Failed" })
        }

    }else{

    }

  
    // delete req.session.pendingorderid;
    // console.log(req.body);
}
const Cartdb = require('../models/cartModel');
var Userdb = require('../models/userModel')
var Addressdb = require('../models/useraddressModel')
var Orderdb = require('../models/orderModel')
var Productdb = require('../models/productModel')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const axios = require('axios');
const { validationResult } = require('express-validator');
const generateProfilepicture = require('../services/generateProfilepicSharp');
const uuid = require('uuid');
const Walletdb = require('../models/walletModel');

    



exports.create = async (req, res) => {
    

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "Password should be Strong");
        return res.redirect('/newaccount')
    }
    const email = req.session.email;
    const existingUser = await Userdb.findOne({ email: email });

    const existingPhone = await Userdb.findOne({ phone: req.body.phone });

    if (existingUser) {
        res.render("userlogin.ejs", { messages: { error: "User Already exists" } })
    } else if (existingPhone) {
        res.render('finalreg.ejs', { email: email, messages: { error: "Phone already exists" } })
    } else {
        try {
            
            const filename = await generateProfilepicture.generateProfilepicture(req.body.name[0]);
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new Userdb({
                name: req.body.name,
                email: email,
                password: hashedPassword,
                phone: req.body.phone,
                profileimg:filename
            })

            await user.save()
                .then(async() => {
                    req.session.email=null;
                    req.flash('success', "User Registered");
                    res.redirect('/login');
                })
                .catch(err => {
                    res.status(500).send(err)
                })
        } catch (err) {
            res.status(500).send(err);
        }


    }


};

exports.updatepass = async (req, res) => {
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', "Password should be Strong");
        req.session.email = req.body.email;
        return res.redirect('/changepassword')

    } else {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const updatedUser = await Userdb.findOneAndUpdate(
                { email: email },
                { $set: { password: hashedPassword } },
                { new: true }
            );

            if (updatedUser) {
                req.flash('success', "Password Updated")
                res.redirect('/login');
            }
        } catch (err) {
            console.error('Error updating password:', err);
            res.status(500).send(err);
        }
    }


};

exports.getuser = async (req, res) => {
    try {
        const users = await Userdb.find()
        res.send(users)
    } catch (error) {
        console.error('Error in getuser :', err);
        res.status(500).send(err);
    }

}
exports.getcartCount = async (req, res) => {
    try {

        const userid = req.params.id;
        const result = await Cartdb.aggregate([

            {
               $match:{
                   userid:new mongoose.Types.ObjectId(userid)
               }
            },
            {
               $project: {
                 itemCount: { $size: '$cartitems' },
                 _id:0
               },
             },
           ])
           if(result){
            res.send(result[0])
           }else{
            res.send(0)
           }
           
 
    } catch (error) {
        console.error('Error in getcartCount :', error);
        res.status(500).send(error);
    }

}

exports.block = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await Userdb.findById(id);
        const result = await Userdb.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } }, { new: true })
        res.redirect('/admin/usermgmt')
    } catch (error) {
        console.error('Error in block :', err);
        res.status(500).send(err);
    }

}
exports.unblock = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Userdb.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } }, { new: true })
        res.redirect('/admin/usermgmt')
    } catch (error) {
        console.error('Error in unblock :', err);
        res.status(500).send(err);
    }

}

exports.getAddress = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Addressdb.findOne({ userid: id }).sort({ "address.defaultaddress": -1 });
        res.send(result);
    } catch (error) {
        console.error('Error in getAddress :', err);
        res.status(500).send(err);
    }

}

exports.addAddress = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Errors = errors.array();
        Errors.forEach((errelem) => {

            req.flash(errelem.path + 'error', errelem.msg)
        })
        const referer = req.get('referer');
        res.redirect(referer);
    } else {
        try {
            const id = req.session.passport.user;
            let newAddress = await Addressdb.findOne({ userid: id });
            if (!newAddress) {
                newAddress = new Addressdb({
                    userid: id,
                    address: [
                        {
                            name: req.body.name,
                            house: req.body.house,
                            pincode: req.body.pin,
                            phone: req.body.phone,
                            defaultaddress: true,

                        }
                    ]
                })
            } else {
                newAddress.address.push({
                    name: req.body.name,
                    house: req.body.house,
                    pincode: req.body.pin,
                    phone: req.body.phone,
                })
            }

            await newAddress.save();

            req.flash('success', "Address added");
            const referer = req.get('referer');
            res.redirect(referer);
        }
        catch (error) {
            console.error('Error in addAddress :', err);
            res.status(500).send(err);
        }


    }
}

exports.makeaddressDefault = async (req, res) => {
    try {
        const id = req.session.passport.user;
        const addressid = req.params.id;
    
        let Address = await Addressdb.updateMany({ userid: id }, { $set: { "address.$[].defaultaddress": false } });
    
    
        let addressresult = await Addressdb.find({ userid: id });
        let tochange = addressresult[0].address.find((value) => {
            return value._id.toString() == addressid;
    
        })
        tochange.defaultaddress = true;
        await addressresult[0].save()
    
        res.redirect('/manageaddress')
    } catch (error) {
        console.error('Error in makeaddressDefault :', err);
        res.status(500).send(err);
    }


}
exports.checkout = async (req, res) => {
    const userid = req.session.passport.user;
    const type = req.params.id;
    const addressid = req.body.selectedaddress;
    try {
        if (!addressid) {
            req.session.isAddress = false;
            res.redirect('/manageaddress');

        } else {

            const address = await Addressdb.find({ "address._id": addressid }, { 'address.$': 1 });
            const orderaddress = address[0].address[0];

            if (type == 'cart') {

                let cartProducts = await axios.get(`http://localhost:${process.env.PORT}/api/user/getCart/${userid}`);

                const userdetails = await axios.get(`http://localhost:${process.env.PORT}/api/user/get/${userid}`);
                
                

                let items = cartProducts.data.map(item => {
                    let discount= 0;
                    let discountpercentage = 0;
                    if(item?.offer1.length!=0){
                        discount=item?.offer1[0]?.discount/100;
                        discountpercentage = item?.offer1[0].discount
                    }
                    return {
                        pid: item.cartItemsWithDetails[0]._id,
                        name: item.cartItemsWithDetails[0].name,
                        mrp: item.cartItemsWithDetails[0].mrp,
                        price: (item.cartItemsWithDetails[0].price)-((item.cartItemsWithDetails[0].price)*discount),
                        discount: (item.cartItemsWithDetails[0].discount)+ discountpercentage,
                        category: item.cartItemsWithDetails[0].category,
                        description: item.cartItemsWithDetails[0].description,
                        color: item.cartItemsWithDetails[0].color,
                        images: [item.cartItemsWithDetails[0].images[0]],
                        quantity: item.cartitems.quantity,
                        orderstatus: 'pending',
                    };
                });



                const totalcartquantity = items.reduce((sum, value) => {
                    return sum += value.quantity
                }, 0)


                newOrder = new Orderdb({
                    orderid:uuid.v4().replace(/-/g, ''),
                    userid: userid,
                    orderitems: items,
                    orderdate: Date.now(),
                    address: orderaddress,
                    orderquantity: totalcartquantity,
                })
                const order = await newOrder.save()
                if (order) {
                    req.session.pendingorderid = order._id;
                    res.redirect(`/checkout`)
                }
            } else if (type == 'buynow') {
                const quantity = Number(req.body.quantity);
                const pid = req.body.pid;
                const product = await Productdb.findOne({ _id: pid }).populate('offer');
                let offerdiscount=product?.offer?.discount/100 || 0;
                
                let offerdiscountpercentage = product?.offer?.discount || 0
                const orderItem = {
                    pid: product._id,
                    name: product.name,
                    mrp: product.mrp,
                    price: (product.price)-(product.price*offerdiscount),
                    discount: product.discount+offerdiscountpercentage,
                    category: product.category,
                    description: product.description,
                    color: product.color,
                    images: [product.images[0]],
                    quantity: quantity,
                    orderstatus: 'pending'

                };

                newOrder = new Orderdb({
                    orderid:uuid.v4().replace(/-/g, ''),
                    userid: userid,
                    orderitems: [orderItem],
                    orderdate: Date.now(),
                    address: orderaddress,
                    orderquantity: quantity,
                })
                const order = await newOrder.save()
                if (order) {
                    req.session.pendingorderid = order._id;
                    res.redirect(`/checkout`)
                }

            }
        }


    } catch (error) {
        console.error("Error in checkout:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }


}


exports.changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('passerror', "Password should be Strong");
            return res.redirect('/editaccount')
        }
        const id = req.session.passport.user;
        const oldpassword = req.body.oldpassword;
        const newpassword = req.body.password;

        const user = await Userdb.findById(id)

        const { password } = user;
        const isMatch = await bcrypt.compare(oldpassword, password);
        if (isMatch) {
            if (newpassword) {
                const hashedPassword = await bcrypt.hash(newpassword, 10);
                await Userdb.findOneAndUpdate({ _id: id }, { $set: { password: hashedPassword } })
                req.flash('success', "Updated")
                res.redirect('/editaccount')
            }
        } else {
            req.flash('passerror', "Wrong Password")
            res.redirect('/editaccount')
        }
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Userdb.findOne({ _id: id }, { name: 1, phone: 1,email:1 })
        if (result) {
            res.send(result);
        }
    } catch (error) {
        console.error("Error in getUser:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.changeInfo = async (req, res) => {
    try {
        const id = req.session.passport.user;
        const name = req.body.name;
        const phone = req.body.phone;

        if (name && phone) {
            const result = await Userdb.findOneAndUpdate({ _id: id }, { $set: { name: name, phone: phone } })

            if (result) {
                req.flash('success', "Updated")
                res.redirect('/editaccount');
            }
        }
    } catch (error) {
        console.error("Error in changeInfo:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.deleteAddress = async (req, res) => {
    try {
        const userid = req.session.passport.user;
        const addressid = req.params.id;
        const result = await Addressdb.findOne({ userid: userid })
        if (result) {
            const addresstodel = result.address.findIndex((value) => {
                return value.id.toString() == addressid;
            })

            result.address.splice(addresstodel, 1);
            const success = await result.save();
            if (success) {
                res.redirect('/manageaddress');
            }
        }
    } catch (error) {
        console.error("Error in deleteAddress:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }

}

exports.changeProfile = async (req, res) => {
    try {
        const userid = req.session.passport.user;
        const files = req.files;
        if (files) {
            const imag = "/uploads/" + files[0].filename;
            await Userdb.findOneAndUpdate({ _id: userid }, { $set: { profileimg: imag } })
            res.redirect('/editaccount');
        } else {
            res.redirect('/editaccount');
        }
    } catch (error) {
        console.error("Error in changeProfile:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }



}



exports.setcodSuccess = async (req, res) => {
    try {
        const userid = req.params.userid;
        const orderid = req.params.orderid;
        const paymentmethod = req.query.paymentmethod;
        const order = await Orderdb.findOne({ userid: userid, _id: orderid });

        let flag = 0;


        for (const product of order.orderitems) {
            const updateq = Number(product.quantity);

            const originalq = await Productdb.findOne(
                { _id: new mongoose.Types.ObjectId(product.pid) }
            );

            if (originalq.quantity < updateq) {
                flag = 1;
            }
        }
       

        if (flag == 1) {
            const changeorder = await Orderdb.findOneAndUpdate(
                { userid: userid, _id: orderid },
                { $set: { 'orderitems.$[].orderstatus': "failed", paymentmethod: paymentmethod } },
                { upsert: true }
            );
            res.send();
        } else {
            if(paymentmethod=='wallet'){
                const changeorder = await Orderdb.findOneAndUpdate(
                    { userid: userid, _id: orderid },
                    { $set: { 'orderitems.$[].orderstatus': "ordered", paymentmethod: paymentmethod,paymentstatus:true } },
                    { upsert: true }
                );

                const amount = changeorder.finalvalue;

                const wallet = await Walletdb.findOneAndUpdate(
                    {userid:userid},
                    {    $push: {
                        transactions: {
                            amount: amount,
                            debit: true,
                            status: "success",
                            transactionid: orderid
                        }
                    },
                        $inc:{walletbalance:-amount}
                    }
                )
            }else{
                const changeorder = await Orderdb.findOneAndUpdate(
                    { userid: userid, _id: orderid },
                    { $set: { 'orderitems.$[].orderstatus': "ordered", paymentmethod: paymentmethod } },
                    { upsert: true }
                );
            }
         
            for (const product of order.orderitems) {
                const updateq = Number(product.quantity);

                await Productdb.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(product.pid) },
                    { $inc: { quantity: -updateq } }
                );
            }
            res.send(order);
        }
    } catch (error) {
        console.error("Error in setcodSuccess:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}
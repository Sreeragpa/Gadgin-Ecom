const Orderdb = require('../models/orderModel');
const Userdb = require('../models/userModel');
const mongoose = require('mongoose');
const CsvParser = require('json2csv').Parser;
const pdfService = require('../services/invoicepdfService');
const Walletdb = require('../models/walletModel');
const { default: axios } = require('axios');


exports.getallOrders = async (req, res) => {
    // Fetching all Order ,which is sorted by the newest orders first

    const orders = await Orderdb.find({}).sort({ orderdate: -1 });
    res.send(orders)
}

exports.getallorderwithuser = async (req, res, next) => {
    if (req.query.orderStatus) {

        const orderStatus = req.query.orderStatus;
        try {
            const page = req.query.page || 1;
            const limit = 10;

            const orders = await Orderdb.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userid',
                        foreignField: '_id',
                        as: 'userdetails'
                    }
                },
                {
                    $unwind: {
                        path: '$orderitems',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        'orderitems.orderstatus': orderStatus
                    }
                },
                {
                    $project: {
                        'userdetails.password': 0,
                        'userdetails.blocked': 0,
                        'userdetails.status': 0,
                    }
                },
                {
                    $sort: {
                        orderdate: -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ]);

            const itemCount = await Orderdb.aggregate([

                {
                    $unwind: '$orderitems'
                },
                {
                    $match: {
                        'orderitems.orderstatus': orderStatus,
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }

            ])
            if (itemCount[0]?.count > 0) {
                const itemcount = itemCount[0].count;


                const pageCount = Math.ceil(itemcount / limit) || 0;

                if (orders.length > 0) {
                    res.json({ orders, pageCount });
                } else {
                    res.json({ orders: [], pageCount: 0 });
                }
            } else {
                res.json({ orders: [], pageCount: 0 });
            }

        } catch (error) {
            next(error)
        }
    } else if (req.query.search) {

        const search = req.query.search;

        try {
            const page = req.query.page || 1;
            const limit = 10;

            const orders = await Orderdb.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userid',
                        foreignField: '_id',
                        as: 'userdetails'
                    }
                },
                {
                    $unwind: {
                        path: '$orderitems',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                'orderitems.orderstatus': { $regex: search, $options: 'i' }
                            },
                            {
                                'orderitems.name': { $regex: search, $options: 'i' }
                            },
                            {
                                'orderitems.category': { $regex: search, $options: 'i' }
                            },
                            {
                                'userdetails.name': { $regex: search, $options: 'i' }
                            },
                            {
                                'userdetails.email': { $regex: search, $options: 'i' }
                            },
                            {
                                'orderid': { $regex: search, $options: 'i' }
                            },

                        ]
                    }
                },
                {
                    $project: {
                        'userdetails.password': 0,
                        'userdetails.blocked': 0,
                        'userdetails.status': 0,
                    }
                },
                {
                    $sort: {
                        orderdate: -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }

            ]);
            const itemsCount = await Orderdb.aggregate([
                {
                    $unwind: '$orderitems'
                },
                {
                    $match: {
                        $or: [
                            {
                                'orderitems.orderstatus': { $regex: search, $options: 'i' }
                            },
                            {
                                'orderitems.name': { $regex: search, $options: 'i' }
                            },
                            {
                                'orderitems.category': { $regex: search, $options: 'i' }
                            },
                            {
                                'userdetails.name': { $regex: search, $options: 'i' }
                            },
                            {
                                'userdetails.email': { $regex: search, $options: 'i' }
                            },

                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
            const pageCount = Math.ceil(itemsCount[0]?.count / limit)
            if (orders) {
                res.json({ orders, pageCount })
            }
        } catch (error) {
            console.error('Error in getallorderwithuser :', error);
            next(error)
        }
    } else {
        try {
            const page = req.query.page || 1;
            const limit = 10;
            const orders = await Orderdb.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userid',
                        foreignField: '_id',
                        as: "userdetails"
                    }
                },
                {
                    $unwind: '$orderitems'
                },
                {
                    $project: {
                        'userdetails.password': 0,
                        'userdetails.blocked': 0,
                        'userdetails.status': 0,
                    }
                },
                {
                    $sort: {
                        orderdate: -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ])

            const itemsCount = await Orderdb.aggregate([
                {
                    $unwind: '$orderitems'
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
            const pageCount = Math.ceil(itemsCount[0]?.count / limit)
            if (orders) {
                res.json({ orders, pageCount })
            }
        } catch (error) {
            console.error('Error in getallorderwithuser :', error);

            next(error)
        }
    }



}

exports.getOrders = async (req, res) => {
    try {
        const userid = req.params.userid;
        const orderid = req.params.orderid;
        if (orderid == 'false') {
            const Isorder = await Orderdb.find({ userid: userid });
            if (Isorder.length == 0) {
                return res.send(false)
            } else {
                const page = parseInt(req.query.page) || 1;
                const limit = 10;
                const order = await Orderdb.aggregate([
                    {
                        $match: {
                            userid: new mongoose.Types.ObjectId(userid)
                        }
                    },
                    {
                        $unwind: '$orderitems'
                    },
                    {
                        $sort: {
                            orderdate: -1
                        }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ])
                const itemCount = await Orderdb.aggregate([
                    {
                        $match: {
                            userid: new mongoose.Types.ObjectId(userid)
                        }
                    },
                    {
                        $unwind: '$orderitems'
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }
                ])

                const currentPage = page;
                const pageCount = Math.ceil(itemCount[0].count / limit);

                if (order) {
                    res.json({ order, pageCount, currentPage })
                } else {
                    res.status(500).send('Error')
                }
            }

        } else {
            const order = await Orderdb.find({ userid: userid, _id: orderid });
            if (order) {
                res.send(order);

            } else {
                res.status(500).send('Error')
            }
        }
    } catch (error) {
        console.error("Error in getOrders:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }



}


exports.getOrderProducts = async (req, res) => {
    const userid = req.params.userid;
    const orderid = req.params.orderid;

    try {
        if (orderid != 'false') {
            const result = await Orderdb.aggregate([
                {
                    $match: { userid: new mongoose.Types.ObjectId(userid), _id: new mongoose.Types.ObjectId(orderid) },

                },
                {
                    $unwind: '$orderitems'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderitems.productid',
                        foreignField: '_id',
                        as: 'orderitemsDetails'
                    }
                }
            ])
            res.send(result)
        } else {

            const result = await Orderdb.aggregate([
                {
                    $match: { userid: new mongoose.Types.ObjectId(userid) },

                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderitems.productid',
                        foreignField: '_id',
                        as: 'orderitemsDetails'
                    }
                },
                {
                    $sort: { orderdate: -1 }
                }
            ])
            res.send(result)
        }

    } catch (error) {
        console.error("Error in getOrderProducts:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}



exports.changeorderStatus = async (req, res, next) => {
    try {
        const orderid = req.params.id;
        const pid = req.params.pid;
        const statustochange = req.body.status;
        let paymentstatus = false;
        if (req.body.status == "cancelled") {
            paymentstatus = true
        }
        const order = await Orderdb.findOne({ _id: orderid, 'orderitems.pid': pid });
        let currentStatus;
        if (order) {
            const matchingproduct = order.orderitems.find((product) => {
                return product.pid == pid
            })
            if (matchingproduct) {
                currentStatus = matchingproduct.orderstatus
            }
        }

        if (currentStatus == statustochange || currentStatus == "cancelled" || currentStatus == 'returned') {
            req.flash("error", `Current Status is ${statustochange}`)
            const referer = req.get('Referer')
            return res.redirect(referer)
        }



        const result = await Orderdb.findOneAndUpdate({ _id: orderid, 'orderitems.pid': pid }, { $set: { 'orderitems.$.orderstatus': statustochange } })
        if (req.body.status == "cancelled") {
            await axios.put(`http://localhost:${process.env.PORT}/api/wallet/refund/${orderid}/${pid}`)
        }
        if (result) {
            const referer = req.get('Referer')
            res.redirect(referer)
        }
    } catch (error) {
        console.error('Error in changeorderStatus :', error);
        next(error)
    }

}

exports.cancelOrder = async (req, res, next) => {
    try {
        const orderid = req.params.oid;
        const pid = req.params.pid;
        const userid = req.session.passport.user;
        const walletrefund = await axios.put(`http://localhost:${process.env.PORT}/api/wallet/refund/${orderid}/${pid}`)
        const result = await Orderdb.findOneAndUpdate({ _id: orderid, userid: userid, 'orderitems.pid': pid }, { $set: { 'orderitems.$.orderstatus': 'cancelled', 'comments': req.body }, });
        if (result) {
            res.redirect('/myorders')
        }

    } catch (error) {
        console.error('Error in cancelOrder :', err);
        next(error)
    }



}

exports.returnOrder = async (req, res, next) => {
    try {

        const orderid = req.params.oid;
        const userid = req.session?.passport.user;
        const pid = req.params.pid;
        const order = await Orderdb.findOne({ _id: orderid, 'orderitems.pid': pid });
        let currentStatus;
        if (order) {
            const matchingproduct = order.orderitems.find((product) => {
                return product.pid == pid
            })
            if (matchingproduct) {
                currentStatus = matchingproduct.orderstatus
            }
        }

        if (currentStatus == 'delivered') {
            const walletrefund = await axios.put(`http://localhost:${process.env.PORT}/api/wallet/refund/${orderid}/${pid}`)
            const result = await Orderdb.findOneAndUpdate({ _id: orderid, userid: userid, 'orderitems.pid': pid }, { $set: { 'orderitems.$.orderstatus': 'returned', 'comments': req.body }, });

            if (result) {
                res.redirect('/myorders')
            }

        }
    } catch (error) {
        console.error('Error in returnOrder :', err);
        next(error)
    }

}

exports.getSingleOrder = async (req, res, next) => {
    const orderid = req.params.orderid;
    try {
        const result = await Orderdb.find({ _id: orderid });

        if (result) {
            res.send(result);
        }
    } catch (error) {
        next(error)
    }

}

exports.salesReport = async (req, res, next) => {
    try {

        const Orderdata = await Orderdb.aggregate([
            { $unwind: "$orderitems" },
        ]);

        const finalvaluesum = await Orderdb.aggregate([
            {
                $group:{
                    _id:null,
                    total:{$sum:"$finalvalue"},
                    pricee:{$sum:"$price"}
                }
            }
        ])

 

        let Orders = Orderdata.map(order => {
            const {
                orderid,
                orderitems: { name: productname, price, quantity },
                orderdate,
                paymentmethod,
                finalvalue
            } = order;

            const orderDate = orderdate.toISOString().split('T')[0];

            return { orderid, orderDate, productname, price, quantity, paymentmethod };
        });
        coupondiscount = (finalvaluesum[0].total)-(finalvaluesum[0].pricee)
        total = finalvaluesum[0].total.toLocaleString('en-IN');
        Orders.push({ orderid: 'Total Order Value', price: total });

        const csvFields = ['Order id', 'Order Date', 'Product', 'Price', 'Quantity', 'Payment Method', 'Total'];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(Orders);


        res.setHeader("Content-type", "text/csv")
        res.setHeader("Content-Disposition", "attachment: filename=OrderData.csv");

        res.status(200).end(csvData);

    } catch (error) {
        next(error)
    }
}

exports.ordersreportforgraph = async (req, res, next) => {
    const orders = await Orderdb.aggregate([
        {
            $group: {
                _id: "$orderdate",
                count: { $sum: 1 },
            }
        },

    ])
    res.send(orders)
}

exports.generateInvoice = async (req, res, next) => {

    try {
        const path = require('path');
        const imageService = require('../services/imgtobase64Service');
        const orderid = req.params.id;
        const order = await Orderdb.findOne({ _id: orderid });
        const user = await Userdb.findOne({ _id: order.userid }, { name: 1, email: 1 });

        const products = order.orderitems.map((value) => {
            return {
                "quantity": value.quantity,
                "description": value.description,
                "price": value.price
            }
        })
        const imagepath = path.join(__dirname, '..', 'public', 'img', 'gadgin.png');
        const base64Image = await imageService.imageToBase64(imagepath)
        const invoiceData = {
            orderNumber: order.orderid,
            date: order.orderdate.toLocaleString('en-IN', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }),
            amount: order.finalvalue,
            products: order.orderitems,
            address: order.address,
            finalvalue: order.finalvalue,
            ordervalue: order.ordervalue,
            paymentmethod: order.paymentmethod,
            userdetails: {
                name: user.name,
                email: user.email,
            },
            logo: base64Image

        }


        const data = {
            invoiceData
        };

        await pdfService.generatePdf(res, invoiceData)
    } catch (error) {
        next(error)
    }






}
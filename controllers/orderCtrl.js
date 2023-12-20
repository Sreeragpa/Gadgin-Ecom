const Orderdb = require('../models/orderModel');
const Userdb = require('../models/userModel');
const mongoose = require('mongoose')
exports.getallOrders = async (req, res) => {
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
                    res.json({ orders: [], pageCount });
                }
            } else {
                res.json({ orders: [], pageCount: 1 });
            }

        } catch (error) {
            res.status(500).send("Error")
            // res.json({ orders: [], pageCount: 1 });
           
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
                // res.send(orders)
                res.json({ orders, pageCount })
            }
        } catch (error) {
            console.error('Error in getallorderwithuser :', error);
            // res.status(500).send(err);
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
            if(Isorder.length==0){
                return res.send(false)
            }else{
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
                // res.send(order);
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
    // const order = await Orderdb.find({userid:userid,_id:orderid});
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
    // res.send(order)
}



exports.changeorderStatus = async (req, res, next) => {
    try {
        const orderid = req.params.id;
        const pid = req.params.pid;
        const statustochange = req.body.status;
    
        const result = await Orderdb.findOneAndUpdate({ _id: orderid, 'orderitems.pid': pid }, { $set: { 'orderitems.$.orderstatus': statustochange } })
        if (result) {
            const referer = req.get('Referer')
            res.redirect(referer)
            // res.redirect('/admin/ordermgmt')
        }
    } catch (error) {
        console.error('Error in changeorderStatus :', err);
        // res.status(500).send(err);
        next(error)
    }

}

exports.cancelOrder = async (req, res, next) => {
    try {
        const orderid = req.params.oid;
        const pid = req.params.pid;
        const userid = req.session.passport.user;
    
        const result = await Orderdb.findOneAndUpdate({ _id: orderid, userid: userid, 'orderitems.pid': pid }, { $set: { 'orderitems.$.orderstatus': 'cancelled' } })
        if (result) {
            res.redirect('/myorders')
        }
     
    } catch (error) {
        console.error('Error in cancelOrder :', err);
        // res.status(500).send(err);
        next(error)
    }
 


}

exports.returnOrder = async (req, res, next) => {
    try {
        const orderid = req.params.id;
        const userid = req.session.passport.user;
        const currentStatus = await Orderdb.findOne({ _id: orderid }, { orderstatus: 1 });
        if (currentStatus.orderstatus == 'delivered') {
            const result = await Orderdb.findOneAndUpdate({ _id: orderid, userid: userid }, { $set: { orderstatus: 'return processed' } })
            if (result) {
                res.redirect('/myorders')
            }
        }
    } catch (error) {
        console.error('Error in returnOrder :', err);
        // res.status(500).send(err);
        next(error)
    }

}

exports.getSingleOrder = async(req,res,next)=>{
    const orderid = req.params.orderid;
    try {
        const result = await Orderdb.find({_id:orderid});

        if(result){
            res.send(result);
        }
    } catch (error) {
        next(error)
    }
  
}
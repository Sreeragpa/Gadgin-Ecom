const axios = require('axios');

exports.loginpage = (req, res) => {
    res.render('adminlogin.ejs')
}
exports.admindash = async (req, res) => {
    const dashdetails = await admindashdetails();
    res.render('admindash.ejs', { dashdetails: dashdetails })
}

exports.loginvalidate = (req, res) => {
    const admincred = {
        email: process.env.admin_email,
        password: process.env.admin_pass
    }

    function checkAdminCredentials(email, password) {
        return email === admincred.email && password === admincred.password;
    }
    const isMatch = checkAdminCredentials(req.body.email, req.body.password)

    if (isMatch) {
        req.session.isAdminLogged = true;
        res.redirect("/admin");
    } else if (req.body.password != admincred.password && req.body.email == admincred.email) {
        res.render("adminlogin.ejs", { messages: { passerror: "Invalid Password" } })
    } else {
        res.render("adminlogin.ejs", { messages: { error: "Invalid Credentials" } })
    }

}
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.send(err);
        } else {
            res.redirect("/admin/login")
        }
    });

}

exports.usermgmt = (req, res, next) => {
    axios.get(`http://localhost:${process.env.PORT}/api/getusers`)
        .then((response) => {
            res.render('adminusermgmt.ejs', { users: response.data })
        })
        .catch((error) => {
            next(error)
        })

}

exports.ordermgmt = async (req, res, next) => {
    if (req.query.orderStatus) {
        try {

            const page = req.query.page || 1;
            const currentPage = page;
            const orderss = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorders/userdetails?orderStatus=${req.query.orderStatus}&page=${page}`);

            if (orderss) {
                const { orders, pageCount } = orderss.data;
                res.render('adminordermgmt.ejs', { orders: orders, query: req.query.orderStatus, pageCount: pageCount, currentPage: currentPage })
            } else {
                console.log('error');
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    } else if (req.query.search) {

        const page = req.query.page || 1;
        const currentPage = page;
        const orderss = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorders/userdetails?search=${req.query.search}&page=${page}`);

        if (orderss) {
            const { orders, pageCount } = orderss.data;
            req.flash('searchquery', req.query.search)
            res.render('adminordermgmt.ejs', { orders: orders, query: [], pageCount: pageCount, currentPage: currentPage })
        } else {
            console.log('error');
        }
    } else {
        try {
            const page = req.query.page || 1;
            const currentPage = page;
            const orderss = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorders/userdetails?page=${page}`);
            if (orderss) {
                const { orders, pageCount } = orderss.data;
                res.render('adminordermgmt.ejs', { orders: orders, query: null, pageCount: pageCount, currentPage: currentPage })
            } else {
                res.render('adminordermgmt.ejs', { orders: [], query: null, pageCount: 0, currentPage: 0 })
            }
        } catch (error) {
            next(error)
        }
    }

}

exports.ordersmgmtsingle = async (req, res, next) => {
    try {
        const orderid = req.params.id;
        const result = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorder/${orderid}`)
        if (result) {
            res.render('adminorderdetailed', { orders: result.data[0] })
        }
    } catch (error) {
        next(error)
    }

}


const Userdb = require('../models/userModel');
const Orderdb = require('../models/orderModel');
async function admindashdetails() {
    const usersCount = await Userdb.countDocuments();
    const Totalsales = await Orderdb.aggregate([{
        $group: {
            _id: null,
            sales: { $sum: "$ordervalue" },
            orders: { $sum: 1 }
        }
    }]);
    let dashdetails;

    if (usersCount && Totalsales) {
        const { sales, orders } = Totalsales[0];
        dashdetails = {
            users: usersCount,
            orders: orders,
            sales: sales
        }
    } else {
        dashdetails = {
            users: 0,
            orders: 0,
            sales: 0
        }
    }


    return dashdetails;
}

async function orderdetails() {
    const orders = await Orderdb.aggregate([
        {
            $group: {
                _id: "$orderdate",
                count: { $sum: 1 },
            }
        },

    ])
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let ordersbymonth = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    }
    orders.forEach((order) => {

        month = labels[(order._id.getMonth())]
        ordersbymonth[month] += order.count;


    })


    return ordersbymonth
}

exports.ordersmgmtsingle = async (req, res, next) => {
    try {
        const orderid = req.params.id;
        const result = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorder/${orderid}`)
        if (result) {
            res.render('adminorderdetailed', { orders: result.data[0] })
        }
    } catch (error) {
        next(error)
    }

}

exports.couponManagement = async (req, res, next) => {
    try {

        const result = await axios.get(`http://localhost:${process.env.PORT}/api/getcoupon`)
        if (result) {
            res.render('admincouponmgmt', { coupons: result.data })
        }
    } catch (error) {
        const status = 404;
        const message = "Error"
        err = {
            status,
            message
        }
        next(err)
    }
}

exports.addCouponpage = async (req, res, next) => {
    try {
        const categories = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory`);
        res.render('adminaddcouponform', { categories: categories.data })
    } catch (error) {
        next(error)
    }

}
exports.editCouponpage = async (req, res, next) => {
    try {
        const categories = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory`);
        const coupon = await axios.get(`http://localhost:${process.env.PORT}/api/getsinglecoupon/${req.params.id}`);

        res.render('admineditcouponform', { categories: categories.data, coupon: coupon.data })
    } catch (error) {
        next(error)
    }

}

exports.offerManagement = async (req, res, next) => {
    try {

        const result = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getoffers`)
        if (result) {
            res.render('adminoffermgmt', { offers: result.data })
        }
    } catch (error) {
        next(error)
    }
}

exports.addOffer = async (req, res, next) => {
    try {
        const categories = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory`);
        res.render('adminaddoffer', { categories: categories.data })
    } catch (error) {
        next(error)
    }

}

exports.editOffer = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getoffers?id=${id}`)
        const categories = await axios.get(`http://localhost:${process.env.PORT}/api/getcategory`);
        res.render('admineditoffer', { categories: categories.data, offer: result.data })
    } catch (error) {
        next(error)
    }

}
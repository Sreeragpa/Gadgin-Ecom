const axios = require('axios');

exports.loginpage = (req,res)=>{
    res.render('adminlogin.ejs')
}
exports.admindash = (req,res)=>{
    res.render('admindash.ejs')
}

exports.loginvalidate = (req,res)=>{
    const admincred = {
        email:"admin@gmail.com",
        password:"123"
    }

    function checkAdminCredentials(email, password) {
        return email === admincred.email && password === admincred.password;
    }
    const isMatch = checkAdminCredentials(req.body.email,req.body.password)

    if(isMatch){
        req.session.isAdminLogged = true;
        res.redirect("/admin");
    }else if(req.body.password!=admincred.password && req.body.email==admincred.email){
        res.render("adminlogin.ejs",{messages:{passerror:"Invalid Password"}})
    }else{
        res.render("adminlogin.ejs",{messages:{error:"Invalid Credentials"}})
    }

    // if(req.body.email==admincred.email && req.body.password==admincred.password){
    //     req.session.isAdminLogged = true;
    //     res.redirect("/admin");
    //     // res.send("Logged in")
    // }else{
    //     res.render("adminlogin.ejs",{messages:{error:"Invalid Credentials"}})
    // }
}
exports.logout = (req,res)=>{
    req.session.destroy(err => {
        if (err) {
            res.send(err);
        } else {
            res.redirect("/admin/login")
        }
    });

}

exports.usermgmt = (req,res,next)=>{
    axios.get(`http://localhost:${process.env.PORT}/api/getusers`)
        .then((response)=>{
            res.render('adminusermgmt.ejs',{users:response.data})
        })
        .catch((error)=>{
            next(error)
        })
    
}

exports.ordermgmt = async(req,res,next)=>{
    if(req.query.orderStatus){
        try {

            const page = req.query.page || 1;
            const currentPage = page;
            const orderss = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorders/userdetails?orderStatus=${req.query.orderStatus}&page=${page}`);

            if(orderss){
                // console.log(orders.data);
                const {orders,pageCount} = orderss.data;
                res.render('adminordermgmt.ejs',{orders:orders,query:req.query.orderStatus,pageCount:pageCount,currentPage:currentPage})
            }else{
                console.log('error');
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    }else{
        try {
            const page = req.query.page || 1;
            const currentPage = page;
            const orderss = await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorders/userdetails?page=${page}`);
            if(orderss){
                const {orders,pageCount} = orderss.data;
                // console.log(orders.data);
                res.render('adminordermgmt.ejs',{orders:orders,query:null,pageCount:pageCount,currentPage:currentPage})
            }else{
                // console.log('error');
            }
        } catch (error) {
            next(error)
        }
    }
   
}

exports.ordersmgmtsingle = async(req,res,next)=>{
    try {
        const orderid = req.params.id;
        console.log(orderid);
    // const result = await Orderdb.find({_id:orderid})

    const result =await axios.get(`http://localhost:${process.env.PORT}/api/admin/getorder/${orderid}`)
    if(result){
        res.render('adminorderdetailed',{orders:result.data[0]})
    }
    } catch (error) {
        next(error)
    }
 
}



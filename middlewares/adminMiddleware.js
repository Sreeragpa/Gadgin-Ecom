function adminAuthenticated(req,res,next){
    if(req.session.isAdminLogged){
        return next();
    }
    res.redirect('/admin/login')
}

function adminNotAuthenticated(req,res,next){
    if(req.session.isAdminLogged){
        return res.redirect('/admin')
    }
    next()
}

module.exports = {adminAuthenticated,adminNotAuthenticated}
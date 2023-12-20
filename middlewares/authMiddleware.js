const passport = require('../configs/passport-config')
const otpCtrl = require('../controllers/otpCtrl')
function CheckAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function CheckNotauthenticated(req,res,next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}



module.exports={CheckAuthenticated,CheckNotauthenticated}
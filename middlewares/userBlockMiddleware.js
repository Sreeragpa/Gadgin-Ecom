const Userdb = require('../models/userModel')
async function isBlocked(req,res,next){
    const id = req.session.passport.user;
   const user = await Userdb.findById(id) 
   if(user.blocked=='true'){
    return res.render('userblocked.ejs');
   }
   next()
}


module.exports={isBlocked}
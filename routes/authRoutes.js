const express = require('express');
const passport = require('../configs/passport-config');
const route = express.Router();

route.post("/login",passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}),(req,res)=>{
    console.log('Login succcesfully');
})



module.exports = route
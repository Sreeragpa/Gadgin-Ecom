const mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    blocked:{
        type:String,
        default:false
    },
    status:{
        type:String,
        default:'inactive'
    },
    profileimg:{
        type:String,
    }
})

const Userdb = mongoose.model('user',userSchema);

module.exports = Userdb;

// Userdb - Model name
// user -collection name ,where in mongodb it pluralizes it and saves as users
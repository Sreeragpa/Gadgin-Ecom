function otpGen(){
    var otp = Math.random() * 100000000;
    otp = otp.toString();
    otp = otp.split('').slice(0, 5).join('');
    return otp;
}


module.exports=otpGen

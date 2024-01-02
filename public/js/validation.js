const name1 = document.getElementById('name') || 1;
const email = document.getElementById('email') || 1;
const password = document.getElementById('password') || 1;
const confirmpassword = document.getElementById('confirmpassword') || 1;
const otp = document.getElementById('otpinputt') || 1;
const form = document.getElementById('form');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
emailValid=true

form.addEventListener('submit',(e)=>{
    let errmessage = [];

    if(name1!=1 && name1.value==='' || name1.value===null){
        errmessage.push("Name is required");
    }
    if(password!=1 && password.value==='' || password.value===null){
        errmessage.push("Password required")
    }
    // if(password!=1 && passwordRegex.test(password.value)){
    //     errmessage.push("Strong Password Required")
    // }
    if(!emailValid || email.value=='' || email.value==null){
        errmessage.push("Email Required")
    }
    if( otp!=1 && otp.value==''){
        errmessage.push("OTP required")
        
    }
    if(confirmpassword!=1 && confirmpassword.value!=password.value){
        errmessage.push("Password don't match")
    }


    if(errmessage.length>0){
        e.preventDefault() 
        errorElement.innerText=errmessage.join(', ');
    }else{
            // alert("User added Successfully");
    }
})

function validateEmail(){
    let emailError=document.getElementById('email-error')
    // email.addEventListener('keyup',(k)=>{
        if(!email.value.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){
            emailError.innerHTML='<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';
            emailValid=false;
            return false
        }
        emailValid=true;
        emailError.innerHTML='<i class="fa-solid fa-circle-check" style="color: #00a814;"></i>';
        return true;
    // })
}

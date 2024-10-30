const name1 = document.getElementById('name') || 1;
const password = document.getElementById('password') || 1;
const confirmpassword = document.getElementById('confirmpassword') || 1;
const phone = document.getElementById('phone') || 1;
const form = document.getElementById('form');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
let passValid = true;

form.addEventListener('submit',(e)=>{
    let flag=0;

    if(name1!=1 && name1.value==='' || name1.value===null || name1.value.length<3){
        flag=1;
        document.getElementById('name-error').innerHTML="Invalid Name";
    }

    if(password!=1 && password.value==='' || password.value===null){
        flag=1;
        document.getElementById('pass-error').innerHTML="Password Required";
    }
    if(phone!=1 && phone.value==='' || phone.value===null){
        flag=1;
        document.getElementById('phone-error').innerHTML="Phone Required";
    }
    // if(password!=1 && password.value.length!=6){
    //     flag=1;
    //     document.getElementById('pass-error').innerHTML="Password should be 6 characters";
    // }
    if(confirmpassword!=1 && confirmpassword.value!=password.value){
        flag=1;
        document.getElementById('passmatch-error').innerHTML="Password doesnt Match";
    }
    if(confirmpassword!=1 && confirmpassword.value==='' || confirmpassword.value===null){
        flag=1;
        document.getElementById('passmatch-error').innerHTML="Confirm Password Required";
    }
    if(!passValid){
        flag=1;
    }


    if(flag==1){
        e.preventDefault() 
    }

})


// document.querySelectorAll('input').forEach((value) => {
//     value.addEventListener('keyup', () => {
//         value.style.background = 'red';
//     })
// })

name1.addEventListener('keyup',()=>{
    document.getElementById('name-error').innerHTML=""
  })
password.addEventListener('keyup',()=>{
    document.getElementById('pass-error').innerHTML=""
    checkStrongpass()
  })
confirmpassword.addEventListener('keyup',()=>{
    document.getElementById('passmatch-error').innerHTML=""
  })
phone.addEventListener('keyup',()=>{
    document.getElementById('phone-error').innerHTML=""
  })


  function checkStrongpass(){
    let passError=document.getElementById('pass-error')
    // email.addEventListener('keyup',(k)=>{
        if(!password.value.match(passwordRegex)){
            passError.innerHTML='Strong Password Required<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';
            passValid=false;
            return false
        }
        passValid=true;
        passError.innerHTML='<i class="fa-solid fa-circle-check" style="color: #00a814;"></i>';
        return true;
    // })
}

  


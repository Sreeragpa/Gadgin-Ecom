document.getElementById('form').addEventListener('submit',(e)=>{
   
    const pass = document.getElementById('password').value;
    const confirmpass = document.getElementById('confirmpassword').value;
    if(pass!=confirmpass){
        e.preventDefault();
        document.getElementById('comparepass-error').innerHTML = "Password doesn't Match"

    }
    if(pass.length<6){
        e.preventDefault();
        document.getElementById('comparepass-error').innerHTML = "Passeord should be atleast 6 characters"

    }
})




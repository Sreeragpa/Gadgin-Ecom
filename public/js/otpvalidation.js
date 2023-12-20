var timeLeft = 59;
var elem = document.getElementById('otp-timer');
var timerId = setInterval(countdown, 1000);
var resendButton = document.getElementById('resendbutton')
var myForm = document.getElementById('form')
var flag=0;
function countdown() {
    if (timeLeft == -1) {
        clearTimeout(timerId);
        showResendbutton();
    } else {
        elem.innerHTML = timeLeft + ' seconds remaining';
        timeLeft--;
    }
}
    
function showResendbutton() {
        resendButton.classList.remove('deactivated')
}


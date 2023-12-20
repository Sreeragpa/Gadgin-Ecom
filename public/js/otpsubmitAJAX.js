
$(document).ready(function () {

document.getElementById('continue-btnn').addEventListener('click',(e)=>{
    e.preventDefault(); 
    var action = $('#form').attr('action');
    console.log(action);

    // Use AJAX to load content from the specified URL
    $.ajax({
        url: action,
        data: $('#form').serialize(),
        type: 'POST',
        success: function (data,textStatus, red) {

            var content = $(data).find('#resendbutton').html();

            if (content) {
                var element = $(data).find('#errorElement').html();
                $('#errorElement').html(element);
            } else {
                $('#form').submit();
            }
        },
        error: function () {
            // Handle error if the content cannot be loaded
            console.error('Failed to load content.');
        }
    });
});

})
    
    





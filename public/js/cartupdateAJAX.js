
$(document).ready(function () {
    
    // Attach click event to sidebar links
    var quantityselect = document.querySelectorAll('#quantity');    

    quantityselect.forEach((qtyseleted)=>{
        qtyseleted.addEventListener('change', function (e) {
            e.preventDefault(); 
            // Prevent the default behavior of the link
    
            // Get the href attribute of the clicked link
            var href = $(this).attr('data-pid');
            var quantity = qtyseleted.value;
            // Use AJAX to load content from the specified URL
            $.ajax({
                url: `${href}?qty=${quantity}`,
                type: 'PATCH',
                success: function (data) {
                    console.log('Success');
                },
                error: function () {
                    // Handle error if the content cannot be loaded
                    console.error('Failed to load content.');
                }
            });
        });
    })



});

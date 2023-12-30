document.querySelectorAll(".add-wishlist").forEach((element)=>{
    element.addEventListener('click',(e)=>{
        e.preventDefault()
        const href = element.getAttribute('href');
        $.ajax({
            url:href,
            method:"GET",
            success: function (data) {
       const samepage = $(data).find('#mywishlist').html();

       if(samepage){
        const finder = element.getAttribute('id');
        console.log(finder);
        const newelement = $(data).find(`#${finder}`);
        console.log(newelement);
        $(element).html(newelement.html());
       }
    },
    error: function () {
        console.error('Failed to load content.');
    }
        })
    })
})
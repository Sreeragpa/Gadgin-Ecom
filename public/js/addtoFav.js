document.querySelectorAll(".add-wishlist").forEach((element)=>{
    element.addEventListener('click',(e)=>{
        e.preventDefault()
        const href = element.getAttribute('href');
        $.ajax({
            url:href,
            method:"PUT",
            success: function (data) {
       const samepage = $(data).find('#mywishlist').html();

       if(samepage){
        const finder = element.getAttribute('id');
        console.log(finder);
        const newelement = $(data).find(`#${finder}`);
        console.log(newelement);
        $(element).html(newelement.html());
       }else{
        $('body').html(data)
       }
    },
    error: function () {
        console.error('Failed to load content.');
    }
        })
    })
})
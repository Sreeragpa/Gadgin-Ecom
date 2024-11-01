document.querySelectorAll(".add-wishlist").forEach((element) => {
    element.addEventListener('click', (e) => {
        e.preventDefault()
        const href = element.getAttribute('href');
        $.ajax({
            url: href,
            method: "PUT",
            success: function (data) {
                const samepage = $(data).find('#mywishlist').html();

                if (samepage) {
                    const finder = element.getAttribute('id');
    
                    const newelement = $(data).find(`#${finder}`);

                    $(element).html(newelement.html());
                } else {
                    $('body').html(data)
                }
            },
            error: function () {
                // window.location.href = '/login';
                window.location.replace('/login');
            }
        })
    })
})
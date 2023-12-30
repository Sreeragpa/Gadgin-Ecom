$("#btn1").click(function () {
    var currentScrollLeft = $("#myDiv").scrollLeft();
    $("#myDiv").animate({ scrollLeft: currentScrollLeft - 600 }, 500);
});

$("#btn2").click(function () {
    var currentScrollLeft = $("#myDiv").scrollLeft();
    $("#myDiv").animate({ scrollLeft: currentScrollLeft + 600 }, 500);
});
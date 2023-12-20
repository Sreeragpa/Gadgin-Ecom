document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.querySelector(".featured-products-container");
    const scrollContent = document.querySelector(".featured-products-scroll");
    const scrollAmount = 200; // Adjust as needed

    document.querySelector(".scroll-btnn-left").addEventListener("click", function () {
        scrollContainer.scrollLeft -= scrollAmount;
    });

    document.querySelector(".scroll-btnn-right").addEventListener("click", function () {
        scrollContainer.scrollLeft += scrollAmount;
    });
});

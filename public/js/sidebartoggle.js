document.getElementById("hamburger-menu").addEventListener("click", function() {
    console.log('clicked');
    document.getElementById("sidebar").classList.toggle("open");
    this.classList.toggle("active");
});

document.addEventListener("scroll", function() {
    // Check if the sidebar is overlapping with the footer
    if (isSidebarOverlappingFooter()) {
        closeSidebar();
    }
});


function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById('hamburger-menu').classList.remove("active")
}

function isSidebarOverlappingFooter() {
    const sidebar = document.getElementById("sidebar");
    const footer = document.getElementById("footer");
    const sidebarRect = sidebar.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    // Check if the bottom of the sidebar is below or equal to the top of the footer
    return sidebarRect.bottom >= footerRect.top;
}
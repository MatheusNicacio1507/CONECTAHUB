// ============================================
//  EXPANSÃO DO MENU LATERAL
// ============================================
const sidebar = document.getElementById('sidebar');

function isMobile() {
    return window.innerWidth <= 680;
}

sidebar.addEventListener('click', function (e) {
    if (isMobile()) return;

    if (
        !e.target.classList.contains('submenu-toggle') &&
        !e.target.closest('.submenu-toggle') &&
        !e.target.closest('.submenu')
    ) {
        sidebar.classList.toggle('expanded');
    }
});
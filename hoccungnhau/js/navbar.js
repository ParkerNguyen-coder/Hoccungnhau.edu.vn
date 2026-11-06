/* ==========================================================================
   HỌC CÙNG NHAU - NAVBAR (dropdown nhóm menu + phím tắt tìm kiếm)
   Desktop: dropdown mở bằng hover / focus (CSS). Mobile: bấm để mở (.open).
   Dropdown "Học Tập" (#nav-class-item) đã được app.js xử lý riêng.
   ========================================================================== */
(function () {
    function closeAll(except) {
        document.querySelectorAll('.nav-item.has-dropdown .dropdown-menu.open').forEach(function (m) {
            if (m !== except) m.classList.remove('open');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Nhóm dropdown mới: Ôn Luyện, Cộng Đồng
        document.querySelectorAll('.nav-item.has-dropdown:not(#nav-class-item) > .nav-link').forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                var menu = toggle.parentElement.querySelector('.dropdown-menu');
                if (!menu) return;
                closeAll(menu);
                menu.classList.toggle('open');
            });
        });

        // Bấm vào 1 mục trong dropdown => đóng menu + đóng drawer mobile
        document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
            item.addEventListener('click', function () {
                closeAll();
                if (document.activeElement) document.activeElement.blur();
                var nav = document.getElementById('site-nav-bar');
                if (nav) nav.classList.remove('mobile-active');
            });
        });

        // Bấm ra ngoài => đóng
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-item.has-dropdown')) closeAll();
        });

        // Ctrl+K hoặc "/" => mở ô tìm kiếm
        document.addEventListener('keydown', function (e) {
            var typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''));
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' || (e.key === '/' && !typing)) {
                e.preventDefault();
                var btn = document.getElementById('global-search-btn');
                if (btn) btn.click();
            }
            if (e.key === 'Escape') closeAll();
        });
    });
})();

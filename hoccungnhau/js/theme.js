/* ==========================================================================
   HỌC CÙNG NHAU - THEME SWITCHER (DARK / LIGHT MODE)
   ========================================================================== */

const ThemeService = {
    init: function() {
        const savedTheme = localStorage.getItem('hoccungnhau_theme') || 'dark';
        this.setTheme(savedTheme);
        
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    },
    
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hoccungnhau_theme', theme);
        
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggleBtn.title = theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ThemeService.init();
});

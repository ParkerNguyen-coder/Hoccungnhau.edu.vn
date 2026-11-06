/* ==========================================================================
   HỌC CÙNG NHAU - FORM ĐĂNG KÝ NHẬN TÀI LIỆU (footer)
   Lưu vào Firestore: collection "newsletter_signups"
   ========================================================================== */
const NewsletterService = {
    init: function () {
        const form = document.getElementById('newsletter-form');
        if (!form) return;
        form.addEventListener('submit', (e) => { e.preventDefault(); this.submit(); });

        const modal = document.getElementById('newsletter-success-modal');
        const close = () => modal && modal.classList.remove('active');
        ['newsletter-success-close', 'newsletter-success-ok'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', close);
        });
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    },

    showError: function (msg) {
        const el = document.getElementById('nl-error');
        if (!el) return;
        el.textContent = msg;
        el.style.display = msg ? 'block' : 'none';
    },

    submit: function () {
        const name = document.getElementById('nl-name').value.trim();
        const phone = document.getElementById('nl-phone').value.replace(/[\s.\-]/g, '');
        const email = document.getElementById('nl-email').value.trim();

        if (!name) return this.showError('⚠️ Vui lòng nhập họ và tên.');
        if (!/^(0|\+84)\d{9}$/.test(phone)) return this.showError('⚠️ Số điện thoại không hợp lệ (VD: 0901234567).');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return this.showError('⚠️ Email không hợp lệ.');
        this.showError('');

        if (!(typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.firestore)) {
            return this.showError('❌ Chưa kết nối được hệ thống, vui lòng thử lại sau.');
        }

        const btn = document.getElementById('nl-submit');
        btn.disabled = true;
        btn.textContent = '⏳ Đang gửi...';

        firebase.firestore().collection('newsletter_signups').add({
            name: name,
            phone: phone,
            email: email,
            createdAt: new Date().toISOString(),
            source: 'footer'
        }).then(() => {
            document.getElementById('newsletter-form').reset();
            const msg = document.getElementById('newsletter-success-msg');
            if (msg) msg.textContent = `Cảm ơn ${name}! Tài liệu ôn thi sẽ được gửi tới ${email}.`;
            const modal = document.getElementById('newsletter-success-modal');
            if (modal) modal.classList.add('active');
        }).catch((err) => {
            console.warn('Newsletter error:', err);
            this.showError('❌ Gửi không thành công, vui lòng thử lại.');
        }).finally(() => {
            btn.disabled = false;
            btn.textContent = '📩 Đăng Ký Nhận Tài Liệu';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => NewsletterService.init());

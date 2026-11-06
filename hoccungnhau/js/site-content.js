/* ==========================================================================
   HỌC CÙNG NHAU - SITE CONTENT (nội dung do Admin chỉnh, lưu Firestore)
   - Firestore: collection "site_config", document "content"
   - Dữ liệu mặc định vẫn nằm trong features-showcase.js / flashcards.js /
     news-data.js / ai-tutor.js. Admin sửa thì ghi đè lên bản mặc định.
   - Học viên: đọc từ cache localStorage ngay (không bị chớp), rồi cập nhật
     từ Firestore ở nền.
   - Nạp file này SAU features-showcase.js, flashcards.js, news-data.js,
     ai-tutor.js và TRƯỚC app.js.
   ========================================================================== */
const SiteContent = {
    CACHE_KEY: 'hoccungnhau_site_content',
    remote: {},      // phần dữ liệu đang có trên Firestore
    defaults: null,  // bản chụp dữ liệu mặc định trong code

    clone: function (v) { return JSON.parse(JSON.stringify(v)); },

    // Các "kho" dữ liệu sống (live). Sửa trực tiếp vào các đối tượng này.
    current: function () {
        const c = {};
        if (typeof FeatureShowcase !== 'undefined') {
            c.rooms = FeatureShowcase.studyRoomsData;
            c.pk = FeatureShowcase.pkQuestions;
            c.mistakes = FeatureShowcase.mistakesData;
            c.buddies = FeatureShowcase.buddiesData;
            c.viva = FeatureShowcase.vivaData;
            c.settings = FeatureShowcase.settings;
        }
        if (typeof FlashcardEngine !== 'undefined') c.flashcards = FlashcardEngine.cards;
        if (typeof NEWS_DATA !== 'undefined') c.news = NEWS_DATA;
        if (typeof TICKER_HEADLINES !== 'undefined') c.ticker = TICKER_HEADLINES;
        if (typeof AITutor !== 'undefined') {
            c.tutorRules = AITutor.rules;
            c.tutor = { welcome: AITutor.welcome, fallback: AITutor.fallback, chips: AITutor.chips };
        }
        return c;
    },

    _arr: function (target, src) {
        if (!Array.isArray(src)) return;
        target.length = 0;
        src.forEach(function (x) { target.push(x); });
    },
    _obj: function (target, src) {
        if (!src || typeof src !== 'object') return;
        Object.keys(target).forEach(function (k) { delete target[k]; });
        Object.assign(target, src);
    },

    // Ghi đè dữ liệu trong bộ nhớ bằng dữ liệu (từ cache hoặc Firestore)
    apply: function (d) {
        if (!d) return;
        const c = this.current();
        ['rooms', 'pk', 'mistakes', 'buddies', 'flashcards', 'news', 'ticker', 'tutorRules'].forEach((k) => {
            if (c[k]) this._arr(c[k], d[k]);
        });
        if (c.viva) this._obj(c.viva, d.viva);
        if (c.settings && d.settings) Object.assign(c.settings, d.settings);
        if (d.tutor && typeof AITutor !== 'undefined') {
            if (typeof d.tutor.welcome === 'string') AITutor.welcome = d.tutor.welcome;
            if (typeof d.tutor.fallback === 'string') AITutor.fallback = d.tutor.fallback;
            if (Array.isArray(d.tutor.chips)) AITutor.chips = d.tutor.chips;
        }
    },

    readCache: function () {
        try { return JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}') || {}; }
        catch (e) { return {}; }
    },
    writeCache: function () {
        try { localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.remote)); } catch (e) {}
    },

    docRef: function () {
        return firebase.firestore().collection('site_config').doc('content');
    },

    // Học viên + admin: tải từ Firestore
    load: function () {
        if (!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore)) {
            return Promise.resolve(false);
        }
        return this.docRef().get().then((doc) => {
            const data = doc.exists ? doc.data() : {};
            const changed = JSON.stringify(data) !== JSON.stringify(this.remote);
            this.remote = data;
            this.writeCache();
            if (changed) {
                this.apply(data);
                this.refreshViews();
            }
            return changed;
        }).catch(function (err) {
            console.warn('SiteContent: không đọc được site_config/content', err);
            return false;
        });
    },

    // Vẽ lại phần đang hiển thị nếu dữ liệu vừa đổi
    refreshViews: function () {
        if (typeof AITutor !== 'undefined' && AITutor.refreshUI) AITutor.refreshUI();
        if (typeof AppController !== 'undefined' && document.querySelector('.band-ecosystem')) {
            AppController.renderHome();
        }
    },

    // Admin: lưu 1 kho dữ liệu (key) lên Firestore
    save: function (key) {
        const live = this.current()[key];
        if (live === undefined) return Promise.reject(new Error('Unknown key ' + key));
        const value = this.clone(live);
        const payload = {};
        payload[key] = value;
        return this.docRef().set(payload, { merge: true }).then(() => {
            this.remote[key] = value;
            this.writeCache();
        });
    },

    // Admin: khôi phục 1 kho về dữ liệu mặc định trong code
    reset: function (key) {
        const def = this.defaults && this.defaults[key];
        if (def === undefined) return Promise.reject(new Error('No default for ' + key));
        this.apply(this._wrap(key, this.clone(def)));
        return this.docRef().set(this._wrap(key, this.clone(def)), { merge: true }).then(() => {
            this.remote[key] = this.clone(def);
            this.writeCache();
        });
    },
    _wrap: function (key, val) { const o = {}; o[key] = val; return o; },

    init: function () {
        // 1) chụp dữ liệu mặc định TRƯỚC khi áp cache
        this.defaults = this.clone(this.current());
        // 2) áp cache ngay (đồng bộ) để trang chủ render đúng từ lần đầu
        this.remote = this.readCache();
        this.apply(this.remote);
        this.ready = Promise.resolve();
    }
};

SiteContent.init();
// config-service.js khởi tạo Firebase ở DOMContentLoaded (đăng ký trước file này)
document.addEventListener('DOMContentLoaded', function () { SiteContent.ready = SiteContent.load(); });

function formatYouTubeEmbedUrl(url) {
    if (!url || url === "about:blank") return "https://www.youtube.com/embed/5MgBikgcWnY";
    url = url.trim();
    if (url.indexOf("/embed/") !== -1) {
        return url.split("?")[0].split("&")[0];
    }
    var videoId = "";
    if (url.indexOf("watch?v=") !== -1) {
        videoId = url.split("watch?v=")[1].split("&")[0].split("?")[0];
    } else if (url.indexOf("youtu.be/") !== -1) {
        videoId = url.split("youtu.be/")[1].split("?")[0].split("&")[0];
    } else if (url.indexOf("shorts/") !== -1) {
        videoId = url.split("shorts/")[1].split("?")[0].split("&")[0];
    } else if (url.length >= 8 && url.length <= 20 && url.indexOf("/") === -1 && url.indexOf(".") === -1) {
        videoId = url;
    }
    if (videoId) {
        return "https://www.youtube.com/embed/" + videoId;
    }
    return url;
}

/* ==========================================================================
   HỌC CÙNG NHAU - ADMIN SERVICE: ĐỒNG BỘ CÂU HỎI & VIDEO QUA FIRESTORE
   - Admin sửa câu hỏi/video => lưu vào Firestore, collection "course_content"
     (mỗi môn 1 document, id = key của môn).
   - Mọi máy khác lắng nghe (realtime) và áp bản mới lên dữ liệu gốc trong
     data-highschool.js / data-university.js.
   - Chỉ tải những document thay đổi từ lần đồng bộ trước (tiết kiệm lượt đọc).
   - Xóa/khôi phục bản gốc dùng "bia mộ" (reset:true) để máy khác cũng khôi phục.
   ========================================================================== */

const AdminService = {
    isAdminLoggedIn: false,
    COLLECTION: 'course_content',
    CACHE_KEY: 'hoccungnhau_course_sync',
    originals: {},   // bản gốc trong code, để khôi phục
    cache: { last: 0, docs: {} },
    started: false,

    init: function() {
        this.loadCustomData();
        this.bindEvents();
    },

    // ---- Danh sách môn (khớp với admin-page.js) ----
    courseRefs: function() {
        const m = {};
        [10, 11, 12].forEach(function(g) {
            (HIGHSCHOOL_DATA['grade_' + g] || []).forEach(function(s) { m['hs|' + g + '|' + s.id] = s; });
        });
        if (HIGHSCHOOL_DATA.thptqg) m['thptqg'] = HIGHSCHOOL_DATA.thptqg;
        UNIVERSITY_DATA.forEach(function(s) { m['uni|' + s.id] = s; });
        return m;
    },
    docId: function(key) { return key.replace(/[^a-zA-Z0-9_-]/g, '_'); },
    clone: function(v) { return JSON.parse(JSON.stringify(v)); },
    hasFirestore: function() {
        return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.firestore;
    },

    // ---- Khởi động ----
    loadCustomData: function() {
        try {
            this._base = [this.clone(HIGHSCHOOL_DATA), this.clone(UNIVERSITY_DATA)];
            const refs = this.courseRefs();
            // 1) Chụp bản gốc trước khi áp bất cứ chỉnh sửa nào
            Object.keys(refs).forEach((k) => {
                this.originals[k] = { quiz: this.clone(refs[k].quiz || []), videos: this.clone(refs[k].videos || []) };
            });
            // 1b) Chỉnh sửa cũ lưu trên trình duyệt (bản trước khi có Firestore) - chỉ còn hiệu lực
            //     trên máy admin để bấm "Đồng bộ tất cả" đưa lên Firestore một lần.
            this.loadLegacy();
            // 2) Cache lần đồng bộ trước (hiện ngay, không chờ mạng)
            try { this.cache = JSON.parse(localStorage.getItem(this.CACHE_KEY)) || this.cache; } catch (e) {}
            if (!this.cache.docs) this.cache = { last: 0, docs: {} };
            Object.keys(this.cache.docs).forEach((k) => this.applyDoc(k, this.cache.docs[k]));
            // 3) Lắng nghe thay đổi từ Firestore
            this.startListening();
        } catch (e) {
            console.warn('⚠️ Load Course Content Warning:', e);
        }
    },

    computeHash: function(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
        return String(h);
    },
    loadLegacy: function() {
        try {
            const savedHs = localStorage.getItem('hoccungnhau_custom_hs_data');
            const savedUni = localStorage.getItem('hoccungnhau_custom_uni_data');
            if (!savedHs && !savedUni) return;
            // So khớp với bản gốc đã lưu lúc đó; nếu file data đã đổi thì bỏ cache cũ
            const base = this.computeHash(JSON.stringify(this._base[0]) + JSON.stringify(this._base[1]));
            if (localStorage.getItem('hoccungnhau_custom_base_hash') !== base) { this.clearLegacy(); return; }
            if (savedHs) Object.assign(HIGHSCHOOL_DATA, JSON.parse(savedHs));
            if (savedUni) { const p = JSON.parse(savedUni); UNIVERSITY_DATA.length = 0; UNIVERSITY_DATA.push(...p); }
        } catch (e) { console.warn('⚠️ Legacy data warning:', e); }
    },
    clearLegacy: function() {
        ['hoccungnhau_custom_hs_data', 'hoccungnhau_custom_uni_data', 'hoccungnhau_custom_base_hash']
            .forEach(function(k) { localStorage.removeItem(k); });
    },

    applyDoc: function(key, d) {
        const ref = this.courseRefs()[key];
        if (!ref || !d) return;
        if (d.reset) {
            const o = this.originals[key];
            if (o) { ref.quiz = this.clone(o.quiz); ref.videos = this.clone(o.videos); }
            return;
        }
        if (Array.isArray(d.quiz)) ref.quiz = d.quiz;
        if (Array.isArray(d.videos)) ref.videos = d.videos;
    },

    saveCache: function() {
        try { localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache)); } catch (e) {}
    },

    startListening: function() {
        if (this.started || !this.hasFirestore()) return;
        this.started = true;
        firebase.firestore().collection(this.COLLECTION)
            .where('updatedAt', '>', new Date(this.cache.last || 0))
            .onSnapshot((snap) => {
                let touched = false;
                snap.docChanges().forEach((ch) => {
                    if (ch.type === 'removed') return;
                    const pending = ch.doc.metadata.hasPendingWrites;   // ghi cục bộ chưa lên server
                    const d = ch.doc.data({ serverTimestamps: 'estimate' });
                    if (!d.key) return;
                    this.applyDoc(d.key, d);
                    if (pending) return;                                  // chờ server xác nhận mới ghi cache
                    this.cache.docs[d.key] = { quiz: d.quiz || null, videos: d.videos || null, reset: !!d.reset };
                    const t = d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : 0;
                    if (t > this.cache.last) this.cache.last = t;
                    touched = true;
                });
                if (touched) this.saveCache();
            }, (err) => console.warn('⚠️ course_content listener:', err));
    },

    // ---- Admin: ghi lên Firestore ----
    payload: function(key, reset) {
        const ref = this.courseRefs()[key];
        const u = firebase.auth && firebase.auth().currentUser;
        return {
            key: key,
            quiz: reset ? null : this.clone(ref.quiz || []),
            videos: reset ? null : this.clone(ref.videos || []),
            reset: !!reset,
            updatedBy: u ? u.uid : null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    },

    // Lưu 1 môn (câu hỏi + video) cho toàn hệ thống
    saveCourse: function(key) {
        if (!this.hasFirestore()) return Promise.reject(new Error('Firestore chưa sẵn sàng'));
        return firebase.firestore().collection(this.COLLECTION).doc(this.docId(key)).set(this.payload(key, false));
    },

    // Khôi phục 1 môn về bản gốc trong code (cho mọi máy)
    resetCourse: function(key) {
        if (!this.hasFirestore()) return Promise.reject(new Error('Firestore chưa sẵn sàng'));
        this.applyDoc(key, { reset: true });
        return firebase.firestore().collection(this.COLLECTION).doc(this.docId(key)).set(this.payload(key, true));
    },

    // Đẩy toàn bộ môn hiện có lên Firestore (dùng 1 lần để khởi tạo)
    syncAll: function() {
        if (!this.hasFirestore()) return Promise.reject(new Error('Firestore chưa sẵn sàng'));
        const db = firebase.firestore();
        const keys = Object.keys(this.courseRefs());
        const jobs = [];
        for (let i = 0; i < keys.length; i += 400) {
            const batch = db.batch();
            keys.slice(i, i + 400).forEach((k) => batch.set(db.collection(this.COLLECTION).doc(this.docId(k)), this.payload(k, false)));
            jobs.push(batch.commit());
        }
        return Promise.all(jobs).then(() => { this.clearLegacy(); return keys.length; });
    },

    // Giao diện quản trị nằm ở admin.html (js/admin-page.js).
    bindEvents: function() {}
};

document.addEventListener("DOMContentLoaded", () => AdminService.init());

/* ==========================================================================
   HỌC CÙNG NHAU - TRANG QUẢN TRỊ (admin.html)
   - Quyền Admin lấy từ Firestore: users/{uid}.role === 'Admin'
   - Không còn mật khẩu cứng, không còn kiểm tra theo email.
   - Câu hỏi/video lưu Firestore (course_content, qua AdminService) => đồng bộ cho mọi máy.
   ========================================================================== */
(function () {
    var $ = function (s) { return document.querySelector(s); };
    var esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };
    var state = { course: null, editing: null, me: null };

    /* ---------- Quyền truy cập ---------- */
    function deny(title, msg) {
        $('#admin-app').hidden = true;
        $('#admin-gate').hidden = false;
        $('#gate-title').textContent = title;
        $('#gate-msg').textContent = msg || '';
        $('#gate-home').hidden = false;
    }

    function boot() {
        if (!(window.firebase && firebase.auth && firebase.apps.length)) {
            return deny('Không kết nối được hệ thống', 'Không tải được Firebase nên không thể xác minh quyền quản trị.');
        }
        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) return deny('Bạn chưa đăng nhập', 'Hãy đăng nhập bằng tài khoản quản trị ở trang chủ rồi quay lại.');
            firebase.firestore().collection('users').doc(user.uid).get().then(function (doc) {
                if (doc.exists && doc.data().role === 'Admin') start(user, doc.data());
                else deny('Không đủ quyền truy cập', 'Tài khoản này không phải quản trị viên.');
            }).catch(function () {
                deny('Không đọc được quyền', 'Kiểm tra kết nối mạng hoặc Firestore Rules.');
            });
        });
    }

    function start(user, profile) {
        state.me = user;
        $('#admin-gate').hidden = true;
        $('#admin-app').hidden = false;
        $('#admin-user-label').textContent = '👤 ' + (profile.name || user.email);
        var out = $('#admin-logout');
        out.hidden = false;
        out.onclick = function () { firebase.auth().signOut().then(function () { location.href = 'index.html'; }); };
        window.addEventListener('hashchange', route);
        route();
    }

    /* ---------- Dữ liệu ---------- */
    function courses() {
        var list = [];
        [10, 11, 12].forEach(function (g) {
            (HIGHSCHOOL_DATA['grade_' + g] || []).forEach(function (s) {
                list.push({ key: 'hs|' + g + '|' + s.id, label: 'Lớp ' + g + ' – ' + s.title, ref: s });
            });
        });
        if (HIGHSCHOOL_DATA.thptqg) list.push({ key: 'thptqg', label: 'Ôn thi THPTQG – ' + HIGHSCHOOL_DATA.thptqg.title, ref: HIGHSCHOOL_DATA.thptqg });
        UNIVERSITY_DATA.forEach(function (s) { list.push({ key: 'uni|' + s.id, label: 'Đại học – ' + s.title, ref: s }); });
        return list;
    }
    function current() {
        var l = courses();
        return l.filter(function (c) { return c.key === state.course; })[0] || l[0];
    }
    function courseSelect() {
        var cur = current();
        return '<select id="course-select">' + courses().map(function (c) {
            return '<option value="' + esc(c.key) + '"' + (c.key === cur.key ? ' selected' : '') + '>' + esc(c.label) + '</option>';
        }).join('') + '</select>';
    }
    // Lưu môn đang chọn lên Firestore => mọi máy khác tự cập nhật
    function persist(msg) {
        var c = current();
        AdminService.saveCourse(c.key)
            .then(function () { toast((msg || 'Đã lưu') + ' · đã đồng bộ cho mọi học viên'); })
            .catch(function (e) { console.warn(e); toast('Không lưu được lên Firestore (kiểm tra Rules cho course_content)', true); });
    }
    function toast(msg, isErr) {
        var t = document.createElement('div');
        t.className = 'admin-toast' + (isErr ? ' err' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2200);
    }

    /* ---------- Điều hướng ---------- */
    var views = { overview: vOverview, questions: vQuestions, videos: vVideos, users: vUsers, leads: vLeads };
    // Cho phép admin-content.js đăng ký thêm các màn hình quản trị
    window.AdminViews = views;
    window.AdminKit = { $: $, esc: esc, head: null, toast: null };
    function route() {
        var name = (location.hash || '#/overview').replace('#/', '');
        if (!views[name]) name = 'overview';
        document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === name); });
        state.editing = null;
        views[name]();
    }
    function head(title, tools) {
        return '<div class="admin-head"><h1>' + title + '</h1><div class="admin-tools">' + (tools || '') + '</div></div>';
    }

    window.AdminKit.head = head;
    window.AdminKit.toast = toast;

    /* ---------- Tổng quan ---------- */
    function vOverview() {
        var subj = 0, vids = 0, qs = 0;
        courses().forEach(function (c) { subj++; vids += (c.ref.videos || []).length; qs += (c.ref.quiz || []).length; });
        $('#admin-view').innerHTML = head('📊 Tổng quan') +
            '<div class="stat-grid">' +
            [['Môn / chuyên đề', subj], ['Video bài giảng', vids], ['Câu hỏi trắc nghiệm', qs]].map(function (s) {
                return '<div class="stat-card"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>';
            }).join('') + '</div>' +
            '<div class="admin-card">Chọn mục ở menu bên trái để thêm, sửa, xóa nội dung.</div>';
    }

    /* ---------- Câu hỏi ---------- */
    function vQuestions() {
        var c = current();
        if (!c.ref.quiz) c.ref.quiz = [];
        var qs = c.ref.quiz;
        $('#admin-view').innerHTML =
            head('🎯 Ngân hàng câu hỏi', courseSelect() + '<button class="btn-gradient" data-act="q-new">＋ Thêm câu hỏi</button>' + '<button class="btn-icon" data-act="reset-course" title="Bỏ chỉnh sửa của môn này, quay về dữ liệu gốc trong code">↺ Khôi phục bản gốc</button>' + '<button class="btn-icon" data-act="sync-all" title="Đẩy toàn bộ môn lên Firestore (dùng lần đầu)">☁️ Đồng bộ tất cả</button>') +
            (state.editing !== null ? qForm(qs) : '') +
            '<div class="admin-card"><table class="admin-table"><thead><tr><th>#</th><th>Câu hỏi</th><th>Đáp án</th><th></th></tr></thead><tbody>' +
            (qs.length ? qs.map(function (q, i) {
                return '<tr><td>' + (i + 1) + '</td><td>' + esc(String(q.question).slice(0, 110)) + '</td>' +
                    '<td><span class="pill">' + 'ABCD'[q.correctIndex] + '</span></td>' +
                    '<td class="act"><button class="btn-icon" data-act="q-edit" data-i="' + i + '">✏️ Sửa</button>' +
                    '<button class="btn-icon danger" data-act="q-del" data-i="' + i + '">🗑️ Xóa</button></td></tr>';
            }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Chưa có câu hỏi nào.</td></tr>') +
            '</tbody></table></div>';
        if (state.editing !== null) { var f = $('#q-form'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }

    function qForm(qs) {
        var isNew = state.editing === 'new';
        var q = isNew ? { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' } : qs[state.editing];
        var strip = function (o) { return String(o || '').replace(/^[A-D]\.\s*/, ''); };
        return '<form class="admin-card q-form" id="q-form"><h3 style="margin-bottom:12px">' +
            (isNew ? 'Thêm câu hỏi mới' : 'Sửa câu ' + (state.editing + 1)) + '</h3>' +
            '<label>Nội dung câu hỏi<textarea name="question" required>' + esc(q.question) + '</textarea></label>' +
            '<div class="opt-grid">' + [0, 1, 2, 3].map(function (i) {
                return '<label class="opt-row"><span class="opt-letter">' + 'ABCD'[i] + '</span>' +
                    '<input name="opt' + i + '" required placeholder="Đáp án ' + 'ABCD'[i] + '" value="' + esc(strip(q.options[i])) + '">' +
                    '<span class="opt-correct"><input type="radio" name="correct" value="' + i + '"' + (q.correctIndex === i ? ' checked' : '') + '> Đúng</span></label>';
            }).join('') + '</div>' +
            '<label>Giải thích đáp án<textarea name="explanation" required>' + esc(q.explanation) + '</textarea></label>' +
            '<div class="form-actions"><button class="btn-gradient" type="submit">💾 Lưu câu hỏi</button>' +
            '<button class="btn-icon" type="button" data-act="q-cancel">Hủy</button></div></form>';
    }

    function saveQuestion(form) {
        var qs = current().ref.quiz, d = new FormData(form);
        var item = {
            question: d.get('question').trim(),
            options: [0, 1, 2, 3].map(function (i) { return 'ABCD'[i] + '. ' + d.get('opt' + i).trim(); }),
            correctIndex: parseInt(d.get('correct'), 10) || 0,
            explanation: d.get('explanation').trim()
        };
        if (state.editing === 'new') qs.push(item); else qs[state.editing] = item;
        state.editing = null;
        persist('Đã lưu câu hỏi');
        vQuestions();
    }

    /* ---------- Video ---------- */
    function vVideos() {
        var c = current();
        if (!c.ref.videos) c.ref.videos = [];
        $('#admin-view').innerHTML =
            head('📹 Video bài giảng', courseSelect() + '<button class="btn-gradient" data-act="v-new">＋ Thêm video</button>') +
            '<div class="admin-card">' + (c.ref.videos.length ? c.ref.videos.map(function (v, i) {
                return '<div class="video-card" data-i="' + i + '">' +
                    '<div><label>Tiêu đề</label><input name="title" value="' + esc(v.title) + '"></div>' +
                    '<div><label>Mô tả</label><input name="description" value="' + esc(v.description) + '"></div>' +
                    '<div><label>Link YouTube</label><input name="embedUrl" value="' + esc(v.embedUrl) + '"></div>' +
                    '<div class="vbtns"><button class="btn-gradient" data-act="v-save" data-i="' + i + '">💾</button>' +
                    '<button class="btn-icon danger" data-act="v-del" data-i="' + i + '">🗑️</button></div></div>';
            }).join('') : '<p style="color:var(--text-muted)">Chưa có video nào.</p>') + '</div>';
    }

    /* ---------- Học viên (Firestore) ---------- */
    function vUsers() {
        var box = $('#admin-view');
        box.innerHTML = head('👥 Học viên') + '<div class="admin-card" id="users-box">Đang tải...</div>';
        firebase.firestore().collection('users').limit(200).get().then(function (snap) {
            var rows = [];
            snap.forEach(function (d) { rows.push(d.data()); });
            $('#users-box').innerHTML = '<table class="admin-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th></th></tr></thead><tbody>' +
                rows.map(function (u) {
                    var me = state.me && u.uid === state.me.uid;
                    return '<tr><td>' + esc(u.name) + '</td><td>' + esc(u.email) + '</td><td>' +
                        '<select data-role-for="' + esc(u.uid) + '"' + (me ? ' disabled' : '') + ' style="width:auto">' +
                        ['Học Viên', 'Admin'].map(function (r) { return '<option' + (u.role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') +
                        '</select></td><td class="act">' + (me ? '<span class="pill">Bạn</span>' :
                            '<button class="btn-icon" data-act="u-role" data-uid="' + esc(u.uid) + '">💾 Lưu</button>') + '</td></tr>';
                }).join('') + '</tbody></table>';
        }).catch(function () {
            $('#users-box').textContent = 'Không đọc được danh sách. Kiểm tra Firestore Rules (admin cần quyền đọc collection users).';
        });
    }

    /* ---------- Đăng ký nhận tài liệu (Firestore: newsletter_signups) ---------- */
    function vLeads() {
        $('#admin-view').innerHTML =
            head('📩 Đăng ký nhận tài liệu',
                '<input id="lead-search" placeholder="Tìm tên, SĐT, email..." style="width:240px">' +
                '<button class="btn-gradient" data-act="l-csv">⬇️ Tải CSV</button>') +
            '<div class="admin-card" id="leads-box">Đang tải...</div>';
        firebase.firestore().collection('newsletter_signups').orderBy('createdAt', 'desc').limit(500).get().then(function (snap) {
            state.leads = [];
            snap.forEach(function (d) { var x = d.data(); x.id = d.id; state.leads.push(x); });
            renderLeads('');
        }).catch(function () {
            $('#leads-box').textContent = 'Không đọc được danh sách. Kiểm tra đã Publish Firestore Rules mới chưa.';
        });
    }
    function renderLeads(q) {
        q = (q || '').toLowerCase();
        var rows = state.leads.filter(function (l) {
            return !q || (l.name + ' ' + l.phone + ' ' + l.email).toLowerCase().indexOf(q) > -1;
        });
        $('#leads-box').innerHTML =
            '<p style="margin-bottom:10px;color:var(--text-muted)">Hiển thị <b>' + rows.length + '</b> / ' + state.leads.length + ' người đăng ký</p>' +
            '<table class="admin-table"><thead><tr><th>Họ tên</th><th>Số điện thoại</th><th>Email</th><th>Thời gian</th><th></th></tr></thead><tbody>' +
            (rows.length ? rows.map(function (l) {
                return '<tr><td>' + esc(l.name) + '</td><td>' + esc(l.phone) + '</td><td>' + esc(l.email) + '</td><td>' +
                    esc(new Date(l.createdAt).toLocaleString('vi-VN')) + '</td>' +
                    '<td class="act"><button class="btn-icon danger" data-act="l-del" data-id="' + esc(l.id) + '">🗑️ Xóa</button></td></tr>';
            }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Chưa có ai đăng ký.</td></tr>') +
            '</tbody></table>';
    }
    function exportLeadsCsv() {
        var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
        var lines = [['Họ tên', 'Số điện thoại', 'Email', 'Thời gian'].map(q).join(',')];
        state.leads.forEach(function (l) {
            // ="0901..." để Excel giữ số 0 đầu của số điện thoại
            lines.push([q(l.name), q('="' + l.phone + '"'), q(l.email), q(new Date(l.createdAt).toLocaleString('vi-VN'))].join(','));
        });
        var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dang-ky-tai-lieu-' + new Date().toISOString().slice(0, 10) + '.csv';
        document.body.appendChild(a); a.click(); a.remove();
    }

    /* ---------- Sự kiện (ủy quyền) ---------- */
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.dataset.act, i = parseInt(b.dataset.i, 10), c;
        if (act === 'reset-course') {
            if (confirm('Khôi phục môn này về dữ liệu gốc trong code? Mọi chỉnh sửa của môn sẽ mất trên TẤT CẢ máy.')) {
                AdminService.resetCourse(current().key)
                    .then(function () { toast('Đã khôi phục bản gốc cho mọi máy'); route(); })
                    .catch(function () { toast('Không khôi phục được (kiểm tra Rules)', true); });
            }
        } else if (act === 'sync-all') {
            if (confirm('Đẩy dữ liệu câu hỏi/video của TẤT CẢ môn (đang hiển thị ở máy này) lên Firestore?')) {
                AdminService.syncAll()
                    .then(function (n) { toast('Đã đồng bộ ' + n + ' môn lên Firestore'); })
                    .catch(function () { toast('Không đồng bộ được (kiểm tra Rules)', true); });
            }
        } else if (act === 'q-new') { state.editing = 'new'; vQuestions(); }
        else if (act === 'q-edit') { state.editing = i; vQuestions(); }
        else if (act === 'q-cancel') { state.editing = null; vQuestions(); }
        else if (act === 'q-del') {
            if (confirm('Xóa câu hỏi số ' + (i + 1) + '?')) { current().ref.quiz.splice(i, 1); persist('Đã xóa'); vQuestions(); }
        } else if (act === 'v-new') {
            current().ref.videos.push({ title: 'Video mới', description: '', embedUrl: '' }); persist('Đã thêm video'); vVideos();
        } else if (act === 'v-save') {
            c = current(); var card = b.closest('.video-card');
            c.ref.videos[i] = {
                title: card.querySelector('[name=title]').value.trim(),
                description: card.querySelector('[name=description]').value.trim(),
                embedUrl: formatYouTubeEmbedUrl(card.querySelector('[name=embedUrl]').value)
            };
            persist('Đã lưu video'); vVideos();
        } else if (act === 'v-del') {
            if (confirm('Xóa video này?')) { current().ref.videos.splice(i, 1); persist('Đã xóa'); vVideos(); }
        } else if (act === 'l-csv') {
            exportLeadsCsv();
        } else if (act === 'l-del') {
            if (confirm('Xóa người đăng ký này?')) {
                firebase.firestore().collection('newsletter_signups').doc(b.dataset.id).delete().then(function () {
                    state.leads = state.leads.filter(function (l) { return l.id !== b.dataset.id; });
                    renderLeads(($('#lead-search') || {}).value);
                    toast('Đã xóa');
                }).catch(function () { toast('Không có quyền xóa (kiểm tra Firestore Rules)', true); });
            }
        } else if (act === 'u-role') {
            var uid = b.dataset.uid, role = document.querySelector('[data-role-for="' + uid + '"]').value;
            firebase.firestore().collection('users').doc(uid).update({ role: role })
                .then(function () { toast('Đã cập nhật vai trò'); })
                .catch(function () { toast('Không có quyền ghi (kiểm tra Firestore Rules)', true); });
        }
    });
    document.addEventListener('change', function (e) {
        if (e.target.id === 'course-select') {
            state.course = e.target.value; state.editing = null;
            ((location.hash || '').indexOf('videos') > -1 ? vVideos : vQuestions)();
        }
    });
    document.addEventListener('submit', function (e) {
        if (e.target.id === 'q-form') { e.preventDefault(); saveQuestion(e.target); }
    });

    document.addEventListener('input', function (e) {
        if (e.target.id === 'lead-search') renderLeads(e.target.value);
    });

    document.addEventListener('DOMContentLoaded', boot);
})();

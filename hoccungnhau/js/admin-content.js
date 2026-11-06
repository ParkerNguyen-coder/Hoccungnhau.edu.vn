/* ==========================================================================
   HỌC CÙNG NHAU - QUẢN TRỊ NỘI DUNG TÍNH NĂNG MỚI (admin.html)
   Phòng học chung · Đấu trường PK · Vấn đáp AI · Sổ tay câu sai ·
   Bạn cùng tiến · AI Tutor · Flashcards · Tin tức & chữ chạy · Số liệu
   - Dữ liệu lưu Firestore: site_config/content (qua SiteContent)
   - Cần admin-page.js (AdminKit, AdminViews) và site-content.js nạp trước.
   ========================================================================== */
(function () {
    var K = window.AdminKit, V = window.AdminViews;
    if (!K || !V || typeof SiteContent === 'undefined') return;
    var esc = K.esc, $ = K.$;
    var st = { editing: null };   // { key, idx }  idx: số thứ tự hoặc 'new'

    var TAG = { pomodoro: 'pomo', english: 'eng', qa: 'qa' };
    var strip = function (o) { return String(o || '').replace(/^[A-D]\.\s*/, ''); };
    var plain = function (h) { return String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); };
    var cut = function (t, n) { t = String(t || ''); return t.length > n ? t.slice(0, n) + '…' : t; };
    var nextId = function (list) { return list.reduce(function (m, x) { return Math.max(m, +x.id || 0); }, 0) + 1; };

    /* ---------- Kiểu field dùng lại ---------- */
    function linesField(n, l, hint) {
        return { n: n, l: l, t: 'area', hint: hint,
            get: function (o) { return (o[n] || []).join('\n'); },
            set: function (o, v) { o[n] = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); } };
    }
    function dialogField(n, l) {
        return { n: n, l: l, t: 'area', rows: 7,
            hint: 'Mỗi dòng 1 lượt nói: <b>ai | nội dung</b> (AI nói) hoặc <b>user | nội dung</b> (học viên nói). Được dùng thẻ HTML như &lt;code&gt;.',
            get: function (o) { return (o[n] || []).map(function (m) { return m.role + ' | ' + m.text; }).join('\n'); },
            set: function (o, v) {
                o[n] = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (line) {
                    var i = line.indexOf(' | ');
                    var role = i > -1 ? line.slice(0, i).trim().toLowerCase() : 'ai';
                    return { role: role === 'user' ? 'user' : 'ai', text: i > -1 ? line.slice(i + 3).trim() : line };
                });
            } };
    }

    /* ---------- Cấu hình từng mục ---------- */
    var CFG = {
        rooms: {
            kind: 'list', title: '🏠 Phòng học chung', add: '＋ Thêm phòng',
            blank: function (list) { return { id: 'room-' + Date.now(), type: 'pomodoro', badge: '🍅 25/5', tagClass: 'pomo', title: '', topic: '', host: '', members: 0, maxMembers: 25, timer: '25:00', avatars: ['👩‍🎓', '👨‍🎓'] }; },
            heads: ['Nhãn', 'Tên phòng', 'Trưởng phòng', 'Thành viên'],
            row: function (r) { return [esc(r.badge), esc(r.title), esc(r.host), esc(r.members + '/' + r.maxMembers)]; },
            post: function (it) { it.tagClass = TAG[it.type] || 'pomo'; },
            fields: [
                { n: 'type', l: 'Loại phòng', t: 'select', opts: [['pomodoro', '🍅 Pomodoro'], ['english', '🎙️ Tiếng Anh'], ['qa', '🙋 Giải bài']] },
                { n: 'badge', l: 'Nhãn hiển thị (VD: 🍅 25/5)', t: 'text', req: 1 },
                { n: 'title', l: 'Tên phòng', t: 'text', req: 1 },
                { n: 'topic', l: 'Chủ đề', t: 'text' },
                { n: 'host', l: 'Trưởng phòng', t: 'text' },
                { n: 'members', l: 'Số người đang trong phòng', t: 'num' },
                { n: 'maxMembers', l: 'Sức chứa tối đa', t: 'num' },
                { n: 'timer', l: 'Đồng hồ / trạng thái (VD: 18:42, Đang mở Mic)', t: 'text' },
                { n: 'avatars', l: 'Avatar thành viên (emoji, cách nhau bởi dấu cách)', t: 'text',
                    get: function (o) { return (o.avatars || []).join(' '); },
                    set: function (o, v) { o.avatars = v.split(/[\s,]+/).filter(Boolean); } }
            ]
        },

        pk: {
            kind: 'list', title: '⚔️ Đấu trường PK – Ngân hàng câu hỏi', add: '＋ Thêm câu hỏi PK',
            hint: 'Danh sách môn ở sảnh PK và số liệu "trận đang đấu" chỉnh ở mục <a href="#/settings">⚙️ Số liệu & môn PK</a>.',
            blank: function () { return { subject: 'Toán 12', q: '', opts: ['A. ', 'B. ', 'C. ', 'D. '], correct: 0 }; },
            heads: ['#', 'Môn', 'Câu hỏi', 'Đáp án'],
            row: function (q, i) { return [i + 1, esc(q.subject), esc(cut(q.q, 90)), '<span class="pill">' + 'ABCD'[q.correct] + '</span>']; },
            fields: [
                { n: 'subject', l: 'Môn', t: 'text', req: 1 },
                { n: 'q', l: 'Nội dung câu hỏi', t: 'area', req: 1 },
                { t: 'opts', optKey: 'opts', correctKey: 'correct' }
            ]
        },

        mistakes: {
            kind: 'list', title: '📕 Sổ tay phục thù câu sai', add: '＋ Thêm câu sai mẫu',
            blank: function () { return { id: Date.now(), subject: 'Toán 12', source: '', streak: 0, question: '', options: ['A. ', 'B. ', 'C. ', 'D. '], correctIndex: 0, explanation: '' }; },
            heads: ['#', 'Môn', 'Câu hỏi', 'Tiến độ', 'Đáp án'],
            row: function (m, i) { return [i + 1, esc(m.subject), esc(cut(m.question, 80)), esc((m.streak || 0) + '/3'), '<span class="pill">' + 'ABCD'[m.correctIndex] + '</span>']; },
            fields: [
                { n: 'subject', l: 'Môn (nên bắt đầu bằng Toán / Vật Lý / Hóa để lọc tab)', t: 'text', req: 1 },
                { n: 'source', l: 'Nguồn (VD: Sai từ PK #902)', t: 'text' },
                { n: 'streak', l: 'Số lần đã làm đúng (0–3)', t: 'num' },
                { n: 'question', l: 'Nội dung câu hỏi', t: 'area', req: 1 },
                { t: 'opts', optKey: 'options', correctKey: 'correctIndex' },
                { n: 'explanation', l: 'Giải thích đáp án', t: 'area', req: 1 }
            ]
        },

        buddies: {
            kind: 'list', title: '🤝 Bạn cùng tiến', add: '＋ Thêm bạn học',
            blank: function (list) { return { id: nextId(list), name: '', grade: '', avatar: '🧑‍🎓', streak: 0, todayDone: '0/2', status: '', online: true, messages: [] }; },
            heads: ['Tên', 'Lớp', 'Chuỗi', 'Trạng thái'],
            row: function (b) { return [esc(b.avatar + ' ' + b.name), esc(b.grade), '🔥 ' + esc(b.streak), esc(b.status)]; },
            fields: [
                { n: 'name', l: 'Họ tên', t: 'text', req: 1 },
                { n: 'grade', l: 'Lớp / Trường', t: 'text' },
                { n: 'avatar', l: 'Avatar (1 emoji)', t: 'text' },
                { n: 'streak', l: 'Chuỗi ngày học liên tiếp 🔥', t: 'num' },
                { n: 'todayDone', l: 'Hôm nay hoàn thành (VD: 2/2)', t: 'text' },
                { n: 'status', l: 'Trạng thái', t: 'text' },
                { n: 'online', l: 'Đang online', t: 'check' },
                { n: 'messages', l: 'Thẻ tin nhắn', t: 'area', rows: 5,
                    hint: 'Mỗi dòng 1 thẻ:<br><b>invite | Tiêu đề | Mô tả | study-rooms</b> (hoặc <b>pk-arena</b>)<br><b>question | Tiêu đề | Mô tả | Lời giải</b>',
                    get: function (o) {
                        return (o.messages || []).map(function (m) {
                            return [m.type, m.title, m.sub, m.type === 'invite' ? (m.actionRoute || 'study-rooms') : (m.reply || '')].join(' | ');
                        }).join('\n');
                    },
                    set: function (o, v) {
                        o.messages = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (line) {
                            var p = line.split(' | ').map(function (x) { return x.trim(); });
                            var extra = p.slice(3).join(' | ');
                            if (p[0] === 'invite') return { type: 'invite', from: o.name, title: p[1] || '', sub: p[2] || '', actionRoute: extra || 'study-rooms' };
                            return { type: 'question', from: o.name, title: p[1] || '', sub: p[2] || '', reply: extra };
                        });
                    } }
            ]
        },

        flashcards: {
            kind: 'list', title: '🎴 Flashcards', add: '＋ Thêm thẻ',
            blank: function () { return { front: '', back: '', cat: '' }; },
            heads: ['#', 'Mặt trước', 'Mặt sau', 'Chủ đề'],
            row: function (c, i) { return [i + 1, esc(cut(c.front, 70)), esc(cut(c.back, 70)), esc(c.cat)]; },
            fields: [
                { n: 'front', l: 'Mặt trước (câu hỏi)', t: 'area', req: 1 },
                { n: 'back', l: 'Mặt sau (đáp án)', t: 'area', req: 1 },
                { n: 'cat', l: 'Chủ đề / môn', t: 'text' }
            ]
        },

        news: {
            kind: 'list', title: '📰 Tin tức', add: '＋ Thêm bài viết',
            blank: function (list) { return { id: nextId(list), title: '', category: '', date: new Date().toLocaleDateString('vi-VN'), summary: '', url: 'https://' }; },
            heads: ['Ngày', 'Tiêu đề', 'Chuyên mục'],
            row: function (n) { return [esc(n.date), esc(cut(n.title, 80)), esc(n.category)]; },
            fields: [
                { n: 'title', l: 'Tiêu đề', t: 'text', req: 1 },
                { n: 'category', l: 'Chuyên mục', t: 'text' },
                { n: 'date', l: 'Ngày (dd/mm/yyyy)', t: 'text' },
                { n: 'summary', l: 'Tóm tắt', t: 'area' },
                { n: 'url', l: 'Link bài viết', t: 'text' }
            ]
        },

        tutorRules: {
            kind: 'list', title: '🧠 AI Tutor – Quy tắc trả lời', add: '＋ Thêm chủ đề',
            hint: 'AI Tutor kiểm tra <b>từ trên xuống dưới</b>: câu hỏi chứa một trong các từ khóa nào trước thì dùng câu trả lời đó. Dùng nút ↑ ↓ để đổi thứ tự (từ khóa ngắn như "lý", "anh" nên để cuối).',
            movable: true,
            blank: function () { return { name: '', keywords: [], answer: '' }; },
            heads: ['#', 'Chủ đề', 'Từ khóa', 'Trả lời'],
            row: function (r, i) { return [i + 1, esc(r.name), esc((r.keywords || []).join(', ')), esc(cut(plain(r.answer), 70))]; },
            fields: [
                { n: 'name', l: 'Tên chủ đề (để bạn dễ nhớ)', t: 'text', req: 1 },
                { n: 'keywords', l: 'Từ khóa (cách nhau dấu phẩy, không phân biệt hoa thường)', t: 'text', req: 1,
                    get: function (o) { return (o.keywords || []).join(', '); },
                    set: function (o, v) { o.keywords = v.split(',').map(function (x) { return x.trim(); }).filter(Boolean); } },
                { n: 'answer', l: 'Câu trả lời của AI', t: 'area', rows: 6, req: 1, hint: 'Cho phép HTML: &lt;b&gt;, &lt;br&gt;, &lt;code&gt;…' }
            ]
        },

        /* ----- Các mục 1 bản ghi ----- */
        viva: {
            kind: 'single', title: '🎓 Phòng vấn đáp AI',
            read: function () { return SiteContent.current().viva; }, write: function () {},
            fields: [
                { n: 'topic', l: 'Chủ đề đang vấn đáp', t: 'text' },
                { n: 'accuracy', l: 'Độ chính xác (%)', t: 'num' },
                { n: 'expression', l: 'Độ diễn đạt (%)', t: 'num' },
                linesField('checklist', 'Danh sách tiêu chí', 'Mỗi dòng 1 tiêu chí, bắt đầu bằng ✅ (đã đạt) hoặc ⏳ (đang chờ).'),
                dialogField('feynman', 'Hội thoại mẫu – "Giảng bài cho AI"'),
                dialogField('examiner', 'Hội thoại mẫu – "AI Hỏi xoáy"'),
                { n: 'sampleFeynman', l: 'Gợi ý trả lời mẫu (chế độ Giảng bài)', t: 'area' },
                { n: 'sampleExaminer', l: 'Gợi ý trả lời mẫu (chế độ Hỏi xoáy)', t: 'area' },
                { n: 'reply', l: 'Lời phản hồi của AI sau khi học viên gửi câu trả lời', t: 'area', hint: 'Cho phép HTML.' }
            ]
        },

        tutor: {
            kind: 'single', title: '💬 AI Tutor – Lời chào, câu mặc định, nút gợi ý',
            read: function () {
                var t = SiteContent.current().tutor;
                return { welcome: t.welcome, fallback: t.fallback, chips: t.chips.slice() };
            },
            write: function (w) { AITutor.welcome = w.welcome; AITutor.fallback = w.fallback; AITutor.chips = w.chips; if (AITutor.refreshUI) AITutor.refreshUI(); },
            fields: [
                { n: 'welcome', l: 'Lời chào đầu tiên', t: 'area', hint: 'Cho phép HTML.' },
                { n: 'fallback', l: 'Câu trả lời khi không khớp từ khóa nào', t: 'area', rows: 5, hint: 'Dùng <b>{q}</b> để chèn câu hỏi của học viên. Cho phép HTML.' },
                { n: 'chips', l: 'Nút gợi ý nhanh', t: 'area', rows: 4,
                    hint: 'Mỗi dòng: <b>Nhãn nút | Câu hỏi sẽ gửi</b>',
                    get: function (o) { return (o.chips || []).map(function (c) { return c.label + ' | ' + c.query; }).join('\n'); },
                    set: function (o, v) {
                        o.chips = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).map(function (line) {
                            var i = line.indexOf(' | ');
                            return i > -1 ? { label: line.slice(0, i).trim(), query: line.slice(i + 3).trim() } : { label: line, query: line };
                        });
                    } }
            ]
        },

        ticker: {
            kind: 'single', title: '🔥 Chữ chạy & Tin nổi bật',
            read: function () { return { lines: SiteContent.current().ticker.slice() }; },
            write: function (w) { var t = SiteContent.current().ticker; t.length = 0; w.lines.forEach(function (x) { t.push(x); }); },
            fields: [linesField('lines', 'Các dòng tin chạy ở đầu trang (mỗi dòng 1 tin)')]
        },

        settings: {
            kind: 'single', title: '⚙️ Số liệu hiển thị & môn PK',
            read: function () { return SiteContent.current().settings; }, write: function () {},
            fields: [
                { n: 'liveLearners', l: 'Số người "đang học" (Phòng học chung)', t: 'num' },
                { n: 'liveMatches', l: 'Số "trận đang đấu" (Đấu trường PK)', t: 'num' },
                { n: 'topStreak', l: 'Chuỗi cao nhất (ngày) – Bạn cùng tiến', t: 'num' },
                { n: 'masteredCount', l: 'Số câu "đã thuộc lòng" – Sổ tay câu sai', t: 'num' },
                linesField('pkSubjects', 'Các môn thi đấu ở sảnh PK', 'Mỗi dòng 1 môn.')
            ]
        }
    };

    /* ---------- Dựng HTML ---------- */
    function fieldHtml(f, i, obj) {
        if (f.t === 'opts') {
            var opts = obj[f.optKey] || ['', '', '', ''], cor = obj[f.correctKey] || 0;
            return '<div class="opt-grid">' + [0, 1, 2, 3].map(function (j) {
                return '<label class="opt-row"><span class="opt-letter">' + 'ABCD'[j] + '</span>' +
                    '<input name="o' + j + '" required placeholder="Đáp án ' + 'ABCD'[j] + '" value="' + esc(strip(opts[j])) + '">' +
                    '<span class="opt-correct"><input type="radio" name="correct" value="' + j + '"' + (cor === j ? ' checked' : '') + '> Đúng</span></label>';
            }).join('') + '</div>';
        }
        var val = f.get ? f.get(obj) : obj[f.n];
        if (val == null) val = '';
        var nm = 'f' + i, req = f.req ? ' required' : '';
        var hint = f.hint ? '<small style="display:block;color:var(--text-muted);margin:2px 0 4px;font-weight:400">' + f.hint + '</small>' : '';
        if (f.t === 'check') {
            return '<label class="opt-correct" style="display:flex;gap:8px;align-items:center;margin:10px 0"><input type="checkbox" name="' + nm + '"' + (val ? ' checked' : '') + '> ' + esc(f.l) + '</label>';
        }
        var ctl;
        if (f.t === 'area') ctl = '<textarea name="' + nm + '" rows="' + (f.rows || 3) + '"' + req + '>' + esc(val) + '</textarea>';
        else if (f.t === 'num') ctl = '<input type="number" name="' + nm + '" value="' + esc(val) + '">';
        else if (f.t === 'select') ctl = '<select name="' + nm + '">' + f.opts.map(function (o) {
            return '<option value="' + esc(o[0]) + '"' + (String(val) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>';
        else ctl = '<input name="' + nm + '" value="' + esc(val) + '"' + req + '>';
        return '<label>' + esc(f.l) + hint + ctl + '</label>';
    }

    function collect(cfg, form, base) {
        var d = new FormData(form);
        cfg.fields.forEach(function (f, i) {
            if (f.t === 'opts') {
                base[f.optKey] = [0, 1, 2, 3].map(function (j) { return 'ABCD'[j] + '. ' + String(d.get('o' + j) || '').trim(); });
                base[f.correctKey] = parseInt(d.get('correct'), 10) || 0;
                return;
            }
            var raw = d.get('f' + i), v;
            if (f.t === 'check') v = raw === 'on';
            else if (f.t === 'num') v = parseFloat(raw) || 0;
            else v = String(raw == null ? '' : raw).trim();
            if (f.set) f.set(base, v); else base[f.n] = v;
        });
        return base;
    }

    function listHtml(key) {
        var cfg = CFG[key], list = SiteContent.current()[key] || [];
        var editing = st.editing && st.editing.key === key ? st.editing.idx : null;
        var form = '';
        if (editing !== null) {
            var obj = editing === 'new' ? cfg.blank(list) : list[editing];
            form = '<form class="admin-card q-form" data-cform="' + key + '" id="c-form"><h3 style="margin-bottom:12px">' +
                (editing === 'new' ? 'Thêm mới' : 'Sửa mục ' + (editing + 1)) + '</h3>' +
                cfg.fields.map(function (f, i) { return fieldHtml(f, i, obj); }).join('') +
                '<div class="form-actions"><button class="btn-gradient" type="submit">💾 Lưu</button>' +
                '<button class="btn-icon" type="button" data-cact="cancel">Hủy</button></div></form>';
        }
        return '<h3 style="margin:18px 0 10px">' + cfg.title + '</h3>' +
            '<div class="admin-tools" style="margin-bottom:10px"><button class="btn-gradient" data-cact="add" data-key="' + key + '">' + cfg.add + '</button>' +
            '<button class="btn-icon" data-cact="reset" data-key="' + key + '" title="Xóa mọi chỉnh sửa, quay về dữ liệu có sẵn trong code">↺ Khôi phục mặc định</button></div>' +
            (cfg.hint ? '<p style="color:var(--text-muted);margin-bottom:10px">' + cfg.hint + '</p>' : '') +
            form +
            '<div class="admin-card"><table class="admin-table"><thead><tr>' + cfg.heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
            (list.length ? list.map(function (it, i) {
                return '<tr>' + cfg.row(it, i).map(function (c) { return '<td>' + c + '</td>'; }).join('') +
                    '<td class="act">' +
                    (cfg.movable ? '<button class="btn-icon" data-cact="up" data-key="' + key + '" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
                        '<button class="btn-icon" data-cact="down" data-key="' + key + '" data-i="' + i + '"' + (i === list.length - 1 ? ' disabled' : '') + '>↓</button>' : '') +
                    '<button class="btn-icon" data-cact="edit" data-key="' + key + '" data-i="' + i + '">✏️ Sửa</button>' +
                    '<button class="btn-icon danger" data-cact="del" data-key="' + key + '" data-i="' + i + '">🗑️ Xóa</button></td></tr>';
            }).join('') : '<tr><td colspan="' + (cfg.heads.length + 1) + '" style="text-align:center;color:var(--text-muted)">Chưa có mục nào.</td></tr>') +
            '</tbody></table></div>';
    }

    function singleHtml(key) {
        var cfg = CFG[key], obj = cfg.read();
        return '<form class="admin-card q-form" data-sform="' + key + '"><h3 style="margin-bottom:12px">' + cfg.title + '</h3>' +
            cfg.fields.map(function (f, i) { return fieldHtml(f, i, obj); }).join('') +
            '<div class="form-actions"><button class="btn-gradient" type="submit">💾 Lưu thay đổi</button>' +
            '<button class="btn-icon" type="button" data-cact="reset" data-key="' + key + '">↺ Khôi phục mặc định</button></div></form>';
    }

    /* ---------- Màn hình ---------- */
    var NOTE = '<div class="admin-card" style="margin-bottom:14px">☁️ Thay đổi được lưu lên Firestore (<code>site_config/content</code>) và áp dụng cho <b>mọi học viên</b> ở lần tải trang kế tiếp.</div>';
    var screens = {
        rooms: { head: '🏠 Phòng học chung', keys: ['rooms'] },
        pk: { head: '⚔️ Đấu trường PK', keys: ['pk'] },
        viva: { head: '🎓 Vấn đáp AI', keys: ['viva'] },
        mistakes: { head: '📕 Sổ tay câu sai', keys: ['mistakes'] },
        buddies: { head: '🤝 Bạn cùng tiến', keys: ['buddies'] },
        tutor: { head: '🤖 AI Tutor', keys: ['tutor', 'tutorRules'] },
        flashcards: { head: '🎴 Flashcards', keys: ['flashcards'] },
        news: { head: '📰 Tin tức', keys: ['news', 'ticker'] },
        settings: { head: '⚙️ Số liệu & môn PK', keys: ['settings'] }
    };
    var currentScreen = null;

    function draw(name) {
        if ((location.hash || '').replace('#/', '') !== name) return;
        currentScreen = name;
        var sc = screens[name];
        $('#admin-view').innerHTML = K.head(sc.head) + NOTE + sc.keys.map(function (k) {
            return CFG[k].kind === 'list' ? listHtml(k) : singleHtml(k);
        }).join('');
        if (st.editing) { var f = $('#c-form'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    function open(name) {
        st.editing = null;
        $('#admin-view').innerHTML = '<div class="admin-card">Đang tải...</div>';
        (SiteContent.ready || Promise.resolve()).then(function () { draw(name); });
    }
    Object.keys(screens).forEach(function (n) { V[n] = function () { open(n); }; });

    function persist(key, msg) {
        return SiteContent.save(key).then(function () { K.toast(msg || 'Đã lưu & áp dụng'); })
            .catch(function (e) {
                console.warn(e);
                K.toast('Không lưu được lên Firestore (kiểm tra Rules cho site_config)', true);
            });
    }

    /* ---------- Sự kiện ---------- */
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cact]');
        if (!b) return;
        var act = b.dataset.cact, key = b.dataset.key, i = parseInt(b.dataset.i, 10);
        var list = key && SiteContent.current()[key];
        if (act === 'add') { st.editing = { key: key, idx: 'new' }; draw(currentScreen); }
        else if (act === 'edit') { st.editing = { key: key, idx: i }; draw(currentScreen); }
        else if (act === 'cancel') { st.editing = null; draw(currentScreen); }
        else if (act === 'del') {
            if (confirm('Xóa mục số ' + (i + 1) + '?')) { list.splice(i, 1); persist(key, 'Đã xóa').then(function () { draw(currentScreen); }); }
        } else if (act === 'up' || act === 'down') {
            var j = act === 'up' ? i - 1 : i + 1;
            if (j < 0 || j >= list.length) return;
            var t = list[i]; list[i] = list[j]; list[j] = t;
            persist(key, 'Đã đổi thứ tự').then(function () { draw(currentScreen); });
        } else if (act === 'reset') {
            if (confirm('Khôi phục "' + CFG[key].title + '" về dữ liệu mặc định? Mọi chỉnh sửa của mục này sẽ mất.')) {
                SiteContent.reset(key).then(function () { K.toast('Đã khôi phục mặc định'); st.editing = null; draw(currentScreen); })
                    .catch(function () { K.toast('Không khôi phục được (kiểm tra Firestore Rules)', true); });
            }
        }
    });

    document.addEventListener('submit', function (e) {
        var f = e.target;
        if (f.dataset && f.dataset.cform) {            // thêm / sửa 1 mục trong danh sách
            e.preventDefault();
            var key = f.dataset.cform, cfg = CFG[key], list = SiteContent.current()[key];
            var idx = st.editing && st.editing.idx;
            var base = idx === 'new' ? cfg.blank(list) : SiteContent.clone(list[idx]);
            var it = collect(cfg, f, base);
            if (cfg.post) cfg.post(it);
            if (idx === 'new') list.push(it); else list[idx] = it;
            st.editing = null;
            persist(key).then(function () { draw(currentScreen); });
        } else if (f.dataset && f.dataset.sform) {     // lưu mục 1 bản ghi
            e.preventDefault();
            var k = f.dataset.sform, c = CFG[k];
            var w = collect(c, f, c.read());
            c.write(w);
            persist(k);
        }
    });
})();

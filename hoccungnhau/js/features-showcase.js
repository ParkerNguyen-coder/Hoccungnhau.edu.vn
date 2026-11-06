/**
 * ==========================================================================
 * HỌC CÙNG NHAU - CLEAN OPERATIONAL APP WORKSPACE CONTROLLER
 * Minimalist, real-time app interfaces for all 6 core features
 * ==========================================================================
 */

const FeatureShowcase = {
    // UI State
    roomFilter: 'all',
    activeRoomId: null,
    camEnabled: true,
    handRaised: false,

    pkView: 'battle', // 'lobby' | 'battle'
    pkMode: '1v1',
    pkSubject: 'Toán 12',
    pkSelectedOpt: null,
    pkBlueScore: 620,
    pkRedScore: 380,
    pkQIndex: 0,

    vivaMode: 'feynman', // 'feynman' | 'examiner'

    mistakeFilter: 'all',
    mistakeAnswers: {},

    activeBuddyId: 1,
    dndEnabled: true,

    // Số liệu hiển thị + danh sách môn PK (chỉnh được ở trang Quản trị)
    settings: {
        liveLearners: 73,
        liveMatches: 28,
        topStreak: 23,
        masteredCount: 28,
        pkSubjects: ['Toán 12', 'Vật Lý 12', 'Hóa Học 12', 'Tiếng Anh', 'Đại Số Tuyến Tính']
    },

    // Nội dung Phòng Vấn Đáp AI (chỉnh được ở trang Quản trị)
    vivaData: {
        topic: 'Dao động điều hòa (Vật Lý 11)',
        accuracy: 85,
        expression: 75,
        checklist: ['✅ Nêu định nghĩa chuẩn', '✅ Giải thích bản chất công thức', '⏳ Lấy 1 ví dụ thực tế'],
        feynman: [
            { role: 'ai', text: 'Chào cậu! Mình vẫn chưa hiểu tại sao trong công thức <code>x = A·cos(ωt + φ)</code> thì đại lượng <code>(ωt + φ)</code> lại quyết định trạng thái dao động? Cậu giảng giúp mình với!' },
            { role: 'user', text: 'Vì A và ω là hằng số cố định của hệ rồi, còn (ωt + φ) thay đổi theo thời gian t. Khi biết góc pha (ωt + φ) thì ta tính được cả li độ x lẫn chiều chuyển động của vật!' },
            { role: 'ai', text: 'À mình hiểu phần li độ <code>x</code> rồi! Nhưng tại sao biết pha dao động lại suy ra được vật đang đi theo chiều âm hay chiều dương nhỉ?' }
        ],
        examiner: [
            { role: 'ai', text: 'Câu hỏi 1: Khi con lắc lò xo đi từ vị trí biên về vị trí cân bằng, vận tốc và gia tốc của vật biến thiên như thế nào?' },
            { role: 'user', text: 'Khi đi từ biên về vị trí cân bằng thì tốc độ tăng dần đến cực đại, còn độ lớn gia tốc giảm dần về 0 ạ.' },
            { role: 'ai', text: 'Chính xác (9/10). Hỏi xoáy thêm: Nếu tăng gấp đôi biên độ A thì chu kỳ T của con lắc lò xo tăng mấy lần? Vì sao?' }
        ],
        sampleFeynman: 'Vì v = -ωA·sin(ωt + φ), dấu của hàm sin quyết định chiều chuyển động!',
        sampleExaminer: 'Chu kỳ T = 2π√(m/k) không phụ thuộc vào biên độ A nên T không đổi ạ!',
        reply: '🌟 Rất rõ ràng và đúng bản chất vật lý! Điểm hiểu bài của bạn tăng lên <strong>92/100</strong> (+25 EXP).'
    },

    studyRoomsData: [
        {
            id: 'room-101',
            type: 'pomodoro',
            badge: '🍅 25/5',
            tagClass: 'pomo',
            title: 'Cày Đề Toán 12 - Mục Tiêu 9+',
            topic: 'Hàm số & Tích phân',
            host: 'Minh Anh',
            members: 18,
            maxMembers: 25,
            timer: '18:42',
            avatars: ['👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍🔬']
        },
        {
            id: 'room-102',
            type: 'pomodoro',
            badge: '🍅 50/10',
            tagClass: 'pomo',
            title: 'Tự Học Đêm Khuya Cùng Lofi',
            topic: 'Tự học đa môn',
            host: 'Hoàng Nam',
            members: 24,
            maxMembers: 25,
            timer: '34:10',
            avatars: ['🧑‍🎓', '👨‍🔬', '👩‍💼', '🧑‍🎨']
        },
        {
            id: 'room-201',
            type: 'english',
            badge: '🎙️ Speaking',
            tagClass: 'eng',
            title: 'IELTS Speaking Part 2 & 3',
            topic: 'Technology & Education',
            host: 'Lan Vy (8.0)',
            members: 6,
            maxMembers: 8,
            timer: 'Đang mở Mic',
            avatars: ['👩‍🏫', '🧑‍🎓', '👨‍🎓']
        },
        {
            id: 'room-202',
            type: 'english',
            badge: '🎙️ Reflex',
            tagClass: 'eng',
            title: 'Giao Tiếp Phản Xạ 15 Phút',
            topic: 'Daily Conversations',
            host: 'Tuấn Kiệt',
            members: 5,
            maxMembers: 8,
            timer: 'Đang mở Mic',
            avatars: ['👨‍💻', '👩‍🎓', '🧑‍🎤']
        },
        {
            id: 'room-301',
            type: 'qa',
            badge: '🙋 Giải Bài',
            tagClass: 'qa',
            title: 'Gỡ Rối Vật Lý 12 - Điện Xoay Chiều',
            topic: 'Cực trị RLC & Giãn đồ',
            host: 'Đức Trọng',
            members: 11,
            maxMembers: 15,
            timer: '2 câu chờ',
            avatars: ['👨‍🔬', '👩‍🎓', '🧑‍🎓', '👨‍🎓']
        },
        {
            id: 'room-302',
            type: 'qa',
            badge: '🙋 Giải Bài',
            tagClass: 'qa',
            title: 'Giải Đáp Đại Số Tuyến Tính & C++',
            topic: 'Ma trận & Con trỏ',
            host: 'CLB Kỹ Thuật',
            members: 9,
            maxMembers: 15,
            timer: '1 câu chờ',
            avatars: ['🧑‍💻', '👩‍💻', '👨‍🎓']
        }
    ],

    pkQuestions: [
        {
            subject: 'Toán 12',
            q: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = x²(x − 1)(x + 2)³. Số điểm cực trị của hàm số trên ℝ là:',
            opts: ['A. 2 điểm cực trị', 'B. 3 điểm cực trị', 'C. 1 điểm cực trị', 'D. 4 điểm cực trị'],
            correct: 0
        },
        {
            subject: 'Vật Lý 12',
            q: 'Một vật dao động điều hòa với phương trình x = 6cos(4πt) (cm). Tần số dao động của vật là:',
            opts: ['A. 4 Hz', 'B. 2 Hz', 'C. 0.5 Hz', 'D. 4π Hz'],
            correct: 1
        },
        {
            subject: 'Hóa Học 12',
            q: 'Kim loại nào sau đây có tính dẫn điện tốt nhất trong tất cả các kim loại?',
            opts: ['A. Đồng (Cu)', 'B. Vàng (Au)', 'C. Bạc (Ag)', 'D. Nhôm (Al)'],
            correct: 2
        }
    ],

    mistakesData: [
        {
            id: 101,
            subject: 'Toán 12',
            source: 'Sai từ PK #902',
            streak: 2,
            question: 'Tìm tập xác định D của hàm số y = (x − 1)^(√3):',
            options: ['A. D = ℝ \\ {1}', 'B. D = (1; +∞)', 'C. D = [1; +∞)', 'D. D = (0; +∞)'],
            correctIndex: 1,
            explanation: 'Hàm lũy thừa với số mũ không nguyên (√3) chỉ xác định khi cơ số dương: x − 1 > 0 ⇔ x > 1.'
        },
        {
            id: 102,
            subject: 'Vật Lý 12',
            source: 'Sai từ Đề THPTQG',
            streak: 1,
            question: 'Đặt điện áp xoay chiều vào mạch chỉ có tụ điện C. Cường độ dòng điện trong mạch:',
            options: ['A. Sớm pha π/2 so với điện áp', 'B. Trễ pha π/2 so với điện áp', 'C. Cùng pha với điện áp', 'D. Ngược pha với điện áp'],
            correctIndex: 0,
            explanation: 'Trong mạch chỉ chứa tụ điện C, dòng điện i luôn sớm pha π/2 so với điện áp u.'
        },
        {
            id: 103,
            subject: 'Hóa Học 12',
            source: 'Sai từ PK #884',
            streak: 0,
            question: 'Chất nào sau đây thuộc loại amin bậc hai?',
            options: ['A. CH₃NH₂', 'B. C₆H₅NH₂', 'C. CH₃NHCH₃', 'D. (CH₃)₃N'],
            correctIndex: 2,
            explanation: 'Đimetylamin (CH₃-NH-CH₃) có 2 nguyên tử H trong phân tử NH₃ bị thay thế bởi gốc hiđrocacbon nên là amin bậc 2.'
        },
        {
            id: 104,
            subject: 'Toán 12',
            source: 'Sai từ Quiz Chương 1',
            streak: 2,
            question: 'Số đường tiệm cận đứng của đồ thị hàm số y = (x − 2) / (x² − 4) là:',
            options: ['A. 2 tiệm cận', 'B. 1 tiệm cận (x = -2)', 'C. 1 tiệm cận (x = 2)', 'D. 0 tiệm cận'],
            correctIndex: 1,
            explanation: 'Rút gọn y = (x − 2)/[(x − 2)(x + 2)] = 1/(x + 2) với x ≠ 2. Vậy chỉ có 1 tiệm cận đứng là x = -2.'
        }
    ],

    buddiesData: [
        {
            id: 1,
            name: 'Nguyễn Minh Anh',
            grade: 'Lớp 12A1',
            avatar: '👩‍🎓',
            streak: 14,
            todayDone: '2/2',
            status: 'Đang ở Phòng Toán 12',
            online: true,
            messages: [
                { type: 'invite', from: 'Minh Anh', title: '🍅 Rủ học Pomodoro 25p', sub: 'Phòng: Cày Đề Toán 12 - Mục Tiêu 9+', actionRoute: 'study-rooms' },
                { type: 'question', from: 'Bạn', title: '❓ Nhờ giải đáp câu #TOAN12-101', sub: 'Tìm tập xác định D của hàm số y = (x − 1)^(√3)...', reply: 'Câu này mũ vô tỉ nên điều kiện là cơ số > 0 nhé, chọn (1; +∞)!' }
            ]
        },
        {
            id: 2,
            name: 'Trần Quốc Bảo',
            grade: 'Lớp 12A3',
            avatar: '👨‍🎓',
            streak: 9,
            todayDone: '1/2',
            status: 'Đang chờ bạn học đủ 25p',
            online: true,
            messages: [
                { type: 'invite', from: 'Quốc Bảo', title: '⚔️ Thách đấu PK Solo 1v1', sub: 'Môn: Vật Lý 12 • 10 câu tốc độ', actionRoute: 'pk-arena' }
            ]
        },
        {
            id: 3,
            name: 'Lê Hoàng Châu',
            grade: 'ĐH Bách Khoa',
            avatar: '🧑‍💻',
            streak: 23,
            todayDone: '2/2',
            status: '🔒 Đang thi thử (Chặn làm phiền)',
            online: false,
            messages: [
                { type: 'question', from: 'Hoàng Châu', title: '❓ Câu hỏi #ALGEBRA-204', sub: 'Tính hạng ma trận rank(A) bằng biến đổi sơ cấp...', reply: 'Đưa về ma trận bậc thang rồi đếm số dòng khác 0 nhé.' }
            ]
        }
    ],

    // =========================================================================
    // HOME QUICK LAUNCHER (CLEAN 6-TILE DOCK)
    // =========================================================================
    getHomeEcosystemHTML: function() {
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h2 class="section-title" style="margin:0; font-size:1.25rem;">🚀 Không Gian Học Tập & Đấu Luyện</h2>
                <span style="font-size:0.82rem; color:var(--text-muted);">Chọn nhanh tính năng để bắt đầu</span>
            </div>
            <div class="app-launcher-grid">
                <div class="app-tile" onclick="AppController.renderClassesOverview()">
                    <div class="app-tile-top">
                        <div class="app-tile-icon">📚</div>
                        <span class="app-tile-live">23 Môn</span>
                    </div>
                    <h3>Kho Học Liệu</h3>
                    <p>Video, PDF & Đề 20 câu</p>
                </div>

                <div class="app-tile" onclick="FeatureShowcase.renderStudyRooms('all')">
                    <div class="app-tile-top">
                        <div class="app-tile-icon" style="background:rgba(16,185,129,0.14);">🏠</div>
                        <span class="app-tile-live is-online">● ${this.settings.liveLearners} đang học</span>
                    </div>
                    <h3>Phòng Học Chung</h3>
                    <p>Pomodoro, Tiếng Anh, Giải bài</p>
                </div>

                <div class="app-tile" onclick="FeatureShowcase.renderPKArena('battle')">
                    <div class="app-tile-top">
                        <div class="app-tile-icon" style="background:rgba(244,63,94,0.14);">⚔️</div>
                        <span class="app-tile-live is-hot">🔥 ${this.settings.liveMatches} trận</span>
                    </div>
                    <h3>Đấu Trường PK</h3>
                    <p>Solo 1v1 & Đấu Team trực tiếp</p>
                </div>

                <div class="app-tile" onclick="FeatureShowcase.renderAIViva('feynman')">
                    <div class="app-tile-top">
                        <div class="app-tile-icon" style="background:rgba(6,182,212,0.14);">🎓</div>
                        <span class="app-tile-live">AI 2 Chiều</span>
                    </div>
                    <h3>Vấn Đáp AI</h3>
                    <p>Giảng bài & Phản xạ vấn đáp</p>
                </div>

                <div class="app-tile" onclick="FeatureShowcase.renderMistakeBook('all')">
                    <div class="app-tile-top">
                        <div class="app-tile-icon" style="background:rgba(245,158,11,0.14);">📕</div>
                        <span class="app-tile-live is-hot">${this.mistakesData.length} câu sai</span>
                    </div>
                    <h3>Sổ Tay Câu Sai</h3>
                    <p>Đảo đáp án & Xóa sau 3 lần đúng</p>
                </div>

                <div class="app-tile" onclick="FeatureShowcase.renderStudyBuddy()">
                    <div class="app-tile-top">
                        <div class="app-tile-icon" style="background:rgba(236,72,153,0.14);">🤝</div>
                        <span class="app-tile-live is-online">🔥 14 ngày</span>
                    </div>
                    <h3>Bạn Cùng Tiến</h3>
                    <p>Nuôi chuỗi lửa & Gửi thẻ rủ học</p>
                </div>
            </div>
        `;
    },

    // =========================================================================
    // 1. TỔ HỢP PHÒNG HỌC CHUNG (LOBBY VIEW vs LIVE ZOOM ROOM VIEW)
    // =========================================================================
    renderStudyRooms: function(filterType = 'all', roomId = null) {
        this.roomFilter = filterType || 'all';
        this.activeRoomId = roomId;
        const main = document.getElementById('main-app-content');
        if (!main) return;

        // If user entered a room -> Render actual Zoom/StudyStream Live Room UI
        if (this.activeRoomId) {
            const room = this.studyRoomsData.find(r => r.id === this.activeRoomId) || this.studyRoomsData[0];
            main.innerHTML = this.getLiveRoomHTML(room);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const filtered = this.roomFilter === 'all'
            ? this.studyRoomsData
            : this.studyRoomsData.filter(r => r.type === this.roomFilter);

        main.innerHTML = `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="AppController.renderHome()" title="Về Trang Chủ">←</button>
                    <h2 class="ws-title">🏠 Phòng Học Chung</h2>
                    <span class="ws-pill live">● ${this.settings.liveLearners} đang học</span>
                </div>

                <div class="ws-tabs">
                    <button class="ws-tab ${this.roomFilter === 'all' ? 'active' : ''}" onclick="FeatureShowcase.renderStudyRooms('all')">Tất cả</button>
                    <button class="ws-tab ${this.roomFilter === 'pomodoro' ? 'active' : ''}" onclick="FeatureShowcase.renderStudyRooms('pomodoro')">🍅 Pomodoro</button>
                    <button class="ws-tab ${this.roomFilter === 'english' ? 'active' : ''}" onclick="FeatureShowcase.renderStudyRooms('english')">🎙️ Tiếng Anh</button>
                    <button class="ws-tab ${this.roomFilter === 'qa' ? 'active' : ''}" onclick="FeatureShowcase.renderStudyRooms('qa')">🙋 Giải bài</button>
                </div>

                <div class="ws-topbar-right">
                    <button class="icon-btn is-active" onclick="FeatureShowcase.renderStudyRooms('${this.roomFilter}', 'room-101')" title="Tạo phòng mới">＋</button>
                </div>
            </div>

            <div class="room-grid">
                ${filtered.map(r => `
                    <div class="room-card">
                        <div>
                            <div class="room-card-head">
                                <span class="room-tag ${r.tagClass}">${r.badge}</span>
                                <span class="ws-pill" style="padding:2px 8px; font-size:0.72rem;">⏱️ ${r.timer}</span>
                            </div>
                            <h4>${r.title}</h4>
                            <div class="room-sub">📌 ${r.topic} • Trưởng phòng: <strong>${r.host}</strong></div>
                        </div>

                        <div class="room-card-foot">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div class="avatar-stack">
                                    ${r.avatars.map(a => `<span class="avatar-dot">${a}</span>`).join('')}
                                </div>
                                <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700;">${r.members}/${r.maxMembers}</span>
                            </div>
                            <button class="btn-gradient" style="padding:7px 16px; font-size:0.82rem;" onclick="FeatureShowcase.renderStudyRooms('${this.roomFilter}', '${r.id}')">
                                Vào phòng →
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getLiveRoomHTML: function(room) {
        const isPomo = room.type === 'pomodoro';
        return `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="FeatureShowcase.renderStudyRooms('${this.roomFilter}', null)" title="Rời về sảnh phòng">←</button>
                    <h2 class="ws-title">${room.title}</h2>
                    <span class="ws-pill timer">🍅 ${room.timer} • Hiệp 3/4</span>
                </div>
                <div class="ws-topbar-right">
                    <button class="ws-pill live" style="cursor:pointer;" onclick="alert('✅ Đã xác nhận có mặt! Chuỗi tập trung của bạn được giữ nguyên.')" title="Xác nhận không treo máy AFK">
                        👋 Điểm danh AFK
                    </button>
                    <button class="icon-btn is-danger" onclick="FeatureShowcase.renderStudyRooms('${this.roomFilter}', null)" title="Rời phòng học">🚪</button>
                </div>
            </div>

            <div class="live-room-layout">
                <!-- VIDEO STAGE -->
                <div class="live-stage">
                    <div class="cam-grid">
                        <div class="cam-tile is-me">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge">⏱️ 1h 45p</span>
                                <span style="font-size:0.72rem; color:#34d399;">● CAM</span>
                            </div>
                            <div class="cam-avatar">${this.camEnabled ? '🧑‍💻' : '🙈'}</div>
                            <div class="cam-name-bar">
                                <span>Bạn (Đang học)</span>
                                <span>${isPomo ? '🔇' : '🎙️'}</span>
                            </div>
                        </div>

                        <div class="cam-tile">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge">⏱️ 2h 10p</span>
                                <button class="cam-report-btn" onclick="alert('🏳️ Đã gửi phiếu báo cáo thành viên vi phạm (1/3 phiếu).')" title="Báo cáo vi phạm">🏳️</button>
                            </div>
                            <div class="cam-avatar">👩‍🎓</div>
                            <div class="cam-name-bar">
                                <span>${room.host} (Host)</span>
                                <span>🔇</span>
                            </div>
                        </div>

                        <div class="cam-tile">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge">⏱️ 1h 20p</span>
                                <button class="cam-report-btn" onclick="alert('🏳️ Đã gửi phiếu báo cáo thành viên vi phạm (1/3 phiếu).')" title="Báo cáo vi phạm">🏳️</button>
                            </div>
                            <div class="cam-avatar">👨‍🎓</div>
                            <div class="cam-name-bar">
                                <span>Quốc Bảo (12A3)</span>
                                <span>🔇</span>
                            </div>
                        </div>

                        <div class="cam-tile">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge">⏱️ 55p</span>
                                <button class="cam-report-btn" onclick="alert('🏳️ Đã gửi phiếu báo cáo thành viên vi phạm (1/3 phiếu).')" title="Báo cáo vi phạm">🏳️</button>
                            </div>
                            <div class="cam-avatar">👩‍🔬</div>
                            <div class="cam-name-bar">
                                <span>Phương Thảo (11B2)</span>
                                <span>🔇</span>
                            </div>
                        </div>

                        <div class="cam-tile">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge">⏱️ 1h 05p</span>
                                <button class="cam-report-btn" onclick="alert('🏳️ Đã gửi phiếu báo cáo thành viên vi phạm (1/3 phiếu).')" title="Báo cáo vi phạm">🏳️</button>
                            </div>
                            <div class="cam-avatar">🧑‍🎨</div>
                            <div class="cam-name-bar">
                                <span>Gia Huy (ĐH BK)</span>
                                <span>🔇</span>
                            </div>
                        </div>

                        <div class="cam-tile is-afk">
                            <div class="cam-top-actions">
                                <span class="cam-time-badge" style="background:rgba(245,158,11,0.25); color:#fbbf24;">⚠️ Chờ check-in 25s</span>
                                <button class="cam-report-btn" onclick="alert('🏳️ Đã gửi phiếu báo cáo AFK (2/3 phiếu).')" title="Báo cáo treo máy">🏳️</button>
                            </div>
                            <div class="cam-avatar">😴</div>
                            <div class="cam-name-bar">
                                <span>Hoàng Long</span>
                                <span>🔇</span>
                            </div>
                        </div>
                    </div>

                    <!-- ICON-ONLY CONTROL DOCK -->
                    <div class="meet-dock">
                        <button class="dock-btn ${this.camEnabled ? 'active' : ''}" onclick="FeatureShowcase.toggleRoomCam()" title="Bật / Tắt Camera">
                            ${this.camEnabled ? '📷' : '🚫'}
                        </button>
                        <button class="dock-btn ${isPomo ? 'locked' : ''}" onclick="alert(isPomo ? '🔒 Mic tự động khóa trong 25p Pomodoro để giữ yên tĩnh tuyệt đối.' : '🎙️ Đã bật Mic')" title="${isPomo ? 'Mic đang khóa trong giờ Pomodoro' : 'Bật / Tắt Mic'}">
                            🔇
                        </button>
                        <button class="dock-btn ${this.handRaised ? 'active' : ''}" onclick="FeatureShowcase.toggleHandRaise()" title="Giơ tay xin hỏi bài">
                            ✋
                        </button>
                        <button class="dock-btn" onclick="document.getElementById('music-toggle-btn')?.click()" title="Bật nhạc Lofi tập trung">
                            🎵
                        </button>
                        <button class="dock-btn leave" onclick="FeatureShowcase.renderStudyRooms('${this.roomFilter}', null)" title="Rời phòng học">
                            🚪
                        </button>
                    </div>
                </div>

                <!-- RIGHT CHAT & MEMBER SIDEBAR -->
                <div class="room-side">
                    <div style="padding:12px 14px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.88rem;">💬 Chat Phòng (${room.members})</strong>
                        <span class="ws-pill" style="font-size:0.7rem; padding:2px 8px;">${isPomo ? '🔒 Mở lúc giải lao' : '🟢 Đang mở'}</span>
                    </div>

                    <div class="room-chat-list">
                        <div class="chat-item">
                            <strong>🤖 Hệ thống</strong>
                            Hiệp Pomodoro 3/4 đang chạy. Mic & Chat tự động tạm khóa 25p.
                        </div>
                        <div class="chat-item">
                            <strong>👩‍🎓 ${room.host}</strong>
                            Hết hiệp này nghỉ 5p mình chữa câu 48 Tích phân nhé!
                        </div>
                        <div class="chat-item">
                            <strong>👨‍🎓 Quốc Bảo</strong>
                            Ok bạn, mình đang bấm giờ làm đề số 3.
                        </div>
                    </div>

                    <div class="room-chat-input">
                        <input type="text" class="viva-input" style="height:36px; font-size:0.8rem;" placeholder="${isPomo ? '🔒 Mở khóa sau 18:42...' : 'Nhập tin nhắn...'}" ${isPomo ? 'disabled' : ''}>
                        <button class="icon-btn ${isPomo ? 'is-locked' : 'is-active'}" style="width:36px; height:36px;" title="Gửi">➤</button>
                    </div>
                </div>
            </div>
        `;
    },

    toggleRoomCam: function() {
        this.camEnabled = !this.camEnabled;
        this.renderStudyRooms(this.roomFilter, this.activeRoomId);
    },

    toggleHandRaise: function() {
        this.handRaised = !this.handRaised;
        this.renderStudyRooms(this.roomFilter, this.activeRoomId);
    },

    // =========================================================================
    // 2. ĐẤU TRƯỜNG PK (SEPARATE LOBBY VIEW & LIVE MATCH HUD VIEW)
    // =========================================================================
    renderPKArena: function(viewMode = 'battle') {
        this.pkView = viewMode || 'battle';
        const main = document.getElementById('main-app-content');
        if (!main) return;

        if (this.pkView === 'lobby') {
            main.innerHTML = this.getPKLobbyHTML();
        } else {
            main.innerHTML = this.getPKBattleHTML();
        }
    },

    getPKLobbyHTML: function() {
        const subjects = this.settings.pkSubjects;
        return `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="AppController.renderHome()" title="Về Trang Chủ">←</button>
                    <h2 class="ws-title">⚔️ Sảnh Đấu Trường PK</h2>
                    <span class="ws-pill timer">🔥 ${this.settings.liveMatches} trận đang đấu</span>
                </div>
                <div class="ws-topbar-right">
                    <button class="btn-gradient" style="padding:7px 14px; font-size:0.82rem;" onclick="FeatureShowcase.renderPKArena('battle')">
                        ⚡ Vào Trận Ngay
                    </button>
                </div>
            </div>

            <div class="pk-lobby-grid">
                <div class="pk-box">
                    <h3 style="margin:0 0 12px; font-size:1rem;">1. Chọn Chế Độ Thi Đấu</h3>
                    <div class="pk-mode-cards">
                        <div class="pk-mode-card ${this.pkMode === '1v1' ? 'active' : ''}" onclick="FeatureShowcase.pkMode='1v1'; FeatureShowcase.renderPKArena('lobby')">
                            <div style="font-size:1.4rem;">⚡</div>
                            <h4>Solo 1v1</h4>
                            <span>10 câu • 20s/câu</span>
                        </div>
                        <div class="pk-mode-card ${this.pkMode === '3v3' ? 'active' : ''}" onclick="FeatureShowcase.pkMode='3v3'; FeatureShowcase.renderPKArena('lobby')">
                            <div style="font-size:1.4rem;">🛡️</div>
                            <h4>Đấu Team 3v3</h4>
                            <span>Cộng tổng điểm 3 thành viên</span>
                        </div>
                    </div>

                    <h3 style="margin:0 0 10px; font-size:1rem;">2. Chọn Môn Thi Đấu</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px;">
                        ${subjects.map(s => `
                            <button class="ws-tab ${this.pkSubject === s ? 'active' : ''}" style="border:1px solid var(--border-color);" onclick="FeatureShowcase.pkSubject='${s}'; FeatureShowcase.renderPKArena('lobby')">
                                ${s}
                            </button>
                        `).join('')}
                    </div>

                    <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; padding:12px 14px; border-radius:12px; background:var(--bg-input); margin-bottom:16px; font-size:0.82rem;">
                        <span>📷 Camera: <strong style="color:#10b981;">Đã bật</strong></span>
                        <span>⛶ Toàn màn hình: <strong style="color:#10b981;">Sẵn sàng</strong></span>
                        <span>🔀 Đảo đáp án: <strong style="color:#10b981;">Tự động</strong></span>
                    </div>

                    <button class="btn-gradient" style="width:100%; padding:13px; font-size:0.98rem;" onclick="FeatureShowcase.renderPKArena('battle')">
                        ⚡ Bắt Đầu Ghép Trận (${this.pkMode.toUpperCase()} • ${this.pkSubject})
                    </button>
                </div>

                <div class="pk-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="margin:0; font-size:1rem;">👥 Mời Bạn Đang Online</h3>
                        <span class="ws-pill live">${this.buddiesData.filter(b => b.online).length} sẵn sàng</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${this.buddiesData.map(b => `
                            <div class="buddy-item" onclick="FeatureShowcase.renderPKArena('battle')">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:1.5rem;">${b.avatar}</span>
                                    <div>
                                        <div style="font-weight:700; font-size:0.88rem;">${b.name}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted);">${b.grade} • 🔥 ${b.streak} ngày</div>
                                    </div>
                                </div>
                                <button class="icon-btn is-active" title="Thách đấu PK ngay">⚔️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    getPKBattleHTML: function() {
        const qObj = this.pkQuestions[this.pkQIndex % this.pkQuestions.length];
        const total = this.pkBlueScore + this.pkRedScore;
        const bluePct = Math.round((this.pkBlueScore / total) * 100);
        const redPct = 100 - bluePct;

        return `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="FeatureShowcase.renderPKArena('lobby')" title="Về Sảnh PK">←</button>
                    <h2 class="ws-title">⚔️ Trận #PK902 • Câu ${this.pkQIndex + 1}/10</h2>
                    <span class="ws-pill">${qObj.subject}</span>
                </div>

                <div class="ws-topbar-right">
                    <span class="ws-pill timer">⏱️ 00:16s</span>
                    <button class="icon-btn is-success" title="Camera giám sát đang bật">📷</button>
                    <button class="icon-btn" onclick="alert('⛶ Chế độ khóa toàn màn hình: Chuyển tab quá 2 lần sẽ bị xử thua (Hiện tại: 0/2).')" title="Giám sát chuyển Tab: 0/2">⛶</button>
                    <button class="icon-btn" onclick="FeatureShowcase.nextPKQuestion()" title="Sang câu tiếp theo">⏭️</button>
                </div>
            </div>

            <div class="pk-hud">
                <!-- TOP: 50/50 SPLIT CAMERAS (TIKTOK PK LIVE STYLE) -->
                <div class="pk-vs-cameras">
                    <div class="pk-vs-center-badge">VS</div>

                    <!-- LEFT PLAYER CAM (BLUE) -->
                    <div class="pk-cam-half is-blue">
                        <div class="pk-cam-top-overlay">
                            <span class="pk-cam-dot">● CAM LIVE</span>
                            <span style="font-size:0.74rem; color:#94a3b8;" title="Số câu đúng & Giám sát chuyển tab">✅ 3/3 • 🛡️ 0/2</span>
                        </div>
                        <div style="font-size:3.6rem; margin-bottom:14px;">🧑‍💻</div>
                        <div class="pk-cam-bottom-overlay">
                            <div>
                                <strong style="color:#38bdf8;">🔵 Bạn</strong>
                                <span style="color:#cbd5e1; margin-left:6px; font-size:0.74rem;">⚡ 7.8s/câu</span>
                            </div>
                            <strong style="color:#fff; font-size:0.9rem;">${this.pkBlueScore} đ 🔥x3</strong>
                        </div>
                    </div>

                    <!-- RIGHT OPPONENT CAM (RED) -->
                    <div class="pk-cam-half is-red">
                        <div class="pk-cam-top-overlay">
                            <span class="pk-cam-dot" style="background:rgba(244,63,94,0.25); color:#fb7185;">● CAM LIVE</span>
                            <span style="font-size:0.74rem; color:#94a3b8;" title="Số câu đúng & Giám sát chuyển tab">✅ 2/3 • 🛡️ 0/2</span>
                        </div>
                        <div style="font-size:3.6rem; margin-bottom:14px;">👨‍🎓</div>
                        <div class="pk-cam-bottom-overlay">
                            <div>
                                <strong style="color:#f87171;">🔴 Trần Minh</strong>
                                <span style="color:#fbbf24; margin-left:6px; font-size:0.74rem;">✏️ Đang nháp...</span>
                            </div>
                            <strong style="color:#fff; font-size:0.9rem;">${this.pkRedScore} đ</strong>
                        </div>
                    </div>
                </div>

                <!-- MIDDLE: TUG OF WAR BAR DIRECTLY UNDER CAMERAS -->
                <div class="pk-tug-track" style="margin-bottom:16px;">
                    <div class="pk-tug-blue" style="width:${bluePct}%;">${bluePct}%</div>
                    <div class="pk-tug-vs" style="left:${bluePct}%;">⚡</div>
                    <div style="flex:1; display:flex; align-items:center; justify-content:flex-end; padding-right:12px; color:#fff; font-size:0.75rem; font-weight:800;">${redPct}%</div>
                </div>

                <!-- BOTTOM: FULL-WIDTH QUESTION & OPTIONS -->
                <div class="pk-q-stage" oncopy="return false;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="ws-pill" style="font-size:0.72rem;">Câu ${this.pkQIndex + 1} • Đề đồng bộ</span>
                            <div style="display:flex; gap:6px;">
                                <span class="ws-pill" style="font-size:0.7rem;" title="Đáp án A-B-C-D đã được đảo vị trí">🔀 Đảo vị trí</span>
                                <span class="ws-pill" style="font-size:0.7rem;" title="Đã khóa Copy văn bản đề bài">🚫 Chống Copy</span>
                            </div>
                        </div>

                        <div class="pk-q-text">${qObj.q}</div>
                    </div>

                    <div>
                        <div class="pk-opt-grid">
                            ${qObj.opts.map((opt, idx) => {
                                let cls = '';
                                if (this.pkSelectedOpt !== null) {
                                    if (idx === qObj.correct) cls = 'correct';
                                    else if (idx === this.pkSelectedOpt) cls = 'wrong';
                                }
                                return `
                                    <button class="pk-opt ${cls}" onclick="FeatureShowcase.selectPKOption(${idx})">
                                        ${opt}
                                    </button>
                                `;
                            }).join('')}
                        </div>

                        ${this.pkSelectedOpt !== null ? `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:10px; border-top:1px solid var(--border-color);">
                                <span style="font-size:0.83rem; font-weight:700; color:${this.pkSelectedOpt === qObj.correct ? '#10b981' : '#ef4444'};">
                                    ${this.pkSelectedOpt === qObj.correct ? '✅ Chính xác! +120 điểm tốc độ' : '❌ Chưa chính xác! Đã lưu vào Sổ Tay Câu Sai'}
                                </span>
                                <button class="btn-gradient" style="padding:6px 14px; font-size:0.8rem;" onclick="FeatureShowcase.nextPKQuestion()">
                                    Câu tiếp theo →
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    selectPKOption: function(idx) {
        if (this.pkSelectedOpt !== null) return;
        this.pkSelectedOpt = idx;
        const qObj = this.pkQuestions[this.pkQIndex % this.pkQuestions.length];
        if (idx === qObj.correct) {
            this.pkBlueScore += 120;
        } else {
            this.pkRedScore += 100;
        }
        this.renderPKArena('battle');
    },

    nextPKQuestion: function() {
        this.pkSelectedOpt = null;
        this.pkQIndex = (this.pkQIndex + 1) % this.pkQuestions.length;
        this.renderPKArena('battle');
    },

    // =========================================================================
    // 3. PHÒNG VẤN ĐÁP AI (CLEAN AI VOICE/CHAT STUDIO)
    // =========================================================================
    renderAIViva: function(mode = 'feynman') {
        this.vivaMode = mode || 'feynman';
        const main = document.getElementById('main-app-content');
        if (!main) return;

        const isFeynman = this.vivaMode === 'feynman';

        main.innerHTML = `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="AppController.renderHome()" title="Về Trang Chủ">←</button>
                    <h2 class="ws-title">🎓 Phòng Vấn Đáp AI</h2>
                </div>

                <div class="ws-tabs">
                    <button class="ws-tab ${isFeynman ? 'active' : ''}" onclick="FeatureShowcase.renderAIViva('feynman')">
                        🧑‍🎓 Giảng bài cho AI
                    </button>
                    <button class="ws-tab ${!isFeynman ? 'active' : ''}" onclick="FeatureShowcase.renderAIViva('examiner')">
                        👨‍⚖️ AI Hỏi xoáy
                    </button>
                </div>

                <div class="ws-topbar-right">
                    <span class="ws-pill">${this.vivaData.topic}</span>
                    <button class="icon-btn" onclick="FeatureShowcase.renderAIViva('${this.vivaMode}')" title="Làm mới phiên vấn đáp">🔄</button>
                </div>
            </div>

            <div class="viva-workspace">
                <!-- LEFT: COMPACT AI AGENT STATUS -->
                <div class="viva-agent-panel">
                    <div style="text-align:center; padding:12px 0; border-bottom:1px solid var(--border-color);">
                        <div style="font-size:3rem; margin-bottom:6px;">${isFeynman ? '🧑‍🎓' : '👨‍⚖️'}</div>
                        <div style="font-weight:800; font-size:0.95rem;">${isFeynman ? 'AI Học Sinh Tò Mò' : 'AI Giám Khảo Vấn Đáp'}</div>
                        <div style="font-size:0.76rem; color:var(--text-muted); margin-top:2px;">
                            ${isFeynman ? 'Hãy giảng dễ hiểu để AI nắm bài' : 'Trả lời ngắn gọn câu hỏi phản xạ'}
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; font-size:0.8rem;">
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span>Độ chính xác</span><strong>${this.vivaData.accuracy}%</strong>
                            </div>
                            <div style="height:6px; background:var(--bg-input); border-radius:999px; overflow:hidden;">
                                <div style="width:${this.vivaData.accuracy}%; height:100%; background:#10b981;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span>Độ diễn đạt</span><strong>${this.vivaData.expression}%</strong>
                            </div>
                            <div style="height:6px; background:var(--bg-input); border-radius:999px; overflow:hidden;">
                                <div style="width:${this.vivaData.expression}%; height:100%; background:#6366f1;"></div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:auto; display:flex; flex-direction:column; gap:6px; font-size:0.78rem; padding-top:12px; border-top:1px solid var(--border-color);">
                        ${this.vivaData.checklist.map(c => `<div style="${c.indexOf('⏳') === 0 ? 'color:#f59e0b;' : ''}">${c}</div>`).join('')}
                    </div>
                </div>

                <!-- RIGHT: LIVE CONVERSATION -->
                <div class="viva-chat-panel">
                    <div class="viva-messages" id="viva-msg-list">
                        ${(isFeynman ? this.vivaData.feynman : this.vivaData.examiner).map(m => m.role === 'user'
                            ? `<div class="viva-msg user">${m.text}</div>`
                            : `<div class="viva-msg ai"><strong>${isFeynman ? '🧑‍🎓 AI Học Sinh' : '👨‍⚖️ AI Giám Khảo'}:</strong> ${m.text}</div>`
                        ).join('')}
                    </div>

                    <!-- QUICK SUGGESTION CHIPS -->
                    <div style="padding:8px 14px; display:flex; gap:8px; overflow-x:auto; border-top:1px solid var(--border-color); background:var(--bg-card);">
                        <button class="ws-pill" style="cursor:pointer;" onclick="FeatureShowcase.sendVivaSample()">
                            💡 Gợi ý trả lời mẫu
                        </button>
                    </div>

                    <!-- COMPOSER BAR WITH ICON BUTTONS -->
                    <div class="viva-composer">
                        <button class="icon-btn" onclick="alert('🎙️ Đang lắng nghe giọng nói của bạn...')" title="Trả lời bằng giọng nói">🎙️</button>
                        <input type="text" id="viva-user-input" class="viva-input" placeholder="Nhập lời giải thích của riêng bạn..." onpaste="alert('🚫 Đã chặn Paste văn bản để rèn tư duy tự diễn đạt!'); return false;">
                        <span class="icon-btn is-locked" title="Đã khóa Paste văn bản sao chép">🚫</span>
                        <button class="icon-btn is-active" onclick="FeatureShowcase.submitVivaInput()" title="Gửi câu trả lời">➤</button>
                    </div>
                </div>
            </div>
        `;
    },

    sendVivaSample: function(text) {
        text = text || (this.vivaMode === 'feynman' ? this.vivaData.sampleFeynman : this.vivaData.sampleExaminer) || '';
        const input = document.getElementById('viva-user-input');
        if (input) {
            input.value = text;
            this.submitVivaInput();
        }
    },

    submitVivaInput: function() {
        const input = document.getElementById('viva-user-input');
        const list = document.getElementById('viva-msg-list');
        if (!input || !list || !input.value.trim()) return;
        const val = input.value.trim();
        input.value = '';

        list.insertAdjacentHTML('beforeend', `
            <div class="viva-msg user">${val}</div>
            <div class="viva-msg ai">
                <strong>${this.vivaMode === 'feynman' ? '🧑‍🎓 AI Học Sinh' : '👨‍⚖️ AI Giám Khảo'}:</strong>
                ${this.vivaData.reply}
            </div>
        `);
        list.scrollTop = list.scrollHeight;
    },

    // =========================================================================
    // 4. SỔ TAY PHỤC THÙ CÂU SAI (INTERACTIVE ERROR TRACKER)
    // =========================================================================
    renderMistakeBook: function(filterSubj = 'all') {
        this.mistakeFilter = filterSubj || 'all';
        const main = document.getElementById('main-app-content');
        if (!main) return;

        const items = this.mistakeFilter === 'all'
            ? this.mistakesData
            : this.mistakesData.filter(m => m.subject.includes(this.mistakeFilter));

        main.innerHTML = `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="AppController.renderHome()" title="Về Trang Chủ">←</button>
                    <h2 class="ws-title">📕 Sổ Tay Câu Sai</h2>
                </div>

                <div class="ws-tabs">
                    <button class="ws-tab ${this.mistakeFilter === 'all' ? 'active' : ''}" onclick="FeatureShowcase.renderMistakeBook('all')">Tất cả (${this.mistakesData.length})</button>
                    <button class="ws-tab ${this.mistakeFilter === 'Toán' ? 'active' : ''}" onclick="FeatureShowcase.renderMistakeBook('Toán')">Toán</button>
                    <button class="ws-tab ${this.mistakeFilter === 'Vật Lý' ? 'active' : ''}" onclick="FeatureShowcase.renderMistakeBook('Vật Lý')">Vật Lý</button>
                    <button class="ws-tab ${this.mistakeFilter === 'Hóa' ? 'active' : ''}" onclick="FeatureShowcase.renderMistakeBook('Hóa')">Hóa Học</button>
                </div>

                <div class="ws-topbar-right">
                    <button class="icon-btn" onclick="FeatureShowcase.shuffleMistakes()" title="Đảo vị trí đáp án A-B-C-D">🔀</button>
                </div>
            </div>

            <div class="mistake-stat-strip">
                <div class="m-stat">
                    <span style="font-size:0.84rem; color:var(--text-muted);">📕 Cần phục thù</span>
                    <strong style="color:#ef4444;">${this.mistakesData.length}</strong>
                </div>
                <div class="m-stat">
                    <span style="font-size:0.84rem; color:var(--text-muted);">🔥 Sắp xóa (2/3 lần đúng)</span>
                    <strong style="color:#f59e0b;">${this.mistakesData.filter(m => m.streak >= 2).length}</strong>
                </div>
                <div class="m-stat">
                    <span style="font-size:0.84rem; color:var(--text-muted);">✅ Đã thuộc lòng (3/3)</span>
                    <strong style="color:#10b981;">${this.settings.masteredCount}</strong>
                </div>
            </div>

            <div>
                ${items.map(item => {
                    const picked = this.mistakeAnswers[item.id];
                    const isAnswered = picked !== undefined;
                    const isRight = picked === item.correctIndex;
                    const streakCount = isRight ? Math.min(3, item.streak + 1) : item.streak;

                    return `
                        <div class="mistake-card">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="ws-pill">${item.subject}</span>
                                    <span style="font-size:0.76rem; color:var(--text-muted);">${item.source}</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;" title="Làm đúng 3 lần ở các ngày khác nhau để xóa khỏi sổ">
                                    <span style="font-size:0.76rem; color:var(--text-muted);">Tiến độ xóa:</span>
                                    <div class="streak-dots">
                                        <span class="s-dot ${streakCount >= 1 ? 'done' : ''}"></span>
                                        <span class="s-dot ${streakCount >= 2 ? 'done' : ''}"></span>
                                        <span class="s-dot ${streakCount >= 3 ? 'done' : ''}"></span>
                                    </div>
                                    <span style="font-size:0.76rem; font-weight:800;">${streakCount}/3</span>
                                </div>
                            </div>

                            <div style="font-weight:700; font-size:0.96rem; margin-bottom:12px;">${item.question}</div>

                            <div class="pk-opt-grid">
                                ${item.options.map((opt, idx) => {
                                    let cls = '';
                                    if (isAnswered) {
                                        if (idx === item.correctIndex) cls = 'correct';
                                        else if (idx === picked) cls = 'wrong';
                                    }
                                    return `
                                        <button class="pk-opt ${cls}" style="padding:10px 12px; font-size:0.85rem;" onclick="FeatureShowcase.answerMistake(${item.id}, ${idx})">
                                            ${opt}
                                        </button>
                                    `;
                                }).join('')}
                            </div>

                            ${isAnswered ? `
                                <div style="margin-top:10px; padding:10px 12px; border-radius:10px; background:var(--bg-input); font-size:0.82rem; border-left:3px solid ${isRight ? '#10b981' : '#ef4444'};">
                                    <strong>${isRight ? '✅ Chính xác!' : '❌ Vẫn nhầm!'}</strong> ${item.explanation}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    answerMistake: function(id, idx) {
        this.mistakeAnswers[id] = idx;
        this.renderMistakeBook(this.mistakeFilter);
    },

    shuffleMistakes: function() {
        this.mistakeAnswers = {};
        this.renderMistakeBook(this.mistakeFilter);
    },

    // =========================================================================
    // 5. BẠN CÙNG TIẾN (CLEAN STREAK & STUDY CARD MESSENGER)
    // =========================================================================
    renderStudyBuddy: function(buddyId = null) {
        if (buddyId) this.activeBuddyId = buddyId;
        const main = document.getElementById('main-app-content');
        if (!main) return;

        const activeBuddy = this.buddiesData.find(b => b.id === this.activeBuddyId) || this.buddiesData[0];

        main.innerHTML = `
            <div class="ws-topbar">
                <div class="ws-topbar-left">
                    <button class="icon-btn" onclick="AppController.renderHome()" title="Về Trang Chủ">←</button>
                    <h2 class="ws-title">🤝 Bạn Cùng Tiến</h2>
                    <span class="ws-pill timer">🔥 Chuỗi cao nhất: ${this.settings.topStreak} ngày</span>
                </div>
                <div class="ws-topbar-right">
                    <button class="icon-btn ${this.dndEnabled ? 'is-active' : ''}" onclick="FeatureShowcase.dndEnabled=!FeatureShowcase.dndEnabled; FeatureShowcase.renderStudyBuddy()" title="Khiên chặn thông báo khi đang làm đề thi: ${this.dndEnabled ? 'BẬT' : 'TẮT'}">
                        🛡️
                    </button>
                </div>
            </div>

            <div class="buddy-workspace">
                <!-- LEFT: BUDDY LIST -->
                <div class="buddy-list-pane">
                    <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted); padding:2px 4px;">
                        DANH SÁCH ĐỒNG ĐỘI (${this.buddiesData.length})
                    </div>
                    ${this.buddiesData.map(b => `
                        <div class="buddy-item ${b.id === activeBuddy.id ? 'active' : ''}" onclick="FeatureShowcase.renderStudyBuddy(${b.id})">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:1.5rem;">${b.avatar}</span>
                                <div>
                                    <div style="font-weight:700; font-size:0.88rem;">${b.name}</div>
                                    <div style="font-size:0.73rem; color:var(--text-muted);">${b.status}</div>
                                </div>
                            </div>
                            <span class="ws-pill timer" style="padding:3px 8px; font-size:0.74rem;">🔥 ${b.streak}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- RIGHT: INTERACTION & STUDY CARDS -->
                <div class="buddy-chat-pane">
                    <!-- Top Header -->
                    <div style="padding:12px 16px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:1.6rem;">${activeBuddy.avatar}</span>
                            <div>
                                <div style="font-weight:800; font-size:0.95rem;">${activeBuddy.name} <span style="font-weight:500; font-size:0.78rem; color:var(--text-muted);">(${activeBuddy.grade})</span></div>
                                <div style="font-size:0.75rem; color:#10b981;">🔥 Chuỗi ${activeBuddy.streak} ngày • Hôm nay: ${activeBuddy.todayDone} hoàn thành</div>
                            </div>
                        </div>

                        <!-- ICON-ONLY QUICK INVITE ACTIONS -->
                        <div style="display:flex; gap:8px;">
                            <button class="icon-btn" onclick="FeatureShowcase.sendBuddyCard('pomodoro')" title="Gửi Thẻ Rủ Học Pomodoro 25p">🍅</button>
                            <button class="icon-btn" onclick="FeatureShowcase.sendBuddyCard('pk')" title="Gửi Thẻ Thách Đấu PK 1v1">⚔️</button>
                            <button class="icon-btn" onclick="FeatureShowcase.sendBuddyCard('question')" title="Đính kèm Mã Câu Hỏi nhờ giải">❓</button>
                        </div>
                    </div>

                    <!-- Card Stream -->
                    <div class="viva-messages" id="buddy-stream">
                        ${activeBuddy.messages.map(m => m.type === 'invite' ? `
                            <div class="invite-card-msg">
                                <div>
                                    <div style="font-weight:800; font-size:0.9rem;">${m.title}</div>
                                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Từ ${m.from} • ${m.sub}</div>
                                </div>
                                <button class="btn-gradient" style="padding:6px 14px; font-size:0.8rem;" onclick="FeatureShowcase.${m.actionRoute === 'pk-arena' ? "renderPKArena('battle')" : "renderStudyRooms('all', 'room-101')"}">
                                    Tham gia →
                                </button>
                            </div>
                        ` : `
                            <div class="chat-item" style="padding:12px 14px;">
                                <strong>${m.title} (${m.from})</strong>
                                <div style="margin:4px 0 8px; color:var(--text-muted);">${m.sub}</div>
                                <div style="padding:8px 10px; border-radius:8px; background:var(--bg-card); border-left:3px solid #10b981;">
                                    💬 <strong>Lời giải:</strong> ${m.reply}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Bottom Bar: Quick Study Cards + Locked Free Chat -->
                    <div class="viva-composer">
                        <button class="ws-pill" style="cursor:pointer;" onclick="FeatureShowcase.sendBuddyCard('pomodoro')" title="Gửi nhanh thẻ rủ học">
                            + 🍅 Rủ học 25p
                        </button>
                        <button class="ws-pill" style="cursor:pointer;" onclick="FeatureShowcase.sendBuddyCard('question')" title="Gửi mã câu hỏi">
                            + ❓ Mã câu hỏi
                        </button>
                        <input type="text" class="viva-input" style="height:36px; font-size:0.8rem;" placeholder="🔒 Hoàn thành 25p học chung để mở khóa chat tự do..." disabled>
                        <button class="icon-btn is-locked" style="width:36px; height:36px;" title="Chat tự do chỉ mở trong 5p giải lao">➤</button>
                    </div>
                </div>
            </div>
        `;
    },

    sendBuddyCard: function(cardType) {
        const activeBuddy = this.buddiesData.find(b => b.id === this.activeBuddyId) || this.buddiesData[0];
        if (cardType === 'pomodoro') {
            activeBuddy.messages.push({
                type: 'invite',
                from: 'Bạn',
                title: '🍅 Rủ học Pomodoro 25p',
                sub: 'Phòng: Cày Đề Toán 12 - Mục Tiêu 9+',
                actionRoute: 'study-rooms'
            });
        } else if (cardType === 'pk') {
            activeBuddy.messages.push({
                type: 'invite',
                from: 'Bạn',
                title: '⚔️ Thách đấu PK Solo 1v1',
                sub: 'Môn: Toán 12 • 10 câu tốc độ',
                actionRoute: 'pk-arena'
            });
        } else {
            activeBuddy.messages.push({
                type: 'question',
                from: 'Bạn',
                title: '❓ Nhờ giải đáp câu #LY12-208',
                sub: 'Đặt điện áp xoay chiều vào mạch chỉ có tụ điện C...',
                reply: 'Đang chờ đồng đội phản hồi vào câu hỏi này...'
            });
        }
        this.renderStudyBuddy(activeBuddy.id);
    }
};

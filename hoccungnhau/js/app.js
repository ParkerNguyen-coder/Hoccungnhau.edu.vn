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
   HỌC CÙNG NHAU - MAIN APP CONTROLLER (V17 ENHANCED)
   ========================================================================== */

const AppController = {
    init: function() {
        this.renderTicker();
        this.renderHome();
        this.bindNavigation();
        this.bindFeedbackModal();
        this.bindQuestionBankModal();
        this.bindQAModal();
        this.bindGlobalSearchModal();
    },
    
    renderTicker: function() {
        const tickerEl = document.getElementById('news-ticker-content');
        if (tickerEl && typeof TICKER_HEADLINES !== 'undefined') {
            tickerEl.textContent = TICKER_HEADLINES.join("  ---  ");
        }
    },
    
    bindNavigation: function() {
        const logo = document.getElementById('logo-home');
        if (logo) {
            logo.addEventListener('click', () => this.renderHome());
        }

        // Mobile Hamburger Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const navBar = document.getElementById('site-nav-bar');
        if (mobileBtn && navBar) {
            mobileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navBar.classList.toggle('mobile-active');
            });
        }

        // Header "📚 Lớp Học" Dropdown Toggle Click Handler
        const classToggle = document.getElementById('class-dropdown-toggle');
        const classMenu = document.getElementById('class-dropdown-menu');
        if (classToggle && classMenu) {
            classToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                classMenu.classList.toggle('open');
                // Navigate to Classes Overview if clicked directly
                this.renderClassesOverview();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('#nav-class-item')) {
                    classMenu.classList.remove('open');
                }
            });
        }
        
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetEl = e.target.closest('[data-route]');
                if (!targetEl) return;
                
                const route = targetEl.dataset.route;
                const param = targetEl.dataset.param;

                // Close dropdown & mobile menu when navigating
                if (classMenu) classMenu.classList.remove('open');
                if (navBar) navBar.classList.remove('mobile-active');
                
                if (route === 'home') {
                    this.renderHome();
                } else if (route === 'classes') {
                    this.renderClassesOverview();
                } else if (route === 'study-rooms') {
                    if (typeof FeatureShowcase !== 'undefined') FeatureShowcase.renderStudyRooms('all');
                } else if (route === 'pk-arena') {
                    if (typeof FeatureShowcase !== 'undefined') FeatureShowcase.renderPKArena('battle');
                } else if (route === 'ai-viva') {
                    if (typeof FeatureShowcase !== 'undefined') FeatureShowcase.renderAIViva('feynman');
                } else if (route === 'mistake-book') {
                    if (typeof FeatureShowcase !== 'undefined') FeatureShowcase.renderMistakeBook('all');
                } else if (route === 'study-buddy') {
                    if (typeof FeatureShowcase !== 'undefined') FeatureShowcase.renderStudyBuddy();
                } else if (route === 'highschool') {
                    AuthService.requireAuth(() => this.renderHighSchoolGrade(parseInt(param)));
                } else if (route === 'thptqg') {
                    AuthService.requireAuth(() => this.renderTHPTQG());
                } else if (route === 'university') {
                    AuthService.requireAuth(() => this.renderUniversity());
                } else if (route === 'news') {
                    this.renderNewsPage();
                }
            });
        });
    },
    
    bindFeedbackModal: function() {
        const btn = document.getElementById('feedback-btn');
        const modal = document.getElementById('feedback-modal');
        const closeBtn = document.getElementById('feedback-modal-close');
        const form = document.getElementById('feedback-form');
        
        if (btn && modal) {
            btn.addEventListener('click', () => modal.classList.add('active'));
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('❤️ Cảm ơn đóng góp ý kiến của bạn! Chúng tôi sẽ xem xét cải thiện trang web.');
                document.getElementById('feedback-content').value = '';
                modal.classList.remove('active');
            });
        }
    },
    
    bindQuestionBankModal: function() {
        const btn = document.getElementById('question-bank-btn');
        const modal = document.getElementById('question-bank-modal');
        const closeBtn = document.getElementById('question-bank-modal-close');
        
        if (btn && modal) {
            btn.addEventListener('click', () => {
                this.renderQuestionBank('all');
                modal.classList.add('active');
            });
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        
        document.querySelectorAll('.btn-filter').forEach(filterBtn => {
            filterBtn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.dataset.bank;
                this.renderQuestionBank(category);
            });
        });
    },
    
    renderQuestionBank: function(category) {
        const container = document.getElementById('question-bank-container');
        if (!container) return;
        
        let list = [];
        
        [10, 11, 12].forEach(g => {
            if (category === 'all' || category === `g${g}`) {
                if (HIGHSCHOOL_DATA[`grade_${g}`]) {
                    HIGHSCHOOL_DATA[`grade_${g}`].forEach(subj => {
                        list.push({
                            title: `${subj.title} (Lớp ${g})`,
                            category: `Phổ Thông - Lớp ${g}`,
                            count: subj.quiz ? subj.quiz.length : 20,
                            quizData: subj.quiz
                        });
                    });
                }
            }
        });
        
        if ((category === 'all' || category === 'thptqg') && HIGHSCHOOL_DATA.thptqg) {
            list.push({
                title: HIGHSCHOOL_DATA.thptqg.title,
                category: "Ôn Thi THPTQG 2027",
                count: HIGHSCHOOL_DATA.thptqg.quiz ? HIGHSCHOOL_DATA.thptqg.quiz.length : 20,
                quizData: HIGHSCHOOL_DATA.thptqg.quiz
            });
        }
        
        if ((category === 'all' || category === 'uni') && typeof UNIVERSITY_DATA !== 'undefined') {
            UNIVERSITY_DATA.forEach(subj => {
                list.push({
                    title: `${subj.title} (Đại Học Kỹ Thuật)`,
                    category: subj.category,
                    count: subj.quiz ? subj.quiz.length : 20,
                    quizData: subj.quiz
                });
            });
        }
        
        container.innerHTML = list.map((item, idx) => `
            <div class="question-bank-card" style="background:var(--bg-input); padding:1.2rem; border-radius:12px; border:1px solid var(--border-color); margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div>
                    <span style="font-size:0.75rem; color:var(--primary-purple); font-weight:700; text-transform:uppercase;">${item.category}</span>
                    <h4 style="margin:0.2rem 0;">${item.title}</h4>
                    <span style="font-size:0.85rem; color:var(--text-muted);">📋 Bộ đề <strong>${item.count} câu trắc nghiệm</strong> đếm giờ 30:00</span>
                </div>
                <button class="btn-gradient" style="font-size:0.85rem; padding:0.5rem 1.2rem;" onclick="AppController.startBankQuiz(${idx})">
                    Luyện Thi Ngay 🚀
                </button>
            </div>
        `).join('');
        
        this.currentBankList = list;
    },
    
    startBankQuiz: function(idx) {
        if (this.currentBankList && this.currentBankList[idx]) {
            const item = this.currentBankList[idx];
            document.getElementById('question-bank-modal').classList.remove('active');
            AuthService.requireAuth(() => QuizEngine.startQuiz(item.quizData, item.title));
        }
    },
    
    bindQAModal: function() {
        const btn = document.getElementById('qa-btn');
        const modal = document.getElementById('qa-modal');
        const closeBtn = document.getElementById('qa-modal-close');
        const form = document.getElementById('qa-post-form');
        
        if (btn && modal) {
            btn.addEventListener('click', () => {
                this.renderQAThreads();
                modal.classList.add('active');
            });
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const subj = document.getElementById('qa-subject-select').value;
                const title = document.getElementById('qa-title-input').value;
                const content = document.getElementById('qa-content-input').value;
                const author = AuthService.currentUser ? AuthService.currentUser.name : 'Học Viên ẩn danh';
                
                const newThread = {
                    author: author,
                    subject: subj,
                    title: title,
                    content: content,
                    date: "Vừa xong",
                    answers: []
                };
                
                if (!this.qaThreads) this.qaThreads = [];
                this.qaThreads.unshift(newThread);
                this.renderQAThreads();
                
                alert('🚀 Đã đăng câu hỏi của bạn lên diễn đàn!');
                form.reset();
            });
        }
    },
    
    renderQAThreads: function() {
        const container = document.getElementById('qa-threads-list');
        if (!container) return;
        
        if (!this.qaThreads) {
            this.qaThreads = [
                {
                    author: "Trần Minh Hoàng (Lớp 12)",
                    subject: "Toán Lớp 12 & THPTQG",
                    title: "Thắc mắc về cách bấm máy tính giải nhanh Ma trận & Hệ phương trình?",
                    content: "Thầy cô và các bạn cho em hỏi làm sao để tính định thức det(A) nhanh trên máy tính Casio fx-580VN?",
                    date: "10 phút trước",
                    answers: [
                        {
                            responder: "ThS. Nguyễn Văn Đức (Giảng Viên)",
                            text: "Em vào chế độ MODE 4 (Matrix) -> Khởi tạo MatA cấp 3x3 -> Bấm OPTN -> Chọn Determinant (Det) -> Optn MatA -> Equal (=) để xem kết quả ngay nhé!"
                        }
                    ]
                },
                {
                    author: "Lê Thu Hà (Sinh Viên Kỹ Thuật)",
                    subject: "Lập Trình Cơ Bản C++",
                    title: "Lỗi 'Segmentation Fault' khi thao tác với Con Trỏ (Pointer) trong C++",
                    content: "Khi em truyền con trỏ vào hàm mà chưa cấp phát bộ nhớ động bằng `new` thì bị văng chương trình. Cách xử lý chuẩn là gì ạ?",
                    date: "1 giờ trước",
                    answers: [
                        {
                            responder: "Senior Developer (Cố Vấn)",
                            text: "Luôn kiểm tra `if (ptr != nullptr)` trước khi truy xuất giá trị `*ptr`, và nhớ gọi `ptr = new Type()` hoặc dùng Smart Pointer `std::unique_ptr` trong C++11 trở lên em nhé!"
                        }
                    ]
                }
            ];
        }
        
        container.innerHTML = this.qaThreads.map(q => `
            <div class="qa-card" style="background:var(--bg-input); padding:1rem 1.2rem; border-radius:12px; border:1px solid var(--border-color);">
                <div class="qa-header" style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem;">
                    <span>👤 <strong>${q.author}</strong> • <span style="color:var(--primary-purple); font-weight:700;">${q.subject}</span></span>
                    <span style="color:var(--text-muted);">${q.date}</span>
                </div>
                <div class="qa-title" style="font-weight:700; font-size:1rem; margin-bottom:0.3rem;">${q.title}</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.8rem;">${q.content}</p>
                
                ${q.answers.map(ans => `
                    <div class="qa-solution-box" style="background:var(--bg-card); padding:0.8rem; border-radius:8px; border-left:3px solid var(--primary-purple); margin-top:0.5rem; font-size:0.88rem;">
                        <div style="font-weight:700; color:var(--primary-purple); margin-bottom:0.2rem;">✅ Lời Giải Từ: ${ans.responder}</div>
                        <div>${ans.text}</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    },
    
    bindGlobalSearchModal: function() {
        const btn = document.getElementById('global-search-btn');
        const modal = document.getElementById('search-modal');
        const closeBtn = document.getElementById('search-modal-close');
        const input = document.getElementById('global-search-input');
        const container = document.getElementById('search-results-container');
        
        if (btn && modal) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                if (input) input.focus();
            });
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        
        if (input) {
            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">💡 Hãy gõ từ khóa bất kỳ để tìm nhanh bài giảng Video, Link tài liệu API hoặc Bộ bài tập trắc nghiệm 20 câu.</div>`;
                    return;
                }
                
                let matches = [];
                
                [10, 11, 12].forEach(g => {
                    if (HIGHSCHOOL_DATA[`grade_${g}`]) {
                        HIGHSCHOOL_DATA[`grade_${g}`].forEach(subj => {
                            const matchTitle = subj.title.toLowerCase().includes(query);
                            const matchSubject = subj.subject ? subj.subject.toLowerCase().includes(query) : false;
                            const matchGrade = query.includes(`${g}`) || query.includes(`lớp ${g}`);
                            const matchQuiz = subj.quiz ? subj.quiz.some(q => q.question.toLowerCase().includes(query)) : false;

                            if (matchTitle || matchSubject || matchGrade || matchQuiz || query === 'toán' || query === 'văn' || query === 'lý' || query === 'hóa' || query === 'sinh' || query === 'anh' || query === 'phổ thông' || query === 'thpt') {
                                matches.push({
                                    title: `${subj.title} (Lớp ${g})`,
                                    type: "Bài Giảng & 20 Câu Quiz",
                                    action: () => {
                                        modal.classList.remove('active');
                                        AuthService.requireAuth(() => AppController.renderSubjectDetail('highschool', g, subj.id));
                                    }
                                });
                            }
                        });
                    }
                });

                if (HIGHSCHOOL_DATA.thptqg) {
                    const thpt = HIGHSCHOOL_DATA.thptqg;
                    if (thpt.title.toLowerCase().includes(query) || query.includes('thpt') || query.includes('ôn thi') || query.includes('tốt nghiệp')) {
                        matches.push({
                            title: thpt.title,
                            type: "Cẩm Nang & Đề Thi THPTQG 2027",
                            action: () => {
                                modal.classList.remove('active');
                                AuthService.requireAuth(() => AppController.renderTHPTQG());
                            }
                        });
                    }
                }
                
                if (typeof UNIVERSITY_DATA !== 'undefined') {
                    UNIVERSITY_DATA.forEach(subj => {
                        const matchTitle = subj.title.toLowerCase().includes(query);
                        const matchCategory = subj.category ? subj.category.toLowerCase().includes(query) : false;
                        const matchUniv = query.includes('đại học') || query.includes('đại học kỹ thuật') || query.includes('cntt') || query.includes('kỹ thuật');
                        const matchQuiz = subj.quiz ? subj.quiz.some(q => q.question.toLowerCase().includes(query)) : false;

                        if (matchTitle || matchCategory || matchUniv || matchQuiz) {
                            matches.push({
                                title: `${subj.title} (Đại Học)`,
                                type: "Chuyên Đề Kỹ Thuật & 20 Câu Quiz",
                                action: () => {
                                    modal.classList.remove('active');
                                    AuthService.requireAuth(() => AppController.renderSubjectDetail('university', 0, subj.id));
                                }
                            });
                        }
                    });
                }
                
                if (matches.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">❌ Không tìm thấy kết quả phù hợp với từ khóa "${query}".</div>`;
                } else {
                    container.innerHTML = matches.map((m, idx) => `
                        <div class="search-card" style="background:var(--bg-input); padding:0.8rem 1.2rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h4 style="margin-bottom:0.2rem;">${m.title}</h4>
                                <span style="font-size:0.8rem; color:var(--primary-purple); font-weight:700;">${m.type}</span>
                            </div>
                            <button class="btn-gradient" style="font-size:0.8rem; padding:0.4rem 1rem;" onclick="AppController.executeSearchClick(${idx})">Xem Ngay →</button>
                        </div>
                    `).join('');
                    
                    this.currentMatches = matches;
                }
            });
        }
    },
    
    executeSearchClick: function(idx) {
        if (this.currentMatches && this.currentMatches[idx]) {
            this.currentMatches[idx].action();
        }
    },
    
    getFormulaTags: function(subjId, subjName) {
        const tagMap = {
            'toán': ['∫f(x)dx', 'Δ=b²-4ac', 'Oxyz', 'lim(x→∞)', 'sin²x+cos²x=1'],
            'lí': ['E=mc²', 'F=ma', 'T=2π√(l/g)', 'U=I·R', 'λ=v·T'],
            'hóa': ['H₂SO₄', 'pH=-log[H⁺]', '⇌', 'C_n(H₂O)_m', 'Mol/L'],
            'sinh': ["DNA 5'-3'", 'mARN', 'Codon AUG', 'Tế Bào', 'Di Truyền'],
            'anh': ['Grammar', 'Vocabulary', 'Present Perfect', 'IELTS 8.0+'],
            'văn': ['Bình Ngô Đại Cáo', 'Chí Phèo', 'Tuyên Ngôn', 'Nghệ Thuật']
        };

        const key = subjId ? subjId.split('-')[0] : '';
        const tags = tagMap[key] || ['Kiến Thức Trọng Tâm', '20 Câu Quiz', 'Lời Giải Chi Tiết'];
        return tags.map(t => `<span class="formula-tag">${t}</span>`).join('');
    },

        renderClassesOverview: function() {
        const main = document.getElementById('main-app-content');
        if (!main) return;

        main.innerHTML = `
            <div style="margin-bottom:1.5rem;">
                <button class="btn-icon" onclick="AppController.renderHome()">← Trở Về Trang Chủ</button>
            </div>
            <h1 class="section-title">📚 Danh Mục Các Lớp & Khối Ngành Học Tập</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem; font-size:1rem;">
                Hệ thống bài giảng video, tài liệu tham khảo và ngân hàng 20 câu hỏi Quiz củng cố dành cho Lớp 10, 11, 12, Ôn Thi THPTQG 2027 và Đại Học Kỹ Thuật.
            </p>

            <div class="card-grid">
                <div class="course-card" style="border-top:4px solid var(--primary-purple);">
                    <div>
                        <span class="card-tag">Lớp 10 (Sách Mới)</span>
                        <h3 class="card-title">🏫 Chương Trình Học Lớp 10</h3>
                        <p class="card-info">Gồm 6 môn cốt lõi: Ngữ Văn, Toán, Tiếng Anh, Vật Lý, Hóa Học, Sinh Học. Đầy đủ video, tài liệu & Quiz 20 câu.</p>
                    </div>
                    <button class="btn-gradient" style="width:100%; margin-top:1.5rem;" onclick="AuthService.requireAuth(() => AppController.renderHighSchoolGrade(10))">
                        Vào Học Lớp 10 →
                    </button>
                </div>

                <div class="course-card" style="border-top:4px solid var(--accent-cyan);">
                    <div>
                        <span class="card-tag">Lớp 11 (Sách Mới)</span>
                        <h3 class="card-title">🏫 Chương Trình Học Lớp 11</h3>
                        <p class="card-info">Gồm 6 môn cốt lõi: Ngữ Văn, Toán, Tiếng Anh, Vật Lý, Hóa Học, Sinh Học. Luyện tập trắc nghiệm đếm giờ 30 phút.</p>
                    </div>
                    <button class="btn-gradient" style="width:100%; margin-top:1.5rem;" onclick="AuthService.requireAuth(() => AppController.renderHighSchoolGrade(11))">
                        Vào Học Lớp 11 →
                    </button>
                </div>

                <div class="course-card" style="border-top:4px solid var(--accent-pink);">
                    <div>
                        <span class="card-tag">Lớp 12 (Sách Mới)</span>
                        <h3 class="card-title">🏫 Chương Trình Học Lớp 12</h3>
                        <p class="card-info">Gồm 6 môn cốt lõi: Ngữ Văn, Toán, Tiếng Anh, Vật Lý, Hóa Học, Sinh Học. Bộ đề thi chuẩn bị cho tốt nghiệp.</p>
                    </div>
                    <button class="btn-gradient" style="width:100%; margin-top:1.5rem;" onclick="AuthService.requireAuth(() => AppController.renderHighSchoolGrade(12))">
                        Vào Học Lớp 12 →
                    </button>
                </div>

                <div class="course-card" style="border-top:4px solid var(--primary-purple);">
                    <div>
                        <span class="card-tag" style="color:var(--accent-pink);">Ôn Thi THPTQG 2027</span>
                        <h3 class="card-title">🔥 Cẩm Nang Ôn Thi THPTQG 2027</h3>
                        <p class="card-info">Tổng hợp bộ đề thi thử Toán, Lý, Hóa, Anh, Văn, Sinh. Có link tải file đề PDF và 20 câu Quiz tổng hợp.</p>
                    </div>
                    <button class="btn-gradient" style="width:100%; margin-top:1.5rem;" onclick="AuthService.requireAuth(() => AppController.renderTHPTQG())">
                        Vào Ôn Thi THPTQG →
                    </button>
                </div>

                <div class="course-card" style="border-top:4px solid var(--accent-cyan);">
                    <div>
                        <span class="card-tag" style="color:var(--accent-cyan);">Khối Ngành Đại Học</span>
                        <h3 class="card-title">🏛️ Chương Trình Đại Học Kỹ Thuật</h3>
                        <p class="card-info">Các môn chuyên ngành: Đại số tuyến tính, Toán rời rạc, Lập trình C++, Pháp luật đại cương & Web Fullstack.</p>
                    </div>
                    <button class="btn-gradient" style="width:100%; margin-top:1.5rem;" onclick="AuthService.requireAuth(() => AppController.renderUniversity())">
                        Vào Học Đại Học →
                    </button>
                </div>
            </div>
        `;
    },

    renderHome: function() {
        const main = document.getElementById('main-app-content');
        if (!main) return;
        
        main.innerHTML = `
            <!-- HERO BANNER -->
            <section class="hero-section">
                <h1 class="hero-title">Học Cùng Nhau - Không Gian Học Tập & Đấu Luyện Số</h1>
                <p class="hero-desc">Nền tảng học tập tương tác dành cho học sinh Cấp 3, Ôn thi THPTQG & Đại học Kỹ thuật.</p>
                <div class="news-roll-ticker">
                    <span class="ticker-badge">🔥 TIN NỔI BẬT</span>
                    <div class="ticker-text" id="news-ticker-content">
                        ${typeof TICKER_HEADLINES !== 'undefined' ? TICKER_HEADLINES.join("  ---  ") : ''}
                    </div>
                </div>
            </section>
            
            <!-- HỆ SINH THÁI 6 TÍNH NĂNG TRỌNG TÂM -->
            <section class="band band-ecosystem"><div class="band-inner">${typeof FeatureShowcase !== "undefined" ? FeatureShowcase.getHomeEcosystemHTML() : ""}</div></section>
            
            <!-- KINH NGHIỆM (EXP) -->
            <section class="band band-exp"><div class="band-inner">${typeof GamificationSystem !== "undefined" ? GamificationSystem.getExpPanelHTML() : ""}</div></section>
            
            <!-- TIN TỨC & BÀI BÁO GIÁO DỤC -->
            <section class="band band-news"><div class="band-inner">
                <h2 class="section-title">📰 Bài Báo & Thông Tin Giáo Dục Mới Nhất</h2>
            <div class="card-grid">
                ${NEWS_DATA.map(n => `
                    <div class="course-card">
                        <div>
                            <span class="card-tag">${n.category}</span>
                            <h3 class="card-title">${n.title}</h3>
                            <p class="card-info">${n.summary}</p>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
                            <small style="color:var(--text-muted);">${n.date}</small>
                            <a href="${n.url}" target="_blank" rel="noopener noreferrer" class="btn-icon" style="font-size:0.8rem;">Chi Tiết 🔗</a>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            </div></section>
            <section class="band band-rank"><div class="band-inner">${typeof GamificationSystem !== "undefined" ? GamificationSystem.getLeaderboardHTML() : ""}</div></section>
            
            <!-- ĐỘI NGŨ PHÁT TRIỂN -->
            <section class="band band-team"><div class="band-inner">
                <h2 class="section-title">👨‍💻 Đội Ngũ Phát Triển Dự Án</h2>
            <div class="team-grid">
                <div class="team-card">
                    <div class="developer-avatar-box">
                        <div class="avatar-placeholder">🎓</div>
                    </div>
                    <h3>Tác Giả & Lập Trình Viên Chính</h3>
                    <p style="color:var(--accent-cyan); font-size:0.9rem; margin-bottom:0.5rem;">Chuyên Gia Web Fullstack</p>
                    <p style="color:var(--text-muted); font-size:0.85rem;">Phụ trách thiết kế giao diện Gradient tím, cấu trúc mã nguồn mô-đun Clean Code và tích hợp Firebase Console (hoccungnhau-cd2c6).</p>
                </div>
            </div>
            </div></section>
        `;
    },
    
    renderHighSchoolGrade: function(grade) {
        const main = document.getElementById('main-app-content');
        const data = HIGHSCHOOL_DATA[`grade_${grade}`];
        if (!main || !data) return;
        
        main.innerHTML = `
            <div style="margin-bottom:2rem;">
                <button class="btn-icon" onclick="AppController.renderHome()">← Trở Về Trang Chủ</button>
            </div>
            <h1 class="section-title">📚 Chương Trình Học Lớp ${grade}</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">Gồm 6 môn cốt lõi: Văn, Toán, Anh, Lý, Hóa, Sinh. Mỗi môn có 5 video bài giảng YouTube trực quan, 10 tài liệu tham khảo và bài tập Quiz 20 câu củng cố.</p>
            
            <div class="card-grid">
                ${data.map(subj => `
                    <div class="course-card">
                        <div>
                            <span class="card-tag">Lớp ${grade}</span>
                            <h3 class="card-title">${subj.title}</h3>
                            <div class="subject-formula-tags">
                                ${this.getFormulaTags(subj.id, subj.subject)}
                            </div>
                            <p class="card-info">📹 5 Video bài giảng | 📄 10 Link Tài liệu | 🎯 20 Câu Quiz</p>
                        </div>
                        <button class="btn-gradient" style="width:100%; margin-top:1rem;" onclick="AppController.renderSubjectDetail('highschool', ${grade}, '${subj.id}')">
                            Vào Học Môn ${subj.subject} →
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderTHPTQG: function() {
        const main = document.getElementById('main-app-content');
        const data = HIGHSCHOOL_DATA.thptqg;
        if (!main || !data) return;
        
        main.innerHTML = `
            <div style="margin-bottom:2rem;">
                <button class="btn-icon" onclick="AppController.renderHome()">← Trở Về Trang Chủ</button>
            </div>
            <h1 class="section-title">🎓 ${data.title}</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">${data.description}</p>
            
            <div class="quiz-container" style="background:var(--bg-card); padding:2rem; border-radius:16px; border:1px solid var(--border-color);">
                <h3>📄 Bộ Đề Thi Thử & Link Tải File PDF</h3>
                <div style="margin:1rem 0; display:flex; flex-direction:column; gap:0.75rem;">
                    ${data.examSets.map(ex => `
                        <div style="background:var(--bg-input); padding:0.8rem 1.2rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                            <span style="font-weight:600;">${ex.title}</span>
                            <a href="${ex.pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" style="font-size:0.85rem;">Tải Đề PDF 📥</a>
                        </div>
                    `).join('')}
                </div>
                
                <h3 style="margin-top:2rem; margin-bottom:1rem;">📹 Video Luyện Đề Thần Tốc</h3>
                <div style="margin:1rem 0; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.2rem;">
                    ${data.videos.map(v => `
                        <div style="background:var(--bg-input); padding:1rem; border-radius:12px; border:1px solid var(--border-color);">
                            <h4 style="font-size:0.95rem; margin-bottom:0.4rem;">${v.title}</h4>
                            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px; margin-top:0.5rem; background:#000;">
                                <iframe src="${formatYouTubeEmbedUrl(v.embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:10px;" allowfullscreen></iframe>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn-gradient" style="margin-top:2rem; width:100%; padding:1rem; font-size:1.05rem;" onclick="QuizEngine.startQuiz(HIGHSCHOOL_DATA.thptqg.quiz, 'Luyện Thi THPTQG 2027')">
                    📝 Làm Bài Tập Củng Cố 20 Câu THPTQG Ngay
                </button>
            </div>
        `;
    },
    
    renderUniversity: function() {
        const main = document.getElementById('main-app-content');
        if (!main || !UNIVERSITY_DATA) return;
        
        main.innerHTML = `
            <div style="margin-bottom:2rem;">
                <button class="btn-icon" onclick="AppController.renderHome()">← Trở Về Trang Chủ</button>
            </div>
            <h1 class="section-title">🏛️ Chương Trình Đại Học (Khối Ngành Kỹ Thuật)</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">Chuyên đề tập trung kỹ thuật: Đại số tuyến tính, Toán rời rạc, Lập trình cơ bản C++, Pháp luật đại cương & Kỹ thuật Web Fullstack.</p>
            
            <div class="card-grid">
                ${UNIVERSITY_DATA.map(subj => `
                    <div class="course-card">
                        <div>
                            <span class="card-tag">${subj.category}</span>
                            <h3 class="card-title">${subj.title}</h3>
                            <div class="subject-formula-tags">
                                ${subj.id === 'linear-algebra' ? '<span class="formula-tag">det(A) ≠ 0</span><span class="formula-tag">rank(A) = n</span><span class="formula-tag">A⁻¹ = adj(A)/det(A)</span>' :
                                  subj.id === 'discrete-math' ? '<span class="formula-tag">Graph G=(V,E)</span><span class="formula-tag">Dijkstra</span><span class="formula-tag">Logic P ⇒ Q</span>' :
                                  subj.id === 'cpp-programming' ? '<span class="formula-tag">Pointer *p</span><span class="formula-tag">OOP Class</span><span class="formula-tag">STL Vector</span>' :
                                  subj.id === 'web-engineering' ? '<span class="formula-tag">HTML5 / CSS3</span><span class="formula-tag">DOM & Fetch API</span><span class="formula-tag">Fullstack</span>' :
                                  '<span class="formula-tag">Hiến Pháp</span><span class="formula-tag">Luật Dân Sự</span><span class="formula-tag">Quyền & Nghĩa Vụ</span>'}
                            </div>
                            <p class="card-info">📹 5 Video Chuyên Sâu | 🔗 5 Tài Liệu Tham Khảo | 🎯 20 Câu Quiz</p>
                        </div>
                        <button class="btn-gradient" style="width:100%; margin-top:1rem;" onclick="AppController.renderSubjectDetail('university', 0, '${subj.id}')">
                            Xem Chi Tiết & Làm Quiz →
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderSubjectDetail: function(type, grade, id) {
        const main = document.getElementById('main-app-content');
        let subject = null;
        
        if (type === 'highschool') {
            subject = HIGHSCHOOL_DATA[`grade_${grade}`].find(s => s.id === id);
        } else {
            subject = UNIVERSITY_DATA.find(s => s.id === id);
        }
        
        if (!main || !subject) return;

        // Store active subject quiz & title for button click
        this.activeSubjectQuiz = subject.quiz;
        this.activeSubjectTitle = subject.title;
        
        main.innerHTML = `
            <div style="margin-bottom:2rem;">
                <button class="btn-icon" onclick="${type === 'highschool' ? `AppController.renderHighSchoolGrade(${grade})` : `AppController.renderUniversity()`}">← Trở Về Danh Sách Môn</button>
            </div>
            
            <h1 class="section-title">📖 ${subject.title}</h1>
            
            <!-- VIDEO LESSONS GRID -->
            <h3 style="margin-top:1.5rem; margin-bottom:1rem;">📹 5 Video Bài Giảng Trọng Tâm</h3>
            <div class="card-grid">
                ${subject.videos.map(v => `
                    <div class="course-card">
                        <h4 style="font-size:1.02rem; margin-bottom:0.4rem;">${v.title}</h4>
                        <p class="card-info" style="font-size:0.85rem; margin-bottom:0.6rem;">${v.description || 'Bài giảng video trực quan từ giảng viên xuất sắc.'}</p>
                        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000;">
                            <iframe src="${formatYouTubeEmbedUrl(v.embedUrl)}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:12px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- DOCUMENTS LIST -->
            <h3 style="margin-top:2rem; margin-bottom:1rem;">🔗 Tài Liệu Tham Khảo Thực Tế</h3>
            <div style="background:var(--bg-card); border-radius:16px; padding:1.2rem; border:1px solid var(--border-color); margin-bottom:2rem;">
                ${subject.documents.map(d => `
                    <div style="padding:0.8rem 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                        <span style="font-weight:600; font-size:0.92rem;">📄 ${d.title}</span>
                        <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="btn-icon" style="font-size:0.82rem;">Mở Tài Liệu Tham Khảo 🔗</a>
                    </div>
                `).join('')}
            </div>
            
            <!-- QUIZ BUTTON -->
            <div style="background:linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.1)); border-radius:20px; padding:2rem; text-align:center; border:1px solid var(--primary-purple);">
                <h3>🎯 Đánh Giá Năng Lực - Bài Tập Củng Cố 20 Câu</h3>
                <p style="color:var(--text-muted); margin:0.75rem 0 1.5rem 0;">Làm trắc nghiệm 20 câu hỏi có tính điểm, đếm giờ 30:00 và hiển thị giải thích đáp án ngay lập tức.</p>
                <button class="btn-gradient" style="padding:0.9rem 2.5rem; font-size:1.1rem;" onclick="QuizEngine.startQuiz(AppController.activeSubjectQuiz, AppController.activeSubjectTitle)">
                    🚀 Bắt Đầu Làm Bài Tập 20 Câu Quiz
                </button>
            </div>
        `;
    },
    
    renderNewsPage: function() {
        const main = document.getElementById('main-app-content');
        if (!main || typeof NEWS_DATA === 'undefined') return;

        main.innerHTML = `
            <div style="margin-bottom:1.5rem;">
                <button class="btn-icon" onclick="AppController.renderHome()">← Trở Về Trang Chủ</button>
            </div>
            <h1 class="section-title">📰 Tin Tức & Thông Tin Giáo Dục</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">Cập nhật mới nhất về kỳ thi, kinh nghiệm học tập và định hướng nghề nghiệp.</p>

            <div class="card-grid">
                ${NEWS_DATA.map(n => `
                    <div class="course-card">
                        <div>
                            <span class="card-tag">${n.category}</span>
                            <h3 class="card-title">${n.title}</h3>
                            <p class="card-info">${n.summary}</p>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
                            <small style="color:var(--text-muted);">${n.date}</small>
                            <a href="${n.url}" target="_blank" rel="noopener noreferrer" class="btn-icon" style="font-size:0.8rem;">Đọc Bài Viết 🔗</a>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h2 class="section-title" style="margin-top:2.5rem;">🔥 Tin Nổi Bật</h2>
            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:2rem;">
                ${(typeof TICKER_HEADLINES !== 'undefined' ? TICKER_HEADLINES : []).map(t => `
                    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:0.9rem 1.2rem;">${t}</div>
                `).join('')}
            </div>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AppController.init();
});
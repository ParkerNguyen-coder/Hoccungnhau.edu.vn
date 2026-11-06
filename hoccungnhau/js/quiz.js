/* ==========================================================================
   HỌC CÙNG NHAU - QUIZ ENGINE & HISTORY TRACKING
   ========================================================================== */

const QuizEngine = {
    currentQuizData: null,
    userAnswers: {},
    timerInterval: null,
    timeRemaining: 1800, // 30 minutes default (900 seconds)
    isSubmitted: false,  // chặn nộp bài nhiều lần (tránh cộng EXP trùng)
    
    startQuiz: function(quizData, title) {
        this.currentQuizData = quizData;
        this.userAnswers = {};
        this.isSubmitted = false;
        
        const modal = document.getElementById('quiz-modal');
        const container = document.getElementById('quiz-questions-container');
        const titleEl = document.getElementById('quiz-title');
        const subtitleEl = document.getElementById('quiz-subtitle');
        const progressBar = document.getElementById('quiz-progress-bar');
        
        if (!modal || !container) return;
        
        
        titleEl.textContent = `🎯 Bài Tập Củng Cố 20 Câu - ${title}`;
        
        const bottomPrintBtn = document.getElementById('quiz-print-btn');
        if (bottomPrintBtn) {
            bottomPrintBtn.onclick = () => PDFPrintService.printQuiz(quizData, title);
        }

        // Add Focus Mode button if not present
        if (!document.getElementById('btn-zen-quiz')) {
            const zenBtn = document.createElement('button');
            zenBtn.id = 'btn-zen-quiz';
            zenBtn.className = 'btn-icon';
            zenBtn.style.fontSize = '0.85rem';
            zenBtn.style.marginTop = '0.5rem';
            zenBtn.innerHTML = '🧘 Focus Mode';
            zenBtn.onclick = () => document.body.classList.toggle('zen-mode');
            titleEl.parentNode.appendChild(zenBtn);
        }
    
        if (subtitleEl) subtitleEl.textContent = `Bộ 20 câu trắc nghiệm đánh giá năng lực - 4 đáp án (1 đúng, 3 sai).`;
        if (progressBar) progressBar.style.width = '0%';
        
        container.innerHTML = '';
        
        quizData.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <div class="question-text">${index + 1}. ${q.question}</div>
                <div class="options-grid">
                    ${q.options.map((opt, optIndex) => `
                        <button class="option-btn" data-qindex="${index}" data-optindex="${optIndex}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div class="explanation-box" id="explanation-${index}" style="display:none; margin-top:0.75rem; padding:0.75rem; background:rgba(138,43,226,0.15); border-radius:8px; font-size:0.9rem;">
                    💡 <b>Giải thích đáp án:</b> ${q.explanation}
                </div>
            `;
            container.appendChild(item);
        });
        
        // Bind option clicks & update progress bar
        const optionBtns = container.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const qIdx = parseInt(e.target.dataset.qindex);
                const optIdx = parseInt(e.target.dataset.optindex);
                
                this.userAnswers[qIdx] = optIdx;
                
                // Highlight selected button
                const siblingBtns = container.querySelectorAll(`.option-btn[data-qindex="${qIdx}"]`);
                siblingBtns.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                
                // Update progress bar
                const answeredCount = Object.keys(this.userAnswers).length;
                const progressPct = Math.round((answeredCount / quizData.length) * 100);
                if (progressBar) progressBar.style.width = `${progressPct}%`;
            });
        });
        
        // Start Countdown Timer
        this.startTimer();
        modal.classList.add('active');
    },
    
    startTimer: function() {
        clearInterval(this.timerInterval);
        this.timeRemaining = 1800; // 30 mins
        const timerText = document.getElementById('quiz-timer-text');
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = this.timeRemaining % 60;
            if (timerText) {
                timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                alert('⏰ Hết giờ làm bài! Hệ thống tự động nộp bài.');
                this.submitQuiz();
            }
        }, 1000);
    },
    
    stopTimer: function() {
        clearInterval(this.timerInterval);
    },
    
    submitQuiz: function() {
        if (!this.currentQuizData || this.isSubmitted) return;
        this.isSubmitted = true;
        this.stopTimer();
        
        let score = 0;
        const total = this.currentQuizData.length;
        
        this.currentQuizData.forEach((q, index) => {
            const userChoice = this.userAnswers[index];
            const siblingBtns = document.querySelectorAll(`.option-btn[data-qindex="${index}"]`);
            const expBox = document.getElementById(`explanation-${index}`);
            
            if (expBox) expBox.style.display = 'block';
            
            siblingBtns.forEach((btn, optIndex) => {
                btn.disabled = true;
                if (optIndex === q.correctIndex) {
                    btn.classList.add('correct');
                }
                if (userChoice === optIndex && userChoice !== q.correctIndex) {
                    btn.classList.add('incorrect');
                }
            });
            
            if (userChoice === q.correctIndex) {
                score++;
            }
        });
        
        const percentage = Math.round((score / total) * 100);
        let rating = "Cần cố gắng hơn! Hãy xem lại giải thích phía dưới.";
        if (percentage >= 80) rating = "Xuất sắc! Bạn đã nắm vững kiến thức.";
        else if (percentage >= 50) rating = "Khá tốt! Hãy ôn lại các câu trả lời sai.";
        
        // Save result to History
        // Inject Smart Adaptive Learning Recommendation Box
        const container = document.getElementById('quiz-questions-container');
        if (container && !document.getElementById('quiz-smart-rec')) {
            const recBox = document.createElement('div');
            recBox.id = 'quiz-smart-rec';
            recBox.className = 'smart-recommendation-box';
            recBox.innerHTML = `
                <div>
                    <strong style="font-size:1.05rem; color:var(--primary-purple);">💡 Gợi Ý Lộ Trình Học Tập Thông Minh:</strong>
                    <p style="margin:0.3rem 0 0 0; font-size:0.9rem; color:var(--text-main);">
                        ${percentage >= 80 ? 
                            `Chúc mừng! Bạn đạt <strong>${score}/${total} câu (${percentage}%)</strong>. Bạn đã nắm rất vững kiến thức! Hãy thử sức với Ngân Hàng Đề Thi THPTQG & Khối Kỹ Thuật.` :
                            `Bạn đạt <strong>${score}/${total} câu (${percentage}%)</strong>. Hệ thống khuyên bạn nên mở ngay Thẻ Ghi Nhớ (Flashcards) hoặc xem lại các Video bài giảng tương ứng để khắc phục câu trả lời chưa đúng!`}
                    </p>
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
                    <button class="btn-gradient" style="font-size:0.8rem; padding:0.45rem 1rem;" onclick="document.getElementById('quiz-modal').classList.remove('active'); if(typeof FeatureShowcase!=='undefined') FeatureShowcase.renderMistakeBook('all');">📕 Xem Sổ Tay Phục Thù Câu Sai</button>
                    <button class="btn-icon" style="font-size:0.8rem; padding:0.45rem 1rem;" onclick="document.getElementById('quiz-modal').classList.remove('active'); FlashcardEngine.openModal();">🎴 Mở Flashcards Ôn Lại</button>
                </div>
            `;
            container.insertBefore(recBox, container.firstChild);
        }

        QuizHistoryService.saveResult({
            title: document.getElementById('quiz-title').textContent.replace('🎯 Bài Tập Củng Cố 20 Câu - ', ''),
            score: score,
            total: total,
            percentage: percentage,
            date: new Date().toLocaleString('vi-VN')
        });
        
        // Cộng kinh nghiệm: mỗi câu đúng = 10 EXP (hiển thị ở Trang Chủ)
        let gainedExp = 0;
        if (typeof GamificationSystem !== 'undefined') {
            const quizTitle = document.getElementById('quiz-title').textContent.replace('🎯 Bài Tập Củng Cố 20 Câu - ', '');
            gainedExp = GamificationSystem.recordQuizResult(score, total, quizTitle);
        }
        
        alert(`🏆 BÁO CÁO KẾT QUẢ BÀI THI\n\n- Số câu đúng: ${score}/${total} câu (${percentage}%)\n- Kinh nghiệm nhận được: +${gainedExp} EXP\n- Đánh giá: ${rating}\n\nXem giải thích chi tiết bên dưới mỗi câu hỏi!`);
    }
};

/* ==========================================================================
   QUIZ HISTORY & LEADERBOARD SERVICE
   ========================================================================== */
const QuizHistoryService = {
    getHistory: function() {
        const stored = localStorage.getItem('hoccungnhau_quiz_history');
        return stored ? JSON.parse(stored) : [];
    },
    
    saveResult: function(resultObj) {
        const history = this.getHistory();
        history.unshift(resultObj); // Add newest first
        localStorage.setItem('hoccungnhau_quiz_history', JSON.stringify(history));
        this.renderHistoryModal();
    },
    
    renderHistoryModal: function() {
        const history = this.getHistory();
        const totalTestsEl = document.getElementById('stat-total-tests');
        const avgScoreEl = document.getElementById('stat-avg-score');
        const tableBody = document.getElementById('quiz-history-table-body');
        
        if (totalTestsEl) totalTestsEl.textContent = history.length;
        
        if (history.length > 0) {
            const sumPct = history.reduce((acc, curr) => acc + curr.percentage, 0);
            const avgPct = Math.round(sumPct / history.length);
            if (avgScoreEl) avgScoreEl.textContent = `${avgPct}%`;
        } else {
            if (avgScoreEl) avgScoreEl.textContent = `0%`;
        }
        
        if (tableBody) {
            if (history.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Chưa có lịch sử làm bài. Hãy chọn bài tập 20 câu để thực hành ngay!</td></tr>`;
            } else {
                tableBody.innerHTML = history.slice(0, 10).map(h => `
                    <tr style="border-bottom:1px solid var(--border-color);">
                        <td style="padding:0.8rem 1rem; font-weight:600;">${h.title}</td>
                        <td style="padding:0.8rem 1rem;">${h.score}/${h.total}</td>
                        <td style="padding:0.8rem 1rem; color:${h.percentage >= 80 ? '#2e7d32' : h.percentage >= 50 ? '#f57c00' : '#c62828'}; font-weight:700;">${h.percentage}%</td>
                        <td style="padding:0.8rem 1rem; font-size:0.8rem; color:var(--text-muted);">${h.date}</td>
                        <td style="padding:0.8rem 1rem;"><span style="background:${h.percentage >= 50 ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)'}; color:${h.percentage >= 50 ? '#2e7d32' : '#c62828'}; padding:3px 10px; border-radius:12px; font-weight:700; font-size:0.75rem;">${h.percentage >= 50 ? 'ĐẠT' : 'CHƯA ĐẠT'}</span></td>
                    </tr>
                `).join('');
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById('quiz-submit-btn');
    const closeBtn = document.getElementById('quiz-modal-close');
    const modal = document.getElementById('quiz-modal');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => QuizEngine.submitQuiz());
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            QuizEngine.stopTimer();
            modal.classList.remove('active');
        });
    }
    
    // Bind Quiz History Modal
    const historyBtn = document.getElementById('quiz-history-btn');
    const historyModal = document.getElementById('quiz-history-modal');
    const historyClose = document.getElementById('quiz-history-modal-close');
    
    if (historyBtn && historyModal) {
        historyBtn.addEventListener('click', () => {
            QuizHistoryService.renderHistoryModal();
            historyModal.classList.add('active');
        });
    }
    
    if (historyClose && historyModal) {
        historyClose.addEventListener('click', () => historyModal.classList.remove('active'));
    }
});
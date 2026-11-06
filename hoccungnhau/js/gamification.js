/* ==========================================================================
   HỌC CÙNG NHAU - GAMIFICATION & LEADERBOARD SYSTEM
   ========================================================================== */

const GamificationSystem = {
    exp: 0,
    level: 1,
    badges: [],
    lastGain: null, // { amount, correct, total, title, date } - bài làm gần nhất
    EXP_PER_CORRECT: 10,
    
    init: function() {
        this.loadData();
    },
    
    loadData: function() {
        const saved = localStorage.getItem('hoccungnhau_gamification');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.exp = parsed.exp || 0;
                this.level = Math.floor(this.exp / 100) + 1;
                this.badges = parsed.badges || ['Thành Viên Mới'];
                this.lastGain = parsed.lastGain || null;
            } catch(e){}
        } else {
            this.badges = ['Thành Viên Mới'];
        }
    },
    
    addEXP: function(amount, reason) {
        this.exp += amount;
        const newLevel = Math.floor(this.exp / 100) + 1;
        
        let msg = `🎉 +${amount} EXP: ${reason}!`;
        if (newLevel > this.level) {
            this.level = newLevel;
            msg += `\n🌟 Chúc mừng! Bạn đã thăng cấp lên LEVEL ${this.level}!`;
            this.checkBadges();
        }
        
        this.saveData();
        this.showNotification(msg);
        this.refreshHome();
    },
    
    // Cộng EXP sau khi nộp bài: mỗi câu đúng = 10 EXP
    recordQuizResult: function(correct, total, title) {
        const amount = correct * this.EXP_PER_CORRECT;
        this.lastGain = {
            amount: amount,
            correct: correct,
            total: total,
            title: title || '',
            date: new Date().toLocaleString('vi-VN')
        };
        this.addEXP(amount, `Đúng ${correct}/${total} câu (${this.EXP_PER_CORRECT} EXP/câu)`);
        return amount;
    },
    
    checkBadges: function() {
        if (this.exp >= 100 && !this.badges.includes('Học Viên Chăm Chỉ')) {
            this.badges.push('Học Viên Chăm Chỉ');
        }
        if (this.exp >= 300 && !this.badges.includes('Cao Thủ Trắc Nghiệm')) {
            this.badges.push('Cao Thủ Trắc Nghiệm');
        }
        if (this.exp >= 500 && !this.badges.includes('Chiến Thần hoccungnhau')) {
            this.badges.push('Chiến Thần hoccungnhau');
        }
        this.saveData();
    },
    
    saveData: function() {
        localStorage.setItem('hoccungnhau_gamification', JSON.stringify({
            exp: this.exp,
            level: this.level,
            badges: this.badges,
            lastGain: this.lastGain
        }));
    },
    
    showNotification: function(text) {
        const noti = document.createElement('div');
        noti.className = 'gamification-toast';
        noti.innerHTML = text.replace(/\n/g, '<br>');
        document.body.appendChild(noti);
        setTimeout(() => noti.classList.add('show'), 100);
        setTimeout(() => {
            noti.classList.remove('show');
            setTimeout(() => noti.remove(), 400);
        }, 3500);
    },
    
    // Cập nhật lại khung EXP & bảng xếp hạng nếu đang ở trang chủ
    refreshHome: function() {
        const panel = document.getElementById('home-exp-panel');
        if (panel) panel.outerHTML = this.getExpPanelHTML();
        const board = document.getElementById('home-leaderboard');
        if (board) board.outerHTML = this.getLeaderboardHTML();
    },
    
    getExpPanelHTML: function() {
        const expInLevel = this.exp % 100;
        const g = this.lastGain;
        return `
            <section id="home-exp-panel" class="leaderboard-card" style="margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
                    <h3 style="font-size:1.2rem; margin:0;">⭐ Kinh Nghiệm Của Bạn</h3>
                    <div style="display:flex; gap:1.25rem; align-items:baseline;">
                        <span class="badge-exp">Level ${this.level}</span>
                        <span style="font-size:1.5rem; font-weight:800; color:var(--accent-pink);">${this.exp} EXP</span>
                    </div>
                </div>
                <div style="margin-top:0.9rem; height:10px; border-radius:999px; background:rgba(128,128,128,0.25); overflow:hidden;">
                    <div style="width:${expInLevel}%; height:100%; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-pink)); transition:width 0.6s;"></div>
                </div>
                <div style="margin-top:0.4rem; font-size:0.8rem; color:var(--text-muted);">
                    Còn ${100 - expInLevel} EXP nữa để lên Level ${this.level + 1} • Mỗi câu đúng = ${this.EXP_PER_CORRECT} EXP
                </div>
                ${g ? `
                    <div style="margin-top:0.9rem; padding:0.7rem 1rem; border-radius:10px; background:rgba(138,43,226,0.15); font-size:0.9rem;">
                        🎯 Bài làm gần nhất: <b>${g.title}</b> — đúng <b>${g.correct}/${g.total}</b> câu
                        ➔ <b style="color:var(--accent-pink);">+${g.amount} EXP</b>
                        <span style="color:var(--text-muted); font-size:0.8rem;"> (${g.date})</span>
                    </div>` : `
                    <div style="margin-top:0.9rem; font-size:0.9rem; color:var(--text-muted);">
                        Hãy làm một bài Quiz để nhận EXP đầu tiên nhé!
                    </div>`}
            </section>
        `;
    },
    
    getLeaderboardHTML: function() {
        const topUsers = [
            { name: "Lê Nguyễn Quỳnh Như (Lớp 12)", exp: 850, level: 9, badge: "🥇 Chiến Thần THPTQG" },
            { name: "Trần Thị Bình (Đại Học Bách Khoa)", exp: 720, level: 8, badge: "🥈 Thần Đồng C++" },
            { name: "Lê Hoàng Cường (Lớp 11)", exp: 610, level: 7, badge: "🥉 Cao Thủ Toán" },
            { name: "Phạm Minh Đức (Lớp 10)", exp: 490, level: 5, badge: "🎗️ Học Viên Ưu Tú" },
            { name: `Bạn (${AuthService.currentUser ? AuthService.currentUser.name : 'Chưa Đăng Nhập'})`, exp: this.exp, level: this.level, badge: this.badges[this.badges.length - 1] || 'Tân Binh' }
        ];
        
        return `
            <div class="leaderboard-card" id="home-leaderboard">
                <h3 style="margin-bottom:1rem; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                    🏆 Bảng Xếp Hạng TOP Học Viên Xuất Sắc Tuần
                </h3>
                <div class="leaderboard-list">
                    ${topUsers.map((u, i) => `
                        <div class="leaderboard-item ${i === 4 ? 'current-user' : ''}">
                            <div class="rank-num">${i + 1}</div>
                            <div style="flex:1;">
                                <div style="font-weight:700; font-size:0.95rem;">${u.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${u.badge}</div>
                            </div>
                            <div style="text-align:right;">
                                <span class="badge-exp">Level ${u.level}</span>
                                <div style="font-size:0.8rem; font-weight:700; color:var(--accent-pink);">${u.exp} EXP</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

document.addEventListener("DOMContentLoaded", () => GamificationSystem.init());
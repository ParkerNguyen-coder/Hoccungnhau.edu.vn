/* ==========================================================================
   HỌC CÙNG NHAU - 3D MEMORY FLASHCARDS ENGINE
   ========================================================================== */

const FlashcardEngine = {
    cards: [
        { front: "Ma trận A vuông cấp n khả nghịch khi nào?", back: "Khi định thức det(A) ≠ 0 (hoặc rank(A) = n).", cat: "Đại Số Tuyến Tính" },
        { front: "Cú pháp khai báo con trỏ C++?", back: "int *p = &variable; (p lưu địa chỉ ô nhớ).", cat: "Lập Trình Cơ Bản C++" },
        { front: "Đạo hàm của sin(x) và cos(x) là gì?", back: "(sin x)' = cos(x) và (cos x)' = -sin(x).", cat: "Toán 11 - 12" },
        { front: "Thì Hiện Tại Hoàn Thành (Present Perfect) dùng khi nào?", back: "Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại hoặc vừa mới hoàn thành.", cat: "Tiếng Anh THPT" },
        { front: "Công thức Định luật II Newton?", back: "F = m · a (Lực bằng khối lượng nhân gia tốc).", cat: "Vật Lý 10" },
        { front: "Công thức tính pH của dung dịch?", back: "pH = -log[H+]. Dung dịch trung tính có pH = 7.", cat: "Hóa Học 11" },
        { front: "Bộ 3 mã sao (Codon) mở đầu trên mARN là gì?", back: "5'AUG3' (Mã hóa cho axit amin Mêtiônin ở sinh vật nhân thực).", cat: "Sinh Học 12" },
        { front: "Điều kiện để hệ phương trình AX = B có nghiệm duy nhất?", back: "rank(A) = rank(A|B) = n (số ẩn).", cat: "Đại Số Tuyến Tính" },
        { front: "Quy tắc Sarrus dùng để tính gì?", back: "Tính định thức det(A) cho ma trận cấp 3x3.", cat: "Đại Số Tuyến Tính" },
        { front: "Thế nào là đồ thị Euler?", back: "Đồ thị vô hướng liên thông mà mọi đỉnh đều có bậc chẵn.", cat: "Toán Rời Rạc" },
        { front: "Thẻ HTML5 Semantic nào dùng làm thanh điều hướng?", back: "<nav>...</nav>", cat: "Lập Trình Web" },
        { front: "Trong CSS Flexbox, thuộc tính nào căn chỉnh phần tử theo chiều ngang?", back: "justify-content: center | space-between | flex-start...", cat: "Lập Trình Web" },
        { front: "Số oxi hóa của Lưu huỳnh (S) trong H₂SO₄ là bao nhiêu?", back: "+6 (H: +1, O: -2 ➔ 2(+1) + S + 4(-2) = 0 ➔ S = +6).", cat: "Hóa Học 10" },
        { front: "Công thức tính thể tích khối cầu bán kính R?", back: "V = (4/3) · π · R³.", cat: "Toán 12" },
        { front: "Chu kỳ dao động T của con lắc đơn?", back: "T = 2π · √(l / g).", cat: "Vật Lý 12" }
    ],
    currentIndex: 0,
    
    init: function() {
        this.bindEvents();
    },
    
    bindEvents: function() {
        const btn = document.getElementById('flashcards-btn');
        const modal = document.getElementById('flashcards-modal');
        const closeBtn = document.getElementById('flashcards-modal-close');
        const prevBtn = document.getElementById('fc-prev-btn');
        const nextBtn = document.getElementById('fc-next-btn');
        
        if (btn && modal) {
            btn.addEventListener('click', () => this.openModal());
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevCard());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextCard());
        }
    },
    
    openModal: function() {
        this.currentIndex = 0;
        const modal = document.getElementById('flashcards-modal');
        if (!modal) return;
        this.renderCard();
        modal.classList.add('active');
    },
    
    renderCard: function() {
        const container = document.getElementById('flashcard-container');
        const counter = document.getElementById('fc-counter');
        if (!container) return;
        
        const card = this.cards[this.currentIndex];
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.cards.length} • [${card.cat}]`;
        }
        
        container.innerHTML = `
            <div class="flashcard-inner" id="fc-card-element" onclick="this.classList.toggle('flipped')">
                <div class="flashcard-front">
                    <span class="card-hint">💡 Click thẻ để lật đáp án [${card.cat}]</span>
                    <div class="card-question">${card.front}</div>
                </div>
                <div class="flashcard-back">
                    <span class="card-hint">✨ Ghi nhớ ngay:</span>
                    <div class="card-answer">${card.back}</div>
                </div>
            </div>
        `;
    },
    
    nextCard: function() {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.renderCard();
    },
    
    prevCard: function() {
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.renderCard();
    }
};

document.addEventListener("DOMContentLoaded", () => FlashcardEngine.init());

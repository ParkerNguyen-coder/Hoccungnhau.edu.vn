/* ==========================================================================
   HỌC CÙNG NHAU - LESSON PROGRESS TRACKER
   ========================================================================== */

const ProgressTracker = {
    completedItems: {},
    
    init: function() {
        const saved = localStorage.getItem('hoccungnhau_progress');
        if (saved) {
            try { this.completedItems = JSON.parse(saved); } catch(e){}
        }
    },
    
    toggleComplete: function(itemId) {
        this.completedItems[itemId] = !this.completedItems[itemId];
        localStorage.setItem('hoccungnhau_progress', JSON.stringify(this.completedItems));
        
        if (this.completedItems[itemId]) {
            if (typeof GamificationSystem !== 'undefined') {
                GamificationSystem.addEXP(20, 'Đã hoàn thành 1 bài học');
            }
        }
        return this.completedItems[itemId];
    },
    
    isCompleted: function(itemId) {
        return !!this.completedItems[itemId];
    }
};

document.addEventListener("DOMContentLoaded", () => ProgressTracker.init());

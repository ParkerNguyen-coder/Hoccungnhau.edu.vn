/* ==========================================================================
   HỌC CÙNG NHAU - HEADER NOTES SERVICE
   ========================================================================== */

const NotesService = {
    STORAGE_KEY: 'hoccungnhau_user_notes',
    
    init: function() {
        const notesBtn = document.getElementById('notes-btn');
        const modal = document.getElementById('notes-modal');
        const closeBtn = document.getElementById('notes-modal-close');
        const textarea = document.getElementById('notes-textarea');
        const saveStatus = document.getElementById('notes-save-status');
        
        if (!notesBtn || !modal || !textarea) return;
        
        // Load saved notes from LocalStorage
        const savedNotes = localStorage.getItem(this.STORAGE_KEY) || '';
        textarea.value = savedNotes;
        
        notesBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
        
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Auto save on typing
        textarea.addEventListener('input', () => {
            localStorage.setItem(this.STORAGE_KEY, textarea.value);
            if (saveStatus) {
                saveStatus.textContent = 'Đã tự động lưu...';
                setTimeout(() => {
                    saveStatus.textContent = '';
                }, 2000);
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    NotesService.init();
});

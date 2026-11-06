/* ==========================================================================
   HỌC CÙNG NHAU - STRICT FIREBASE AUTHENTICATION & FIRESTORE STORAGE
   ========================================================================== */

const AuthService = {
    currentUser: null,
    
    init: function() {
        this.bindEvents();
        
        // Tự động lắng nghe trạng thái đăng nhập từ Firebase Auth
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    // Đọc thêm hồ sơ người dùng từ Firestore nếu có
                    this.fetchUserProfileFromFirestore(user);
                } else {
                    this.currentUser = null;
                    localStorage.removeItem('hoccungnhau_user');
                    this.updateUI();
                }
            });
        } else {
            const savedUser = localStorage.getItem('hoccungnhau_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
            this.updateUI();
        }
    },

    fetchUserProfileFromFirestore: function(user) {
        let userProfile = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0] || 'Học Viên',
            email: user.email,
            role: 'Học Viên',
            isFirebase: true
        };

        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    userProfile.name = data.name || userProfile.name;
                    userProfile.role = data.role || 'Học Viên';
                }
                this.setCurrentUser(userProfile);
            }).catch((err) => {
                console.warn("⚠️ Firestore Fetch User Warning:", err);
                this.setCurrentUser(userProfile);
            });
        } else {
            this.setCurrentUser(userProfile);
        }
    },
    
    bindEvents: function() {
        const loginBtn = document.getElementById('login-btn');
        const modal = document.getElementById('auth-modal');
        const closeBtn = document.getElementById('auth-modal-close');
        const authForm = document.getElementById('auth-form');
        const switchTabBtns = document.querySelectorAll('.auth-tab-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    if (confirm(`👋 Bạn có muốn đăng xuất tài khoản [${this.currentUser.email || this.currentUser.name}] không?`)) {
                        this.logout();
                    }
                } else {
                    this.openModal('login');
                }
            });
        }
        
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (switchTabBtns) {
            switchTabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    switchTabBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const mode = e.target.dataset.mode;
                    this.switchFormMode(mode);
                });
            });
        }
        
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const mode = authForm.dataset.mode || 'login';
                const email = document.getElementById('auth-email').value.trim();
                const pass = document.getElementById('auth-pass').value.trim();
                const name = document.getElementById('auth-name') ? document.getElementById('auth-name').value.trim() : 'Học Viên';
                
                if (mode === 'register') {
                    this.register(name, email, pass);
                } else {
                    this.login(email, pass);
                }
            });
        }
    },
    
    openModal: function(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            this.switchFormMode(mode);
        }
    },
    
    closeModal: function() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('active');
    },
    
    switchFormMode: function(mode) {
        const form = document.getElementById('auth-form');
        const title = document.getElementById('auth-modal-title');
        const nameGroup = document.getElementById('auth-name-group');
        const submitBtn = document.getElementById('auth-submit-btn');
        
        if (!form) return;
        form.dataset.mode = mode;
        
        if (mode === 'register') {
            title.textContent = 'Đăng Ký Tài Khoản';
            if (nameGroup) nameGroup.style.display = 'block';
            submitBtn.textContent = '🚀 Đăng Ký Tài Khoản';
        } else {
            title.textContent = 'Đăng Nhập Tài Khoản';
            if (nameGroup) nameGroup.style.display = 'none';
            submitBtn.textContent = '🔑 Đăng Nhập';
        }
    },
    
    // ĐĂNG NHẬP VỚI FIREBASE AUTH
    login: function(email, pass) {
        if (!email || !pass) {
            alert('⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu!');
            return;
        }

        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signInWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    const user = userCredential.user;
                    alert(`🎉 Đăng nhập thành công! Chào mừng ${user.displayName || user.email}.`);
                    this.closeModal();
                })
                .catch((error) => {
                    alert(`❌ Đăng nhập thất bại: ${error.message}`);
                });
        } else {
            const user = {
                uid: 'demo_' + Date.now(),
                name: email.split('@')[0] || 'Học Viên Demo',
                email: email,
                role: 'Học Viên'
            };
            this.setCurrentUser(user);
            alert(`🎉 Đăng nhập thành công với tài khoản: ${email}`);
            this.closeModal();
        }
    },
    
    // ĐĂNG KÝ VỚI FIREBASE AUTH & LƯU VÀO FIRESTORE
    register: function(name, email, pass) {
        if (!email || !pass) {
            alert('⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu!');
            return;
        }
        if (pass.length < 6) {
            alert('⚠️ Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        const displayName = name || email.split('@')[0] || 'Học Viên';

        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // 1. Cập nhật profile trên Firebase Auth
                    user.updateProfile({ displayName: displayName });

                    // 2. Lưu hồ sơ tài khoản trực tiếp vào Firestore Database
                    if (firebase.firestore) {
                        const db = firebase.firestore();
                        return db.collection("users").doc(user.uid).set({
                            uid: user.uid,
                            name: displayName,
                            email: email,
                            role: "Học Viên",
                            createdAt: new Date().toISOString(),
                            projectId: "hoccungnhau-cd2c6"
                        });
                    }
                })
                .then(() => {
                    alert(`🎉 Đăng ký thành công tài khoản [${email}]! Chào mừng bạn đến với Học Cùng Nhau.`);
                    this.closeModal();
                })
                .catch((error) => {
                    alert(`❌ Đăng ký thất bại: ${error.message}`);
                });
        } else {
            const user = {
                uid: 'demo_' + Date.now(),
                name: displayName,
                email: email,
                role: 'Học Viên'
            };
            this.setCurrentUser(user);
            alert(`🎉 Đã tạo tài khoản thành công cho: ${email}`);
            this.closeModal();
        }
    },
    
    setCurrentUser: function(user) {
        this.currentUser = user;
        localStorage.setItem('hoccungnhau_user', JSON.stringify(user));
        this.updateUI();
    },
    
    logout: function() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                this.currentUser = null;
                localStorage.removeItem('hoccungnhau_user');
                this.updateUI();
                alert('👋 Bạn đã đăng xuất thành công khỏi hệ thống.');
            });
        } else {
            this.currentUser = null;
            localStorage.removeItem('hoccungnhau_user');
            this.updateUI();
            alert('👋 Bạn đã đăng xuất thành công.');
        }
    },
    
    // Chỉ true khi hồ sơ Firestore có role === 'Admin' (đăng ký mới luôn là 'Học Viên')
    isAdmin: function() {
        return !!this.currentUser && this.currentUser.role === 'Admin';
    },

    updateUI: function() {
        const adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.hidden = !this.isAdmin();
        const loginBtn = document.getElementById('login-btn');
        if (!loginBtn) return;
        
        if (this.currentUser) {
            loginBtn.textContent = `👤 ${this.currentUser.name}`;
            loginBtn.title = 'Bấm để đăng xuất';
            loginBtn.classList.remove('btn-gradient');
            loginBtn.classList.add('btn-icon');
        } else {
            loginBtn.textContent = '🔑 Đăng Nhập';
            loginBtn.title = 'Đăng nhập / Đăng ký';
            loginBtn.classList.remove('btn-icon');
            loginBtn.classList.add('btn-gradient');
        }
    },
    
    requireAuth: function(callback) {
        if (this.currentUser) {
            callback();
        } else {
            alert('🔒 Bạn cần Đăng Nhập hoặc Đăng Ký tài khoản để truy cập bài học!');
            this.openModal('login');
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AuthService.init();
});

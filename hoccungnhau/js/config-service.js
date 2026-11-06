/* ==========================================================================
   HỌC CÙNG NHAU - FIREBASE CONFIGURATION SERVICE
   ========================================================================== */

/**
 * CẤU HÌNH DỰ ÁN FIREBASE (PROJECT: hoccungnhau-cd2c6)
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB-PzpkgyDl81nV_9yPcecMwaQwCKpGgH4",
  authDomain: "hoccungnhau-cd2c6.firebaseapp.com",
  projectId: "hoccungnhau-cd2c6",
  storageBucket: "hoccungnhau-cd2c6.firebasestorage.app",
  messagingSenderId: "279903520926",
  appId: "1:279903520926:web:ad271a79f95806daa3938f",
  measurementId: "G-CYWF6X3C52"
};

// Khởi tạo Firebase App & Firestore Database Service
const FirebaseService = {
    isInitialized: false,
    db: null,
    auth: null,
    
    init: function() {
        if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey) {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                
                this.auth = firebase.auth();
                if (firebase.firestore) {
                    this.db = firebase.firestore();
                    console.log("🔥 Firestore Database Service (hoccungnhau-cd2c6) sẵn sàng!");
                }
                
                this.isInitialized = true;
                console.log("🔥 Firebase Console Service (hoccungnhau-cd2c6) đã kết nối thành công!");
            } catch (error) {
                console.warn("⚠️ Firebase Initialization Warning:", error);
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    FirebaseService.init();
});

// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE (FIREBASE) 🌟
// ============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    where,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// — GÜNCEL FIREBASE YAPILANDIRMASI —
const firebaseConfig = {
    apiKey: "AIzaSyDukYf45XqFM-trtEY2MdTY8thd8iXl20I",
    authDomain: "uniloop-app.firebaseapp.com",
    projectId: "uniloop-app",
    storageBucket: "uniloop-app.firebasestorage.app",
    messagingSenderId: "272654005890",
    appId: "1:272654005890:web:0b1dd388364e86d22f269b",
    measurementId: "G-PJ0XE1PXH5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- SİSTEM HAFIZASI (GLOBAL DEĞİŞKENLER) ---
window.userProfile = { 
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", bio: "", avatarUrl: "", age: "", isPremium: false 
};

window.joinedFaculties = [];
let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;

window.resetCurrentChatId = function() { currentChatId = null; };

const FACULTY_PASSCODES = {
    "Tıp Fakültesi": "tıpfak100", 
    "Hukuk Fakültesi": "hukuk1000", 
    "Diş Hekimliği Fakültesi": "dis1000",
    "Bilgisayar Fakültesi": "comp100",
    "Eczacılık Fakültesi": "ecza100"
};

const globalUniversities = [
    "Yakın Doğu Üniversitesi (NEU)", "Doğu Akdeniz Üniversitesi (EMU)", "Girne Amerikan Üniversitesi (GAU)", "Uluslararası Kıbrıs Üniversitesi (CIU)",
    "Orta Doğu Teknik Üniversitesi (ODTÜ)", "Boğaziçi Üniversitesi", "İstanbul Teknik Üniversitesi (İTÜ)", "Bilkent Üniversitesi", "Koç Üniversitesi"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
const modal = document.getElementById('app-modal');

function initializeUniLoop() {

// ✂️ CROPPER.JS ENJEKSİYONU (INSTAGRAM TARZI PROFİL KIRPMA İÇİN)
const cropperCss = document.createElement('link');
cropperCss.rel = 'stylesheet';
cropperCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
document.head.appendChild(cropperCss);

const cropperJs = document.createElement('script');
cropperJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
document.head.appendChild(cropperJs);

// 🎨 DINAMIK CSS ENJEKSIYONU VE STIL AYARLARI
const styleFix = document.createElement('style');
styleFix.innerHTML = `
    html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; }
    #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; }
    #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; }
    #auth-screen { position: relative; z-index: 1000 !important; }
    #auth-screen button, #auth-screen a, #auth-screen input, #auth-screen select { pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 1001 !important; }
    button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { cursor: pointer !important; position: relative; pointer-events: auto !important; z-index: 10; }
    
    /* ESKİ SIDEBAR VE MOBİL MENÜ GİZLENDİ */
    #sidebar { display: none !important; }
    #mobile-menu-btn { display: none !important; }
    #main-content { padding-bottom: 75px !important; }

    /* YENİ ESTETİK, İNCE VE PROFESYONEL ALT BAR (BOTTOM NAV) */
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #ffffff;
        border-top: 1px solid #f1f1f1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding-bottom: env(safe-area-inset-bottom);
        height: 60px;
        z-index: 9999;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
    }
    .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8E8E93; 
        font-size: 10px; 
        text-decoration: none;
        cursor: pointer;
        transition: 0.2s;
        flex: 1;
        background: transparent !important;
        border: none !important;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
        height: 100%;
        padding: 0;
    }
    .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
    .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
    .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
    .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
    .bottom-nav-item.active .bottom-nav-icon svg { stroke-width: 2.2; }

    #chat-layout-container { height: calc(100vh - 120px) !important; max-height: 800px; overflow: hidden !important; display: flex; flex-direction: row; }
    .chat-sidebar { overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; }
    .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; }
    #chat-messages-scroll { flex: 1 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth; }
    #listings-grid-container { max-height: calc(100vh - 200px) !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; }
    .answers-container { max-height: 250px !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; scroll-behavior: smooth; }
    .feed-layout-container { height: calc(100vh - 80px); display: flex; flex-direction: column; overflow: hidden; margin: -20px; background: #F3F4F6; }
    #conf-feed { flex: 1; overflow-y: auto; padding: 15px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; max-width: 600px !important; margin: 0 auto !important; width: 100%;}
    .feed-post { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
    .feed-post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .feed-post-avatar { font-size: 24px; width: 44px; height: 44px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; border: 1px solid #E5E7EB; overflow: hidden;}
    .feed-post-meta { display: flex; flex-direction: column; }
    .feed-post-author { font-weight: 800; font-size: 15px; color: #111827; }
    .feed-post-time { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .feed-post-text { font-size: 15px; margin-bottom: 12px; line-height: 1.5; color: #374151; word-break: break-word; }
    .feed-post-img { width: 100%; border-radius: 12px; margin-bottom: 12px; max-height: 450px; object-fit: cover; cursor: pointer; border: 1px solid #E5E7EB; }
    .feed-post-actions { display: flex; border-top: 1px solid #E5E7EB; padding-top: 12px; gap: 20px; }
    .feed-action-btn { background: none; border: none; color: #6B7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 5px; outline: none; transition: 0.2s; border-radius: 8px; z-index: 10; }
    .feed-action-btn:hover { color: var(--primary); background: #EEF2FF; }
    .user-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; width: 100%; }
    .user-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 15px 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; justify-content: center; min-height: 140px;}
    .user-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); border-color: var(--primary); }
    .cropper-view-box, .cropper-face { border-radius: 50%; }
    .cropper-view-box { outline: 0; box-shadow: 0 0 0 1px #39f; }
    .premium-glow { animation: glowPulse 2s infinite alternate; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); } }
    .premium-upgrade-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 8px; }
    .premium-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }
    
    body.dark-mode, .dark-mode #main-content { background-color: #121212 !important; color: #e5e7eb !important; }
    .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card { background-color: #1e1e1e !important; border-color: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .card > div { border-color: #374151 !important; }
    .dark-mode .feed-post-author, .dark-mode .feed-post-text, .dark-mode h2, .dark-mode label, .dark-mode .item-title { color: #e5e7eb !important; }
    .dark-mode .feed-layout-container, .dark-mode #conf-feed { background-color: #121212 !important; }
    .dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #374151 !important; color: #e5e7eb !important; border-color: #4b5563 !important; }
    .dark-mode .feed-post-avatar, .dark-mode .avatar { background-color: #374151 !important; border-color: #4b5563 !important; }
    .dark-mode .feed-action-btn:hover { background: #374151 !important; }
    .dark-mode .chat-contact:hover { background: #374151 !important; }
    .dark-mode .chat-input-wrapper input { background: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .modal-content { background-color: #1e1e1e !important; color: #e5e7eb !important; border-color: #374151 !important;}
    .dark-mode .bottom-nav { background: #1e1e1e !important; border-top-color: #374151 !important; }
    .dark-mode .bottom-nav-item.active { color: #6366f1 !important; }
    
    #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
    #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
    #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 10px; }
    
    /* Üst Bar Bildirim Butonu Stili */
    #notif-btn-top { position: relative; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
    #notif-btn-top:hover { background: #E5E7EB; }
    
    #nav-premium-action { font-size: 13px !important; padding: 0 12px !important; height: 32px !important; line-height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: nowrap !important; flex-shrink: 0 !important; margin: 0 !important; border-radius: 8px !important; }
    
    @media (max-width: 1024px) {
        #chat-layout-container { height: calc(100vh - 160px) !important; }
        .chat-sidebar { width: 100%; display: block; }
        .chat-active .chat-sidebar { display: none !important; }
        .chat-main { display: none !important; }
        .chat-active .chat-main { display: flex !important; }
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
`;
document.head.appendChild(styleFix);

window.setLanguage = function(lang) {
    localStorage.setItem('uniloop_lang', lang);
    window.renderSettings(); 
};

window.toggleTheme = function(theme) {
    localStorage.setItem('uniloop_theme', theme);
    if(theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
};

const savedTheme = localStorage.getItem('uniloop_theme') || 'light';
window.toggleTheme(savedTheme);

const TRANSLATIONS = {
    'tr': { settingsTitle: '⚙️ Uygulama Ayarları', langLabel: 'Dil Seçimi', themeLabel: 'Tema', lightMode: 'Aydınlık Mod', darkMode: 'Karanlık Mod', logoutBtn: '🚪 Güvenli Çıkış Yap' },
    'en': { settingsTitle: '⚙️ App Settings', langLabel: 'Language', themeLabel: 'Theme', lightMode: 'Light Mode', darkMode: 'Dark Mode', logoutBtn: '🚪 Secure Logout' }
};

const bind = (id, event, callback) => { 
    const el = document.getElementById(id); 
    if (el) { el.addEventListener(event, callback); }
};

// ============================================================================
// 1. GİRİŞ, KAYIT, ONAY VE ŞİFREMİ UNUTTUM
// ============================================================================

bind('show-register-btn', 'click', (e) => {
    if(e) e.preventDefault();
    document.getElementById('login-card').style.display = 'none'; 
    document.getElementById('register-card').style.display = 'block';
});

bind('show-login-btn', 'click', (e) => {
    if(e) e.preventDefault();
    document.getElementById('register-card').style.display = 'none'; 
    document.getElementById('login-card').style.display = 'block';
});

const uniInput = document.getElementById('reg-uni');
const uniList = document.getElementById('uni-autocomplete-list');

if (uniInput && uniList) {
    uniInput.addEventListener('input', function() {
        const val = this.value;
        uniList.innerHTML = '';
        if (!val) return false;
        
        const matches = globalUniversities.filter(u => u.toLowerCase().includes(val.toLowerCase()));
        matches.forEach(match => {
            const div = document.createElement('div');
            const regex = new RegExp(`(${val})`, "gi");
            div.innerHTML = match.replace(regex, "<strong>$1</strong>");
            div.addEventListener('click', function() {
                uniInput.value = match; 
                uniList.innerHTML = ''; 
            });
            uniList.appendChild(div);
        });
    });
    
    document.addEventListener('click', (e) => { 
        if(e.target !== uniInput) { uniList.innerHTML = ''; }
    });
}

bind('register-btn', 'click', async (e) => {
    if(e) e.preventDefault(); 
    
    const name = document.getElementById('reg-name').value.trim();
    const surname = document.getElementById('reg-surname').value.trim();
    const uni = document.getElementById('reg-uni').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if(!name || !surname || !uni || !email || !password) {
        alert("Lütfen tüm alanları eksiksiz doldurun.");
        return;
    }

    const btn = document.getElementById('register-btn');
    const origText = btn.innerText || "Hesabımı Oluştur";
    btn.innerText = "Hesap Oluşturuluyor...";
    btn.disabled = true;

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        
        document.getElementById('register-card').style.display = 'none';
        document.getElementById('verify-card').style.display = 'block';
        
        btn.innerText = origText;
        btn.disabled = false;

        sendEmailVerification(user).catch(err => { console.error("Mail gönderilemedi:", err); });

        setDoc(doc(db, "users", user.uid), {
            uid: user.uid, 
            name: name, 
            surname: surname, 
            username: "", 
            university: uni, 
            email: email, 
            avatar: "👨‍🎓",
            avatarUrl: "",
            bio: "",
            age: "",
            isOnline: false, 
            faculty: "",
            isPremium: false 
        }).then(() => {
            window.ensureWelcomeMessage(user, name);
        }).catch(dbError => {
            console.error("Veritabanı Kayıt Hatası:", dbError);
        });

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert("Kayıt olurken bir hata oluştu: Bu e-posta adresi zaten kullanımda.");
        } else {
            alert("Kayıt olurken bir hata oluştu: " + error.message);
        }
        btn.innerText = origText;
        btn.disabled = false;
    }
});

bind('verify-code-btn', 'click', async (e) => {
    if(e) e.preventDefault();
    const user = auth.currentUser;
    if(!user) {
        alert("Oturum zaman aşımına uğradı. Lütfen sayfayı yenileyip tekrar giriş yapın ve doğrulayın.");
        return;
    }

    const btn = document.getElementById('verify-code-btn');
    const originalText = btn.innerText;
    btn.innerText = "Kontrol Ediliyor...";
    btn.disabled = true;

    try {
        await user.reload();
        if(user.emailVerified) {
            alert("Tebrikler! Hesabınız başarıyla aktifleştirildi. Sisteme yönlendiriliyorsunuz.");
            window.location.reload(); 
        } else {
            alert("Hesabınız henüz onaylanmamış! Lütfen e-postanıza gelen linke tıklayın.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert("Hata oluştu: " + err.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

bind('login-btn', 'click', async (e) => {
    if(e) e.preventDefault(); 
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if(!email || !password) {
        alert("Lütfen e-posta ve şifrenizi girin.");
        return;
    }

    const originalText = btn.innerText;
    btn.innerText = "Giriş Yapılıyor...";
    btn.disabled = true;

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if(!userCred.user.emailVerified) {
            alert("Hesabınız henüz onaylanmamış. Lütfen e-postanızı kontrol edin.");
            document.getElementById('login-card').style.display = 'none';
            document.getElementById('verify-card').style.display = 'block';
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }
        await window.ensureWelcomeMessage(userCred.user, userCred.user.displayName || "Öğrenci");
    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert("Giriş başarısız! E-posta veya şifreniz yanlış.");
        btn.innerText = originalText;
        btn.disabled = false;
    } 
});

bind('forgot-password-btn', 'click', async (e) => {
    if(e) e.preventDefault();
    const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
    if(!email) return;
    
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Şifre sıfırlama bağlantısı e-posta adresinize başarıyla gönderildi!");
    } catch (error) {
        alert("Hata: " + error.message);
    }
});

window.ensureWelcomeMessage = async function(user, userName) {
    if(!user) return;
    try {
        const chatId = user.uid + "_system_welcome";
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            const systemMessageText = `
                Merhaba ${userName}! Dünyanın en yenilikçi kampüs ağı UniLoop'a hoş geldin. 🎓✨<br><br>
                Burası senin alanın. Hemen "Profil" sekmesine giderek kendine estetik bir biyografi ve profil fotoğrafı ekle!
            `;
            
            await setDoc(chatRef, {
                participants: [user.uid, "system"],
                participantNames: { [user.uid]: userName, "system": "UniLoop Team" },
                participantAvatars: { [user.uid]: "👨‍🎓", "system": "🌍" },
                lastUpdated: serverTimestamp(),
                status: 'accepted',
                initiator: 'system',
                messages: [{
                    senderId: "system", 
                    text: systemMessageText, 
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    read: false
                }]
            });
        }
    } catch (error) {
        console.error("Karşılama mesajı oluşturulamadı: ", error);
    }
};

window.logout = async function() {
    try {
        if(window.userProfile.uid) {
            await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
        }
        await signOut(auth);
        
        if(authScreen && appScreen) {
            appScreen.style.display = 'none';
            authScreen.style.display = 'flex';
            document.getElementById('login-card').style.display = 'block';
            document.getElementById('register-card').style.display = 'none';
            document.getElementById('verify-card').style.display = 'none';
            const btn = document.getElementById('login-btn');
            if(btn) { btn.innerText = "Giriş Yap"; btn.disabled = false; }
            
            const bottomNav = document.getElementById('uniloop-bottom-nav');
            if(bottomNav) bottomNav.remove();
            
            const topNotifBtn = document.getElementById('notif-btn-top');
            if(topNotifBtn) topNotifBtn.remove();
        }
    } catch(error) {
        console.error("Çıkış hatası:", error);
    }
};

// ============================================================================
// 2. OTURUM DURUMU KONTROLÜ VE YENİ STİLİZASYONLU ALT BAR
// ============================================================================

onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) { 
        if(authScreen && appScreen) {
            authScreen.style.display = 'none';
            appScreen.style.display = 'block';
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            if(docSnap.exists()) {
                window.userProfile = docSnap.data();
                if(window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if(window.userProfile.bio === undefined) window.userProfile.bio = "";
                if(window.userProfile.age === undefined) window.userProfile.age = "";
                if(window.userProfile.avatarUrl === undefined) window.userProfile.avatarUrl = "";
            } else {
                window.userProfile = { 
                    uid: user.uid, name: "Öğrenci", surname: "", username: "",
                    email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓", faculty: "", bio: "", age: "", avatarUrl: "", 
                    isOnline: true, isPremium: false
                };
                await setDoc(userDocRef, window.userProfile);
            }

            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            
            // ÜST BAR BİLDİRİMLER BUTONU VE PREMIUM (SAĞ ÜST KESİNLİKLE TEMİZLENİP SADECE BUNLAR EKLENİYOR)
            const headerRightMenu = document.querySelector('.header-right-menu');
            if (headerRightMenu) {
                headerRightMenu.innerHTML = ''; // ESKİ YAZILARI (Örn: Profil yazısı varsa) TAMAMEN TEMİZLER
                
                if (!window.userProfile.isPremium) {
                    headerRightMenu.insertAdjacentHTML('beforeend', `
                        <div class="menu-item premium-glow" id="nav-premium-action" style="color:#D97706; font-weight:bold; cursor:pointer;" onclick="window.openPremiumModal()">
                            🌟 Premium
                        </div>
                    `);
                }
                
                headerRightMenu.insertAdjacentHTML('beforeend', `
                    <div id="notif-btn-top" onclick="window.loadPage('notifications')" title="Bildirimler">
                        🔔 <span id="notif-badge-top" style="display:none; position:absolute; top:-2px; right:-2px; background:#EF4444; color:white; border-radius:50%; width:16px; height:16px; font-size:10px; align-items:center; justify-content:center; font-weight:bold; border:2px solid white;">0</span>
                    </div>
                `);
            }

            // YENİ, İNCE VE SVG İKONLU BOTTOM NAVIGASYON
            if (!document.getElementById('uniloop-bottom-nav')) {
                const bottomNav = document.createElement('div');
                bottomNav.id = 'uniloop-bottom-nav';
                bottomNav.className = 'bottom-nav';
                bottomNav.innerHTML = `
                    <div class="menu-item bottom-nav-item active" data-target="home" onclick="window.loadPage('home')">
                        <div class="bottom-nav-icon">
                            <svg class="fill-active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <span>Ana Sayfa</span>
                    </div>
                    <div class="menu-item bottom-nav-item" data-target="confessions" onclick="window.loadPage('confessions')">
                        <div class="bottom-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                        </div>
                        <span>Keşfet</span>
                    </div>
                    <div class="menu-item bottom-nav-item" data-target="market" onclick="window.loadPage('market')">
                        <div class="bottom-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        </div>
                        <span>Market</span>
                    </div>
                    <div class="menu-item bottom-nav-item" data-target="messages" onclick="window.loadPage('messages')">
                        <div class="bottom-nav-icon" style="position:relative;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span id="notif-badge" style="display:none; position:absolute; top:-4px; right:-6px; background:#EF4444; color:white; border-radius:50%; width:14px; height:14px; font-size:9px; align-items:center; justify-content:center; font-weight:bold; border: 2px solid white;">0</span>
                        </div>
                        <span>Mesajlar</span>
                    </div>
                    <div class="menu-item bottom-nav-item" data-target="profile" onclick="window.loadPage('profile')">
                        <div class="bottom-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <span>Profil</span>
                    </div>
                `;
                if (appScreen) appScreen.appendChild(bottomNav);
            }
            
            initRealtimeListeners(user.uid);

            const activeTab = document.querySelector('.bottom-nav-item.active');
            if(typeof window.loadPage === 'function') {
                window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); 
            }

        } catch(error) { 
            console.error(error);
        }
    }
});

window.addEventListener("beforeunload", () => {
    if(window.userProfile && window.userProfile.uid) {
        updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
    }
});

function initRealtimeListeners(currentUid) {
    const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

    onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
        marketDB = [];
        snapshot.forEach(doc => { marketDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.bottom-nav-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
    });

    onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
        confessionsDB = [];
        snapshot.forEach(doc => { confessionsDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.bottom-nav-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'confessions') window.drawConfessionsFeed();
        if(document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
            const activePostId = document.getElementById('active-post-id').value;
            if(activePostId) window.updateConfessionDetailLive(activePostId);
        }
    });

    onSnapshot(query(collection(db, "chats"), where("participants", "array-contains", currentUid)), (snapshot) => {
        chatsDB = [];
        let pendingRequestsCount = 0;
        
        snapshot.forEach(doc => {
            try {
                const data = doc.data({ serverTimestamps: 'estimate' }); 
                if (!data.participants || !Array.isArray(data.participants)) return;
                
                const otherUid = data.participants.find(p => p !== currentUid) || "system";
                const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
                const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
                let safeTimestamp = data.lastUpdated && typeof data.lastUpdated.toMillis === 'function' ? data.lastUpdated.toMillis() : Date.now();
                
                const chatItem = { 
                    id: doc.id, otherUid: otherUid, name: otherName, avatar: otherAvatar, 
                    messages: data.messages || [], status: data.status || 'accepted', 
                    initiator: data.initiator || null, lastUpdatedTS: safeTimestamp,
                    isMarketChat: data.isMarketChat || false 
                };
                chatsDB.push(chatItem);

                if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) pendingRequestsCount++;
            } catch(err) { console.error("Hatalı mesaj belgesi es geçildi:", err); }
        });

        chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
        
        const notifBadge = document.getElementById('notif-badge'); 
        const notifBadgeTop = document.getElementById('notif-badge-top'); 
        
        if(notifBadge) {
            if(pendingRequestsCount > 0) { notifBadge.style.display = 'flex'; notifBadge.innerText = pendingRequestsCount; } 
            else { notifBadge.style.display = 'none'; }
        }
        if(notifBadgeTop) {
            if(pendingRequestsCount > 0) { notifBadgeTop.style.display = 'flex'; notifBadgeTop.innerText = pendingRequestsCount; } 
            else { notifBadgeTop.style.display = 'none'; }
        }

        const activeTab = document.querySelector('.bottom-nav-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'messages') {
            const inputField = document.getElementById('chat-input-field');
            const isFocused = inputField && inputField === document.activeElement;
            const currentText = inputField ? inputField.value : '';

            if (currentChatId) {
                window.renderMessagesSidebarOnly();
                window.updateChatMessagesOnly(currentChatId);
                const newInputField = document.getElementById('chat-input-field');
                if(newInputField) {
                    newInputField.value = currentText;
                    if(isFocused) { newInputField.focus(); newInputField.selectionStart = newInputField.selectionEnd = newInputField.value.length; }
                }
            } else { window.renderMessages(); }
        } else if (activeTab && activeTab.getAttribute('data-target') === 'notifications') {
            window.renderNotifications();
        } else if (activeTab && activeTab.getAttribute('data-target') === 'friends') {
            window.renderFriends();
        }
    });
}

// ============================================================================
// PREMIUM ABONELİK MODAL VE MANTIK
// ============================================================================
window.openPremiumModal = function() {
    window.openModal('🌟 UniLoop Premium', `
        <div style="text-align:center; padding: 10px;">
            <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
            <h3 style="color:#D97706; margin-bottom: 10px; font-size: 22px;">Kampüsün Zirvesine Çık!</h3>
            <p style="margin-bottom:20px; font-size:15px; color:var(--text-gray);">UniLoop Premium ile sınırları kaldır ve kampüsün en popüler ağına dahil ol.</p>
            
            <ul style="text-align:left; background:#FEF3C7; padding: 20px; border-radius: 12px; margin-bottom:20px; list-style:none; color:#92400E; font-weight:500; font-size: 14px;">
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🟢</span> <span><strong>Gelişmiş AI Radarı:</strong> Şu an kütüphanede veya çevrimiçi olan bölümdaşlarını anında gör.</span></li>
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🕵️</span> <span><strong>Seni Kimler Beğendi?:</strong> Profilini gezen herkesi anında açığa çıkar.</span></li>
                <li style="display:flex; gap:10px;"><span style="font-size:18px;">🚀</span> <span><strong>Öncelikli Mesaj (Super DM):</strong> Mesajların kilit ekranına düşsün ve anında fark edilsin.</span></li>
            </ul>
            
            <div style="font-size:32px; font-weight:800; margin-bottom:20px; color:var(--text-dark);">
                49.99 ₺ <span style="font-size:14px; color:var(--text-gray); font-weight:normal;">/ aylık</span>
            </div>
            
            <button id="buy-premium-btn" onclick="window.upgradeToPremium()" class="premium-upgrade-btn premium-glow" style="width:100%; justify-content:center; padding: 16px; font-size: 16px;">
                💳 Güvenli Ödeme İle Satın Al
            </button>
            <p style="font-size:11px; color:#9CA3AF; margin-top:10px;">*İstediğin zaman iptal edebilirsin.</p>
        </div>
    `);
};

window.upgradeToPremium = async function() {
    const btn = document.getElementById('buy-premium-btn');
    btn.innerText = '⏳ Ödeme İşleniyor... Lütfen bekleyin.';
    btn.disabled = true;
    
    setTimeout(async () => {
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: true });
            window.userProfile.isPremium = true;
            
            const navBtn = document.getElementById('nav-premium-action');
            if(navBtn) navBtn.style.display = 'none';

            window.closeModal();
            alert("🎉 Tebrikler! Ödemeniz başarıyla alındı. UniLoop Premium ayrıcalıklarına artık sahipsiniz!");
            window.loadPage('home'); 
        } catch(e) {
            alert("Hata oluştu: Lütfen internet bağlantınızı kontrol edin. (" + e.message + ")");
            btn.innerText = '💳 Güvenli Ödeme İle Satın Al';
            btn.disabled = false;
        }
    }, 3000);
};

// ============================================================================
// 3. AÇILIR PENCERELER VE TIKLAMA YÖNETİMİ
// ============================================================================

window.goToMessages = function() {
    document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
    const msgTab = document.querySelector('.bottom-nav-item[data-target="messages"]');
    if(msgTab) { msgTab.classList.add('active'); window.loadPage('messages'); }
};

window.openModal = function(title, contentHTML) { 
    document.getElementById('modal-title').innerText = title; 
    document.getElementById('modal-body').innerHTML = contentHTML; 
    modal.classList.add('active'); 
    document.body.style.overflow = 'hidden'; 
};

window.closeModal = function() { 
    modal.classList.remove('active'); 
    document.getElementById('modal-body').innerHTML = ''; 
    if (!document.getElementById('lightbox').classList.contains('active')) {
        document.body.style.overflow = 'auto'; 
    }
};

bind('modal-close', 'click', window.closeModal);

window.addEventListener('click', (e) => { 
    if (e.target === modal) window.closeModal(); 
});

// ============================================================================
// 4. YENİ ANA SAYFA (HOME) TASARIMI VE KULLANICI PROFİLİ GÖRÜNTÜLEME
// ============================================================================

window.searchAndAddFriend = async function() {
    try {
        const searchInput = document.getElementById('friend-search-input');
        if(!searchInput) return;
        
        let rawSearch = searchInput.value.trim().toLowerCase();
        if(!rawSearch) { alert("Lütfen bir kullanıcı adı yazın."); return; }
        if (!window.userProfile.username) { alert("Bağlantı kurmadan önce lütfen profilinizden bir kullanıcı adı belirleyin!"); return; }

        rawSearch = rawSearch.replace(/^#/, '');
        const searchVal = '#' + rawSearch;
        
        if(searchVal === window.userProfile.username) { alert("Kendinize istek gönderemezsiniz :)"); return; }

        const btn = document.getElementById('friend-search-btn');
        const origText = btn.innerText;
        btn.innerText = "Aranıyor...";
        btn.disabled = true;

        const q = query(collection(db, "users"), where("username", "==", searchVal));
        const snapshot = await getDocs(q);
        
        if(snapshot.empty) {
            alert("Bu kullanıcı adına sahip kimse bulunamadı!");
        } else {
            const targetUser = snapshot.docs[0].data();
            await window.sendFriendRequest(targetUser.uid, targetUser.name + " " + targetUser.surname);
        }
        
        btn.innerText = origText;
        btn.disabled = false;
        searchInput.value = ''; 
    } catch (error) {
        console.error(error);
        alert("Arama sırasında hata oluştu: " + error.message);
    }
};

window.sendFriendRequest = async function(targetUserId, targetUserName, customMsg = "Sizinle bağlantı kurmak istiyor.") {
    try {
        const myUid = auth.currentUser.uid;
        const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
        const snap = await getDocs(q);
        
        let existingChat = null;
        snap.forEach(doc => {
            if (doc.data().participants && doc.data().participants.includes(targetUserId)) existingChat = { id: doc.id, ...doc.data() };
        });

        if(!existingChat) {
            await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid, isMarketChat: false, 
                messages: [{ senderId: "system", text: customMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
            });
            alert("İstek başarıyla gönderildi! Karşı taraf onayladığında bildirim alacaksınız.");
        } else {
            if(existingChat.status === 'pending') {
                alert("Bu kişiye zaten bir istek gönderilmiş veya ondan sana istek gelmiş.");
            } else {
                alert("Bu kişiyle zaten bağlantınız var.");
            }
        }
    } catch (error) {
        alert("İstek gönderilirken hata oluştu: " + error.message);
    }
};

window.viewUserProfile = async function(targetUid) {
    if(targetUid === window.userProfile.uid) { window.loadPage('profile'); return; }
    
    try {
        const docSnap = await getDoc(doc(db, "users", targetUid));
        if (docSnap.exists()) {
            const u = docSnap.data();
            const initial = u.surname ? u.surname.charAt(0) + '.' : '';
            let avatarHtml = u.avatarUrl 
                ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #E5E7EB;">` 
                : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;
            
            const bioText = u.bio ? u.bio : "Henüz bir biyografi eklemedi.";
            const ageText = u.age ? u.age + " yaşında" : "Yaş belirtilmemiş";
            const facText = u.faculty ? u.faculty : "Fakülte belirtilmemiş";

            const existingChat = chatsDB.find(c => c.otherUid === u.uid);
            let actionBtnHtml = '';
            
            if (existingChat && existingChat.status === 'accepted') {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
            } else if (existingChat && existingChat.status === 'pending') {
                actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF; box-shadow:none;">⏳ İstek Bekleniyor</button>`;
            } else {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Bağlantı Kur (Ekle)</button>`;
            }

            window.openModal('Kullanıcı Profili', `
                <div style="text-align:center;">
                    ${avatarHtml}
                    <h3 style="margin: 10px 0 5px 0; font-size:18px; color:var(--text-dark);">${u.name} ${initial}</h3>
                    <p style="color:var(--primary); font-size:14px; margin-bottom: 5px; font-weight:bold;">${facText}</p>
                    <p style="color:var(--text-gray); font-size:13px; margin-bottom: 15px;">${ageText}</p>
                    
                    <div style="background:#F9FAFB; padding:15px; border-radius:12px; text-align:left; margin-bottom: 20px; border:1px solid #E5E7EB;">
                        <strong style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:1px;">Hobiler / Biyografi</strong>
                        <p style="font-size:14px; margin-top:5px; color:var(--text-dark); line-height:1.5;">${bioText}</p>
                    </div>

                    ${actionBtnHtml}
                </div>
            `);
        }
    } catch (e) {
        console.error(e);
        alert("Profil yüklenirken hata oluştu.");
    }
};

window.renderHome = async function() {
    let usernameWarning = '';
    if (!window.userProfile.username) {
        usernameWarning = `
            <div style="background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 12px; border: 1px solid #FCA5A5; margin-bottom: 6px; font-weight: bold; text-align: center; cursor:pointer;" onclick="window.loadPage('profile')">
                ⚠️ Lütfen profilinden bir kullanıcı adı belirle!
            </div>
        `;
    }

    // BOŞLUKLAR DARALTILDI (margin-bottom: 6px !important) VE PADDING'LER OPTİMİZE EDİLDİ
    let html = `
        ${usernameWarning}
        <div class="card" style="background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: white; border:none; margin-bottom: 6px !important; padding: 15px;">
            <h2 style="font-size:20px; margin-bottom:6px;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
            <p style="opacity:0.9; font-size:14px; margin:0;">
                <strong style="color:#D9FDD3;">${window.userProfile.university}</strong> ağındasın.
            </p>
        </div>
        
        <div class="card" style="padding: 10px 15px; display:flex; align-items:center; gap:10px; margin-bottom: 6px !important; border-radius: 12px;">
            <div style="font-size:16px;">🔍</div>
            <div style="display:flex; flex:1; align-items:center; background:#F3F4F6; border-radius:10px; padding:0 10px; border:1px solid transparent; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.background='white';" onblur="this.style.borderColor='transparent'; this.style.background='#F3F4F6';">
                <span style="color:var(--primary); font-weight:800; font-size:15px;">#</span>
                <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:8px 6px; outline:none; font-size:14px; font-weight:600; color:var(--text-dark);" placeholder="arkadasini_bul" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
            </div>
            <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:8px 14px; border-radius:10px; font-size:13px;" onclick="window.searchAndAddFriend()">Ekle</button>
        </div>
        
        <div class="card" style="padding: 15px; margin-bottom: 6px !important; border-radius: 12px;">
            <h2 style="margin-bottom:12px; margin-top:0; font-size:16px; display:flex; align-items:center; justify-content:space-between;">
                <span>🔥 Önerilen Kişiler</span>
                <span style="font-size:11px; background:var(--primary); color:white; padding:3px 8px; border-radius:8px;">Yeni</span>
            </h2>
            <div class="user-grid" id="home-users-grid" style="gap:8px;">
                <div style="grid-column: 1 / -1; text-align:center; padding: 15px; color:var(--text-gray); font-size:13px;">Kullanıcılar yükleniyor...</div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;

    try {
        const querySnapshot = await getDocs(query(collection(db, "users")));
        let usersHtml = '';
        let count = 0;
        
        const interactedUids = chatsDB.map(c => c.otherUid);
        
        querySnapshot.forEach((doc) => {
            const u = doc.data();
            if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid) && count < 10) {
                count++;
                const initial = u.surname ? u.surname.charAt(0) + '.' : '';
                let avatarHtml = u.avatarUrl 
                    ? `<img src="${u.avatarUrl}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid #E5E7EB;">` 
                    : `<div style="width:50px; height:50px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:25px; border:2px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;
                
                usersHtml += `
                    <div class="user-card" onclick="window.viewUserProfile('${u.uid}')" style="min-height:120px; padding:10px;">
                        <div style="margin-bottom: 8px;">${avatarHtml}</div>
                        <div style="font-weight:bold; font-size:14px; color:var(--text-dark);">${u.name} ${initial}</div>
                        <div style="font-size:11px; color:var(--text-gray); margin-top:4px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">${u.faculty || 'Kampüs Öğrencisi'}</div>
                        <button class="btn-primary" style="margin-top:10px; padding:6px; font-size:12px; border-radius:8px; width:100%; box-shadow:none;" onclick="event.stopPropagation(); window.sendFriendRequest('${u.uid}', '${u.name} ${initial}')">➕ İstek Gönder</button>
                    </div>
                `;
            }
        });
        
        document.getElementById('home-users-grid').innerHTML = usersHtml || '<p style="grid-column: 1 / -1; text-align:center; color:var(--text-gray); font-size:13px;">Henüz önerebileceğimiz yeni bir kullanıcı bulunamadı.</p>';
    } catch(e) {
        console.error("Kullanıcılar çekilemedi", e);
        document.getElementById('home-users-grid').innerHTML = '<p style="grid-column: 1 / -1; text-align:center; color:red; font-size:13px;">Kullanıcılar yüklenirken hata oluştu.</p>';
    }
};

// ============================================================================
// 5. TAM EKRAN FOTOĞRAF GALERİSİ (LIGHTBOX) MANTIĞI
// ============================================================================

window.currentLightboxImages = [];
window.currentLightboxIndex = 0;

window.openLightbox = function(imagesJsonStr, index) {
    window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr));
    window.currentLightboxIndex = index;
    window.updateLightboxView();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('active');
    if(!document.getElementById('app-modal').classList.contains('active')) document.body.style.overflow = 'auto';
};

window.changeLightboxImage = function(step) {
    window.currentLightboxIndex += step;
    if(window.currentLightboxIndex < 0) window.currentLightboxIndex = window.currentLightboxImages.length - 1;
    if(window.currentLightboxIndex >= window.currentLightboxImages.length) window.currentLightboxIndex = 0;
    window.updateLightboxView();
};

window.updateLightboxView = function() {
    const imgEl = document.getElementById('lightbox-img');
    const counterEl = document.getElementById('lightbox-counter');
    if(imgEl && counterEl) {
        imgEl.src = window.currentLightboxImages[window.currentLightboxIndex];
        counterEl.innerText = (window.currentLightboxIndex + 1) + " / " + window.currentLightboxImages.length;
    }
};

let touchstartX = 0;
let touchendX = 0;

function handleSwipe() {
    if (touchendX < touchstartX - 40) window.changeLightboxImage(1); 
    if (touchendX > touchstartX + 40) window.changeLightboxImage(-1); 
}

const lb = document.getElementById('lightbox');
if(lb) {
    lb.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; });
    lb.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleSwipe(); });
}

// ============================================================================
// 6. İLAN YÖNETİMİ (MARKET) - SATICIYA DİNAMİK MESAJ MANTIĞI
// ============================================================================

window.sendMarketMessage = async function(sellerId, sellerName, itemTitle, existingChatId) {
    try {
        const msgText = `Merhaba, "${itemTitle}" başlıklı ilanınızla ilgileniyorum. Durumu nedir?`;
        const myUid = auth.currentUser.uid;
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (existingChatId) {
            await updateDoc(doc(db, "chats", existingChatId), {
                messages: arrayUnion({ senderId: myUid, text: msgText, time: timeStr, read: false }),
                lastUpdated: serverTimestamp()
            });
            alert("İlan mesajınız mevcut sohbete eklendi!");
            window.openChatViewDirect(existingChatId);
        } else {
            const docRef = await addDoc(collection(db, "chats"), {
                participants: [myUid, sellerId],
                participantNames: { [myUid]: window.userProfile.name, [sellerId]: sellerName },
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [sellerId]: "👤" },
                lastUpdated: serverTimestamp(), 
                status: 'pending', 
                initiator: myUid,
                isMarketChat: true,
                messages: [{ senderId: myUid, text: msgText, time: timeStr, read: false }]
            });
            alert("Satıcıya mesaj isteği başarıyla gönderildi!");
            window.openChatViewDirect(docRef.id);
        }
    } catch (error) {
        alert("Hata oluştu: " + error.message);
    }
};

window.renderListings = function(type, title) {
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;">
                <h2 style="margin:0;">${title}</h2>
                <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openListingForm('${type}')">+ Yeni İlan Ekle</button>
            </div>
            <input type="text" id="local-search-input" class="local-search-bar" placeholder="${title} içinde hızlıca ara...">
            <div class="market-grid" id="listings-grid-container"></div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    window.drawListingsGrid(type, '');
    
    const searchInput = document.getElementById('local-search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => { window.drawListingsGrid(type, e.target.value.toLowerCase()); }); 
    }
};

window.drawListingsGrid = function(type, filterText) {
    const container = document.getElementById('listings-grid-container');
    if(!container) return;

    const filteredData = marketDB.filter(item => 
        item.type === type && (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText))
    );
    
    if(filteredData.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok veya bulunamadı.</p>`; 
        return;
    }

    let gridHtml = '';
    filteredData.forEach(item => {
        let imgHtml = ''; 
        const displayCurrency = item.currency || '₺';

        if (item.isPdf) {
            imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#F9FAFB;"><span style="font-size:40px;">📄</span><span style="font-size:12px; font-weight:bold; color:#EF4444; margin-top:5px;">PDF Dosyası</span></div>`;
        } else if (item.imgUrl) { 
            imgHtml = `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">`; 
        } else { 
            imgHtml = `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`; 
        }

        gridHtml += `
            <div class="item-card" onclick="window.openListingDetail('${item.id}')">
                <div class="item-img-large">${imgHtml}</div>
                <div class="item-details">
                    <div class="item-title">${item.title}</div>
                    <div class="item-price-large">${item.price} ${displayCurrency}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = gridHtml;
};

window.openListingDetail = function(docId) {
    const item = marketDB.find(i => i.id === docId);
    if(!item) return;

    let imgHtml = '';
    let indicatorsHtml = '';
    const displayCurrency = item.currency || '₺';

    if (item.isPdf) {
        imgHtml = `<div style="width:100%; height:250px; background:#F9FAFB; border:2px dashed #EF4444; border-radius:12px; margin-bottom:16px; display:flex; align-items:center; justify-content:center; flex-direction:column;"><span style="font-size:60px;">📄</span><h3 style="color:#EF4444; margin-top:10px; margin-bottom:5px;">PDF Dosyası</h3><p style="font-size:13px; color:var(--text-gray);">Bu içerik bir PDF belgesidir.</p></div>`;
    } else if (item.imgUrls && item.imgUrls.length > 0) {
        imgHtml += '<div class="image-gallery" style="height:250px; border-radius:12px; margin-bottom:16px;">';
        const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
        item.imgUrls.forEach((url, i) => {
            imgHtml += `<div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;"><img src="${url}" alt="İlan" style="border-radius:12px;"></div>`;
            indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`;
        });
        imgHtml += '</div>';
        if(item.imgUrls.length > 1) { imgHtml += `<div class="gallery-indicators" style="bottom: 25px;">${indicatorsHtml}</div>`; }
    } else if (item.imgUrl) { 
        const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
        imgHtml = `<img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">`;
    }

    let actionButtonsHtml = '';
    const currentUid = window.userProfile.uid || (auth.currentUser ? auth.currentUser.uid : null);
    const safeTitle = item.title.replace(/'/g, "\\'"); 
    const existingChat = chatsDB.find(c => c.otherUid === item.sellerId);

    if (item.sellerId === currentUid) {
         actionButtonsHtml = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
            </div>
         `;
    } else if (existingChat) {
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', '${existingChat.id}'); window.closeModal();">💬 İlan Hakkında Mesaj Gönder</button>`;
    } else {
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', null); window.closeModal();">💬 Satıcıya Mesaj Gönder</button>`;
    }

    window.openModal(item.title, `
        <div style="position:relative;">${imgHtml}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:24px; font-weight:800; color:#059669;">${item.price} ${displayCurrency}</div>
            <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div>
        </div>
        <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:16px; border-radius:12px; border:1px solid var(--border-color);">${item.desc}</div>
        ${actionButtonsHtml}
    `);
};

window.deleteListing = async function(docId) {
    if(confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) {
        try { await deleteDoc(doc(db, "listings", docId)); alert("İlan başarıyla silindi!"); } 
        catch(e) { console.error(e); alert("Silinirken bir hata oluştu: " + e.message); }
    }
};

window.editListing = async function(docId, oldTitle, oldPrice) {
    let newPrice = prompt(`"${oldTitle}" için yeni fiyatı girin (Sadece rakam):`, oldPrice);
    if(newPrice !== null && newPrice.trim() !== "") {
        try { await updateDoc(doc(db, "listings", docId), { price: newPrice.trim() }); alert("İlan fiyatı güncellendi!"); } 
        catch(e) { console.error(e); alert("Hata: " + e.message); }
    }
};

window.openListingForm = function(type) {
    const formTitle = '🛒 Kampüs Market İlanı Ekle';
    const titlePlaceholder = 'İlan Başlığı (Örn: Temiz Çalışma Masası veya Çıkmış Sorular)';
    const descPlaceholder = 'Ürünün durumu ve detayları...';

    window.openModal(formTitle, `
        <div class="form-group"><input type="text" id="new-item-title" placeholder="${titlePlaceholder}"></div>
        <div class="form-group" style="display: flex; gap: 10px;">
            <input type="number" id="new-item-price" placeholder="Fiyat / Kira Bedeli" style="flex: 2;">
            <select id="new-item-currency" style="flex: 1;">
                <option value="₺">TL (₺)</option>
                <option value="$">Dolar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Sterlin (£)</option>
            </select>
        </div>
        <div class="form-group"><textarea id="new-item-desc" rows="3" placeholder="${descPlaceholder}"></textarea></div>
        <div class="upload-btn-wrapper">
            <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf veya 📄 PDF Seç</button>
            <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;" />
        </div>
        <div id="preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
        <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Dosyalar Yükleniyor, lütfen bekleyin...</p>
    `);

    setTimeout(() => {
        const photoBtn = document.getElementById('photo-trigger-btn');
        const photoInput = document.getElementById('new-item-photo');
        if(photoBtn && photoInput) {
            photoBtn.addEventListener('click', () => { photoInput.click(); });
            photoInput.addEventListener('change', function(e) {
                const files = Array.from(e.target.files).slice(0, 3);
                const previewContainer = document.getElementById('preview-container');
                previewContainer.innerHTML = ''; 
                files.forEach(file => {
                    if (file.type === "application/pdf") {
                        previewContainer.innerHTML += `<div class="preview-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#F9FAFB; border:1px solid #E5E7EB;"><span style="font-size:30px;">📄</span><span style="font-size:12px; color:#EF4444; font-weight:bold; margin-top:5px;">PDF Dosyası</span></div>`;
                    } else {
                        const reader = new FileReader();
                        reader.onload = function(event) { previewContainer.innerHTML += `<div class="preview-box"><img src="${event.target.result}"></div>`; }
                        reader.readAsDataURL(file);
                    }
                });
            });
        }
    }, 100);
};

window.submitListing = async function(type) {
    const titleEl = document.getElementById('new-item-title');
    const priceEl = document.getElementById('new-item-price');
    const currencyEl = document.getElementById('new-item-currency');
    const descEl = document.getElementById('new-item-desc');
    const photoInput = document.getElementById('new-item-photo');
    const statusEl = document.getElementById('upload-status');
    const btn = document.getElementById('publish-listing-btn');

    if (!titleEl || !priceEl || !descEl || !currencyEl) return;

    const title = titleEl.value.trim();
    const price = priceEl.value.trim();
    const currency = currencyEl.value;
    const desc = descEl.value.trim();

    if (title === "" || price === "" || desc === "") { alert("Lütfen başlık, fiyat ve açıklama alanlarını eksiksiz doldurun."); return; }

    let files = [];
    if(photoInput && photoInput.files && photoInput.files.length > 0) { files = Array.from(photoInput.files).slice(0, 3); }
    if(files.length === 0) { alert("Lütfen en az 1 dosya veya fotoğraf seçin."); return; }

    let isPdf = false;
    if(files.length > 0 && files[0].type === "application/pdf") {
        isPdf = true;
    }

    btn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.innerText = "Dosyalar Yükleniyor, lütfen bekleyin...";
    statusEl.style.color = "var(--primary)";

    let imgUrlsArray = [];

    try {
        const uploadTimeout = new Promise((_, reject) => { setTimeout(() => reject(new Error("Yükleme süresi doldu. Firebase Storage izinlerinizi kontrol edin.")), 15000); });
        const uploadProcess = async () => {
            for (let file of files) {
                const fileName = Date.now() + '_' + file.name.replace(/\s/g, ''); 
                const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/' + fileName);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                imgUrlsArray.push(url);
            }
        };

        await Promise.race([uploadProcess(), uploadTimeout]);

        await addDoc(collection(db, "listings"), {
            type: type, title: title, price: price, currency: currency, desc: desc, 
            imgUrls: imgUrlsArray, imgUrl: imgUrlsArray.length > 0 ? imgUrlsArray[0] : "", 
            isPdf: isPdf,
            sellerId: window.userProfile.uid, sellerName: window.userProfile.name + " " + window.userProfile.surname, createdAt: serverTimestamp()
        });

        window.closeModal();
        alert("İlanınız başarıyla yayınlandı!");
    } catch (error) {
        console.error("İlan eklenirken hata:", error);
        statusEl.innerText = "HATA: " + error.message; 
        statusEl.style.color = "red";
        alert("İlan yayınlanamadı! Hata: " + error.message);
    } finally {
        if(statusEl.innerText !== "HATA: " + error.message) statusEl.style.display = 'none';
        btn.disabled = false;
    }
};

// ============================================================================
// 7. ARKADAŞLARIM, BİLDİRİMLER VE MESAJLAŞMA SİSTEMİ
// ============================================================================

window.renderFriends = function() {
    const acceptedFriends = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat);
    
    let html = `
        <div class="card" style="padding: 20px; min-height: calc(100vh - 120px);">
            <h2 style="margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px; display:flex; align-items:center; gap:10px;">
                <button onclick="window.renderProfile()" style="background:none; border:none; font-size:20px; cursor:pointer; padding-right:10px;">←</button>
                <span>👥 Takip Edilenler / Arkadaşlarım</span>
                <span style="font-size:14px; background:#EEF2FF; color:var(--primary); padding:4px 12px; border-radius:12px;">${acceptedFriends.length} Kişi</span>
            </h2>
    `;
    
    if (acceptedFriends.length === 0) {
        html += `<div style="text-align:center; padding: 40px 20px; color:var(--text-gray);">Henüz ekli bir arkadaşınız yok. Ana sayfadan yeni insanlarla tanışabilirsin!</div>`;
    } else {
        html += `<div class="user-grid">`;
        acceptedFriends.forEach(friend => {
            let avatarHtml = friend.avatar.startsWith('http') 
                ? `<img src="${friend.avatar}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #E5E7EB;">` 
                : `<div style="width:70px; height:70px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:35px; border:2px solid #E5E7EB; margin:0 auto;">${friend.avatar}</div>`;
            
            html += `
                <div class="user-card" onclick="window.viewUserProfile('${friend.otherUid}')">
                    <div style="margin-bottom: 10px;">${avatarHtml}</div>
                    <div style="font-weight:bold; font-size:15px; color:var(--text-dark);">${friend.name}</div>
                    <div style="display:flex; gap:10px; width:100%; margin-top:15px;">
                        <button class="btn-primary" style="flex:1; padding:8px; font-size:13px; border-radius:8px; box-shadow:none;" onclick="event.stopPropagation(); window.openChatViewDirect('${friend.id}')">💬 Mesaja Git</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    html += `</div>`;
    mainContent.innerHTML = html;
};

window.openChatViewDirect = function(chatId) {
    document.querySelectorAll('.bottom-nav-item').forEach(m=>m.classList.remove('active'));
    document.querySelector('.bottom-nav-item[data-target="messages"]')?.classList.add('active');
    window.loadPage('messages');
    setTimeout(() => window.openChatView(chatId), 200);
};

window.renderNotifications = function() {
    const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
    let html = `<div class="card" style="min-height: calc(100vh - 120px);">
        <h2 style="margin-bottom: 20px; padding-bottom:10px; border-bottom:1px solid var(--border-color); display:flex; align-items:center;">
            <button onclick="window.loadPage('home')" style="background:none; border:none; font-size:20px; cursor:pointer; padding-right:10px;">←</button>
            🔔 Bildirimler ve İstekler
        </h2>`;
    
    if (incomingRequests.length === 0) {
        html += `<p style="text-align:center; color:var(--text-gray); padding: 40px 0;">Henüz bekleyen bir bildiriminiz yok.</p>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:15px;">`;
        incomingRequests.forEach(req => {
            let avatarHtml = req.avatar.startsWith('http') 
                ? `<img src="${req.avatar}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">` 
                : `<div style="width:50px; height:50px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0;">${req.avatar}</div>`;
            
            const firstMsg = (req.messages && req.messages.length > 0) ? req.messages[0].text : "Sizi eklemek istiyor.";
            const requestTypeStr = req.isMarketChat ? "İlan İsteği / Mesaj" : "Arkadaşlık İsteği";

            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#F9FAFB; padding:15px 20px; border-radius:12px; border:1px solid var(--border-color); flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${avatarHtml}
                        <div>
                            <strong style="display:block; font-size:16px; color:var(--text-dark); cursor:pointer;" onclick="window.viewUserProfile('${req.otherUid}')">${req.name}</strong>
                            <span style="font-size:11px; font-weight:bold; color:var(--primary); text-transform:uppercase;">${requestTypeStr}</span><br>
                            <span style="font-size:13px; color:var(--text-gray); font-style:italic;">"${firstMsg}"</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-primary" style="padding:10px 20px; width:auto; font-size:14px;" onclick="window.acceptRequest('${req.id}')">✅ Kabul Et</button>
                        <button class="btn-danger" style="padding:10px 20px; width:auto; font-size:14px;" onclick="window.rejectRequest('${req.id}')">❌ Reddet</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    html += `</div>`;
    mainContent.innerHTML = html;
};

window.acceptRequest = async function(chatId) {
    try {
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        await updateDoc(doc(db, "chats", chatId), {
            status: 'accepted',
            messages: arrayUnion({ senderId: "system", text: "İstek kabul edildi. Artık mesajlaşabilirsiniz! 🎉", time: timeStr, read: false }),
            lastUpdated: serverTimestamp()
        });
        alert("İstek kabul edildi! Mesajlar sekmesinden kişiyi bulabilirsiniz.");
        window.renderNotifications(); 
    } catch(error) { alert("Hata oluştu: " + error.message); }
};

window.rejectRequest = async function(chatId) {
    if(confirm("Bu isteği reddetmek istediğinize emin misiniz?")) {
        try { await deleteDoc(doc(db, "chats", chatId)); alert("İstek silindi."); window.renderNotifications(); } 
        catch(error) { alert("Hata oluştu: " + error.message); }
    }
};

window.renderMessagesSidebarOnly = function() {
    const sidebar = document.querySelector('.chat-sidebar');
    if(!sidebar) return;
    
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
    let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10; padding:15px; border-bottom:1px solid var(--border-color); font-weight:bold;">Mesajlarım</div>`;
    
    if (visibleChats.length === 0) html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Aktif mesajınız bulunmuyor.</p>`;

    visibleChats.forEach(chat => {
        const lastMsgObj = chat.messages[chat.messages.length - 1];
        let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
        const isActive = chat.id === currentChatId ? 'active' : '';
        if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) rawLastMsg = "⏳ İstek gönderildi, bekleniyor...";
        const previewMsg = rawLastMsg.replace(/<br>/g, ' ').substring(0, 35) + (rawLastMsg.length > 35 ? "..." : "");

        let avatarHtml = chat.avatar.startsWith('http') 
            ? `<img src="${chat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
            : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${chat.avatar}</div>`;

        html += `
            <div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')" style="padding:15px; border-bottom:1px solid #E5E7EB; display:flex; gap:10px; cursor:pointer;">
                ${avatarHtml}
                <div class="chat-contact-info" style="flex:1;">
                    <div class="chat-contact-top" style="display:flex; justify-content:space-between; margin-bottom:4px;"><span class="chat-contact-name" style="font-weight:bold; font-size:14px;">${chat.name}</span><span class="chat-contact-time" style="font-size:11px; color:#9CA3AF;">${lastMsgObj ? lastMsgObj.time : ""}</span></div>
                    <div class="chat-contact-last" style="font-size:13px; color:#6B7280;">${previewMsg}</div>
                </div>
            </div>
        `;
    });
    sidebar.innerHTML = html;
};

window.updateChatMessagesOnly = function(chatId) {
    const activeChat = chatsDB.find(c => c.id === chatId);
    if(!activeChat) return;
    
    const scrollBox = document.getElementById('chat-messages-scroll');
    if(!scrollBox) return; 
    
    let chatHTML = '';
    activeChat.messages.forEach(msg => { 
        const type = msg.senderId === window.userProfile.uid ? 'sent' : 'received';
        let ticks = '';
        if (type === 'sent') {
            if (msg.read) ticks = '<span class="ticks" title="Okundu" style="color:#D1D5DB; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>';
            else ticks = '<span class="ticks" title="İletildi" style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>';
        }
        chatHTML += `<div class="bubble ${type}"><div class="msg-text">${msg.text}</div><div class="msg-time" style="display:flex; align-items:center; justify-content:flex-end; font-size:10px; opacity:0.7; margin-top:4px;">${msg.time} ${ticks}</div></div>`; 
    });
    scrollBox.innerHTML = chatHTML;
    scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.renderMessages = function() {
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));

    let html = `
        <div class="card" style="padding:0; border:none; background:transparent;">
            <div class="chat-layout" id="chat-layout-container">
                <div class="chat-sidebar" id="sidebar-container" style="background:white; border-radius:12px 0 0 12px; overflow:hidden;"></div>
                <div class="chat-main" id="chat-main-view" style="background:#F9FAFB; border-radius:0 12px 12px 0;">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-gray); opacity:0.7;">
                        <div style="font-size:48px; margin-bottom:10px;">💬</div>
                        <div>Mesajlaşmaya başlamak için sol taraftan bir kişi seçin.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    window.renderMessagesSidebarOnly(); 
    if(currentChatId && visibleChats.find(c => c.id === currentChatId)) window.openChatView(currentChatId);
};

window.openChatView = function(chatId) {
    currentChatId = chatId;
    const activeChat = chatsDB.find(c => c.id === chatId);
    if(!activeChat) return;

    let hasUnread = false;
    const updatedMessages = activeChat.messages.map(msg => {
        if (msg.senderId !== window.userProfile.uid && msg.read === false) { hasUnread = true; return { ...msg, read: true }; }
        return msg;
    });

    if (hasUnread) {
        updateDoc(doc(db, "chats", chatId), { messages: updatedMessages });
        activeChat.messages = updatedMessages; 
    }

    window.renderMessagesSidebarOnly(); 

    const container = document.getElementById('chat-main-view');
    document.getElementById('chat-layout-container').classList.add('chat-active');

    let avatarHtml = activeChat.avatar.startsWith('http') 
        ? `<img src="${activeChat.avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover;">` 
        : `<div style="width:42px; height:42px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${activeChat.avatar}</div>`;

    let chatHTML = `
        <div class="chat-header" style="padding:15px; border-bottom:1px solid #E5E7EB; background:white; display:flex; align-items:center; gap:15px;">
            <button class="back-btn" onclick="document.getElementById('chat-layout-container').classList.remove('chat-active'); window.resetCurrentChatId();" style="border:none; background:none; font-size:20px; cursor:pointer;">←</button>
            ${avatarHtml}
            <div class="chat-header-info">
                <div class="chat-header-name" style="font-weight:bold; font-size:16px; cursor:pointer;" onclick="window.viewUserProfile('${activeChat.otherUid}')">${activeChat.name}</div>
                <div class="chat-header-status" style="font-size:12px; color:#10B981;">UniLoop Ağı</div>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages-scroll" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column;"></div>
    `;
    
    if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
         chatHTML += `<div style="padding: 20px; text-align: center; color: var(--text-gray); background: white; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ Karşı tarafın mesaj/bağlantı isteğini kabul etmesi bekleniyor...</div>`;
    } else {
         chatHTML += `
            <div class="chat-input-area" style="padding:15px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:10px;">
                <div class="chat-input-wrapper" style="flex:1;"><input type="text" id="chat-input-field" placeholder="Bir mesaj yazın..." style="width:100%; padding:12px; border-radius:20px; border:1px solid #D1D5DB; background:#F9FAFB; outline:none;"></div>
                <button class="chat-send-btn" onclick="window.sendMsg('${chatId}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:44px; height:44px; cursor:pointer;">➤</button>
            </div>
        `;
    }
    
    container.innerHTML = chatHTML;
    window.updateChatMessagesOnly(chatId); 

    const inputField = document.getElementById('chat-input-field');
    if(inputField) {
        inputField.addEventListener('keypress', (e) => { if(e.key === 'Enter') window.sendMsg(chatId); });
        if(window.innerWidth > 1024) inputField.focus();
    }
};

window.sendMsg = async function(chatId) {
    const input = document.getElementById('chat-input-field');
    if(input && input.value.trim() !== '') {
        try {
            const text = input.value.trim();
            input.value = ''; 
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({ senderId: window.userProfile.uid, text: text, time: timeStr, read: false }), 
                lastUpdated: serverTimestamp() 
            });
        } catch(error) { console.error("Mesaj gönderilemedi: ", error); }
    }
};

// ============================================================================
// 8. KAMPÜS AKIŞI (FEED) - KEŞFET
// ============================================================================

window.renderConfessions = function() {
    let html = `
        <div class="feed-layout-container">
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 20px; background: inherit; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10;">
                <h2 style="margin:0; font-size: 20px; font-weight: 800;">📸 Kampüs Akışı</h2>
                <button class="btn-primary" style="width:auto; padding: 8px 16px; border-radius: 20px; font-size: 14px; box-shadow: 0 2px 4px rgba(79,70,229,0.2);" onclick="window.openConfessionForm()">+ Gönderi Oluştur</button>
            </div>
            <div class="confessions-feed" id="conf-feed"></div>
        </div>
    `;
    mainContent.innerHTML = html;
    if(confessionsDB) window.drawConfessionsFeed();
};

window.openConfessionForm = function() {
    window.openModal('Yeni Gönderi Oluştur', `
        <div class="form-group">
            <label style="font-weight:bold; margin-bottom:8px; display:block;">Kimliğinizi Seçin</label>
            <select id="new-conf-identity" style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; outline:none; font-size:15px; background:var(--bg-secondary); cursor:pointer;">
                <option value="anon">🤫 Tamamen Anonim Olarak Paylaş</option>
                <option value="real">👤 İsmimle Paylaş (${window.userProfile.username || window.userProfile.name})</option>
            </select>
        </div>
        <textarea id="new-conf-text" class="form-group" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:16px; margin-top:10px; resize:none; outline:none; border: 1px solid #E5E7EB;" placeholder="Aklından ne geçiyor? İnsanlarla paylaş..."></textarea>
        <div class="upload-btn-wrapper" style="margin-bottom: 15px;">
            <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center; font-size:15px; border:1px dashed var(--primary); background:var(--bg-secondary); padding:12px; border-radius:12px;">📷 Cihazdan Fotoğraf Seç (İsteğe Bağlı)</button>
            <input type="file" id="new-conf-photo" accept="image/*" style="display:none;" />
        </div>
        <div id="conf-preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-conf-btn" onclick="window.submitConfession()" style="padding:14px; font-size:16px; border-radius:12px; font-weight:bold;">Gönderiyi Yayınla</button>
        <p id="conf-upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Yükleniyor, lütfen bekleyin...</p>
    `);

    setTimeout(() => {
        const photoBtn = document.getElementById('conf-photo-trigger-btn');
        const photoInput = document.getElementById('new-conf-photo');
        if(photoBtn && photoInput) {
            photoBtn.addEventListener('click', () => { photoInput.click(); });
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = function(event) { 
                        document.getElementById('conf-preview-container').innerHTML = `<div class="preview-box" style="width:100%; height:auto; padding:0; border:none; margin-bottom:15px;"><img src="${event.target.result}" style="width:100%; max-height:200px; object-fit:contain; border-radius:12px; border:1px solid #E5E7EB; background:var(--bg-secondary);"></div>`; 
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }, 100);
};

window.submitConfession = async function() {
    const textEl = document.getElementById('new-conf-text');
    const identityEl = document.getElementById('new-conf-identity');
    const photoInput = document.getElementById('new-conf-photo');
    const btn = document.getElementById('publish-conf-btn');
    const statusEl = document.getElementById('conf-upload-status');
    
    if(!textEl || textEl.value.trim() === '') { alert("Lütfen bir şeyler yazın."); return; }
    btn.disabled = true;
    let imgUrl = "";

    if(photoInput && photoInput.files && photoInput.files.length > 0) {
        statusEl.style.display = 'block';
        statusEl.innerText = "Fotoğraf yükleniyor, kısa bir süre alabilir...";
        try {
            const file = photoInput.files[0];
            const fileName = Date.now() + '_' + file.name.replace(/\s/g, '');
            const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/feed_' + fileName);
            await uploadBytes(storageRef, file);
            imgUrl = await getDownloadURL(storageRef);
        } catch(err) {
            alert("Fotoğraf yüklenemedi. Lütfen tekrar deneyin. Hata: " + err.message);
            btn.disabled = false; statusEl.style.display = 'none'; return;
        }
    }

    const isAnon = identityEl.value === 'anon';
    const authorName = isAnon ? "Anonim Kullanıcı" : (window.userProfile.username || window.userProfile.name);
    const authorAvatar = isAnon ? ["👻","👽","🤖","🦊","🎭"][Math.floor(Math.random()*5)] : window.userProfile.avatar;

    try {
        await addDoc(collection(db, "confessions"), {
            authorId: window.userProfile.uid, avatar: authorAvatar, user: authorName, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
            text: textEl.value.trim(), imgUrl: imgUrl, comments: [], createdAt: serverTimestamp()
        });
        window.closeModal(); 
    } catch(e) { alert("Hata: Firebase kurallarını kontrol edin. Mesaj: " + e.message); btn.disabled = false; }
};

window.deleteConfession = async function(docId) {
    const lang = localStorage.getItem('uniloop_lang') || 'tr';
    const msg = lang === 'en' ? 'Are you sure you want to delete this post?' : 'Bu gönderiyi silmek istediğinize emin misiniz?';
    if(confirm(msg)) {
        try { await deleteDoc(doc(db, "confessions", docId)); } 
        catch(e) { console.error(e); alert("Hata oluştu: " + e.message); }
    }
};

window.drawConfessionsFeed = function() {
    const feed = document.getElementById('conf-feed');
    if(!feed) return;
    
    if(confessionsDB.length === 0) {
        feed.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding: 40px 20px; border-radius: 12px; margin-top: 20px;"><div style="font-size:40px; margin-bottom: 10px;">📸</div>Henüz hiçbir paylaşım yok. İlk gönderiyi sen paylaş!</div>`;
        return;
    }

    let html = '<div style="display:flex; flex-direction:column; gap:0;">';
    confessionsDB.forEach((post) => {
        let imgHtml = '';
        if(post.imgUrl) imgHtml = `<img src="${post.imgUrl}" class="feed-post-img" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`;
        const commentCount = post.comments ? post.comments.length : 0;
        let deleteBtnHtml = '';
        if (post.authorId === window.userProfile.uid) {
            deleteBtnHtml = `<button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">🗑️ Sil</button>`;
        }

        let premiumHintHtml = '';
        if (post.user === "Anonim Kullanıcı" && window.userProfile.isPremium) {
            premiumHintHtml = `<div style="font-size:11px; color:#D97706; font-weight:bold; margin-top:4px;">🌟 Premium İpucu: Bu kişi Bilgisayar Müh. bölümünden.</div>`;
        }

        let avatarHtml = post.avatar.startsWith('http') 
            ? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` 
            : post.avatar;

        html += `
        <div class="feed-post">
            <div class="feed-post-header">
                <div class="feed-post-avatar" style="cursor:pointer;" onclick="${post.user !== 'Anonim Kullanıcı' ? `window.viewUserProfile('${post.authorId}')` : ''}">${avatarHtml}</div>
                <div class="feed-post-meta">
                    <span class="feed-post-author" style="cursor:pointer;" onclick="${post.user !== 'Anonim Kullanıcı' ? `window.viewUserProfile('${post.authorId}')` : ''}">${post.user}</span>
                    <span class="feed-post-time">${post.time || 'Az önce'}</span>
                    ${premiumHintHtml}
                </div>
            </div>
            <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div>
            ${imgHtml}
            <div class="feed-post-actions">
                <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">💬 Yorum Yap veya Görüntüle (${commentCount})</button>
                ${deleteBtnHtml}
            </div>
        </div>`;
    });
    html += '</div>';
    feed.innerHTML = html;
};

window.openConfessionDetail = function(docId) {
    window.openModal('Gönderi', `<div id="confession-detail-container">Yükleniyor...</div>`);
    window.updateConfessionDetailLive(docId);
    const container = document.getElementById('confession-detail-container');
    if(container) container.insertAdjacentHTML('afterend', `<input type="hidden" id="active-post-id" value="${docId}">`);
};

window.updateConfessionDetailLive = function(docId) {
    const container = document.getElementById('confession-detail-container');
    if(!container) return;

    const post = confessionsDB.find(p => p.id === docId);
    if(!post) { container.innerHTML = "Gönderi bulunamadı veya silinmiş."; return; }
    
    let imgHtml = '';
    if(post.imgUrl) imgHtml = `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:16px; max-height:300px; object-fit:contain; background:inherit; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`;
    
    let commentsHtml = '';
    const commentsArray = post.comments || [];
    
    if(commentsArray.length === 0) {
        commentsHtml = '<p style="text-align:center; padding:15px; color:var(--text-gray); font-size:14px;">Henüz yorum yok. İlk yorumu sen yap!</p>';
    } else {
        commentsArray.forEach(c => {
            commentsHtml += `
                <div style="padding:14px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border-color);">
                    <div style="font-weight:800; color:var(--text-dark); margin-bottom:6px; font-size:14px;">${c.user}</div>
                    <div style="font-size:14px; color:var(--text-dark); line-height:1.4;">${c.text}</div>
                </div>
            `;
        });
    }

    let avatarHtml = post.avatar.startsWith('http') 
        ? `<img src="${post.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">` 
        : post.avatar;

    container.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <div class="feed-post-avatar" style="width:48px; height:48px; font-size:28px;">${avatarHtml}</div>
                <div>
                    <div style="font-weight:bold; font-size:16px;">${post.user}</div>
                    <div style="font-size:12px; color:var(--text-gray);">${post.time}</div>
                </div>
            </div>
            <div style="font-size:16px; margin-bottom:16px; line-height:1.6; color:var(--text-dark);">${post.text.replace(/\n/g, '<br>')}</div>
            ${imgHtml}
        </div>
        <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-bottom:16px;">
            <h4 style="margin-bottom:12px; font-size:15px; font-weight:bold;">Yorumlar (${commentsArray.length})</h4>
            <div class="answers-container" style="max-height: 250px; overflow-y: auto; padding-right:5px;" id="conf-comments-scroll">${commentsHtml}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center; background:inherit; padding:10px; border-radius:12px; border:1px solid var(--border-color);">
            <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:15px; color:var(--text-dark);" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')">
            <button class="btn-primary" style="width:auto; padding:8px 16px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button>
        </div>
    `;
    
    // Yorumlar yüklendiğinde en alta kaydırmak için küçük bir gecikme
    setTimeout(() => {
        const scrollBox = document.getElementById('conf-comments-scroll');
        if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
    }, 50);
};

window.submitConfessionComment = async function(docId) {
    const input = document.getElementById('new-conf-comment');
    if(!input || input.value.trim() === '') return;

    const text = input.value.trim();
    input.value = ''; // Gönderdikten sonra inputu temizle

    try {
        const postRef = doc(db, "confessions", docId);
        const userName = window.userProfile.username || window.userProfile.name;
        await updateDoc(postRef, {
            comments: arrayUnion({
                userId: window.userProfile.uid,
                user: userName,
                text: text,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            })
        });
    } catch(e) {
        console.error(e);
        alert("Yorum gönderilemedi: " + e.message);
    }
};

// ============================================================================
// 9. PROFİL YÖNETİMİ VE AYARLAR
// ============================================================================

window.renderProfile = function() {
    const u = window.userProfile;
    let avatarHtml = u.avatarUrl 
        ? `<img src="${u.avatarUrl}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:4px solid var(--primary); margin: 0 auto; display:block;">` 
        : `<div style="width:120px; height:120px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:50px; border:4px solid var(--primary); margin:0 auto;">${u.avatar || '👤'}</div>`;

    const premiumBadge = u.isPremium ? `<div style="text-align:center; margin-top:10px;"><span style="background:linear-gradient(135deg, #F59E0B, #D97706); color:white; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:bold; box-shadow:0 2px 4px rgba(245, 158, 11, 0.3);">🌟 Premium Üye</span></div>` : '';

    let html = `
        <div class="card" style="padding: 25px; text-align:center; position:relative; min-height: calc(100vh - 120px);">
            <div style="position:absolute; top:20px; right:20px; display:flex; gap:10px;">
                <button onclick="window.renderSettings()" style="background:none; border:none; font-size:24px; cursor:pointer;" title="Ayarlar">⚙️</button>
            </div>
            
            <div style="position:relative; display:inline-block; margin-bottom:15px;">
                ${avatarHtml}
                <button onclick="document.getElementById('profile-avatar-upload').click()" style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border:none; border-radius:50%; width:36px; height:36px; cursor:pointer; font-size:16px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</button>
                <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.uploadProfileAvatar(event)">
            </div>
            ${premiumBadge}
            <h2 style="margin:10px 0 5px 0; font-size:22px; color:var(--text-dark);">${u.name} ${u.surname}</h2>
            <p style="color:var(--primary); font-weight:bold; font-size:15px; margin-bottom:5px;">${u.username ? u.username : '⚠️ @kullaniciadi_belirle'}</p>
            <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">${u.university} - ${u.faculty || 'Bölüm belirtilmemiş'}</p>

            <div style="display:flex; gap:10px; justify-content:center; margin-bottom: 25px;">
                <button class="btn-primary" style="flex:1; max-width:200px; padding:10px;" onclick="window.editProfile()">✏️ Profili Düzenle</button>
                <button class="action-btn" style="flex:1; max-width:200px; padding:10px;" onclick="window.loadPage('friends')">👥 Arkadaşlarım</button>
            </div>
            
            <div style="text-align:left; background:#F9FAFB; padding:20px; border-radius:16px; border:1px solid #E5E7EB;">
                <h4 style="margin-bottom:10px; color:#6B7280; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Hakkımda / Biyografi</h4>
                <p style="font-size:15px; color:var(--text-dark); line-height:1.6; white-space:pre-wrap;">${u.bio || 'Henüz bir biyografi eklemediniz. Düzenle butonuna tıklayarak kendinizden bahsedin!'}</p>
            </div>
        </div>
    `;
    mainContent.innerHTML = html;
};

window.uploadProfileAvatar = async function(event) {
    const file = event.target.files[0];
    if(!file) return;

    const btn = event.target.previousElementSibling;
    const originalText = btn.innerText;
    btn.innerText = "⏳";
    btn.disabled = true;
    
    try {
        const fileName = window.userProfile.uid + '_avatar_' + Date.now();
        const storageRef = ref(storage, 'avatars/' + fileName);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, "users", window.userProfile.uid), { avatarUrl: url });
        window.userProfile.avatarUrl = url;
        window.renderProfile();
        alert("Profil fotoğrafınız başarıyla güncellendi!");
    } catch(e) {
        console.error(e);
        alert("Fotoğraf yüklenirken hata oluştu: " + e.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

window.editProfile = function() {
    const u = window.userProfile;
    // Kullanıcı adından # işaretini çıkararak göster
    let cleanUsername = u.username ? u.username.replace(/^#/, '') : '';
    
    window.openModal('Profili Düzenle', `
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:var(--text-gray);">Kullanıcı Adı (Boşluksuz)</label>
            <div style="display:flex; align-items:center; background:var(--bg-secondary); border:1px solid #D1D5DB; border-radius:12px; padding:0 12px;">
                <span style="color:var(--primary); font-weight:bold; margin-right:5px;">#</span>
                <input type="text" id="edit-username" value="${cleanUsername}" placeholder="kullanici_adim" style="border:none; outline:none; background:transparent; width:100%; padding:12px 0;">
            </div>
        </div>
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:var(--text-gray);">Fakülte / Bölüm</label>
            <input type="text" id="edit-faculty" value="${u.faculty || ''}" placeholder="Örn: Bilgisayar Mühendisliği" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none;">
        </div>
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:var(--text-gray);">Yaş</label>
            <input type="number" id="edit-age" value="${u.age || ''}" placeholder="Örn: 21" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none;">
        </div>
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:var(--text-gray);">Biyografi / İlgi Alanları</label>
            <textarea id="edit-bio" rows="4" placeholder="Kendinden, hobilerinden ve neler aradığından bahset..." style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none; resize:none;">${u.bio || ''}</textarea>
        </div>
        <button class="btn-primary" style="width:100%; padding:14px; font-size:15px; border-radius:12px;" onclick="window.saveProfileInfo()">💾 Değişiklikleri Kaydet</button>
    `);
};

window.saveProfileInfo = async function() {
    let rawUsername = document.getElementById('edit-username').value.trim().toLowerCase().replace(/\s+/g, '');
    const faculty = document.getElementById('edit-faculty').value.trim();
    const age = document.getElementById('edit-age').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    let finalUsername = "";
    if (rawUsername) finalUsername = '#' + rawUsername;

    try {
        if (finalUsername && finalUsername !== window.userProfile.username) {
            const q = query(collection(db, "users"), where("username", "==", finalUsername));
            const snapshot = await getDocs(q);
            if(!snapshot.empty) {
                alert("Bu kullanıcı adı zaten alınmış. Lütfen başka bir tane seçin.");
                return;
            }
        }

        await updateDoc(doc(db, "users", window.userProfile.uid), {
            username: finalUsername,
            faculty: faculty,
            age: age,
            bio: bio
        });

        window.userProfile.username = finalUsername;
        window.userProfile.faculty = faculty;
        window.userProfile.age = age;
        window.userProfile.bio = bio;

        window.closeModal();
        window.renderProfile();
    } catch(e) {
        console.error(e);
        alert("Hata oluştu: " + e.message);
    }
};

window.renderSettings = function() {
    const lang = localStorage.getItem('uniloop_lang') || 'tr';
    const t = TRANSLATIONS[lang];
    const theme = localStorage.getItem('uniloop_theme') || 'light';

    window.openModal(t.settingsTitle, `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div>
                <label style="font-weight:bold; display:block; margin-bottom:8px; color:var(--text-dark);">${t.langLabel}</label>
                <select onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:12px; border:1px solid #E5E7EB; background:var(--bg-secondary); outline:none;">
                    <option value="tr" ${lang === 'tr' ? 'selected' : ''}>Türkçe</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
            <div>
                <label style="font-weight:bold; display:block; margin-bottom:8px; color:var(--text-dark);">${t.themeLabel}</label>
                <select onchange="window.toggleTheme(this.value)" style="width:100%; padding:12px; border-radius:12px; border:1px solid #E5E7EB; background:var(--bg-secondary); outline:none;">
                    <option value="light" ${theme === 'light' ? 'selected' : ''}>${t.lightMode} ☀️</option>
                    <option value="dark" ${theme === 'dark' ? 'selected' : ''}>${t.darkMode} 🌙</option>
                </select>
            </div>
            <hr style="border:none; border-top:1px solid #E5E7EB; margin: 5px 0;">
            <button class="btn-danger" style="width:100%; padding:14px; border-radius:12px; font-weight:bold;" onclick="window.logout(); window.closeModal();">${t.logoutBtn}</button>
        </div>
    `);
};

// ============================================================================
// 10. SAYFA YÖNLENDİRİCİSİ (ROUTER) VE SİSTEMİ BAŞLATMA
// ============================================================================

window.loadPage = function(page) {
    document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
    const activeNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
    if(activeNav) activeNav.classList.add('active');

    mainContent.innerHTML = '';
    
    // Mesaj görünümünü sıfırla
    const chatLayout = document.getElementById('chat-layout-container');
    if (chatLayout) chatLayout.classList.remove('chat-active');
    window.resetCurrentChatId();

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch(page) {
        case 'home': window.renderHome(); break;
        case 'confessions': window.renderConfessions(); break;
        case 'market': window.renderListings('market', '🛒 Kampüs Market'); break;
        case 'messages': window.renderMessages(); break;
        case 'profile': window.renderProfile(); break;
        case 'friends': window.renderFriends(); break;
        case 'notifications': window.renderNotifications(); break;
        default: window.renderHome(); break;
    }
};

} // initializeUniLoop fonksiyonunun son kapanış parantezi

// DOM yüklendiğinde sistemi başlat
document.addEventListener("DOMContentLoaded", () => {
    initializeUniLoop();
});

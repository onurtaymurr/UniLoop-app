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
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", bio: "", avatarUrl: "", age: "", grade: "", interests: [], purpose: "", isPremium: false 
};

window.joinedFaculties = [];
let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;

// Stepper (Hesap Oluşturma) Geçici Verileri
window.registrationData = { interests: [] }; 

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

const allFaculties = [
    "Tıp Fakültesi", "Diş Hekimliği Fakültesi", "Eczacılık Fakültesi", "Hukuk Fakültesi", "Mühendislik Fakültesi", 
    "Bilgisayar Mühendisliği", "Mimarlık Fakültesi", "Eğitim Fakültesi", "İletişim Fakültesi", "İktisadi ve İdari Bilimler", "Güzel Sanatlar"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
const modal = document.getElementById('app-modal');

function initializeUniLoop() {

// ✂️ CROPPER.JS ENJEKSİYONU
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
        position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; border-top: 1px solid #f1f1f1;
        display: flex; justify-content: space-around; align-items: center; padding-bottom: env(safe-area-inset-bottom);
        height: 60px; z-index: 9999; box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
    }
    .bottom-nav-item {
        display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8E8E93; 
        font-size: 10px; text-decoration: none; cursor: pointer; transition: 0.2s; flex: 1;
        background: transparent !important; border: none !important; font-weight: 500; height: 100%; padding: 0;
    }
    .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
    .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
    .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
    .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
    .bottom-nav-item.active .bottom-nav-icon svg { stroke-width: 2.2; }

    /* STEPPER KULLANICI ARAYÜZÜ (KAYIT) */
    .stepper-container { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 500px; margin: 0 auto; width: 100%; }
    .step-header { font-size: 14px; font-weight: bold; color: var(--primary); text-align: center; margin-bottom: 15px; }
    .step-title { font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 20px; }
    .grade-btn, .interest-btn, .purpose-btn { background: #F3F4F6; border: 1px solid #E5E7EB; padding: 10px 15px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; margin: 5px; display: inline-block; }
    .grade-btn.active, .interest-btn.active, .purpose-btn.active { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.05); }
    
    /* PROFİL KARTI ŞABLONU */
    .profile-card-preview { background: linear-gradient(135deg, #ffffff, #f9fafb); border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
    .pc-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); flex-shrink: 0; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 30px; overflow: hidden; }
    .pc-info { flex: 1; text-align: left; }
    .pc-name { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 2px; }
    .pc-sub { font-size: 12px; color: #6b7280; font-weight: 600; }
    .pc-tags { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 5px; }
    .pc-tag { font-size: 10px; background: #eef2ff; color: var(--primary); padding: 3px 8px; border-radius: 8px; font-weight: bold; }

    /* ESTETİK BİLDİRİM PANELİ ŞABLONU */
    .notif-compact-panel { max-height: 350px; overflow-y: auto; padding-right: 5px; scroll-behavior: smooth; border-radius: 12px; background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; }
    .notif-compact-item { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); flex-wrap: wrap; gap: 10px; }

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
    .premium-glow { animation: glowPulse 2s infinite alternate; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); } }
    .premium-upgrade-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 8px; }
    
    body.dark-mode, .dark-mode #main-content { background-color: #121212 !important; color: #e5e7eb !important; }
    .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card { background-color: #1e1e1e !important; border-color: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .card > div { border-color: #374151 !important; }
    .dark-mode .feed-post-author, .dark-mode .feed-post-text, .dark-mode h2, .dark-mode label, .dark-mode .item-title { color: #e5e7eb !important; }
    .dark-mode .feed-layout-container, .dark-mode #conf-feed, .dark-mode .notif-compact-panel { background-color: #121212 !important; }
    .dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #374151 !important; color: #e5e7eb !important; border-color: #4b5563 !important; }
    .dark-mode .feed-post-avatar, .dark-mode .avatar { background-color: #374151 !important; border-color: #4b5563 !important; }
    .dark-mode .feed-action-btn:hover { background: #374151 !important; }
    .dark-mode .chat-contact:hover { background: #374151 !important; }
    .dark-mode .chat-input-wrapper input { background: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .modal-content { background-color: #1e1e1e !important; color: #e5e7eb !important; border-color: #374151 !important;}
    .dark-mode .bottom-nav { background: #1e1e1e !important; border-top-color: #374151 !important; }
    .dark-mode .bottom-nav-item.active { color: #6366f1 !important; }
    .dark-mode .notif-compact-item { background-color: #1e1e1e !important; border-color: #374151 !important; }
    
    #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
    #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
    #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 10px; }
    
    #notif-btn-top { position: relative; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
    #notif-btn-top:hover { background: #E5E7EB; }
    
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
// 1. GİRİŞ VE 4 ADIMLI KAYIT (STEPPER) OLUŞTURMA
// ============================================================================

bind('show-login-btn', 'click', (e) => {
    if(e) e.preventDefault();
    document.getElementById('register-card').style.display = 'none'; 
    if(document.getElementById('stepper-wrapper')) {
        document.getElementById('stepper-wrapper').remove();
    }
    document.getElementById('login-card').style.display = 'block';
});

// KAYIT OL BUTONUNA TIKLANINCA YENİ STEPPER AÇILACAK
bind('show-register-btn', 'click', (e) => {
    if(e) e.preventDefault();
    document.getElementById('login-card').style.display = 'none'; 
    document.getElementById('register-card').style.display = 'none'; 
    startRegistrationStepper();
});

function startRegistrationStepper() {
    window.registrationData = { interests: [] };
    const container = document.createElement('div');
    container.id = 'stepper-wrapper';
    container.className = 'stepper-container';
    
    const authContainer = document.querySelector('.auth-container') || document.getElementById('auth-screen');
    authContainer.appendChild(container);
    renderStep(1);
}

window.renderStep = function(step) {
    const wrapper = document.getElementById('stepper-wrapper');
    if(!wrapper) return;
    let html = '';

    if (step === 1) {
        html = `
            <div class="step-header">Adım 1 / 4</div>
            <div class="step-title">Seni Tanıyalım 🎓</div>
            
            <input type="text" id="reg-name" placeholder="Adın" style="margin-bottom:10px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; outline:none;">
            <input type="text" id="reg-surname" placeholder="Soyadın" style="margin-bottom:10px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; outline:none;">
            <input type="number" id="reg-age" placeholder="Yaşın" style="margin-bottom:10px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; outline:none;">
            <input type="email" id="reg-email" placeholder="Okul E-postan" style="margin-bottom:10px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; outline:none;">
            <input type="password" id="reg-password" placeholder="Şifren" style="margin-bottom:20px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; outline:none;">
            
            <button class="btn-primary" style="width:100%; padding:12px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(1)">Devam Et →</button>
            <p style="text-align:center; margin-top:15px; font-size:13px;">
                <a href="#" style="color:var(--primary); text-decoration:none;" onclick="document.getElementById('stepper-wrapper').remove(); document.getElementById('login-card').style.display='block';">Geri Dön</a>
            </p>
        `;
    } else if (step === 2) {
        let facOptions = allFaculties.map(f => `<option value="${f}">${f}</option>`).join('');
        html = `
            <div class="step-header">Adım 2 / 4</div>
            <div class="step-title">Eğitim Bilgilerin 📚</div>
            
            <select id="reg-faculty" style="margin-bottom:15px; width:100%; padding:12px; border-radius:10px; border:1px solid #ccc; background:#F3F4F6; outline:none;">
                <option value="">Fakülteni Seç</option>
                ${facOptions}
            </select>
            
            <div style="margin-bottom: 20px; text-align:center;">
                <p style="font-size:14px; font-weight:bold; margin-bottom:10px;">Kaçıncı Sınıfsın?</p>
                ${[1, 2, 3, 4, 5, 6].map(g => `<button class="grade-btn" onclick="window.selectGrade(this, '${g}')">${g}. Sınıf</button>`).join('')}
            </div>
            
            <button class="btn-primary" style="width:100%; padding:12px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(2)">Devam Et →</button>
        `;
    } else if (step === 3) {
        const interests = ['🎵 Müzik', '⚽ Spor', '📚 Kitap', '🎮 Oyun', '✈️ Seyahat', '🎨 Sanat', '💻 Yazılım', '☕ Kahve', '🎬 Sinema', '🧘‍♀️ Yoga'];
        html = `
            <div class="step-header">Adım 3 / 4</div>
            <div class="step-title">Nelerden Hoşlanırsın? 🎯</div>
            <p style="text-align:center; font-size:12px; color:#666; margin-bottom:15px;">En az 2 ilgi alanı seç</p>
            
            <div style="text-align:center; margin-bottom: 20px;">
                ${interests.map(i => `<button class="interest-btn" onclick="window.toggleInterest(this, '${i}')">${i}</button>`).join('')}
            </div>
            
            <button class="btn-primary" style="width:100%; padding:12px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(3)">Devam Et →</button>
        `;
    } else if (step === 4) {
        const purposes = ['👋 Sosyalleşmek İstiyorum', '👥 Arkadaş Arıyorum', '📚 Ders Çalışma Arkadaşı', '❤️ Belki Bir Randevu', '🛒 Sadece Market'];
        html = `
            <div class="step-header">Son Adım (4 / 4)</div>
            <div class="step-title">Uygulamadaki Amacın Ne? 🚀</div>
            
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                ${purposes.map(p => `<button class="purpose-btn" onclick="window.selectPurpose(this, '${p}')" style="width:100%; text-align:left;">${p}</button>`).join('')}
            </div>
            
            <button class="btn-primary" style="width:100%; padding:12px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(4)">Profili Tamamla →</button>
        `;
    } else if (step === 5) {
        html = `
            <div class="step-title">Profilin Hazır! ✨</div>
            <p style="text-align:center; font-size:13px; color:#666; margin-bottom:15px;">Son olarak bir profil fotoğrafı ekle (İsteğe bağlı).</p>
            
            <div class="profile-card-preview">
                <div style="position:relative; cursor:pointer;" onclick="document.getElementById('final-avatar-upload').click()">
                    <div id="preview-pc-avatar-container" class="pc-avatar">👤</div>
                    <div style="position:absolute; bottom:-5px; right:-5px; background:var(--primary); color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white; z-index:10;">📷</div>
                </div>
                <input type="file" id="final-avatar-upload" accept="image/*" style="display:none;" onchange="window.previewFinalAvatar(event)">
                
                <div class="pc-info">
                    <div class="pc-name">${window.registrationData.name} ${window.registrationData.surname}</div>
                    <div class="pc-sub">${window.registrationData.age} Yaşında • ${window.registrationData.grade}. Sınıf</div>
                    <div class="pc-sub" style="color:var(--primary); margin-top:2px;">${window.registrationData.faculty}</div>
                    <div class="pc-tags">
                        ${window.registrationData.interests.slice(0,3).map(i => `<span class="pc-tag">${i.split(' ')[1] || i}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <button id="final-register-btn" class="btn-primary" style="width:100%; padding:14px; font-size:16px; font-weight:bold; border-radius:12px;" onclick="window.finalizeRegistration()">Uygulamaya Giriş Yap 🚀</button>
        `;
    }
    wrapper.innerHTML = html;
};

// STEPPER YARDIMCI FONKSİYONLARI
window.selectGrade = function(btn, grade) {
    document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.registrationData.grade = grade;
};

window.toggleInterest = function(btn, interest) {
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        if(!window.registrationData.interests.includes(interest)) window.registrationData.interests.push(interest);
    } else {
        window.registrationData.interests = window.registrationData.interests.filter(i => i !== interest);
    }
};

window.selectPurpose = function(btn, purpose) {
    document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.registrationData.purpose = purpose;
};

window.previewFinalAvatar = function(event) {
    const file = event.target.files[0];
    if(file) {
        window.registrationData.avatarFile = file;
        const reader = new FileReader();
        reader.onload = function(e) { 
            document.getElementById('preview-pc-avatar-container').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`; 
        }
        reader.readAsDataURL(file);
    }
};

window.processStep = function(step) {
    if (step === 1) {
        const n = document.getElementById('reg-name').value.trim();
        const s = document.getElementById('reg-surname').value.trim();
        const a = document.getElementById('reg-age').value.trim();
        const e = document.getElementById('reg-email').value.trim();
        const p = document.getElementById('reg-password').value;
        if(!n || !s || !a || !e || !p) return alert("Lütfen tüm alanları doldurun.");
        window.registrationData = { ...window.registrationData, name: n, surname: s, age: a, email: e, password: p };
        window.renderStep(2);
    } else if (step === 2) {
        const f = document.getElementById('reg-faculty').value;
        if(!f || !window.registrationData.grade) return alert("Lütfen fakülte ve sınıfınızı seçin.");
        window.registrationData.faculty = f;
        window.renderStep(3);
    } else if (step === 3) {
        if(window.registrationData.interests.length < 2) return alert("Lütfen en az 2 ilgi alanı seçin.");
        window.renderStep(4);
    } else if (step === 4) {
        if(!window.registrationData.purpose) return alert("Lütfen uygulamadaki amacınızı seçin.");
        window.renderStep(5);
    }
};

window.finalizeRegistration = async function() {
    const btn = document.getElementById('final-register-btn');
    btn.innerText = "Hesap Oluşturuluyor...";
    btn.disabled = true;
    
    const d = window.registrationData;
    let finalAvatarUrl = "";

    try {
        const userCred = await createUserWithEmailAndPassword(auth, d.email, d.password);
        const user = userCred.user;

        // Fotoğraf varsa Firebase Storage'a yükle
        if (d.avatarFile) {
            const fileName = user.uid + '_avatar_' + Date.now();
            const storageRef = ref(storage, 'avatars/' + fileName);
            await uploadBytes(storageRef, d.avatarFile);
            finalAvatarUrl = await getDownloadURL(storageRef);
        }

        const bioText = `Amacım: ${d.purpose}. İlgi Alanlarım: ${d.interests.join(', ')}`;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid, 
            name: d.name, 
            surname: d.surname, 
            username: "", 
            email: d.email, 
            university: "UniLoop Kampüsü", 
            faculty: d.faculty, 
            grade: d.grade, 
            age: d.age, 
            bio: bioText, 
            interests: d.interests, 
            purpose: d.purpose,
            avatar: "👨‍🎓", 
            avatarUrl: finalAvatarUrl, 
            isOnline: true, 
            isPremium: false 
        });

        // Doğrulama maili gönder
        sendEmailVerification(user).catch(err => { console.error("Mail gönderilemedi:", err); });

        document.getElementById('stepper-wrapper').remove();
        document.getElementById('verify-card').style.display = 'block';
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert("Kayıt olurken hata: Bu e-posta adresi zaten kullanımda.");
        } else {
            alert("Kayıt olurken bir hata oluştu: " + error.message);
        }
        btn.innerText = "Uygulamaya Giriş Yap 🚀";
        btn.disabled = false;
    }
};

bind('verify-code-btn', 'click', async (e) => {
    if(e) e.preventDefault();
    const user = auth.currentUser;
    if(!user) {
        alert("Oturum zaman aşımına uğradı. Lütfen sayfayı yenileyip tekrar giriş yapın.");
        return;
    }
    const btn = document.getElementById('verify-code-btn');
    const originalText = btn.innerText; 
    btn.innerText = "Kontrol Ediliyor..."; 
    btn.disabled = true;

    try {
        await user.reload();
        if(user.emailVerified) {
            alert("Tebrikler! Hesabınız aktifleştirildi.");
            window.location.reload(); 
        } else {
            alert("Hesabınız henüz onaylanmamış! Lütfen e-postanızı kontrol edin.");
            btn.innerText = originalText; 
            btn.disabled = false; 
        }
    } catch (err) {
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
            const systemMessageText = `Merhaba ${userName}! Dünyanın en yenilikçi kampüs ağı UniLoop'a hoş geldin. 🎓✨<br><br>Burası senin alanın. Hemen "Profil" sekmesine giderek kendine estetik bir biyografi ve profil fotoğrafı ekle!`;
            
            await setDoc(chatRef, {
                participants: [user.uid, "system"], 
                participantNames: { [user.uid]: userName, "system": "UniLoop Team" }, 
                participantAvatars: { [user.uid]: "👨‍🎓", "system": "🌍" },
                lastUpdated: serverTimestamp(), 
                status: 'accepted', 
                initiator: 'system', 
                isMarketChat: false,
                messages: [{ senderId: "system", text: systemMessageText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
            });
        }
    } catch (error) { 
        console.error("Karşılama mesajı oluşturulamadı:", error); 
    }
};

window.logout = async function() {
    try {
        if(window.userProfile.uid) {
            await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
        }
        await signOut(auth);
        window.location.reload();
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
            } else {
                window.userProfile = { 
                    uid: user.uid, 
                    name: "Öğrenci", 
                    surname: "", 
                    email: user.email, 
                    university: "UniLoop Kampüsü", 
                    avatar: "👨‍🎓", 
                    faculty: "", 
                    bio: "", 
                    isOnline: true, 
                    isPremium: false 
                };
                await setDoc(userDocRef, window.userProfile);
            }

            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            
            const headerRightMenu = document.querySelector('.header-right-menu');
            if (headerRightMenu) {
                headerRightMenu.innerHTML = ''; // Eski butonları temizle
                
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

            // YENİ, İNCE VE SVG İKONLU BOTTOM NAV
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
        if(activeTab && activeTab.getAttribute('data-target') === 'market') {
            window.renderListings('market', '🛒 Kampüs Market');
        }
    });

    onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
        confessionsDB = [];
        snapshot.forEach(doc => { confessionsDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.bottom-nav-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'confessions') {
            window.drawConfessionsFeed();
        }
        
        if(document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
            window.updateConfessionDetailLive(document.getElementById('active-post-id').value);
        }
    });

    onSnapshot(query(collection(db, "chats"), where("participants", "array-contains", currentUid)), (snapshot) => {
        chatsDB = [];
        let pendingRequestsCount = 0;
        
        snapshot.forEach(doc => {
            try {
                const data = doc.data({ serverTimestamps: 'estimate' }); 
                if (!data.participants) return;
                
                const otherUid = data.participants.find(p => p !== currentUid) || "system";
                const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
                const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
                let safeTimestamp = data.lastUpdated && typeof data.lastUpdated.toMillis === 'function' ? data.lastUpdated.toMillis() : Date.now();
                
                const chatItem = { 
                    id: doc.id, 
                    otherUid: otherUid, 
                    name: otherName, 
                    avatar: otherAvatar, 
                    messages: data.messages || [], 
                    status: data.status || 'accepted', 
                    initiator: data.initiator || null, 
                    lastUpdatedTS: safeTimestamp,
                    isMarketChat: data.isMarketChat || false, 
                    listingId: data.listingId || null
                };
                
                chatsDB.push(chatItem);
                
                // Karşı taraftan gelen istekleri say (Benim başlattıklarım hariç)
                if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) {
                    pendingRequestsCount++;
                }
            } catch(err) { 
                console.error("Hatalı chat belgesi atlandı:", err); 
            }
        });

        chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
        
        const notifBadge = document.getElementById('notif-badge'); 
        const notifBadgeTop = document.getElementById('notif-badge-top'); 
        
        if(notifBadge) { 
            notifBadge.style.display = pendingRequestsCount > 0 ? 'flex' : 'none'; 
            notifBadge.innerText = pendingRequestsCount; 
        }
        if(notifBadgeTop) { 
            notifBadgeTop.style.display = pendingRequestsCount > 0 ? 'flex' : 'none'; 
            notifBadgeTop.innerText = pendingRequestsCount; 
        }

        const activeTab = document.querySelector('.bottom-nav-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'messages') {
            if (currentChatId) {
                window.renderMessagesSidebarOnly();
                window.updateChatMessagesOnly(currentChatId);
            } else { 
                window.renderMessages(); 
            }
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
            
            <button id="buy-premium-btn" onclick="window.upgradeToPremium()" class="premium-upgrade-btn premium-glow" style="width:100%; justify-content:center; padding: 16px; font-size: 16px;">
                💳 Güvenli Ödeme İle Satın Al
            </button>
        </div>
    `);
};

window.upgradeToPremium = async function() {
    const btn = document.getElementById('buy-premium-btn');
    btn.innerText = '⏳ Ödeme İşleniyor...';
    btn.disabled = true;
    
    setTimeout(async () => {
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: true });
            window.userProfile.isPremium = true;
            window.closeModal(); 
            alert("🎉 Tebrikler! Premium aktif!"); 
            window.loadPage('home'); 
        } catch(e) { 
            alert("Hata oluştu."); 
            btn.innerText = '💳 Güvenli Ödeme İle Satın Al';
            btn.disabled = false;
        }
    }, 2000);
};

// ============================================================================
// 3. AÇILIR PENCERELER (MODAL) VE YARDIMCILAR
// ============================================================================

window.openModal = function(title, contentHTML) { 
    document.getElementById('modal-title').innerText = title; 
    document.getElementById('modal-body').innerHTML = contentHTML; 
    modal.classList.add('active'); 
    document.body.style.overflow = 'hidden'; 
};

window.closeModal = function() { 
    modal.classList.remove('active'); 
    document.getElementById('modal-body').innerHTML = ''; 
    document.body.style.overflow = 'auto'; 
};

bind('modal-close', 'click', window.closeModal);

window.addEventListener('click', (e) => { 
    if (e.target === modal) window.closeModal(); 
});

// ============================================================================
// 4. ARKADAŞ EKLEME VE ARAMA (SESSİZ MESAJ SİSTEMİ)
// ============================================================================

window.searchAndAddFriend = async function() {
    const searchInput = document.getElementById('friend-search-input');
    if(!searchInput) return;
    
    let rawSearch = searchInput.value.trim().toLowerCase().replace(/^#/, '');
    if(!rawSearch) return alert("Lütfen bir kullanıcı adı yazın.");
    
    const searchVal = '#' + rawSearch;
    if(searchVal === window.userProfile.username) return alert("Kendinize istek gönderemezsiniz :)");

    const btn = document.getElementById('friend-search-btn');
    btn.innerText = "Aranıyor..."; 
    btn.disabled = true;

    const q = query(collection(db, "users"), where("username", "==", searchVal));
    const snapshot = await getDocs(q);
    
    if(snapshot.empty) {
        alert("Kullanıcı bulunamadı!");
    } else {
        const targetUser = snapshot.docs[0].data();
        await window.sendFriendRequest(targetUser.uid, targetUser.name + " " + targetUser.surname);
    }
    
    searchInput.value = ''; 
    btn.innerText = "Ekle"; 
    btn.disabled = false;
};

window.sendFriendRequest = async function(targetUserId, targetUserName) {
    try {
        const myUid = auth.currentUser.uid;
        const existingChat = chatsDB.find(c => c.otherUid === targetUserId && !c.isMarketChat);

        if(!existingChat) {
            // İSTEK GÖNDERİLDİĞİNDE "MESSAGES" DİZİSİ BOŞ BIRAKILIR Kİ SOHBET LİSTESİNDE GÖZÜKMESİN
            await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), 
                status: 'pending', 
                initiator: myUid, 
                isMarketChat: false, 
                messages: [] 
            });
            alert("İstek başarıyla arka planda gönderildi! Karşı taraf onayladığında bildirim alacaksınız.");
        } else {
            if (existingChat.status === 'pending') {
                alert("Bu kişiye zaten istek gönderilmiş veya ondan size istek gelmiş.");
            } else {
                alert("Bu kişiyle zaten bağlantınız var.");
            }
        }
    } catch (error) { 
        alert("Hata: " + error.message); 
    }
};

window.viewUserProfile = async function(targetUid) {
    if(targetUid === window.userProfile.uid) return window.loadPage('profile');
    
    try {
        const docSnap = await getDoc(doc(db, "users", targetUid));
        if (docSnap.exists()) {
            const u = docSnap.data();
            const initial = u.surname ? u.surname.charAt(0) + '.' : '';
            let avatarHtml = u.avatarUrl 
                ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #E5E7EB;">` 
                : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;
            
            const bioText = u.bio ? u.bio : "Henüz bir biyografi eklemedi.";
            const existingChat = chatsDB.find(c => c.otherUid === u.uid && !c.isMarketChat);
            
            let actionBtnHtml = '';
            
            if (existingChat && existingChat.status === 'accepted') {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
            } else if (existingChat && existingChat.status === 'pending') {
                actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
            } else {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Bağlantı Kur (Ekle)</button>`;
            }

            window.openModal('Kullanıcı Profili', `
                <div style="text-align:center;">
                    ${avatarHtml}
                    <h3 style="margin: 10px 0 5px 0;">${u.name} ${initial}</h3>
                    <p style="color:var(--primary); font-weight:bold;">${u.faculty || 'Belirtilmemiş'}</p>
                    <p style="color:var(--text-gray); font-size:13px; margin-bottom: 15px;">${u.age ? u.age + ' Yaşında' : ''}</p>
                    
                    <div style="background:#F9FAFB; padding:15px; border-radius:12px; text-align:left; margin-bottom: 20px;">
                        <strong>Hakkında</strong>
                        <p style="font-size:14px; margin-top:5px;">${bioText}</p>
                    </div>
                    
                    ${actionBtnHtml}
                </div>
            `);
        }
    } catch (e) { 
        alert("Profil yüklenirken hata oluştu."); 
    }
};

window.renderHome = async function() {
    let html = `
        <div class="card" style="background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: white; border:none; margin-bottom: 6px !important; padding: 15px;">
            <h2 style="font-size:20px; margin-bottom:6px;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
            <p style="opacity:0.9; font-size:14px; margin:0;"><strong style="color:#D9FDD3;">${window.userProfile.university}</strong> ağındasın.</p>
        </div>
        
        <div class="card" style="padding: 10px 15px; display:flex; align-items:center; gap:10px; margin-bottom: 6px !important; border-radius: 12px;">
            <div style="font-size:16px;">🔍</div>
            <div style="display:flex; flex:1; align-items:center; background:#F3F4F6; border-radius:10px; padding:0 10px;">
                <span style="color:var(--primary); font-weight:800; font-size:15px;">#</span>
                <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:8px 6px; outline:none; font-size:14px; font-weight:600;" placeholder="arkadasini_bul" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
            </div>
            <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:8px 14px; border-radius:10px; font-size:13px;" onclick="window.searchAndAddFriend()">Ekle</button>
        </div>
        
        <div class="card" style="padding: 15px; border-radius: 12px;">
            <h2 style="margin-bottom:12px; margin-top:0; font-size:16px;">🔥 Önerilen Kişiler</h2>
            <div class="user-grid" id="home-users-grid" style="gap:8px;">Yükleniyor...</div>
        </div>
    `;
    mainContent.innerHTML = html;

    try {
        const querySnapshot = await getDocs(query(collection(db, "users")));
        let usersHtml = '';
        let count = 0;
        
        // Etkileşimde bulunulan kişileri filtrelemek için
        const interactedUids = chatsDB.map(c => c.otherUid);
        
        querySnapshot.forEach((doc) => {
            const u = doc.data();
            if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid) && count < 10) {
                count++;
                let avatarHtml = u.avatarUrl 
                    ? `<img src="${u.avatarUrl}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">` 
                    : `<div style="width:50px; height:50px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:25px;">${u.avatar || '👤'}</div>`;
                
                usersHtml += `
                    <div class="user-card" onclick="window.viewUserProfile('${u.uid}')" style="min-height:120px; padding:10px;">
                        <div style="margin-bottom: 8px;">${avatarHtml}</div>
                        <div style="font-weight:bold; font-size:14px;">${u.name}</div>
                        <div style="font-size:11px; color:var(--text-gray); margin-top:4px;">${u.faculty || 'Kampüs Öğrencisi'}</div>
                        <button class="btn-primary" style="margin-top:10px; padding:6px; font-size:12px; width:100%;" onclick="event.stopPropagation(); window.sendFriendRequest('${u.uid}', '${u.name}')">➕ İstek Gönder</button>
                    </div>
                `;
            }
        });
        
        document.getElementById('home-users-grid').innerHTML = usersHtml || '<p style="text-align:center; font-size:13px; color:#9ca3af; grid-column: 1 / -1;">Kullanıcı bulunamadı.</p>';
    } catch(e) { 
        document.getElementById('home-users-grid').innerHTML = '<p style="text-align:center; color:red; grid-column: 1 / -1;">Hata oluştu.</p>'; 
    }
};

// ============================================================================
// 5. LIGHTBOX (TAM EKRAN FOTOĞRAF GALERİSİ)
// ============================================================================

window.currentLightboxImages = []; 
window.currentLightboxIndex = 0;

window.openLightbox = function(imagesJsonStr, index) { 
    window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr)); 
    window.currentLightboxIndex = index; 
    window.updateLightboxView(); 
    document.getElementById('lightbox').classList.add('active'); 
};

window.closeLightbox = function() { 
    document.getElementById('lightbox').classList.remove('active'); 
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

// ============================================================================
// 6. İLAN YÖNETİMİ (MARKET) - TEK MESAJ SINIRI
// ============================================================================

window.sendMarketMessage = async function(sellerId, sellerName, itemTitle, listingId) {
    try {
        const myUid = auth.currentUser.uid;
        const msgText = `Merhaba, "${itemTitle}" başlıklı ilanınızla ilgileniyorum. Durumu nedir?`;
        
        await addDoc(collection(db, "chats"), {
            participants: [myUid, sellerId],
            participantNames: { [myUid]: window.userProfile.name, [sellerId]: sellerName },
            participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [sellerId]: "👤" },
            lastUpdated: serverTimestamp(), 
            status: 'pending', 
            initiator: myUid, 
            isMarketChat: true, 
            listingId: listingId,
            messages: [{ senderId: myUid, text: msgText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
        });
        
        alert("Satıcıya mesaj isteği başarıyla gönderildi!");
        window.loadPage('messages');
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
            <input type="text" id="local-search-input" class="local-search-bar" placeholder="Ara...">
            <div class="market-grid" id="listings-grid-container"></div>
        </div>
    `;
    mainContent.innerHTML = html;
    window.drawListingsGrid(type, '');
    
    const searchInput = document.getElementById('local-search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => { 
            window.drawListingsGrid(type, e.target.value.toLowerCase()); 
        }); 
    }
};

window.drawListingsGrid = function(type, filterText) {
    const container = document.getElementById('listings-grid-container');
    const filteredData = marketDB.filter(item => 
        item.type === type && (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText))
    );
    
    if(filteredData.length === 0) { 
        container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok.</p>`; 
        return; 
    }

    let gridHtml = '';
    filteredData.forEach(item => {
        let imgHtml = item.imgUrl 
            ? `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">` 
            : `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#F9FAFB;">📦</div>`;
        
        gridHtml += `
            <div class="item-card" onclick="window.openListingDetail('${item.id}')">
                <div class="item-img-large">${imgHtml}</div>
                <div class="item-details">
                    <div class="item-title">${item.title}</div>
                    <div class="item-price-large">${item.price} ${item.currency || '₺'}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = gridHtml;
};

window.openListingDetail = function(docId) {
    const item = marketDB.find(i => i.id === docId);
    if(!item) return;

    let imgHtml = item.imgUrl 
        ? `<img src="${item.imgUrl}" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([item.imgUrl]))}', 0)" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">` 
        : '';
        
    let actionButtonsHtml = '';
    const currentUid = window.userProfile.uid;
    const safeTitle = item.title.replace(/'/g, "\\'"); 
    
    // GÜNCELLEME: Bu spesifik ilana (listingId) önceden mesaj atılmış mı?
    const hasMessagedBefore = chatsDB.find(c => c.otherUid === item.sellerId && c.listingId === item.id);

    if (item.sellerId === currentUid) {
         actionButtonsHtml = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="action-btn" style="flex:1;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                <button class="btn-danger" style="flex:1;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
            </div>
         `;
    } else if (hasMessagedBefore) {
         actionButtonsHtml = `
            <button class="btn-primary" disabled style="margin-top: 20px; width:100%; padding:12px; background:#9CA3AF; cursor:not-allowed;">
                ✅ Bu İlan İçin Mesaj Gönderildi
            </button>
         `;
    } else {
         actionButtonsHtml = `
            <button class="btn-primary" style="margin-top: 20px; width:100%; padding:12px;" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', '${item.id}'); window.closeModal();">
                💬 İlan Hakkında Mesaj Gönder
            </button>
         `;
    }

    window.openModal(item.title, `
        ${imgHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:24px; font-weight:800; color:#059669;">${item.price} ${item.currency || '₺'}</div>
            <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div>
        </div>
        <div style="font-size:15px; line-height:1.6; background:#F9FAFB; padding:16px; border-radius:12px; border:1px solid #E5E7EB;">
            ${item.desc}
        </div>
        ${actionButtonsHtml}
    `);
};

window.deleteListing = async function(docId) { 
    if(confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) { 
        await deleteDoc(doc(db, "listings", docId)); 
        alert("İlan başarıyla silindi."); 
        window.closeModal();
    } 
};

window.editListing = async function(docId, oldTitle, oldPrice) { 
    let newPrice = prompt(`Yeni fiyat:`, oldPrice); 
    if(newPrice) {
        await updateDoc(doc(db, "listings", docId), { price: newPrice }); 
        alert("Fiyat güncellendi!");
        window.closeModal();
    }
};

window.openListingForm = function(type) { 
    window.openModal('Yeni İlan Ekle', `
        <div class="form-group">
            <input type="text" id="new-item-title" placeholder="İlan Başlığı">
        </div>
        <div class="form-group">
            <input type="number" id="new-item-price" placeholder="Fiyat (Sadece Rakam)">
        </div>
        <div class="form-group">
            <textarea id="new-item-desc" rows="3" placeholder="Açıklama ve Ürün Durumu"></textarea>
        </div>
        <button class="btn-primary" style="width:100%; padding:14px; border-radius:12px;" onclick="window.submitListing('${type}')">
            İlanı Yayınla
        </button>
    `); 
};

window.submitListing = async function(type) {
    const title = document.getElementById('new-item-title').value.trim();
    const price = document.getElementById('new-item-price').value.trim();
    const desc = document.getElementById('new-item-desc').value.trim();
    
    if (title === "" || price === "" || desc === "") {
        return alert("Lütfen tüm alanları doldurun.");
    }
    
    await addDoc(collection(db, "listings"), { 
        type: type, 
        title: title, 
        price: price, 
        currency: "₺", 
        desc: desc, 
        imgUrls: [], 
        imgUrl: "", 
        sellerId: window.userProfile.uid, 
        sellerName: window.userProfile.name + " " + window.userProfile.surname, 
        createdAt: serverTimestamp() 
    });
    
    window.closeModal(); 
    alert("İlanınız başarıyla yayınlandı!");
};


// ============================================================================
// 7. BİLDİRİMLER (KOMPAKT ŞABLON) VE MESAJLAŞMA
// ============================================================================

window.renderNotifications = function() {
    const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
    let html = `
        <div class="card">
            <h2 style="margin-bottom: 20px; display:flex; align-items:center;">
                <button onclick="window.loadPage('home')" style="background:none; border:none; font-size:20px; padding-right:10px; cursor:pointer;">←</button>
                🔔 Bildirimler ve İstekler
            </h2>
    `;
    
    if (incomingRequests.length === 0) {
        html += `<p style="text-align:center; color:var(--text-gray); padding: 40px 0;">Henüz bekleyen bir bildiriminiz yok.</p>`;
    } else {
        html += `<div class="notif-compact-panel">`;
        
        incomingRequests.forEach(req => {
            let avatarHtml = req.avatar.startsWith('http') 
                ? `<img src="${req.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
                : `<div style="width:40px; height:40px; border-radius:50%; background:#E5E7EB; display:flex; align-items:center; justify-content:center; font-size:20px;">${req.avatar}</div>`;
                
            const typeStr = req.isMarketChat ? "İlan İsteği / Mesaj" : "Arkadaşlık İsteği";

            html += `
                <div class="notif-compact-item">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${avatarHtml}
                        <div>
                            <strong style="font-size:14px; color:#111827;">${req.name}</strong>
                            <div style="font-size:11px; color:var(--primary); font-weight:bold;">${typeStr}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button style="background:#10B981; color:white; border:none; padding:8px 12px; border-radius:8px; font-size:12px; cursor:pointer;" onclick="window.acceptRequest('${req.id}', '${req.name}')">✅ Kabul</button>
                        <button style="background:#EF4444; color:white; border:none; padding:8px 12px; border-radius:8px; font-size:12px; cursor:pointer;" onclick="window.rejectRequest('${req.id}')">❌ Red</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    mainContent.innerHTML = html;
};

window.acceptRequest = async function(chatId, otherName) {
    try {
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        // Karşı tarafa 'kabul etti' bildirimi mesajlar sekmesine düşecek
        await updateDoc(doc(db, "chats", chatId), {
            status: 'accepted',
            messages: arrayUnion({ senderId: "system", text: `${window.userProfile.name} isteğini kabul etti! 🎉`, time: timeStr, read: false }),
            lastUpdated: serverTimestamp()
        });
        alert(`${otherName} ile bağlantı kuruldu!`);
        window.renderNotifications(); 
    } catch(error) { 
        alert("Hata oluştu: " + error.message); 
    }
};

window.rejectRequest = async function(chatId) {
    try { 
        await deleteDoc(doc(db, "chats", chatId)); 
        window.renderNotifications(); 
    } catch(error) {}
};

window.renderMessagesSidebarOnly = function() {
    const sidebar = document.querySelector('.chat-sidebar');
    if(!sidebar) return;
    
    // GÜNCELLEME: Sadece 'accepted' olanlar veya 'Market' isteği gönderilmiş olanlar görünür. 
    // Arkadaşlık isteği bekleyenler burada gizlenir.
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid && c.isMarketChat));
    
    let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10; padding:15px; border-bottom:1px solid var(--border-color); font-weight:bold;">Mesajlarım</div>`;
    
    if (visibleChats.length === 0) {
        html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Aktif mesajınız bulunmuyor.</p>`;
    }

    visibleChats.forEach(chat => {
        const lastMsgObj = chat.messages[chat.messages.length - 1];
        let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
        const isActive = chat.id === currentChatId ? 'active' : '';
        const previewMsg = rawLastMsg.replace(/<br>/g, ' ').substring(0, 35) + "...";

        let avatarHtml = chat.avatar.startsWith('http') 
            ? `<img src="${chat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
            : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${chat.avatar}</div>`;

        html += `
            <div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')" style="padding:15px; border-bottom:1px solid #E5E7EB; display:flex; gap:10px; cursor:pointer;">
                ${avatarHtml}
                <div class="chat-contact-info" style="flex:1;">
                    <div class="chat-contact-top" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span class="chat-contact-name" style="font-weight:bold; font-size:14px; color:#111827;">${chat.name}</span>
                        <span class="chat-contact-time" style="font-size:11px; color:#9CA3AF;">${lastMsgObj ? lastMsgObj.time : ""}</span>
                    </div>
                    <div class="chat-contact-last" style="font-size:13px; color:#6B7280;">${previewMsg}</div>
                </div>
            </div>
        `;
    });
    sidebar.innerHTML = html;
};

window.renderMessages = function() {
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
};

window.openChatView = function(chatId) {
    currentChatId = chatId;
    const activeChat = chatsDB.find(c => c.id === chatId);
    if(!activeChat) return;

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
                <div class="chat-header-name" style="font-weight:bold; font-size:16px;">${activeChat.name}</div>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages-scroll" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column;"></div>
    `;
    
    if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
         chatHTML += `
            <div style="padding: 20px; text-align: center; color: var(--text-gray); background: white; font-weight:bold; border-top: 1px solid #E5E7EB;">
                ⏳ Karşı tarafın mesaj isteğini kabul etmesi bekleniyor...
            </div>
         `;
    } else {
         chatHTML += `
            <div class="chat-input-area" style="padding:15px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:10px;">
                <div class="chat-input-wrapper" style="flex:1;">
                    <input type="text" id="chat-input-field" placeholder="Bir mesaj yazın..." style="width:100%; padding:12px; border-radius:20px; border:1px solid #D1D5DB; background:#F9FAFB; outline:none;" onkeypress="if(event.key==='Enter') window.sendMsg('${chatId}')">
                </div>
                <button class="chat-send-btn" onclick="window.sendMsg('${chatId}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:44px; height:44px; cursor:pointer;">➤</button>
            </div>
        `;
    }
    
    container.innerHTML = chatHTML;
    window.updateChatMessagesOnly(chatId); 
};

window.updateChatMessagesOnly = function(chatId) {
    const activeChat = chatsDB.find(c => c.id === chatId);
    if(!activeChat) return;
    
    const scrollBox = document.getElementById('chat-messages-scroll');
    if(!scrollBox) return; 
    
    let chatHTML = '';
    activeChat.messages.forEach(msg => { 
        if(msg.senderId === 'system') {
            chatHTML += `
                <div style="align-self:center; background:#FEF3C7; color:#92400E; font-size:12px; padding:6px 12px; border-radius:12px; margin-bottom:10px;">
                    ${msg.text}
                </div>
            `;
        } else {
            const isSent = msg.senderId === window.userProfile.uid;
            const align = isSent ? 'align-self:flex-end; background:var(--primary); color:white;' : 'align-self:flex-start; background:white; border:1px solid #e5e7eb;';
            chatHTML += `
                <div style="padding:10px 15px; border-radius:15px; max-width:75%; margin-bottom:10px; ${align}">
                    ${msg.text}
                    <div style="font-size:9px; opacity:0.7; text-align:right; margin-top:4px;">${msg.time}</div>
                </div>
            `; 
        }
    });
    
    scrollBox.innerHTML = chatHTML;
    scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.sendMsg = async function(chatId) {
    const input = document.getElementById('chat-input-field');
    if(input && input.value.trim() !== '') {
        const text = input.value.trim(); 
        input.value = ''; 
        
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({ senderId: window.userProfile.uid, text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }), 
            lastUpdated: serverTimestamp() 
        });
    }
};

// ============================================================================
// 8. KAMPÜS AKIŞI (FEED) & YORUMLAR (EKSİKSİZ)
// ============================================================================

window.renderConfessions = function() {
    mainContent.innerHTML = `
        <div class="feed-layout-container">
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 20px; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10;">
                <h2 style="margin:0; font-size: 20px; font-weight: 800;">📸 Kampüs Akışı</h2>
                <button class="btn-primary" style="width:auto; padding: 8px 16px; border-radius: 20px; font-size: 14px;" onclick="window.openConfessionForm()">+ Gönderi</button>
            </div>
            <div class="confessions-feed" id="conf-feed"></div>
        </div>
    `;
    window.drawConfessionsFeed();
};

window.openConfessionForm = function() {
    window.openModal('Yeni Gönderi Oluştur', `
        <textarea id="new-conf-text" class="form-group" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:16px; outline:none; border: 1px solid #E5E7EB; resize:none;" placeholder="Aklından ne geçiyor?"></textarea>
        <button class="btn-primary" onclick="window.submitConfession()" style="width:100%; padding:14px; font-size:16px; border-radius:12px; font-weight:bold; margin-top:10px;">Yayınla</button>
    `);
};

window.submitConfession = async function() {
    const textEl = document.getElementById('new-conf-text');
    if(!textEl || textEl.value.trim() === '') return;
    
    try {
        await addDoc(collection(db, "confessions"), {
            authorId: window.userProfile.uid, 
            avatar: window.userProfile.avatarUrl || window.userProfile.avatar, 
            user: window.userProfile.name, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
            text: textEl.value.trim(), 
            imgUrl: "", 
            comments: [], 
            createdAt: serverTimestamp()
        });
        window.closeModal(); 
    } catch(e) { 
        alert("Hata oluştu: " + e.message); 
    }
};

window.deleteConfession = async function(docId) {
    if(confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
        try { 
            await deleteDoc(doc(db, "confessions", docId)); 
            if(document.getElementById('app-modal').classList.contains('active')) window.closeModal();
        } 
        catch(e) { alert("Hata oluştu: " + e.message); }
    }
};

window.drawConfessionsFeed = function() {
    const feed = document.getElementById('conf-feed');
    if(!feed) return;
    
    if(confessionsDB.length === 0) { 
        feed.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding: 40px;">Henüz gönderi yok. İlk gönderiyi sen paylaş!</div>`; 
        return; 
    }

    let html = '<div style="display:flex; flex-direction:column;">';
    confessionsDB.forEach((post) => {
        let avatarHtml = post.avatar.startsWith('http') 
            ? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` 
            : `<div style="width:44px; height:44px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:24px;">${post.avatar}</div>`;
        
        let deleteBtnHtml = '';
        if (post.authorId === window.userProfile.uid) {
            deleteBtnHtml = `<button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">🗑️ Sil</button>`;
        }
        
        const commentCount = post.comments ? post.comments.length : 0;

        html += `
        <div class="feed-post">
            <div class="feed-post-header">
                <div class="feed-post-avatar">${avatarHtml}</div>
                <div class="feed-post-meta">
                    <span class="feed-post-author">${post.user}</span>
                    <span class="feed-post-time">${post.time}</span>
                </div>
            </div>
            <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div>
            <div class="feed-post-actions">
                <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">💬 Yorumlar (${commentCount})</button>
                ${deleteBtnHtml}
            </div>
        </div>`;
    });
    
    feed.innerHTML = html + '</div>';
};

window.openConfessionDetail = function(docId) {
    window.openModal('Gönderi Detayı', `<div id="confession-detail-container">Yükleniyor...</div>`);
    window.updateConfessionDetailLive(docId);
    const container = document.getElementById('confession-detail-container');
    if(container) container.insertAdjacentHTML('afterend', `<input type="hidden" id="active-post-id" value="${docId}">`);
};

window.updateConfessionDetailLive = function(docId) {
    const container = document.getElementById('confession-detail-container');
    if(!container) return;

    const post = confessionsDB.find(p => p.id === docId);
    if(!post) { container.innerHTML = "Gönderi bulunamadı veya silinmiş."; return; }
    
    let commentsHtml = '';
    const commentsArray = post.comments || [];
    
    if(commentsArray.length === 0) {
        commentsHtml = '<p style="text-align:center; padding:15px; color:var(--text-gray); font-size:14px;">Henüz yorum yok. İlk yorumu sen yap!</p>';
    } else {
        commentsArray.forEach(c => {
            commentsHtml += `
                <div style="padding:14px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border-color); background:#F9FAFB;">
                    <div style="font-weight:800; color:var(--text-dark); margin-bottom:6px; font-size:14px;">${c.user}</div>
                    <div style="font-size:14px; color:var(--text-dark); line-height:1.4;">${c.text}</div>
                </div>
            `;
        });
    }

    let avatarHtml = post.avatar.startsWith('http') 
        ? `<img src="${post.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">` 
        : `<div style="width:48px; height:48px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:24px;">${post.avatar}</div>`;

    container.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                ${avatarHtml}
                <div>
                    <div style="font-weight:bold; font-size:16px;">${post.user}</div>
                    <div style="font-size:12px; color:var(--text-gray);">${post.time}</div>
                </div>
            </div>
            <div style="font-size:16px; margin-bottom:16px; line-height:1.6; color:var(--text-dark);">${post.text.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-bottom:16px;">
            <h4 style="margin-bottom:12px; font-size:15px; font-weight:bold;">Yorumlar (${commentsArray.length})</h4>
            <div class="answers-container" style="max-height: 250px; overflow-y: auto; padding-right:5px;" id="conf-comments-scroll">${commentsHtml}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center; background:#fff; padding:10px; border-radius:12px; border:1px solid var(--border-color);">
            <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:15px; color:var(--text-dark);" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')">
            <button class="btn-primary" style="width:auto; padding:8px 16px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button>
        </div>
    `;
    
    setTimeout(() => {
        const scrollBox = document.getElementById('conf-comments-scroll');
        if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
    }, 50);
};

window.submitConfessionComment = async function(docId) {
    const input = document.getElementById('new-conf-comment');
    if(!input || input.value.trim() === '') return;

    const text = input.value.trim();
    input.value = ''; 

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
        alert("Yorum gönderilemedi: " + e.message);
    }
};

// ============================================================================
// 9. PROFİL KARTI, FOTOĞRAF YÜKLEME VE ARKADAŞLAR
// ============================================================================

window.renderProfile = function() {
    const u = window.userProfile;
    let avatarHtml = u.avatarUrl 
        ? `<img src="${u.avatarUrl}" class="pc-avatar" style="width:100px; height:100px;">` 
        : `<div class="pc-avatar" style="width:100px; height:100px; display:flex; align-items:center; justify-content:center; font-size:40px;">${u.avatar || '👤'}</div>`;
        
    const tagsHtml = (u.interests || []).map(i => {
        const textOnly = i.includes(' ') ? i.split(' ')[1] : i;
        return `<span class="pc-tag">${textOnly}</span>`;
    }).join('');

    mainContent.innerHTML = `
        <div class="card" style="padding:20px; min-height: calc(100vh - 120px);">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h2 style="margin:0;">Profilin</h2>
                <button onclick="window.renderSettings()" style="background:none; border:none; font-size:24px; cursor:pointer;" title="Ayarlar">⚙️</button>
            </div>
            
            <div class="profile-card-preview" style="flex-direction:column; text-align:center; background:#fff; border:2px solid var(--primary); position:relative;">
                
                <div style="position:relative; display:inline-block; margin-bottom:10px;">
                    ${avatarHtml}
                    <button onclick="document.getElementById('profile-avatar-upload-input').click()" style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:14px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</button>
                    <input type="file" id="profile-avatar-upload-input" accept="image/*" style="display:none;" onchange="window.uploadProfileAvatar(event)">
                </div>
                
                <div class="pc-info" style="text-align:center;">
                    <div class="pc-name" style="font-size:22px; margin-bottom:5px;">${u.name} ${u.surname}</div>
                    <div class="pc-sub" style="font-size:14px;">${u.age || '?'} Yaşında • ${u.grade || '?'} Sınıf</div>
                    <div class="pc-sub" style="color:var(--primary); font-size:14px; margin-top:5px; margin-bottom:10px; font-weight:bold;">${u.faculty || 'Bölüm Belirtilmemiş'}</div>
                    <div class="pc-tags" style="justify-content:center;">${tagsHtml}</div>
                </div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom: 25px;">
                <button class="btn-primary" style="flex:1; padding:10px;" onclick="window.editProfile()">✏️ Düzenle</button>
                <button class="action-btn" style="flex:1; padding:10px;" onclick="window.loadPage('friends')">👥 Arkadaşlar</button>
            </div>
            
            <div style="background:#F9FAFB; padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid #E5E7EB;">
                <strong style="color:#6b7280; font-size:13px; text-transform:uppercase;">Hakkımda / Amacım:</strong><br>
                <p style="font-size:15px; color:#111827; margin-top:8px; line-height:1.5;">${u.bio || 'Henüz eklenmedi. Profilini düzenleyerek kendinden bahsedebilirsin.'}</p>
            </div>
        </div>
    `;
};

window.uploadProfileAvatar = async function(event) {
    const file = event.target.files[0];
    if(!file) return;

    // Yükleniyor durumunu göstermek için fotoğrafı değiştirelim
    const imgContainer = event.target.previousElementSibling.previousElementSibling;
    const oldHtml = imgContainer.innerHTML;
    imgContainer.innerHTML = `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px;">⏳</div>`;
    
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
        alert("Fotoğraf yüklenirken hata oluştu: " + e.message);
        window.renderProfile(); // Hata olursa eski haline dönsün
    }
};

window.editProfile = function() {
    const u = window.userProfile;
    window.openModal('Profili Düzenle', `
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:#6b7280;">Fakülte</label>
            <input type="text" id="edit-faculty" value="${u.faculty || ''}" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; margin-top:5px;">
        </div>
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:#6b7280;">Yaş</label>
            <input type="number" id="edit-age" value="${u.age || ''}" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; margin-top:5px;">
        </div>
        <div class="form-group">
            <label style="font-weight:bold; font-size:13px; color:#6b7280;">Biyografi</label>
            <textarea id="edit-bio" rows="4" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; margin-top:5px;">${u.bio || ''}</textarea>
        </div>
        <button class="btn-primary" style="width:100%; padding:14px; border-radius:12px; margin-top:10px; font-weight:bold;" onclick="window.saveProfileInfo()">💾 Değişiklikleri Kaydet</button>
    `);
};

window.saveProfileInfo = async function() {
    const faculty = document.getElementById('edit-faculty').value.trim();
    const age = document.getElementById('edit-age').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    
    try {
        await updateDoc(doc(db, "users", window.userProfile.uid), { 
            faculty: faculty, 
            age: age, 
            bio: bio 
        });
        
        window.userProfile.faculty = faculty; 
        window.userProfile.age = age; 
        window.userProfile.bio = bio;
        
        window.closeModal(); 
        window.renderProfile();
    } catch(e) { 
        alert("Hata oluştu: " + e.message); 
    }
};

window.renderFriends = function() {
    const acceptedFriends = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat);
    let html = `
        <div class="card" style="min-height:calc(100vh - 120px);">
            <h2 style="margin-bottom:20px; display:flex; align-items:center;">
                <button onclick="window.renderProfile()" style="background:none; border:none; font-size:20px; margin-right:10px; cursor:pointer;">←</button> 
                Arkadaşlarım
            </h2>
    `;
    
    if (acceptedFriends.length === 0) {
        html += `<div style="text-align:center; padding:40px; color:#9CA3AF;">Henüz ekli arkadaşınız yok.</div>`;
    } else {
        html += `<div class="user-grid">`;
        acceptedFriends.forEach(f => {
            let avatarHtml = f.avatar.startsWith('http') 
                ? `<img src="${f.avatar}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">` 
                : `<div style="width:60px; height:60px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:25px;">${f.avatar}</div>`;
            
            html += `
                <div class="user-card" onclick="window.openChatViewDirect('${f.id}')">
                    <div style="margin-bottom:10px;">${avatarHtml}</div>
                    <div style="font-weight:bold; font-size:14px; margin-bottom:10px; color:#111827;">${f.name}</div>
                    <button class="btn-primary" style="width:100%; padding:8px; font-size:12px; border-radius:8px;">💬 Mesaj At</button>
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

window.renderSettings = function() {
    window.openModal('⚙️ Ayarlar', `
        <button class="btn-danger" style="width:100%; padding:14px; border-radius:12px; font-weight:bold;" onclick="window.logout(); window.closeModal();">
            🚪 Güvenli Çıkış Yap
        </button>
    `);
};

// ============================================================================
// 10. ROUTER (SAYFA YÖNLENDİRİCİSİ) VE BAŞLATICI
// ============================================================================

window.loadPage = function(page) {
    document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
    const activeNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
    if(activeNav) activeNav.classList.add('active');

    mainContent.innerHTML = '';
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

} // initializeUniLoop fonksiyonunun sonu

document.addEventListener("DOMContentLoaded", () => { 
    initializeUniLoop(); 
});

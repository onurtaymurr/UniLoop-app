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
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", bio: "", avatarUrl: "", age: "", isPremium: false,
    instagram: "", department: "", grade: "", interests: [], purpose: "", onboardingComplete: false
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

// ONBOARDING GEÇİCİ VERİLERİ
window.tempOnboardingData = {
    age: "", instagram: "", faculty: "", department: "", grade: "", interests: [], purpose: "", avatarUrl: ""
};

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
    #sidebar { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; overscroll-behavior: contain; justify-content: flex-start !important; align-items: stretch !important; max-height: 100vh !important; top: 0 !important; padding-top: 75px !important; padding-bottom: 40px !important; }
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
    .user-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; width: 100%; }
    .user-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; justify-content: flex-start; min-height: 160px; overflow: hidden;}
    .user-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); border-color: var(--primary); }
    .user-card-interests { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; width: 100%; }
    .user-card-interest-tag { background: #EEF2FF; color: var(--primary); font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: bold; }
    .cropper-view-box, .cropper-face { border-radius: 50%; }
    .cropper-view-box { outline: 0; box-shadow: 0 0 0 1px #39f; }
    .premium-glow { animation: glowPulse 2s infinite alternate; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); } }
    .premium-upgrade-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 8px; }
    .premium-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }
    
    /* MOBILE BOTTOM NAV BAR CSS */
    .mobile-bottom-nav { display: none; }
    @media (max-width: 1024px) {
        #sidebar { display: none !important; }
        .mobile-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; border-top: 1px solid #E5E7EB; z-index: 9990; justify-content: space-around; align-items: center; padding: 12px 0; padding-bottom: calc(12px + env(safe-area-inset-bottom)); box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
        .nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; color: #6B7280; gap: 4px; text-decoration: none; width: 20%; cursor: pointer; transition: 0.2s; }
        .nav-item i { font-size: 22px; font-style: normal; margin-bottom: 2px; }
        .nav-item.active { color: var(--primary); font-weight: bold; }
        .nav-item.active i { transform: scale(1.1); }
        #main-content { padding-bottom: 80px !important; }
    }

    /* HORIZONTAL SCROLL FOR REQUESTS */
    .horizontal-scroll-container { display: flex; overflow-x: auto; gap: 15px; padding: 10px 0; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
    .horizontal-scroll-container::-webkit-scrollbar { display: none; }
    .request-card { flex: 0 0 280px; scroll-snap-align: start; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }

    /* ONBOARDING PILLS */
    .interest-pill { padding: 8px 16px; background: #F3F4F6; color: #4B5563; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; user-select: none; }
    .interest-pill.selected { background: #EEF2FF; color: var(--primary); border: 2px solid var(--primary); }
    .purpose-radio { display: block; padding: 12px 16px; background: #F3F4F6; color: #4B5563; border-radius: 12px; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 10px; border: 2px solid transparent; transition: 0.2s; text-align: center; }
    .purpose-radio.selected { background: #EEF2FF; color: var(--primary); border: 2px solid var(--primary); }

    /* DARK MODE */
    body.dark-mode, .dark-mode #main-content { background-color: #121212 !important; color: #e5e7eb !important; }
    .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card, .dark-mode .request-card { background-color: #1e1e1e !important; border-color: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .card > div { border-color: #374151 !important; }
    .dark-mode .feed-post-author, .dark-mode .feed-post-text, .dark-mode h2, .dark-mode label, .dark-mode .item-title { color: #e5e7eb !important; }
    .dark-mode .feed-layout-container, .dark-mode #conf-feed { background-color: #121212 !important; }
    .dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #374151 !important; color: #e5e7eb !important; border-color: #4b5563 !important; }
    .dark-mode .feed-post-avatar, .dark-mode .avatar { background-color: #374151 !important; border-color: #4b5563 !important; }
    .dark-mode .feed-action-btn:hover { background: #374151 !important; }
    .dark-mode .chat-contact:hover { background: #374151 !important; }
    .dark-mode .chat-input-wrapper input { background: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .modal-content { background-color: #1e1e1e !important; color: #e5e7eb !important; border-color: #374151 !important;}
    .dark-mode .menu-item { color: #9ca3af; }
    .dark-mode .menu-item.active { background: #374151 !important; color: var(--primary) !important; }
    .dark-mode #app-header { background: #1e1e1e !important; border-bottom-color: #374151 !important; }
    .dark-mode #sidebar { background: #1e1e1e !important; border-right-color: #374151 !important; }
    .dark-mode .mobile-bottom-nav { background: #1e1e1e !important; border-top-color: #374151 !important; }
    .dark-mode .nav-item { color: #9ca3af; }
    .dark-mode .nav-item.active { color: var(--primary); }
    .dark-mode .interest-pill { background: #374151; color: #e5e7eb; }
    .dark-mode .purpose-radio { background: #374151; color: #e5e7eb; }

    #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
    #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
    #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; }
    #profile-btn, #nav-premium-action { font-size: 12px !important; padding: 0 10px !important; height: 32px !important; line-height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: nowrap !important; flex-shrink: 0 !important; margin: 0 !important; border-radius: 8px !important; }
    
    .accordion-section { margin-bottom: 12px; background: transparent; }
    .accordion-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 14px 16px; font-weight: bold; font-size: 15px; transition: 0.2s; color: var(--text-dark);}
    .accordion-header:hover { background: #EEF2FF; color: var(--primary); border-radius: 12px; }
    .accordion-content { max-height: 0; overflow: hidden; padding: 0 16px; background: transparent; transition: max-height 0.3s ease, padding 0.3s ease; }
    .accordion-content.open { max-height: 600px; padding: 10px 16px; }
    .accordion-icon { display: inline-block; margin-left: auto; font-size: 12px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: var(--text-gray); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
`;
document.head.appendChild(styleFix);

// MOBIL ALT NAVİGASYON HTML ENJEKSİYONU
if(!document.getElementById('mobile-bottom-nav-container')) {
    const bottomNav = document.createElement('div');
    bottomNav.id = 'mobile-bottom-nav-container';
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.innerHTML = `
        <div class="nav-item active" data-target="home" onclick="window.navMobileClick(this, 'home')"><i>🏠</i><span>Ana Sayfa</span></div>
        <div class="nav-item" data-target="confessions" onclick="window.navMobileClick(this, 'confessions')"><i>👻</i><span>Kampüs</span></div>
        <div class="nav-item" data-target="messages" onclick="window.navMobileClick(this, 'messages')"><i>💬</i><span>Mesajlar</span><span id="nav-badge-mobile" style="display:none; position:absolute; top:5px; margin-left:15px; background:#EF4444; width:10px; height:10px; border-radius:50%;"></span></div>
        <div class="nav-item" data-target="faculties" onclick="window.navMobileClick(this, 'faculties')"><i>🏢</i><span>Fakülte</span></div>
        <div class="nav-item" data-target="profile" onclick="window.navMobileClick(this, 'profile')"><i>👤</i><span>Profil</span></div>
    `;
    document.body.appendChild(bottomNav);
}

window.navMobileClick = function(el, target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    const dskp = document.querySelector(`.menu-item[data-target="${target}"]`);
    if(dskp) dskp.classList.add('active');
    
    if(target === 'faculties') {
        if(window.userProfile.faculty) {
            // Eğer fakültesi varsa direkt oraya at
            window.handleFacultyClick(window.userProfile.faculty, "🏢", "linear-gradient(135deg, #3B82F6, #1D4ED8)");
        } else {
            alert("Lütfen profilinizden bir fakülte seçin veya bilgisayar sürümünden tüm fakültelere göz atın.");
        }
    } else {
        window.loadPage(target);
    }
};

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

const closeSidebarIfOutside = (e) => {
    const sidebar = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && (!mobileBtn || !mobileBtn.contains(e.target))) {
            sidebar.classList.remove('open');
        }
    }
};
document.addEventListener('click', closeSidebarIfOutside);
document.addEventListener('touchstart', closeSidebarIfOutside, {passive: true});

const bind = (id, event, callback) => { 
    const el = document.getElementById(id); 
    if (el) { el.addEventListener(event, callback); }
};

// ============================================================================
// 🌟 HTML YAPI ENTEGRASYONU: MENÜ DÜZENLEME VE "BANA ÖZEL" SIRALAMASI
// ============================================================================
window.renderSidebarAccordions = function() {
    const sidebarContainer = document.getElementById('sidebar-networks-container');
    const rightContainer = document.getElementById('right-networks-container');
    
    const accordionHTML = `
        <div id="bana-ozel-container"></div>
        <div class="accordion-section" style="margin-top: 15px;">
            <div class="accordion-header menu-item" style="padding:12px 15px; margin-bottom:5px; border-radius:12px;">
                <span>🏢 Tüm Fakülteler</span>
                <span class="accordion-icon">▶</span>
            </div>
            <div class="accordion-content">
                <div class="menu-item community-link" data-name="Tıp Fakültesi" data-icon="🩺" data-color="linear-gradient(135deg, #EF4444, #B91C1C)">🩺 Tıp Fakültesi</div>
                <div class="menu-item community-link" data-name="Diş Hekimliği Fakültesi" data-icon="🦷" data-color="linear-gradient(135deg, #06B6D4, #0891B2)">🦷 Diş Fakültesi</div>
                <div class="menu-item community-link" data-name="Bilgisayar Fakültesi" data-icon="💻" data-color="linear-gradient(135deg, #3B82F6, #1D4ED8)">💻 Bilgisayar Fakültesi</div>
                <div class="menu-item community-link" data-name="Eczacılık Fakültesi" data-icon="💊" data-color="linear-gradient(135deg, #10B981, #047857)">💊 Eczacılık Fakültesi</div>
                <div class="menu-item community-link" data-name="Hukuk Fakültesi" data-icon="⚖️" data-color="linear-gradient(135deg, #8B5CF6, #6D28D9)">⚖️ Hukuk Fakültesi</div>
            </div>
        </div>
    `;
    
    if(sidebarContainer) sidebarContainer.innerHTML = accordionHTML;
    if(rightContainer) rightContainer.innerHTML = accordionHTML;

    window.updateMyFacultiesSidebar();
};

window.updateMyFacultiesSidebar = function() {
    const container = document.getElementById('bana-ozel-container');
    if(!container) return;
    
    const origMsgBtn = document.getElementById('nav-messages-btn');
    const origNotifBtn = document.getElementById('nav-notifications-btn');
    if(origMsgBtn && origMsgBtn.parentElement !== container) origMsgBtn.remove();
    if(origNotifBtn && origNotifBtn.parentElement !== container) origNotifBtn.remove();

    let html = ``;
    
    if(window.userProfile && window.userProfile.faculty) {
        html += `
            <div class="menu-item community-link" data-name="${window.userProfile.faculty}">
                📌 ${window.userProfile.faculty}
            </div>
        `;
    }
    
    html += `
        <div class="menu-item" id="nav-messages-btn" data-target="messages" onclick="document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active')); this.classList.add('active'); window.loadPage('messages');">💬 Mesajlarım</div>
        <div class="menu-item" id="nav-profile-btn" data-target="profile" onclick="document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active')); this.classList.add('active'); window.loadPage('profile');">👤 Profilim <span id="notif-badge" class="badge" style="display:none; background:#EF4444; color:white; padding:2px 8px; border-radius:12px; font-size:11px; margin-left:auto;">0</span></div>
    `;
    
    container.innerHTML = html;
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
            isPremium: false,
            instagram: "",
            department: "",
            grade: "",
            interests: [],
            purpose: "",
            onboardingComplete: false
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
                Bu platform senin dijital kampüsün! Neler mi yapabilirsin?<br><br>
                🛒 <b>Kampüs Market:</b> İhtiyacın olmayan eşyaları sat.<br>
                📸 <b>Kampüs Akışı:</b> Düşüncelerini özgürce paylaş.<br>
                Burası senin alanın. İyi eğlenceler!
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
        window.location.reload();
    } catch(error) {
        console.error("Çıkış hatası:", error);
    }
};

// ============================================================================
// 2. OTURUM DURUMU KONTROLÜ VE ONBOARDING ENTEGRASYONU
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
                // Eski hesaplarda eksik alanları tamamla
                if(window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if(window.userProfile.onboardingComplete === undefined) window.userProfile.onboardingComplete = false;
                if(window.userProfile.interests === undefined) window.userProfile.interests = [];
            } else {
                window.userProfile = { 
                    uid: user.uid, name: "Öğrenci", surname: "", username: "",
                    email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓", faculty: "", bio: "", age: "", avatarUrl: "", 
                    isOnline: true, isPremium: false, onboardingComplete: false, interests: [], department: "", grade: "", instagram: "", purpose: ""
                };
                await setDoc(userDocRef, window.userProfile);
            }

            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            
            window.renderSidebarAccordions(); 
            initRealtimeListeners(user.uid);

            if (!window.userProfile.onboardingComplete) {
                window.startOnboardingProcess(1);
            } else {
                const activeTab = document.querySelector('.menu-item.active');
                if(typeof window.loadPage === 'function') {
                    window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); 
                }
            }
            
            if (!document.getElementById('nav-premium-action') && !window.userProfile.isPremium) {
                const profileBtn = document.getElementById('profile-btn');
                if (profileBtn) {
                    profileBtn.insertAdjacentHTML('beforebegin', `
                        <div class="menu-item premium-glow" id="nav-premium-action" style="color:#D97706; font-weight:bold; margin-right: 10px;" onclick="window.openPremiumModal()">
                            🌟 Premium
                        </div>
                    `);
                }
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

    // MARKET İLANLARI DİNLENİYOR
    onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
        marketDB = [];
        snapshot.forEach(doc => { marketDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.menu-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
    });

    // KAMPÜS AKIŞI DİNLENİYOR
    onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
        confessionsDB = [];
        snapshot.forEach(doc => { confessionsDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.menu-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'confessions') window.drawConfessionsFeed();
        if(document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
            const activePostId = document.getElementById('active-post-id').value;
            if(activePostId) window.updateConfessionDetailLive(activePostId);
        }
    });

    // MESAJLAR VE İSTEKLER DİNLENİYOR
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
                    initiator: data.initiator || null, lastUpdatedTS: safeTimestamp 
                };
                chatsDB.push(chatItem);

                if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) pendingRequestsCount++;
            } catch(err) { console.error("Hatalı mesaj belgesi es geçildi:", err); }
        });

        chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
        
        const notifBadge = document.getElementById('notif-badge');
        const mobileBadge = document.getElementById('nav-badge-mobile');
        if(notifBadge) {
            if(pendingRequestsCount > 0) { notifBadge.style.display = 'inline-block'; notifBadge.innerText = pendingRequestsCount; } 
            else { notifBadge.style.display = 'none'; }
        }
        if(mobileBadge) {
            if(pendingRequestsCount > 0) { mobileBadge.style.display = 'block'; } 
            else { mobileBadge.style.display = 'none'; }
        }

        const activeTab = document.querySelector('.menu-item.active') || document.querySelector('.nav-item.active');
        if(activeTab) {
            const target = activeTab.getAttribute('data-target');
            if(target === 'messages') {
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
            } else if (target === 'profile') {
                // Profil sayfası açıksa istekleri veya arkadaşları güncelleyebiliriz
                if(document.getElementById('profile-content-area')) window.renderProfileTab(window.currentProfileTab || 'info');
            } else if (target === 'home') {
                // Ana sayfa istekler çubuğunu güncelle
                window.renderHome();
            }
        }
    });
}

// ============================================================================
// 🌟 4 ADIMLI MODERN ONBOARDING SİSTEMİ
// ============================================================================
window.startOnboardingProcess = function(step) {
    let content = "";
    document.getElementById('app-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Arkaya tıklayıp kapatmayı engelle
    document.getElementById('app-modal').onclick = null;
    const modalContent = document.querySelector('.modal-content');
    if(modalContent) {
        modalContent.onclick = (e) => e.stopPropagation();
        // Çarpı ikonunu gizle
        const closeBtn = document.querySelector('.modal-close');
        if(closeBtn) closeBtn.style.display = 'none';
    }

    if (step === 1) {
        content = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="margin-bottom:10px;">Adım 1: Temel Bilgiler 🚀</h2>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Kampüs ağında seni daha iyi tanımamız için birkaç temel bilgiye ihtiyacımız var.</p>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px; color:var(--text-dark);">Kullanıcı Adı Seçin</label>
                    <div style="display:flex; align-items:center; background:#F9FAFB; border:1px solid #D1D5DB; border-radius:12px; overflow:hidden; margin-top:5px;">
                        <span style="padding-left:15px; color:var(--primary); font-weight:800; font-size:16px;">#</span>
                        <input type="text" id="ob-username" value="${window.userProfile.username.replace('#','')}" placeholder="kampus_adiniz" style="border:none; background:transparent; width:100%; padding:12px 10px; outline:none; font-size:15px; font-weight:bold; color:var(--text-dark);">
                    </div>
                </div>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px; color:var(--text-dark);">Yaşınız</label>
                    <input type="number" id="ob-age" placeholder="Örn: 21" value="${window.tempOnboardingData.age}" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none; font-size:15px; margin-top:5px;">
                </div>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px; color:var(--text-dark);">Instagram Kullanıcı Adı</label>
                    <div style="display:flex; align-items:center; background:#F9FAFB; border:1px solid #D1D5DB; border-radius:12px; overflow:hidden; margin-top:5px;">
                        <span style="padding-left:15px; color:#E1306C; font-weight:800; font-size:16px;">@</span>
                        <input type="text" id="ob-instagram" value="${window.tempOnboardingData.instagram}" placeholder="instagram_adiniz" style="border:none; background:transparent; width:100%; padding:12px 10px; outline:none; font-size:15px; color:var(--text-dark);">
                    </div>
                </div>
                <button class="btn-primary" style="width:100%; padding:14px; font-size:16px; border-radius:12px; margin-top:10px;" onclick="window.saveOnboardingStep(1)">Sonraki Adım ➡️</button>
            </div>
        `;
    } 
    else if (step === 2) {
        content = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="margin-bottom:10px;">Adım 2: Akademik 📚</h2>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Bölümdaşlarını ve okul arkadaşlarını bulmanı kolaylaştıralım.</p>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px;">Fakülte</label>
                    <select id="ob-faculty" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none; font-size:15px; margin-top:5px;">
                        <option value="">Fakülte Seçin...</option>
                        <option value="Mühendislik Fakültesi">Mühendislik Fakültesi</option>
                        <option value="Tıp Fakültesi">Tıp Fakültesi</option>
                        <option value="Hukuk Fakültesi">Hukuk Fakültesi</option>
                        <option value="Eğitim Fakültesi">Eğitim Fakültesi</option>
                        <option value="İletişim Fakültesi">İletişim Fakültesi</option>
                        <option value="Diş Hekimliği Fakültesi">Diş Hekimliği Fakültesi</option>
                        <option value="Mimarlık Fakültesi">Mimarlık Fakültesi</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px;">Bölüm</label>
                    <input type="text" id="ob-department" placeholder="Örn: Bilgisayar Mühendisliği" value="${window.tempOnboardingData.department}" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none; font-size:15px; margin-top:5px;">
                </div>
                <div class="form-group" style="text-align:left;">
                    <label style="font-weight:bold; font-size:14px;">Sınıf / Yıl</label>
                    <select id="ob-grade" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB; outline:none; font-size:15px; margin-top:5px;">
                        <option value="Hazırlık">Hazırlık</option><option value="1. Sınıf">1. Sınıf</option><option value="2. Sınıf">2. Sınıf</option>
                        <option value="3. Sınıf">3. Sınıf</option><option value="4. Sınıf">4. Sınıf</option><option value="Mezun">Mezun</option>
                    </select>
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-primary" style="flex:1; background:#9CA3AF; padding:14px;" onclick="window.startOnboardingProcess(1)">⬅️ Geri</button>
                    <button class="btn-primary" style="flex:2; padding:14px;" onclick="window.saveOnboardingStep(2)">Sonraki Adım ➡️</button>
                </div>
            </div>
        `;
        setTimeout(() => { 
            if(window.tempOnboardingData.faculty) document.getElementById('ob-faculty').value = window.tempOnboardingData.faculty;
            if(window.tempOnboardingData.grade) document.getElementById('ob-grade').value = window.tempOnboardingData.grade;
        }, 50);
    }
    else if (step === 3) {
        const allInterests = ["Yazılım", "Spor", "Müzik", "Sinema", "Edebiyat", "Girişimcilik", "Oyun", "Sanat", "Fotoğrafçılık", "Tasarım", "Dans", "Aşçılık", "Yabancı Dil"];
        let interestsHtml = '';
        allInterests.forEach(int => {
            const isSelected = window.tempOnboardingData.interests.includes(int) ? 'selected' : '';
            interestsHtml += `<span class="interest-pill ${isSelected}" onclick="this.classList.toggle('selected')">${int}</span>`;
        });

        content = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="margin-bottom:10px;">Adım 3: İlgi Alanları 🎨</h2>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Nelerden hoşlanırsın? Sana uygun kişileri önermemize yardımcı ol. (Çoklu seçim yapabilirsin)</p>
                <div id="ob-interests-container" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:20px;">
                    ${interestsHtml}
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-primary" style="flex:1; background:#9CA3AF; padding:14px;" onclick="window.startOnboardingProcess(2)">⬅️ Geri</button>
                    <button class="btn-primary" style="flex:2; padding:14px;" onclick="window.saveOnboardingStep(3)">Sonraki Adım ➡️</button>
                </div>
            </div>
        `;
    }
    else if (step === 4) {
        const purposes = ["Ders Arkadaşı Arıyorum", "Sosyalleşmek İstiyorum", "Sadece Gözatıyorum", "Kampüs Etkinlikleri"];
        let purposeHtml = '';
        purposes.forEach(p => {
            const isSelected = window.tempOnboardingData.purpose === p ? 'selected' : '';
            purposeHtml += `<div class="purpose-radio ${isSelected}" onclick="document.querySelectorAll('.purpose-radio').forEach(el=>el.classList.remove('selected')); this.classList.add('selected');" data-val="${p}">${p}</div>`;
        });

        content = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="margin-bottom:10px;">Adım 4: Kullanım Amacı 🎯</h2>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">UniLoop'u ağırlıklı olarak hangi amaçla kullanacaksın?</p>
                <div id="ob-purpose-container" style="text-align:left;">
                    ${purposeHtml}
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-primary" style="flex:1; background:#9CA3AF; padding:14px;" onclick="window.startOnboardingProcess(3)">⬅️ Geri</button>
                    <button class="btn-primary" style="flex:2; padding:14px;" onclick="window.saveOnboardingStep(4)">Son Adım: Fotoğraf 📸</button>
                </div>
            </div>
        `;
    }
    else if (step === 5) {
        let avatarHtml = window.tempOnboardingData.avatarUrl 
            ? `<img src="${window.tempOnboardingData.avatarUrl}" style="width:140px; height:140px; border-radius:50%; object-fit:cover; border:4px solid var(--primary);">`
            : `<div style="width:140px; height:140px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:60px; border:4px solid #E5E7EB; margin:0 auto;">${window.userProfile.avatar}</div>`;

        content = `
            <div style="text-align:center; padding: 10px;">
                <h2 style="margin-bottom:10px;">Son Adım: Profil Fotoğrafı 📸</h2>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Harika görünüyorsun! Sisteme şık bir giriş yapmak için bir fotoğraf seç.</p>
                
                <div style="position:relative; display:inline-block; margin-bottom:20px;" id="ob-avatar-preview">
                    ${avatarHtml}
                    <button onclick="document.getElementById('ob-avatar-upload').click()" style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border:none; border-radius:50%; width:44px; height:44px; cursor:pointer; font-size:20px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">➕</button>
                    <input type="file" id="ob-avatar-upload" accept="image/*" style="display:none;" onchange="window.triggerOnboardingCrop(this)">
                </div>

                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn-primary" style="flex:1; background:#9CA3AF; padding:14px;" onclick="window.startOnboardingProcess(4)">⬅️ Geri</button>
                    <button class="btn-primary" id="ob-finish-btn" style="flex:2; padding:14px; background:#10B981;" onclick="window.finishOnboarding()">🎉 Kaydı Tamamla</button>
                </div>
            </div>
        `;
    }

    document.getElementById('modal-title').innerText = "Profilini Tamamla";
    document.getElementById('modal-body').innerHTML = content;
};

window.saveOnboardingStep = async function(step) {
    if (step === 1) {
        let rawUsername = document.getElementById('ob-username').value.trim().toLowerCase();
        if(!rawUsername) { alert("Lütfen bir kullanıcı adı belirleyin!"); return; }
        
        const username = '#' + rawUsername.replace(/^#/, '');
        if(username !== window.userProfile.username) {
            try {
                const q = query(collection(db, "users"), where("username", "==", username));
                const snapshot = await getDocs(q);
                if(!snapshot.empty && snapshot.docs[0].id !== window.userProfile.uid) { 
                    alert("Bu kullanıcı adı başkası tarafından alınmış!"); return; 
                }
            } catch(e) { console.error(e); return; }
        }
        
        window.userProfile.username = username;
        window.tempOnboardingData.age = document.getElementById('ob-age').value;
        window.tempOnboardingData.instagram = document.getElementById('ob-instagram').value;
        window.startOnboardingProcess(2);
    }
    else if (step === 2) {
        const fac = document.getElementById('ob-faculty').value;
        if(!fac) { alert("Lütfen fakültenizi seçin."); return; }
        window.tempOnboardingData.faculty = fac;
        window.tempOnboardingData.department = document.getElementById('ob-department').value;
        window.tempOnboardingData.grade = document.getElementById('ob-grade').value;
        window.startOnboardingProcess(3);
    }
    else if (step === 3) {
        const selected = [];
        document.querySelectorAll('.interest-pill.selected').forEach(el => selected.push(el.innerText));
        if(selected.length === 0) { alert("Lütfen en az bir ilgi alanı seçin."); return; }
        window.tempOnboardingData.interests = selected;
        window.startOnboardingProcess(4);
    }
    else if (step === 4) {
        const selected = document.querySelector('.purpose-radio.selected');
        if(!selected) { alert("Lütfen bir kullanım amacı seçin."); return; }
        window.tempOnboardingData.purpose = selected.getAttribute('data-val');
        window.startOnboardingProcess(5);
    }
};

window.triggerOnboardingCrop = function(inputEl) {
    if(!inputEl.files || inputEl.files.length === 0) return;
    const file = inputEl.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        document.getElementById('modal-body').innerHTML = `
            <div style="text-align:center; padding:10px;">
                <h3 style="margin-bottom:15px;">Fotoğrafı Kırp</h3>
                <div style="width: 100%; max-height: 350px; margin-bottom: 20px; display:flex; justify-content:center;">
                    <img id="cropper-image-ob" src="${e.target.result}" style="max-width: 100%; display:block;">
                </div>
                <button class="btn-primary" id="crop-ob-btn" style="width: 100%; padding: 14px; font-size: 16px; border-radius:12px;">✂️ Kırp ve Onayla</button>
                <p id="ob-upload-status" style="display:none; color:var(--primary); font-weight:bold; margin-top:10px;"></p>
            </div>
        `;
        
        setTimeout(() => {
            const image = document.getElementById('cropper-image-ob');
            if (window.cropperInstance) window.cropperInstance.destroy();
            
            window.cropperInstance = new Cropper(image, {
                aspectRatio: 1, viewMode: 1, dragMode: 'move', guides: false, center: false, highlight: false, cropBoxMovable: true, cropBoxResizable: true, toggleDragModeOnDblclick: false,
            });
            
            document.getElementById('crop-ob-btn').addEventListener('click', async function() {
                const btn = this; const statusEl = document.getElementById('ob-upload-status');
                btn.disabled = true; statusEl.style.display = 'block'; statusEl.innerText = 'Fotoğraf yükleniyor...';
                
                window.cropperInstance.getCroppedCanvas({ width: 400, height: 400, fillColor: 'transparent' }).toBlob(async function(blob) {
                    try {
                        const fileName = "avatar_" + window.userProfile.uid + "_" + Date.now() + ".png";
                        const storageRef = ref(storage, 'avatars/' + fileName);
                        await uploadBytes(storageRef, blob);
                        const url = await getDownloadURL(storageRef);
                        
                        window.tempOnboardingData.avatarUrl = url;
                        window.startOnboardingProcess(5); 
                    } catch(err) {
                        statusEl.innerText = "❌ Hata: " + err.message; statusEl.style.color = "red"; btn.disabled = false;
                    }
                }, 'image/png');
            });
        }, 200);
    };
    reader.readAsDataURL(file);
};

window.finishOnboarding = async function() {
    const btn = document.getElementById('ob-finish-btn');
    btn.innerText = "Kaydediliyor...";
    btn.disabled = true;

    try {
        const updates = {
            username: window.userProfile.username,
            age: window.tempOnboardingData.age,
            instagram: window.tempOnboardingData.instagram,
            faculty: window.tempOnboardingData.faculty,
            department: window.tempOnboardingData.department,
            grade: window.tempOnboardingData.grade,
            interests: window.tempOnboardingData.interests,
            purpose: window.tempOnboardingData.purpose,
            onboardingComplete: true
        };
        
        if (window.tempOnboardingData.avatarUrl) {
            updates.avatarUrl = window.tempOnboardingData.avatarUrl;
            window.userProfile.avatarUrl = window.tempOnboardingData.avatarUrl;
        }

        Object.assign(window.userProfile, updates);
        
        await updateDoc(doc(db, "users", window.userProfile.uid), updates);
        
        // Çarpıyı geri getir ve modalı kapat
        const closeBtn = document.querySelector('.modal-close');
        if(closeBtn) closeBtn.style.display = 'block';
        document.getElementById('app-modal').onclick = window.closeModal;
        
        window.closeModal();
        window.loadPage('home');
        
    } catch(err) {
        alert("Kaydedilirken hata oluştu: " + err.message);
        btn.innerText = "🎉 Kaydı Tamamla";
        btn.disabled = false;
    }
};

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
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🟢</span> <span><strong>Gelişmiş Radar:</strong> Seni kimlerin eklemek istediğini önceden gör.</span></li>
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🕵️</span> <span><strong>Seni Kimler Beğendi?:</strong> Profilini gezen herkesi anında açığa çıkar.</span></li>
                <li style="display:flex; gap:10px;"><span style="font-size:18px;">🚀</span> <span><strong>Öncelikli Mesaj (Super DM):</strong> Mesajların anında fark edilsin.</span></li>
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
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(m => m.classList.remove('active'));
    const msgTab = document.querySelector(`.menu-item[data-target="messages"]`);
    const mobTab = document.querySelector(`.nav-item[data-target="messages"]`);
    if(msgTab) msgTab.classList.add('active');
    if(mobTab) mobTab.classList.add('active');
    window.loadPage('messages');
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
    if (e.target === modal && modal.onclick !== null) window.closeModal(); 
});

bind('mobile-menu-btn', 'click', () => { 
    document.getElementById('sidebar').classList.toggle('open'); 
});

document.body.addEventListener('click', (e) => {
    const accordionHeader = e.target.closest('.accordion-header');
    if(accordionHeader) {
        const content = accordionHeader.nextElementSibling;
        const icon = accordionHeader.querySelector('.accordion-icon');
        if(content.classList.contains('open')) {
            content.classList.remove('open');
            if(icon) { icon.style.transform = 'rotate(0deg)'; }
        } else {
            content.classList.add('open');
            if(icon) { icon.style.transform = 'rotate(90deg)'; }
        }
        return;
    }

    const link = e.target.closest('.community-link');
    if(link) {
        const name = link.getAttribute('data-name');
        const icon = link.getAttribute('data-icon');
        const color = link.getAttribute('data-color');
        if(typeof window.handleFacultyClick === 'function') window.handleFacultyClick(name, icon, color);
        return;
    }
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
        
        rawSearch = rawSearch.replace(/^#/, '');
        const searchVal = '#' + rawSearch;
        
        if(searchVal === window.userProfile.username) { alert("Kendinizi arkadaş olarak ekleyemezsiniz :)"); return; }

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
            await window.sendFriendRequest(targetUser.uid, targetUser.name + " " + targetUser.surname, targetUser.avatarUrl || targetUser.avatar);
        }
        
        btn.innerText = origText;
        btn.disabled = false;
        searchInput.value = ''; 
    } catch (error) {
        console.error(error);
        alert("Arama sırasında hata oluştu: " + error.message);
    }
};

window.sendFriendRequest = async function(targetUserId, targetUserName, targetAvatar) {
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
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: targetAvatar || "👤" },
                lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid, 
                messages: [{ senderId: "system", text: "Sizi arkadaş olarak eklemek istiyor.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
            });
            alert("Arkadaşlık isteği başarıyla gönderildi!");
        } else {
            if(existingChat.status === 'pending') {
                alert("Bu kişiye zaten bir istek gönderilmiş veya ondan sana istek gelmiş.");
            } else {
                alert("Bu kişiyle zaten arkadaşsınız.");
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
            const facText = u.faculty ? u.faculty + (u.department ? ' - ' + u.department : '') : "Fakülte belirtilmemiş";
            
            let interestsHtml = '';
            if(u.interests && u.interests.length > 0) {
                interestsHtml = `<div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-bottom:15px;">`;
                u.interests.forEach(int => interestsHtml += `<span style="background:#EEF2FF; color:var(--primary); padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;">${int}</span>`);
                interestsHtml += `</div>`;
            }

            // Arkadaşlık durumuna göre buton ayarla
            const existingChat = chatsDB.find(c => c.otherUid === u.uid);
            let actionBtnHtml = '';
            
            if (existingChat && existingChat.status === 'accepted') {
                let igBtnHtml = u.instagram ? `<button class="btn-primary" style="flex:1; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); padding:12px; font-size:15px; border-radius:12px;" onclick="window.open('https://instagram.com/${u.instagram.replace('@','')}', '_blank')">📸 Instagram</button>` : '';
                actionBtnHtml = `
                    <div style="display:flex; gap:10px;">
                        <button class="btn-primary" style="flex:1; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>
                        ${igBtnHtml}
                    </div>
                `;
            } else if (existingChat && existingChat.status === 'pending') {
                actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF; box-shadow:none;">⏳ İstek Bekleniyor</button>`;
            } else {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}', '${u.avatarUrl || u.avatar}'); window.closeModal();">➕ Arkadaş Ekle</button>`;
            }

            window.openModal('Kullanıcı Profili', `
                <div style="text-align:center;">
                    ${avatarHtml}
                    <h3 style="margin: 10px 0 5px 0; font-size:18px; color:var(--text-dark);">${u.name} ${initial}</h3>
                    <p style="color:var(--text-gray); font-size:13px; font-weight:bold; margin-bottom:5px;">${u.username}</p>
                    <p style="color:var(--primary); font-size:14px; margin-bottom: 5px; font-weight:bold;">${facText}</p>
                    <p style="color:var(--text-gray); font-size:13px; margin-bottom: 10px;">${ageText}</p>
                    
                    ${interestsHtml}
                    
                    <div style="background:#F9FAFB; padding:15px; border-radius:12px; text-align:left; margin-bottom: 20px; border:1px solid #E5E7EB;">
                        <strong style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:1px;">Amacı:</strong>
                        <p style="font-size:14px; margin-top:5px; color:var(--primary); font-weight:bold; margin-bottom:10px;">${u.purpose || 'Belirtilmemiş'}</p>
                        
                        <strong style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:1px;">Biyografi:</strong>
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
    // 1. GELEN İSTEKLER ŞERİDİ
    const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
    let requestsHtml = '';
    
    if(incomingRequests.length > 0) {
        let cards = '';
        incomingRequests.forEach(req => {
            let avatarHtml = req.avatar.startsWith('http') 
                ? `<img src="${req.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
                : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${req.avatar}</div>`;

            cards += `
                <div class="request-card">
                    ${avatarHtml}
                    <div style="flex:1; overflow:hidden;">
                        <div style="font-weight:bold; font-size:14px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${req.name}</div>
                        <div style="font-size:11px; color:var(--text-gray);">Seni eklemek istiyor</div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button onclick="window.acceptRequestHome('${req.id}')" style="background:#10B981; color:white; border:none; padding:6px 10px; border-radius:8px; font-size:12px; cursor:pointer;">Kabul</button>
                    </div>
                </div>
            `;
        });
        
        requestsHtml = `
            <div style="margin-bottom: 20px;">
                <h3 style="font-size:15px; margin-bottom:10px; color:var(--text-dark);">🔔 Gelen İstekler (${incomingRequests.length})</h3>
                <div class="horizontal-scroll-container">
                    ${cards}
                </div>
            </div>
        `;
    }

    let html = `
        ${requestsHtml}
        
        <div class="card" style="background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: white; border:none; padding: 25px 20px;">
            <h2 style="font-size:24px; margin-bottom:8px;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
            <p style="opacity:0.9; font-size:15px; margin-bottom: 15px;">
                <strong style="color:#D9FDD3;">${window.userProfile.university}</strong> ağındasın.
            </p>
            <div style="display:flex; gap:10px;">
                <button onclick="window.loadPage('market')" style="flex:1; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:white; padding:12px; border-radius:12px; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🛒 Kampüs Market'e Git
                </button>
            </div>
        </div>
        
        <div class="card" style="padding: 12px 20px; display:flex; align-items:center; gap:12px; margin-bottom: 24px; border-radius: 16px;">
            <div style="font-size:18px;">🔍</div>
            <div style="display:flex; flex:1; align-items:center; background:#F3F4F6; border-radius:12px; padding:0 12px; border:1px solid transparent; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.background='white';" onblur="this.style.borderColor='transparent'; this.style.background='#F3F4F6';">
                <span style="color:var(--primary); font-weight:800; font-size:16px;">#</span>
                <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:10px 8px; outline:none; font-size:15px; font-weight:600; color:var(--text-dark);" placeholder="kullanici_ara" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
            </div>
            <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:10px 18px; border-radius:12px;" onclick="window.searchAndAddFriend()">Ekle</button>
        </div>
        
        <div class="card" style="padding: 20px;">
            <h2 style="margin-bottom:15px; font-size:18px; display:flex; align-items:center; justify-content:space-between;">
                <span>🔥 Önerilen Kişiler</span>
            </h2>
            <div class="user-grid" id="home-users-grid">
                <div style="grid-column: 1 / -1; text-align:center; padding: 20px; color:var(--text-gray);">Kullanıcılar yükleniyor...</div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;

    try {
        const querySnapshot = await getDocs(query(collection(db, "users")));
        let usersHtml = '';
        let count = 0;
        
        // Mevcut ilişkileri çıkar (Arkadaş olanları veya istek bekleyenleri ana sayfada gösterme)
        const interactedUids = chatsDB.map(c => c.otherUid);
        
        querySnapshot.forEach((doc) => {
            const u = doc.data();
            if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid) && count < 10) {
                count++;
                const initial = u.surname ? u.surname.charAt(0) + '.' : '';
                let avatarHtml = u.avatarUrl 
                    ? `<img src="${u.avatarUrl}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #E5E7EB;">` 
                    : `<div style="width:70px; height:70px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:35px; border:2px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;
                
                let interestsHtml = '';
                if(u.interests && u.interests.length > 0) {
                    interestsHtml = `<div class="user-card-interests">`;
                    u.interests.slice(0,3).forEach(int => interestsHtml += `<span class="user-card-interest-tag">${int}</span>`);
                    if(u.interests.length > 3) interestsHtml += `<span class="user-card-interest-tag" style="background:transparent; color:var(--text-gray);">+${u.interests.length - 3}</span>`;
                    interestsHtml += `</div>`;
                }

                let purposeHtml = u.purpose ? `<div style="font-size:11px; color:#10B981; font-weight:bold; margin-top:8px;">🎯 ${u.purpose}</div>` : '';

                usersHtml += `
                    <div class="user-card" onclick="window.viewUserProfile('${u.uid}')">
                        <div style="margin-bottom: 10px;">${avatarHtml}</div>
                        <div style="font-weight:bold; font-size:15px; color:var(--text-dark);">${u.name} ${initial}</div>
                        <div style="font-size:12px; color:var(--text-gray); margin-top:5px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">${u.faculty || 'Kampüs Öğrencisi'}</div>
                        ${purposeHtml}
                        ${interestsHtml}
                        <div style="margin-top:auto; width:100%; padding-top:15px;">
                            <button class="btn-primary" style="padding:8px; font-size:13px; border-radius:8px; width:100%; box-shadow:none;" onclick="event.stopPropagation(); window.sendFriendRequest('${u.uid}', '${u.name} ${initial}', '${u.avatarUrl || u.avatar}')">➕ Ekle</button>
                        </div>
                    </div>
                `;
            }
        });
        
        document.getElementById('home-users-grid').innerHTML = usersHtml || '<p style="grid-column: 1 / -1; text-align:center; color:var(--text-gray); padding:30px 0;">Henüz önerebileceğimiz yeni bir kullanıcı bulunamadı.</p>';
    } catch(e) {
        console.error("Kullanıcılar çekilemedi", e);
        document.getElementById('home-users-grid').innerHTML = '<p style="grid-column: 1 / -1; text-align:center; color:red;">Kullanıcılar yüklenirken hata oluştu.</p>';
    }
};

window.acceptRequestHome = async function(chatId) {
    try {
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        await updateDoc(doc(db, "chats", chatId), {
            status: 'accepted',
            messages: arrayUnion({ senderId: "system", text: "Arkadaşlık isteği kabul edildi. 🎉", time: timeStr, read: false }),
            lastUpdated: serverTimestamp()
        });
        window.renderHome(); // Yenile
    } catch(error) { alert("Hata oluştu: " + error.message); }
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
// 6. İLAN YÖNETİMİ (SADECE MARKET)
// ============================================================================

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
    } else if (existingChat && existingChat.status === 'accepted') {
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
    } else if (existingChat && existingChat.status === 'pending') {
         actionButtonsHtml = `<button class="btn-primary" disabled style="margin-top: 20px; padding:12px; font-size:15px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
    } else {
         // Profil fotoğrafı yok ilan datası içinde ama istek atınca basic atacak. viewProfile gibi tam detay atamaz.
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px;" onclick="window.sendFriendRequest('${item.sellerId}', '${item.sellerName}', '👤'); window.closeModal();">➕ İstek Gönder</button>`;
    }

    window.openModal(item.title, `
        <div style="position:relative;">${imgHtml}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:24px; font-weight:800; color:#059669;">${item.price} ${displayCurrency}</div>
            <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px; cursor:pointer;" onclick="window.viewUserProfile('${item.sellerId}')">Satıcı: <strong>${item.sellerName}</strong></div>
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
// 7. MESAJLAŞMA SİSTEMİ
// ============================================================================

window.openChatViewDirect = function(chatId) {
    document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(m=>m.classList.remove('active'));
    document.querySelector('.menu-item[data-target="messages"]')?.classList.add('active');
    document.querySelector('.nav-item[data-target="messages"]')?.classList.add('active');
    window.loadPage('messages');
    setTimeout(() => window.openChatView(chatId), 200);
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
         chatHTML += `<div style="padding: 20px; text-align: center; color: var(--text-gray); background: white; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ Arkadaşlık isteğinizin karşı tarafça kabul edilmesi bekleniyor...</div>`;
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
// 8. KAMPÜS AKIŞI (FEED)
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
    const authorAvatar = isAnon ? ["👻","👽","🤖","🦊","🎭"][Math.floor(Math.random()*5)] : (window.userProfile.avatarUrl || window.userProfile.avatar);

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
    if(confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
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
            premiumHintHtml = `<div style="font-size:11px; color:#D97706; font-weight:bold; margin-top:4px;">🌟 Premium İpucu: Bu kişi bölümdaşın.</div>`;
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
    const scrollBox = document.getElementById('conf-comments-scroll');
    if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.submitConfessionComment = async function(docId) {
    const input = document.getElementById('new-conf-comment');
    if(input && input.value.trim() !== '') {
        try {
            await updateDoc(doc(db, "confessions", docId), { comments: arrayUnion({ user: window.userProfile.username || window.userProfile.name, text: input.value.trim() }) });
        } catch(e) { alert("Yorum gönderilemedi: " + e.message); }
    }
};

// ============================================================================
// 10. FAKÜLTE FORUM SİSTEMİ
// ============================================================================

window.currentFacultyPosts = [];

window.handleFacultyClick = async function(name, icon, bgColor) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(m => m.classList.remove('active'));
    const mobTab = document.querySelector('.nav-item[data-target="faculties"]');
    if(mobTab) mobTab.classList.add('active');

    if(window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');

    const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;

    if(isJoined) { window.loadFacultyFeed(name, icon, bgColor); } 
    else {
        mainContent.innerHTML = `
            <div class="join-faculty-box" style="text-align:center; padding:40px 20px; background:white; border-radius:16px; border:1px solid var(--border-color); margin-top:20px;">
                <div class="icon" style="font-size:60px; margin-bottom:20px;">${icon}</div>
                <h2 style="font-size:24px; color:var(--text-dark); margin-bottom:10px;">${name} Ağına Hoş Geldin</h2>
                <p style="color:var(--text-gray); font-size:15px; margin-bottom:25px;">Bu alan kapalı bir ağdır. Girmek için fakülte kodunu girmelisin.</p>
                <div style="max-width: 300px; margin: 0 auto 20px auto;">
                    <input type="text" id="faculty-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Giriş Kodunu Yazın">
                </div>
                <button class="btn-primary" style="max-width:250px; font-size:16px; padding:14px; border-radius:12px; box-shadow:0 4px 6px rgba(79, 70, 229, 0.3);" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">Ağa Katıl ve Kaydet</button>
            </div>
        `;
        window.scrollTo(0,0);
    }
};

window.verifyFacultyCode = async function(name, icon, bgColor) {
    const inputCode = document.getElementById('faculty-passcode-input').value.trim();
    if (FACULTY_PASSCODES[name] && inputCode.toLowerCase() === FACULTY_PASSCODES[name].toLowerCase()) {
        window.userProfile.faculty = name; 
        window.joinedFaculties = [{name: name, icon: icon, color: bgColor}]; 
        await updateDoc(doc(db, "users", window.userProfile.uid), { faculty: name });
        window.updateMyFacultiesSidebar();
        window.loadFacultyFeed(name, icon, bgColor);
    } else { alert("Hatalı kod girdiniz. Lütfen tekrar deneyin."); }
};

window.loadFacultyFeed = async function(name, icon, bgColor) {
    const activeUsersCount = Math.floor(Math.random() * 80) + 20; 
    
    let avatarHtml = window.userProfile.avatarUrl 
        ? `<img src="${window.userProfile.avatarUrl}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
        : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${window.userProfile.avatar}</div>`;

    mainContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="padding:20px; background:${bgColor}; color:white; border-radius:16px; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size:40px; background:rgba(255,255,255,0.2); width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:50%;">${icon}</div>
                    <div>
                        <h2 style="margin:0; font-size:22px;">${name}</h2>
                        <span style="font-size:14px; opacity:0.9;">Öğrencilere özel alan.</span>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 12px; font-weight: bold; font-size: 13px;">
                    🟢 ${activeUsersCount} Aktif
                </div>
            </div>
            
            <div class="card" style="padding:15px; display:flex; gap:15px; align-items:flex-start;">
                ${avatarHtml}
                <div style="flex:1;">
                    <textarea id="faculty-post-input" placeholder="Fakülteye özel bir şeyler paylaş..." style="width:100%; border:none; resize:none; outline:none; font-size:15px; font-family:inherit; background:transparent; min-height:60px;"></textarea>
                    <div style="display:flex; justify-content:flex-end; border-top:1px solid var(--border-color); padding-top:10px; margin-top:10px;">
                        <button class="btn-primary" style="width:auto; padding:8px 20px; border-radius:20px;" onclick="window.submitFacultyPost()">Gönder</button>
                    </div>
                </div>
            </div>

            <div id="faculty-posts-container" style="display:flex; flex-direction:column; gap:15px;"></div>
        </div>
    `;
    
    if(window.currentFacultyPosts.length === 0) {
        window.currentFacultyPosts.push({ id: 1, user: "Sistem Moderatörü", avatar: "🤖", text: "Fakülte forumuna hoş geldin! Bu alan sadece senin fakültendeki öğrencilere özeldir.", time: "Bugün", likes: 12, replies: 0 });
    }
    window.renderFacultyPosts();
};

window.submitFacultyPost = function() {
    const input = document.getElementById('faculty-post-input');
    if(!input || input.value.trim() === '') return;
    
    window.currentFacultyPosts.unshift({
        id: Date.now(),
        user: window.userProfile.name + " " + window.userProfile.surname,
        avatar: window.userProfile.avatarUrl || window.userProfile.avatar,
        text: input.value.trim(),
        time: "Az önce",
        likes: 0,
        replies: 0
    });
    input.value = '';
    window.renderFacultyPosts();
};

window.renderFacultyPosts = function() {
    const container = document.getElementById('faculty-posts-container');
    if(!container) return;
    
    let html = '';
    window.currentFacultyPosts.forEach(post => {
        let avatarHtml = post.avatar.startsWith('http') 
            ? `<img src="${post.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` 
            : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${post.avatar}</div>`;

        html += `
            <div class="card" style="padding:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${avatarHtml}
                        <div>
                            <div style="font-weight:bold; font-size:15px;">${post.user}</div>
                            <div style="font-size:12px; color:var(--text-gray);">${post.time}</div>
                        </div>
                    </div>
                </div>
                <div style="font-size:15px; line-height:1.5; color:var(--text-dark); margin-bottom:15px;">
                    ${post.text.replace(/\n/g, '<br>')}
                </div>
                <div style="display:flex; gap:15px; border-top:1px solid var(--border-color); padding-top:10px;">
                    <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; color:var(--text-gray); font-weight:600; font-size:13px;" onclick="this.style.color='var(--primary)'; this.innerHTML='💙 Beğenildi (${post.likes + 1})';">
                        🤍 Beğen (${post.likes})
                    </button>
                    <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; color:var(--text-gray); font-weight:600; font-size:13px;" onclick="alert('Yanıt özelliği yakında aktif olacak!')">
                        💬 Yanıtla (${
                        post.replies})
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
};

// ============================================================================
// 11. SAYFA YÜKLEME VE PROFİL / AYARLAR (ROUTER MANTIĞI)
// ============================================================================

window.loadPage = function(target) {
    if(window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('open');
    }

    if(target === 'home') { window.renderHome(); }
    else if(target === 'confessions') { window.renderConfessions(); }
    else if(target === 'messages') { window.renderMessages(); }
    else if(target === 'market') { window.renderListings('market', '🛒 Kampüs Market'); }
    else if(target === 'profile') { window.renderProfileTab('info'); }
    else if(target === 'settings') { window.renderSettings(); }
    
    // Mobil bottom nav güncellemesi
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const mobileNav = document.querySelector(`.nav-item[data-target="${target}"]`);
    if(mobileNav) mobileNav.classList.add('active');
};

window.renderProfileTab = function(tab) {
    window.currentProfileTab = tab;
    let initial = window.userProfile.surname ? window.userProfile.surname.charAt(0) + '.' : '';
    
    let avatarHtml = window.userProfile.avatarUrl 
        ? `<img src="${window.userProfile.avatarUrl}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:4px solid var(--primary);">`
        : `<div style="width:120px; height:120px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:60px; border:4px solid var(--primary); margin:0 auto;">${window.userProfile.avatar}</div>`;

    let premiumBadge = window.userProfile.isPremium ? `<div style="display:inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color:white; font-size:11px; padding:4px 10px; border-radius:12px; font-weight:bold; margin-bottom:10px; box-shadow: 0 2px 4px rgba(245,158,11,0.3);">👑 Premium Üye</div>` : '';

    let topHtml = `
        <div class="card" style="text-align:center; position:relative; overflow:hidden;">
            <div style="height:100px; background:linear-gradient(135deg, var(--primary), #1E3A8A); position:absolute; top:0; left:0; right:0;"></div>
            <div style="position:relative; margin-top:40px; margin-bottom:15px;">
                ${avatarHtml}
            </div>
            ${premiumBadge}
            <h2 style="margin-bottom:5px;">${window.userProfile.name} ${initial}</h2>
            <p style="color:var(--text-gray); font-weight:bold; margin-bottom:15px;">${window.userProfile.username}</p>
            
            <div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px; border-top:1px solid #E5E7EB; padding-top:20px;">
                <div style="text-align:center;">
                    <div style="font-weight:900; font-size:20px; color:var(--text-dark);">${marketDB.filter(m => m.sellerId === window.userProfile.uid).length}</div>
                    <div style="font-size:12px; color:var(--text-gray);">İlanım</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-weight:900; font-size:20px; color:var(--text-dark);">${confessionsDB.filter(c => c.authorId === window.userProfile.uid).length}</div>
                    <div style="font-size:12px; color:var(--text-gray);">Gönderim</div>
                </div>
            </div>

            <div style="display:flex; gap:10px; background:#F3F4F6; padding:5px; border-radius:12px; margin-bottom:20px; overflow-x:auto;">
                <button style="flex:1; padding:10px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; background:${tab==='info'?'white':'transparent'}; box-shadow:${tab==='info'?'0 2px 4px rgba(0,0,0,0.05)':'none'}; color:${tab==='info'?'var(--primary)':'var(--text-gray)'};" onclick="window.renderProfileTab('info')">Bilgilerim</button>
                <button style="flex:1; padding:10px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; background:${tab==='friends'?'white':'transparent'}; box-shadow:${tab==='friends'?'0 2px 4px rgba(0,0,0,0.05)':'none'}; color:${tab==='friends'?'var(--primary)':'var(--text-gray)'};" onclick="window.renderProfileTab('friends')">Ağım (Arkadaşlar)</button>
            </div>
            
            <div id="profile-content-area" style="text-align:left;"></div>
        </div>
    `;

    mainContent.innerHTML = topHtml;
    const contentArea = document.getElementById('profile-content-area');

    if(tab === 'info') {
        let interestsHtml = window.userProfile.interests && window.userProfile.interests.length > 0
            ? window.userProfile.interests.map(i => `<span style="background:#EEF2FF; color:var(--primary); padding:5px 12px; border-radius:12px; font-size:13px; font-weight:bold;">${i}</span>`).join(' ')
            : '<span style="color:var(--text-gray); font-size:13px;">Belirtilmemiş</span>';

        contentArea.innerHTML = `
            <div style="background:#F9FAFB; border-radius:12px; padding:20px; border:1px solid #E5E7EB;">
                <div style="margin-bottom:15px;">
                    <strong style="font-size:12px; color:#6B7280; text-transform:uppercase;">Üniversite & Fakülte</strong>
                    <div style="font-size:15px; margin-top:5px; font-weight:500;">${window.userProfile.university} <br> <span style="color:var(--primary); font-weight:bold;">${window.userProfile.faculty || 'Fakülte Seçilmedi'}</span></div>
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="font-size:12px; color:#6B7280; text-transform:uppercase;">Bölüm & Sınıf</strong>
                    <div style="font-size:15px; margin-top:5px; font-weight:500;">${window.userProfile.department || 'Belirtilmemiş'} - ${window.userProfile.grade || 'Belirtilmemiş'}</div>
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="font-size:12px; color:#6B7280; text-transform:uppercase;">Kampüsteki Amacım</strong>
                    <div style="font-size:15px; margin-top:5px; font-weight:bold; color:#10B981;">${window.userProfile.purpose || 'Belirtilmemiş'}</div>
                </div>
                <div style="margin-bottom:15px;">
                    <strong style="font-size:12px; color:#6B7280; text-transform:uppercase;">İlgi Alanlarım</strong>
                    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">${interestsHtml}</div>
                </div>
                <button class="btn-primary" style="width:100%; padding:12px; margin-top:10px; background:var(--text-dark);" onclick="window.loadPage('settings')">⚙️ Ayarları Düzenle</button>
            </div>
        `;
    } else if (tab === 'friends') {
        const friendsList = chatsDB.filter(c => c.status === 'accepted');
        const pendingList = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
        
        let friendsHtml = '';
        
        if (pendingList.length > 0) {
            friendsHtml += `<h3 style="font-size:15px; margin-bottom:10px; color:var(--text-dark);">Gelen İstekler (${pendingList.length})</h3>`;
            pendingList.forEach(req => {
                let av = req.avatar.startsWith('http') ? `<img src="${req.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px;">${req.avatar}</div>`;
                friendsHtml += `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:10px; background:#fff;">
                        <div style="display:flex; align-items:center; gap:10px;">${av} <div style="font-weight:bold; font-size:14px;">${req.name}</div></div>
                        <button class="btn-primary" style="padding:6px 12px; font-size:12px; width:auto; border-radius:8px;" onclick="window.acceptRequestHome('${req.id}')">Kabul Et</button>
                    </div>
                `;
            });
            friendsHtml += `<hr style="border:none; border-top:1px solid #E5E7EB; margin:20px 0;">`;
        }

        friendsHtml += `<h3 style="font-size:15px; margin-bottom:10px; color:var(--text-dark);">Ağındaki Kişiler (${friendsList.length})</h3>`;
        
        if(friendsList.length === 0) {
            friendsHtml += `<p style="color:var(--text-gray); font-size:14px; text-align:center; padding:20px;">Henüz ağında kimse yok. Ana sayfadan insanları ekleyebilirsin.</p>`;
        } else {
            friendsList.forEach(f => {
                let av = f.avatar.startsWith('http') ? `<img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px;">${f.avatar}</div>`;
                friendsHtml += `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:10px; background:#fff;">
                        <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.viewUserProfile('${f.otherUid}')">${av} <div style="font-weight:bold; font-size:14px;">${f.name}</div></div>
                        <button class="btn-primary" style="padding:6px 12px; font-size:12px; width:auto; border-radius:8px; background:#6B7280;" onclick="window.openChatViewDirect('${f.id}')">Mesaj</button>
                    </div>
                `;
            });
        }
        
        contentArea.innerHTML = friendsHtml;
    }
};

window.renderSettings = function() {
    const lang = localStorage.getItem('uniloop_lang') || 'tr';
    const t = TRANSLATIONS[lang];
    const isDark = document.body.classList.contains('dark-mode');

    let html = `
        <div class="card">
            <h2 style="margin-bottom:20px;">${t.settingsTitle}</h2>
            
            <div class="form-group">
                <label>${t.langLabel}</label>
                <select id="lang-select" onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB;">
                    <option value="tr" ${lang === 'tr' ? 'selected' : ''}>Türkçe</option>
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>

            <div class="form-group">
                <label>${t.themeLabel}</label>
                <select id="theme-select" onchange="window.toggleTheme(this.value)" style="width:100%; padding:12px; border-radius:12px; border:1px solid #D1D5DB;">
                    <option value="light" ${!isDark ? 'selected' : ''}>☀️ ${t.lightMode}</option>
                    <option value="dark" ${isDark ? 'selected' : ''}>🌙 ${t.darkMode}</option>
                </select>
            </div>

            <button class="btn-danger" style="width:100%; margin-top:20px; padding:14px; border-radius:12px;" onclick="window.logout()">${t.logoutBtn}</button>
        </div>
    `;
    mainContent.innerHTML = html;
};

// ============================================================================
// BAŞLATMA
// ============================================================================
} // initializeUniLoop fonksiyonunun sonu

window.onload = function() {
    initializeUniLoop();
};


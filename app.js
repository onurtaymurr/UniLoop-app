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

function initializeUniLoop() {

// 🎨 DINAMIK CSS ENJEKSIYONU: Yumuşak Kaydırma, Yeni Akış, PREMIUM, BUTON FIX ve ACCORDION Stilleri
const styleFix = document.createElement('style');
styleFix.innerHTML = `
    /* Sert kaydırmayı engeller ve estetik yumuşak kaydırma sağlar */
    html, body { 
        scroll-behavior: smooth !important; 
        -webkit-overflow-scrolling: touch; 
    }
    
    /* 🚨 TIKLAMA VE BUTON ÇALIŞMAMA PROBLEMİ İÇİN KESİN ÇÖZÜM (OVERLAY FIX) 🚨 */
    /* Görünmez modalların tıklamaları sömürmesini engeller */
    #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: -999 !important;
    }
    #app-modal.active, #lightbox.active, .modal.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        z-index: 99999 !important;
    }
    
    /* Auth Screen (Giriş/Kayıt) Ekranı Tıklama Garantisi */
    #auth-screen {
        position: relative;
        z-index: 1000 !important;
    }
    #auth-screen button, 
    #auth-screen a, 
    #auth-screen input, 
    #auth-screen select {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative;
        z-index: 1001 !important;
    }

    /* Butonların genel tıklanabilirliğini garanti eder */
    button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { 
        cursor: pointer !important; 
        position: relative; 
        pointer-events: auto !important;
        z-index: 10; 
    }
    
    /* 🚨 NAVİGASYON YAZISI GİZLENME PROBLEMİ FIX (PADDING-TOP EKLENDİ) 🚨 */
    /* Mobilde Sidebar Kaydırma Fix - Dışarı Taşmayı ve Kesilmeyi Engeller */
    #sidebar { 
        overflow-y: auto !important; 
        -webkit-overflow-scrolling: touch !important; 
        overscroll-behavior: contain; 
        justify-content: flex-start !important; 
        align-items: stretch !important;
        max-height: 100vh !important;
        top: 0 !important;
        padding-top: 75px !important; /* Header'ın altında kalmasını önler */
        padding-bottom: 40px !important;
    }
    
    /* Mesajlar: Sayfanın kaymamasını sağlayan Fix */
    #chat-layout-container { 
        height: calc(100vh - 120px) !important; 
        max-height: 800px; 
        overflow: hidden !important; 
        display: flex; 
        flex-direction: row; 
    }
    .chat-sidebar { 
        overflow-y: auto !important; 
        height: 100% !important; 
        -webkit-overflow-scrolling: touch !important; 
        flex-shrink: 0; 
    }
    .chat-main { 
        height: 100% !important; 
        display: flex !important; 
        flex-direction: column !important; 
        overflow: hidden !important; 
        flex: 1; 
    }
    #chat-messages-scroll { 
        flex: 1 !important; 
        overflow-y: auto !important; 
        -webkit-overflow-scrolling: touch !important; 
        scroll-behavior: smooth; 
    }
    
    /* Soru Cevap ve Market İçin Liste Scroll Fix */
    #qa-feed, #listings-grid-container { 
        max-height: calc(100vh - 200px) !important; 
        overflow-y: auto !important; 
        -webkit-overflow-scrolling: touch !important; 
        padding-right: 8px; 
    }
    
    /* Detaylardaki Yorumlar */
    .answers-container { 
        max-height: 250px !important; 
        overflow-y: auto !important; 
        -webkit-overflow-scrolling: touch !important; 
        padding-right: 8px; 
        scroll-behavior: smooth; 
    }
    
    /* 📱 Instagram / Twitter Tarzı Akış (Feed) Stilleri */
    .feed-layout-container { 
        height: calc(100vh - 80px); 
        display: flex; 
        flex-direction: column; 
        overflow: hidden; 
        margin: -20px; 
        background: #F3F4F6; 
    }
    #conf-feed { 
        flex: 1; 
        overflow-y: auto; 
        padding: 15px; 
        scroll-behavior: smooth; 
        -webkit-overflow-scrolling: touch; 
        max-width: 600px !important;
        margin: 0 auto !important;
        width: 100%;
    }
    .feed-post { 
        background: #fff; 
        border: 1px solid #E5E7EB; 
        border-radius: 16px; 
        padding: 16px; 
        margin-bottom: 24px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.04); 
    }
    .feed-post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .feed-post-avatar { font-size: 24px; width: 44px; height: 44px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; border: 1px solid #E5E7EB; }
    .feed-post-meta { display: flex; flex-direction: column; }
    .feed-post-author { font-weight: 800; font-size: 15px; color: #111827; }
    .feed-post-time { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .feed-post-text { font-size: 15px; margin-bottom: 12px; line-height: 1.5; color: #374151; word-break: break-word; }
    .feed-post-img { width: 100%; border-radius: 12px; margin-bottom: 12px; max-height: 450px; object-fit: cover; cursor: pointer; border: 1px solid #E5E7EB; }
    .feed-post-actions { display: flex; border-top: 1px solid #E5E7EB; padding-top: 12px; gap: 20px; }
    .feed-action-btn { background: none; border: none; color: #6B7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 5px; outline: none; transition: 0.2s; border-radius: 8px; z-index: 10; }
    .feed-action-btn:hover { color: var(--primary); background: #EEF2FF; }

    /* 🌟 YENİ: PREMIUM BÖLÜMÜ VE KİLİTLİ İÇERİK STİLLERİ */
    .premium-glow {
        animation: glowPulse 2s infinite alternate;
    }
    @keyframes glowPulse {
        0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); }
        100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
    }
    .premium-upgrade-btn {
        background: linear-gradient(135deg, #F59E0B, #D97706);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: bold;
        font-size: 15px;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .premium-upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4);
    }
    .premium-match-card {
        border: 2px solid #F59E0B !important;
        background: linear-gradient(to bottom right, #fff, #FEF3C7) !important;
    }
    .locked-blur {
        filter: blur(5px);
        pointer-events: none;
        user-select: none;
    }
    .locked-container {
        position: relative;
        overflow: hidden;
        border-radius: 16px;
    }
    .locked-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 5;
        text-align: center;
        padding: 10px;
        cursor: pointer;
        transition: background 0.3s;
    }
    .locked-overlay:hover {
        background: rgba(255, 255, 255, 0.9);
    }

    /* GERÇEK ÇALIŞAN KARANLIK MOD (DARK MODE) DESTEĞİ */
    body.dark-mode, .dark-mode #main-content { background-color: #121212 !important; color: #e5e7eb !important; }
    .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header { background-color: #1e1e1e !important; border-color: #374151 !important; color: #e5e7eb !important; }
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
    .dark-mode .locked-overlay { background: rgba(30, 30, 30, 0.8); }

    /* 🌟 GÖRSEL DÜZELTME: HEADER TEK SATIR & KÜÇÜLTÜLMÜŞ BUTONLAR */
    #app-header, header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        flex-wrap: nowrap !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        padding: 5px 15px !important;
    }
    
    #app-header > :first-child, .logo, .logo-title, #logo-btn { 
        flex-shrink: 0 !important; 
    }
    
    #app-header > :last-child, .header-right-menu {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        flex-wrap: nowrap !important;
    }

    #profile-btn, #nav-premium-action {
        font-size: 12px !important;
        padding: 0 10px !important;
        height: 32px !important;
        line-height: 32px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
        margin: 0 !important;
        border-radius: 8px !important;
    }

    @media (max-width: 1024px) {
        #chat-layout-container { height: calc(100vh - 160px) !important; }
        .chat-sidebar { width: 100%; display: block; }
        .chat-active .chat-sidebar { display: none !important; }
        .chat-main { display: none !important; }
        .chat-active .chat-main { display: flex !important; }
    }

    /* 🌟 YENİ: ACCORDION VE ORGANİZASYON STİLLERİ 🌟 */
    .accordion-section { margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--card-bg); }
    .accordion-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 14px 16px; font-weight: bold; font-size: 15px; transition: 0.2s; color: var(--text-dark);}
    .accordion-header:hover { background: #EEF2FF; color: var(--primary); }
    
    /* 🔥 PÜRÜZSÜZ AŞAĞI AÇILAN ACCORDION STİLİ 🔥 */
    .accordion-content { 
        max-height: 0; 
        overflow: hidden; 
        padding: 0 16px; 
        background: #F9FAFB; 
        transition: max-height 0.3s ease, padding 0.3s ease, border-color 0.3s ease; 
        border-top: 1px solid transparent; 
    }
    .accordion-content.open { 
        max-height: 600px; 
        padding: 10px 16px; 
        border-top: 1px solid var(--border-color); 
    }
    .accordion-icon { 
        display: inline-block; 
        margin-left: auto; 
        font-size: 12px; 
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        color: var(--text-gray); 
    }
    
    .org-link { padding: 10px 0; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: var(--text-dark); transition: 0.2s; border-bottom: 1px solid #E5E7EB; }
    .org-link:last-child { border-bottom: none; }
    .org-link:hover { color: var(--primary); transform: translateX(5px); }
    
    /* Yeni Meeting Arayüzü Scrollbar Ayarları */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
`;
document.head.appendChild(styleFix);

// YENİ: DİL VE TEMA DESTEĞİ İÇİN GLOBAL SİSTEM FONKSİYONLARI
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

// YENİ: SİSTEM AÇILDIĞINDA KAYITLI TEMAYI YÜKLE
const savedTheme = localStorage.getItem('uniloop_theme') || 'light';
window.toggleTheme(savedTheme);

// YENİ: ÇEVİRİ SÖZLÜĞÜ (Ayarlar ve Temel Metinler İçin)
const TRANSLATIONS = {
    'tr': { settingsTitle: '⚙️ Uygulama Ayarları', langLabel: 'Dil Seçimi', themeLabel: 'Tema', lightMode: 'Aydınlık Mod', darkMode: 'Karanlık Mod', logoutBtn: '🚪 Güvenli Çıkış Yap' },
    'en': { settingsTitle: '⚙️ App Settings', langLabel: 'Language', themeLabel: 'Theme', lightMode: 'Light Mode', darkMode: 'Dark Mode', logoutBtn: '🚪 Secure Logout' }
};

// 🔒 Mobilde Sidebar dışına tıklandığında menüyü kapatma garantisi
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

// --- SİSTEM HAFIZASI (GLOBAL DEĞİŞKENLER) ---
window.userProfile = { 
    uid: "", 
    name: "", 
    surname: "", 
    username: "",
    email: "", 
    university: "", 
    avatar: "👨‍🎓", 
    faculty: "",
    organization: "",
    isPremium: false 
};

window.joinedFaculties = [];
window.joinedOrganizations = [];
let marketDB = [];
let confessionsDB = [];
let qaDB = [];
let chatsDB = [];
let currentChatId = null;

window.resetCurrentChatId = function() { currentChatId = null; };

const FACULTY_PASSCODES = {
    "Tıp Fakültesi": "tıpfak100", 
    "Hukuk Fakültesi": "hukuk1000", 
    "Diş Hekimliği Fakültesi": "dis1000"
};

const ORGANIZATION_PASSCODES = {
    "Spor Kulübü": "spor100", 
    "Tiyatro Kulübü": "tiyatro100", 
    "Sağlık Kulübü": "saglik100"
};

const globalUniversities = [
    "Yakın Doğu Üniversitesi (NEU)", 
    "Doğu Akdeniz Üniversitesi (EMU)", 
    "Girne Amerikan Üniversitesi (GAU)", 
    "Uluslararası Kıbrıs Üniversitesi (CIU)",
    "Orta Doğu Teknik Üniversitesi (ODTÜ)", 
    "Boğaziçi Üniversitesi", 
    "İstanbul Teknik Üniversitesi (İTÜ)", 
    "Bilkent Üniversitesi", 
    "Koç Üniversitesi",
    "Stanford University", 
    "Massachusetts Institute of Technology (MIT)", 
    "Harvard University"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
const modal = document.getElementById('app-modal');

// 🌟 YENİ: ACCORDION MENÜLERİ RENDER ETME 🌟
window.renderSidebarAccordions = function() {
    const accordionHTML = `
        <div class="accordion-section">
            <div class="accordion-header">
                <span>🏢 Fakülteler</span>
                <span class="accordion-icon">▶</span>
            </div>
            <div class="accordion-content">
                <div class="menu-item community-link" data-name="Tıp Fakültesi" data-icon="🩺" data-color="linear-gradient(135deg, #EF4444, #B91C1C)">🩺 Tıp Fakültesi</div>
                <div class="menu-item community-link" data-name="Hukuk Fakültesi" data-icon="⚖️" data-color="linear-gradient(135deg, #8B5CF6, #6D28D9)">⚖️ Hukuk Fakültesi</div>
                <div class="menu-item community-link" data-name="Diş Hekimliği Fakültesi" data-icon="🦷" data-color="linear-gradient(135deg, #06B6D4, #0891B2)">🦷 Diş Hekimliği Fakültesi</div>
            </div>
        </div>
        <div class="accordion-section">
            <div class="accordion-header">
                <span>🎭 Kulüp ve Organizasyonlar</span>
                <span class="accordion-icon">▶</span>
            </div>
            <div class="accordion-content">
                <div class="menu-item org-link" data-name="Spor Kulübü" data-icon="⚽" data-color="linear-gradient(135deg, #10B981, #059669)">⚽ Spor Kulübü</div>
                <div class="menu-item org-link" data-name="Sağlık Kulübü" data-icon="🏥" data-color="linear-gradient(135deg, #EF4444, #B91C1C)">🏥 Sağlık Kulübü</div>
                <div class="menu-item org-link" data-name="Tiyatro Kulübü" data-icon="🎭" data-color="linear-gradient(135deg, #8B5CF6, #4C1D95)">🎭 Tiyatro Kulübü</div>
            </div>
        </div>
    `;
    
    const sidebarContainer = document.getElementById('sidebar-networks-container');
    const rightContainer = document.getElementById('right-networks-container');
    
    if(sidebarContainer) sidebarContainer.innerHTML = '<br><h3 style="margin-bottom: 15px;">🌐 Ağlarım</h3>' + accordionHTML;
    if(rightContainer) rightContainer.innerHTML = '<h2 style="margin-bottom: 15px;">🌐 Ağlarım</h2>' + accordionHTML;
};

window.renderSidebarAccordions();

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
            isOnline: false, 
            faculty: "",
            organization: "",
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
                Bu platform senin dijital kampüsün! Neler mi yapabilirsin?<br><br>
                🛒 <b>Kampüs Market:</b> İhtiyacın olmayan eşyaları sat.<br>
                📸 <b>Kampüs Akışı:</b> Düşüncelerini özgürce paylaş.<br>
                ❓ <b>Soru & Cevap:</b> Aklına takılan her şeyi sor.<br>
                Burası senin alanın. Hemen "Profilim" sekmesine giderek kendine unutulmaz bir kullanıcı adı belirle!
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
        }
    } catch(error) {
        console.error("Çıkış hatası:", error);
    }
};

// ============================================================================
// 2. OTURUM DURUMU KONTROLÜ VE BİLDİRİM SEKME ENTEGRASYONU
// ============================================================================

onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) { 
        if(authScreen && appScreen) {
            authScreen.style.display = 'none';
            appScreen.style.display = 'block';
        }

        if (!document.getElementById('nav-notifications-btn')) {
            const msgBtn = document.getElementById('nav-messages-btn');
            if (msgBtn) {
                const notifBtnHTML = `
                    <div class="menu-item" id="nav-notifications-btn" data-target="notifications">
                        ↳ Bildirimler <span id="notif-badge" class="badge" style="display:none; background:#EF4444; color:white; padding:2px 8px; border-radius:12px; font-size:11px; margin-left:auto;">0</span>
                    </div>
                `;
                msgBtn.insertAdjacentHTML('afterend', notifBtnHTML);
                
                document.getElementById('nav-notifications-btn').addEventListener('click', (e) => {
                    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    window.loadPage('notifications');
                });
            }
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            if(docSnap.exists()) {
                window.userProfile = docSnap.data();
                if(window.userProfile.isPremium === undefined) {
                    window.userProfile.isPremium = false;
                }
                if(window.userProfile.organization === undefined) {
                    window.userProfile.organization = "";
                }
            } else {
                window.userProfile = { 
                    uid: user.uid, name: "Öğrenci", surname: "", username: "",
                    email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓", faculty: "", organization: "", 
                    isOnline: true, isPremium: false
                };
                await setDoc(userDocRef, window.userProfile);
            }

            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            initRealtimeListeners(user.uid);

            const activeTab = document.querySelector('.menu-item.active');
            if(typeof window.loadPage === 'function') {
                window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); 
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

            if(window.userProfile.faculty && typeof window.updateMyFacultiesSidebar === 'function') {
                window.joinedFaculties = [{ name: window.userProfile.faculty, icon: "🏢", color: "linear-gradient(135deg, #1E3A8A, #4F46E5)" }];
                window.updateMyFacultiesSidebar();
            }

        } catch(error) { 
            window.userProfile = { 
                uid: user.uid, name: "Misafir", surname: "", username: "", email: user.email, 
                university: "Lütfen Firestore'u Test Moduna Alın", avatar: "⚠️", faculty: "", organization: "", isOnline: true, isPremium: false 
            };
            if(typeof window.loadPage === 'function') { window.loadPage('home'); }
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
        
        const activeTab = document.querySelector('.menu-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
        if(activeTab && activeTab.getAttribute('data-target') === 'housing') window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
    });

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

    onSnapshot(query(collection(db, "qa"), orderBy("createdAt", "desc")), (snapshot) => {
        qaDB = [];
        snapshot.forEach(doc => { qaDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
        qaDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        
        const activeTab = document.querySelector('.menu-item.active');
        if(activeTab && activeTab.getAttribute('data-target') === 'qa') {
            const activeFilter = document.querySelector('.qa-filter-btn.active');
            window.drawQAGrid(activeFilter ? activeFilter.getAttribute('data-filter') : 'Genel');
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
                    initiator: data.initiator || null, lastUpdatedTS: safeTimestamp 
                };
                chatsDB.push(chatItem);

                if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) pendingRequestsCount++;
            } catch(err) { console.error("Hatalı mesaj belgesi es geçildi:", err); }
        });

        chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
        const notifBadge = document.getElementById('notif-badge');
        if(notifBadge) {
            if(pendingRequestsCount > 0) { notifBadge.style.display = 'inline-block'; notifBadge.innerText = pendingRequestsCount; } 
            else { notifBadge.style.display = 'none'; }
        }

        const activeTab = document.querySelector('.menu-item.active');
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
        }
    });
}

// ============================================================================
// 🌟 YENİ: PREMIUM ABONELİK MODAL VE MANTIK
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
// 3. AÇILIR PENCERELER VE TIKLAMA YÖNETİMİ (ACCORDION DESTEKLİ)
// ============================================================================

window.goToMessages = function() {
    const msgTab = document.querySelector('[data-target="messages"]');
    if(msgTab) { msgTab.click(); }
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

bind('mobile-menu-btn', 'click', () => { 
    document.getElementById('sidebar').classList.toggle('open'); 
});

document.body.addEventListener('click', (e) => {
    // 🌟 YENİ: Accordion Toggle Mantığı 🌟
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

    // Fakülte Tıklaması
    const link = e.target.closest('.community-link');
    if(link) {
        const name = link.getAttribute('data-name');
        const icon = link.getAttribute('data-icon');
        const color = link.getAttribute('data-color');
        if(typeof window.handleFacultyClick === 'function') window.handleFacultyClick(name, icon, color);
        return;
    }

    // 🌟 YENİ: Organizasyon Tıklaması 🌟
    const orgLink = e.target.closest('.org-link');
    if(orgLink) {
        const name = orgLink.getAttribute('data-name');
        const icon = orgLink.getAttribute('data-icon');
        const color = orgLink.getAttribute('data-color');
        if(typeof window.handleOrganizationClick === 'function') window.handleOrganizationClick(name, icon, color);
        return;
    }
});

// ============================================================================
// 4. ARKADAŞ ARAMA MOTORU VE ANA SAYFA (YENİ ŞEFFAF AI RADAR ENTEGRELİ)
// ============================================================================

window.searchAndAddFriend = async function() {
    try {
        const searchInput = document.getElementById('friend-search-input');
        if(!searchInput) return;
        
        let rawSearch = searchInput.value.trim().toLowerCase();
        if(!rawSearch) { alert("Lütfen bir kullanıcı adı yazın."); return; }
        if (!window.userProfile.username) { alert("Arkadaş eklemeden önce lütfen profilinizden bir kullanıcı adı belirleyin!"); return; }

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

window.sendFriendRequest = async function(targetUserId, targetUserName) {
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
                participantAvatars: { [myUid]: window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid, 
                messages: [{ senderId: "system", text: "Arkadaşlık isteği gönderildi.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
            });
            alert("Arkadaşlık isteği başarıyla gönderildi!");
            window.loadPage('messages');
        } else {
            if(existingChat.status === 'pending') {
                alert("Bu kişiye zaten bir istek gönderilmiş veya ondan sana istek gelmiş. Lütfen Bildirimlerinizi kontrol edin.");
            } else {
                alert("Bu kişiyle zaten arkadaşsınız.");
                window.loadPage('messages');
                setTimeout(() => window.openChatView(existingChat.id), 500); 
            }
        }
    } catch (error) {
        alert("İstek gönderilirken hata oluştu: " + error.message);
    }
};

function getHomeContent() {
    let usernameWarning = '';
    if (!window.userProfile.username) {
        usernameWarning = `
            <div style="background: #FEF2F2; color: #DC2626; padding: 15px; border-radius: 12px; border: 1px solid #FCA5A5; margin-bottom: 20px; font-weight: bold; text-align: center; cursor:pointer;" onclick="window.loadPage('profile')">
                ⚠️ Lütfen profilinden bir kullanıcı adı belirle! Arkadaşlarının seni bulabilmesi için bu zorunludur. (Tıkla ve Belirle)
            </div>
        `;
    }

    let aiRadarContent = '';
    const isPremium = window.userProfile.isPremium;
    const userFac = window.userProfile.faculty || "Kampüs"; 

    if (isPremium) {
        aiRadarContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <h2 style="margin:0;">🌟 Gelişmiş AI Kampüs Radarı</h2>
                <span style="font-size:12px; background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:8px; font-weight:bold;">Premium Aktif</span>
            </div>
            <div class="match-grid">
                <div class="match-card premium-match-card">
                    <div class="avatar">👨‍💻</div>
                    <h4 style="margin: 8px 0 2px 0;">John D.</h4>
                    <p style="color:#D97706; font-size:12px; font-weight:bold; margin-bottom:4px;">🟢 Şu an aktif (Kütüphanede)</p>
                    <p style="font-size:13px;">${userFac} (Aynı Bölüm)</p>
                    <button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Super DM At 🚀</button>
                </div>
                <div class="match-card premium-match-card">
                    <div class="avatar">👩‍⚕️</div>
                    <h4 style="margin: 8px 0 2px 0;">Sarah B.</h4>
                    <p style="color:#D97706; font-size:12px; font-weight:bold; margin-bottom:4px;">🎧 Ortak İlgi: Müzik Kulübü</p>
                    <p style="font-size:13px;">${userFac}</p>
                    <button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Super DM At 🚀</button>
                </div>
                <div class="match-card premium-match-card">
                    <div class="avatar">🎮</div>
                    <h4 style="margin: 8px 0 2px 0;">Ali K.</h4>
                    <p style="color:#D97706; font-size:12px; font-weight:bold; margin-bottom:4px;">🔍 Dün profilini gezdi</p>
                    <p style="font-size:13px;">Mimarlık Fakültesi</p>
                    <button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Geri Dönüş Yap</button>
                </div>
            </div>
        `;
    } else {
        // 🔥 YENİ: KISALTILMIŞ VE İLGİ ÇEKİCİ METİN
        aiRadarContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <h2 style="margin:0; color:#DC2626;">🔥 Kampüs Tespitleri</h2>
            </div>
            <div style="background: linear-gradient(135deg, #FEF2F2, #FEF3C7); color: #92400E; padding: 16px; border-radius: 12px; margin-bottom: 15px; font-size: 14px; border: 1px solid #FCD34D; line-height: 1.6; font-weight: 800; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
                🚨 <strong>${userFac}</strong> ağında hareketlilik var!<br>
                🔥 Gizli hayranlarını bul, stalkerlarını gör ve kampüsün en popülerleriyle anında eşleş! Kilitleri kır ve oyuna katıl 👇
            </div>
            <div class="match-grid">
                <div class="match-card locked-container">
                    <div class="locked-overlay" onclick="window.openPremiumModal()">
                        <span style="font-size:28px; margin-bottom:8px;">🔒</span>
                        <span style="font-size:13px; font-weight:bold; color:#1F2937;">Kim Olduğunu Görmek İçin Tıkla</span>
                    </div>
                    <div class="locked-blur">
                        <div class="avatar">👨‍🎓</div>
                        <h4>A*** K***</h4>
                        <p>${userFac} (Potansiyel Eşleşme)</p>
                        <button class="action-btn">Mesaj At</button>
                    </div>
                </div>
                
                <div class="match-card locked-container">
                    <div class="locked-overlay" onclick="window.openPremiumModal()">
                        <span style="font-size:28px; margin-bottom:8px;">🔒</span>
                        <span style="font-size:13px; font-weight:bold; color:#1F2937;">Kilidi Aç & Bağlan!</span>
                    </div>
                    <div class="locked-blur">
                        <div class="avatar">👩‍🎓</div>
                        <h4>B*** Y***</h4>
                        <p>${userFac}</p>
                        <button class="action-btn">Mesaj At</button>
                    </div>
                </div>
                
                <div class="match-card locked-container">
                    <div class="locked-overlay" onclick="window.openPremiumModal()">
                        <span style="font-size:28px; margin-bottom:8px;">🔒</span>
                        <span style="font-size:13px; font-weight:bold; color:#1F2937;">Seni İnceleyen Kişi</span>
                    </div>
                    <div class="locked-blur">
                        <div class="avatar">👀</div>
                        <h4>M*** E***</h4>
                        <p>${userFac} (Ortak İlgi)</p>
                        <button class="action-btn">Mesaj At</button>
                    </div>
                </div>
            </div>
            <div style="text-align:center; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                <button class="premium-upgrade-btn premium-glow" onclick="window.openPremiumModal()">
                    🌟 Kilitleri Açmak İçin Premium'a Geç
                </button>
            </div>
        `;
    }

    return `
        ${usernameWarning}
        <div class="card" style="background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: white; border:none;">
            <h2 style="font-size:24px; margin-bottom:8px;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
            <p style="opacity:0.9; font-size:15px;">
                <strong style="color:#D9FDD3;">${window.userProfile.university}</strong> ağındasın. Kendi kampüsünün ilanlarını ve akışını keşfet.
            </p>
        </div>
        
        <div class="card" style="padding: 12px 20px; display:flex; align-items:center; gap:12px; margin-bottom: 24px; border-radius: 16px;">
            <div style="font-size:18px;">🔍</div>
            <div style="display:flex; flex:1; align-items:center; background:#F3F4F6; border-radius:12px; padding:0 12px; border:1px solid transparent; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.background='white';" onblur="this.style.borderColor='transparent'; this.style.background='#F3F4F6';">
                <span style="color:var(--primary); font-weight:800; font-size:16px;">#</span>
                <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:10px 8px; outline:none; font-size:15px; font-weight:600; color:var(--text-dark);" placeholder="arkadasini_bul" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
            </div>
            <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:10px 18px; border-radius:12px;" onclick="window.searchAndAddFriend()">Ekle</button>
        </div>
        
        <div class="card">
            ${aiRadarContent}
        </div>
    `;
}

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
// 6. İLAN YÖNETİMİ (MARKET VE LIGHTBOX ENTEGRASYONU)
// ============================================================================

window.renderListings = function(type, title, buttonTextType) {
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
    window.drawListingsGrid(type, buttonTextType, '');
    
    const searchInput = document.getElementById('local-search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => { window.drawListingsGrid(type, buttonTextType, e.target.value.toLowerCase()); }); 
    }
};

window.drawListingsGrid = function(type, buttonTextType, filterText) {
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

        if (item.imgUrl) { imgHtml = `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">`; } 
        else { imgHtml = `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`; }

        gridHtml += `
            <div class="item-card" onclick="window.openListingDetail('${item.id}', '${buttonTextType}')">
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

window.openListingDetail = function(docId, type) {
    const item = marketDB.find(i => i.id === docId);
    if(!item) return;

    let imgHtml = '';
    let indicatorsHtml = '';
    const displayCurrency = item.currency || '₺';

    if (item.imgUrls && item.imgUrls.length > 0) {
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
    const btnText = type === 'market' ? 'Satıcıya Yaz' : 'İletişime Geç';
    const currentUid = window.userProfile.uid || (auth.currentUser ? auth.currentUser.uid : null);
    const safeTitle = item.title.replace(/'/g, "\\'"); 

    if (item.sellerId === currentUid) {
         actionButtonsHtml = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
            </div>
         `;
    } else {
         actionButtonsHtml = `
            <button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px;" onclick="window.startMarketChat('${item.sellerId}', '${item.sellerName}', 'Merhaba, \\'${safeTitle}\\' ilanınızla ilgileniyorum.'); window.closeModal();">💬 ${btnText}</button>
         `;
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
    const formTitle = type === 'market' ? '🛒 Kampüs Market İlanı Ekle' : '🔑 Ev Arkadaşı & Yurt İlanı Ekle';
    const titlePlaceholder = type === 'market' ? 'İlan Başlığı (Örn: Temiz Çalışma Masası)' : 'İlan Başlığı (Örn: Acil Ev Arkadaşı Aranıyor)';
    const descPlaceholder = type === 'market' ? 'Ürünün durumu ve detayları...' : 'Evin kuralları, konumu ve aranan özellikler...';

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
            <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf Çek / Galeriden Seç (Max 3)</button>
            <input type="file" id="new-item-photo" accept="image/*" multiple style="display:none;" />
        </div>
        <div id="preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
        <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Fotoğraflar Yükleniyor, lütfen bekleyin...</p>
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
                    const reader = new FileReader();
                    reader.onload = function(event) { previewContainer.innerHTML += `<div class="preview-box"><img src="${event.target.result}"></div>`; }
                    reader.readAsDataURL(file);
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
    if(files.length === 0) { alert("Lütfen en az 1 fotoğraf seçin veya çekin."); return; }

    btn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.innerText = "Fotoğraflar Yükleniyor, lütfen bekleyin...";
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
            sellerId: window.userProfile.uid, sellerName: window.userProfile.name + " " + window.userProfile.surname, createdAt: serverTimestamp()
        });

        window.closeModal();
        alert("İlanınız başarıyla fotoğraflarıyla birlikte yayınlandı!");
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
// 7. MESAJLAŞMA VE BİLDİRİMLER
// ============================================================================

window.startMarketChat = async function(targetUserId, targetUserName, autoText) {
    try {
        const myUid = auth.currentUser.uid;
        const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
        const snap = await getDocs(q);
        
        let existingChatId = null;
        snap.forEach(doc => {
            const p = doc.data().participants || [];
            if (p.includes(targetUserId)) existingChatId = doc.id;
        });

        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        if(!existingChatId) {
            const newDocRef = await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), status: 'accepted', messages: [{ senderId: myUid, text: autoText, time: timeStr, read: false }] 
            });
            existingChatId = newDocRef.id;
        } else {
            await updateDoc(doc(db, "chats", existingChatId), {
                status: 'accepted', messages: arrayUnion({ senderId: myUid, text: autoText, time: timeStr, read: false }), lastUpdated: serverTimestamp()
            });
        }
        window.loadPage('messages');
        setTimeout(() => window.openChatView(existingChatId), 500); 
    } catch (error) {
        alert("Mesaj başlatılırken hata oluştu: " + error.message);
    }
};

window.renderNotifications = function() {
    const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
    let html = `<div class="card"><h2 style="margin-bottom: 20px;">🔔 Bildirimler ve Arkadaşlık İstekleri</h2>`;
    
    if (incomingRequests.length === 0) {
        html += `<p style="text-align:center; color:var(--text-gray); padding: 40px 0;">Henüz bekleyen bir bildiriminiz yok.</p>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:15px;">`;
        incomingRequests.forEach(req => {
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#F9FAFB; padding:15px 20px; border-radius:12px; border:1px solid var(--border-color); flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div class="avatar" style="margin:0; width:50px; height:50px; font-size:24px;">${req.avatar}</div>
                        <div>
                            <strong style="display:block; font-size:16px; color:var(--text-dark);">${req.name}</strong>
                            <span style="font-size:13px; color:var(--text-gray);">Sizi arkadaş olarak eklemek istiyor.</span>
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
            messages: arrayUnion({ senderId: "system", text: "Arkadaşlık isteği kabul edildi. Artık mesajlaşabilirsiniz! 🎉", time: timeStr, read: false }),
            lastUpdated: serverTimestamp()
        });
        alert("İstek kabul edildi! Mesajlarım bölümünden yazışabilirsiniz.");
        window.renderNotifications(); 
    } catch(error) { alert("Hata oluştu: " + error.message); }
};

window.rejectRequest = async function(chatId) {
    if(confirm("Bu arkadaşlık isteğini reddetmek istediğinize emin misiniz?")) {
        try { await deleteDoc(doc(db, "chats", chatId)); alert("İstek silindi."); window.renderNotifications(); } 
        catch(error) { alert("Hata oluştu: " + error.message); }
    }
};

window.renderMessagesSidebarOnly = function() {
    const sidebar = document.querySelector('.chat-sidebar');
    if(!sidebar) return;
    
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
    let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10;">Mesajlarım</div>`;
    
    if (visibleChats.length === 0) html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Aktif mesajınız bulunmuyor.</p>`;

    visibleChats.forEach(chat => {
        const lastMsgObj = chat.messages[chat.messages.length - 1];
        let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
        const isActive = chat.id === currentChatId ? 'active' : '';
        if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) rawLastMsg = "⏳ İstek gönderildi, bekleniyor...";
        const previewMsg = rawLastMsg.replace(/<br>/g, ' ').substring(0, 35) + (rawLastMsg.length > 35 ? "..." : "");

        html += `
            <div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')">
                <div class="avatar">${chat.avatar}</div>
                <div class="chat-contact-info">
                    <div class="chat-contact-top"><span class="chat-contact-name">${chat.name}</span><span class="chat-contact-time">${lastMsgObj ? lastMsgObj.time : ""}</span></div>
                    <div class="chat-contact-last">${previewMsg}</div>
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
            if (msg.read) ticks = '<span class="ticks" title="Okundu" style="color:#3B82F6; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>';
            else ticks = '<span class="ticks" title="İletildi" style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>';
        }
        chatHTML += `<div class="bubble ${type}"><div class="msg-text">${msg.text}</div><div class="msg-time" style="display:flex; align-items:center; justify-content:flex-end;">${msg.time} ${ticks}</div></div>`; 
    });
    scrollBox.innerHTML = chatHTML;
    scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.renderMessages = function() {
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));

    let html = `
        <div class="card" style="padding:0; border:none; background:transparent;">
            <div class="chat-layout" id="chat-layout-container">
                <div class="chat-sidebar" id="sidebar-container"></div>
                <div class="chat-main" id="chat-main-view">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-gray); opacity:0.7;">
                        <div style="font-size:48px; margin-bottom:10px;">💬</div>
                        <div>Mesajlaşmaya veya istekleri görüntülemeye başlamak için sol taraftan bir kişi seçin.</div>
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

    let chatHTML = `
        <div class="chat-header">
            <button class="back-btn" onclick="document.getElementById('chat-layout-container').classList.remove('chat-active'); window.resetCurrentChatId();">←</button>
            <div class="avatar" style="width:42px; height:42px; font-size:20px; margin:0;">${activeChat.avatar}</div>
            <div class="chat-header-info">
                <div class="chat-header-name">${activeChat.name}</div>
                <div class="chat-header-status">UniLoop Ağı</div>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages-scroll"></div>
    `;
    
    if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
         chatHTML += `<div style="padding: 20px; text-align: center; color: var(--text-gray); background: #F9FAFB; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ Arkadaşlık isteğinizin karşı tarafça kabul edilmesi bekleniyor...</div>`;
    } else {
         chatHTML += `
            <div class="chat-input-area">
                <div class="chat-input-wrapper"><input type="text" id="chat-input-field" placeholder="Bir mesaj yazın..."></div>
                <button class="chat-send-btn" onclick="window.sendMsg('${chatId}')">➤</button>
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
            <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center; font-size:15px; border:1px dashed var(--primary); background:var(--bg-secondary); padding:12px; border-radius:12px;">📷 Fotoğraf Ekle (İsteğe Bağlı)</button>
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

        html += `
        <div class="feed-post">
            <div class="feed-post-header">
                <div class="feed-post-avatar">${post.avatar}</div>
                <div class="feed-post-meta">
                    <span class="feed-post-author">${post.user}</span>
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

    container.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <div class="feed-post-avatar" style="width:48px; height:48px; font-size:28px;">${post.avatar}</div>
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
// 9. SORU VE CEVAP (Q&A)
// ============================================================================

window.renderQA = function() {
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:10px;">
                <h2 style="margin:0;">❓ Kampüs Soru & Cevap</h2>
                <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openQAForm()">+ Soru Sor</button>
            </div>
            <div class="qa-filters" id="qa-filters-container">
                <button class="qa-filter-btn active" data-filter="Genel" onclick="window.filterQA(this, 'Genel')">Genel</button>
                <button class="qa-filter-btn" data-filter="Yurtlar" onclick="window.filterQA(this, 'Yurtlar')">Yurtlar</button>
                <button class="qa-filter-btn" data-filter="Ders" onclick="window.filterQA(this, 'Ders')">Ders</button>
                <button class="qa-filter-btn" data-filter="Kampüs Yaşamı" onclick="window.filterQA(this, 'Kampüs Yaşamı')">Kampüs Yaşamı</button>
            </div>
            <div id="qa-feed"></div>
        </div>
    `;
    mainContent.innerHTML = html;
    window.drawQAGrid('Genel'); 
};

window.filterQA = function(btn, filterName) {
    document.querySelectorAll('.qa-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.drawQAGrid(filterName);
};

window.openQAForm = function() {
    window.openModal('Yeni Soru Sor', `
        <div class="form-group">
            <label>Kategori Seç</label>
            <select id="new-qa-tag">
                <option>Genel</option><option>Yurtlar</option><option>Ders</option><option>Kampüs Yaşamı</option>
            </select>
        </div>
        <textarea id="new-qa-text" class="form-group" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:15px;" placeholder="Sorunuzu detaylı yazın..."></textarea>
        <button class="btn-primary" id="publish-qa-btn" onclick="window.submitQA()">Soruyu Yayınla</button>
    `);
};

window.submitQA = async function() {
    const textEl = document.getElementById('new-qa-text');
    const tagEl = document.getElementById('new-qa-tag');
    const btn = document.getElementById('publish-qa-btn');
    if(!textEl || textEl.value.trim() === '') return;
    btn.disabled = true;
    
    try {
        await addDoc(collection(db, "qa"), {
            avatar: window.userProfile.avatar, user: window.userProfile.name, time: "Şimdi", 
            tag: tagEl.value, question: textEl.value, answers: [], createdAt: serverTimestamp()
        });
        window.closeModal();
    } catch(e) { alert("Hata: Firebase kilitlerini kontrol edin."); btn.disabled = false; }
};

window.drawQAGrid = function(filterTag = 'Genel') {
    const feed = document.getElementById('qa-feed');
    if(!feed) return;
    let filteredDB = filterTag === 'Genel' ? qaDB : qaDB.filter(q => q.tag === filterTag);
    
    if(filteredDB.length === 0) { 
        feed.innerHTML = `<p style="text-align:center; padding: 30px 0; color:var(--text-gray);">Bu kategoride henüz soru yok.</p>`; 
        return; 
    }

    let html = '';
    filteredDB.forEach((q) => {
        const statusClass = q.answers.length > 0 ? 'answered' : '';
        html += `
            <div class="qa-card" onclick="window.openQADetail('${q.id}')">
                <div class="qa-left-stats"><div class="qa-stat-box ${statusClass}"><div style="font-size:18px;">${q.answers.length}</div><div style="font-weight:500;">Cevap</div></div></div>
                <div class="qa-right-content">
                    <div class="qa-title">${q.question}</div>
                    <div class="qa-meta"><span class="qa-tag">${q.tag}</span><span>Soran: <strong>${q.user}</strong></span></div>
                </div>
            </div>`;
    });
    feed.innerHTML = html;
};

window.openQADetail = function(docId) {
    const q = qaDB.find(item => item.id === docId);
    if(!q) return;
    
    let answersHtml = '';
    if(q.answers.length === 0) {
        answersHtml = '<p style="text-align:center; padding:20px; color:var(--text-gray);">İlk cevap veren sen ol!</p>';
    } else {
        q.answers.forEach(ans => { 
            answersHtml += `<div style="background:inherit; padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border-color);"><div style="font-weight:bold; color:var(--primary); margin-bottom:6px;">${ans.user}</div><div style="font-size:15px;">${ans.text}</div></div>`; 
        });
    }

    window.openModal('Soru Detayı', `
        <div style="margin-bottom: 24px;"><span class="qa-tag" style="font-size:12px;">${q.tag}</span><div style="font-size:18px; font-weight:800; margin-top:12px;">${q.question}</div></div>
        <div style="border-top:1px solid var(--border-color); padding-top:24px; margin-bottom:24px;"><h4>Cevaplar (${q.answers.length})</h4><div class="answers-container">${answersHtml}</div></div>
        <div style="display:flex; gap:10px;"><input type="text" id="new-answer-input" class="form-group" style="flex:1; margin:0;" placeholder="Cevabını yaz..."><button class="btn-primary" style="width:auto;" onclick="window.submitAnswer('${q.id}')">Gönder</button></div>
    `);
};

window.submitAnswer = async function(docId) {
    const ansInput = document.getElementById('new-answer-input');
    if(ansInput && ansInput.value.trim() !== '') {
        try { 
            await updateDoc(doc(db, "qa", docId), { answers: arrayUnion({ user: window.userProfile.name, text: ansInput.value.trim() }) }); 
            window.closeModal(); 
        } catch(e) { console.error(e); }
    }
};

// ============================================================================
// 10. FAKÜLTE VE ORGANİZASYON SİSTEMİ (YENİ ACCORDION & FORUM/MEETING ENTEGRELİ)
// ============================================================================

// --- 🌟 KURAL 3: Fakülte Fonksiyonları (FORUM YAPISI) 🌟 ---
window.currentFacultyPosts = [
    { 
        id: 1, 
        user: "Sistem Moderatörü", 
        avatar: "🤖", 
        text: "Fakülte forumuna hoş geldin! Bu alan sadece senin fakültendeki öğrencilere özeldir. Ders notları, sınav takvimleri ve fakülte duyuruları buradan paylaşılacak.", 
        time: "Bugün", 
        likes: 12, 
        replies: 0 
    }
];

window.handleFacultyClick = async function(name, icon, bgColor) {
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
    if(window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');

    const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;

    if(isJoined) { window.loadFacultyFeed(name, icon, bgColor); } 
    else {
        mainContent.innerHTML = `
            <div class="join-faculty-box">
                <div class="icon">${icon}</div><h2>${name} Ağına Hoş Geldin</h2><p>Bu alan kapalı bir ağdır. Girmek için fakülte kodunu girmelisin.</p>
                <div style="max-width: 300px; margin: 0 auto 20px auto;"><input type="text" id="faculty-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Giriş Kodunu Yazın"></div>
                <button class="btn-primary" style="max-width:250px; font-size:16px; padding:12px;" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">Ağa Katıl</button>
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
        window.loadFacultyFeed(name, icon, bgColor);
    } else { alert("Hatalı kod girdiniz. Lütfen tekrar deneyin."); }
};

window.loadFacultyFeed = async function(name, icon, bgColor) {
    window.currentFacultyName = name;
    
    mainContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="padding:20px; background:${bgColor}; color:white; border-radius:16px; display:flex; align-items:center; gap:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:40px; background:rgba(255,255,255,0.2); width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:50%;">${icon}</div>
                <div>
                    <h2 style="margin:0; font-size:22px;">${name} Forumu</h2>
                    <span style="font-size:14px; opacity:0.9;">Fakültendeki diğer öğrencilerle anlık gönderi paylaş</span>
                </div>
            </div>
            
            <div class="card" style="padding:15px; display:flex; gap:15px; align-items:flex-start;">
                <div class="avatar" style="width:40px; height:40px; font-size:20px; margin:0;">${window.userProfile.avatar}</div>
                <div style="flex:1;">
                    <textarea id="faculty-post-input" placeholder="Fakülteye özel bir şeyler paylaş..." style="width:100%; border:none; resize:none; outline:none; font-size:15px; font-family:inherit; background:transparent; min-height:60px;"></textarea>
                    <div style="display:flex; justify-content:flex-end; border-top:1px solid var(--border-color); padding-top:10px; margin-top:10px;">
                        <button class="btn-primary" style="width:auto; padding:8px 20px; border-radius:20px;" onclick="window.submitFacultyPost()">Gönderiyi Yayınla</button>
                    </div>
                </div>
            </div>

            <div id="faculty-posts-container" style="display:flex; flex-direction:column; gap:15px;"></div>
        </div>
    `;
    window.renderFacultyPosts();
};

window.submitFacultyPost = function() {
    const input = document.getElementById('faculty-post-input');
    if(!input || input.value.trim() === '') return;
    
    window.currentFacultyPosts.unshift({
        id: Date.now(),
        user: window.userProfile.name + " " + window.userProfile.surname,
        avatar: window.userProfile.avatar,
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
        html += `
            <div class="card" style="padding:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar" style="width:40px; height:40px; font-size:20px; margin:0;">${post.avatar}</div>
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
                        💬 Yanıtla (${post.replies})
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
};


// --- 🌟 KURAL 4: Kulüp ve Organizasyonlar Fonksiyonları (YENİ: LOBİ -> TOPLANTI GEÇİŞİ) 🌟 ---
window.handleOrganizationClick = async function(name, icon, bgColor) {
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
    if(window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');

    const isJoined = window.joinedOrganizations.some(o => o.name === name) || window.userProfile.organization === name;

    if(isJoined) { window.loadOrganizationFeed(name, icon, bgColor); } 
    else {
        mainContent.innerHTML = `
            <div class="join-faculty-box">
                <div class="icon">${icon}</div><h2>${name} Ağına Hoş Geldin</h2><p>Bu kulüp kapalı bir organizasyondur. Katılmak için giriş kodunu girmelisin.</p>
                <div style="max-width: 300px; margin: 0 auto 20px auto;"><input type="text" id="org-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Katılım Kodunu Yazın"></div>
                <button class="btn-primary" style="max-width:250px; font-size:16px; padding:12px;" onclick="window.verifyOrganizationCode('${name}', '${icon}', '${bgColor}')">Organizasyona Katıl</button>
            </div>
        `;
        window.scrollTo(0,0);
    }
};

window.verifyOrganizationCode = async function(name, icon, bgColor) {
    const inputCode = document.getElementById('org-passcode-input').value.trim();
    if (ORGANIZATION_PASSCODES[name] && inputCode.toLowerCase() === ORGANIZATION_PASSCODES[name].toLowerCase()) {
        window.userProfile.organization = name; 
        window.joinedOrganizations = [{name: name, icon: icon, color: bgColor}]; 
        await updateDoc(doc(db, "users", window.userProfile.uid), { organization: name });
        // Doğrulamadan sonra Lobiye yönlendir!
        window.loadOrganizationFeed(name, icon, bgColor);
    } else { alert("Hatalı kod girdiniz. Lütfen kulüp yönetimi ile iletişime geçin."); }
};

window.sendReaction = function() {
    const emoji = document.createElement('div');
    emoji.innerText = '😄';
    emoji.style.cssText = 'position:fixed; bottom:100px; right:50%; font-size:48px; z-index:99999; animation: flyUpAndFade 2s ease-out forwards; pointer-events:none; transform: translateX(50%);';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 2000);
};

// YENİ: KULÜP LOBİSİ (DUYURULAR, SOHBET VE TOPLANTI OLUŞTURMA ALANI)
window.loadOrganizationFeed = async function(name, icon, bgColor) {
    mainContent.innerHTML = `
        <div style="display:flex; flex-direction:column; height:calc(100vh - 90px); background:var(--card-bg); border-radius:16px; overflow:hidden; border:1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="padding:20px; background:${bgColor}; color:white; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:32px; background:rgba(255,255,255,0.2); width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:50%;">${icon}</span>
                    <div>
                        <h2 style="margin:0; font-size:20px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${name} Lobisi</h2>
                        <span style="font-size:13px; opacity:0.9;">Duyurular, Yazılı Sohbet ve Canlı Toplantılar</span>
                    </div>
                </div>
            </div>

            <div style="display:flex; flex:1; overflow:hidden; flex-wrap:wrap;">
                
                <div style="flex:1; min-width:300px; padding:20px; border-right:1px solid var(--border-color); overflow-y:auto; background:#F9FAFB;">
                    
                    <h3 style="margin-bottom:15px; font-size:16px; display:flex; align-items:center; gap:8px;">📢 Güncel Duyurular</h3>
                    <div style="background:white; padding:15px; border-radius:12px; border:1px solid var(--border-color); margin-bottom:25px;">
                        <strong style="color:var(--primary); font-size:14px;">Kulüp Yönetimi</strong>
                        <p style="font-size:14px; margin-top:5px; color:var(--text-dark);">Hoş geldiniz! İletişimi buradan sağlayabilir, anlık toplantılar başlatabilirsiniz. Kameraları test etmeyi unutmayın!</p>
                        <span style="font-size:11px; color:var(--text-gray); display:block; margin-top:8px;">Bugün, 09:00</span>
                    </div>

                    <h3 style="margin-bottom:15px; font-size:16px; display:flex; align-items:center; gap:8px;">🎙️ Sesli & Görüntülü Odalar</h3>
                    
                    <div style="background:white; padding:20px; border-radius:12px; border:1px solid #E5E7EB; text-align:center; margin-bottom:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-size:40px; margin-bottom:10px;">👥</div>
                        <h4 style="margin-bottom:5px; color:var(--text-dark);">Yeni Toplantı Başlat</h4>
                        <p style="font-size:13px; color:var(--text-gray); margin-bottom:15px;">Şu an kimse konuşmuyor. İlk başlatan sen ol!</p>
                        <button class="btn-primary" style="width:100%; border-radius:12px; font-size:15px;" onclick="window.joinLiveMeeting('${name}', '${icon}', '${bgColor}')">🎙️ Konuşma Oluştur</button>
                    </div>

                    <div style="background:#F0FDF4; padding:15px; border-radius:12px; border:1px solid #86EFAC; display:flex; justify-content:space-between; align-items:center;">
                        <div style="text-align:left;">
                            <div style="color:#059669; font-weight:800; font-size:14px; display:flex; align-items:center; gap:6px;">
                                <span style="width:10px; height:10px; background:#10B981; border-radius:50%; display:inline-block; animation: pulse 1.5s infinite;"></span> Aktif Konuşma Var
                            </div>
                            <div style="font-size:12px; color:#047857; margin-top:4px; font-weight:600;">Moderatör ve 2 kişi içeride</div>
                        </div>
                        <button style="background:#10B981; color:white; border:none; padding:10px 16px; border-radius:10px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10B981'" onclick="window.joinLiveMeeting('${name}', '${icon}', '${bgColor}')">Katıl ➤</button>
                    </div>

                </div>

                <div style="flex:1; min-width:300px; display:flex; flex-direction:column; background:white;">
                    <div style="padding:15px; border-bottom:1px solid var(--border-color); font-weight:bold; display:flex; justify-content:space-between; background:#F9FAFB;">
                        <span>💬 Genel Yazılı Sohbet</span>
                    </div>
                    
                    <div style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
                        <div style="font-size:13px; line-height:1.5; background:#EEF2FF; padding:12px 16px; border-radius:16px; border-bottom-left-radius:0; align-self:flex-start; max-width:85%;">
                            <strong style="color:var(--primary); display:block; margin-bottom:4px;">Sistem Moderatörü</strong>
                            Kulüp sohbet odasına katıldınız. Küfür, argo ve saygısızlık yasaktır.
                            <div style="font-size:10px; color:#6B7280; text-align:right; margin-top:4px;">Şimdi</div>
                        </div>
                    </div>

                    <div style="padding:15px; border-top:1px solid var(--border-color); display:flex; gap:10px; background:white; align-items:center;">
                        <input type="text" placeholder="Kulübe bir şeyler yaz..." style="flex:1; padding:12px 16px; border-radius:24px; border:1px solid #D1D5DB; background:#F9FAFB; outline:none; font-size:14px; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.background='white';">
                        <button class="btn-primary" style="width:auto; border-radius:24px; padding:10px 20px; font-size:14px;" onclick="alert('Gerçek zamanlı yazılı sohbet entegrasyon aşamasındadır.')">➤</button>
                    </div>
                </div>

            </div>
        </div>
    `;
};

// YENİ: AKTİF TOPLANTI ODASINA GİRİŞ (KAMERALI/SESLİ EKRAN)
window.joinLiveMeeting = async function(name, icon, bgColor) {
    mainContent.innerHTML = `
        <div style="display:flex; flex-direction:column; height:calc(100vh - 90px); background:#111827; border-radius:16px; overflow:hidden; color:white; font-family: system-ui, -apple-system, sans-serif;">
            
            <div style="padding:15px 20px; background:#1F2937; border-bottom:1px solid #374151; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:24px;">${icon}</span>
                    <h2 style="margin:0; font-size:18px; font-weight:600;">${name} - Canlı Toplantı Odası</h2>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="background:rgba(239, 68, 68, 0.2); color:#FCA5A5; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold; display:flex; align-items:center; gap:6px;">
                        <div style="width:8px; height:8px; background:#EF4444; border-radius:50%; animation: pulse 1.5s infinite;"></div> CANLI
                    </span>
                </div>
            </div>

            <div style="display:flex; flex:1; overflow:hidden; flex-wrap:wrap;">
                
                <div style="flex:2; min-width:300px; padding:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:15px; overflow-y:auto; background:#111827; align-content:start;">
                    
                    <div style="background:#374151; border-radius:12px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; aspect-ratio: 16/9; border:2px solid var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <div style="font-size:50px;">${window.userProfile.avatar}</div>
                        <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:bold;">Sen</div>
                        <div style="position:absolute; top:10px; right:10px; background:#10B981; width:12px; height:12px; border-radius:50%; box-shadow:0 0 5px #10B981;"></div>
                    </div>

                    <div style="background:#1F2937; border-radius:12px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; aspect-ratio: 16/9; border:1px solid #374151;">
                        <div style="width:70px; height:70px; background:#4B5563; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:30px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">👤</div>
                        <div style="position:absolute; top:15px; font-size:12px; color:#10B981; font-weight:bold;">🎙️ Konuşuyor...</div>
                        <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:6px; font-size:12px; font-weight:bold;">Moderatör</div>
                    </div>

                    <div style="background:#1F2937; border-radius:12px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; aspect-ratio: 16/9; border:1px solid #374151;">
                        <div style="width:70px; height:70px; background:#4B5563; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:30px;">👩‍🎓</div>
                        <div style="position:absolute; bottom:10px; right:10px; font-size:14px; background:rgba(239,68,68,0.2); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">🔇</div>
                        <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:6px; font-size:12px;">Ayşe Y.</div>
                    </div>

                </div>

                <div style="flex:1; min-width:300px; max-width:400px; background:#1F2937; border-left:1px solid #374151; display:flex; flex-direction:column;">
                    <div style="padding:15px; border-bottom:1px solid #374151; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                        <span>Toplantı Sohbeti</span>
                        <span style="font-size:12px; background:#374151; padding:2px 8px; border-radius:10px;">👥 3 Kişi</span>
                    </div>
                    
                    <div style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
                        <div style="font-size:13px; line-height:1.5;">
                            <strong style="color:#60A5FA;">Moderatör:</strong> Herkese merhaba, kulüp etkinlik planlaması için saat 20:00'de ajandayı paylaşacağım.
                            <div style="font-size:10px; color:#9CA3AF; margin-top:2px;">19:55</div>
                        </div>
                        <div style="font-size:13px; line-height:1.5;">
                            <strong style="color:#FCA5A5;">Ayşe Y.:</strong> Harika, bekliyoruz! Kamera açamıyorum şu an kusura bakmayın.
                            <div style="font-size:10px; color:#9CA3AF; margin-top:2px;">19:57</div>
                        </div>
                    </div>

                    <div style="padding:15px; border-top:1px solid #374151; display:flex; gap:10px;">
                        <input type="text" placeholder="Mesaj yaz..." style="flex:1; padding:10px 12px; border-radius:8px; border:none; background:#374151; color:white; outline:none; font-size:13px;">
                        <button style="background:var(--primary); border:none; color:white; border-radius:8px; padding:0 15px; cursor:pointer;" onclick="alert('Mesaj sistemi entegrasyon aşamasında.')">➤</button>
                    </div>
                </div>
            </div>

            <div style="padding:15px 20px; background:#1F2937; border-top:1px solid #374151; display:flex; justify-content:center; align-items:center; gap:20px; flex-wrap:wrap;">
                <button style="width:50px; height:50px; border-radius:50%; border:none; background:#374151; color:white; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'" title="Sesi Kapat/Aç">🎙️</button>
                <button style="width:50px; height:50px; border-radius:50%; border:none; background:#374151; color:white; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'" title="Kamerayı Kapat/Aç">📹</button>
                <button style="width:50px; height:50px; border-radius:50%; border:none; background:#374151; color:white; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'" title="Ekran Paylaş">💻</button>
                <button style="width:50px; height:50px; border-radius:50%; border:none; background:#374151; color:white; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#374151'" title="Reaksiyon Gönder" onclick="window.sendReaction()">✋</button>
                
                <button style="padding:0 25px; height:50px; border-radius:25px; border:none; background:#EF4444; color:white; font-size:15px; font-weight:bold; cursor:pointer; transition:0.2s; margin-left:auto;" onmouseover="this.style.background='#DC2626'" onmouseout="this.style.background='#EF4444'" onclick="window.loadOrganizationFeed('${name}', '${icon}', '${bgColor}')">Odadan Ayrıl 📵</button>
            </div>

            <style>
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            </style>
        </div>
    `;
};


// ============================================================================
// 11. SAYFA YÖNLENDİRME (ROUTING) VE PROFİL YÖNETİMİ
// ============================================================================

window.loadPage = function(pageName) {
    if (pageName === 'home') mainContent.innerHTML = getHomeContent();
    else if (pageName === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
    else if (pageName === 'housing') window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
    else if (pageName === 'confessions') window.renderConfessions();
    else if (pageName === 'qa') window.renderQA(); 
    else if (pageName === 'messages') window.renderMessages(); 
    else if (pageName === 'notifications') window.renderNotifications();
    else if (pageName === 'settings') window.renderSettings();
    else if (pageName === 'profile') window.renderProfile();
    
    if(window.innerWidth <= 1024 && document.getElementById('sidebar')) document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0,0);
};

document.querySelectorAll('.menu-item[data-target]').forEach(item => {
    item.addEventListener('click', (e) => {
        if(e.currentTarget.getAttribute('data-target')) {
            document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
            e.currentTarget.classList.add('active'); 
            window.loadPage(e.currentTarget.getAttribute('data-target'));
        }
    });
});

bind('logo-btn', 'click', () => { 
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active')); 
    document.querySelector('[data-target="home"]').classList.add('active'); 
    window.loadPage('home'); 
});

bind('profile-btn', 'click', () => { 
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active')); 
    window.loadPage('profile'); 
});

window.renderProfile = function() {
    let premiumBadge = window.userProfile.isPremium ? '<span style="font-size:12px; background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:8px; font-weight:bold; margin-left:10px;">🌟 Premium</span>' : '';
    mainContent.innerHTML = `
        <div class="card">
            <h2>👤 Profil Bilgilerim ${premiumBadge}</h2>
            <div style="background: inherit; padding: 24px; border-radius: 16px; border: 1px solid var(--border-color);">
                <div class="grid-2col" style="margin-top:0;">
                    <div class="form-group"><label>Ad</label><input type="text" id="prof-name" value="${window.userProfile.name}"></div>
                    <div class="form-group"><label>Soyad</label><input type="text" id="prof-surname" value="${window.userProfile.surname}"></div>
                </div>
                <div class="form-group">
                    <label>Kullanıcı Adı</label>
                    <div style="display:flex; align-items:center; background:inherit; border:1px solid #D1D5DB; border-radius:10px; overflow:hidden; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 0 3px rgba(79, 70, 229, 0.1)';" onblur="this.style.borderColor='#D1D5DB'; this.style.boxShadow='none';">
                        <span style="padding-left:12px; color:var(--primary); font-weight:800; font-size:16px;">#</span>
                        <input type="text" id="prof-username" value="${(window.userProfile.username || '').replace('#', '')}" placeholder="kullaniciadi" style="border:none; background:transparent; width:100%; padding:12px 8px; outline:none; font-size:15px; box-shadow:none; font-weight:600; color:var(--text-dark);">
                    </div>
                </div>
                <div class="form-group"><label>Üniversite</label><input type="text" disabled value="${window.userProfile.university}" style="background:#E5E7EB; cursor:not-allowed;"></div>
                <div class="form-group"><label>E-posta</label><input type="email" disabled value="${window.userProfile.email}" style="background:#E5E7EB; cursor:not-allowed;"></div>
                <button class="btn-primary" onclick="window.saveProfile()" style="padding:12px; margin-bottom: 15px;">Profilimi Kaydet</button>
                <button class="btn-danger" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>
            </div>
        </div>
    `;
};

window.saveProfile = async function() {
    const name = document.getElementById('prof-name').value; 
    const surname = document.getElementById('prof-surname').value;
    let rawUsername = document.getElementById('prof-username').value.trim().toLowerCase();
    
    if(!rawUsername) { alert("Kullanıcı adı boş bırakılamaz!"); return; }
    
    rawUsername = rawUsername.replace(/^#/, '');
    const username = '#' + rawUsername;
    
    if(username !== window.userProfile.username) {
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const snapshot = await getDocs(q);
            if(!snapshot.empty) { alert("Bu kullanıcı adı başkası tarafından alınmış. Lütfen başka bir tane deneyin."); return; }
        } catch(e) { console.error(e); alert("Bir hata oluştu, lütfen tekrar deneyin."); return; }
    }
    
    window.userProfile.name = name; window.userProfile.surname = surname; window.userProfile.username = username;
    
    try {
        await updateDoc(doc(db, "users", window.userProfile.uid), { name: name, surname: surname, username: username });
        window.openModal('Başarılı', `<div style="text-align:center;"><p style="font-size:40px; margin:0;">✅</p><p>Profil güncellendi!</p></div>`);
    } catch(e) { alert("Profil kaydedilirken hata: " + e.message); }
};

window.renderSettings = function() {
    const currentLang = localStorage.getItem('uniloop_lang') || 'tr';
    const currentTheme = localStorage.getItem('uniloop_theme') || 'light';
    const t = TRANSLATIONS[currentLang];

    mainContent.innerHTML = `
        <div class="card">
            <h2>${t.settingsTitle}</h2>
            <div style="background: inherit; padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid var(--border-color);">
                <div class="form-group">
                    <label>${t.langLabel}</label>
                    <select onchange="window.setLanguage(this.value)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; background:transparent;">
                        <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>Türkçe</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>${t.themeLabel}</label>
                    <select onchange="window.toggleTheme(this.value)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; background:transparent;">
                        <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>${t.lightMode}</option>
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>${t.darkMode}</option>
                    </select>
                </div>
            </div>
            <button class="btn-danger" onclick="window.logout()">${t.logoutBtn}</button>
        </div>
    `;
};


}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUniLoop);
} else {
    initializeUniLoop();
}

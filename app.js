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

const globalUniversities = [
    "Yakın Doğu Üniversitesi (NEU)", "Doğu Akdeniz Üniversitesi (EMU)", "Girne Amerikan Üniversitesi (GAU)", "Uluslararası Kıbrıs Üniversitesi (CIU)",
    "Orta Doğu Teknik Üniversitesi (ODTÜ)", "Boğaziçi Üniversitesi", "İstanbul Teknik Üniversitesi (İTÜ)", "Bilkent Üniversitesi", "Koç Üniversitesi"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
let modal = document.getElementById('app-modal'); // Dinamik güncellenecek

function initializeUniLoop() {

// 📦 MODAL VE LIGHTBOX YAPISINI DOM'A ZORUNLU OLARAK ENJEKTE EDELİM
// Böylece HTML dosyasında eksik olsa bile butonlar her zaman çalışır.
if (!document.getElementById('app-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'app-modal';
    modalDiv.className = 'modal';
    modalDiv.innerHTML = `
        <div class="modal-content" style="background: white; width: 90%; max-width: 500px; margin: 50px auto; border-radius: 16px; padding: 20px; position: relative; max-height: 85vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h3 id="modal-title" style="margin: 0; font-size: 18px; color: #111827;"></h3>
                <button id="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</button>
            </div>
            <div id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    modal = modalDiv;
}

if (!document.getElementById('lightbox')) {
    const lbDiv = document.createElement('div');
    lbDiv.id = 'lightbox';
    lbDiv.className = 'modal';
    lbDiv.style.cssText = "background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; flex-direction: column;";
    lbDiv.innerHTML = `
        <button onclick="window.closeLightbox()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 40px; cursor: pointer; z-index: 999999;">&times;</button>
        <img id="lightbox-img" src="" style="max-width: 95%; max-height: 80vh; object-fit: contain; border-radius: 8px;">
        <div id="lightbox-counter" style="color: white; margin-top: 15px; font-size: 16px;"></div>
        <div style="display:flex; gap: 40px; margin-top: 20px;">
            <button onclick="window.changeLightboxImage(-1)" style="background: rgba(255,255,255,0.2); border:none; color:white; padding: 10px 20px; border-radius: 8px; font-size: 20px; cursor: pointer;">❮</button>
            <button onclick="window.changeLightboxImage(1)" style="background: rgba(255,255,255,0.2); border:none; color:white; padding: 10px 20px; border-radius: 8px; font-size: 20px; cursor: pointer;">❯</button>
        </div>
    `;
    document.body.appendChild(lbDiv);
}

// 🎨 DINAMIK CSS ENJEKSIYONU VE STIL AYARLARI
const styleFix = document.createElement('style');
styleFix.innerHTML = `
    html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; }
    
    /* MODAL CSS GARANTİSİ */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; opacity: 0; visibility: hidden; pointer-events: none; z-index: -999; transition: 0.2s; }
    #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; }
    #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; }
    
    #auth-screen { position: relative; z-index: 1000 !important; }
    #auth-screen button, #auth-screen a, #auth-screen input, #auth-screen select { pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 1001 !important; }
    button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { cursor: pointer !important; position: relative; pointer-events: auto !important; z-index: 10; }
    
    #sidebar { display: none !important; }
    #mobile-menu-btn { display: none !important; }
    #main-content { padding-bottom: 75px !important; }

    /* YENİ ESTETİK, İNCE VE PROFESYONEL ALT BAR (BOTTOM NAV) */
    .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; border-top: 1px solid #f1f1f1; display: flex; justify-content: space-around; align-items: center; padding-bottom: env(safe-area-inset-bottom); height: 60px; z-index: 9999; box-shadow: 0 -2px 10px rgba(0,0,0,0.02); }
    .bottom-nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8E8E93; font-size: 10px; text-decoration: none; cursor: pointer; transition: 0.2s; flex: 1; background: transparent !important; border: none !important; font-weight: 500; -webkit-tap-highlight-color: transparent; height: 100%; padding: 0; }
    .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
    .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
    .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
    .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
    .bottom-nav-item.active .bottom-nav-icon svg { stroke-width: 2.2; }

    /* MESAJLARDA KAYDIRMA İYİLEŞTİRMESİ (EKRAN KAYMASINI ÖNLER) */
    #chat-layout-container { height: calc(100vh - 120px) !important; max-height: 800px; overflow: hidden !important; display: flex; flex-direction: row; position: relative; }
    .chat-sidebar { overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; }
    .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; }
    #chat-messages-scroll { flex: 1 1 auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth; height: 0; }
    
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
    .premium-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }
    
    body.dark-mode, .dark-mode #main-content { background-color: #121212 !important; color: #e5e7eb !important; }
    .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card { background-color: #1e1e1e !important; border-color: #374151 !important; color: #e5e7eb !important; }
    .dark-mode .modal-content { background-color: #1e1e1e !important; color: #e5e7eb !important; border-color: #374151 !important;}
    .dark-mode .bottom-nav { background: #1e1e1e !important; border-top-color: #374151 !important; }
    
    #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
    #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
    #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 10px; }
    
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

bind('modal-close', 'click', window.closeModal);

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
// 2. OTURUM DURUMU KONTROLÜ, SİHİRBAZ VE YENİ STİLİZASYONLU ALT BAR
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
            let isNewUser = false;
            
            if(docSnap.exists()) {
                window.userProfile = docSnap.data();
                if(window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if(window.userProfile.bio === undefined) window.userProfile.bio = "";
                if(window.userProfile.age === undefined) window.userProfile.age = "";
                if(window.userProfile.avatarUrl === undefined) window.userProfile.avatarUrl = "";
            } else {
                isNewUser = true;
                window.userProfile = { 
                    uid: user.uid, name: user.displayName || "Öğrenci", surname: "", username: "",
                    email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓", faculty: "", bio: "", age: "", avatarUrl: "", 
                    isOnline: true, isPremium: false
                };
                await setDoc(userDocRef, window.userProfile);
            }

            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            
            // ÜST BAR BİLDİRİMLER BUTONU VE PREMIUM
            const headerRightMenu = document.querySelector('.header-right-menu');
            if (headerRightMenu) {
                headerRightMenu.innerHTML = ''; 
                
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

            if(isNewUser) {
                window.startOnboarding();
            } else {
                const activeTab = document.querySelector('.bottom-nav-item.active');
                if(typeof window.loadPage === 'function') {
                    window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); 
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

// ============================================================================
// 🌟 PROFİL OLUŞTURMA SİHİRBAZI (YENİ KULLANICILAR İÇİN) 🌟
// ============================================================================
window.startOnboarding = function() {
    window.currentOnboardingStep = 1;
    window.onboardingData = { username: "", faculty: "", age: "", bio: "" };
    window.renderOnboarding();
};

window.renderOnboarding = function() {
    let title = "Hoş Geldin! 🎉 Profilini Oluşturalım";
    let bodyHtml = "";
    
    if (window.currentOnboardingStep === 1) {
        bodyHtml = `
            <div style="text-align:center;">
                <div style="font-size: 40px; margin-bottom: 10px;">👋</div>
                <h4 style="margin-bottom:10px;">Adım 1: Kullanıcı Adı</h4>
                <p style="font-size:13px; color:#6b7280; margin-bottom:15px;">İnsanlar seni bu isimle bulacak (Boşluk bırakma).</p>
                <div style="display:flex; align-items:center; background:#f9fafb; border:1px solid #d1d5db; border-radius:12px; padding:0 12px; margin-bottom:20px;">
                    <span style="color:var(--primary); font-weight:bold; margin-right:5px;">#</span>
                    <input type="text" id="ob-username" placeholder="kullanici_adin" style="width:100%; padding:12px 0; border:none; outline:none; background:transparent;" value="${window.onboardingData.username.replace('#','')}">
                </div>
                <button class="btn-primary" style="width:100%; padding:12px;" onclick="window.nextOnboarding(1)">İleri ➔</button>
            </div>
        `;
    } else if (window.currentOnboardingStep === 2) {
        bodyHtml = `
            <div style="text-align:center;">
                <div style="font-size: 40px; margin-bottom: 10px;">🎓</div>
                <h4 style="margin-bottom:10px;">Adım 2: Bölüm & Yaş</h4>
                <input type="text" id="ob-faculty" placeholder="Örn: Bilgisayar Mühendisliği" style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; margin-bottom:15px; outline:none;" value="${window.onboardingData.faculty}">
                <input type="number" id="ob-age" placeholder="Yaşın kaç?" style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; margin-bottom:20px; outline:none;" value="${window.onboardingData.age}">
                <div style="display:flex; gap:10px;">
                    <button class="action-btn" style="flex:1;" onclick="window.currentOnboardingStep--; window.renderOnboarding()">Geri</button>
                    <button class="btn-primary" style="flex:1;" onclick="window.nextOnboarding(2)">İleri ➔</button>
                </div>
            </div>
        `;
    } else if (window.currentOnboardingStep === 3) {
        bodyHtml = `
            <div style="text-align:center;">
                <div style="font-size: 40px; margin-bottom: 10px;">✍️</div>
                <h4 style="margin-bottom:10px;">Adım 3: Biyografi</h4>
                <p style="font-size:13px; color:#6b7280; margin-bottom:15px;">Hobilerin neler, kampüste neler yaparsın?</p>
                <textarea id="ob-bio" rows="4" placeholder="Kendinden bahset..." style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; margin-bottom:20px; outline:none; resize:none;">${window.onboardingData.bio}</textarea>
                <div style="display:flex; gap:10px;">
                    <button class="action-btn" style="flex:1;" onclick="window.currentOnboardingStep--; window.renderOnboarding()">Geri</button>
                    <button class="btn-primary" style="flex:1;" onclick="window.nextOnboarding(3)">İleri ➔</button>
                </div>
            </div>
        `;
    } else if (window.currentOnboardingStep === 4) {
        bodyHtml = `
            <div style="text-align:center;">
                <div style="font-size: 40px; margin-bottom: 10px;">📷</div>
                <h4 style="margin-bottom:10px;">Adım 4: Profil Fotoğrafı (İsteğe Bağlı)</h4>
                <p style="font-size:13px; color:#6b7280; margin-bottom:15px;">Dilersen bir fotoğraf ekle veya daha sonra profilden hallet.</p>
                <input type="file" id="ob-avatar" accept="image/*" style="display:none;" onchange="window.uploadObAvatar(event)">
                <button class="action-btn" style="width:100%; padding:12px; margin-bottom:10px;" onclick="document.getElementById('ob-avatar').click()">📸 Fotoğraf Seç</button>
                <p id="ob-upload-status" style="font-size:12px; color:green; margin-bottom:15px; display:none; font-weight:bold;">Yüklendi! ✅</p>
                <div style="display:flex; gap:10px;">
                    <button class="action-btn" style="flex:1;" onclick="window.currentOnboardingStep--; window.renderOnboarding()">Geri</button>
                    <button class="btn-primary" style="flex:1; background:#10B981;" id="finish-ob-btn" onclick="window.finishOnboarding()">🚀 Tamamla</button>
                </div>
            </div>
        `;
    }
    
    window.openModal(title, bodyHtml);
    const closeBtn = document.getElementById('modal-close');
    if(closeBtn) closeBtn.style.display = 'none'; // Kullanıcı bu adımları atlayamasın
};

window.nextOnboarding = function(step) {
    if(step === 1) {
        let val = document.getElementById('ob-username').value.trim();
        if(!val) { alert("Lütfen bir kullanıcı adı belirle!"); return; }
        window.onboardingData.username = '#' + val.replace(/^#/, '').replace(/\s+/g, '').toLowerCase();
    }
    if(step === 2) {
        window.onboardingData.faculty = document.getElementById('ob-faculty').value.trim();
        window.onboardingData.age = document.getElementById('ob-age').value.trim();
    }
    if(step === 3) {
        window.onboardingData.bio = document.getElementById('ob-bio').value.trim();
    }
    window.currentOnboardingStep++;
    window.renderOnboarding();
};

window.uploadObAvatar = async function(event) {
    const file = event.target.files[0];
    if(!file) return;
    const status = document.getElementById('ob-upload-status');
    status.style.display = 'block';
    status.innerText = 'Yükleniyor... ⏳';
    status.style.color = '#D97706';
    try {
        const fileName = window.userProfile.uid + '_avatar_' + Date.now();
        const storageRef = ref(storage, 'avatars/' + fileName);
        await uploadBytes(storageRef, file);
        window.onboardingData.avatarUrl = await getDownloadURL(storageRef);
        status.innerText = 'Yüklendi! ✅';
        status.style.color = '#10B981';
    } catch(e) {
        status.innerText = 'Yüklenirken hata oluştu!';
        status.style.color = 'red';
    }
};

window.finishOnboarding = async function() {
    const btn = document.getElementById('finish-ob-btn');
    btn.innerText = "Kaydediliyor...";
    btn.disabled = true;
    try {
        const updates = {
            username: window.onboardingData.username,
            faculty: window.onboardingData.faculty,
            age: window.onboardingData.age,
            bio: window.onboardingData.bio
        };
        if (window.onboardingData.avatarUrl) {
            updates.avatarUrl = window.onboardingData.avatarUrl;
            window.userProfile.avatarUrl = window.onboardingData.avatarUrl;
        }
        
        await updateDoc(doc(db, "users", window.userProfile.uid), updates);
        
        window.userProfile.username = updates.username;
        window.userProfile.faculty = updates.faculty;
        window.userProfile.age = updates.age;
        window.userProfile.bio = updates.bio;
        
        const closeBtn = document.getElementById('modal-close');
        if(closeBtn) closeBtn.style.display = 'block'; // Çarpı butonunu geri getir
        
        window.closeModal();
        window.loadPage('home');
        alert("Tebrikler, profilin hazır! Kampüse hoş geldin! 🎉");
    } catch(e) {
        console.error(e);
        alert("Kaydedilirken hata oluştu: " + e.message);
        btn.innerText = "🚀 Tamamla";
        btn.disabled = false;
    }
};

// ============================================================================
// REALTIME LISTENER KISMI
// ============================================================================
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
        if(document.getElementById('app-modal') && document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
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
    modal = document.getElementById('app-modal'); // Her defasında referansı yakala
    if(modal) {
        document.getElementById('modal-title').innerText = title; 
        document.getElementById('modal-body').innerHTML = contentHTML; 
        modal.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function() { 
    modal = document.getElementById('app-modal');
    if(modal) {
        modal.classList.remove('active'); 
        document.getElementById('modal-body').innerHTML = ''; 
        if (!document.getElementById('lightbox') || !document.getElementById('lightbox').classList.contains('active')) {
            document.body.style.overflow = 'auto'; 
        }
    }
};

window.addEventListener('click', (e) => { 
    if (e.target === document.getElementById('app-modal')) window.closeModal(); 
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
    const lb = document.getElementById('lightbox');
    if(lb) {
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    if(lb) {
        lb.classList.remove('active');
        if(!document.getElementById('app-modal') || !document.getElementById('app-modal').classList.contains('active')) {
            document.body.style.overflow = 'auto';
        }
    }
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
                <button class="action-btn" style="flex:1; padding:8px 12px; font-size:13px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                <button class="btn-danger" style="flex:1; padding:8px 12px; font-size:13px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
            </div>
         `;
    } else if (existingChat) {
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:8px 12px; font-size:13px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', '${existingChat.id}'); window.closeModal();">💬 İlan Hakkında Mesaj Gönder</button>`;
    } else {
         actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:8px 12px; font-size:13px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', null); window.closeModal();">💬 Satıcıya Mesaj Gönder</button>`;
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
        <div class="form-group"><input type="text" id="new-item-title" placeholder="${titlePlaceholder}" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></div>
        <div class="form-group" style="display: flex; gap: 10px;">
            <input type="number" id="new-item-price" placeholder="Fiyat / Kira Bedeli" style="flex: 2; padding:10px; border-radius:8px; border:1px solid #ddd;">
            <select id="new-item-currency" style="flex: 1; padding:10px; border-radius:8px; border:1px solid #ddd;">
                <option value="₺">TL (₺)</option>
                <option value="$">Dolar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Sterlin (£)</option>
            </select>
        </div>
        <div class="form-group"><textarea id="new-item-desc" rows="3" placeholder="${descPlaceholder}" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;"></textarea></div>
        <div class="upload-btn-wrapper">
            <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf veya 📄 PDF Seç</button>
            <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;" />
        </div>
        <div id="preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')" style="width:100%; padding:12px; margin-top:10px;">İlanı Yayınla</button>
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
        try { await deleteDoc(doc(db, "chats", chatId)); alert("İstek silindi.");         window.renderNotifications(); 
    } catch(error) { 
        alert("Hata oluştu: " + error.message); 
    }
};

// ============================================================================
// 8. MESAJLAŞMA (CHATS) MODÜLÜ
// ============================================================================

window.renderMessages = function() {
    let html = `
        <div id="app-layout" style="height: 100%; width: 100%;">
            <div id="chat-layout-container">
                <div class="chat-sidebar" id="chat-sidebar-container" style="width: 350px; background: #fff; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column;">
                    <div class="chat-sidebar-header" style="padding: 15px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB;">
                        <h2 style="margin: 0; font-size: 18px; color: var(--text-dark);">Sohbetler</h2>
                    </div>
                    <div id="chat-contacts-list" style="flex: 1; overflow-y: auto;">
                        <div style="text-align:center; padding: 20px; color: var(--text-gray);">Yükleniyor...</div>
                    </div>
                </div>
                
                <div class="chat-main" id="chat-main-container" style="flex: 1; background: #F3F4F6; display: flex; flex-direction: column; position: relative;">
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; color: var(--text-gray);">
                        <div style="font-size: 64px; margin-bottom: 15px;">💬</div>
                        <h3 style="margin: 0; color: var(--text-dark);">Mesajlaşmaya Başla</h3>
                        <p style="font-size: 14px;">Soldan bir sohbet seç veya yeni arkadaşlıklar kur.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContent.innerHTML = html;
    window.renderMessagesSidebarOnly();
};

window.renderMessagesSidebarOnly = function() {
    const listEl = document.getElementById('chat-contacts-list');
    if (!listEl) return;

    const acceptedChats = chatsDB.filter(c => c.status === 'accepted');
    
    if (acceptedChats.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding: 30px 20px; color: var(--text-gray); font-size: 14px;">Henüz aktif bir sohbetiniz yok.</div>`;
        return;
    }

    let contactsHtml = '';
    acceptedChats.forEach(chat => {
        let lastMsg = "Henüz mesaj yok.";
        let lastTime = "";
        let unreadCount = 0;

        if (chat.messages && chat.messages.length > 0) {
            const lastMsgObj = chat.messages[chat.messages.length - 1];
            lastMsg = lastMsgObj.text;
            lastTime = lastMsgObj.time;
            
            chat.messages.forEach(m => {
                if(m.senderId !== window.userProfile.uid && m.read === false) unreadCount++;
            });
        }

        const isMarketTag = chat.isMarketChat ? `<span style="font-size: 10px; background: #D1FAE5; color: #059669; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">Market</span>` : "";
        const unreadBadge = unreadCount > 0 ? `<div style="background: #EF4444; color: white; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 10px; margin-left: auto;">${unreadCount}</div>` : "";
        
        let avatarHtml = chat.avatar.startsWith('http') 
            ? `<img src="${chat.avatar}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">` 
            : `<div style="width: 45px; height: 45px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 20px;">${chat.avatar}</div>`;

        contactsHtml += `
            <div class="chat-contact ${currentChatId === chat.id ? 'active' : ''}" onclick="window.openChatView('${chat.id}')" style="display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: 0.2s; background: ${currentChatId === chat.id ? '#EEF2FF' : 'transparent'};">
                ${avatarHtml}
                <div style="margin-left: 12px; flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="font-size: 15px; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${chat.name} ${isMarketTag}</strong>
                        <span style="font-size: 11px; color: var(--text-gray);">${lastTime}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="font-size: 13px; color: ${unreadCount > 0 ? 'var(--text-dark)' : 'var(--text-gray)'}; font-weight: ${unreadCount > 0 ? 'bold' : 'normal'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${lastMsg}</span>
                        ${unreadBadge}
                    </div>
                </div>
            </div>
        `;
    });
    listEl.innerHTML = contactsHtml;
};

window.openChatView = async function(chatId) {
    currentChatId = chatId;
    const chat = chatsDB.find(c => c.id === chatId);
    if (!chat) return;

    document.getElementById('app-layout').classList.add('chat-active');
    window.renderMessagesSidebarOnly(); // Sidebar'ı güncelle (active class için)

    const mainContainer = document.getElementById('chat-main-container');
    if (!mainContainer) return;

    let avatarHtml = chat.avatar.startsWith('http') 
        ? `<img src="${chat.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;" onclick="window.viewUserProfile('${chat.otherUid}')">` 
        : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" onclick="window.viewUserProfile('${chat.otherUid}')">${chat.avatar}</div>`;

    mainContainer.innerHTML = `
        <div style="background: #fff; padding: 10px 15px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <button class="back-btn-mobile" onclick="window.closeChatMobile()" style="background: none; border: none; font-size: 20px; padding: 5px; margin-right: -5px; color: var(--primary);">❮</button>
                ${avatarHtml}
                <div>
                    <h3 style="margin: 0; font-size: 16px; cursor: pointer;" onclick="window.viewUserProfile('${chat.otherUid}')">${chat.name}</h3>
                    <span style="font-size: 11px; color: #10B981;">● Çevrimiçi</span>
                </div>
            </div>
        </div>
        
        <div id="chat-messages-scroll" style="padding: 15px; display: flex; flex-direction: column; gap: 10px; background: #F3F4F6;">
            </div>
        
        <div style="background: #fff; padding: 12px 15px; border-top: 1px solid #E5E7EB; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 10px; background: #F3F4F6; padding: 5px 5px 5px 15px; border-radius: 24px; border: 1px solid #E5E7EB;">
                <input type="text" id="chat-input-field" placeholder="Mesaj yaz..." style="flex: 1; border: none; background: transparent; outline: none; font-size: 15px;" onkeypress="if(event.key==='Enter') window.sendMessage('${chatId}')">
                <button onclick="window.sendMessage('${chatId}')" style="background: var(--primary); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(79,70,229,0.3);"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
            </div>
        </div>
    `;

    window.updateChatMessagesOnly(chatId);
    
    // Mesajları okundu olarak işaretle
    let needsUpdate = false;
    let updatedMessages = chat.messages.map(m => {
        if(m.senderId !== window.userProfile.uid && m.read === false) { needsUpdate = true; return { ...m, read: true }; }
        return m;
    });

    if(needsUpdate) {
        try { await updateDoc(doc(db, "chats", chatId), { messages: updatedMessages }); } 
        catch (error) { console.error("Okundu bilgisi güncellenemedi:", error); }
    }
};

window.closeChatMobile = function() {
    document.getElementById('app-layout').classList.remove('chat-active');
    currentChatId = null;
    window.renderMessagesSidebarOnly();
};

window.updateChatMessagesOnly = function(chatId) {
    const scrollEl = document.getElementById('chat-messages-scroll');
    if (!scrollEl) return;
    
    const chat = chatsDB.find(c => c.id === chatId);
    if (!chat || !chat.messages) return;

    let msgHtml = '';
    const myUid = window.userProfile.uid;

    chat.messages.forEach(msg => {
        const isMe = msg.senderId === myUid;
        const isSystem = msg.senderId === "system";

        if (isSystem) {
            msgHtml += `<div style="text-align: center; margin: 10px 0;"><span style="background: #E5E7EB; color: #4B5563; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">Sistem: ${msg.text}</span></div>`;
        } else {
            const align = isMe ? 'flex-end' : 'flex-start';
            const bg = isMe ? 'var(--primary)' : '#fff';
            const color = isMe ? '#fff' : 'var(--text-dark)';
            const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
            const shadow = isMe ? '0 2px 4px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.05)';
            const readStatus = isMe ? (msg.read ? '<span style="color: #60A5FA; font-size:10px; margin-left:5px;">✓✓</span>' : '<span style="color: #D1D5DB; font-size:10px; margin-left:5px;">✓</span>') : '';

            msgHtml += `
                <div style="display: flex; flex-direction: column; align-items: ${align}; margin-bottom: 2px;">
                    <div style="max-width: 75%; background: ${bg}; color: ${color}; padding: 10px 14px; border-radius: ${radius}; font-size: 15px; box-shadow: ${shadow}; line-height: 1.4; word-wrap: break-word;">
                        ${msg.text}
                    </div>
                    <div style="font-size: 10px; color: var(--text-gray); margin-top: 4px; padding: 0 4px;">
                        ${msg.time} ${readStatus}
                    </div>
                </div>
            `;
        }
    });

    scrollEl.innerHTML = msgHtml;
    scrollEl.scrollTop = scrollEl.scrollHeight;
};

window.sendMessage = async function(chatId) {
    const inputField = document.getElementById('chat-input-field');
    const text = inputField.value.trim();
    if (!text) return;

    inputField.value = '';
    
    try {
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const newMsg = { senderId: window.userProfile.uid, text: text, time: timeStr, read: false };
        
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion(newMsg),
            lastUpdated: serverTimestamp()
        });
        
        const scrollEl = document.getElementById('chat-messages-scroll');
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    } catch (error) {
        alert("Mesaj gönderilemedi: " + error.message);
    }
};

// ============================================================================
// 9. KEŞFET / İTİRAF (CONFESSIONS) MODÜLÜ
// ============================================================================

window.renderConfessionsPage = function() {
    mainContent.innerHTML = `
        <div class="feed-layout-container">
            <div style="background:#fff; padding:15px; border-bottom:1px solid #E5E7EB; z-index:10; flex-shrink: 0;">
                <div style="display:flex; gap:10px; max-width: 600px; margin: 0 auto;">
                    <textarea id="conf-input" placeholder="Kampüste neler oluyor? Düşüncelerini veya itiraflarını paylaş..." style="flex:1; padding:12px; border-radius:12px; border:1px solid #d1d5db; resize:none; outline:none; height:60px; font-family: inherit; font-size: 14px; background: #F9FAFB; transition: 0.2s;" onfocus="this.style.background='#fff'; this.style.borderColor='var(--primary)';"></textarea>
                    <button class="btn-primary" style="width:auto; padding:0 20px; border-radius:12px; font-weight: bold;" onclick="window.postConfession()">Paylaş</button>
                </div>
            </div>
            <div id="conf-feed"></div>
        </div>
    `;
    window.drawConfessionsFeed();
};

window.postConfession = async function() {
    const input = document.getElementById('conf-input');
    const text = input.value.trim();
    if (!text) return;

    input.disabled = true;
    try {
        await addDoc(collection(db, "confessions"), {
            authorId: window.userProfile.uid,
            authorName: window.userProfile.name + " " + (window.userProfile.surname ? window.userProfile.surname.charAt(0) + "." : ""),
            authorAvatar: window.userProfile.avatarUrl || window.userProfile.avatar || "👤",
            text: text,
            likes: [],
            comments: [],
            createdAt: serverTimestamp()
        });
        input.value = '';
    } catch (error) {
        alert("Gönderilemedi: " + error.message);
    } finally {
        input.disabled = false;
    }
};

window.drawConfessionsFeed = function() {
    const feed = document.getElementById('conf-feed');
    if (!feed) return;

    if (confessionsDB.length === 0) {
        feed.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-gray);">Kampüs şu an çok sessiz. İlk paylaşan sen ol!</div>`;
        return;
    }

    let html = '';
    const myUid = window.userProfile.uid;

    confessionsDB.forEach(post => {
        const isLiked = post.likes && post.likes.includes(myUid);
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        
        let avatarHtml = post.authorAvatar.startsWith('http') 
            ? `<img src="${post.authorAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` 
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">${post.authorAvatar}</div>`;

        let timeStr = "Az önce";
        if (post.createdAt && post.createdAt.seconds) {
            const date = new Date(post.createdAt.seconds * 1000);
            timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' - ' + date.toLocaleDateString();
        }

        html += `
            <div class="feed-post">
                <div class="feed-post-header">
                    <div class="feed-post-avatar" onclick="window.viewUserProfile('${post.authorId}')" style="cursor:pointer;">${avatarHtml}</div>
                    <div class="feed-post-meta">
                        <span class="feed-post-author" onclick="window.viewUserProfile('${post.authorId}')" style="cursor:pointer;">${post.authorName}</span>
                        <span class="feed-post-time">${timeStr}</span>
                    </div>
                </div>
                <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div>
                <div class="feed-post-actions">
                    <button class="feed-action-btn" onclick="window.likeConfession('${post.id}')" style="color: ${isLiked ? '#EF4444' : '#6B7280'};">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="${isLiked ? '#EF4444' : 'none'}" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        ${likeCount}
                    </button>
                    <button class="feed-action-btn" onclick="window.openConfessionModal('${post.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        ${commentCount} Yorum
                    </button>
                </div>
            </div>
        `;
    });

    feed.innerHTML = html;
};

window.likeConfession = async function(postId) {
    const post = confessionsDB.find(p => p.id === postId);
    if (!post) return;
    
    const myUid = window.userProfile.uid;
    let newLikes = post.likes ? [...post.likes] : [];
    
    if (newLikes.includes(myUid)) {
        newLikes = newLikes.filter(id => id !== myUid);
    } else {
        newLikes.push(myUid);
    }
    
    try {
        await updateDoc(doc(db, "confessions", postId), { likes: newLikes });
    } catch (e) {
        console.error("Beğeni hatası:", e);
    }
};

window.openConfessionModal = function(postId) {
    window.openModal('Yorumlar', `<div id="conf-detail-content">Yükleniyor...</div>`);
    window.updateConfessionDetailLive(postId);
};

window.updateConfessionDetailLive = function(postId) {
    const contentEl = document.getElementById('conf-detail-content');
    if (!contentEl) return;
    
    const post = confessionsDB.find(p => p.id === postId);
    if (!post) {
        contentEl.innerHTML = `<p style="color:red;">Bu gönderi silinmiş olabilir.</p>`;
        return;
    }

    let commentsHtml = '';
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(c => {
            let cAvatarHtml = c.avatar.startsWith('http') 
                ? `<img src="${c.avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">` 
                : `<div style="width: 30px; height: 30px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 14px;">${c.avatar}</div>`;
            
            commentsHtml += `
                <div style="display: flex; gap: 10px; margin-bottom: 15px; background: #F9FAFB; padding: 10px; border-radius: 12px; border: 1px solid #E5E7EB;">
                    ${cAvatarHtml}
                    <div>
                        <strong style="font-size: 13px; color: var(--text-dark);">${c.name}</strong>
                        <div style="font-size: 14px; color: #374151; margin-top: 2px;">${c.text}</div>
                    </div>
                </div>
            `;
        });
    } else {
        commentsHtml = `<p style="text-align:center; color:var(--text-gray); font-size:13px; margin: 20px 0;">Henüz yorum yok. İlk yorumu sen yap!</p>`;
    }

    contentEl.innerHTML = `
        <input type="hidden" id="active-post-id" value="${postId}">
        <div style="margin-bottom: 20px; font-size: 15px; color: var(--text-dark); padding-bottom: 15px; border-bottom: 1px solid #E5E7EB; word-wrap: break-word;">
            ${post.text.replace(/\n/g, '<br>')}
        </div>
        <div class="answers-container" style="margin-bottom: 15px;">
            ${commentsHtml}
        </div>
        <div style="display: flex; gap: 10px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
            <input type="text" id="comment-input" placeholder="Yorum yaz..." style="flex: 1; padding: 10px 15px; border-radius: 20px; border: 1px solid #d1d5db; outline: none;" onkeypress="if(event.key==='Enter') window.addComment('${postId}')">
            <button class="btn-primary" style="width: auto; padding: 0 20px; border-radius: 20px;" onclick="window.addComment('${postId}')">Gönder</button>
        </div>
    `;
};

window.addComment = async function(postId) {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;
    
    input.disabled = true;
    try {
        const newComment = {
            id: Date.now().toString(),
            userId: window.userProfile.uid,
            name: window.userProfile.name + " " + (window.userProfile.surname ? window.userProfile.surname.charAt(0) + "." : ""),
            avatar: window.userProfile.avatarUrl || window.userProfile.avatar || "👤",
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        await updateDoc(doc(db, "confessions", postId), { comments: arrayUnion(newComment) });
    } catch (e) {
        alert("Yorum eklenemedi: " + e.message);
        input.disabled = false;
    }
};

// ============================================================================
// 10. PROFİL VE AYARLAR MODÜLÜ
// ============================================================================

window.renderProfile = function() {
    const p = window.userProfile;
    let avatarHtml = p.avatarUrl 
        ? `<img src="${p.avatarUrl}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); margin: 0 auto;">` 
        : `<div style="width: 120px; height: 120px; border-radius: 50%; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 50px; border: 4px solid var(--primary); margin: 0 auto; color: var(--primary);">${p.avatar || '👤'}</div>`;

    let premiumBadge = p.isPremium 
        ? `<div style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">🌟 Premium Üye</div>` 
        : ``;

    mainContent.innerHTML = `
        <div class="card" style="text-align: center; padding: 30px 20px;">
            <div style="position: relative; display: inline-block;">
                ${avatarHtml}
                <button onclick="document.getElementById('profile-avatar-upload').click()" style="position: absolute; bottom: 0; right: 0; background: var(--primary); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📷</button>
                <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.updateProfileAvatar(event)">
            </div>
            
            <h2 style="margin: 15px 0 5px 0; color: var(--text-dark);">${p.name} ${p.surname}</h2>
            <p style="color: var(--text-gray); font-size: 14px; margin-bottom: 5px;">${p.username || 'Kullanıcı adı yok'}</p>
            ${premiumBadge}

            <div style="margin-top: 25px; text-align: left; background: #F9FAFB; padding: 20px; border-radius: 16px; border: 1px solid #E5E7EB;">
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 12px; color: var(--text-gray); font-weight: bold; text-transform: uppercase;">Üniversite & Bölüm</label>
                    <input type="text" id="edit-faculty" value="${p.faculty || ''}" placeholder="Bölümünüzü yazın..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 5px; font-family: inherit;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 12px; color: var(--text-gray); font-weight: bold; text-transform: uppercase;">Biyografi / Hakkımda</label>
                    <textarea id="edit-bio" rows="3" placeholder="Kendinden bahset..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 5px; font-family: inherit; resize: none;">${p.bio || ''}</textarea>
                </div>
                <button class="btn-primary" style="width: 100%; padding: 12px; border-radius: 8px; font-weight: bold;" id="save-profile-btn" onclick="window.saveProfile()">💾 Değişiklikleri Kaydet</button>
            </div>

            <div style="display: flex; gap: 15px; margin-top: 20px;">
                <button class="action-btn" style="flex: 1; justify-content: center; padding: 12px; font-weight: bold; border-radius: 12px;" onclick="window.loadPage('friends')">👥 Arkadaşlarım</button>
                <button class="action-btn" style="flex: 1; justify-content: center; padding: 12px; font-weight: bold; border-radius: 12px;" onclick="window.loadPage('settings')">⚙️ Ayarlar</button>
            </div>
        </div>
    `;
};

window.updateProfileAvatar = async function(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    alert("Fotoğraf yükleniyor, lütfen bekleyin...");
    try {
        const fileName = window.userProfile.uid + '_avatar_' + Date.now();
        const storageRef = ref(storage, 'avatars/' + fileName);
        await uploadBytes(storageRef, file);
        const newUrl = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, "users", window.userProfile.uid), { avatarUrl: newUrl });
        window.userProfile.avatarUrl = newUrl;
        window.renderProfile();
        alert("Profil fotoğrafı güncellendi! ✅");
    } catch(e) {
        alert("Yüklenirken hata oluştu: " + e.message);
    }
};

window.saveProfile = async function() {
    const btn = document.getElementById('save-profile-btn');
    const faculty = document.getElementById('edit-faculty').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    btn.innerText = "Kaydediliyor...";
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "users", window.userProfile.uid), { faculty: faculty, bio: bio });
        window.userProfile.faculty = faculty;
        window.userProfile.bio = bio;
        
        btn.innerText = "💾 Değişiklikleri Kaydet";
        btn.disabled = false;
        alert("Profil bilgileri başarıyla güncellendi!");
    } catch (error) {
        alert("Kaydedilirken hata oluştu: " + error.message);
        btn.innerText = "💾 Değişiklikleri Kaydet";
        btn.disabled = false;
    }
};

window.renderSettings = function() {
    const currentLang = localStorage.getItem('uniloop_lang') || 'tr';
    const currentTheme = localStorage.getItem('uniloop_theme') || 'light';
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['tr'];

    mainContent.innerHTML = `
        <div class="card" style="padding: 20px; min-height: calc(100vh - 120px);">
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <button onclick="window.renderProfile()" style="background:none; border:none; font-size:20px; cursor:pointer;">←</button>
                ${t.settingsTitle}
            </h2>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-dark);">${t.langLabel}</label>
                <select id="lang-select" onchange="window.setLanguage(this.value)" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #d1d5db; outline: none; background: #F9FAFB;">
                    <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>Türkçe</option>
                    <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>

            <div style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-dark);">${t.themeLabel}</label>
                <div style="display: flex; gap: 10px;">
                    <button class="${currentTheme === 'light' ? 'btn-primary' : 'action-btn'}" style="flex: 1; padding: 12px; border-radius: 12px; justify-content: center;" onclick="window.toggleTheme('light'); window.renderSettings();">☀️ ${t.lightMode}</button>
                    <button class="${currentTheme === 'dark' ? 'btn-primary' : 'action-btn'}" style="flex: 1; padding: 12px; border-radius: 12px; justify-content: center;" onclick="window.toggleTheme('dark'); window.renderSettings();">🌙 ${t.darkMode}</button>
                </div>
            </div>

            <button class="btn-danger" style="width: 100%; padding: 15px; font-size: 15px; font-weight: bold; border-radius: 12px; justify-content: center; margin-top: auto;" onclick="window.logout()">${t.logoutBtn}</button>
        </div>
    `;
};

// ============================================================================
// 11. SAYFA YÖNLENDİRME (ROUTER) MOTORU
// ============================================================================

window.loadPage = function(page) {
    window.closeModal();
    const layout = document.getElementById('app-layout');
    if (layout) layout.classList.remove('chat-active');
    
    // Mesajlar sekmesinden çıkılırsa aktif sohbeti sıfırla
    if (page !== 'messages') {
        window.resetCurrentChatId();
    }

    // Bottom Nav Aktif Sınıfını Güncelle
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    const targetNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
    if(targetNav) targetNav.classList.add('active');

    // Sayfa Yükleme
    switch(page) {
        case 'home': window.renderHome(); break;
        case 'confessions': window.renderConfessionsPage(); break;
        case 'market': window.renderListings('market', '🛒 Kampüs Market'); break;
        case 'messages': window.renderMessages(); break;
        case 'profile': window.renderProfile(); break;
        case 'notifications': window.renderNotifications(); break;
        case 'friends': window.renderFriends(); break;
        case 'settings': window.renderSettings(); break;
        default: window.renderHome(); break;
    }
    
    // Sayfanın en üstüne kaydır
    window.scrollTo(0, 0);
};

} // initializeUniLoop fonksiyonunun sonu

// DOM yüklendiğinde sistemi başlat
document.addEventListener("DOMContentLoaded", () => {
    initializeUniLoop();
});


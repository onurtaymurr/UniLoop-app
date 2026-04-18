// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE (FIREBASE) 🌟
// 🌟 KAMPÜS FREKANSI (SESLİ SOHBET) GÜNCELLEMESİ - BÖLÜM 1 🌟
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
    deleteUser,
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
    arrayRemove,
    where,
    getDocs,
    deleteDoc,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    uploadString,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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

window.userProfile = { 
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", avatarUrl: "", age: "", gender: "", isPremium: false, grade: "", interests: [], purpose: "", fastMatchCount: 0, fastMatchDate: "", lockedArchiveFaculty: "", lockedArchiveGrade: "", lastArchiveResetYear: 0, blockedUsers: [], popularity: 0, lastTournamentDate: 0, voiceChatUsedMinutes: 0, voiceChatDate: ""
};

let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;

window.tournamentInterval = null;
window.homeSliderInterval = null; 

// Sesli Sohbet Global Değişkenleri
window.voiceTimerInterval = null;
window.voiceCallSeconds = 0;
window.voiceMicStream = null;
window.voiceAudioCtx = null;
window.voiceAnimFrame = null;

window.registrationData = { interests: [] };

window.resetCurrentChatId = function() { currentChatId = null; };

const allFaculties = [
    "Tıp Fakültesi", "Diş Hekimliği Fakültesi", "Eczacılık Fakültesi", "Hukuk Fakültesi", "Mühendislik Fakültesi", 
    "Bilgisayar ve Bilişim Bilimleri", "Mimarlık Fakültesi", "Eğitim Fakültesi", "İletişim Fakültesi", 
    "İktisadi ve İdari Bilimler", "Güzel Sanatlar", "Fen-Edebiyat Fakültesi", "Sağlık Bilimleri Fakültesi", 
    "Veteriner Fakültesi", "İlahiyat Fakültesi", "Spor Bilimleri Fakültesi", "Turizm Fakültesi", 
    "Ziraat Fakültesi", "Orman Fakültesi", "Denizcilik Fakültesi", "Havacılık ve Uzay Bilimleri", "Uygulamalı Bilimler"
];

let authScreen;
let appScreen;
let mainContent;
let modal;
let cropper = null;

window.tData = { 
    bracket: [], winners: [], currentMatch: 0, stage: 'none', 
    semiLosers: [], finalists: [], finalWinner: null, secondPlace: null, thirdPlace: null 
};

function initializeUniLoop() {
    authScreen = document.getElementById('auth-screen');
    appScreen = document.getElementById('app-screen');
    mainContent = document.getElementById('main-content');
    modal = document.getElementById('app-modal');

    document.addEventListener('focusout', function(e) {
        if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            setTimeout(() => { 
                window.scrollTo(0, 0); 
                document.body.scrollTop = 0; 
            }, 100);
        }
    });

    const cropperCss = document.createElement('link');
    cropperCss.rel = 'stylesheet';
    cropperCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
    document.head.appendChild(cropperCss);

    const cropperJs = document.createElement('script');
    cropperJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
    document.head.appendChild(cropperJs);

    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; background-color: #f3f4f6; color: #111827; }
        header, #app-header { height: 50px !important; box-sizing: border-box; }

        .edit-profile-icon { font-size: 14px; background: #EEF2FF; color: var(--primary); padding: 5px 10px; border-radius: 8px; border: 1px solid #C7D2FE; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 700; transition: 0.2s; }
        .edit-profile-icon:hover { background: #DBEAFE; }

        body.no-scroll-messages, body.no-scroll-home { overflow: hidden !important; position: fixed; width: 100%; height: 100%; }
        
        #main-content { padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important; }

        .no-scroll-messages #main-content, .no-scroll-home #main-content { 
            position: fixed !important;
            top: 50px !important;
            bottom: calc(75px + env(safe-area-inset-bottom)) !important; 
            left: 0 !important;
            right: 0 !important;
            padding: 0 !important; 
            margin: 0 !important; 
            height: auto !important;
            overflow: hidden !important; 
            display: flex !important;
            flex-direction: column !important;
            z-index: 40;
        }

        .hidden { display: none !important; }

        #chat-layout-container { position: relative !important; width: 100% !important; height: 100% !important; display: flex; flex-direction: row; background: #fff; flex: 1; overflow: hidden; }
        .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; background: #f9fafb; position:relative; }
        #chat-messages-scroll { flex: 1 1 auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding: 15px; display:flex; flex-direction:column; }
        .chat-input-area { flex: 0 0 auto !important; background: white; border-top: 1px solid #E5E7EB; padding: 10px 15px !important; z-index: 50; position: relative; }

        #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; transition: opacity 0.3s ease; }
        #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; transition: opacity 0.3s ease;}
        #auth-screen { position: relative; z-index: 1000 !important; display: none; }
        #auth-screen.active { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        #auth-screen button, #auth-screen a, #auth-screen input, #auth-screen select { pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 1001 !important; }
        button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { cursor: pointer !important; position: relative; pointer-events: auto !important; z-index: 10; }
        
        #sidebar, #mobile-menu-btn { display: none !important; }

        .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; border-top: 1px solid #f1f1f1; display: flex; justify-content: space-around; align-items: center; height: calc(60px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); box-sizing: border-box; z-index: 99999; box-shadow: 0 -2px 10px rgba(0,0,0,0.02); }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8E8E93; font-size: 10px; text-decoration: none; cursor: pointer; transition: 0.2s; flex: 1; background: transparent !important; border: none !important; font-weight: 500; -webkit-tap-highlight-color: transparent; height: 60px; padding: 0; }
        .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
        .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
        .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
        .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
        .bottom-nav-item.active .bottom-nav-icon svg { stroke-width: 2.2; }

        .white-flame-icon { filter: grayscale(100%) brightness(200%); text-shadow: 0 0 8px rgba(255,255,255,0.8); cursor:pointer; font-size:24px; transition: 0.2s; display:inline-block; }
        .white-flame-icon:hover { transform: scale(1.15) rotate(5deg); }
        
        .tour-grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width:100%; max-width:400px; margin: 0 auto; }
        .tour-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width:100%; max-width:400px; align-items:center; margin: 0 auto; padding-top:20px; }
        
        .tour-card { background: #fff; border-radius:16px; overflow:hidden; position:relative; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.08); transition:all 0.15s ease-out; aspect-ratio: 1; display:flex; flex-direction:column; border:3px solid transparent; -webkit-tap-highlight-color: transparent; }
        .tour-card:active { transform: scale(0.95) !important; border-color: #6366f1 !important; box-shadow:0 8px 20px rgba(99, 102, 241, 0.3) !important; }
        
        .tour-card-img { width: 100%; height: 100%; object-fit: cover; }
        .tour-card-name { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent); color:white; padding: 30px 10px 10px 10px; font-size:14px; font-weight:800; text-align:center; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none;}

        .stepper-container { background: #fff; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 400px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .step-header { font-size: 14px; font-weight: bold; color: var(--primary); text-align: center; margin-bottom: 15px; }
        .step-title { font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 20px; color: #111827; }
        .grade-btn, .interest-btn, .purpose-btn { background: #F3F4F6; border: 1px solid #E5E7EB; padding: 10px 15px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; margin: 5px; display: inline-block; color: var(--text-dark); }
        .grade-btn.active, .interest-btn.active, .purpose-btn.active { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.05); box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
        
        .id-card { background: linear-gradient(135deg, #ffffff, #f8fafc); border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); width: 100%; max-width: 100%; box-sizing: border-box; margin: 0 auto 20px auto; position: relative; overflow: hidden; }
        .id-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, var(--primary), #818cf8); }
        .id-card-left { flex-shrink: 0; position:relative; }
        .id-card-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #e5e7eb; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow:hidden; }
        .id-card-right { flex: 1; text-align: left; }
        .id-card-name { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .id-card-faculty { font-size: 13px; color: var(--primary); font-weight: 700; margin-bottom: 8px; }
        .id-card-details { font-size: 12px; color: #64748b; margin-bottom: 10px; font-weight: 500; display:flex; flex-direction:column; gap:3px;}
        .id-card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .id-tag { font-size: 10px; background: #e0e7ff; color: var(--primary); padding: 4px 8px; border-radius: 8px; font-weight: 700; }

        .notif-compact-panel { max-height: 400px; overflow-y: auto; padding-right: 5px; scroll-behavior: smooth; }
        .notif-compact-item { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex-wrap: wrap; gap: 10px; transition: transform 0.2s; }
        .notif-compact-item:hover { transform: translateY(-2px); border-color: #e2e8f0; }

        .cropper-modal-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 999999; display: none; flex-direction: column; pointer-events: auto !important;}
        .cropper-modal-container.active { display: flex; }
        .cropper-view-box, .cropper-face { border-radius: 50%; }
        .cropper-view-box { outline: 0; box-shadow: 0 0 0 1px #39f; }

        .chat-sidebar { width: 320px; overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; border-right: 1px solid #e5e7eb; }
        .chat-contact.active { background: #EEF2FF; border-left: 4px solid var(--primary); }
        .chat-contact:hover { background: #F9FAFB; }
        
        .bubble { position: relative; max-width: 75%; padding: 10px 14px; border-radius: 16px; margin-bottom: 8px; font-size: 15px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.1); width: fit-content; }
        .bubble.sent { align-self: flex-end; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-bottom-right-radius: 4px; }
        .bubble.received { align-self: flex-start; background: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; }
        .bubble.sent .msg-time { color: rgba(255,255,255,0.8) !important; }
        .bubble.received .msg-time { color: #6b7280 !important; }
        .bubble.sent .msg-text { color: white !important; }

        #listings-grid-container { max-height: calc(100vh - 200px) !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; }
        .answers-container { max-height: 250px !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; scroll-behavior: smooth; }
        .feed-layout-container { height: auto !important; display: flex; flex-direction: column; overflow: hidden; margin: -20px; background: #F3F4F6; }
        #conf-feed { flex: 1; overflow-y: auto; padding: 15px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; max-width: 600px !important; margin: 0 auto !important; width: 100%;}
        .feed-post { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
        .feed-post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .feed-post-avatar { font-size: 24px; width: 44px; height: 44px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; border: 1px solid #E5E7EB; overflow: hidden;}
        .feed-post-meta { display: flex; flex-direction: column; }
        .feed-post-author { font-weight: 800; font-size: 15px; color: #111827; display:flex; align-items:center; }
        .feed-post-time { font-size: 12px; color: #6B7280; margin-top: 2px; }
        .feed-post-text { font-size: 15px; margin-bottom: 12px; line-height: 1.5; color: #374151; word-break: break-word; }
        .feed-post-img { width: 100%; border-radius: 12px; margin-bottom: 12px; max-height: 450px; object-fit: cover; cursor: pointer; border: 1px solid #E5E7EB; }
        .feed-post-actions { display: flex; border-top: 1px solid #E5E7EB; padding-top: 12px; gap: 20px; }
        .feed-action-btn { background: none; border: none; color: #6B7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 5px; outline: none; transition: 0.2s; border-radius: 8px; z-index: 10; }
        .feed-action-btn:hover { color: var(--primary); background: #EEF2FF; }
        
        #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
        #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
        #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 10px; height: 100% !important; }
        
        #notif-btn-top { position: relative; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
        #notif-btn-top:hover { background: #E5E7EB; }
        
        .premium-card-bw::before { background: #111827 !important; }

        @media (max-width: 1024px) {
            .chat-sidebar { width: 100%; display: block; border-right: none; }
            .chat-active .chat-sidebar { display: none !important; }
            .chat-main { display: none !important; }
            .chat-active .chat-main { display: flex !important; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }

        /* SLIDER İÇİN ÖZEL CSS GİZLİ SCROLLBAR */
        .home-slider::-webkit-scrollbar { display: none; }
        .home-slider { -ms-overflow-style: none; scrollbar-width: none; }

        /* SESLİ SOHBET KAMPÜS FREKANSI CSS */
        .radar-container { width: 150px; height: 150px; border-radius: 50%; border: 2px solid rgba(139, 92, 246, 0.3); position: relative; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px auto; }
        .radar-sweep { position: absolute; width: 75px; height: 150px; background: linear-gradient(90deg, rgba(139,92,246,0.5) 0%, transparent 100%); border-radius: 75px 0 0 75px; transform-origin: center right; left: 0; animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .blurred-avatar { width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, #4c1d95, #111827); filter: blur(8px); margin: 0 auto 30px auto; animation: breathe 3s infinite alternate; }
        @keyframes breathe { 0% { transform: scale(0.95); opacity: 0.8;} 100% { transform: scale(1.05); opacity: 1;} }
        .visualizer { display: flex; align-items: center; justify-content: center; gap: 6px; height: 50px; margin-bottom: 30px; }
        .voice-bar { width: 6px; height: 10px; background: #10b981; border-radius: 4px; box-shadow: 0 0 8px #10b981; transition: height 0.1s ease; }
    `;
    document.head.appendChild(styleFix);

    const cropperModalHtml = `
        <div id="cropper-modal" class="cropper-modal-container">
            <div class="cropper-header" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#111; color:white; z-index:10; position:relative;">
                <button onclick="window.closeCropper()" style="background:transparent; border:none; color:#EF4444; font-size:16px; font-weight:bold; cursor:pointer;">İptal</button>
                <span style="font-weight:bold; font-size:16px;">Fotoğrafı Kırp</span>
                <button id="cropper-save-btn" onclick="window.saveCroppedImage()" style="background:transparent; border:none; color:#10B981; font-size:16px; font-weight:bold; cursor:pointer;">Kaydet</button>
            </div>
            <div class="cropper-body" style="flex:1; position:relative; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img id="cropper-image" src="" style="max-width: 100%; display: block;">
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cropperModalHtml);

    window.setLanguage = function(lang) {
        localStorage.setItem('uniloop_lang', lang);
        window.renderSettings(); 
    };

    document.addEventListener('click', async function(e) {
        const chatMenu = document.getElementById('chat-options-menu');
        if (chatMenu && e.target && e.target.closest && !e.target.closest('#chat-options-dropdown-wrapper')) {
            chatMenu.classList.add('hidden');
        }

        const isTarget = (id) => {
            if (!e.target) return false;
            if (e.target.id === id) return true;
            if (typeof e.target.closest === 'function' && e.target.closest('#' + id)) return true;
            return false;
        };

        if (isTarget('modal-close') || (e.target && e.target.classList && e.target.classList.contains('close-btn'))) {
            e.preventDefault();
            window.closeModal();
            return;
        }

        if (isTarget('show-login-btn')) {
            e.preventDefault();
            const logCard = document.getElementById('login-card');
            const regCard = document.getElementById('register-card');
            const stepWrap = document.getElementById('stepper-wrapper');
            if (regCard) regCard.style.display = 'none'; 
            if (stepWrap) stepWrap.remove();
            if (logCard) logCard.style.display = 'block';
        }
        else if (isTarget('show-register-btn')) {
            e.preventDefault();
            const logCard = document.getElementById('login-card');
            const regCard = document.getElementById('register-card');
            if (logCard) logCard.style.display = 'none'; 
            if (regCard) regCard.style.display = 'none'; 
            startRegistrationStepper(1);
        }
        else if (isTarget('login-btn')) {
            e.preventDefault(); 
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            
            if(!emailInput || !passInput) {
                console.error("Giriş inputları bulunamadı!");
                return;
            }

            const email = emailInput.value.trim();
            const password = passInput.value;
            const btn = e.target.closest('#login-btn') || e.target;

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
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }
            } catch (error) {
                console.error("Giriş Hatası:", error);
                alert("Giriş başarısız! E-posta veya şifreniz yanlış.");
                btn.innerText = originalText;
                btn.disabled = false;
            } 
        }
        else if (isTarget('forgot-password-btn')) {
            e.preventDefault();
            const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
            if(!email) return;
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Şifre sıfırlama bağlantısı e-posta adresinize başarıyla gönderildi!");
            } catch (error) { alert("Hata: " + error.message); }
        }
    });

    function startRegistrationStepper(startStep = 1) {
        window.registrationData = window.registrationData || { interests: [] };
        if(!window.registrationData.interests) window.registrationData.interests = [];
        let container = document.getElementById('stepper-wrapper');
        if(!container) {
            container = document.createElement('div');
            container.id = 'stepper-wrapper';
            container.className = 'stepper-container';
            const authContainer = document.querySelector('.auth-container') || document.getElementById('auth-screen');
            if (authContainer) authContainer.appendChild(container);
        }
        window.renderStep(startStep);
    }

    window.renderStep = function(step) {
        const wrapper = document.getElementById('stepper-wrapper');
        if(!wrapper) return;
        let html = '';

        if (step === 1) {
            html = `
                <div class="step-header">Adım 1 / 6</div>
                <div class="step-title">Hesabını Oluştur 🔒</div>
                <p style="text-align:center; font-size:13px; color:#6b7280; margin-bottom:15px;">Okul e-postan ile güvenli bir şekilde başla.</p>
                <input type="email" id="reg-email" placeholder="E-posta Adresin" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; box-sizing:border-box; font-size:15px;">
                <input type="password" id="reg-password" placeholder="Şifre Belirle" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; box-sizing:border-box; font-size:15px;">
                <input type="password" id="reg-password-confirm" placeholder="Şifreni Tekrar Gir" style="margin-bottom:20px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; box-sizing:border-box; font-size:15px;">
                <button id="step1-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(1)">Kayıt Ol ve Doğrulama Kodu Gönder</button>
                <p style="text-align:center; margin-top:15px; font-size:13px;">
                    <a href="#" style="color:var(--primary); text-decoration:none; font-weight:bold;" onclick="document.getElementById('stepper-wrapper').remove(); document.getElementById('login-card').style.display='block';">Giriş Ekranına Dön</a>
                </p>
            `;
        } else if (step === 2) {
            html = `
                <div class="step-header">Adım 2 / 6</div>
                <div class="step-title">E-postanı Doğrula 📩</div>
                <p style="text-align:center; font-size:14px; color:#374151; margin-bottom:20px;">
                    <b>${window.registrationData.email || 'E-posta adresine'}</b> bir doğrulama bağlantısı gönderdik.<br><br>Lütfen gelen kutunu (ve spam klasörünü) kontrol et, linke tıkla ve ardından aşağıdaki butona bas.
                </p>
                <button id="step2-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px; background:#10B981; border-color:#10B981;" onclick="window.processStep(2)">Doğruladım, Devam Et →</button>
            `;
        } else if (step === 3) {
            let facOptions = allFaculties.map(f => `<option value="${f}">${f}</option>`).join('');
            html = `
                <div class="step-header">Adım 3 / 6</div>
                <div class="step-title">Seni Tanıyalım 🎓</div>
                <input type="text" id="reg-username" placeholder="Kullanıcı Adı Belirle (Örn: mutlucocuk)" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid var(--primary); outline:none; box-sizing:border-box; font-size:15px; background:#EEF2FF;">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" id="reg-name" placeholder="Adın" style="flex:1; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                    <input type="text" id="reg-surname" placeholder="Soyadın" style="flex:1; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                </div>
                <input type="number" id="reg-age" placeholder="Yaşın" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; box-sizing:border-box; font-size:15px;">
                
                <select id="reg-gender" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; background:#fff; outline:none; box-sizing:border-box; font-size:15px;">
                    <option value="">Cinsiyetiniz (Zorunlu)</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                </select>

                <select id="reg-faculty" style="margin-bottom:15px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; background:#F3F4F6; outline:none; box-sizing:border-box; font-size:15px;">
                    <option value="">Hangi Fakültedesin?</option>
                    ${facOptions}
                </select>
                <div style="margin-bottom: 20px; text-align:center;">
                    <p style="font-size:14px; font-weight:bold; margin-bottom:10px; color:#374151;">Kaçıncı Sınıfsın?</p>
                    ${[1, 2, 3, 4, 5, 6].map(g => `<button class="grade-btn" onclick="window.selectGrade(this, '${g}')">${g}. Sınıf</button>`).join('')}
                </div>
                <button id="step3-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(3)">Devam Et →</button>
            `;
        } else if (step === 4) {
            const interests = ['🎵 Müzik', '⚽ Spor', '📚 Kitap', '🎮 Oyun', '✈️ Seyahat', '🎨 Sanat', '💻 Yazılım', '☕ Kahve', '🎬 Sinema', '🧘‍♀️ Yoga', '🍕 Yemek', '📸 Fotoğraf'];
            html = `
                <div class="step-header">Adım 4 / 6</div>
                <div class="step-title">İlgi Alanların Neler? 🎯</div>
                <p style="text-align:center; font-size:13px; color:#6b7280; margin-bottom:15px;">Kendini en iyi anlatanları seç (En az 2 adet)</p>
                <div style="text-align:center; margin-bottom: 20px;">
                    ${interests.map(i => `<button class="interest-btn" onclick="window.toggleInterest(this, '${i}')">${i}</button>`).join('')}
                </div>
                <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(4)">Devam Et →</button>
            `;
        } else if (step === 5) {
            const purposes = ['👋 Sosyalleşmek İstiyorum', '👥 Yeni Arkadaşlar Arıyorum', '📚 Ders Çalışma Arkadaşı', '❤️ Belki Bir Randevu', '🛒 Sadece Market & İlanlar'];
            html = `
                <div class="step-header">Adım 5 / 6</div>
                <div class="step-title">Buradaki Amacın Ne? 🚀</div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                    ${purposes.map(p => `<button class="purpose-btn" onclick="window.selectPurpose(this, '${p}')" style="width:100%; text-align:left; padding:15px; font-size:15px;">${p}</button>`).join('')}
                </div>
                <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(5)">Devam Et →</button>
            `;
        } else if (step === 6) {
            html = `
                <div class="step-header">Son Adım (6 / 6)</div>
                <div class="step-title">Gülümse! 📸</div>
                <p style="text-align:center; font-size:13px; color:#6b7280; margin-bottom:20px;">Profilin için harika bir fotoğraf seç.</p>
                <div style="display:flex; justify-content:center; margin-bottom: 30px;">
                    <div style="position:relative; cursor:pointer; display:inline-block;" onclick="document.getElementById('final-avatar-upload').click()">
                        <div id="preview-pc-avatar-container" class="id-card-avatar" style="width:130px; height:130px; border-radius:50%; border:4px solid var(--primary); overflow:hidden;">👤</div>
                        <div style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:16px; border:3px solid white; z-index:10; box-shadow:0 2px 5px rgba(0,0,0,0.2);">📷</div>
                    </div>
                    <input type="file" id="final-avatar-upload" accept="image/*" style="position:absolute; width:1px; height:1px; opacity:0; z-index:-1;" onchange="window.openCropper(event, 'register')">
                </div>
                <button id="final-register-btn" class="btn-primary" style="width:100%; padding:16px; font-size:16px; font-weight:bold; border-radius:12px; background:linear-gradient(135deg, var(--primary), #818cf8);" onclick="window.finalizeRegistration()">Profili Tamamla ve Giriş Yap ✨</button>
            `;
        }
        wrapper.innerHTML = html;
    };

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

    window.currentCropperContext = ''; 

    window.openCropper = function(event, context) {
        const file = event.target.files[0];
        if(!file) return;
        
        window.currentCropperContext = context;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cropper-image').src = e.target.result;
            document.getElementById('cropper-modal').classList.add('active');
            if(cropper) { cropper.destroy(); }
            setTimeout(() => {
                const image = document.getElementById('cropper-image');
                cropper = new Cropper(image, { aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 0.9, restore: false, guides: false, center: false, highlight: false, cropBoxMovable: false, cropBoxResizable: false, toggleDragModeOnDblclick: false });
            }, 150);
        };
        reader.readAsDataURL(file);
        event.target.value = ''; 
    };

    window.closeCropper = function() {
        document.getElementById('cropper-modal').classList.remove('active');
        if(cropper) { cropper.destroy(); cropper = null; }
    };

    window.saveCroppedImage = async function() {
        if(!cropper) return;
        const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        if (window.currentCropperContext === 'register') {
            window.registrationData.avatarDataUrl = base64Image;
            document.getElementById('preview-pc-avatar-container').innerHTML = `<img src="${base64Image}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            window.closeCropper();
        } else if (window.currentCropperContext === 'profile') {
            const btn = document.getElementById('cropper-save-btn');
            if(btn) { btn.innerText = "⏳ Yükleniyor..."; btn.disabled = true; }
            await window.uploadProfileAvatarDirect(base64Image);
            window.closeCropper();
            if(btn) { btn.innerText = "Kaydet"; btn.disabled = false; }
        }
    };

    window.uploadProfileAvatarDirect = async function(base64Image) {
        try {
            const fileName = window.userProfile.uid + '_avatar_' + Date.now() + '.jpg';
            const storageRef = ref(storage, 'avatars/' + fileName);
            await uploadString(storageRef, base64Image, 'data_url');
            const url = await getDownloadURL(storageRef);
            
            await updateDoc(doc(db, "users", window.userProfile.uid), { avatarUrl: url });
            window.userProfile.avatarUrl = url;
            window.renderProfile();
            alert("Profil fotoğrafınız başarıyla güncellendi!");
        } catch(e) {
            console.error(e);
            alert("Fotoğraf yüklenirken hata oluştu: " + e.message);
        }
    };

    window.processStep = async function(step) {
        if (step === 1) {
            const e = document.getElementById('reg-email').value.trim();
            const p = document.getElementById('reg-password').value;
            const pConf = document.getElementById('reg-password-confirm').value;
            
            if(!e || !p || !pConf) return alert("Lütfen e-posta ve şifrenizi girin.");
            if(p !== pConf) return alert("Şifreler eşleşmiyor! Lütfen aynı şifreyi iki kez girdiğinizden emin olun.");
            if(p.length < 6) return alert("Şifre en az 6 karakter olmalıdır.");
            
            const btn = document.getElementById('step1-btn');
            btn.innerText = "İşleniyor...";
            btn.disabled = true;

            try {
                const userCred = await createUserWithEmailAndPassword(auth, e, p);
                await sendEmailVerification(userCred.user);
                window.registrationData.email = e;
                window.registrationData.uid = userCred.user.uid;
                window.renderStep(2);
            } catch (error) {
                alert("Hata: " + error.message);
                btn.innerText = "Kayıt Ol ve Doğrulama Kodu Gönder";
                btn.disabled = false;
            }
        } else if (step === 2) {
            const btn = document.getElementById('step2-btn');
            btn.innerText = "Kontrol Ediliyor...";
            btn.disabled = true;
            try {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) { window.renderStep(3); } 
                else {
                    alert("E-postanız henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.");
                    btn.innerText = "Doğruladım, Devam Et →";
                    btn.disabled = false;
                }
            } catch (error) { alert("Hata: " + error.message); btn.innerText = "Doğruladım, Devam Et →"; btn.disabled = false; }
        } else if (step === 3) {
            const uInput = document.getElementById('reg-username').value.trim().toLowerCase().replace(/\s+/g, '');
            const n = document.getElementById('reg-name').value.trim();
            const s = document.getElementById('reg-surname').value.trim();
            const a = document.getElementById('reg-age').value.trim();
            const f = document.getElementById('reg-faculty').value;
            const g = document.getElementById('reg-gender').value;
            
            if(!uInput) return alert("Lütfen bir kullanıcı adı belirleyin.");
            if(!n || !s || !a || !f || !g || !window.registrationData.grade) return alert("Lütfen cinsiyet dahil tüm kişisel bilgilerinizi eksiksiz doldurun.");
            
            const finalUsername = '#' + uInput;
            const btn = document.getElementById('step3-btn');
            btn.innerText = "Kullanıcı Adı Kontrol Ediliyor...";
            btn.disabled = true;
            
            try {
                const q = query(collection(db, "users"), where("username", "==", finalUsername), limit(1));
                const snap = await getDocs(q);
                if(!snap.empty) {
                    alert("Bu kullanıcı adı zaten alınmış. Lütfen başka bir tane seçin.");
                    btn.innerText = "Devam Et →";
                    btn.disabled = false;
                    return;
                }
            } catch(e) { console.error(e); }

            window.registrationData = { ...window.registrationData, username: finalUsername, name: n, surname: s, age: a, faculty: f, gender: g };
            window.renderStep(4);
        } else if (step === 4) {
            if(window.registrationData.interests.length < 2) return alert("Lütfen en az 2 ilgi alanı seçin.");
            window.renderStep(5);
        } else if (step === 5) {
            if(!window.registrationData.purpose) return alert("Lütfen uygulamadaki amacınızı seçin.");
            window.renderStep(6);
        }
    };

    window.finalizeRegistration = async function() {
        const btn = document.getElementById('final-register-btn');
        btn.innerText = "Kimliğiniz Oluşturuluyor... ⏳";
        btn.disabled = true;
        
        const d = window.registrationData;
        const user = auth.currentUser;
        let finalAvatarUrl = "";

        const now = new Date();
        let activeYear = now.getFullYear();
        if (now.getMonth() < 7) activeYear -= 1;

        try {
            if (d.avatarDataUrl) {
                const fileName = user.uid + '_avatar_' + Date.now() + '.jpg';
                const storageRef = ref(storage, 'avatars/' + fileName);
                await uploadString(storageRef, d.avatarDataUrl, 'data_url');
                finalAvatarUrl = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid, 
                name: d.name, 
                surname: d.surname, 
                username: d.username,
                email: d.email, 
                university: "UniLoop Kampüsü", 
                faculty: d.faculty, 
                grade: d.grade, 
                age: d.age, 
                gender: d.gender,
                interests: d.interests, 
                purpose: d.purpose,
                avatar: "👨‍🎓", 
                avatarUrl: finalAvatarUrl, 
                isOnline: true, 
                isPremium: false,
                fastMatchCount: 0,
                fastMatchDate: new Date().toLocaleDateString(),
                lockedArchiveFaculty: "",
                lockedArchiveGrade: "",
                lastArchiveResetYear: activeYear,
                profileViewers: [],
                blockedUsers: [],
                popularity: 0,
                lastTournamentDate: 0,
                voiceChatUsedMinutes: 0,
                voiceChatDate: new Date().toLocaleDateString()
            });

            alert("Harika! Profilin başarıyla oluşturuldu. Şimdi uygulamaya yönlendiriliyorsun.");
            window.location.reload(); 
        } catch (error) {
            alert("Profil kaydedilirken bir hata oluştu: " + error.message);
            btn.innerText = "Profili Tamamla ve Giriş Yap ✨";
            btn.disabled = false;
        }
    };

    window.ensureWelcomeMessage = async function(user, userName) {
        if(!user) return;
        try {
            const chatId = user.uid + "_system_welcome";
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                const systemMessageText = `
                    Merhaba ${userName}! Dünyanın en yenilikçi kampüs ağı UniLoop'a hoş geldin. 🎓✨<br><br>
                    Burası senin alanın. Hemen insanlarla tanışmaya başla!
                `;
                await setDoc(chatRef, {
                    participants: [user.uid, "system"],
                    participantNames: { [user.uid]: userName, "system": "UniLoop Team" },
                    participantAvatars: { [user.uid]: "👨‍🎓", "system": "👤" }, 
                    lastUpdated: serverTimestamp(),
                    status: 'accepted',
                    initiator: 'system',
                    isMarketChat: false,
                    messages: [{
                        senderId: "system", 
                        text: systemMessageText, 
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        read: false
                    }]
                });
            }
        } catch (error) { console.error(error); }
    };

    window.logout = async function() {
        try {
            if(window.userProfile && window.userProfile.uid) { await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false }); }
            await signOut(auth);
            if(authScreen && appScreen) {
                appScreen.style.display = 'none';
                authScreen.style.display = 'flex';
                authScreen.classList.add('active');
                const logCard = document.getElementById('login-card');
                const regCard = document.getElementById('register-card');
                if (logCard) logCard.style.display = 'block';
                if (regCard) regCard.style.display = 'none';
                if(document.getElementById('stepper-wrapper')) document.getElementById('stepper-wrapper').remove();
                const bottomNav = document.getElementById('uniloop-bottom-nav');
                if(bottomNav) bottomNav.remove();
                const topNotifBtn = document.getElementById('notif-btn-top');
                if(topNotifBtn) topNotifBtn.remove();
                if(window.homeSliderInterval) clearInterval(window.homeSliderInterval);
            }
        } catch(error) { console.error(error); }
    };

    window.deleteAccount = async function() {
        if(confirm("Emin misin? Hesabın kalıcı olarak silinecek!")) {
            if(confirm("Emin misin? Tüm verilerin, mesajların ve eşleşmelerin tamamen kaybolacak!")) {
                if(confirm("Son onay: Bu işlem kesinlikle geri alınamaz. Devam edilsin mi?")) {
                    try {
                        const user = auth.currentUser;
                        if(user) {
                            await deleteDoc(doc(db, "users", user.uid));
                            await deleteUser(user);
                            alert("Hesabınız başarıyla silindi. Elveda!");
                            window.location.reload();
                        }
                    } catch(e) {
                        if (e.code === 'auth/requires-recent-login') {
                            alert("Güvenlik nedeniyle hesabınızı silmek için yeniden giriş yapmanız gerekmektedir. Lütfen çıkış yapıp tekrar girin ve silme işlemini tekrar başlatın.");
                        } else {
                            alert("Hata: " + e.message);
                        }
                    }
                }
            }
        }
    };

    window.showAcademicYearUpdateModal = function(activeYear) {
        let facOptions = allFaculties.map(f => `<option value="${f}" ${window.userProfile.faculty === f ? 'selected' : ''}>${f}</option>`).join('');
        
        window.openModal('🎓 Yeni Akademik Yıl!', `
            <div style="text-align:center; padding:10px;">
                <div style="font-size:40px; margin-bottom:10px;">🎉</div>
                <h3 style="color:var(--text-dark); margin-bottom:10px;">Yeni Eğitim Yılı Başladı!</h3>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Geçtiğimiz akademik yılı geride bıraktık. Arşiv haklarının sıfırlanması ve profilinin güncellenmesi için lütfen güncel sınıfını ve fakülteni onayla.</p>
                
                <select id="reset-faculty" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white; margin-bottom:10px;">
                    <option value="">Fakülte Seçiniz</option>
                    ${facOptions}
                </select>
                
                <select id="reset-grade" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white; margin-bottom:15px;">
                    <option value="1" ${window.userProfile.grade == '1' ? 'selected' : ''}>1. Sınıf</option>
                    <option value="2" ${window.userProfile.grade == '2' ? 'selected' : ''}>2. Sınıf</option>
                    <option value="3" ${window.userProfile.grade == '3' ? 'selected' : ''}>3. Sınıf</option>
                    <option value="4" ${window.userProfile.grade == '4' ? 'selected' : ''}>4. Sınıf</option>
                    <option value="5" ${window.userProfile.grade == '5' ? 'selected' : ''}>5. Sınıf</option>
                    <option value="6" ${window.userProfile.grade == '6' ? 'selected' : ''}>6. Sınıf</option>
                </select>
                
                <button class="btn-primary" style="width:100%; padding:14px; border-radius:10px; font-size:15px; font-weight:bold;" onclick="window.saveAcademicYearReset(${activeYear})">Güncelle ve Arşivi Sıfırla</button>
            </div>
        `);
        
        setTimeout(() => {
            const closeBtn = document.querySelector('#app-modal .close-btn') || document.getElementById('modal-close');
            if(closeBtn) closeBtn.style.display = 'none';
        }, 100);
    };

    window.saveAcademicYearReset = async function(activeYear) {
        const newFac = document.getElementById('reset-faculty').value;
        const newGr = document.getElementById('reset-grade').value;
        if(!newFac || !newGr) return alert("Lütfen fakülte ve sınıf seçin.");

        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), {
                faculty: newFac,
                grade: newGr,
                lastArchiveResetYear: activeYear,
                lockedArchiveFaculty: "",
                lockedArchiveGrade: ""
            });
            window.userProfile.faculty = newFac;
            window.userProfile.grade = newGr;
            window.userProfile.lastArchiveResetYear = activeYear;
            window.userProfile.lockedArchiveFaculty = "";
            window.userProfile.lockedArchiveGrade = "";
            
            alert("Harika! Yeni yıl profilin güncellendi ve arşiv kilidin sıfırlandı.");
            
            const closeBtn = document.querySelector('#app-modal .close-btn') || document.getElementById('modal-close');
            if(closeBtn) closeBtn.style.display = 'block';
            
            window.closeModal();
            window.renderProfile(); 
        } catch(e) {
            alert("Hata oluştu: " + e.message);
        }
    };

    onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) { 
            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                
                if(!docSnap.exists()) {
                    if(authScreen) { authScreen.style.display = 'flex'; authScreen.classList.add('active'); }
                    if(appScreen) appScreen.style.display = 'none';
                    const logCard = document.getElementById('login-card');
                    if(logCard) logCard.style.display = 'none';
                    window.registrationData.email = user.email;
                    startRegistrationStepper(3);
                    return; 
                }

                if(authScreen) { authScreen.style.display = 'none'; authScreen.classList.remove('active'); }
                if(appScreen) appScreen.style.display = 'block';

                window.userProfile = docSnap.data();
                if(window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if(window.userProfile.age === undefined) window.userProfile.age = "";
                if(window.userProfile.gender === undefined) window.userProfile.gender = "";
                if(window.userProfile.avatarUrl === undefined) window.userProfile.avatarUrl = "";
                if(window.userProfile.profileViewers === undefined) window.userProfile.profileViewers = [];
                if(window.userProfile.lockedArchiveFaculty === undefined) window.userProfile.lockedArchiveFaculty = "";
                if(window.userProfile.lockedArchiveGrade === undefined) window.userProfile.lockedArchiveGrade = "";
                if(window.userProfile.lastArchiveResetYear === undefined) window.userProfile.lastArchiveResetYear = 2023;
                if(window.userProfile.blockedUsers === undefined) window.userProfile.blockedUsers = [];
                if(window.userProfile.popularity === undefined) window.userProfile.popularity = 0; 
                if(window.userProfile.lastTournamentDate === undefined) window.userProfile.lastTournamentDate = 0; 
                if(window.userProfile.voiceChatUsedMinutes === undefined) window.userProfile.voiceChatUsedMinutes = 0; 
                if(window.userProfile.voiceChatDate === undefined) window.userProfile.voiceChatDate = ""; 

                await window.ensureWelcomeMessage(user, window.userProfile.name);
                await updateDoc(userDocRef, { isOnline: true });

                const now = new Date();
                let activeYear = now.getFullYear();
                if (now.getMonth() < 7) activeYear -= 1;

                if (window.userProfile.lastArchiveResetYear < activeYear) {
                    setTimeout(() => window.showAcademicYearUpdateModal(activeYear), 1000);
                }
                
                const headerRightMenu = document.querySelector('.header-right-menu');
                if (headerRightMenu) {
                    headerRightMenu.innerHTML = ''; 
                    
                    if (!window.userProfile.isPremium) {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer; box-sizing:border-box; margin:0;" onclick="window.openPremiumModal()">☆ Premium</div>`);
                    } else {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer; box-sizing:border-box; margin:0;" onclick="window.openPremiumFeaturesModal()">☆ Ayrıcalıklar</div>`);
                    }

                    headerRightMenu.insertAdjacentHTML('beforeend', `<div id="notif-btn-top" onclick="window.renderNotifications()" title="Bildirimler" style="background:white; border:1px solid #111827; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer; box-sizing:border-box; margin:0;"><svg viewBox="0 0 24 24" width="18" height="18" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> <span id="notif-badge-top" style="display:none; position:absolute; top:-4px; right:-4px; background:#EF4444; color:white; border-radius:50%; width:16px; height:16px; font-size:10px; align-items:center; justify-content:center; font-weight:bold; border:2px solid white;">0</span></div>`);
                }

                if (!document.getElementById('uniloop-bottom-nav')) {
                    const bottomNav = document.createElement('div');
                    bottomNav.id = 'uniloop-bottom-nav';
                    bottomNav.className = 'bottom-nav';
                    bottomNav.innerHTML = `
                        <div class="menu-item bottom-nav-item active" data-target="home" onclick="window.loadPage('home')"><div class="bottom-nav-icon"><svg class="fill-active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div><span>Ana Sayfa</span></div>
                        <div class="menu-item bottom-nav-item" data-target="confessions" onclick="window.loadPage('confessions')"><div class="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg></div><span>Keşfet</span></div>
                        <div class="menu-item bottom-nav-item" data-target="market" onclick="window.loadPage('market')"><div class="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div><span>Market</span></div>
                        <div class="menu-item bottom-nav-item" data-target="messages" onclick="window.loadPage('messages')"><div class="bottom-nav-icon" style="position:relative;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span id="notif-badge" style="display:none; position:absolute; top:-4px; right:-6px; background:#EF4444; color:white; border-radius:50%; width:14px; height:14px; font-size:9px; align-items:center; justify-content:center; font-weight:bold; border: 2px solid white;">0</span></div><span>Mesajlar</span></div>
                        <div class="menu-item bottom-nav-item" data-target="profile" onclick="window.loadPage('profile')"><div class="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span>Profil</span></div>
                    `;
                    if (appScreen) appScreen.appendChild(bottomNav);
                }
                
                initRealtimeListeners(user.uid);
                const activeTab = document.querySelector('.bottom-nav-item.active');
                if(typeof window.loadPage === 'function') { window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); }
            } catch(error) { console.error(error); }
        } else {
            if(appScreen) appScreen.style.display = 'none';
            if(authScreen) { authScreen.style.display = 'flex'; authScreen.classList.add('active'); }
            const logCard = document.getElementById('login-card');
            const regCard = document.getElementById('register-card');
            if(logCard) logCard.style.display = 'block';
            if(regCard) regCard.style.display = 'none';
        }
    });

    window.sendSystemNotification = async function(targetId, text) {
        try {
            const chatId = targetId + "_system_welcome";
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({ senderId: "system", text: text, time: timeStr, read: false, isSystem: true }),
                lastUpdated: serverTimestamp()
            });
        } catch(e) { console.error(e); }
    };
    
    function initRealtimeListeners(currentUid) {
        const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

        onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(50)), (snapshot) => {
            marketDB = [];
            snapshot.forEach(doc => { marketDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
            marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            const activeTab = document.querySelector('.bottom-nav-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market');
        });

        onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc"), limit(50)), (snapshot) => {
            confessionsDB = [];
            snapshot.forEach(doc => { confessionsDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
            confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            const activeTab = document.querySelector('.bottom-nav-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'confessions') {
                const feedContainer = document.getElementById('conf-feed');
                if (feedContainer && feedContainer.children.length === confessionsDB.length) {
                    confessionsDB.forEach(post => {
                        const isLiked = post.likes && post.likes.includes(currentUid);
                        const likeBtn = document.getElementById(`like-btn-${post.id}`);
                        if (likeBtn) likeBtn.innerHTML = `${isLiked ? '❤️' : '🤍'} <span style="margin-left:4px;">${post.likes ? post.likes.length : 0}</span>`;
                        const commentCountBtn = document.getElementById(`comment-count-${post.id}`);
                        if (commentCountBtn) commentCountBtn.innerHTML = `💬 <span style="margin-left:4px;">${post.comments ? post.comments.length : 0}</span>`;
                    });
                } else { window.drawConfessionsFeed(); }
            }
            if(document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
                const activePostId = document.getElementById('active-post-id').value;
                if(activePostId) window.updateConfessionDetailLive(activePostId);
            }
        });

        onSnapshot(query(collection(db, "chats"), where("participants", "array-contains", currentUid)), (snapshot) => {
            chatsDB = [];
            let pendingRequestsCount = 0;
            let unreadMessagesCount = 0;
            snapshot.forEach(doc => {
                try {
                    const data = doc.data({ serverTimestamps: 'estimate' }); 
                    if (!data.participants || !Array.isArray(data.participants)) return;
                    const otherUid = data.participants.find(p => p !== currentUid) || "system";
                    
                    if (window.userProfile.blockedUsers && window.userProfile.blockedUsers.includes(otherUid)) return;
                    if (data.status === 'blocked' && data.blockedBy !== window.userProfile.uid) return;

                    const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
                    const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
                    let safeTimestamp = data.lastUpdated && typeof data.lastUpdated.toMillis === 'function' ? data.lastUpdated.toMillis() : Date.now();
                    
                    const chatItem = { 
                        id: doc.id, otherUid: otherUid, name: otherName, avatar: otherAvatar, 
                        messages: data.messages || [], status: data.status || 'accepted', 
                        initiator: data.initiator || null, lastUpdatedTS: safeTimestamp,
                        isMarketChat: data.isMarketChat || false,
                        listingIds: data.listingIds || (data.listingId ? [data.listingId] : []) 
                    };
                    chatsDB.push(chatItem);

                    if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) { pendingRequestsCount++; } 
                    else if (chatItem.status === 'accepted' || chatItem.isMarketChat) {
                        if (chatItem.messages && chatItem.messages.length > 0) {
                            const lastMsg = chatItem.messages[chatItem.messages.length - 1];
                            if (lastMsg.senderId !== currentUid && lastMsg.read === false) unreadMessagesCount++;
                        }
                    }
                } catch(err) { console.error(err); }
            });

            chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
            
            const totalNotifs = pendingRequestsCount + unreadMessagesCount;
            const notifBadge = document.getElementById('notif-badge'); 
            const notifBadgeTop = document.getElementById('notif-badge-top'); 
            
            if(notifBadge) { if(totalNotifs > 0) { notifBadge.style.display = 'flex'; notifBadge.innerText = totalNotifs; } else { notifBadge.style.display = 'none'; } }
            if(notifBadgeTop) { if(totalNotifs > 0) { notifBadgeTop.style.display = 'flex'; notifBadgeTop.innerText = totalNotifs; } else { notifBadgeTop.style.display = 'none'; } }

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
            } else if (activeTab && activeTab.getAttribute('data-target') === 'profile') {
                window.renderProfile();
            }
            if (document.getElementById('app-modal').classList.contains('active') && document.getElementById('modal-title').innerText.includes('Bildirimler')) { window.renderNotifications(); }
        });
    }

// ============================================================================
// 🌟 BÖLÜM 1 SONU 🌟
// ============================================================================
// ============================================================================
// 🌟 MEDYA YÜKLEME SİSTEMİ, KAMPÜS FREKANSI VE EŞLEŞME (BÖLÜM 2) 🌟
// ============================================================================

    window.uploadChatMedia = async function(event, targetId, chatType) {
        const file = event.target.files[0];
        if(!file) return;

        const isPdf = file.type === "application/pdf";
        
        try {
            const cleanName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
            const storagePath = `chat_media/${window.userProfile.uid}/${Date.now()}_${cleanName}`;
            const storageRef = ref(storage, storagePath);
            
            alert("Medya yükleniyor, lütfen bekleyin...");
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const msgObj = {
                senderId: window.userProfile.uid,
                text: "",
                time: timeStr,
                mediaUrl: downloadUrl,
                mediaType: isPdf ? 'pdf' : 'image',
                read: false
            };

            await updateDoc(doc(db, "chats", targetId), {
                messages: arrayUnion(msgObj),
                lastUpdated: serverTimestamp()
            });

            event.target.value = ''; 
        } catch(error) {
            console.error("Medya yüklenemedi:", error);
            alert("Medya gönderilirken bir hata oluştu.");
        }
    };

    window.openPremiumModal = function() {
        const fac = window.userProfile.faculty || "Fakültenizin";
        const grade = window.userProfile.grade ? window.userProfile.grade + ". Sınıf" : "";
        
        window.openModal('🌟 UniLoop Premium', `
            <div style="text-align:center; padding: 10px;">
                <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
                <h3 style="color:#111827; margin-bottom: 10px; font-size: 22px;">Kampüsün Zirvesine Çık!</h3>
                <p style="margin-bottom:20px; font-size:15px; color:var(--text-gray);">
                    UniLoop Premium ile sınırları kaldır ve kampüsün en donanımlı ağına dahil ol.
                </p>
                <div style="font-size:32px; font-weight:800; margin-bottom:20px; color:var(--text-dark);">
                    79.99 ₺ <span style="font-size:14px; color:var(--text-gray); font-weight:normal;">/ aylık</span>
                </div>
                <ul style="text-align:left; font-size:14px; margin-bottom:20px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:15px 15px 15px 35px; border-radius:12px; border:1px solid #111827;">
                    <li>👀 <b>Diğer kullanıcıların detaylı profillerini görüntüleme hakkı!</b> Blurları kaldır.</li>
                    <li>🎙️ <b>Günlük 30 Dakika</b> Kampüs Frekansı Sesli Sohbet Hakkı!</li>
                    <li>🔥 <b>Günlük 30 Adet</b> Hızlı Eşleşme hakkı. (Daha Fazla Eşleşme)</li>
                    <li>🕵️ <b>Kimler Profilime Baktı?</b> Seni görüntüleyen gizli hayranlarını gör.</li>
                </ul>
                <button id="buy-premium-btn" onclick="window.upgradeToPremium()" style="width:100%; justify-content:center; padding: 16px; font-size: 16px; background:linear-gradient(135deg, #111827, #374151); color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3); transition:0.2s;" class="premium-glow">
                    💳 Güvenli Ödeme İle Satın Al
                </button>
                <p style="font-size:11px; color:#9CA3AF; margin-top:10px;">*İstediğin zaman iptal edebilirsin.</p>
            </div>
        `);
    };

    window.openModal = function(title, contentHTML) { 
        document.getElementById('modal-title').innerText = title; 
        document.getElementById('modal-body').innerHTML = contentHTML; 
        modal.classList.add('active'); 
        if(!document.body.classList.contains('no-scroll-home')) {
            document.body.style.overflow = 'hidden'; 
        }
    };

    window.closeModal = function() { 
        modal.classList.remove('active'); 
        document.getElementById('modal-body').innerHTML = ''; 
        if (!document.getElementById('lightbox').classList.contains('active') && !document.body.classList.contains('no-scroll-messages') && !document.body.classList.contains('no-scroll-home')) {
            document.body.style.overflow = 'auto'; 
        }
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
                if(navBtn) {
                    navBtn.outerHTML = `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer; box-sizing:border-box; margin:0;" onclick="window.openPremiumFeaturesModal()">☆ Ayrıcalıklar</div>`;
                }
                
                window.closeModal();
                alert("🎉 Tebrikler! Ödemeniz başarıyla alındı. UniLoop Premium ayrıcalıklarına artık sahipsiniz!");
                window.loadPage('home'); 
            } catch(e) {
                alert("Hata oluştu: Lütfen internet bağlantınızı kontrol edin.");
                btn.innerText = '💳 Güvenli Ödeme İle Satın Al';
                btn.disabled = false;
            }
        }, 3000);
    };

    window.cancelPremium = async function() {
        if(confirm("Premium üyeliğinizi iptal etmek istediğinize emin misiniz? Gelecek ay aboneliğiniz yenilenmeyecektir.")) {
            try {
                await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: false });
                window.userProfile.isPremium = false;
                
                const navBtn = document.getElementById('nav-premium-action');
                if(navBtn) {
                    navBtn.outerHTML = `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer; box-sizing:border-box; margin:0;" onclick="window.openPremiumModal()">☆ Premium</div>`;
                }

                alert("Premium üyeliğiniz başarıyla iptal edildi.");
                window.closeModal();
                window.renderSettings();
            } catch(e) {
                alert("Hata oluştu: " + e.message);
            }
        }
    };

    // ============================================================================
    // 🎙️ KAMPÜS FREKANSI (VOICE CHAT) SİSTEMİ
    // ============================================================================

    window.openVoiceChat = async function() {
        let maxMins = window.userProfile.isPremium ? 30 : 10;
        let usedMins = window.userProfile.voiceChatUsedMinutes || 0;
        let today = new Date().toLocaleDateString();

        // Gün sıfırlama kontrolü
        if (window.userProfile.voiceChatDate !== today) {
            usedMins = 0;
            window.userProfile.voiceChatUsedMinutes = 0;
            window.userProfile.voiceChatDate = today;
            await updateDoc(doc(db, "users", window.userProfile.uid), { voiceChatUsedMinutes: 0, voiceChatDate: today });
        }

        if (usedMins >= maxMins) {
            if(!window.userProfile.isPremium) {
                alert(`Günlük 10 dakikalık sohbet sınırını doldurdun! Daha fazla konuşmak için Premium'a geçebilirsin.`);
                window.openPremiumModal();
            } else {
                alert(`Günlük 30 dakikalık Premium sohbet sınırını doldurdun! Yarın tekrar gel.`);
            }
            return;
        }

        // Alt navigasyonu pasif göster
        document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
        document.body.classList.add('no-scroll-messages'); 

        // SADECE ORTA ALANI (MAIN CONTENT) DEĞİŞTİRİYORUZ (Header ve Nav sabit kalır)
        let html = `
            <div id="voice-chat-container" style="display:flex; flex-direction:column; height:100%; background:#030712; color:white; overflow:hidden; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 20px; border-bottom:1px solid #1f2937; background:#111827;">
                    <span style="color:#10b981; font-weight:800; font-size:14px; background:rgba(16,185,129,0.1); padding:6px 12px; border-radius:12px;">Kalan Süren: ${maxMins - usedMins} Dk</span>
                    <button onclick="window.endVoiceChat()" style="background:transparent; border:none; color:#ef4444; font-size:14px; font-weight:bold; cursor:pointer; padding:5px;">✖ Çıkış</button>
                </div>

                <div id="voice-dynamic-area" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center;">
                    <div style="font-size: 60px; margin-bottom: 20px;" class="white-flame-icon">📻</div>
                    <h2 style="margin: 0 0 10px 0;">Kampüs Frekansı</h2>
                    <p style="color: #9ca3af; font-size: 13px; margin-bottom: 40px; line-height:1.5;">Görünüm yok, önyargı yok.<br>Sadece ses ve muhabbet.</p>
                    <button onclick="window.startVoiceSearch()" style="background:transparent; color:#c4b5fd; border:2px solid #8b5cf6; padding:15px 30px; font-size:18px; font-weight:800; border-radius:50px; cursor:pointer; box-shadow:0 0 20px rgba(139,92,246,0.3); transition:0.3s;" onmouseover="this.style.background='#8b5cf6'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='#c4b5fd';">Frekans Ara 🎙️</button>
                </div>
            </div>
        `;
        mainContent.innerHTML = html;
    };

    window.startVoiceSearch = function() {
        const area = document.getElementById('voice-dynamic-area');
        if(!area) return;

        area.innerHTML = `
            <div style="width:150px; height:150px; border-radius:50%; border:2px solid rgba(139,92,246,0.3); position:relative; display:flex; align-items:center; justify-content:center; margin-bottom:30px;">
                <div style="position:absolute; width:75px; height:150px; background:linear-gradient(90deg, rgba(139,92,246,0.5) 0%, transparent 100%); border-radius:75px 0 0 75px; transform-origin:center right; left:0; animation:spin 2s linear infinite;"></div>
                <div style="font-size:35px; z-index:10;">📡</div>
            </div>
            <h3 style="color:#c4b5fd; margin:0 0 5px 0;">Kampüs taranıyor...</h3>
            <p style="color:#9ca3af; font-size:13px; margin-bottom:30px;">Aynı frekansta biri aranıyor.</p>
            <button onclick="window.openVoiceChat()" style="background:#374151; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:bold; cursor:pointer;">Aramayı İptal Et</button>
        `;

        // 3 saniye arama simülasyonu
        setTimeout(() => { 
            if(document.getElementById('voice-dynamic-area')) window.connectVoiceChat(); 
        }, 3000);
    };

    window.connectVoiceChat = function() {
        const area = document.getElementById('voice-dynamic-area');
        if(!area) return;

        area.innerHTML = `
            <h4 style="color:#10b981; margin:0 0 5px 0; text-transform:uppercase; letter-spacing:2px; animation: glowPulse 2s infinite alternate;">Bağlantı Kuruldu</h4>
            <p id="voice-chat-timer" style="color:#e5e7eb; font-family:monospace; font-size:24px; font-weight:bold; margin:0 0 30px 0;">00:00</p>
            
            <div style="width:120px; height:120px; border-radius:50%; background:radial-gradient(circle, #4c1d95, #111827); filter:blur(8px); margin-bottom:40px; animation:breathe 3s infinite alternate;"></div>

            <div style="display:flex; align-items:center; justify-content:center; gap:8px; height:60px; margin-bottom:40px;">
                <div class="voice-bar" id="bar-1"></div><div class="voice-bar" id="bar-2"></div>
                <div class="voice-bar" id="bar-3"></div><div class="voice-bar" id="bar-4"></div>
                <div class="voice-bar" id="bar-5"></div><div class="voice-bar" id="bar-6"></div><div class="voice-bar" id="bar-7"></div>
            </div>
            
            <p style="color:#6b7280; font-size:13px; margin-bottom:30px;">Mikrofon erişimi sağlandı, konuşabilirsin...</p>

            <div style="display:flex; gap:15px; width:100%; justify-content:center; max-width:300px;">
                <button id="reveal-btn" onclick="window.requestReveal()" style="flex:1; background:white; color:#111827; border:none; padding:15px 10px; border-radius:12px; font-weight:800; cursor:pointer; font-size:13px;">Kimliği Açıkla 🎭</button>
                <button onclick="window.skipVoiceChat()" style="flex:1; background:#4b5563; color:white; border:none; padding:15px 10px; border-radius:12px; font-weight:800; cursor:pointer; font-size:13px;">Kişiyi Atla ⏭️</button>
            </div>
            <p id="reveal-status" style="color:#f59e0b; font-size:13px; margin-top:20px; display:none; font-weight:bold;">Karşı tarafın onayı bekleniyor ⏳</p>
        `;

        window.voiceCallSeconds = 0;
        window.startVoiceTimer();
        window.initMicrophone();
    };

    window.startVoiceTimer = function() {
        if (window.voiceTimerInterval) clearInterval(window.voiceTimerInterval);
        window.voiceTimerInterval = setInterval(() => {
            window.voiceCallSeconds++;
            const m = Math.floor(window.voiceCallSeconds / 60).toString().padStart(2, '0');
            const s = (window.voiceCallSeconds % 60).toString().padStart(2, '0');
            const tEl = document.getElementById('voice-chat-timer');
            if(tEl) tEl.innerText = `${m}:${s}`;
        }, 1000);
    };

    // SES DALGALARI İÇİN MİKROFON İZNİ
    window.initMicrophone = async function() {
        const bars = [1,2,3,4,5,6,7].map(i => document.getElementById(`bar-${i}`));
        try {
            window.voiceMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            window.voiceAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = window.voiceAudioCtx.createMediaStreamSource(window.voiceMicStream);
            const analyser = window.voiceAudioCtx.createAnalyser();
            analyser.fftSize = 32;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            function animateBars() {
                if(!window.voiceMicStream) return;
                window.voiceAnimFrame = requestAnimationFrame(animateBars);
                analyser.getByteFrequencyData(dataArray);
                for(let i=0; i<7; i++) {
                    if(!bars[i]) continue;
                    let val = dataArray[i+2] || 0;
                    let height = Math.max(10, (val/255)*60); // Max 60px boyunda olsun
                    bars[i].style.height = height + 'px';
                    if(height > 25) {
                        bars[i].style.background = '#34d399';
                        bars[i].style.boxShadow = '0 0 15px #34d399';
                    } else {
                        bars[i].style.background = '#059669';
                        bars[i].style.boxShadow = '0 0 5px #059669';
                    }
                }
            }
            animateBars();
        } catch(e) {
            console.log("Mikrofon izni reddedildi, sahte animasyon başlatılıyor.");
            window.voiceAnimFrame = setInterval(() => {
                bars.forEach(b => { if(b) b.style.height = (Math.floor(Math.random()*40)+10) + 'px'; });
            }, 200);
        }
    };

    window.stopMicrophone = function() {
        if(window.voiceMicStream) { window.voiceMicStream.getTracks().forEach(t => t.stop()); window.voiceMicStream = null; }
        if(window.voiceAudioCtx) { window.voiceAudioCtx.close(); window.voiceAudioCtx = null; }
        if(window.voiceAnimFrame && typeof window.voiceAnimFrame === 'number') { cancelAnimationFrame(window.voiceAnimFrame); } else { clearInterval(window.voiceAnimFrame); }
    };

    window.requestReveal = function() {
        document.getElementById('reveal-btn').style.display = 'none';
        document.getElementById('reveal-status').style.display = 'block';
        
        setTimeout(() => {
            window.processVoiceTime();
            window.stopMicrophone();
            clearInterval(window.voiceTimerInterval);
            const area = document.getElementById('voice-dynamic-area');
            if(!area) return;
            
            area.innerHTML = `
                <h3 style="color:#10b981; margin-bottom:30px;">Eşleşme Başarılı! ✨</h3>
                <div style="background:#1f2937; border:2px solid #374151; border-radius:20px; padding:30px; width:100%; max-width:300px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                    <div style="font-size:50px; margin:-60px auto 15px auto; background:white; width:80px; height:80px; border-radius:50%; border:3px solid #8b5cf6; display:flex; align-items:center; justify-content:center;">👩‍🎓</div>
                    <h2 style="margin:0 0 5px 0; color:white;">Buse, 21</h2>
                    <p style="color:#8b5cf6; font-size:14px; font-weight:bold; margin:0 0 15px 0;">Mimarlık Fakültesi</p>
                    <button style="background:#8b5cf6; color:white; border:none; padding:12px; width:100%; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="window.endVoiceChat(); window.loadPage('messages');">Sohbete Başla 💬</button>
                </div>
            `;
        }, 2000);
    };

    // MATEMATİKSEL AKILLI YUVARLAMA MANTIĞI (30 sn = 1 Dk)
    window.processVoiceTime = async function() {
        if (window.voiceCallSeconds > 0) {
            let addMins = Math.round(window.voiceCallSeconds / 60);
            // Sadece 1 saniye bile konuşsa ve yuvarlama 0 çıkarsa, ama kural "30 sn'den fazla" diyordu. Math.round(30/60) = 1 eder. 
            // Yani 30 saniye ve üstü zaten otomatik 1'e yuvarlanır. Sorun yok.
            if(addMins > 0) {
                window.userProfile.voiceChatUsedMinutes += addMins;
                try { await updateDoc(doc(db, "users", window.userProfile.uid), { voiceChatUsedMinutes: window.userProfile.voiceChatUsedMinutes }); } catch(e) {}
            }
        }
        window.voiceCallSeconds = 0;
    };

    window.skipVoiceChat = function() {
        window.processVoiceTime();
        window.stopMicrophone();
        clearInterval(window.voiceTimerInterval);
        window.startVoiceSearch(); // Doğrudan yeniden arama ekranına atar
    };

    window.endVoiceChat = function() {
        window.processVoiceTime();
        window.stopMicrophone();
        clearInterval(window.voiceTimerInterval);
        window.loadPage('home'); // Ana sayfaya döner, nav bar vs görünür olur
    };

// ============================================================================
// DİĞER FONKSİYONLAR (ARŞİV, PREMIUM, MARKET VS.)
// ============================================================================

    window.uploadArchiveFile = async function() {
        const facBtn = document.getElementById('admin-archive-faculty');
        const grBtn = document.getElementById('admin-archive-grade');
        const fileInput = document.getElementById('admin-archive-file');
        
        if(!fileInput || !fileInput.files.length) return alert("Lütfen yüklenecek bir PDF seçin.");
        
        const fac = facBtn.value.trim();
        const gr = grBtn.value.trim();
        const file = fileInput.files[0];
        
        const uploadBtn = document.getElementById('upload-archive-btn');
        const originalText = uploadBtn.innerText;
        uploadBtn.innerText = "Yükleniyor... Lütfen bekleyin ⏳";
        uploadBtn.disabled = true;

        try {
            const cleanName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
            const storagePath = `archives/${fac}/${gr}/${Date.now()}_${cleanName}`;
            const storageRef = ref(storage, storagePath);
            
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "archives"), {
                faculty: fac,
                grade: gr,
                fileName: file.name,
                fileUrl: downloadUrl,
                uploadedBy: window.userProfile.uid,
                createdAt: serverTimestamp()
            });

            alert(`✅ Başarılı! ${fac} - ${gr} için çıkmış sorular sisteme eklendi.`);
            fileInput.value = '';
            window.closeModal();
        } catch(e) {
            console.error("Yükleme Hatası:", e);
            alert("Dosya yüklenirken hata oluştu: " + e.message);
        } finally {
            if(uploadBtn) { uploadBtn.innerText = originalText; uploadBtn.disabled = false; }
        }
    };

    window.viewArchive = async function() {
        const u = window.userProfile;
        
        if (!u.lockedArchiveFaculty || !u.lockedArchiveGrade) {
            if (!u.faculty || !u.grade) {
                alert("Profilinizde fakülte veya sınıf bilginiz eksik. Lütfen ayarlardan profilinizi güncelleyin.");
                return;
            }
            
            let currentGradeFormatted = u.grade.toString().includes("Sınıf") ? u.grade.toString().trim() : u.grade.toString().trim() + ". Sınıf";
            
            if(confirm(`⚠️ DİKKAT: Arşiv hakkınız tüm eğitim yılı boyunca [${u.faculty} - ${currentGradeFormatted}] olarak sabitlenecektir. \n\nDaha sonra profilinizden sınıf veya fakülte değiştirseniz bile diğer arşivleri GÖREMEZSİNİZ.\n\nOnaylıyor musunuz?`)) {
                try {
                    await updateDoc(doc(db, "users", u.uid), {
                        lockedArchiveFaculty: u.faculty.trim(),
                        lockedArchiveGrade: currentGradeFormatted
                    });
                    u.lockedArchiveFaculty = u.faculty.trim();
                    u.lockedArchiveGrade = currentGradeFormatted;
                    alert("✅ Arşiviniz başarıyla kilitlendi. Yıl boyunca bu bölümün sorularına erişebileceksiniz.");
                } catch(e) {
                    alert("Kilitlenme sırasında bir hata oluştu: " + e.message);
                    return;
                }
            } else {
                return; 
            }
        }

        const fac = u.lockedArchiveFaculty;
        const gr = u.lockedArchiveGrade;

        window.openModal(`📚 ${fac} - ${gr} Arşivi`, `<div style="text-align:center; padding:20px; color:var(--text-gray);">Arşiv güvenli bir şekilde taranıyor... ⏳</div>`);

        try {
            const q = query(collection(db, "archives"), where("faculty", "==", fac));
            const snap = await getDocs(q);

            let matchedDocs = [];
            snap.forEach(doc => {
                if (doc.data().grade === gr) {
                    matchedDocs.push(doc.data());
                }
            });

            let html = '<div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">';
            
            if(matchedDocs.length === 0) {
                html += `
                <div style="text-align:center; padding:30px 10px;">
                    <div style="font-size:40px; margin-bottom:10px;">📭</div>
                    <div style="font-size:14px; color:var(--text-gray); line-height:1.5;">Henüz kilitlendiğiniz bölüm <b>(${fac})</b> ve sınıfa <b>(${gr})</b> ait bir arşiv bulunamadı. Admin'in dosyaları yüklemesini bekleyin.</div>
                </div>`;
            } else {
                html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
                matchedDocs.forEach(data => {
                    html += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:15px; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px;">
                            <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                                <div style="font-size:24px;">📄</div>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-weight:700; font-size:14px; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data.fileName}</div>
                                    <div style="font-size:11px; color:var(--text-gray);">Çıkmış Sorular / Ders Notu</div>
                                </div>
                            </div>
                            <a href="${data.fileUrl}" target="_blank" style="background:#111827; color:white; text-decoration:none; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:bold; flex-shrink:0; box-shadow:0 2px 4px rgba(0,0,0,0.3);">İndir / Aç</a>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            html += '</div>';
            document.getElementById('modal-body').innerHTML = html;

        } catch(e) {
            console.error("Arşiv Çekme Hatası:", e);
            document.getElementById('modal-body').innerHTML = `
                <div style="color:#EF4444; text-align:center; padding:20px;">
                    <strong>Bağlantı Hatası</strong><br><br>
                    Arşiv yüklenirken bir hata oluştu: ${e.message}
                </div>`;
        }
    };

    window.openPremiumFeaturesModal = async function() {
        try {
            const userDoc = await getDoc(doc(db, "users", window.userProfile.uid));
            const viewers = userDoc.exists() ? (userDoc.data().profileViewers || []) : [];
            const isAsude = window.userProfile.username === '#asude';
            
            let viewersHtml = '';
            if(viewers.length > 0) {
                const uniqueViewers = [];
                const seen = new Set();
                for(let i = viewers.length - 1; i >= 0; i--){
                    if(!seen.has(viewers[i].uid)){
                        seen.add(viewers[i].uid);
                        uniqueViewers.push(viewers[i]);
                    }
                }
                viewersHtml = uniqueViewers.map(v => `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:#fff; border-radius:10px; margin-bottom:8px; border:1px solid #E5E7EB; cursor:pointer;" onclick="window.viewUserProfile('${v.uid}')">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:20px;">👀</span>
                            <span style="font-weight:bold; font-size:14px; color:var(--text-dark);">${v.name}</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-gray);">${v.time}</div>
                    </div>
                `).join('');
            } else {
                viewersHtml = '<div style="font-size:13px; color:var(--text-gray); text-align:center; padding:10px;">Henüz kimse profilinize bakmadı.</div>';
            }

            const fac = window.userProfile.faculty || "Fakülte";
            const grade = window.userProfile.grade ? window.userProfile.grade + ". Sınıf" : "";

            let archiveSectionHtml = '';
            
            if (isAsude) {
                let facOptions = allFaculties.map(f => `<option value="${f}">${f}</option>`).join('');
                let gradeOptions = [1, 2, 3, 4, 5, 6].map(g => `<option value="${g}. Sınıf">${g}. Sınıf</option>`).join('');
                
                archiveSectionHtml = `
                    <div class="card" style="background:linear-gradient(135deg, #F3F4F6, #E5E7EB); border:1px solid #111827; padding:20px; border-radius:12px;">
                        <div style="font-size:30px; margin-bottom:10px; text-align:center;">👑</div>
                        <h4 style="color:#111827; margin-bottom:8px; font-size:16px; text-align:center;">Admin Paneli: Arşive Dosya Ekle</h4>
                        <p style="font-size:12px; color:#374151; text-align:center; margin-bottom:15px; font-weight:bold;">Fakülte ve sınıf seçip PDF yükleyin.</p>
                        
                        <select id="admin-archive-faculty" style="width:100%; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #111827; outline:none; font-size:13px;">
                            ${facOptions}
                        </select>
                        <select id="admin-archive-grade" style="width:100%; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #111827; outline:none; font-size:13px;">
                            ${gradeOptions}
                        </select>
                        <input type="file" id="admin-archive-file" accept="application/pdf" style="margin-bottom:15px; width:100%; font-size:12px;">
                        
                        <button id="upload-archive-btn" class="btn-primary" style="width:100%; padding:12px; font-size:14px; border-radius:10px; background:#111827; border:none;" onclick="window.uploadArchiveFile()">
                            PDF'i Arşive Ekle ➡️
                        </button>
                    </div>
                `;
            } else {
                archiveSectionHtml = `
                    <div class="card" style="background:linear-gradient(135deg, #F9FAFB, #F3F4F6); border:1px solid #111827; padding:20px; border-radius:12px;">
                        <div style="font-size:30px; margin-bottom:10px; text-align:center;">📚</div>
                        <h4 style="color:#111827; margin-bottom:8px; font-size:16px; text-align:center;">Çıkmış Sorular Arşivi</h4>
                        <p style="font-size:13px; color:#374151; text-align:center; margin-bottom:15px; font-weight:bold;">Tüm Yıl Boyunca Sabit Erişim</p>
                        <button class="btn-primary" style="width:100%; padding:12px; font-size:14px; border-radius:10px; background:#111827; border:none;" onclick="window.viewArchive()">
                            Arşive Git ➡️
                        </button>
                    </div>
                `;
            }

            window.openModal('🌟 Premium Özellikler Merkezi', `
                <div style="display:flex; flex-direction:column; gap:15px;">
                    ${archiveSectionHtml}
                    
                    <div class="card" style="background:#F9FAFB; border:1px solid #111827; padding:20px; border-radius:12px;">
                        <h4 style="color:#111827; margin-bottom:12px; font-size:15px; display:flex; align-items:center; gap:5px;">
                            <span>🕵️</span> Kimler Profilime Baktı?
                        </h4>
                        <div style="max-height:200px; overflow-y:auto; padding-right:5px;">
                            ${viewersHtml}
                        </div>
                    </div>
                </div>
            `);
        } catch(e) {
            console.error("Premium özellikler yüklenirken hata oluştu:", e);
        }
    };

    window.goToMessages = function() {
        document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
        const msgTab = document.querySelector('.bottom-nav-item[data-target="messages"]');
        if(msgTab) { msgTab.classList.add('active'); window.loadPage('messages'); }
    };

    let fastMatchUsers = [];
    let fastMatchCurrentIndex = 0;

    window.showLeaderboard = async function() {
        window.openModal('🔥 Popülerlik Sıralaması', `<div style="text-align:center; padding:30px;"><div style="font-size:30px; animation: glowPulse 1.5s infinite alternate;">🔥</div><p style="color:var(--text-gray); margin-top:10px;">Sıralama yükleniyor...</p></div>`);
        try {
            const q = query(collection(db, "users"), orderBy("popularity", "desc"), limit(15));
            const snap = await getDocs(q);
            
            let html = '<div style="display:flex; flex-direction:column; gap:8px; max-height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">';
            let rank = 1;
            snap.forEach(doc => {
                const u = doc.data();
                if(u.popularity > 0) {
                    let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                    html += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#F9FAFB; border-radius:12px; border:1px solid #E5E7EB; cursor:pointer; transition:0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='#E5E7EB'" onclick="window.closeModal(); window.viewUserProfile('${u.uid}')">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="font-size:18px; font-weight:800; width:25px; text-align:center;">${medal}</div>
                                <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:#E5E7EB; border:1px solid #111827;">
                                    ${u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="font-size:20px; text-align:center; line-height:40px;">${u.avatar || '👤'}</div>`}
                                </div>
                                <span style="font-weight:700; font-size:14px;">${u.name} ${u.surname ? u.surname.charAt(0)+'.' : ''}</span>
                            </div>
                            <div style="font-weight:800; color:#111827; font-size:14px; background:white; padding:4px 10px; border-radius:12px; border:1px solid #111827;">${u.popularity} 🔥</div>
                        </div>
                    `;
                    rank++;
                }
            });
            if(rank === 1) html += '<p style="text-align:center; color:var(--text-gray); padding:20px;">Henüz popülerlik puanı kazanan kimse yok. İlk sen ol!</p>';
            
            // Liderlik tablosu altından "Savaşa Katıl" butonu
            let btnHtml = `<button id="join-tour-btn-modal" class="btn-primary" style="width:100%; padding:14px; border-radius:12px; background:#111827; border:none; font-weight:bold;" onclick="window.closeModal(); window.startPopularityTournament();">Savaşa Katıl ⚔️</button>`;
            if (window.userProfile && window.userProfile.lastTournamentDate) {
                let timeDiff = Date.now() - window.userProfile.lastTournamentDate;
                if (timeDiff < (24 * 60 * 60 * 1000)) btnHtml = `<button id="join-tour-btn-modal" disabled class="btn-primary" style="width:100%; padding:14px; border-radius:12px; background:#9CA3AF; border:none; font-weight:bold; cursor:not-allowed;">⏳ Bekleniyor...</button>`;
            }

            html += `</div>${btnHtml}`;
            document.getElementById('modal-body').innerHTML = html;
        } catch(e) {
            document.getElementById('modal-body').innerHTML = '<p style="color:red; text-align:center;">Sıralama yüklenirken hata oluştu.</p>';
        }
    };

    window.startPopularityTournament = async function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;
        
        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:50px; animation: glowPulse 1.5s infinite alternate;" class="white-flame-icon">🔥</div>
                <h3 style="color:var(--text-dark); margin-bottom:10px;">Adaylar Toplanıyor...</h3>
                <p style="color:var(--text-gray); font-size:13px;">Tarafını seçmeye hazırlan!</p>
            </div>
        `;
        
        try {
            const qSnap = await getDocs(query(collection(db, "users"), limit(100)));
            let allUsers = [];
            qSnap.forEach(doc => { 
                const d = doc.data();
                if(d.uid !== window.userProfile.uid) allUsers.push(d); 
            });
            
            allUsers = allUsers.sort(() => 0.5 - Math.random()).slice(0, 32);
            
            while(allUsers.length < 32) {
                allUsers.push({ 
                    uid: "bot_" + Math.random().toString(36).substr(2, 9), 
                    name: "Sistem Botu 🤖", 
                    age: "?",
                    faculty: "UniLoop",
                    avatar: "🤖",
                    isClone: true 
                });
            }
            
            window.tData = { bracket: allUsers, winners: [], currentMatch: 0, stage: 'groups', semiLosers: [], finalists: [], finalWinner: null, secondPlace: null, thirdPlace: null };
            window.renderTournamentRound();
        } catch(e) {
            console.error(e);
            container.innerHTML = '<p style="color:red; text-align:center;">Turnuva başlatılamadı.</p>';
        }
    };

    window.tourSelect = function(index) {
        const selectedUser = window.tData.bracket[index];
        window.tData.winners.push(selectedUser);

        if(window.tData.stage === 'semis') {
            const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
            window.tData.semiLosers.push(window.tData.bracket[loserIndex]);
        }
        
        if (window.tData.stage === 'thirdPlace') {
            window.tData.thirdPlace = selectedUser;
        }

        if (window.tData.stage === 'final') {
            window.tData.finalWinner = selectedUser;
            const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
            window.tData.secondPlace = window.tData.bracket[loserIndex];
        }

        window.tData.currentMatch++;
        window.renderTournamentRound();
    };

    window.renderTournamentRound = function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;
        const t = window.tData;

        let totalMatchesInStage = 0;
        if(t.stage === 'groups') totalMatchesInStage = 8;
        if(t.stage === 'quarters') totalMatchesInStage = 4;
        if(t.stage === 'semis') totalMatchesInStage = 2;
        if(t.stage === 'thirdPlace') totalMatchesInStage = 1;
        if(t.stage === 'final') totalMatchesInStage = 1;

        if (t.currentMatch >= totalMatchesInStage) {
            if (t.stage === 'groups') { t.stage = 'quarters'; t.bracket = [...t.winners]; }
            else if (t.stage === 'quarters') { t.stage = 'semis'; t.bracket = [...t.winners]; }
            else if (t.stage === 'semis') { 
                t.stage = 'thirdPlace'; 
                t.finalists = [...t.winners];
                t.bracket = [...t.semiLosers]; 
            }
            else if (t.stage === 'thirdPlace') { 
                t.stage = 'final'; 
                t.bracket = [...t.finalists]; 
            } 
            else if (t.stage === 'final') { window.finishTournament(); return; }
            
            t.winners = [];
            t.currentMatch = 0;
            window.renderTournamentRound();
            return;
        }

        let stageTitle = '';
        if(t.stage === 'groups') stageTitle = `🔥 Grup Aşaması (${t.currentMatch+1}/8)`;
        if(t.stage === 'quarters') stageTitle = `⚡ Çeyrek Final (${t.currentMatch+1}/4)`;
        if(t.stage === 'semis') stageTitle = `⚔️ Yarı Final (${t.currentMatch+1}/2)`;
        if(t.stage === 'thirdPlace') stageTitle = `🥉 3. lük Maçı`;
        if(t.stage === 'final') stageTitle = `🏆 BÜYÜK FİNAL`;

        if (t.stage === 'groups') {
            const baseIdx = t.currentMatch * 4;
            const users = [t.bracket[baseIdx], t.bracket[baseIdx+1], t.bracket[baseIdx+2], t.bracket[baseIdx+3]];
            container.innerHTML = `
                <div style="text-align:center; margin-bottom:10px; width:100%;">
                    <h3 style="margin:0; color:#111827; font-size:18px;">${stageTitle}</h3>
                    <p style="font-size:12px; color:var(--text-gray); margin:5px 0 0 0;">En favori profilini seç!</p>
                </div>
                <div class="tour-grid-4">
                    ${users.map((u, i) => `
                        <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+i}), 150);">
                            ${u.avatarUrl ? `<img src="${u.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:40px;">${u.avatar||'👤'}</div>`}
                            <div class="tour-card-name" style="padding-top:40px;">
                                <span style="font-size:10px; color:#D1D5DB; display:block; margin-bottom:2px; font-weight:normal;">${u.age ? u.age : '?'} Yaş • ${u.faculty ? u.faculty : 'Belirtilmemiş'}</span>
                                ${u.name}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            const baseIdx = t.currentMatch * 2;
            const u1 = t.bracket[baseIdx];
            const u2 = t.bracket[baseIdx+1];
            container.innerHTML = `
                <div style="text-align:center; margin-bottom:10px; width:100%;">
                    <h3 style="margin:0; color:#111827; font-size:20px;">${stageTitle}</h3>
                    <p style="font-size:12px; color:var(--text-gray); margin:5px 0 0 0;">Kazanması gerekeni seç!</p>
                </div>
                <div class="tour-grid-2">
                    <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx}), 150);" style="aspect-ratio: 0.8;">
                        ${u1.avatarUrl ? `<img src="${u1.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u1.avatar||'👤'}</div>`}
                        <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                            <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u1.age ? u1.age : '?'} Yaş • ${u1.faculty ? u1.faculty : 'Belirtilmemiş'}</span>
                            ${u1.name}
                        </div>
                    </div>
                    <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+1}), 150);" style="aspect-ratio: 0.8;">
                        ${u2.avatarUrl ? `<img src="${u2.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u2.avatar||'👤'}</div>`}
                        <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                            <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u2.age ? u2.age : '?'} Yaş • ${u2.faculty ? u2.faculty : 'Belirtilmemiş'}</span>
                            ${u2.name}
                        </div>
                    </div>
                </div>
            `;
        }
    };

    window.finishTournament = async function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;
        const t = window.tData;

        container.innerHTML = `<div style="text-align:center; padding:30px;"><div style="font-size:40px; animation: glowPulse 1s infinite alternate;">⏳</div><h3 style="color:var(--text-dark);">Sonuçlar Kaydediliyor...</h3></div>`;

        try {
            const nowTs = Date.now();
            await updateDoc(doc(db, "users", window.userProfile.uid), { lastTournamentDate: nowTs });
            window.userProfile.lastTournamentDate = nowTs;

            if(t.finalWinner && !t.finalWinner.isClone) {
                const uDoc = await getDoc(doc(db, "users", t.finalWinner.uid));
                if(uDoc.exists()) await updateDoc(doc(db, "users", t.finalWinner.uid), { popularity: (uDoc.data().popularity || 0) + 3 });
            }
            if(t.secondPlace && !t.secondPlace.isClone) {
                const uDoc = await getDoc(doc(db, "users", t.secondPlace.uid));
                if(uDoc.exists()) await updateDoc(doc(db, "users", t.secondPlace.uid), { popularity: (uDoc.data().popularity || 0) + 2 });
            }
            if(t.thirdPlace && !t.thirdPlace.isClone) {
                const uDoc = await getDoc(doc(db, "users", t.thirdPlace.uid));
                if(uDoc.exists()) await updateDoc(doc(db, "users", t.thirdPlace.uid), { popularity: (uDoc.data().popularity || 0) + 1 });
            }

            container.innerHTML = `
                <div style="position:relative; text-align:center; padding:20px; background:white; border-radius:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05); width:100%; max-width:350px;">
                    <button onclick="window.loadPage('home')" style="position:absolute; top:10px; right:10px; background:transparent; border:none; font-size:24px; color:#9CA3AF; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">✖</button>
                    <div style="font-size:50px; margin-bottom:10px; margin-top:10px;">🎉</div>
                    <h3 style="color:#111827; margin-bottom:20px;">Savaş Sona Erdi!</h3>
                    
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; text-align:left;">
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥇</span> 
                            <span style="font-weight:800; flex:1; color:#111827;">${t.finalWinner.name}</span> 
                            <span style="font-weight:bold; color:var(--text-gray);">${t.finalWinner.isClone ? 'BOT' : '+3 🔥'}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥈</span> 
                            <span style="font-weight:800; flex:1; color:#111827;">${t.secondPlace.name}</span> 
                            <span style="font-weight:bold; color:var(--text-gray);">${t.secondPlace.isClone ? 'BOT' : '+2 🔥'}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥉</span> 
                            <span style="font-weight:800; flex:1; color:#111827;">${t.thirdPlace.name}</span> 
                            <span style="font-weight:bold; color:var(--text-gray);">${t.thirdPlace.isClone ? 'BOT' : '+1 🔥'}</span>
                        </div>
                    </div>
                    
                    <button class="btn-primary" style="width:100%; justify-content:center; padding:12px; border-radius:12px; font-weight:800;" onclick="window.showLeaderboard()">Liderlik Tablosunu Gör</button>
                </div>
            `;
        } catch(e) {
            console.error(e);
            container.innerHTML = '<p style="color:red;">Sonuçlar kaydedilirken hata oluştu.</p>';
        }
    };

    window.initEmbeddedFastMatch = async function() {
        let count = window.userProfile.fastMatchCount || 0;
        let today = new Date().toLocaleDateString();
        
        if (window.userProfile.fastMatchDate !== today) {
            count = 0;
            window.userProfile.fastMatchCount = 0;
            window.userProfile.fastMatchDate = today;
            await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: 0, fastMatchDate: today });
        }

        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;
        
        // HAK BİTTİĞİNDE GÖSTERİLECEK YENİ İKİLİ ŞABLON EKRANI (DARK MODE)
        if (count >= maxSwipes) {
            const isPremium = window.userProfile.isPremium;
            
            let canJoinTournament = true;
            let tCooldownStr = "";
            let remainingSecs = 0;

            if (window.userProfile && window.userProfile.lastTournamentDate) {
                let timeDiff = Date.now() - window.userProfile.lastTournamentDate;
                let cooldown = 24 * 60 * 60 * 1000;
                if (timeDiff < cooldown) {
                    canJoinTournament = false;
                    let remaining = cooldown - timeDiff;
                    remainingSecs = Math.floor(remaining / 1000);
                    let h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                    let m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                    let s = Math.floor((remaining % (1000 * 60)) / 1000).toString().padStart(2, '0');
                    tCooldownStr = `⏳ ${h}:${m}:${s}`;
                }
            }

            let top3 = [];
            try {
                const q = query(collection(db, "users"), orderBy("popularity", "desc"), limit(3));
                const snap = await getDocs(q);
                snap.forEach(doc => top3.push(doc.data()));
            } catch(e) { console.error("Kürsü yüklenemedi", e); }

            let podiumHtml = `
                <div style="margin-top:20px; width:100%; display:flex; justify-content:center; align-items:flex-end; gap:10px; height:150px; padding:0 15px; box-sizing:border-box;">
                    ${top3[1] ? `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[1].uid}')">
                        <img src="${top3[1].avatarUrl || ''}" style="width:45px; height:45px; border-radius:50%; border:3px solid #C0C0C0; object-fit:cover; background:#1F2937; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[1].name}</span>
                        <div style="width:100%; background:linear-gradient(to top, #e2e8f0, #f8fafc); height:50px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#64748b; border:1px solid #cbd5e1; border-bottom:none; box-shadow:0 -2px 10px rgba(0,0,0,0.05);">2.</div>
                    </div>
                    ` : '<div style="flex:1;"></div>'}
                    ${top3[0] ? `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[0].uid}')">
                        <img src="${top3[0].avatarUrl || ''}" style="width:55px; height:55px; border-radius:50%; border:3px solid #FBBF24; object-fit:cover; background:#1F2937; z-index:5; margin-bottom:5px;">
                        <span style="font-size:12px; font-weight:900; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[0].name}</span>
                        <div style="width:100%; background:linear-gradient(to top, #fef3c7, #fffbeb); height:80px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#b45309; border:1px solid #fde68a; border-bottom:none; box-shadow:0 -4px 15px rgba(251,191,36,0.3);">1.</div>
                    </div>
                    ` : '<div style="flex:1;"></div>'}
                    ${top3[2] ? `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[2].uid}')">
                        <img src="${top3[2].avatarUrl || ''}" style="width:45px; height:45px; border-radius:50%; border:3px solid #CD7F32; object-fit:cover; background:#1F2937; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[2].name}</span>
                        <div style="width:100%; background:linear-gradient(to top, #ffedd5, #fffbeb); height:40px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#b45309; border:1px solid #fde047; border-bottom:none; box-shadow:0 -2px 10px rgba(0,0,0,0.05);">3.</div>
                    </div>
                    ` : '<div style="flex:1;"></div>'}
                </div>
            `;

            container.innerHTML = `
                <div style="width:100%; max-width:380px; display:flex; flex-direction:row; gap:12px; padding:10px;">
                    
                    <div style="flex:1; background:#1F2937; border-radius:16px; padding:15px 10px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.15); aspect-ratio:1/1.15; border:1px solid #374151;">
                        <div style="font-size:24px; margin-bottom:5px;">⚡</div>
                        <h4 style="margin:0 0 5px 0; color:white; font-size:13px; text-align:center;">Hızlı Eşleşme</h4>
                        
                        ${isPremium ? `
                            <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 10px 0; line-height:1.4;">Bugünlük hakkın doldu, yarın bir daha gel!</p>
                            <div style="background:#374151; padding:8px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" id="fast-match-timer">⏳ Bekleniyor...</div>
                        ` : `
                            <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 5px 0; line-height:1.4;">Bugünlük hakkın doldu.</p>
                            <button onclick="window.openPremiumModal()" style="background:white; color:#111827; border:1px solid #D1D5DB; border-radius:8px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:8px; transition:0.2s;">Premium Ol ✨</button>
                            <div style="background:#374151; padding:6px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" id="fast-match-timer">⏳ Bekleniyor...</div>
                        `}
                    </div>

                    <div style="flex:1; background:#1F2937; border-radius:16px; padding:15px 10px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.15); aspect-ratio:1/1.15; border:1px solid #374151;">
                        <div style="font-size:24px; margin-bottom:5px;" class="white-flame-icon">🔥</div>
                        <h4 style="margin:0 0 5px 0; color:white; font-size:13px; text-align:center;">Popülerlik Savaşı</h4>
                        <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 10px 0; line-height:1.4;">Kampüsün en popülerlerini seç veya seçil!</p>
                        
                        ${canJoinTournament ? `
                            <button onclick="window.startPopularityTournament()" style="background:white; color:#111827; border:none; border-radius:8px; padding:8px; font-size:12px; font-weight:bold; cursor:pointer; width:100%; transition:0.2s;">Savaşa Katıl ⚔️</button>
                        ` : `
                            <div style="background:#374151; padding:8px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" data-remaining="${remainingSecs}" id="pop-battle-timer">${tCooldownStr}</div>
                        `}
                    </div>
                </div>
                
                <div style="flex:1; width:100%; min-height:50px; display:flex; flex-direction:column; justify-content:flex-end;">
                    ${top3.length > 0 ? podiumHtml : '<p style="text-align:center; color:#9CA3AF; font-size:12px;">Henüz kürsüye çıkan kimse yok!</p>'}
                </div>
            `;

            if (window.fastMatchTimerInterval) clearInterval(window.fastMatchTimerInterval);
            window.fastMatchTimerInterval = setInterval(() => {
                const timerEl = document.getElementById('fast-match-timer');
                if(timerEl) {
                    const now = new Date();
                    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    const diff = tomorrow - now;
                    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                    const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                    timerEl.innerText = `⏳ ${h}:${m}:${s}`;
                }
                
                const popTimerEl = document.getElementById('pop-battle-timer');
                if(popTimerEl) {
                    let rem = parseInt(popTimerEl.getAttribute('data-remaining'));
                    if (rem > 0) {
                        rem -= 1;
                        popTimerEl.setAttribute('data-remaining', rem);
                        let h = Math.floor(rem / 3600).toString().padStart(2, '0');
                        let m = Math.floor((rem % 3600) / 60).toString().padStart(2, '0');
                        let s = (rem % 60).toString().padStart(2, '0');
                        popTimerEl.innerText = `⏳ ${h}:${m}:${s}`;
                    } else {
                        popTimerEl.outerHTML = `<button onclick="window.startPopularityTournament()" style="background:white; color:#111827; border:none; border-radius:8px; padding:8px; font-size:12px; font-weight:bold; cursor:pointer; width:100%; transition:0.2s; animation: fadeIn 0.3s ease;">Savaşa Katıl ⚔️</button>`;
                    }
                }
            }, 1000);

            return; 
        }

        container.innerHTML = `
            <div style="text-align:center; padding:10px; display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:40px; animation: glowPulse 1.5s infinite alternate; margin-bottom:15px;">🔍</div>
                <h3 style="color:var(--text-gray);">Kampüste birileri aranıyor...</h3>
            </div>
        `;

        try {
            const querySnapshot = await getDocs(query(collection(db, "users"), limit(50)));
            const interactedUids = chatsDB
                .filter(c => c.status === 'accepted' || c.status === 'blocked')
                .map(c => c.otherUid);
                
            fastMatchUsers = [];

            querySnapshot.forEach((doc) => {
                const u = doc.data();
                if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid)) {
                    fastMatchUsers.push(u);
                }
            });

            if(fastMatchUsers.length === 0) {
                 container.innerHTML = `
                    <div style="padding:40px 10px; text-align:center; background:white; border-radius:16px; width:100%; max-width:320px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <div style="font-size:50px; margin-bottom:15px;">🌟</div>
                        <h3 style="color:var(--text-dark); margin-bottom:10px;">Şu an kimse yok!</h3>
                        <p style="color:var(--text-gray); font-size:13px; margin-bottom:15px;">Ağda karşılaşacak kimse kalmadı. Lütfen daha sonra tekrar kontrol et.</p>
                        <button id="join-tour-btn-empty" class="btn-primary" style="width:100%; justify-content:center; padding:12px; background:#111827; border:none; border-radius:12px;" onclick="window.startPopularityTournament()">Savaşa Katıl ⚔️</button>
                    </div>
                `;
                return;
            }

            fastMatchUsers = fastMatchUsers.sort(() => 0.5 - Math.random());
            fastMatchCurrentIndex = 0;
            
            window.renderEmbeddedFastMatchCard();
        } catch(e) {
            console.error(e);
            container.innerHTML = '<p style="color:red;">Kullanıcılar yüklenirken hata oluştu.</p>';
        }
    };

    window.renderEmbeddedFastMatchCard = function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;

        if(fastMatchCurrentIndex >= fastMatchUsers.length) {
            fastMatchUsers = fastMatchUsers.sort(() => 0.5 - Math.random());
            fastMatchCurrentIndex = 0;
        }

        const u = fastMatchUsers[fastMatchCurrentIndex];
        const initial = u.surname ? u.surname.charAt(0) + '.' : '';
        const premiumIcon = u.isPremium ? '<span style="font-size:18px; margin-left:6px; text-shadow:0 1px 2px rgba(0,0,0,0.5);" title="Premium Üye">👑</span>' : '';
        
        let avatarHtml = u.avatarUrl 
            ? `<img src="${u.avatarUrl}" style="width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;">` 
            : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); display:flex; align-items:center; justify-content:center; font-size:80px; pointer-events:none;">${u.avatar || '👤'}</div>`;

        let tagsHtml = '';
        if(u.interests && Array.isArray(u.interests)) {
            tagsHtml = u.interests.slice(0, 3).map(tag => `<span style="font-size:11px; background:rgba(255,255,255,0.25); color:white; padding:4px 10px; border-radius:12px; font-weight:700; margin-right:4px; margin-bottom:4px; backdrop-filter:blur(5px); display:inline-block; border:1px solid rgba(255,255,255,0.3);">${tag}</span>`).join('');
        }

        let remaining = maxSwipes - window.userProfile.fastMatchCount;
        
        let headerText = window.userProfile.isPremium ? 
            `<span style="color:#111827; font-size:12px; font-weight:bold; background:white; padding:4px 12px; border-radius:12px; margin-bottom:10px; display:inline-block; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.05);">Kalan Hakkın: ${remaining} / 30 (Premium)</span>` : 
            `<span style="color:#EF4444; font-size:12px; font-weight:bold; background:#FEF2F2; padding:4px 12px; border-radius:12px; margin-bottom:10px; display:inline-block; border:1px solid #FCA5A5;">Kalan Hakkın: ${remaining} / 10</span>`;

        container.innerHTML = `
            ${headerText}
            <div id="swipe-card" class="swipe-card">
                <div class="swipe-card-img-wrapper">
                    ${avatarHtml}
                </div>
                
                <div style="position:absolute; bottom:0; left:0; right:0; padding:40px 15px 45px 15px; background:linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%); z-index:2; text-align:left; border-bottom-left-radius:20px; border-bottom-right-radius:20px; pointer-events:none;">
                    <h2 style="margin:0 0 6px 0; color:white; font-size:22px; display:flex; align-items:center; text-shadow:0 2px 4px rgba(0,0,0,0.6);">${u.name} ${initial} ${u.age ? `<span style="font-weight:normal; margin-left:8px; font-size:18px; opacity:0.9;">${u.age}</span>` : ''} ${premiumIcon}</h2>
                    <div style="font-size:13px; color:#e2e8f0; font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:4px; text-shadow:0 1px 2px rgba(0,0,0,0.5);"><span style="font-size:15px;">🏛️</span> ${u.faculty || 'Kampüs Öğrencisi'}</div>
                    <div style="display:flex; flex-wrap:wrap; margin-bottom:0;">${tagsHtml}</div>
                </div>
                
                <div style="position:absolute; bottom:-28px; left:0; right:0; display:flex; justify-content:center; gap:25px; z-index:10;">
                    <button onclick="window.handleSwipe('left')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#EF4444; font-size:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(239,68,68,0.3); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 25px rgba(239,68,68,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 20px rgba(239,68,68,0.3)';">✖</button>
                    <button onclick="window.handleSwipe('right')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#10B981; font-size:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(16,185,129,0.3); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 25px rgba(16,185,129,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 20px rgba(16,185,129,0.3)';">❤</button>
                </div>
            </div>
            <div style="height:35px;"></div>
        `;
    };

    window.handleSwipe = async function(direction) {
        const card = document.getElementById('swipe-card');
        if(!card) return;

        window.userProfile.fastMatchCount += 1;
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: window.userProfile.fastMatchCount });
        } catch(e) {}

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;

        if(direction === 'left') {
            card.style.transform = 'translateX(-200px) rotate(-20deg)';
            card.style.opacity = '0';
            setTimeout(() => {
                fastMatchCurrentIndex++;
                if (window.userProfile.fastMatchCount >= maxSwipes) {
                    window.initEmbeddedFastMatch(); 
                } else {
                    window.renderEmbeddedFastMatchCard();
                }
            }, 300);
        } else if (direction === 'right') {
            card.style.transform = 'translateX(200px) rotate(20deg)';
            card.style.opacity = '0';
            
            const u = fastMatchUsers[fastMatchCurrentIndex];
            window.sendFriendRequest(u.uid, `${u.name} ${u.surname ? u.surname : ''}`, true);
            
            setTimeout(() => {
                fastMatchCurrentIndex++;
                if (window.userProfile.fastMatchCount >= maxSwipes) {
                    window.initEmbeddedFastMatch(); 
                } else {
                    window.renderEmbeddedFastMatchCard();
                }
            }, 300);
        }
    };

    window.toggleHomeSearch = function() {
        const searchContainer = document.getElementById('home-search-container');
        const defaultView = document.getElementById('home-default-view');
        if(searchContainer.classList.contains('hidden')) {
            searchContainer.classList.remove('hidden');
            if(defaultView) defaultView.style.opacity = '0'; 
        } else {
            searchContainer.classList.add('hidden');
            if(defaultView) defaultView.style.opacity = '1';
        }
    };

    window.searchAndAddFriendHome = async function() {
        const input = document.getElementById('home-friend-search-input');
        if(input) {
            const val = input.value;
            const fakeInput = document.createElement('input');
            fakeInput.id = 'friend-search-input';
            fakeInput.value = val;
            document.body.appendChild(fakeInput);
            
            await window.searchAndAddFriend();
            
            fakeInput.remove();
            input.value = '';
            window.toggleHomeSearch();
        }
    };

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

            const q = query(collection(db, "users"), where("username", "==", searchVal));
            const snapshot = await getDocs(q);
            
            if(snapshot.empty) {
                alert("Bu kullanıcı adına sahip kimse bulunamadı!");
            } else {
                const targetUser = snapshot.docs[0].data();
                
                const premiumIcon = targetUser.isPremium ? '<span style="font-size:18px; margin-left:5px;" title="Premium Üye">👑</span>' : '';
                window.openModal('🔍 Kullanıcı Bulundu', `
                    <div style="text-align:center; padding:10px;">
                        <div style="width:80px; height:80px; border-radius:50%; margin:0 auto 10px auto; overflow:hidden; border:2px solid ${targetUser.isPremium ? '#111827' : '#E5E7EB'}; display:flex; align-items:center; justify-content:center; background:#F3F4F6; font-size:32px;">
                            ${targetUser.avatarUrl ? `<img src="${targetUser.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (targetUser.avatar || '👤')}
                        </div>
                        <h3 style="margin-bottom:5px; color:var(--text-dark); display:flex; align-items:center; justify-content:center;">${targetUser.name} ${targetUser.surname.charAt(0)}. ${premiumIcon}</h3>
                        <p style="font-size:13px; color:var(--text-gray); margin-bottom:20px;">${targetUser.faculty || 'Kampüs Öğrencisi'}</p>
                        <button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;" onclick="window.sendFriendRequest('${targetUser.uid}', '${targetUser.name} ${targetUser.surname}'); window.closeModal();">➕ Arkadaş Olarak Ekle</button>
                    </div>
                `);
            }
            searchInput.value = ''; 
        } catch (error) {
            console.error(error);
            alert("Arama sırasında hata oluştu: " + error.message);
        }
    };

    window.sendFriendRequest = async function(targetUserId, targetUserName, isFastMatch = false) {
        try {
            const myUid = window.userProfile.uid;
            const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
            const snap = await getDocs(q);
            
            let existingChat = null;
            snap.forEach(doc => {
                if (doc.data().participants && doc.data().participants.includes(targetUserId) && !doc.data().isMarketChat) {
                    existingChat = { id: doc.id, ...doc.data() };
                }
            });

            if(!existingChat) {
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
                if(!isFastMatch) alert("✅ Arkadaşlık isteği başarıyla gönderildi! Karşı taraf onayladığında arkadaş listenizde görünecektir.");
            } else {
                if(!isFastMatch) {
                    if(existingChat.status === 'pending') {
                        alert("Bu kişiye zaten bir arkadaşlık isteği gönderilmiş veya ondan size istek gelmiş.");
                    } else {
                        alert("Bu kişiyle zaten arkadaşsınız.");
                    }
                }
            }
        } catch (error) {
            if(!isFastMatch) alert("İstek gönderilirken hata oluştu: " + error.message);
        }
    };

    window.viewUserProfile = async function(targetUid) {
        if (!targetUid) {
            alert("Kullanıcı verisi eksik!");
            return;
        }

        if(targetUid === window.userProfile.uid) { 
            window.loadPage('profile'); 
            return; 
        }

        const isFriend = chatsDB.some(c => c.otherUid === targetUid && c.status === 'accepted' && !c.isMarketChat);

        if (!window.userProfile.isPremium && !isFriend) {
            window.openModal('🔒 Detaylı Profil Kilitli', `
                <div style="text-align:center; padding:20px;">
                    <div style="font-size:50px; margin-bottom:15px; filter: blur(2px);">👀</div>
                    <h3 style="color:var(--text-dark); margin-bottom:10px;">Gizli Profil!</h3>
                    <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px; line-height:1.5;">Detaylı profile bakabilmek için Premium üye ol. Tüm blurları kaldır ve kampüstekileri yakından tanı!</p>
                    <button style="width:100%; justify-content:center; padding: 16px; font-size: 16px; background:white; color:#111827; border:1px solid #111827; border-radius:12px; cursor:pointer; font-weight:bold;" onclick="window.openPremiumModal()">☆ Premium'a Yükselt</button>
                </div>
            `);
            return;
        }
        
        try {
            const docSnap = await getDoc(doc(db, "users", targetUid));
            if (docSnap.exists()) {
                const u = docSnap.data();
                
                try {
                    const viewRecord = {
                        uid: window.userProfile.uid,
                        name: window.userProfile.name,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + new Date().toLocaleDateString()
                    };
                    await updateDoc(doc(db, "users", targetUid), {
                        profileViewers: arrayUnion(viewRecord)
                    });

                    if (u.isPremium) {
                        window.sendSystemNotification(targetUid, `👀 <strong>${window.userProfile.name}</strong> profilini inceledi! (Premium Özelliği)`);
                    }
                } catch(err) {
                    console.warn("Görüntülenme kaydedilemedi, ancak profil açılıyor.");
                }

                const initial = u.surname ? u.surname.charAt(0) + '.' : '';
                const isPremium = u.isPremium;

                let avatarHtml = u.avatarUrl 
                    ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'};">` 
                    : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'}; margin:0 auto;">${u.avatar || '👤'}</div>`;
                
                const ageText = u.age ? u.age + " yaşında" : "Yaş belirtilmemiş";
                const facText = u.faculty ? u.faculty : "Fakülte belirtilmemiş";
                const gradeText = u.grade ? u.grade + ". Sınıf" : "";
                const premiumBadge = isPremium ? `<div style="margin-top:8px; display:inline-block; background:#111827; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.1);">☆ Premium Üye</div>` : '';

                const existingChat = chatsDB.find(c => c.otherUid === u.uid && !c.isMarketChat);
                let actionBtnHtml = '';
                
                if (existingChat && existingChat.status === 'accepted') {
                    actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
                } else if (existingChat && existingChat.status === 'pending') {
                    actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF; box-shadow:none;">⏳ İstek Bekleniyor</button>`;
                } else {
                    actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Arkadaş Olarak Ekle</button>`;
                }

                window.openModal('Kullanıcı Profili', `
                    <div style="text-align:center;">
                        ${avatarHtml}
                        <h3 style="margin: 10px 0 5px 0; font-size:18px; color:var(--text-dark); display:flex; align-items:center; justify-content:center; gap:5px;">
                            ${u.name} ${initial} ${isPremium ? '<span style="font-size:18px;">👑</span>' : ''}
                        </h3>
                        <p style="color:#111827; font-size:14px; margin-bottom: 5px; font-weight:bold;">${facText} ${gradeText ? ' - ' + gradeText : ''}</p>
                        <p style="color:var(--text-gray); font-size:13px; margin-bottom: 5px;">${ageText}</p>
                        ${premiumBadge}
                        <div style="margin-top:20px;">${actionBtnHtml}</div>
                    </div>
                `);
            }
        } catch (e) {
            console.error(e);
            alert("Profil yüklenirken hata oluştu.");
        }
    };

    window.openProfileEditModal = function() {
        const u = window.userProfile;
        const uNameStr = u.username ? u.username.replace('#', '') : '';
        
        let facOptions = allFaculties.map(f => `<option value="${f}" ${u.faculty === f ? 'selected' : ''}>${f}</option>`).join('');
        
        window.openModal('✏️ Profilini Düzenle', `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kullanıcı Adı</label>
                    <div style="display:flex; align-items:center; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:0 10px;">
                        <span style="color:var(--primary); font-weight:bold; font-size:14px;">#</span>
                        <input type="text" id="edit-username" value="${uNameStr}" style="border:none; background:transparent; width:100%; padding:12px 5px; outline:none; font-size:14px;">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Yaş</label>
                    <input type="number" id="edit-age" value="${u.age || ''}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Fakülte</label>
                    <select id="edit-faculty" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
                        <option value="">Fakülte Seçiniz</option>
                        ${facOptions}
                    </select>
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kaçıncı Sınıf</label>
                    <select id="edit-grade" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
                        <option value="1" ${u.grade == '1' ? 'selected' : ''}>1. Sınıf</option>
                        <option value="2" ${u.grade == '2' ? 'selected' : ''}>2. Sınıf</option>
                        <option value="3" ${u.grade == '3' ? 'selected' : ''}>3. Sınıf</option>
                        <option value="4" ${u.grade == '4' ? 'selected' : ''}>4. Sınıf</option>
                        <option value="5" ${u.grade == '5' ? 'selected' : ''}>5. Sınıf</option>
                        <option value="6" ${u.grade == '6' ? 'selected' : ''}>6. Sınıf</option>
                    </select>
                </div>
                <button class="btn-primary" style="width:100%; padding:14px; border-radius:10px; font-size:15px; font-weight:bold; margin-top:10px;" onclick="window.saveProfileEdits()">Değişiklikleri Kaydet</button>
            </div>
        `);
    };

    window.saveProfileEdits = async function() {
        const usernameInput = document.getElementById('edit-username').value.trim().toLowerCase().replace(/\s+/g, '');
        const newAge = document.getElementById('edit-age').value.trim();
        const newFaculty = document.getElementById('edit-faculty').value;
        const newGrade = document.getElementById('edit-grade').value;

        if(!usernameInput || !newAge || !newFaculty) return alert("Lütfen tüm alanları eksiksiz doldurun.");

        const finalUsername = '#' + usernameInput;
        
        try {
            if (finalUsername !== window.userProfile.username) {
                const qU = query(collection(db, "users"), where("username", "==", finalUsername));
                const snap = await getDocs(qU);
                if(!snap.empty) {
                    alert("Bu kullanıcı adı alınmış. Lütfen başka bir tane seçin.");
                    return;
                }
            }

            await updateDoc(doc(db, "users", window.userProfile.uid), {
                username: finalUsername,
                age: newAge,
                faculty: newFaculty,
                grade: newGrade
            });

            window.userProfile.username = finalUsername;
            window.userProfile.age = newAge;
            window.userProfile.faculty = newFaculty;
            window.userProfile.grade = newGrade;

            alert("Profil bilgileriniz başarıyla güncellendi!");
            window.closeModal();
            window.renderProfile();

        } catch(e) {
            console.error(e);
            alert("Güncellenirken hata oluştu.");
        }
    };

    window.renderHome = async function() {
        document.body.classList.add('no-scroll-home');

        let usernameWarning = '';
        if (!window.userProfile.username) {
            usernameWarning = `
                <div style="background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 12px; border: 1px solid #FCA5A5; margin-bottom: 6px; font-weight: bold; text-align: center; cursor:pointer; flex-shrink:0;" onclick="window.loadPage('profile')">
                    ⚠️ Lütfen profilinden bir kullanıcı adı belirle!
                </div>
            `;
        }

        // İKONLAR ARTIK SLIDER'IN İLK SAYFASINDA, BÖYLECE KAYDIRINCA GİDİYOR
        const slides = [
            `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; position:relative;">
                <div id="home-default-view" style="display:flex; justify-content:space-between; align-items:center; width:100%; transition: opacity 0.2s;">
                    <div>
                        <h2 style="font-size:18px; margin-bottom:4px; margin-top:0;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
                        <p style="opacity:0.9; font-size:12px; margin:0;"><strong style="color:#D9FDD3;">${window.userProfile.university}</strong></p>
                    </div>
                    <div id="home-icons-container" style="display:flex; gap:15px; align-items:center;">
                        <div class="white-flame-icon" onclick="window.showLeaderboard()" title="Popülerlik Savaşı Sıralaması">🔥</div>
                        <div style="font-size:24px; cursor:pointer;" onclick="window.openVoiceChat()" title="Kampüs Frekansı">🎙️</div>
                        <div style="font-size:24px; cursor:pointer;" onclick="window.toggleHomeSearch()" title="Arkadaşını Bul">🔍</div>
                    </div>
                </div>
                <div id="home-search-container" class="hidden" style="position:absolute; left:0; top:50%; transform:translateY(-50%); z-index:20; display:flex; align-items:center; background:white; border-radius:20px; padding:5px 12px; width:100%; box-sizing:border-box; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        <span style="color:var(--primary); font-weight:800; font-size:14px; margin-right:5px;">#</span>
                        <input type="text" id="home-friend-search-input" style="border:none; background:transparent; width:100%; outline:none; font-size:13px; color:black;" placeholder="Kullanıcı adı..." onkeypress="if(event.key==='Enter') window.searchAndAddFriendHome()">
                        <button onclick="window.searchAndAddFriendHome()" style="background:transparent; border:none; font-size:16px; cursor:pointer;">➡️</button>
                        <button onclick="window.toggleHomeSearch()" style="background:transparent; border:none; font-size:16px; cursor:pointer; color:#EF4444; margin-left:5px;">✖</button>
                </div>
            </div>
            `,
            `
            <div>
                <h2 style="font-size:18px; margin-bottom:4px; margin-top:0; color:#FBBF24;">📢 Kampüs Duyurusu</h2>
                <p style="opacity:0.9; font-size:12px; margin:0; line-height:1.4;">25 Nisan'da Manifest Konseri var! Biletlerini Kampüs Meydanı'ndan alabilirsin.</p>
            </div>
            `,
            `
            <div>
                <h2 style="font-size:18px; margin-bottom:4px; margin-top:0; color:#FBBF24;">🌟 Premium Ayrıcalıkları</h2>
                <p style="opacity:0.9; font-size:12px; margin:0; line-height:1.4;">Profiline kim baktı öğrenmek için hemen Premium'a geçiş yap.</p>
            </div>
            `
        ];

        let html = `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
                ${usernameWarning}
                
                <div style="position:relative; margin: 10px; border-radius:16px; flex-shrink:0; box-shadow:0 6px 15px rgba(0,0,0,0.1); background:#1F2937;">
                    <div id="home-slider-container" class="home-slider" style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory; width:100%; scroll-behavior:smooth;">
                        ${slides.map(slide => `
                            <div style="flex: 0 0 100%; scroll-snap-align: center; padding: 15px; box-sizing:border-box; display:flex; justify-content:flex-start; align-items:center; color:white; min-height:80px;">
                                ${slide}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="position:absolute; bottom:5px; left:0; right:0; display:flex; justify-content:center; gap:5px; pointer-events:none;">
                        ${slides.map((_, i) => `<div class="slider-dot" id="slider-dot-${i}" style="width:6px; height:6px; border-radius:50%; background:${i===0 ? 'white' : 'rgba(255,255,255,0.3)'};"></div>`).join('')}
                    </div>
                </div>

                <div id="embedded-fast-match-container" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5px 10px 10px 10px; overflow:hidden;">
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;

        const sliderContainer = document.getElementById('home-slider-container');
        if (sliderContainer) {
            let currentIndex = 0;
            const totalSlides = slides.length;
            
            sliderContainer.addEventListener('scroll', () => {
                const scrollLeft = sliderContainer.scrollLeft;
                const clientWidth = sliderContainer.clientWidth;
                currentIndex = Math.round(scrollLeft / clientWidth);
                for(let i=0; i<totalSlides; i++){
                    const dot = document.getElementById(`slider-dot-${i}`);
                    if(dot) dot.style.background = (i === currentIndex) ? 'white' : 'rgba(255,255,255,0.3)';
                }
            });

            if(window.homeSliderInterval) clearInterval(window.homeSliderInterval);
            window.homeSliderInterval = setInterval(() => {
                currentIndex++;
                if(currentIndex >= totalSlides) currentIndex = 0;
                sliderContainer.scrollTo({
                    left: currentIndex * sliderContainer.clientWidth,
                    behavior: 'smooth'
                });
            }, 15000);
        }

        window.initEmbeddedFastMatch();
    };

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
        if(!document.getElementById('app-modal').classList.contains('active') && !document.body.classList.contains('no-scroll-messages') && !document.body.classList.contains('no-scroll-home')) document.body.style.overflow = 'auto';
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

    window.sendMarketMessage = async function(sellerId, sellerName, itemTitle, listingId) {
        try {
            const myUid = window.userProfile.uid;
            const msgText = `Merhaba, "${itemTitle}" başlıklı ilanınızla ilgileniyorum. Durumu nedir?`;
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const existingChat = chatsDB.find(c => c.otherUid === sellerId && c.isMarketChat);

            if (existingChat) {
                if (existingChat.listingIds && existingChat.listingIds.includes(listingId)) {
                    alert("Bu ilan için satıcıya zaten mesaj gönderdiniz!");
                    window.openChatViewDirect(existingChat.id);
                    return;
                }

                await updateDoc(doc(db, "chats", existingChat.id), {
                    messages: arrayUnion({ senderId: myUid, text: msgText, time: timeStr, read: false }),
                    listingIds: arrayUnion(listingId),
                    lastUpdated: serverTimestamp()
                });
                alert("Yeni ilan için mesajınız satıcıyla olan sohbetinize eklendi!");
                window.loadPage('messages');
                setTimeout(() => window.openChatView(existingChat.id), 300);
            } else {
                const newChatRef = await addDoc(collection(db, "chats"), {
                    participants: [myUid, sellerId],
                    participantNames: { [myUid]: window.userProfile.name, [sellerId]: sellerName },
                    participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [sellerId]: "👤" },
                    lastUpdated: serverTimestamp(), 
                    status: 'pending', 
                    initiator: myUid,
                    isMarketChat: true,
                    listingIds: [listingId], 
                    messages: [{ senderId: myUid, text: msgText, time: timeStr, read: false }]
                });
                
                const newLocalChat = {
                    id: newChatRef.id,
                    otherUid: sellerId,
                    name: sellerName,
                    avatar: "👤",
                    messages: [{ senderId: myUid, text: msgText, time: timeStr, read: false }],
                    status: 'pending',
                    initiator: myUid,
                    isMarketChat: true,
                    listingIds: [listingId]
                };
                chatsDB.unshift(newLocalChat);
                
                alert("Satıcıya mesaj isteği başarıyla gönderildi!");
                window.loadPage('messages');
                setTimeout(() => window.openChatView(newChatRef.id), 100);
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
        
        if (item.sellerId === currentUid) {
             actionButtonsHtml = `
                <div style="display:flex; gap:10px; margin-top: 20px;">
                    <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                    <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
                </div>
             `;
        } else {
            const existingChat = chatsDB.find(c => c.otherUid === item.sellerId && c.isMarketChat);
            const hasMessagedThisListing = existingChat && existingChat.listingIds && existingChat.listingIds.includes(item.id);

            if(hasMessagedThisListing) {
                 actionButtonsHtml = `
                    <button class="btn-primary" style="margin-top: 20px; width:100%; padding:12px; font-size:15px; background:#10B981; border-color:#10B981; box-shadow:0 4px 6px rgba(16,185,129,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">
                        💬 Mevcut Sohbete Git
                    </button>
                 `;
            } else {
                 actionButtonsHtml = `
                    <button class="btn-primary" style="margin-top: 20px; width:100%; padding:12px; font-size:15px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', '${item.id}'); window.closeModal();">
                        💬 Satıcıya Mesaj Gönder
                    </button>
                 `;
            }
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

    window.previewMarketImages = function(event) {
        const files = Array.from(event.target.files).slice(0, 3);
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = ''; 
        files.forEach(file => {
            if (file.type === "application/pdf") {
                previewContainer.innerHTML += `<div class="preview-box" style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; background:#F9FAFB; border:1px solid #E5E7EB; width:80px; height:80px; border-radius:8px; margin-right:8px;"><span style="font-size:30px;">📄</span><span style="font-size:10px; color:#EF4444; font-weight:bold; margin-top:5px;">PDF</span></div>`;
            } else {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    previewContainer.innerHTML += `<div class="preview-box" style="width:80px; height:80px; overflow:hidden; border-radius:8px; border:1px solid #E5E7EB; display:inline-block; margin-right:8px;"><img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;"></div>`;
                };
                reader.readAsDataURL(file);
            }
        });
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
            
            <div class="upload-btn-wrapper" style="margin-bottom: 15px;">
                <button class="action-btn" onclick="document.getElementById('new-item-photo').click()" style="width:100%; justify-content:center; padding: 12px; font-weight:bold; background: #EEF2FF; color: var(--primary); border:none; border-radius:12px;">📷 Fotoğraf veya 📄 PDF Seç</button>
                <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;" onchange="window.previewMarketImages(event)" />
            </div>
            
            <div id="preview-container" class="preview-container" style="display:flex; flex-wrap:wrap; margin-bottom:15px; min-height:0px;"></div>
            
            <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
            <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Dosyalar Yükleniyor, lütfen bekleyin...</p>
        `);
    };

    window.submitListing = async function(type) {
        const title = document.getElementById('new-item-title').value.trim();
        const price = document.getElementById('new-item-price').value.trim();
        const currency = document.getElementById('new-item-currency').value;
        const desc = document.getElementById('new-item-desc').value.trim();
        const fileInput = document.getElementById('new-item-photo');
        const files = fileInput ? fileInput.files : [];

        if(!title || !price || !desc) return alert("Lütfen başlık, fiyat ve açıklama alanlarını eksiksiz doldurun.");

        const btn = document.getElementById('publish-listing-btn');
        const statusText = document.getElementById('upload-status');
        btn.disabled = true;
        btn.innerText = "Yükleniyor... Lütfen Bekleyin";
        if(files.length > 0) statusText.style.display = "block";

        let imgUrls = [];
        let isPdf = false;

        try {
            for(let i=0; i<files.length; i++) {
                const file = files[i];
                if(file.type === "application/pdf") isPdf = true;
                const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/' + Date.now() + '_' + cleanName);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                imgUrls.push(url);
            }

            await addDoc(collection(db, "listings"), {
                type: type, 
                title: title, 
                price: price, 
                currency: currency, 
                desc: desc,
                sellerId: window.userProfile.uid, 
                sellerName: window.userProfile.name,
                imgUrls: imgUrls, 
                imgUrl: imgUrls[0] || null, 
                isPdf: isPdf,
                createdAt: serverTimestamp()
            });

            alert("Harika! İlanınız başarıyla yayınlandı.");
            window.closeModal();
            window.loadPage('market');
        } catch(error) {
            console.error(error);
            alert("İlan yüklenirken bir hata oluştu: " + error.message);
            btn.disabled = false;
            btn.innerText = "İlanı Yayınla";
            statusText.style.display = "none";
        }
    };

    window.drawConfessionsFeed = function() {
        let html = `
            <div class="feed-layout-container">
                <div style="background: white; padding: 15px; border-bottom: 1px solid #E5E7EB; z-index: 10; display:flex; gap:10px; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; overflow:hidden; border:1px solid #E5E7EB; flex-shrink:0;">
                        ${window.userProfile.avatarUrl ? `<img src="${window.userProfile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : window.userProfile.avatar}
                    </div>
                    <button onclick="window.openConfessionForm()" style="background:var(--primary); color:white; border:none; border-radius:50%; width:36px; height:36px; font-size:20px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(79,70,229,0.3); flex-shrink:0; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Yeni Paylaşım Ekle">+</button>
                    <button class="btn-primary" style="flex:1; text-align:left; background:#F9FAFB; color:var(--text-gray); border:1px solid #E5E7EB; box-shadow:none; padding:12px 15px; font-weight:normal; border-radius:20px;" onclick="window.openConfessionForm()">Kampüste neler oluyor?</button>
                </div>
                <div id="conf-feed"></div>
            </div>
        `;
        mainContent.innerHTML = html;
        const feedContainer = document.getElementById('conf-feed');
        
        if (confessionsDB.length === 0) {
            feedContainer.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--text-gray);">
                    <div style="font-size:48px; margin-bottom:10px;">📭</div>
                    <p>Henüz paylaşım yok. İlk sen paylaş!</p>
                </div>`;
            return;
        }

        let feedHtml = '';
        confessionsDB.forEach(post => {
            const isLiked = post.likes && post.likes.includes(window.userProfile.uid);
            const likeIcon = isLiked ? '❤️' : '🤍';
            const likeCount = post.likes ? post.likes.length : 0;
            const commentCount = post.comments ? post.comments.length : 0;
            
            let imgHtml = post.imgUrl ? `<img src="${post.imgUrl}" class="feed-post-img" onclick="event.stopPropagation(); window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">` : '';
            
            feedHtml += `
                <div class="feed-post" onclick="window.openConfessionDetail('${post.id}')" style="cursor:pointer; transition: transform 0.2s;">
                    <div class="feed-post-header">
                        <div class="feed-post-avatar">${post.isAnonymous ? '🕵️' : (post.authorAvatarUrl ? `<img src="${post.authorAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (post.authorAvatar || '👤'))}</div>
                        <div class="feed-post-meta">
                            <span class="feed-post-author">${post.isAnonymous ? 'Gizli Kullanıcı' : post.authorName}</span>
                            <span class="feed-post-time">${post.time || 'Yeni'}</span>
                        </div>
                    </div>
                    <div class="feed-post-text">${post.text}</div>
                    ${imgHtml}
                    <div class="feed-post-actions">
                        <button class="feed-action-btn" id="like-btn-${post.id}" onclick="event.stopPropagation(); window.likePost('${post.id}', event)">${likeIcon} <span style="margin-left:4px;">${likeCount}</span></button>
                        <button class="feed-action-btn" id="comment-count-${post.id}">💬 <span style="margin-left:4px;">${commentCount}</span></button>
                    </div>
                </div>
            `;
        });
        feedContainer.innerHTML = feedHtml;
    };

    window.openConfessionForm = function() {
        window.openModal('📝 Gönderi Paylaş', `
            <textarea id="new-post-text" rows="4" placeholder="Düşüncelerini özgürce paylaş..." style="width:100%; padding:15px; border-radius:12px; border:1px solid #E5E7EB; outline:none; resize:none; font-size:15px; margin-bottom:15px; box-sizing:border-box; background:#F9FAFB;"></textarea>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:#fff; padding:10px; border-radius:12px; border:1px solid #E5E7EB;">
                <label style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; cursor:pointer; color:var(--text-dark);">
                    <input type="checkbox" id="new-post-anon" style="width:18px; height:18px; accent-color:var(--primary);"> 🕵️ Gizli Paylaş
                </label>
                <div style="position:relative;">
                    <button class="action-btn" onclick="document.getElementById('post-img-upload').click()" style="padding:8px 16px; font-size:13px; background:#EEF2FF; color:var(--primary); border:none;">📷 Fotoğraf Ekle</button>
                    <input type="file" id="post-img-upload" accept="image/*" style="display:none;" onchange="window.previewPostImage(event)">
                </div>
            </div>
            
            <div id="post-img-preview" style="margin-bottom:15px; display:none; position:relative; border-radius:12px; overflow:hidden; border:1px solid #E5E7EB;">
                <img id="post-img-display" style="width:100%; max-height:250px; object-fit:cover; display:block;">
                <button onclick="document.getElementById('post-img-upload').value=''; document.getElementById('post-img-preview').style.display='none';" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:30px; height:30px; font-size:16px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">×</button>
            </div>
            
            <button id="publish-post-btn" class="btn-primary" style="width:100%; padding:16px; font-size:16px; font-weight:bold; border-radius:12px; box-shadow:0 4px 10px rgba(79,70,229,0.3);" onclick="window.submitPost()">Paylaş 🚀</button>
        `);
    };

    window.previewPostImage = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('post-img-display').src = e.target.result;
                document.getElementById('post-img-preview').style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    };

    window.submitPost = async function() {
        const text = document.getElementById('new-post-text').value.trim();
        const isAnon = document.getElementById('new-post-anon').checked;
        const fileInput = document.getElementById('post-img-upload');
        
        if(!text && (!fileInput || fileInput.files.length === 0)) return alert("Lütfen bir şeyler yazın veya bir fotoğraf seçin.");
        
        const btn = document.getElementById('publish-post-btn');
        btn.disabled = true;
        btn.innerText = "Gönderiliyor... ⏳";

        try {
            let imgUrl = null;
            if (fileInput && fileInput.files.length > 0) {
                try {
                    const file = fileInput.files[0];
                    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                    const storageRef = ref(storage, 'confessions/' + window.userProfile.uid + '/' + Date.now() + '_' + cleanName);
                    await uploadBytes(storageRef, file);
                    imgUrl = await getDownloadURL(storageRef);
                } catch(uploadError) {
                    console.error("Resim yükleme hatası: ", uploadError);
                    alert("Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
                    btn.disabled = false;
                    btn.innerText = "Paylaş 🚀";
                    return; 
                }
            }

            await addDoc(collection(db, "confessions"), {
                text: text,
                authorId: window.userProfile.uid,
                authorName: window.userProfile.name,
                authorAvatar: window.userProfile.avatar || "👤",
                authorAvatarUrl: window.userProfile.avatarUrl || null,
                isAnonymous: isAnon,
                imgUrl: imgUrl,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                createdAt: serverTimestamp(),
                likes: [],
                comments: []
            });

            window.closeModal();
        } catch(error) {
            console.error(error);
            alert("Paylaşılırken hata oluştu: " + error.message);
            btn.disabled = false;
            btn.innerText = "Paylaş 🚀";
        }
    };

    window.likePost = async function(postId, event) {
        if (event) {
            const btn = event.currentTarget || event.target;
            const rect = btn.getBoundingClientRect();
            const flyingEmoji = document.createElement('div');
            flyingEmoji.innerText = '❤️';
            flyingEmoji.style.position = 'fixed';
            flyingEmoji.style.left = (rect.left + rect.width / 2 - 12) + 'px'; 
            flyingEmoji.style.top = rect.top + 'px';
            flyingEmoji.style.fontSize = '24px';
            flyingEmoji.style.zIndex = '999999';
            flyingEmoji.style.pointerEvents = 'none';
            flyingEmoji.style.animation = 'flyUpAndFade 1s ease-out forwards';
            document.body.appendChild(flyingEmoji);
            
            setTimeout(() => flyingEmoji.remove(), 1000);
        }

        const postRef = doc(db, "confessions", postId);
        const post = confessionsDB.find(p => p.id === postId);
        if(!post) return;
        
        const isLiked = post.likes && post.likes.includes(window.userProfile.uid);
        try {
            if(isLiked) {
                await updateDoc(postRef, { likes: post.likes.filter(id => id !== window.userProfile.uid) });
            } else {
                await updateDoc(postRef, { likes: arrayUnion(window.userProfile.uid) });
            }
        } catch(e) { console.error(e); }
    };

    window.openConfessionDetail = function(postId) {
        window.updateConfessionDetailLive(postId);
    };

    window.updateConfessionDetailLive = function(postId) {
        const post = confessionsDB.find(p => p.id === postId);
        if(!post) { window.closeModal(); return; }

        const isLiked = post.likes && post.likes.includes(window.userProfile.uid);
        const likeIcon = isLiked ? '❤️' : '🤍';
        const likeCount = post.likes ? post.likes.length : 0;
        let imgHtml = post.imgUrl ? `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:15px; cursor:pointer; max-height:400px; object-fit:cover; border:1px solid #E5E7EB;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">` : '';

        let commentsHtml = '';
        if(post.comments && post.comments.length > 0) {
            post.comments.forEach(c => {
                commentsHtml += `
                    <div style="background:#F9FAFB; padding:12px; border-radius:12px; margin-bottom:10px; display:flex; gap:12px; border:1px solid #f1f5f9;">
                        <div style="font-size:20px; flex-shrink:0; width:36px; height:36px; background:#E5E7EB; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">${c.avatarUrl ? `<img src="${c.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (c.avatar || '👤')}</div>
                        <div style="flex:1;">
                            <div style="font-size:13px; font-weight:800; color:var(--text-dark); margin-bottom:4px; display:flex; justify-content:space-between;">
                                <span>${c.name}</span>
                                <span style="color:var(--text-gray); font-weight:normal; font-size:11px;">${c.time || ''}</span>
                            </div>
                            <div style="font-size:14px; color:#374151; line-height:1.4; word-break:break-word;">${c.text}</div>
                        </div>
                    </div>
                `;
            });
        } else {
            commentsHtml = '<div style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Bu gönderiye henüz yorum yapılmamış. İlk yorumu sen yap!</div>';
        }

        let deleteBtn = post.authorId === window.userProfile.uid ? `<button onclick="window.deleteConfession('${post.id}')" style="background:none; border:none; color:#EF4444; font-size:12px; font-weight:bold; cursor:pointer; padding:5px;">🗑️ Sil</button>` : '';

        const html = `
            <input type="hidden" id="active-post-id" value="${post.id}">
            <div class="feed-post-header" style="justify-content:space-between; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="feed-post-avatar">${post.isAnonymous ? '🕵️' : (post.authorAvatarUrl ? `<img src="${post.authorAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (post.authorAvatar || '👤'))}</div>
                    <div class="feed-post-meta">
                        <span class="feed-post-author">${post.isAnonymous ? 'Gizli Kullanıcı' : post.authorName}</span>
                        <span class="feed-post-time">${post.time || ''}</span>
                    </div>
                </div>
                ${deleteBtn}
            </div>
            <div class="feed-post-text" style="font-size:16px; margin-bottom:15px;">${post.text}</div>
            ${imgHtml}
            <div class="feed-post-actions" style="margin-bottom:15px; border-bottom:1px solid #E5E7EB; padding-bottom:15px;">
                <button class="feed-action-btn" onclick="window.likePost('${post.id}', event)" style="font-size:15px;">${likeIcon} <span style="margin-left:5px; font-weight:bold;">${likeCount} Beğeni</span></button>
            </div>
            <div class="answers-container" id="comments-container" style="margin-bottom:15px; max-height: 300px; overflow-y:auto;">${commentsHtml}</div>
            <div style="display:flex; gap:10px; background:white; padding-top:10px;">
                <input type="text" id="comment-input" placeholder="Bir yanıt yaz..." style="flex:1; padding:14px 15px; border-radius:25px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB; font-size:14px;" onkeypress="if(event.key==='Enter') window.addComment('${post.id}')">
                <button class="chat-send-btn" onclick="window.addComment('${post.id}')" style="width:46px; height:46px; border-radius:50%; background:var(--primary); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(79,70,229,0.3); font-size:18px;">➤</button>
            </div>
        `;
        
        if(!document.getElementById('app-modal').classList.contains('active')) {
            window.openModal('Gönderi Detayı', html);
        } else {
            document.getElementById('modal-body').innerHTML = html;
            const commContainer = document.getElementById('comments-container');
            if(commContainer) commContainer.scrollTop = commContainer.scrollHeight;
        }
    };

    window.addComment = async function(postId) {
        const input = document.getElementById('comment-input');
        if(!input || !input.value.trim()) return;
        
        const commentText = input.value.trim();
        input.value = '';
        
        const newComment = {
            userId: window.userProfile.uid,
            name: window.userProfile.name,
            avatar: window.userProfile.avatar || '👤',
            avatarUrl: window.userProfile.avatarUrl || null,
            text: commentText,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        try {
            await updateDoc(doc(db, "confessions", postId), { comments: arrayUnion(newComment) });
        } catch(e) { console.error(e); }
    };

    window.deleteConfession = async function(postId) {
        if(confirm("Bu gönderiyi tamamen silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "confessions", postId));
                window.closeModal();
                alert("Gönderi silindi.");
            } catch(e) { alert("Hata: " + e.message); }
        }
    };

    window.renderMessagesSidebarOnly = function() {
        const sb = document.getElementById('chat-sidebar-list');
        if(!sb) return;

        let sbHtml = '';
        chatsDB.forEach(chat => {
            if (chat.status === 'pending' && !chat.isMarketChat) return;

            const lastMsgObj = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : {text: 'Yeni bağlantı'};
            let lastMsg = lastMsgObj.text || (lastMsgObj.mediaUrl ? (lastMsgObj.mediaType === 'pdf' ? '📄 PDF Belgesi' : '📷 Fotoğraf') : '');
            const msgTime = lastMsgObj.time || '';
            const isUnread = lastMsgObj.senderId !== window.userProfile.uid && lastMsgObj.read === false;
            
            let statusBadge = '';
            if (chat.status === 'pending') {
                statusBadge = chat.initiator === window.userProfile.uid ? ' <span style="font-size:10px; color:#9CA3AF; font-weight:normal;">(Bekleniyor)</span>' : ' <span style="font-size:10px; color:#EF4444; font-weight:bold;">(İstek!)</span>';
            }

            const activeClass = (chat.id === currentChatId) ? 'active' : '';
            const unreadStyle = isUnread ? 'font-weight:800; color:var(--text-dark);' : 'color:var(--text-gray);';
            const badgeHtml = isUnread ? `<div style="width:12px; height:12px; background:var(--primary); border-radius:50%; border:2px solid white; box-shadow:0 0 0 1px var(--primary); margin-left:auto;"></div>` : '';

            let avatarHtml = chat.avatar && chat.avatar.startsWith('http') 
                ? `<img src="${chat.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
                : `<div style="width:48px; height:48px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:24px; border:1px solid #E5E7EB;">${chat.avatar || '👤'}</div>`;

            sbHtml += `
                <div class="chat-contact ${activeClass}" onclick="window.openChatView('${chat.id}')" style="display:flex; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9; cursor:pointer; gap:12px; transition:background 0.2s;">
                    <div style="position:relative; flex-shrink:0;">
                        ${avatarHtml}
                        ${chat.isMarketChat ? '<div style="position:absolute; bottom:-5px; right:-5px; font-size:14px; background:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1);">🛒</div>' : ''}
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                            <span style="font-weight:800; font-size:15px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${chat.name}${statusBadge}</span>
                            <span style="font-size:11px; color:#64748b; margin-left:5px; font-weight:500;">${msgTime}</span>
                        </div>
                        <div style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${unreadStyle}">
                            ${lastMsgObj.senderId === window.userProfile.uid ? 'Sen: ' : ''}${lastMsg}
                        </div>
                    </div>
                    ${badgeHtml}
                </div>
            `;
        });
        
        sb.innerHTML = sbHtml || `
            <div style="padding:40px 20px; text-align:center; color:#9CA3AF;">
                <div style="font-size:40px; margin-bottom:10px;">💬</div>
                <div style="font-size:14px; font-weight:500;">Mesajınız yok.</div>
                <div style="font-size:12px; margin-top:5px;">Keşfet'ten yeni insanlarla tanışın.</div>
            </div>
        `;
    };

    window.renderMessages = function() {
        document.body.classList.add('no-scroll-messages');

        let unreadCount = 0;
        chatsDB.forEach(chat => {
            if (chat.status === 'accepted' || chat.isMarketChat) {
                if (chat.messages && chat.messages.length > 0) {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                        unreadCount++;
                    }
                }
            }
        });

        const unreadHtml = unreadCount > 0 ? `<span style="background:var(--primary); color:white; font-size:12px; padding:2px 8px; border-radius:12px; margin-left:5px; vertical-align:middle;">${unreadCount} Yeni</span>` : '';

        let html = `
            <div id="chat-layout-container" style="display:flex; width:100%; height:100%; flex-direction:row;">
                <div class="chat-sidebar" id="chat-sidebar-main">
                    <div class="chat-sidebar-header" style="padding:15px 20px; border-bottom:1px solid #E5E7EB; background:white; position:sticky; top:0; z-index:10; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:20px; font-weight:800;">Sohbetler ${unreadHtml}</h2>
                    </div>
                    <div id="chat-sidebar-list" style="padding-bottom:20px;"></div>
                </div>
                <div class="chat-main" id="chat-main-area" style="display:none; flex-direction:column; height:100%; position:relative; background:#f9fafb; flex:1;">
                </div>
            </div>
        `;
        mainContent.innerHTML = html;
        window.renderMessagesSidebarOnly();
        
        if (currentChatId) {
            window.openChatView(currentChatId);
        } else if (window.innerWidth > 1024 && chatsDB.length > 0) {
            window.openChatView(chatsDB[0].id);
        }
    };

    window.openChatViewDirect = function(chatId) {
        window.goToMessages();
        setTimeout(() => { window.openChatView(chatId); }, 100);
    };

    window.clearChatHistory = async function(chatId) {
        if(confirm("Bu kişiyle olan tüm mesaj geçmişini silmek istediğinize emin misiniz?")) {
            try {
                await updateDoc(doc(db, "chats", chatId), { messages: [], lastUpdated: serverTimestamp() });
                alert("Mesaj geçmişi başarıyla temizlendi.");
                window.updateChatMessagesOnly(chatId);
            } catch(e) { alert("Hata: " + e.message); }
        }
    };

    window.blockUser = async function(otherUid, chatId, name) {
        if(confirm(`${name} adlı kullanıcıyı engellemek istediğinize emin misiniz? Artık ondan mesaj alamayacaksınız.`)) {
            try {
                await updateDoc(doc(db, "users", window.userProfile.uid), {
                    blockedUsers: arrayUnion(otherUid)
                });
                if (!window.userProfile.blockedUsers) window.userProfile.blockedUsers = [];
                window.userProfile.blockedUsers.push(otherUid);

                await updateDoc(doc(db, "chats", chatId), {
                    status: 'blocked',
                    blockedBy: window.userProfile.uid,
                    lastUpdated: serverTimestamp()
                });

                alert(`${name} başarıyla engellendi.`);
                window.closeChatView();
                window.renderMessagesSidebarOnly();
            } catch(e) { alert("Engelleme işlemi sırasında hata oluştu: " + e.message); }
        }
    };

    window.openChatView = function(chatId) {
        currentChatId = chatId;
        const chatLayout = document.getElementById('chat-layout-container');
        if(chatLayout) chatLayout.classList.add('chat-active');
        
        window.renderMessagesSidebarOnly(); 
        
        const chat = chatsDB.find(c => c.id === chatId);
        const mainArea = document.getElementById('chat-main-area');
        if(!chat || !mainArea) return;

        mainArea.style.display = 'flex';

        let avatarHtml = chat.avatar && chat.avatar.startsWith('http') 
            ? `<img src="${chat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #E5E7EB;">${chat.avatar || '👤'}</div>`;

        let headerHtml = `
            <div class="chat-header" style="padding:10px 15px; border-bottom:1px solid #E5E7EB; background:white; display:flex; align-items:center; gap:12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); z-index:10; flex-shrink:0;">
                <button onclick="window.closeChatView()" style="background:#F3F4F6; border:none; border-radius:50%; width:40px; height:40px; font-size:20px; cursor:pointer; font-weight:bold; color:var(--text-dark); display:flex; align-items:center; justify-content:center; transition:0.2s; display:block !important; pointer-events:auto; z-index:9999;" class="back-btn-mobile">←</button>
                ${avatarHtml}
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:16px; color:#0f172a; cursor:pointer;" onclick="window.viewUserProfile('${chat.otherUid}')">${chat.name}</div>
                    <div style="font-size:12px; color:#10B981; font-weight:600; display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#10B981; border-radius:50%;"></div> ${chat.isMarketChat ? 'Market İletişimi' : 'Kampüs İçi'}</div>
                </div>
                
                <div style="position:relative;">
                    <button onclick="document.getElementById('chat-options-menu').classList.toggle('hidden'); event.stopPropagation();" style="background:none; border:none; font-size:20px; color:var(--text-gray); cursor:pointer;" id="chat-options-dropdown-wrapper">⋮</button>
                    <div id="chat-options-menu" class="hidden" style="position:absolute; right:0; top:35px; background:white; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-radius:12px; overflow:hidden; z-index:100; min-width:180px; border:1px solid #E5E7EB;">
                        <div onclick="window.clearChatHistory('${chat.id}')" style="padding:14px 15px; font-size:13px; font-weight:600; color:var(--text-dark); cursor:pointer; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px; transition:0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='white'">🗑️ Geçmişi Sil</div>
                        <div onclick="window.blockUser('${chat.otherUid}', '${chat.id}', '${chat.name}')" style="padding:14px 15px; font-size:13px; font-weight:600; color:#EF4444; cursor:pointer; display:flex; align-items:center; gap:10px; transition:0.2s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='white'">🚫 Kişiyi Engelle</div>
                    </div>
                </div>
            </div>
        `;

        let statusAreaHtml = '';
        if (chat.status === 'pending') {
            if (chat.initiator === window.userProfile.uid) {
                statusAreaHtml = `<div style="padding:15px; background:#EEF2FF; text-align:center; font-size:13px; color:#4F46E5; border-bottom:1px solid #E5E7EB; font-weight:700; flex-shrink:0;">⏳ Karşı tarafın onayı bekleniyor. ${chat.isMarketChat ? 'Onaylanana kadar manuel mesaj gönderemezsiniz.' : ''}</div>`;
            } else {
                statusAreaHtml = `
                    <div style="padding:20px 15px; background:#F0FDF4; text-align:center; border-bottom:1px solid #E5E7EB; flex-shrink:0;">
                    <div style="font-size:14px; color:#166534; margin-bottom:12px; font-weight:700;">👋 ${chat.name} seninle bağlantı kurmak istiyor.</div>
                    <div style="display:flex; justify-content:center; gap:10px;">
                        <button class="btn-primary" style="padding:10px 20px; background:#10B981; border-color:#10B981; font-size:14px; box-shadow:none; border-radius:10px;" onclick="window.acceptChatRequest('${chat.id}')">✅ Kabul Et</button>
                        <button class="btn-danger" style="padding:10px 20px; font-size:14px; box-shadow:none; border-radius:10px;" onclick="window.rejectChatRequest('${chat.id}')">❌ Reddet</button>
                    </div>
                </div>`;
            }
        }

        let mainHtml = `
            ${headerHtml}
            ${statusAreaHtml}
            <div id="chat-messages-scroll" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; background:#f9fafb;">
                <div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px;">Mesajlar yükleniyor...</div>
            </div>
        `;

        if (chat.status === 'accepted') {
            mainHtml += `
                <div class="chat-input-area" style="padding:15px 20px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:12px; align-items:center; flex-shrink:0;">
                    <input type="file" id="dm-chat-media" accept="image/*, application/pdf" style="display:none;" onchange="window.uploadChatMedia(event, '${chat.id}', 'dm')">
                    <button onclick="document.getElementById('dm-chat-media').click()" style="background:transparent; color:#6B7280; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📎</button>
                    <input type="text" id="chat-input-field" placeholder="Mesaj yaz..." style="flex:1; padding:14px 20px; border-radius:25px; border:1px solid #E5E7EB; background:#F9FAFB; outline:none; font-size:15px; color:var(--text-dark);">
                    <button onclick="window.sendDirectMessage('${chat.id}', '${chat.otherUid}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:48px; height:48px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(79,70,229,0.3); flex-shrink:0; transition: transform 0.2s;">➤</button>
                </div>
            `;
        }

        mainArea.innerHTML = mainHtml;
        window.updateChatMessagesOnly(chatId);

        const inputField = document.getElementById('chat-input-field');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') window.sendDirectMessage(chat.id, chat.otherUid);
            });
            if(window.innerWidth > 1024) setTimeout(() => inputField.focus(), 100);
        }
        
        if (chat.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                const updatedMessages = chat.messages.map(m => {
                    if(m.senderId !== window.userProfile.uid) m.read = true;
                    return m;
                });
                updateDoc(doc(db, "chats", chatId), { messages: updatedMessages }).catch(err => console.error(err));
            }
        }
    };

    window.closeChatView = function() {
        const chatLayout = document.getElementById('chat-layout-container');
        if(chatLayout) chatLayout.classList.remove('chat-active');
        currentChatId = null;
        window.renderMessagesSidebarOnly();
    };

    window.updateChatMessagesOnly = function(chatId) {
        if(currentChatId !== chatId) return;
        const scrollBox = document.getElementById('chat-messages-scroll');
        if(!scrollBox) return;

        const chat = chatsDB.find(c => c.id === chatId);
        if(!chat) return;

        let chatHTML = '';
        const msgs = chat.messages || [];
        
        if (msgs.length === 0) {
            chatHTML = `<div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px;">Henüz mesaj yok. İlk mesajı sen gönder!</div>`;
        } else {
            let lastDate = null;
            msgs.forEach((msg, index) => {
                const isMe = msg.senderId === window.userProfile.uid;
                const type = isMe ? 'sent' : 'received';
                const msgTime = msg.time || '';
                const isRead = msg.read ? '✓✓' : '✓';
                
                let mediaHtml = '';
                if (msg.mediaUrl) {
                    if (msg.mediaType === 'pdf') {
                        mediaHtml = `<a href="${msg.mediaUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(0,0,0,0.05); padding:10px; border-radius:8px; margin-bottom:5px; text-decoration:none; color:#EF4444; font-weight:bold; font-size:13px;"><span>📄</span> PDF İndir/Aç</a>`;
                    } else {
                        mediaHtml = `<img src="${msg.mediaUrl}" style="width:100%; max-width:250px; border-radius:8px; margin-bottom:5px; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([msg.mediaUrl]))}', 0)">`;
                    }
                }

                const textHtml = msg.text ? `<div class="msg-text" style="word-break: break-word;">${msg.text}</div>` : '';

                chatHTML += `
                    <div class="bubble ${type}" style="display:flex; flex-direction:column; position:relative;">
                        ${mediaHtml}
                        ${textHtml}
                        <div class="msg-time" style="align-self:flex-end; font-size:10px; opacity:0.7; margin-top:4px; display:flex; align-items:center; gap:4px;">
                            ${msgTime} ${isMe ? `<span style="font-weight:bold;">${isRead}</span>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        const isScrolledToBottom = scrollBox.scrollHeight - scrollBox.clientHeight <= scrollBox.scrollTop + 50;
        scrollBox.innerHTML = chatHTML;
        if(isScrolledToBottom || msgs.length <= 1) {
            scrollBox.scrollTop = scrollBox.scrollHeight;
        }
    };

    window.sendDirectMessage = async function(chatId, otherUid) {
        const input = document.getElementById('chat-input-field');
        if(input && input.value.trim() !== '') {
            const text = input.value.trim();
            input.value = '';
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const newMsg = {
                senderId: window.userProfile.uid,
                text: text,
                time: timeStr,
                read: false
            };

            const chatRef = doc(db, "chats", chatId);
            try {
                await updateDoc(chatRef, {
                    messages: arrayUnion(newMsg),
                    lastUpdated: serverTimestamp()
                });
            } catch(error) {
                console.error("Mesaj gönderilemedi:", error);
                alert("Mesaj gönderilirken bir hata oluştu.");
            }
        }
    };

    window.acceptChatRequest = async function(chatId) {
        try {
            await updateDoc(doc(db, "chats", chatId), {
                status: 'accepted',
                lastUpdated: serverTimestamp()
            });
            window.openChatView(chatId);
        } catch(error) {
            alert("İstek onaylanırken hata oluştu.");
        }
    };

    window.rejectChatRequest = async function(chatId) {
        if(confirm("Bu bağlantı isteğini reddetmek ve silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "chats", chatId));
                window.closeChatView();
            } catch(error) {
                alert("İstek silinirken hata oluştu.");
            }
        }
    };

    window.renderProfile = function() {
        const u = window.userProfile;
        const initial = u.surname ? u.surname.charAt(0) + '.' : '';
        const isPremium = u.isPremium;
        
        let avatarHtml = u.avatarUrl 
            ? `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
                 <img src="${u.avatarUrl}" class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}">
                 <div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
               </div>` 
            : `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
                 <div class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}">${u.avatar || '👤'}</div>
                 <div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
               </div>`;

        let tagsHtml = '';
        if(u.interests && Array.isArray(u.interests)) {
            tagsHtml = u.interests.map(tag => `<span class="id-tag" style="background:white; color:#111827; border:1px solid #111827;">${tag}</span>`).join('');
        }

        const premiumBadgeHtml = isPremium 
            ? `<div style="background:white; color:#111827; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-top:5px;">☆ Premium Üye</div>` 
            : ``;

        const friendsCount = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat).length;

        let html = `
            <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.openCropper(event, 'profile')">

            <div class="id-card ${isPremium ? 'premium-card-bw' : ''}" style="width:100%; max-width:100%; box-sizing:border-box; margin-top:10px; margin-bottom:15px; position:relative; ${isPremium ? 'border-color:#111827;' : ''}">
                <button class="edit-profile-icon" style="position:absolute; top:15px; right:15px; background:white; color:#111827; border:1px solid #111827;" onclick="window.openProfileEditModal()">✏️ Düzenle</button>
                <div class="id-card-left">${avatarHtml}</div>
                <div class="id-card-right">
                    <div class="id-card-name" style="color:#111827;">${u.name} ${initial}</div>
                    <div style="font-size:12px; color:#111827; margin-bottom:4px; font-weight:600;">${u.username ? u.username : '@kullanici_adi'}</div>
                    <div class="id-card-faculty" style="color:#111827;">${u.faculty || 'Bölüm belirtilmemiş'} ${u.grade ? ' - ' + u.grade + '. Sınıf' : ''}</div>
                    <div class="id-card-details">
                        <span style="color:#111827;">🏫 ${u.university || 'UniLoop'}</span>
                        <span style="color:#111827;">🎂 ${u.age ? u.age + ' Yaşında' : 'Yaş belirtilmemiş'}</span>
                        <span style="color:#111827; font-weight:bold;">🔥 Popülerlik: ${u.popularity || 0}</span>
                        ${premiumBadgeHtml}
                    </div>
                    <div class="id-card-tags">${tagsHtml}</div>
                </div>
            </div>

            <button class="btn-primary" style="width:100%; padding:14px; font-size:15px; border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; background:white; color:#111827; box-shadow:none; border:1px solid #111827; transition:0.2s;" onclick="window.openFriendsList()">
                <span style="font-size:20px;">👥</span> <strong>Arkadaşlarım (${friendsCount})</strong>
            </button>

            <div class="card" style="margin-bottom:15px;">
                <h3 style="font-size:15px; margin-bottom:10px; color:#111827; border-bottom:1px solid #111827; padding-bottom:8px;">İstatistiklerim</h3>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">
                    <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                        <div style="font-size:20px; font-weight:800; color:#111827;">${confessionsDB.filter(c => c.authorId === u.uid).length}</div>
                        <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Gönderi</div>
                    </div>
                    <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                        <div style="font-size:20px; font-weight:800; color:#111827;">${marketDB.filter(m => m.sellerId === u.uid).length}</div>
                        <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Market İlanı</div>
                    </div>
                    <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                        <div style="font-size:20px; font-weight:800; color:#111827;">${friendsCount}</div>
                        <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Bağlantı</div>
                    </div>
                </div>
            </div>
            
            ${!isPremium ? `
            <div class="card premium-glow" style="margin-bottom:15px; background:white; border:1px solid #111827; cursor:pointer;" onclick="window.openPremiumModal()">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-weight:800; color:#111827; font-size:16px; margin-bottom:4px;">🌟 UniLoop Premium'a Geç</div>
                        <div style="font-size:12px; color:#111827; font-weight:bold;">Kampüsün en popüler kişisi ol, sınırları kaldır!</div>
                    </div>
                    <div style="font-size:24px;">👑</div>
                </div>
            </div>
            ` : ''}

            <button class="card" style="width:100%; padding:16px; margin-bottom:20px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:1px solid #111827; cursor:pointer; color:#111827; font-weight:bold; transition:transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.renderSettings()">
                <span style="font-size:20px;">⚙️</span> <strong style="font-size:15px;">Hesap Ayarları</strong>
            </button>
        `;
        mainContent.innerHTML = html;
    };

    window.openFriendsList = function() {
        const friends = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat);
        
        if (friends.length === 0) {
            window.openModal('👥 Arkadaşlarım', `
                <div style="text-align:center; padding:30px 10px; color:var(--text-gray);">
                    <div style="font-size:40px; margin-bottom:10px;">🤷‍♂️</div>
                    <div style="font-size:14px;">Henüz bağlantı kurduğunuz bir arkadaşınız yok.</div>
                    <button class="btn-primary" style="margin-top:15px; padding:10px 20px; border-radius:10px; font-size:13px; background:white; color:#111827; border:1px solid #1
1827;" onclick="window.closeModal(); window.loadPage('home')">Keşfetmeye Başla</button>
                </div>
            `);
            return;
        }

        let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">`;
        friends.forEach(f => {
            let avatarHtml = f.avatar && f.avatar.startsWith('http') 
                ? `<img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #111827;">`
                : `<div style="width:40px; height:40px; border-radius:50%; background:white; color:#111827; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #111827;">${f.avatar || '👤'}</div>`;

            listHtml += `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:white; border:1px solid #111827; border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="window.viewUserProfile('${f.otherUid}')">
                        ${avatarHtml}
                        <span style="font-weight:700; font-size:14px; color:#111827;">${f.name}</span>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; box-shadow:none; background:white; color:#111827; border:1px solid #111827;" onclick="window.openChatViewDirect('${f.id}'); window.closeModal();">💬 Mesaj</button>
                    </div>
                </div>
            `;
        });
        listHtml += `</div>`;
        
        window.openModal(`👥 Arkadaşlarım (${friends.length})`, listHtml);
    };

    window.renderSettings = function() {
        const currentLang = localStorage.getItem('uniloop_lang') || 'tr';
        
        let premiumCancelHtml = window.userProfile.isPremium ? `<a href="#" onclick="event.preventDefault(); window.cancelPremium()" style="display:block; text-align:center; font-size:12px; color:#111827; font-weight:bold; text-decoration:underline; margin-bottom:15px;">Premium Üyeliğimi İptal Et</a>` : '';

        window.openModal('⚙️ Ayarlar', `
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:13px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; display:block;">Dil Seçimi</label>
                    <select onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB;">
                        <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                    </select>
                </div>
                
                <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>
                
                <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px; background:#4B5563; border-color:#4B5563;" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>
                
                <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>
                
                <a href="#" onclick="event.preventDefault(); window.deleteAccount()" style="display:block; text-align:center; font-size:12px; color:#EF4444; text-decoration:underline; margin-bottom:5px;">Hesabımı Sil</a>
                
                ${premiumCancelHtml}
                
                <a href="#" onclick="event.preventDefault(); window.openLegalModal()" style="display:block; text-align:center; font-size:12px; color:var(--primary); text-decoration:underline;">Kullanıcı Sözleşmesi ve Hakları</a>
                
                <div style="text-align:center; font-size:11px; color:#9CA3AF; margin-top:5px;">
                    UniLoop v3.2.0 Pro<br>Made with ❤️ for Students
                </div>
            </div>
        `);
    };

    window.openLegalModal = function() {
        window.openModal('⚖️ Kullanıcı Sözleşmesi ve Hakları', `
            <div style="max-height: 400px; overflow-y: auto; font-size: 13px; color: var(--text-dark); line-height: 1.6; padding-right: 5px; text-align:left;">
                <h4 style="margin-top:0; color:var(--primary);">1. Taraflar ve Kapsam</h4>
                <p>Bu sözleşme, UniLoop platformunu ("Sistem") kullanan tüm üyeler için geçerlidir. Platform, KKTC (Kuzey Kıbrıs Türk Cumhuriyeti) ve Türkiye Cumhuriyeti kanunlarına tabidir ve hizmetler bu yasal çerçevede sunulmaktadır.</p>
                
                <h4 style="color:var(--primary);">2. Kullanım Şartları</h4>
                <p>Kullanıcılar yasadışı, hakaret içeren, tehditkar, müstehcen veya başkalarının telif haklarını/kişisel haklarını ihlal eden içerikler paylaşamazlar. Kullanıcıların platform üzerinde gerçekleştirdiği tüm eylemler kendi sorumluluğundadır. Sistem sahibi veya yöneticileri bu ihlallerden hiçbir suretle hukuki veya cezai olarak sorumlu tutulamaz.</p>
                
                <h4 style="color:var(--primary);">3. Gizlilik Politikası</h4>
                <p>Kullanıcı verileri (e-posta, isim, vb.) güvenli sunucularda saklanır. Bu veriler, yasal zorunluluklar veya yetkili makamların resmi talepleri dışında kesinlikle 3. şahıslarla veya kurumlarla paylaşılmaz.</p>
                
                <h4 style="color:var(--primary);">4. İhlal ve Fesih Politikası</h4>
                <p>Yukarıda belirtilen kurallara uymayan hesaplar, sistem yöneticileri tarafından önceden haber verilmeksizin kalıcı olarak askıya alınabilir veya silinebilir. Sistem, ihlal durumunda yasal mercilerle işbirliği yapma hakkını saklı tutar.</p>
                
                <div style="margin-top:20px; font-weight:bold; text-align:center; font-size:12px; color:var(--text-gray);">
                    Sisteme kayıt olan her kullanıcı, bu şartları okumuş ve kabul etmiş sayılır.
                </div>
            </div>
            <button class="btn-primary" style="width:100%; margin-top:15px; padding:12px; border-radius:10px;" onclick="window.closeModal(); window.renderSettings();">Geri Dön</button>
        `);
    };

    window.renderNotifications = function() {
        const notifBadgeTop = document.getElementById('notif-badge-top');
        if(notifBadgeTop) notifBadgeTop.style.display = 'none';

        let html = '<div class="notif-compact-panel">';
        let hasNotif = false;
        
        chatsDB.forEach(chat => {
            if (chat.status === 'pending' && chat.initiator !== window.userProfile.uid && !chat.isMarketChat) {
                hasNotif = true;
                html += `
                    <div class="notif-compact-item" style="border-left: 4px solid var(--primary);">
                        <div style="display:flex; align-items:center; gap:10px; flex:1;">
                            <div style="font-size:24px;">👋</div>
                            <div>
                                <div style="font-weight:800; font-size:14px; color:var(--text-dark);">${chat.name}</div>
                                <div style="font-size:12px; color:var(--text-gray);">Seninle bağlantı kurmak istiyor.</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:5px;">
                            <button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; background:#10B981; border-color:#10B981; box-shadow:none;" onclick="window.acceptChatRequest('${chat.id}')">Kabul</button>
                            <button class="btn-danger" style="padding:6px 12px; font-size:12px; border-radius:8px; box-shadow:none;" onclick="window.rejectChatRequest('${chat.id}')">Red</button>
                        </div>
                    </div>
                `;
            }
        });

        chatsDB.forEach(chat => {
            if (chat.status === 'accepted' || chat.isMarketChat) {
                if (chat.messages && chat.messages.length > 0) {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                        hasNotif = true;
                        
                        let msgPreview = lastMsg.text;
                        if(lastMsg.isSystem) msgPreview = lastMsg.text; 
                        
                        html += `
                            <div class="notif-compact-item" style="cursor:pointer;" onclick="window.openChatViewDirect('${chat.id}'); window.closeModal();">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                    <div style="font-size:24px;">${lastMsg.isSystem ? '🔔' : '💬'}</div>
                                    <div style="flex:1; min-width:0;">
                                        <div style="font-weight:800; font-size:14px; color:var(--text-dark);">${chat.name}</div>
                                        <div style="font-size:12px; color:var(--primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Yeni: ${msgPreview}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        });

        if (!hasNotif) {
            html += `
                <div style="text-align:center; padding:30px 10px; color:var(--text-gray);">
                    <div style="font-size:40px; margin-bottom:10px;">🔔</div>
                    <div style="font-size:14px;">Şu an için yeni bir bildiriminiz yok.</div>
                </div>
            `;
        }
        
        html += '</div>';
        window.openModal('🔔 Bildirimler', html);
    };

    window.loadPage = function(page) {
        document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
        const targetNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
        if(targetNav) targetNav.classList.add('active');

        window.scrollTo(0, 0);
        document.body.classList.remove('no-scroll-messages');
        document.body.classList.remove('no-scroll-home');
        if (currentGroupUnsubscribe) { currentGroupUnsubscribe(); currentGroupUnsubscribe = null; }

        switch(page) {
            case 'home': window.renderHome(); break;
            case 'confessions': window.drawConfessionsFeed(); break;
            case 'market': window.renderListings('market', '🛒 Kampüs Market'); break;
            case 'messages': window.renderMessages(); break;
            case 'profile': window.renderProfile(); break;
            default: window.renderHome();
        }
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUniLoop);
} else {
    initializeUniLoop();
}

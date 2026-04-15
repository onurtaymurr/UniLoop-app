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
    arrayRemove,
    where,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    uploadString,
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
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", avatarUrl: "", age: "", isPremium: false, grade: "", interests: [], purpose: "", joinedClassRoom: null, joinedClubs: [] 
};

window.joinedFaculties = [];
let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;
let currentGroupUnsubscribe = null; 

window.registrationData = { interests: [] };

window.resetCurrentChatId = function() { currentChatId = null; };

const allFaculties = [
    "Tıp Fakültesi", "Diş Hekimliği Fakültesi", "Eczacılık Fakültesi", "Hukuk Fakültesi", "Mühendislik Fakültesi", 
    "Bilgisayar ve Bilişim Bilimleri", "Mimarlık Fakültesi", "Eğitim Fakültesi", "İletişim Fakültesi", 
    "İktisadi ve İdari Bilimler", "Güzel Sanatlar", "Fen-Edebiyat Fakültesi", "Sağlık Bilimleri Fakültesi", 
    "Veteriner Fakültesi", "İlahiyat Fakültesi", "Spor Bilimleri Fakültesi", "Turizm Fakültesi", 
    "Ziraat Fakültesi", "Orman Fakültesi", "Denizcilik Fakültesi", "Havacılık ve Uzay Bilimleri", "Uygulamalı Bilimler"
];

const APP_CLUBS = [
    "⚽ Spor Kulübü", "🎭 Tiyatro Kulübü", "🏥 Sağlık Kulübü", "💻 Yazılım Kulübü", 
    "🎵 Müzik Kulübü", "📸 Fotoğrafçılık Kulübü", "🌍 Gezi ve Doğa Kulübü", 
    "🧠 Yapay Zeka Kulübü", "📚 Edebiyat Kulübü", "🎮 E-Spor Kulübü"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
const modal = document.getElementById('app-modal');

let cropper = null;

function initializeUniLoop() {

    // ✂️ CROPPER.JS ENJEKSİYONU
    const cropperCss = document.createElement('link');
    cropperCss.rel = 'stylesheet';
    cropperCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css';
    document.head.appendChild(cropperCss);

    const cropperJs = document.createElement('script');
    cropperJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js';
    document.head.appendChild(cropperJs);

    // 🎨 CSS DÜZENLEMELERİ (KARANLIK MOD VE UI GÜNCELLEMELERİ)
    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; }
        header, #app-header { height: 50px !important; box-sizing: border-box; }

        .edit-profile-icon { font-size: 14px; background: #EEF2FF; color: var(--primary); padding: 5px 10px; border-radius: 8px; border: 1px solid #C7D2FE; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 700; transition: 0.2s; }
        .edit-profile-icon:hover { background: #DBEAFE; }

        /* KLAVYE DONMASINI ENGELLEYEN TOUCH ACTION VE KORUMA */
        body.no-scroll-messages { overflow: hidden !important; position: fixed; width: 100%; height: 100%; touch-action: none; }
        
        #main-content { padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important; }

        .no-scroll-messages #main-content { 
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

        #chat-layout-container { 
            position: relative !important; 
            width: 100% !important; 
            height: 100% !important; 
            display: flex; 
            flex-direction: row; 
            background: #fff; 
            flex: 1;
            overflow: hidden; 
        }
        
        .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; background: #f9fafb; position:relative; }
        #chat-messages-scroll { flex: 1 1 auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding: 15px; }
        
        .chat-input-area { flex: 0 0 auto !important; background: white; border-top: 1px solid #E5E7EB; padding: 10px 15px !important; z-index: 50; position: relative; }
        #group-messages-scroll { flex: 1 1 auto !important; overflow-y: auto !important; padding: 15px; }

        #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; transition: opacity 0.3s ease; }
        #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; transition: opacity 0.3s ease;}
        #auth-screen { position: relative; z-index: 1000 !important; }
        #auth-screen button, #auth-screen a, #auth-screen input, #auth-screen select { pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 1001 !important; }
        button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { cursor: pointer !important; position: relative; pointer-events: auto !important; z-index: 10; }
        
        #sidebar { display: none !important; }
        #mobile-menu-btn { display: none !important; }

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
            height: calc(60px + env(safe-area-inset-bottom));
            padding-bottom: env(safe-area-inset-bottom);
            box-sizing: border-box;
            z-index: 99999;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
        }
        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8E8E93; font-size: 10px; text-decoration: none; cursor: pointer; transition: 0.2s; flex: 1; background: transparent !important; border: none !important; font-weight: 500; -webkit-tap-highlight-color: transparent; 
            height: 60px; 
            padding: 0;
        }
        .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
        .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
        .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
        .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
        .bottom-nav-item.active .bottom-nav-icon svg { stroke-width: 2.2; }

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
        
        .bubble { margin-bottom: 6px; }

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
        .user-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; width: 100%; }
        .user-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 15px 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; justify-content: center; min-height: 140px;}
        .user-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); border-color: var(--primary); }
        .premium-glow { animation: glowPulse 2s infinite alternate; }
        @keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); } }
        .premium-upgrade-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 8px; }
        .premium-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }
        
        /* KUSURSUZ ZİFİRİ KARANLIK MOD (TRUE DARK MODE) */
        body.dark-mode { background-color: #000000 !important; color: #f1f5f9 !important; }
        .dark-mode #main-content { background-color: #000000 !important; color: #f1f5f9 !important; }
        .dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card { background-color: #111827 !important; border-color: #1f2937 !important; color: #f1f5f9 !important; box-shadow: none !important; }
        .dark-mode .id-card { background: linear-gradient(135deg, #111827, #1f2937) !important; border-color: #374151 !important; }
        .dark-mode .id-card-name { color: #f1f5f9 !important; }
        .dark-mode .notif-compact-item { background: #111827 !important; border-color: #1f2937 !important; color: #f1f5f9 !important; }
        .dark-mode .card > div { border-color: #1f2937 !important; }
        .dark-mode .feed-post-author, .dark-mode .feed-post-text, .dark-mode h2, .dark-mode label, .dark-mode .item-title, .dark-mode h3, .dark-mode h4, .dark-mode strong { color: #f1f5f9 !important; }
        .dark-mode .feed-layout-container, .dark-mode #conf-feed { background-color: #000000 !important; }
        .dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #1f2937 !important; color: #f1f5f9 !important; border-color: #374151 !important; }
        .dark-mode .feed-post-avatar, .dark-mode .avatar { background-color: #1f2937 !important; border-color: #374151 !important; }
        .dark-mode .feed-action-btn:hover { background: #374151 !important; }
        .dark-mode .chat-contact:hover { background: #1f2937 !important; }
        .dark-mode .chat-input-wrapper input { background: #1f2937 !important; color: #f1f5f9 !important; }
        .dark-mode .modal-content { background-color: #111827 !important; color: #f1f5f9 !important; border-color: #1f2937 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important; }
        .dark-mode .bottom-nav { background: #111827 !important; border-top-color: #1f2937 !important; }
        .dark-mode .bottom-nav-item { color: #6b7280; }
        .dark-mode .bottom-nav-item.active { color: #818cf8 !important; }
        .dark-mode .chat-layout-container, .dark-mode #chat-layout-container { background: #000000 !important; border-color: #1f2937 !important; }
        .dark-mode .chat-sidebar { background: #000000 !important; border-color: #1f2937 !important; }
        .dark-mode .chat-main { background: #000000 !important; }
        .dark-mode .chat-header { background: #111827 !important; border-bottom: 1px solid #1f2937 !important; color: #f1f5f9 !important; }
        .dark-mode .chat-header-name, .dark-mode .chat-header-info div { color: #f1f5f9 !important; }
        .dark-mode .chat-input-area { background: #111827 !important; border-top: 1px solid #1f2937 !important; }
        .dark-mode #group-chat-input, .dark-mode #chat-input-field { background: #1f2937 !important; color: #f1f5f9 !important; border: 1px solid #374151 !important; }
        .dark-mode .chat-contact.active { background: #1f2937 !important; border-left-color: #818cf8 !important; }
        .dark-mode #chat-messages-scroll, .dark-mode #group-messages-scroll { background: #000000 !important; background-image: none !important; }
        
        /* Modern Chat Bubbles Dark Mode */
        .dark-mode .bubble.received { background: #1f2937 !important; color: #f1f5f9 !important; border: none !important; }
        .dark-mode .bubble.sent { background: linear-gradient(135deg, #4f46e5, #4338ca) !important; color: #ffffff !important; border: none !important; }
        .dark-mode .msg-text { color: inherit !important; }

        #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
        #app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
        #app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 10px; }
        
        #notif-btn-top { position: relative; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
        #notif-btn-top:hover { background: #E5E7EB; }
        .dark-mode #notif-btn-top { background: #1f2937 !important; }
        .dark-mode #notif-btn-top:hover { background: #374151 !important; }
        
        #nav-premium-action { font-size: 13px !important; padding: 0 12px !important; height: 32px !important; line-height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: nowrap !important; flex-shrink: 0 !important; margin: 0 !important; border-radius: 8px !important; }
        
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
    `;
    document.head.appendChild(styleFix);

    // 🌟 UNILOOP LOGO ENJEKSİYONU (Sağ Alt Hizalı Küçük Yazı İle Birlikte)
    setTimeout(() => {
        const headerLogoCandidates = document.querySelectorAll('.logo, .logo-title, #logo-btn, #app-header > :first-child, header > :first-child');
        headerLogoCandidates.forEach(el => {
            if(el && !el.hasAttribute('data-logo-applied')) {
                el.innerHTML = `
                    <div style="display: flex; align-items: flex-end; gap: 6px;">
                        <div style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; border-radius: 50%; background-image: url('uniloop-logo.png'); background-size: 155%; background-position: center 12%; background-repeat: no-repeat; border: none;"></div>
                        <span style="font-weight: 800; font-size: 15px; color: #111827; margin-bottom: 8px; letter-spacing: -0.5px;">UniLoop</span>
                    </div>
                `;
                el.setAttribute('data-logo-applied', 'true');
            }
        });
    }, 100);

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

    window.toggleTheme = function(theme) {
        localStorage.setItem('uniloop_theme', theme);
        if(theme === 'dark') document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    };

    const savedTheme = localStorage.getItem('uniloop_theme') || 'light';
    window.toggleTheme(savedTheme);

    document.addEventListener('click', async function(e) {
        const isTarget = (id) => e.target.id === id || (e.target.closest && e.target.closest('#' + id));

        if (e.target.id === 'modal-close' || e.target.classList.contains('close-btn')) {
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
            if(!emailInput || !passInput) return;

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
                
                // Başarılı giriş sonrası yenileme
                btn.innerText = "Giriş Başarılı! Yönlendiriliyor...";
                setTimeout(() => {
                    window.location.reload();
                }, 500);
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
            
            if(!uInput) return alert("Lütfen bir kullanıcı adı belirleyin.");
            if(!n || !s || !a || !f || !window.registrationData.grade) return alert("Lütfen tüm kişisel bilgilerinizi eksiksiz doldurun.");
            
            const finalUsername = '#' + uInput;
            const btn = document.getElementById('step3-btn');
            btn.innerText = "Kullanıcı Adı Kontrol Ediliyor...";
            btn.disabled = true;
            
            try {
                const q = query(collection(db, "users"), where("username", "==", finalUsername));
                const snap = await getDocs(q);
                if(!snap.empty) {
                    alert("Bu kullanıcı adı zaten alınmış. Lütfen başka bir tane seçin.");
                    btn.innerText = "Devam Et →";
                    btn.disabled = false;
                    return;
                }
            } catch(e) { console.error(e); }

            window.registrationData = { ...window.registrationData, username: finalUsername, name: n, surname: s, age: a, faculty: f };
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
                interests: d.interests, 
                purpose: d.purpose,
                avatar: "👨‍🎓", 
                avatarUrl: finalAvatarUrl, 
                isOnline: true, 
                isPremium: false,
                joinedClassRoom: null,
                joinedClubs: []
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
                    // 🌟 SİSTEM MESAJINDA YENİ UNILOOP LOGOSU KULLANIMI
                    participants: [user.uid, "system"],
                    participantNames: { [user.uid]: userName, "system": "UniLoop Team" },
                    participantAvatars: { [user.uid]: "👨‍🎓", "system": "<div style='width:100%; height:100%; border-radius:50%; background-image:url(\"uniloop-logo.png\"); background-size:155%; background-position:center 12%; background-repeat:no-repeat;'></div>" },
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
                document.getElementById('login-card').style.display = 'block';
                document.getElementById('register-card').style.display = 'none';
                if(document.getElementById('stepper-wrapper')) document.getElementById('stepper-wrapper').remove();
                const bottomNav = document.getElementById('uniloop-bottom-nav');
                if(bottomNav) bottomNav.remove();
                const topNotifBtn = document.getElementById('notif-btn-top');
                if(topNotifBtn) topNotifBtn.remove();
            }
        } catch(error) { console.error(error); }
    };

    onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) { 
            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                
                if(!docSnap.exists()) {
                    authScreen.style.display = 'flex';
                    appScreen.style.display = 'none';
                    document.getElementById('login-card').style.display = 'none';
                    window.registrationData.email = user.email;
                    startRegistrationStepper(3);
                    return; 
                }

                if(authScreen && appScreen) { authScreen.style.display = 'none'; appScreen.style.display = 'block'; }

                window.userProfile = docSnap.data();
                if(window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if(window.userProfile.age === undefined) window.userProfile.age = "";
                if(window.userProfile.avatarUrl === undefined) window.userProfile.avatarUrl = "";
                if(window.userProfile.joinedClassRoom === undefined) window.userProfile.joinedClassRoom = null;
                if(window.userProfile.joinedClubs === undefined) window.userProfile.joinedClubs = [];

                await window.ensureWelcomeMessage(user, window.userProfile.name);
                await updateDoc(userDocRef, { isOnline: true });
                
                const headerRightMenu = document.querySelector('.header-right-menu');
                if (headerRightMenu) {
                    headerRightMenu.innerHTML = ''; 
                    
                    // YENİ PREMIUM MENÜ GÖRÜNÜMÜ
                    if (!window.userProfile.isPremium) {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="color:#D97706; font-weight:bold; cursor:pointer;" onclick="window.openPremiumModal()">🌟 Premium</div>`);
                    } else {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="background:linear-gradient(135deg, #F59E0B, #D97706); color:white; padding:4px 10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.openPremiumFeaturesModal()">🌟 Premium Özellikler</div>`);
                    }

                    headerRightMenu.insertAdjacentHTML('beforeend', `<div id="notif-btn-top" onclick="window.renderNotifications()" title="Bildirimler">🔔 <span id="notif-badge-top" style="display:none; position:absolute; top:-2px; right:-2px; background:#EF4444; color:white; border-radius:50%; width:16px; height:16px; font-size:10px; align-items:center; justify-content:center; font-weight:bold; border:2px solid white;">0</span></div>`);
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
        }
    });

    // YENİ: SİSTEM MESAJI VE BİLDİRİM FONKSİYONU
    window.sendSystemNotification = async function(targetId, text) {
        try {
            const chatId = targetId + "_system_welcome";
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: "system",
                    text: text,
                    time: timeStr,
                    read: false,
                    isSystem: true
                }),
                lastUpdated: serverTimestamp()
            });
        } catch(e) { 
            console.error(e); 
        }
    };

    function initRealtimeListeners(currentUid) {
        const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

        onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
            marketDB = [];
            snapshot.forEach(doc => { marketDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }); });
            marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            const activeTab = document.querySelector('.bottom-nav-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market');
        });

        onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
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
                } catch(err) { console.error("Hatalı mesaj belgesi es geçildi:", err); }
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

    window.openPremiumModal = function() {
        window.openModal('🌟 UniLoop Premium', `
            <div style="text-align:center; padding: 10px;">
                <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
                <h3 style="color:#D97706; margin-bottom: 10px; font-size: 22px;">Kampüsün Zirvesine Çık!</h3>
                <p style="margin-bottom:20px; font-size:15px; color:var(--text-gray);">
                    UniLoop Premium ile sınırları kaldır ve kampüsün en donanımlı ağına dahil ol.
                </p>
                <ul style="text-align:left; background:#FEF3C7; padding: 20px; border-radius: 12px; margin-bottom:20px; list-style:none; color:#92400E; font-weight:500; font-size: 14px;">
                    <li style="margin-bottom:15px; display:flex; gap:10px;">
                        <span style="font-size:20px;">📚</span> 
                        <span><strong>Çıkmış Sorular Arşivi:</strong> Hocaların çıkmış sorularına kapsamlı erişim sağla ve sınavlara bir adım önde başla.</span>
                    </li>
                    <li style="margin-bottom:15px; display:flex; gap:10px;">
                        <span style="font-size:20px;">🤖</span> 
                        <span><strong>Sınavlardan İyi Not Alma Asistanı:</strong> Yüklediğin PDF ve not dosyalarından, hocaların soracağı soru tarzına benzer çoktan seçmeli SORULAR üreten güçlü Yapay Zeka!</span>
                    </li>
                    <li style="display:flex; gap:10px;">
                        <span style="font-size:20px;">👁️</span> 
                        <span><strong>Profilime Kim Baktı?:</strong> Profilini inceleyen herkes anında sana özel sistem bildirimi olarak gelsin.</span>
                    </li>
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
                await updateDoc(doc(db, "users", window.userProfile.uid), { 
                    isPremium: true 
                });
                
                window.userProfile.isPremium = true;
                
                const navBtn = document.getElementById('nav-premium-action');
                if(navBtn) {
                    navBtn.style.display = 'none';
                }
                
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

    // YENİ: KULÜP TOPLANTISI MODALI (Tasarım Güncellendi ve Sağ Üste Taşındı)
    window.openClubMeetingModal = async function(roomId, roomTitle) {
        window.openModal('📅 Kulüp Toplantısı', `<div id="meeting-modal-content" style="text-align:center; padding: 20px; color: var(--text-gray);">Bilgiler yükleniyor... ⏳</div>`);
        
        try {
            const docRef = doc(db, "group_chats", roomId);
            const snap = await getDoc(docRef);
            let mTitle = 'Büyük Tanışma Toplantısı';
            let mTime = 'Tarih Belirlenmedi';
            let isAdmin = false;
            
            if(snap.exists()) {
                const d = snap.data();
                if(d.meetingTitle) mTitle = d.meetingTitle;
                if(d.meetingTime) mTime = d.meetingTime;
                if(d.admins && d.admins.includes(window.userProfile.uid)) isAdmin = true;
            }
            
            let editBtn = isAdmin ? `<button style="width:100%; font-size:13px; background:#EEF2FF; color:var(--primary); border:1px solid #C7D2FE; padding:10px; border-radius:10px; cursor:pointer; font-weight:bold; margin-top:15px;" onclick="window.editClubMeeting('${roomId}'); window.closeModal();">✏️ Toplantıyı Düzenle</button>` : '';

            let html = `
                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:16px; padding:25px 20px; margin-bottom:15px; text-align:center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <div style="font-size:48px; margin-bottom:15px; animation: fadeIn 0.5s ease-out;">⏰</div>
                    <div style="font-size:18px; font-weight:800; color:#0F172A; margin-bottom:8px;">${mTitle}</div>
                    <div style="display:inline-block; font-size:13px; color:#4F46E5; background:#EEF2FF; padding:6px 12px; border-radius:20px; font-weight:700;">${mTime}</div>
                    ${editBtn}
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button style="background:white; border:1px solid #E2E8F0; color:#334155; padding:15px; border-radius:12px; font-size:14px; font-weight:bold; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.joinMockVoiceRoom('${roomTitle}')">
                        <span style="font-size:24px;">📞</span> Sesli Katıl
                    </button>
                    <button style="background:white; border:1px solid #E2E8F0; color:#334155; padding:15px; border-radius:12px; font-size:14px; font-weight:bold; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.joinMockVideoRoom('${roomTitle}')">
                        <span style="font-size:24px;">📹</span> Görüntülü Katıl
                    </button>
                </div>
            `;
            const contentDiv = document.getElementById('meeting-modal-content');
            if(contentDiv) contentDiv.innerHTML = html;
        } catch(e) {
            console.error(e);
            document.getElementById('meeting-modal-content').innerHTML = '<div style="color:red; text-align:center;">Bilgiler yüklenirken hata oluştu. Lütfen tekrar deneyin.</div>';
        }
    };

    window.openPremiumFeaturesModal = function() {
        const fac = window.userProfile.faculty || "Fakülteniz";
        const grade = window.userProfile.grade || "Sınıfınız";
        
        window.openModal('🌟 Premium Özellikler Merkezi', `
            <div style="display:flex; flex-direction:column; gap:15px;">
                
                <div class="card" style="background:linear-gradient(135deg, #EFF6FF, #DBEAFE); border:1px solid #93C5FD; padding:20px; border-radius:12px; cursor:pointer;">
                    <div style="font-size:30px; margin-bottom:10px; text-align:center;">📚</div>
                    <h4 style="color:#1D4ED8; margin-bottom:8px; font-size:16px; text-align:center;">Çıkmış Sorular Arşivi</h4>
                    <p style="font-size:13px; color:#2563EB; text-align:center; margin-bottom:15px;">
                        ${fac} - ${grade}. Sınıf geçmiş sınavlarına ve çözümlerine hemen ulaş.
                    </p>
                    <button class="btn-primary" style="width:100%; padding:12px; font-size:14px; border-radius:10px; background:#3B82F6; border:none;" onclick="alert('Arşiv klasörleri yükleniyor... Sistem çok yakında aktif edilecektir.')">
                        Arşive Git ➡️
                    </button>
                </div>

                <div class="card" style="background:linear-gradient(135deg, #F0FDF4, #BBF7D0); border:1px solid #86EFAC; padding:20px; border-radius:12px;">
                    <div style="font-size:30px; margin-bottom:10px; text-align:center;">🤖</div>
                    <h4 style="color:#166534; margin-bottom:8px; font-size:16px; text-align:center;">Sınav Asistanı (Yapay Zeka)</h4>
                    <p style="font-size:13px; color:#15803D; text-align:center; margin-bottom:15px;">
                        Notlarını veya PDF dosyalarını yükle, hocanın tarzında çoktan seçmeli sorular ve deneme sınavları hazırlayalım.
                    </p>
                    <input type="file" id="ai-pdf-upload" accept="application/pdf, .doc, .docx, .txt" style="display:none;" onchange="alert('Belge AI motoruna yükleniyor... Sorular analiz edilip oluşturulacak. ⏳')">
                    <button class="btn-primary" style="width:100%; padding:12px; font-size:14px; border-radius:10px; background:#10B981; border:none;" onclick="document.getElementById('ai-pdf-upload').click()">
                        📄 PDF/Dosya Yükle ve Soru Üret
                    </button>
                </div>
                
            </div>
        `);
    };

    window.goToMessages = function() {
        document.querySelectorAll('.bottom-nav-item').forEach(m => {
            m.classList.remove('active');
        });
        
        const msgTab = document.querySelector('.bottom-nav-item[data-target="messages"]');
        if(msgTab) { 
            msgTab.classList.add('active'); 
            window.loadPage('messages'); 
        }
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
        
        if (!document.getElementById('lightbox').classList.contains('active') && !document.body.classList.contains('no-scroll-messages')) {
            document.body.style.overflow = 'auto'; 
        }
        // MODALDAN ÇIKILDIĞINDA EKRAN DONMASINI ÖNLEMEK İÇİN SIFIRLAMA
        window.scrollTo(0, 0);
    };

    // --- SOHBET İÇİ MEDYA YÜKLEME SİSTEMİ (ORTAK) ---
    window.uploadChatMedia = async function(event, targetId, chatType) {
        const file = event.target.files[0];
        if(!file) return;
        
        const btn = document.querySelector('.chat-send-btn');
        const originalIcon = btn ? btn.innerHTML : '➤';
        
        if(btn) { 
            btn.innerHTML = '⏳'; 
            btn.disabled = true; 
        }

        try {
            const isPdf = file.type === "application/pdf";
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
            
            const storageRef = ref(storage, 'chat_media/' + window.userProfile.uid + '/' + Date.now() + '_' + cleanName);
            await uploadBytes(storageRef, file);
            
            const url = await getDownloadURL(storageRef);
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const msgObj = {
                senderId: window.userProfile.uid,
                senderName: window.userProfile.name,
                senderAvatar: window.userProfile.avatarUrl || window.userProfile.avatar || "👤",
                text: isPdf ? '📄 PDF Belgesi' : '📷 Fotoğraf',
                time: timeStr,
                mediaUrl: url,
                mediaType: isPdf ? 'pdf' : 'image',
                read: false
            };

            if (chatType === 'group' || chatType === 'club') {
                const docRef = doc(db, "group_chats", targetId);
                const docSnap = await getDoc(docRef);
                
                if(docSnap.exists()) {
                    await updateDoc(docRef, { 
                        messages: arrayUnion(msgObj), 
                        lastUpdated: serverTimestamp() 
                    });
                } else {
                    await setDoc(docRef, { 
                        messages: [msgObj], 
                        members: [window.userProfile.uid], 
                        createdAt: serverTimestamp(), 
                        roomId: targetId 
                    });
                }
            } else if (chatType === 'dm') {
                await updateDoc(doc(db, "chats", targetId), {
                    messages: arrayUnion(msgObj),
                    lastUpdated: serverTimestamp()
                });
            }
        } catch(e) {
            console.error(e);
            alert("Medya yüklenirken hata oluştu.");
        } finally {
            if(btn) { 
                btn.innerHTML = originalIcon; 
                btn.disabled = false; 
            }
            event.target.value = '';
        }
    };

    window.openFacultiesList = function() {
        let listHtml = `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; max-height:400px; overflow-y:auto; padding:5px;">`;
        
        allFaculties.forEach(fac => {
            listHtml += `
                <button class="btn-primary" style="background:#F3F4F6; color:var(--text-dark); border:1px solid #E5E7EB; box-shadow:none; padding:12px 8px; font-size:13px; font-weight:600; border-radius:12px;" onclick="window.askFacultyGrade('${fac}')">
                    ${fac}
                </button>
            `;
        });
        
        listHtml += `</div>`;
        window.openModal('🏛️ Fakülteler', listHtml);
    };

    window.askFacultyGrade = function(facName) {
        let listHtml = `<div style="display:grid; grid-template-columns: 1fr; gap:10px; padding:5px;">`;
        listHtml += `<p style="text-align:center; font-weight:bold; color:var(--text-gray); font-size:14px; margin-bottom:10px;">${facName} için kaçıncı sınıfsınız?</p>`;
        
        for(let i=1; i<=6; i++) {
            listHtml += `
                <button class="btn-primary" style="padding:12px; font-size:15px; border-radius:12px;" onclick="window.checkFacultyPasscode('${facName}', ${i})">
                    ${i}. Sınıf
                </button>
            `;
        }
        
        listHtml += `</div>`;
        window.openModal('🎓 Sınıfını Seç', listHtml);
    };

    window.checkFacultyPasscode = async function(facName, grade) {
        let firstWord = facName.split(' ')[0].toLocaleLowerCase('tr-TR');
        let expectedCode = firstWord + grade + "00"; 
        
        let userCode = prompt(`${facName} ${grade}. Sınıf grubuna girmek için onay kodunu girin:\n(Yönetici girişi için şifrenin başına 'ai' ekleyin)`);
        
        if (userCode !== null) {
            let inputCode = userCode.trim().toLocaleLowerCase('tr-TR');
            let isAdminJoin = false;

            if (inputCode.startsWith('ai')) {
                isAdminJoin = true;
                inputCode = inputCode.substring(2);
            }

            if (inputCode === expectedCode) {
                alert(isAdminJoin ? "👑 Yönetici şifresi doğru! Gruba yönetici olarak katılıyorsunuz." : "✅ Şifre doğru! Sınıfınıza katılıyorsunuz.");
                
                const roomId = 'class_' + firstWord + '_' + grade;
                const roomTitle = facName + ' ' + grade + '. Sınıf';
                
                try {
                    await updateDoc(doc(db, "users", window.userProfile.uid), { 
                        joinedClassRoom: { 
                            facName: facName, 
                            grade: grade, 
                            roomId: roomId, 
                            roomTitle: roomTitle 
                        } 
                    });
                    
                    window.userProfile.joinedClassRoom = { 
                        facName: facName, 
                        grade: grade, 
                        roomId: roomId, 
                        roomTitle: roomTitle 
                    };

                    const roomRef = doc(db, "group_chats", roomId);
                    const roomSnap = await getDoc(roomRef);
                    
                    if (roomSnap.exists()) {
                        let updates = { 
                            members: arrayUnion(window.userProfile.uid) 
                        };
                        if (isAdminJoin) {
                            updates.admins = arrayUnion(window.userProfile.uid);
                        }
                        await updateDoc(roomRef, updates);
                    } else {
                        let docData = { 
                            messages: [], 
                            members: [window.userProfile.uid], 
                            bannedUsers: [], 
                            createdAt: serverTimestamp(), 
                            roomId: roomId 
                        };
                        if (isAdminJoin) {
                            docData.admins = [window.userProfile.uid];
                        }
                        await setDoc(roomRef, docData);
                    }
                } catch(e) { 
                    console.error(e); 
                }
                
                window.closeModal();
                window.loadPage('home'); 
                window.openGroupRoom(roomId, roomTitle, 'faculty');
            } else {
                alert("❌ Hatalı kod girdiniz. Lütfen tekrar deneyin.");
            }
        }
    };

    window.openClubsList = function() {
        let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding:5px;">`;
        
        APP_CLUBS.forEach(club => {
            let cleanNameMatch = club.match(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/);
            let expectedWord = cleanNameMatch ? cleanNameMatch[0].toLocaleLowerCase('tr-TR') : "kulup";
            
            listHtml += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-radius:12px; cursor:pointer; background:#fff; border:1px solid #E5E7EB; margin-bottom:0 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.checkClubPasscode('${club}', '${expectedWord}')">
                    <span style="font-weight:800; font-size:15px; color:var(--text-dark);">${club}</span>
                    <span style="background:#EEF2FF; color:var(--primary); padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Katıl 🚀</span>
                </div>
            `;
        });
        
        listHtml += `</div>`;
        window.openModal('🎭 Kulüpler ve Organizasyonlar', listHtml);
    };

    window.openJoinedClubsList = function() {
        let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding:5px;">`;
        
        listHtml += `
            <button class="btn-primary" style="background:#F3F4F6; color:var(--text-dark); border:1px solid #E5E7EB; box-shadow:none; padding:12px; font-weight:bold; border-radius:12px; margin-bottom:10px;" onclick="window.openClubsList()">
                🔍 Yeni Kulüp Keşfet
            </button>
        `;

        window.userProfile.joinedClubs.forEach(club => {
            listHtml += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-radius:12px; cursor:pointer; background:#fff; border:1px solid #E5E7EB; margin-bottom:0 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.closeModal(); window.openClubRoom('${club.roomId}', '${club.name}')">
                    <span style="font-weight:800; font-size:15px; color:var(--text-dark);">${club.name}</span>
                    <span style="background:#DCF8C6; color:#166534; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Git ➡️</span>
                </div>
            `;
        });
        
        listHtml += `</div>`;
        window.openModal('📌 Katıldığım Kulüpler', listHtml);
    };

    window.checkClubPasscode = async function(clubName, expectedWord) {
        let expectedCode = expectedWord + "100";
        let userCode = prompt(`${clubName} grubuna girmek için giriş kodunu girin:\n(Yönetici girişi için şifrenin başına 'ai' ekleyin)`);
        
        if (userCode !== null) {
            let inputCode = userCode.trim().toLocaleLowerCase('tr-TR');
            let isAdminJoin = false;

            if (inputCode.startsWith('ai')) {
                isAdminJoin = true;
                inputCode = inputCode.substring(2);
            }

            if (inputCode === expectedCode) {
                alert(isAdminJoin ? "👑 Yönetici olarak kulüp odasına yönlendiriliyorsunuz." : "✅ Şifre doğru! Kulüp odasına yönlendiriliyorsunuz.");
                let roomId = 'club_' + expectedWord;

                try {
                    const clubObj = { roomId: roomId, name: clubName };
                    const hasClub = window.userProfile.joinedClubs && window.userProfile.joinedClubs.find(c => c.roomId === roomId);
                    
                    if(!hasClub) {
                        await updateDoc(doc(db, "users", window.userProfile.uid), { 
                            joinedClubs: arrayUnion(clubObj) 
                        });
                        
                        if(!window.userProfile.joinedClubs) {
                            window.userProfile.joinedClubs = [];
                        }
                        window.userProfile.joinedClubs.push(clubObj);
                    }

                    const roomRef = doc(db, "group_chats", roomId);
                    const roomSnap = await getDoc(roomRef);
                    
                    if (roomSnap.exists()) {
                        let updates = { 
                            members: arrayUnion(window.userProfile.uid) 
                        };
                        if (isAdminJoin) {
                            updates.admins = arrayUnion(window.userProfile.uid);
                        }
                        await updateDoc(roomRef, updates);
                    } else {
                        let docData = { 
                            messages: [], 
                            members: [window.userProfile.uid], 
                            bannedUsers: [], 
                            createdAt: serverTimestamp(), 
                            roomId: roomId 
                        };
                        if (isAdminJoin) {
                            docData.admins = [window.userProfile.uid];
                        }
                        await setDoc(roomRef, docData);
                    }
                } catch(e) { 
                    console.error(e); 
                }

                window.closeModal();
                window.loadPage('home'); 
                window.openClubRoom(roomId, clubName);
            } else {
                alert("❌ Hatalı kod girdiniz. Lütfen tekrar deneyin.");
            }
        }
    };

    window.joinMockVoiceRoom = function(roomTitle) {
        window.openModal(`📞 ${roomTitle} - Sesli Oda`, `
            <div style="text-align:center; padding:30px 10px;">
                <div style="width:100px; height:100px; background:var(--primary); border-radius:50%; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; color:white; font-size:40px; animation: glowPulse 1.5s infinite alternate; box-shadow:0 0 20px var(--primary);">🎤</div>
                <h3 style="margin-bottom:10px; color:var(--text-dark);">Bağlanıldı</h3>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:30px;">Odadaki diğer kişilerle konuşabilirsiniz...</p>
                <div style="display:flex; justify-content:center; gap:20px;">
                    <button style="background:#F3F4F6; border:none; width:60px; height:60px; border-radius:50%; font-size:24px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'" onclick="this.innerText = this.innerText==='🔇' ? '🔊' : '🔇'">🔊</button>
                    <button style="background:#EF4444; color:white; border:none; width:60px; height:60px; border-radius:50%; font-size:24px; cursor:pointer; box-shadow:0 4px 10px rgba(239,68,68,0.4); transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.closeModal()">🚪</button>
                </div>
            </div>
        `);
    };

    window.joinMockVideoRoom = function(roomTitle) {
        window.openModal(`📹 ${roomTitle} - Görüntülü Oda`, `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px;">
                <div style="background:#111827; border-radius:12px; height:150px; display:flex; align-items:center; justify-content:center; flex-direction:column; position:relative; box-shadow:inset 0 0 20px rgba(0,0,0,0.5);">
                    <div style="font-size:40px;">${window.userProfile.avatar || '👨‍🎓'}</div>
                    <div style="position:absolute; bottom:10px; left:10px; color:white; font-size:11px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:8px; font-weight:bold;">Siz</div>
                </div>
                <div style="background:#111827; border-radius:12px; height:150px; display:flex; align-items:center; justify-content:center; flex-direction:column; position:relative; box-shadow:inset 0 0 20px rgba(0,0,0,0.5);">
                    <div style="font-size:40px;">👩‍⚕️</div>
                    <div style="position:absolute; bottom:10px; left:10px; color:white; font-size:11px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:8px; font-weight:bold;">Ayşe</div>
                </div>
                <div style="background:#111827; border-radius:12px; height:150px; display:flex; align-items:center; justify-content:center; flex-direction:column; position:relative; box-shadow:inset 0 0 20px rgba(0,0,0,0.5);">
                    <div style="font-size:40px;">👨‍💻</div>
                    <div style="position:absolute; bottom:10px; left:10px; color:white; font-size:11px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:8px; font-weight:bold;">Can</div>
                </div>
                <div style="background:#374151; border-radius:12px; height:150px; display:flex; align-items:center; justify-content:center; color:#9CA3AF; font-size:13px; font-weight:bold; border:2px dashed #4B5563;">+ Bekleniyor</div>
            </div>
            <div style="display:flex; justify-content:center; gap:20px; background:#F3F4F6; padding:15px; border-radius:20px;">
                <button style="background:white; border:none; width:50px; height:50px; border-radius:50%; font-size:20px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1); transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">📹</button>
                <button style="background:white; border:none; width:50px; height:50px; border-radius:50%; font-size:20px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1); transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🎤</button>
                <button style="background:#EF4444; color:white; border:none; width:50px; height:50px; border-radius:50%; font-size:20px; cursor:pointer; box-shadow:0 4px 10px rgba(239,68,68,0.4); transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.closeModal()">🚪</button>
            </div>
        `);
    };

    // YENİ: GRUPTAN AYRILMA (Sistem mesajı ve üyelikten düşme)
    window.leaveGroup = async function(roomId, roomType, userName) {
        if(confirm("Bu gruptan çıkış yapmak istediğinize emin misiniz?")) {
            try {
                const roomRef = doc(db, "group_chats", roomId);
                
                // Sistem mesajı oluştur
                const sysMsg = { 
                    senderId: "system", 
                    text: `${userName} gruptan ayrıldı.`, 
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                    isSystem: true 
                };
                
                await updateDoc(roomRef, { 
                    members: arrayRemove(window.userProfile.uid), 
                    admins: arrayRemove(window.userProfile.uid),
                    messages: arrayUnion(sysMsg)
                });
                
                const userRef = doc(db, "users", window.userProfile.uid);
                if (roomType === 'faculty') {
                    await updateDoc(userRef, { joinedClassRoom: null });
                    window.userProfile.joinedClassRoom = null;
                } else if (roomType === 'club') {
                    const newClubs = window.userProfile.joinedClubs.filter(c => c.roomId !== roomId);
                    await updateDoc(userRef, { joinedClubs: newClubs });
                    window.userProfile.joinedClubs = newClubs;
                }
                
                alert("Gruptan başarıyla çıktınız.");
                if(currentGroupUnsubscribe) { 
                    currentGroupUnsubscribe(); 
                    currentGroupUnsubscribe = null; 
                }
                window.closeModal(); 
                window.loadPage('home');
            } catch(e) { 
                alert("Çıkış yapılamadı: " + e.message); 
            }
        }
    };

    // YENİ: KULÜP ETKİNLİĞİ DÜZENLEME
    window.editClubMeeting = function(roomId) {
        const title = prompt("Toplantı Başlığı (Örn: Haftalık Değerlendirme):");
        if (!title) return;
        
        const time = prompt("Toplantı Saati ve Yeri (Örn: Cuma 20:00 - Online):");
        if (!time) return;
        
        updateDoc(doc(db, "group_chats", roomId), { 
            meetingTitle: title, 
            meetingTime: time 
        }).catch(e => console.error(e));
    };

    // --- ÖZEL KULÜP ODASI TASARIMI (MODERN UI & TAKVİM EKLENDİ) ---
    window.openClubRoom = function(roomId, roomTitle) {
        if(currentGroupUnsubscribe) { currentGroupUnsubscribe(); currentGroupUnsubscribe = null; }

        document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
        document.body.classList.add('no-scroll-messages'); 

        let html = `
            <div id="chat-layout-container" class="chat-layout-container" style="flex-direction: column; position: relative; width: 100%; height: 100%; display: flex; background:#F9FAFB;">
                
                <div class="chat-header" style="padding:10px 15px; border-bottom:1px solid #E5E7EB; background:white; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.02); z-index:10; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                        <button class="back-btn" onclick="event.stopPropagation(); if(window.currentGroupUnsubscribe) { window.currentGroupUnsubscribe(); window.currentGroupUnsubscribe = null; } window.loadPage('home');" style="border:none; background:transparent; font-size:24px; font-weight:bold; cursor:pointer; color:var(--text-dark); padding:0; width:30px;">←</button>
                        <div style="width:40px; height:40px; background:var(--primary); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">🎭</div>
                        <div style="display:flex; flex-direction:column; cursor:pointer;" onclick="window.showGroupMembers('${roomTitle}', 'club')">
                            <div style="font-weight:800; font-size:16px; color:#111827;">${roomTitle}</div>
                            <div style="font-size:11px; color:#10B981; font-weight:bold;">Resmi Kulüp Odası</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:15px; align-items:center;">
                        <div style="font-size:22px; cursor:pointer; color:var(--text-dark);" onclick="event.stopPropagation(); window.openClubMeetingModal('${roomId}', '${roomTitle}')" title="Takvim ve Toplantılar">📅</div>
                        <div style="font-size:22px; cursor:pointer; color:var(--text-dark);" onclick="event.stopPropagation(); window.showGroupMembers('${roomTitle}', 'club')" title="Üyeler">👥</div>
                    </div>
                </div>

                <div class="chat-messages" id="group-messages-scroll" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; background: #e5ded8; background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 20px 20px;">
                    <div style="text-align:center; padding:20px; color:#6B7280; font-size:13px;">Kulüp sohbeti yükleniyor...</div>
                </div>

                <div class="chat-input-area" style="padding:10px 15px; background:white; display:flex; gap:10px; align-items:center; flex-shrink:0; border-top:1px solid #E5E7EB;">
                    <input type="file" id="club-chat-media" accept="image/*, application/pdf" style="display:none;" onchange="window.uploadChatMedia(event, '${roomId}', 'club')">
                    <button onclick="document.getElementById('club-chat-media').click()" style="background:transparent; color:#6B7280; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📎</button>
                    <input type="text" id="group-chat-input" placeholder="Mesaj gönder..." style="flex:1; padding:14px 20px; border-radius:24px; border:1px solid #E5E7EB; background:#F9FAFB; outline:none; font-size:15px; color:var(--text-dark);">
                    <button class="chat-send-btn" onclick="window.sendGroupMsg('${roomId}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:48px; height:48px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(79,70,229,0.3);">➤</button>
                </div>
            </div>
        `;
        mainContent.innerHTML = html;

        const inputField = document.getElementById('group-chat-input');
        if(inputField) {
            inputField.addEventListener('keypress', (e) => { 
                if(e.key === 'Enter') window.sendGroupMsg(roomId); 
            });
            // BUG FIX: Klavye kapandığında ekranın donmasını/bozulmasını engelleme
            inputField.addEventListener('blur', () => {
                setTimeout(() => { window.scrollTo(0, 0); document.body.scrollTop = 0; }, 100);
            });
        }
        setupGroupChatListener(roomId);
    };

    // --- NORMAL GRUP ODASI (Fakülte/Sınıf İçin - UI GÜNCELLENDİ) ---
    window.openGroupRoom = function(roomId, roomTitle, roomType) {
        if(currentGroupUnsubscribe) { currentGroupUnsubscribe(); currentGroupUnsubscribe = null; }

        document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
        document.body.classList.add('no-scroll-messages'); 

        let html = `
            <div id="chat-layout-container" class="chat-layout-container" style="flex-direction: column; position: relative; width: 100%; height: 100%; display: flex; background:#e5ded8;">
                
                <div class="chat-header" style="padding:10px 15px; border-bottom:1px solid #d1d5db; background:#fff; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05); z-index:10; flex-shrink:0; height:65px; box-sizing:border-box;">
                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                        <button class="back-btn" onclick="event.stopPropagation(); if(window.currentGroupUnsubscribe) { window.currentGroupUnsubscribe(); window.currentGroupUnsubscribe = null; } window.loadPage('home');" style="border:none; background:transparent; font-size:24px; font-weight:bold; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; justify-content:center; z-index:9999; pointer-events:auto; padding:0; width:30px;">←</button>
                        <div style="width:44px; height:44px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:22px; flex-shrink:0; box-shadow:0 2px 4px rgba(0,0,0,0.1);">🎓</div>
                        <div class="chat-header-info" style="display:flex; flex-direction:column; flex:1; min-width:0; padding-right:10px; cursor:pointer;" onclick="window.showGroupMembers('${roomTitle}', '${roomType}')">
                            <div class="chat-header-name" style="font-weight:800; font-size:16px; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${roomTitle}</div>
                            <div class="chat-header-status" style="font-size:12px; color:#10B981; font-weight:600;">Sınıf Odası - Çevrimiçi</div>
                        </div>
                    </div>
                    <div style="font-size:22px; cursor:pointer; color:var(--text-dark);" onclick="window.showGroupMembers('${roomTitle}', '${roomType}')">👥</div>
                </div>

                <div class="chat-messages" id="group-messages-scroll" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; background:#e5ded8; background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 20px 20px;">
                    <div style="text-align:center; padding:20px; color:#6B7280; font-size:14px; background:rgba(255,255,255,0.8); border-radius:12px; margin:20px auto; width:fit-content; max-width:80%; font-weight:500;">Bağlantı kuruluyor...</div>
                </div>

                <div class="chat-input-area" style="padding:10px 15px; background:#f0f2f5; display:flex; gap:10px; align-items:center; flex-shrink:0; border-top:none;">
                    <input type="file" id="group-chat-media" accept="image/*, application/pdf" style="display:none;" onchange="window.uploadChatMedia(event, '${roomId}', 'group')">
                    <button onclick="document.getElementById('group-chat-media').click()" style="background:transparent; color:#6B7280; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📎</button>
                    <input type="text" id="group-chat-input" placeholder="Sınıfa mesaj yaz..." style="flex:1; padding:14px 20px; border-radius:24px; border:none; background:#fff; outline:none; font-size:15px; color:var(--text-dark); box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <button class="chat-send-btn" onclick="window.sendGroupMsg('${roomId}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:48px; height:48px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(79,70,229,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">➤</button>
                </div>
            </div>
        `;
        mainContent.innerHTML = html;

        const inputField = document.getElementById('group-chat-input');
        if(inputField) {
            inputField.addEventListener('keypress', (e) => { 
                if(e.key === 'Enter') window.sendGroupMsg(roomId); 
            });
            // BUG FIX: Klavye kapandığında ekranın donmasını/bozulmasını engelleme
            inputField.addEventListener('blur', () => {
                setTimeout(() => { window.scrollTo(0, 0); document.body.scrollTop = 0; }, 100);
            });
        }
        setupGroupChatListener(roomId);
    };

    window.openChatViewDirect = function(chatId) {
        window.goToMessages();
        setTimeout(() => { window.openChatView(chatId); }, 100);
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
            ? `<img src="${chat.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
            : `<div style="width:44px; height:44px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:22px; border:1px solid #E5E7EB;">${chat.avatar || '👤'}</div>`;

        let headerHtml = `
            <div class="chat-header" style="padding:10px 15px; border-bottom:1px solid #d1d5db; background:#fff; display:flex; align-items:center; gap:12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); z-index:10; flex-shrink:0; height:65px; box-sizing:border-box;">
                <button onclick="window.closeChatView()" style="background:transparent; border:none; border-radius:50%; width:40px; height:40px; font-size:24px; cursor:pointer; font-weight:bold; color:var(--text-dark); display:flex; align-items:center; justify-content:center; transition:0.2s; display:block !important; pointer-events:auto; z-index:9999; padding:0;" class="back-btn-mobile">←</button>
                ${avatarHtml}
                <div style="flex:1; cursor:pointer;" onclick="window.viewUserProfile('${chat.otherUid}')">
                    <div style="font-weight:800; font-size:16px; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${chat.name}</div>
                    <div style="font-size:12px; color:#10B981; font-weight:600; display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#10B981; border-radius:50%;"></div> ${chat.isMarketChat ? 'Market İletişimi' : 'Kampüs İçi'}</div>
                </div>
                <button style="background:none; border:none; font-size:22px; color:var(--text-dark); cursor:pointer;">⋮</button>
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
            <div id="chat-messages-scroll" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; background:#e5ded8; background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 20px 20px;">
                <div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px; background:rgba(255,255,255,0.8); border-radius:12px; margin:20px auto; width:fit-content; max-width:80%; font-weight:500;">Mesajlar yükleniyor...</div>
            </div>
        `;

        if (chat.status === 'accepted') {
            mainHtml += `
                <div class="chat-input-area" style="padding:10px 15px; background:#f0f2f5; display:flex; gap:10px; align-items:center; flex-shrink:0; border-top:none;">
                    <input type="file" id="dm-chat-media" accept="image/*, application/pdf" style="display:none;" onchange="window.uploadChatMedia(event, '${chat.id}', 'dm')">
                    <button onclick="document.getElementById('dm-chat-media').click()" style="background:transparent; color:#6B7280; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📎</button>
                    <input type="text" id="chat-input-field" placeholder="Mesaj yaz..." style="flex:1; padding:14px 20px; border-radius:24px; border:none; background:#fff; outline:none; font-size:15px; color:var(--text-dark); box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <button onclick="window.sendDirectMessage('${chat.id}', '${chat.otherUid}')" style="background:var(--primary); color:white; border:none; border-radius:50%; width:48px; height:48px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(79,70,229,0.3); flex-shrink:0; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">➤</button>
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
            // BUG FIX: Klavye kapandığında ekranın donmasını/bozulmasını engelleme
            inputField.addEventListener('blur', () => {
                setTimeout(() => { window.scrollTo(0, 0); document.body.scrollTop = 0; }, 100);
            });
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

    // 3. YÖNETİCİ MESAJ SİLME VE BAN KONTROLÜ DİNLEYİCİSİ (MODERN UI İÇİN GÜNCELLENDİ)
    function setupGroupChatListener(roomId) {
        currentGroupUnsubscribe = onSnapshot(doc(db, "group_chats", roomId), (docSnap) => {
            const scrollBox = document.getElementById('group-messages-scroll');
            if(!scrollBox) return;

            if(!docSnap.exists()) {
                scrollBox.innerHTML = `
                    <div style="text-align:center; padding:20px; color:#6B7280; font-size:13px; background:rgba(255,255,255,0.8); border-radius:12px; margin:20px auto; width:fit-content; max-width:80%; font-weight:600; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                        🔒 Bu odanın mesajları uçtan uca şifrelidir.<br>İlk mesajı gönderen sen ol!
                    </div>
                `;
                return;
            }

            const data = docSnap.data();
            const msgs = data.messages || [];
            const admins = data.admins || [];
            const bannedUsers = data.bannedUsers || [];
            
            // BAN KONTROLÜ: Eğer kullanıcı atıldıysa odadan çıkarılır
            if (bannedUsers.includes(window.userProfile.uid)) {
                if (currentGroupUnsubscribe) { currentGroupUnsubscribe(); currentGroupUnsubscribe = null; }
                alert("🚫 Bir yönetici tarafından bu gruptan çıkarıldınız. Artık mesajları göremezsiniz.");
                window.loadPage('home');
                return;
            }

            const isMeAdmin = admins.includes(window.userProfile.uid);
            let chatHTML = `<div style="text-align:center; padding:10px; color:#6B7280; font-size:11px; font-weight:600; margin-bottom:10px;"><span style="background:rgba(255,255,255,0.6); padding:4px 10px; border-radius:10px;">Bugün</span></div>`;

            msgs.forEach(msg => {
                // SİSTEM MESAJI RENDERI (Gruptan çıktı / atıldı mesajı)
                if (msg.isSystem) {
                    chatHTML += `
                        <div style="text-align:center; margin: 12px 0;">
                            <span style="background:rgba(0,0,0,0.1); color:#4B5563; font-size:11px; padding:6px 14px; border-radius:16px; font-weight:600; display:inline-block; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                                ${msg.text}
                            </span>
                        </div>
                    `;
                    return;
                }

                const isMe = msg.senderId === window.userProfile.uid;
                const type = isMe ? 'sent' : 'received';
                
                // MODERN WHATSAPP/TELEGRAM TARZI BALONCUKLAR
                const bubbleRadius = isMe ? 'border-radius: 14px 14px 0 14px;' : 'border-radius: 0 14px 14px 14px;';
                const bgStyle = isMe ? 'background: linear-gradient(135deg, var(--primary), #6366F1); color: #fff;' : 'background: #ffffff; border: 1px solid #e5e7eb; color: #111827;';
                const textColor = isMe ? '#fff' : '#111827';
                const timeColor = isMe ? 'rgba(255,255,255,0.7)' : '#6B7280';
                
                let senderNameHtml = '';
                if(!isMe) {
                    const adminBadge = admins.includes(msg.senderId) ? '<span style="font-size:9px; background:#F59E0B; color:white; padding:2px 4px; border-radius:4px; margin-left:4px;">Yönetici</span>' : '';
                    senderNameHtml = `
                        <div style="font-size:12px; font-weight:800; color:var(--primary); margin-bottom:4px; display:flex; align-items:center; gap:5px;">
                            <span style="width:20px; height:20px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid #E5E7EB;">
                                ${msg.senderAvatar && msg.senderAvatar.startsWith('http') ? `<img src="${msg.senderAvatar}" style="width:100%;height:100%;object-fit:cover;">` : (msg.senderAvatar || '👤')}
                            </span>
                            ${msg.senderName} ${adminBadge}
                        </div>
                    `;
                }

                let mediaHtml = '';
                if (msg.mediaUrl) {
                    if (msg.mediaType === 'pdf') {
                        mediaHtml = `
                            <a href="${msg.mediaUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:5px; background:${isMe ? 'rgba(255,255,255,0.2)' : '#F3F4F6'}; padding:10px; border-radius:8px; margin-bottom:5px; text-decoration:none; color:${isMe ? '#fff' : '#EF4444'}; font-weight:bold; font-size:13px;">
                                <span>📄</span> PDF İndir/Aç
                            </a>
                        `;
                    } else {
                        mediaHtml = `
                            <img src="${msg.mediaUrl}" style="width:100%; max-width:250px; border-radius:8px; margin-bottom:5px; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([msg.mediaUrl]))}', 0)">
                        `;
                    }
                }

                const safeMsgText = (msg.text || "").replace(/'/g, "\\'");
                let deleteHtml = isMeAdmin ? `
                    <button onclick="event.stopPropagation(); window.deleteGroupMsg('${roomId}', '${msg.time}', '${msg.senderId}', '${safeMsgText}')" style="position:absolute; top:-10px; right:-10px; background:white; color:#DC2626; border:1px solid #E5E7EB; border-radius:50%; width:24px; height:24px; font-size:12px; cursor:pointer; align-items:center; justify-content:center; padding-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:50; display:none;" class="admin-del-btn" title="Mesajı Sil">✕</button>
                ` : '';
                
                // Mesaj metni '📷 Fotoğraf' veya boşsa metin div'ini oluşturma (Görsel kalabalığı önleme)
                let textToDisplay = msg.text;
                if(textToDisplay === '📷 Fotoğraf' && msg.mediaUrl) textToDisplay = '';
                const textHtml = textToDisplay ? `<div class="msg-text" style="font-size:15px; color:${textColor}; word-break:break-word; line-height:1.4;">${textToDisplay}</div>` : '';

                chatHTML += `
                    <div class="bubble ${type}" style="display:flex; flex-direction:column; max-width:80%; padding:10px 14px; ${bubbleRadius} margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.08); ${bgStyle} position:relative;" onclick="let btn=this.querySelector('.admin-del-btn'); if(btn) { btn.style.display = btn.style.display === 'none' ? 'flex' : 'none'; }">
                        ${deleteHtml}
                        ${senderNameHtml}
                        ${mediaHtml}
                        ${textHtml}
                        <div class="msg-time" style="align-self:flex-end; font-size:10px; color:${timeColor}; margin-top:4px; font-weight:600;">${msg.time}</div>
                    </div>
                `;
            });
            scrollBox.innerHTML = chatHTML;
            scrollBox.scrollTop = scrollBox.scrollHeight;
        });
    }

    window.updateChatMessagesOnly = function(chatId) {
        if(currentChatId !== chatId) return;
        const scrollBox = document.getElementById('chat-messages-scroll');
        if(!scrollBox) return;

        const chat = chatsDB.find(c => c.id === chatId);
        if(!chat) return;

        let chatHTML = `<div style="text-align:center; padding:10px; color:#6B7280; font-size:11px; font-weight:600; margin-bottom:10px;"><span style="background:rgba(255,255,255,0.6); padding:4px 10px; border-radius:10px;">Bugün</span></div>`;
        const msgs = chat.messages || [];
        
        if (msgs.length === 0) {
            chatHTML = `<div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px; background:rgba(255,255,255,0.8); border-radius:12px; margin:20px auto; width:fit-content; font-weight:500;">Henüz mesaj yok. İlk mesajı sen gönder!</div>`;
        } else {
            msgs.forEach((msg, index) => {
                const isMe = msg.senderId === window.userProfile.uid;
                const type = isMe ? 'sent' : 'received';
                const msgTime = msg.time || '';
                const isRead = msg.read ? '✓✓' : '✓';
                
                // MODERN WHATSAPP/TELEGRAM TARZI BALONCUKLAR
                const bubbleRadius = isMe ? 'border-radius: 14px 14px 0 14px;' : 'border-radius: 0 14px 14px 14px;';
                const bgStyle = isMe ? 'background: linear-gradient(135deg, var(--primary), #6366F1); color: #fff;' : 'background: #ffffff; border: 1px solid #e5e7eb; color: #111827;';
                const textColor = isMe ? '#fff' : '#111827';
                const timeColor = isMe ? 'rgba(255,255,255,0.7)' : '#6B7280';
                const readColor = msg.read ? '#60A5FA' : 'rgba(255,255,255,0.7)';
                
                let mediaHtml = '';
                if (msg.mediaUrl) {
                    if (msg.mediaType === 'pdf') {
                        mediaHtml = `<a href="${msg.mediaUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:5px; background:${isMe ? 'rgba(255,255,255,0.2)' : '#F3F4F6'}; padding:10px; border-radius:8px; margin-bottom:5px; text-decoration:none; color:${isMe ? '#fff' : '#EF4444'}; font-weight:bold; font-size:13px;"><span>📄</span> PDF İndir/Aç</a>`;
                    } else {
                        mediaHtml = `<img src="${msg.mediaUrl}" style="width:100%; max-width:250px; border-radius:8px; margin-bottom:5px; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([msg.mediaUrl]))}', 0)">`;
                    }
                }

                // Mesaj metni boşsa div oluşturma
                let textToDisplay = msg.text;
                if(textToDisplay === '📷 Fotoğraf' && msg.mediaUrl) textToDisplay = '';
                const textHtml = textToDisplay ? `<div class="msg-text" style="word-break: break-word; color:${textColor}; font-size:15px; line-height:1.4;">${textToDisplay}</div>` : '';

                chatHTML += `
                    <div class="bubble ${type}" style="display:flex; flex-direction:column; max-width: 75%; position:relative; padding:10px 14px; ${bubbleRadius} margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.08); ${bgStyle}">
                        ${mediaHtml}
                        ${textHtml}
                        <div class="msg-time" style="align-self:flex-end; font-size:10px; color:${timeColor}; margin-top:4px; display:flex; align-items:center; gap:4px; font-weight:600;">
                            ${msgTime} ${isMe ? `<span style="color:${readColor}; font-weight:800;">${isRead}</span>` : ''}
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

    // ============================================================================
    // 9. PROFİL, ARKADAŞLARIM VE AYARLAR
    // ============================================================================

    window.renderProfile = function() {
        const u = window.userProfile;
        const initial = u.surname ? u.surname.charAt(0) + '.' : '';
        const isPremium = u.isPremium;
        
        let avatarHtml = u.avatarUrl 
            ? `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
                 <img src="${u.avatarUrl}" class="id-card-avatar" style="${isPremium ? 'border-color:#F59E0B;' : ''}">
                 <div style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
               </div>` 
            : `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
                 <div class="id-card-avatar" style="${isPremium ? 'border-color:#F59E0B;' : ''}">${u.avatar || '👤'}</div>
                 <div style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
               </div>`;

        let tagsHtml = '';
        if(u.interests && Array.isArray(u.interests)) {
            tagsHtml = u.interests.map(tag => `<span class="id-tag">${tag}</span>`).join('');
        }

        const premiumBadgeHtml = isPremium 
            ? `<div style="background:linear-gradient(135deg, #F59E0B, #D97706); color:white; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 4px rgba(245,158,11,0.3); margin-top:5px;">👑 Premium Üye</div>` 
            : ``;

        const friendsCount = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat).length;

        let html = `
            <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.openCropper(event, 'profile')">

            <div class="id-card ${isPremium ? 'premium-glow' : ''}" style="width:100%; max-width:100%; box-sizing:border-box; margin-top:10px; margin-bottom:15px; position:relative; ${isPremium ? 'border-color:#F59E0B;' : ''}">
                <button class="edit-profile-icon" style="position:absolute; top:15px; right:15px;" onclick="window.openProfileEditModal()">✏️ Düzenle</button>
                <div class="id-card-left">${avatarHtml}</div>
                <div class="id-card-right">
                    <div class="id-card-name">${u.name} ${initial}</div>
                    <div style="font-size:12px; color:#6B7280; margin-bottom:4px; font-weight:600;">${u.username ? u.username : '@kullanici_adi'}</div>
                    <div class="id-card-faculty">${u.faculty || 'Bölüm belirtilmemiş'} ${u.grade ? ' - ' + u.grade + '. Sınıf' : ''}</div>
                    <div class="id-card-details">
                        <span>🏫 ${u.university || 'UniLoop'}</span>
                        <span>🎂 ${u.age ? u.age + ' Yaşında' : 'Yaş belirtilmemiş'}</span>
                        ${premiumBadgeHtml}
                    </div>
                    <div class="id-card-tags">${tagsHtml}</div>
                </div>
            </div>

            <button class="btn-primary" style="width:100%; padding:14px; font-size:15px; border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; background:#EEF2FF; color:var(--primary); box-shadow:none; border:1px solid #C7D2FE; transition:0.2s;" onclick="window.openFriendsList()">
                <span style="font-size:20px;">👥</span> <strong>Arkadaşlarım (${friendsCount})</strong>
            </button>

            <div class="card" style="margin-bottom:15px;">
                <h3 style="font-size:15px; margin-bottom:10px; color:var(--text-dark); border-bottom:1px solid #E5E7EB; padding-bottom:8px;">İstatistiklerim</h3>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">
                    <div style="background:#F9FAFB; padding:15px 10px; border-radius:12px; border:1px solid #E5E7EB;">
                        <div style="font-size:20px; font-weight:800; color:var(--primary);">${confessionsDB.filter(c => c.authorId === u.uid).length}</div>
                        <div style="font-size:11px; color:var(--text-gray); margin-top:4px;">Gönderi</div>
                    </div>
                    <div style="background:#F9FAFB; padding:15px 10px; border-radius:12px; border:1px solid #E5E7EB;">
                        <div style="font-size:20px; font-weight:800; color:#10B981;">${marketDB.filter(m => m.sellerId === u.uid).length}</div>
                        <div style="font-size:11px; color:var(--text-gray); margin-top:4px;">Market İlanı</div>
                    </div>
                    <div style="background:#F9FAFB; padding:15px 10px; border-radius:12px; border:1px solid #E5E7EB;">
                        <div style="font-size:20px; font-weight:800; color:#F59E0B;">${friendsCount}</div>
                        <div style="font-size:11px; color:var(--text-gray); margin-top:4px;">Bağlantı</div>
                    </div>
                </div>
            </div>
            
            ${!isPremium ? `
            <div class="card premium-glow" style="margin-bottom:15px; background:linear-gradient(135deg, #FFFBEB, #FEF3C7); border-color:#FDE68A; cursor:pointer;" onclick="window.openPremiumModal()">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-weight:800; color:#D97706; font-size:16px; margin-bottom:4px;">🌟 UniLoop Premium'a Geç</div>
                        <div style="font-size:12px; color:#B45309;">Kampüsün en popüler kişisi ol, sınırları kaldır!</div>
                    </div>
                    <div style="font-size:24px;">👑</div>
                </div>
            </div>
            ` : ''}

            <button class="card" style="width:100%; padding:16px; margin-bottom:20px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:1px solid #E5E7EB; cursor:pointer; color:var(--text-dark); transition:transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.renderSettings()">
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
                    <button class="btn-primary" style="margin-top:15px; padding:10px 20px; border-radius:10px; font-size:13px;" onclick="window.closeModal(); window.loadPage('home')">Keşfetmeye Başla</button>
                </div>
            `);
            return;
        }

        let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">`;
        friends.forEach(f => {
            let avatarHtml = f.avatar && f.avatar.startsWith('http') 
                ? `<img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
                : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #E5E7EB;">${f.avatar || '👤'}</div>`;

            listHtml += `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:#fff; border:1px solid #E5E7EB; border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="window.viewUserProfile('${f.otherUid}')">
                        ${avatarHtml}
                        <span style="font-weight:700; font-size:14px; color:var(--text-dark);">${f.name}</span>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; box-shadow:none; background:#10B981; border-color:#10B981;" onclick="window.openChatViewDirect('${f.id}'); window.closeModal();">💬 Mesaj</button>
                    </div>
                </div>
            `;
        });
        listHtml += `</div>`;
        
        window.openModal(`👥 Arkadaşlarım (${friends.length})`, listHtml);
    };

    window.renderSettings = function() {
        const currentLang = localStorage.getItem('uniloop_lang') || 'tr';
        const currentTheme = localStorage.getItem('uniloop_theme') || 'light';

        window.openModal('⚙️ Ayarlar', `
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:13px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; display:block;">Dil Seçimi</label>
                    <select onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB;">
                        <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin:0;">
                    <label style="font-size:13px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; display:block;">Tema</label>
                    <select onchange="window.toggleTheme(this.value)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB;">
                        <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>☀️ Aydınlık Mod</option>
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 Karanlık Mod</option>
                    </select>
                </div>
                
                <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>
                
                <button class="btn-danger" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>
                
                <div style="text-align:center; font-size:11px; color:#9CA3AF; margin-top:10px;">
                    UniLoop v3.2.0 Pro<br>Made with ❤️ for Students
                </div>
            </div>
        `);
    };

    window.renderNotifications = function() {
        const notifBadgeTop = document.getElementById('notif-badge-top');
        if(notifBadgeTop) notifBadgeTop.style.display = 'none';

        let html = '<div class="notif-compact-panel">';
        let hasNotif = false;
        
        // 1. Bekleyen Arkadaşlık İstekleri
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

        // 2. Okunmamış Mesajlar ve Sistem Bildirimleri
        chatsDB.forEach(chat => {
            if (chat.status === 'accepted' || chat.isMarketChat) {
                if (chat.messages && chat.messages.length > 0) {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                        hasNotif = true;
                        
                        let msgPreview = lastMsg.text;
                        if(!msgPreview && lastMsg.mediaUrl) msgPreview = lastMsg.mediaType === 'pdf' ? '📄 PDF Belgesi' : '📷 Fotoğraf';
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

    // ============================================================================
    // 10. ROUTING (SAYFA YÖNLENDİRME)
    // ============================================================================
    window.loadPage = function(page) {
        document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
        const targetNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
        if(targetNav) targetNav.classList.add('active');

        // Reset scroll states
        window.scrollTo(0, 0);
        document.body.classList.remove('no-scroll-messages');
        if (currentGroupUnsubscribe) { currentGroupUnsubscribe(); currentGroupUnsubscribe = null; }

        switch(page) {
            case 'home':
                window.renderHome();
                break;
            case 'confessions':
                window.drawConfessionsFeed();
                break;
            case 'market':
                window.renderListings('market', '🛒 Kampüs Market');
                break;
            case 'messages':
                window.renderMessages();
                break;
            case 'profile':
                window.renderProfile();
                break;
            default:
                window.renderHome();
        }
    };
}

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', initializeUniLoop);

// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE (FIREBASE) 🌟
// 🌟 GÜNCELLENMİŞ EKSİKSİZ JS KODU - BÖLÜM 1 🌟
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
    uid: "", name: "", surname: "", username: "", email: "", university: "", avatar: "👨‍🎓", faculty: "", avatarUrl: "", age: "", gender: "", isPremium: false, grade: "", interests: [], purpose: "", joinedClassRoom: null, fastMatchCount: 0, fastMatchDate: "", fastMatchResetTime: 0, lockedArchiveFaculty: "", lockedArchiveGrade: "", lastArchiveResetYear: 0, blockedUsers: [], popularity: 0, lastTournamentDate: 0
};

// GLOBAL ARAYÜZ VE VERİTABANI DEĞİŞKENLERİ
let chatsDB = [];
let currentChatId = null;

// Eşleşme değişkenleri (Hızlı Eşleşme ve 12 Saatlik Sayaç İçin)
window.fastMatchUsers = [];
window.fastMatchCurrentIndex = 0;
window.fastMatchTimerInterval = null;

// GÖMÜLÜ KAMPÜS FREKANSI & WEBRTC GLOBAL DEĞİŞKENLERİ
window.freqTimerInterval = null;
window.freqAudioContext = null;
window.freqMicrophoneStream = null;
window.currentVoiceMatch = null; 
window.lastMatchedUid = null;
window.peerConnection = null;
window.localStream = null;
window.callDocId = null;
window.callUnsubscribe = null;
window.iceUnsubscribe = null;

// Popülerlik Savaşı Global Değişkeni
window.tData = { 
    bracket: [], winners: [], currentMatch: 0, stage: 'none', 
    semiLosers: [], finalists: [], finalWinner: null, secondPlace: null, thirdPlace: null 
};

window.homeSliderInterval = null; 
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

    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; background-color: #f3f4f6; color: #111827; }
        header, #app-header { height: 50px !important; box-sizing: border-box; }
        .edit-profile-icon { font-size: 14px; background: #EEF2FF; color: var(--primary); padding: 5px 10px; border-radius: 8px; border: 1px solid #C7D2FE; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 700; transition: 0.2s; }
        .edit-profile-icon:hover { background: #DBEAFE; }
        body.no-scroll-messages, body.no-scroll-home { overflow: hidden !important; position: fixed; width: 100%; height: 100%; }
        #main-content { padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important; }
        .no-scroll-messages #main-content, .no-scroll-home #main-content { position: fixed !important; top: 50px !important; bottom: calc(75px + env(safe-area-inset-bottom)) !important; left: 0 !important; right: 0 !important; padding: 0 !important; margin: 0 !important; height: auto !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; z-index: 40; }
        .hidden { display: none !important; }
        #chat-layout-container { position: relative !important; width: 100% !important; height: 100% !important; display: flex; flex-direction: row; background: #fff; flex: 1; overflow: hidden; }
        .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; background: #f9fafb; position:relative; }
        #chat-messages-scroll { flex: 1 1 auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding: 15px; display:flex; flex-direction:column; }
        .chat-input-area { flex: 0 0 auto !important; background: white; border-top: 1px solid #E5E7EB; padding: 10px 15px !important; z-index: 50; position: relative; }
        #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; transition: opacity 0.3s ease; }
        #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; transition: opacity 0.3s ease;}
        #auth-screen { position: relative; z-index: 1000 !important; display: none; }
        #auth-screen.active { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        #sidebar, #mobile-menu-btn { display: none !important; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; border-top: 1px solid #f1f1f1; display: flex; justify-content: space-around; align-items: center; height: calc(60px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); box-sizing: border-box; z-index: 99999; box-shadow: 0 -2px 10px rgba(0,0,0,0.02); }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8E8E93; font-size: 10px; text-decoration: none; cursor: pointer; transition: 0.2s; flex: 1; background: transparent !important; border: none !important; font-weight: 500; height: 60px; padding: 0; }
        .bottom-nav-item.active { color: #6366f1 !important; font-weight: 600; }
        .bottom-nav-icon { width: 22px; height: 22px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
        .bottom-nav-icon svg { width: 100%; height: 100%; transition: 0.2s; }
        .bottom-nav-item.active .bottom-nav-icon svg.fill-active { fill: currentColor; }
        .tour-grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width:100%; max-width:400px; margin: 0 auto; }
        .tour-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width:100%; max-width:400px; align-items:center; margin: 0 auto; padding-top:20px; }
        .tour-card { background: #fff; border-radius:16px; overflow:hidden; position:relative; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.08); transition:all 0.15s ease-out; aspect-ratio: 1; display:flex; flex-direction:column; border:3px solid transparent; }
        .tour-card:active { transform: scale(0.95) !important; border-color: #6366f1 !important; box-shadow:0 8px 20px rgba(99, 102, 241, 0.3) !important; }
        .tour-card-img { width: 100%; height: 100%; object-fit: cover; }
        .tour-card-name { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent); color:white; padding: 30px 10px 10px 10px; font-size:14px; font-weight:800; text-align:center; pointer-events: none;}
        .stepper-container { background: #fff; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 400px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .id-card { background: linear-gradient(135deg, #ffffff, #f8fafc); border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); width: 100%; margin: 0 auto 20px auto; position: relative; overflow: hidden; }
        .id-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, var(--primary), #818cf8); }
        .notif-compact-panel { max-height: 400px; overflow-y: auto; padding-right: 5px; scroll-behavior: smooth; }
        .notif-compact-item { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex-wrap: wrap; gap: 10px; transition: transform 0.2s; }
        .cropper-modal-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 999999; display: none; flex-direction: column; pointer-events: auto !important;}
        .cropper-modal-container.active { display: flex; }
        .chat-sidebar { width: 320px; overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; border-right: 1px solid #e5e7eb; }
        .bubble { position: relative; max-width: 75%; padding: 10px 14px; border-radius: 16px; margin-bottom: 8px; font-size: 15px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.1); width: fit-content; }
        .bubble.sent { align-self: flex-end; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-bottom-right-radius: 4px; }
        .bubble.received { align-self: flex-start; background: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; }
        #app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
        #notif-btn-top { position: relative; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; background: #F3F4F6; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
        @media (max-width: 1024px) {
            .chat-sidebar { width: 100%; display: block; border-right: none; }
            .chat-active .chat-sidebar { display: none !important; }
            .chat-main { display: none !important; }
            .chat-active .chat-main { display: flex !important; }
        }
        .home-slider::-webkit-scrollbar { display: none; }
        .home-slider { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(styleFix);

    // TEMEL UI VE MODAL FONKSİYONLARI
    window.setLanguage = function(lang) {
        localStorage.setItem('uniloop_lang', lang);
        window.renderSettings(); 
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
            e.preventDefault(); window.closeModal(); return;
        }

        if (isTarget('show-login-btn')) {
            e.preventDefault();
            document.getElementById('login-card').style.display = 'block';
            document.getElementById('register-card').style.display = 'none';
            if (document.getElementById('stepper-wrapper')) document.getElementById('stepper-wrapper').remove();
        }
        else if (isTarget('show-register-btn')) {
            e.preventDefault();
            document.getElementById('login-card').style.display = 'none';
            document.getElementById('register-card').style.display = 'none';
            startRegistrationStepper(1);
        }
        else if (isTarget('login-btn')) {
            e.preventDefault(); 
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const btn = e.target.closest('#login-btn') || e.target;

            if(!email || !password) return alert("Lütfen e-posta ve şifrenizi girin.");

            btn.innerText = "Giriş Yapılıyor..."; btn.disabled = true;
            try {
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                if(!userCred.user.emailVerified) {
                    alert("Hesabınız henüz onaylanmamış. Lütfen e-postanızı kontrol edin.");
                    btn.innerText = "Giriş Yap"; btn.disabled = false;
                    return;
                }
            } catch (error) {
                alert("Giriş başarısız! E-posta veya şifreniz yanlış.");
                btn.innerText = "Giriş Yap"; btn.disabled = false;
            } 
        }
        else if (isTarget('forgot-password-btn')) {
            e.preventDefault();
            const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
            if(!email) return;
            try { await sendPasswordResetEmail(auth, email); alert("Şifre sıfırlama bağlantısı gönderildi!"); } 
            catch (error) { alert("Hata: " + error.message); }
        }
    });

    // KAYIT SİSTEMİ (STEPPER)
    function startRegistrationStepper(startStep = 1) {
        window.registrationData = { interests: [] };
        let container = document.getElementById('stepper-wrapper');
        if(!container) {
            container = document.createElement('div');
            container.id = 'stepper-wrapper';
            container.className = 'stepper-container';
            const authContainer = document.getElementById('auth-screen');
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
                <input type="email" id="reg-email" placeholder="E-posta Adresin" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                <input type="password" id="reg-password" placeholder="Şifre Belirle" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                <input type="password" id="reg-password-confirm" placeholder="Şifreni Tekrar Gir" style="margin-bottom:20px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                <button id="step1-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(1)">Kayıt Ol ve Doğrulama Kodu Gönder</button>
                <p style="text-align:center; margin-top:15px; font-size:13px;"><a href="#" style="color:var(--primary); text-decoration:none; font-weight:bold;" onclick="document.getElementById('stepper-wrapper').remove(); document.getElementById('login-card').style.display='block';">Giriş Ekranına Dön</a></p>
            `;
        } else if (step === 2) {
            html = `
                <div class="step-header">Adım 2 / 6</div>
                <div class="step-title">E-postanı Doğrula 📩</div>
                <p style="text-align:center; font-size:14px; margin-bottom:20px;"><b>${window.registrationData.email || 'E-posta adresine'}</b> bir doğrulama bağlantısı gönderdik.</p>
                <button id="step2-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px; background:#10B981; border-color:#10B981;" onclick="window.processStep(2)">Doğruladım, Devam Et →</button>
            `;
        } else if (step === 3) {
            let facOptions = allFaculties.map(f => `<option value="${f}">${f}</option>`).join('');
            html = `
                <div class="step-header">Adım 3 / 6</div>
                <div class="step-title">Seni Tanıyalım 🎓</div>
                <input type="text" id="reg-username" placeholder="Kullanıcı Adı Belirle (Örn: mutlucocuk)" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid var(--primary); outline:none; font-size:15px; background:#EEF2FF;">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" id="reg-name" placeholder="Adın" style="flex:1; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                    <input type="text" id="reg-surname" placeholder="Soyadın" style="flex:1; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                </div>
                <input type="number" id="reg-age" placeholder="Yaşın" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; outline:none; font-size:15px;">
                <select id="reg-gender" style="margin-bottom:10px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; background:#fff; outline:none; font-size:15px;">
                    <option value="">Cinsiyetiniz</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option>
                </select>
                <select id="reg-faculty" style="margin-bottom:15px; width:100%; padding:14px; border-radius:12px; border:1px solid #ccc; background:#F3F4F6; outline:none; font-size:15px;">
                    <option value="">Hangi Fakültedesin?</option>${facOptions}
                </select>
                <div style="margin-bottom: 20px; text-align:center;">
                    <p style="font-size:14px; font-weight:bold; margin-bottom:10px;">Kaçıncı Sınıfsın?</p>
                    ${[1, 2, 3, 4, 5, 6].map(g => `<button class="grade-btn" onclick="window.selectGrade(this, '${g}')">${g}. Sınıf</button>`).join('')}
                </div>
                <button id="step3-btn" class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(3)">Devam Et →</button>
            `;
        } else if (step === 4) {
            const interests = ['🎵 Müzik', '⚽ Spor', '📚 Kitap', '🎮 Oyun', '✈️ Seyahat', '🎨 Sanat', '💻 Yazılım', '☕ Kahve', '🎬 Sinema', '🧘‍♀️ Yoga', '🍕 Yemek', '📸 Fotoğraf'];
            html = `
                <div class="step-header">Adım 4 / 6</div>
                <div class="step-title">İlgi Alanların Neler? 🎯</div>
                <div style="text-align:center; margin-bottom: 20px;">
                    ${interests.map(i => `<button class="interest-btn" onclick="window.toggleInterest(this, '${i}')">${i}</button>`).join('')}
                </div>
                <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:12px;" onclick="window.processStep(4)">Devam Et →</button>
            `;
        } else if (step === 5) {
            const purposes = ['👋 Sosyalleşmek İstiyorum', '👥 Yeni Arkadaşlar Arıyorum', '📚 Ders Çalışma Arkadaşı', '❤️ Belki Bir Randevu'];
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
                <div style="display:flex; justify-content:center; margin-bottom: 30px;">
                    <div style="position:relative; cursor:pointer; display:inline-block;" onclick="document.getElementById('final-avatar-upload').click()">
                        <div id="preview-pc-avatar-container" class="id-card-avatar" style="width:130px; height:130px; border-radius:50%; border:4px solid var(--primary); overflow:hidden;">👤</div>
                        <div style="position:absolute; bottom:0; right:0; background:var(--primary); color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:16px; border:3px solid white; z-index:10;">📷</div>
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
        btn.classList.add('active'); window.registrationData.grade = grade;
    };

    window.toggleInterest = function(btn, interest) {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) { if(!window.registrationData.interests.includes(interest)) window.registrationData.interests.push(interest); } 
        else { window.registrationData.interests = window.registrationData.interests.filter(i => i !== interest); }
    };

    window.selectPurpose = function(btn, purpose) {
        document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); window.registrationData.purpose = purpose;
    };

    window.processStep = async function(step) {
        if (step === 1) {
            const e = document.getElementById('reg-email').value.trim();
            const p = document.getElementById('reg-password').value;
            const pConf = document.getElementById('reg-password-confirm').value;
            if(!e || !p || !pConf) return alert("E-posta ve şifre zorunludur.");
            if(p !== pConf) return alert("Şifreler eşleşmiyor.");
            
            const btn = document.getElementById('step1-btn'); btn.innerText = "İşleniyor..."; btn.disabled = true;
            try {
                const userCred = await createUserWithEmailAndPassword(auth, e, p);
                await sendEmailVerification(userCred.user);
                window.registrationData.email = e;
                window.registrationData.uid = userCred.user.uid;
                window.renderStep(2);
            } catch (error) { alert("Hata: " + error.message); btn.innerText = "Devam Et"; btn.disabled = false; }
        } else if (step === 2) {
            const btn = document.getElementById('step2-btn'); btn.innerText = "Kontrol Ediliyor..."; btn.disabled = true;
            try {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) { window.renderStep(3); } 
                else { alert("Henüz doğrulanmamış."); btn.innerText = "Doğruladım, Devam Et →"; btn.disabled = false; }
            } catch (error) { alert("Hata: " + error.message); btn.innerText = "Doğruladım, Devam Et →"; btn.disabled = false; }
        } else if (step === 3) {
            const uInput = document.getElementById('reg-username').value.trim().toLowerCase().replace(/\s+/g, '');
            const n = document.getElementById('reg-name').value.trim();
            const s = document.getElementById('reg-surname').value.trim();
            const a = document.getElementById('reg-age').value.trim();
            const f = document.getElementById('reg-faculty').value;
            const g = document.getElementById('reg-gender').value;
            
            if(!uInput || !n || !s || !a || !f || !g || !window.registrationData.grade) return alert("Tüm alanları doldurun.");
            
            const finalUsername = '#' + uInput;
            const btn = document.getElementById('step3-btn'); btn.innerText = "Kontrol Ediliyor..."; btn.disabled = true;
            
            try {
                const q = query(collection(db, "users"), where("username", "==", finalUsername), limit(1));
                const snap = await getDocs(q);
                if(!snap.empty) { alert("Bu kullanıcı adı alınmış."); btn.innerText = "Devam Et →"; btn.disabled = false; return; }
            } catch(e) { console.error(e); }

            window.registrationData = { ...window.registrationData, username: finalUsername, name: n, surname: s, age: a, faculty: f, gender: g };
            window.renderStep(4);
        } else if (step === 4) {
            if(window.registrationData.interests.length < 2) return alert("En az 2 ilgi alanı seçin.");
            window.renderStep(5);
        } else if (step === 5) {
            if(!window.registrationData.purpose) return alert("Amacınızı seçin.");
            window.renderStep(6);
        }
    };

    window.finalizeRegistration = async function() {
        const btn = document.getElementById('final-register-btn');
        btn.innerText = "Kimliğiniz Oluşturuluyor... ⏳"; btn.disabled = true;
        const d = window.registrationData;
        const user = auth.currentUser;
        let finalAvatarUrl = "";

        try {
            if (d.avatarDataUrl) {
                const storageRef = ref(storage, 'avatars/' + user.uid + '_avatar_' + Date.now() + '.jpg');
                await uploadString(storageRef, d.avatarDataUrl, 'data_url');
                finalAvatarUrl = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid, name: d.name, surname: d.surname, username: d.username, email: d.email, 
                university: "UniLoop Kampüsü", faculty: d.faculty, grade: d.grade, age: d.age, gender: d.gender,
                interests: d.interests, purpose: d.purpose, avatar: "👨‍🎓", avatarUrl: finalAvatarUrl, 
                isOnline: true, isPremium: false, fastMatchCount: 0, fastMatchDate: new Date().toLocaleDateString(), fastMatchResetTime: 0,
                lockedArchiveFaculty: "", lockedArchiveGrade: "", lastArchiveResetYear: new Date().getFullYear(),
                profileViewers: [], joinedClassRoom: null, blockedUsers: [], popularity: 0, lastTournamentDate: 0
            });

            alert("Profilin başarıyla oluşturuldu.");
            window.location.reload(); 
        } catch (error) {
            alert("Hata: " + error.message);
            btn.innerText = "Profili Tamamla"; btn.disabled = false;
        }
    };

    // OTURUM YÖNETİMİ VE NAVİGASYON BAŞLATICI
    onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) { 
            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                
                if(!docSnap.exists()) {
                    if(authScreen) { authScreen.style.display = 'flex'; authScreen.classList.add('active'); }
                    if(appScreen) appScreen.style.display = 'none';
                    if(document.getElementById('login-card')) document.getElementById('login-card').style.display = 'none';
                    window.registrationData.email = user.email;
                    startRegistrationStepper(3); return; 
                }

                if(authScreen) { authScreen.style.display = 'none'; authScreen.classList.remove('active'); }
                if(appScreen) appScreen.style.display = 'block';

                window.userProfile = docSnap.data();
                if(window.userProfile.fastMatchResetTime === undefined) window.userProfile.fastMatchResetTime = 0;
                await updateDoc(userDocRef, { isOnline: true });
                
                const headerRightMenu = document.querySelector('.header-right-menu');
                if (headerRightMenu) {
                    headerRightMenu.innerHTML = ''; 
                    if (!window.userProfile.isPremium) {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer;" onclick="window.openPremiumModal()">☆ Premium</div>`);
                    } else {
                        headerRightMenu.insertAdjacentHTML('beforeend', `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer;" onclick="window.openPremiumFeaturesModal()">☆ Ayrıcalıklar</div>`);
                    }
                    headerRightMenu.insertAdjacentHTML('beforeend', `<div id="notif-btn-top" onclick="window.renderNotifications()" title="Bildirimler" style="background:white; border:1px solid #111827; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer;"><svg viewBox="0 0 24 24" width="18" height="18" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg><span id="notif-badge-top" style="display:none; position:absolute; top:-4px; right:-4px; background:#EF4444; color:white; border-radius:50%; width:16px; height:16px; font-size:10px; align-items:center; justify-content:center; font-weight:bold; border:2px solid white;">0</span></div>`);
                }

                if (!document.getElementById('uniloop-bottom-nav')) {
                    const bottomNav = document.createElement('div');
                    bottomNav.id = 'uniloop-bottom-nav'; bottomNav.className = 'bottom-nav';
                    bottomNav.innerHTML = `
                        <div class="menu-item bottom-nav-item active" data-target="home" onclick="window.loadPage('home')"><div class="bottom-nav-icon"><svg class="fill-active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div><span>Ana Sayfa</span></div>
                        <div class="menu-item bottom-nav-item" data-target="voice" onclick="window.loadPage('voice')"><div class="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></div><span>Frekans</span></div>
                        <div class="menu-item bottom-nav-item" data-target="popularity" onclick="window.loadPage('popularity')"><div class="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg></div><span>Savaş</span></div>
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
            if(logCard) logCard.style.display = 'block';
        }
    });

    // SOHBET DİNLEYİCİSİ (MARKET VE İTİRAFLAR SİLİNDİ, SADECE CHAT KALDI)
    function initRealtimeListeners(currentUid) {
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
                        initiator: data.initiator || null, lastUpdatedTS: safeTimestamp
                    };
                    chatsDB.push(chatItem);

                    if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) { pendingRequestsCount++; } 
                    else if (chatItem.status === 'accepted') {
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
                if (currentChatId) {
                    window.renderMessagesSidebarOnly();
                    window.updateChatMessagesOnly(currentChatId);
                } else { window.renderMessages(); }
            } else if (activeTab && activeTab.getAttribute('data-target') === 'profile') {
                window.renderProfile();
            }
        });
    }

// ============================================================================
// 🌟 JS BÖLÜM 1 SONU 🌟
// ============================================================================
// ============================================================================
// 🌟 GÜNCELLENMİŞ EKSİKSİZ JS KODU - BÖLÜM 2 🌟
// ============================================================================

    window.uploadChatMedia = async function(event, targetId) {
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

    // PREMIUM VE ARŞİV İŞLEMLERİ
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
                    <li>📚 <b>${fac} ${grade}</b> çıkmış sorularına anında erişim!</li>
                    <li>🎙️ <b>Kampüs Frekansı</b> sohbetlerinde 30 Dakika konuşma süresi!</li>
                    <li>🔥 <b>Günlük 30 Adet</b> Hızlı Eşleşme hakkı.</li>
                    <li>🕵️ <b>Kimler Profilime Baktı?</b> Seni görüntüleyen gizli hayranlarını gör.</li>
                </ul>
                <button id="buy-premium-btn" onclick="window.upgradeToPremium()" style="width:100%; justify-content:center; padding: 16px; font-size: 16px; background:linear-gradient(135deg, #111827, #374151); color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.3); transition:0.2s;" class="premium-glow">
                    💳 Güvenli Ödeme İle Satın Al
                </button>
            </div>
        `);
    };

    window.upgradeToPremium = async function() {
        const btn = document.getElementById('buy-premium-btn');
        btn.innerText = '⏳ Ödeme İşleniyor...'; btn.disabled = true;
        setTimeout(async () => {
            try {
                await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: true });
                window.userProfile.isPremium = true;
                window.closeModal();
                alert("🎉 Tebrikler! UniLoop Premium ayrıcalıklarına sahipsiniz!");
                window.loadPage('home'); 
            } catch(e) { alert("Hata oluştu."); btn.innerText = 'Güvenli Ödeme'; btn.disabled = false; }
        }, 2000);
    };

    window.cancelPremium = async function() {
        if(confirm("Premium üyeliğinizi iptal etmek istediğinize emin misiniz?")) {
            try {
                await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: false });
                window.userProfile.isPremium = false;
                alert("Premium üyeliğiniz başarıyla iptal edildi.");
                window.closeModal(); window.renderSettings();
            } catch(e) { alert("Hata oluştu: " + e.message); }
        }
    };

    window.openPremiumFeaturesModal = async function() {
        try {
            const userDoc = await getDoc(doc(db, "users", window.userProfile.uid));
            const viewers = userDoc.exists() ? (userDoc.data().profileViewers || []) : [];
            
            let viewersHtml = '';
            if(viewers.length > 0) {
                const uniqueViewers = []; const seen = new Set();
                for(let i = viewers.length - 1; i >= 0; i--){
                    if(!seen.has(viewers[i].uid)){ seen.add(viewers[i].uid); uniqueViewers.push(viewers[i]); }
                }
                viewersHtml = uniqueViewers.map(v => `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:#fff; border-radius:10px; margin-bottom:8px; border:1px solid #E5E7EB; cursor:pointer;" onclick="window.viewUserProfile('${v.uid}')">
                        <div style="display:flex; align-items:center; gap:10px;"><span style="font-size:20px;">👀</span><span style="font-weight:bold; font-size:14px; color:var(--text-dark);">${v.name}</span></div>
                        <div style="font-size:11px; color:var(--text-gray);">${v.time}</div>
                    </div>
                `).join('');
            } else { viewersHtml = '<div style="font-size:13px; color:var(--text-gray); text-align:center; padding:10px;">Henüz kimse profilinize bakmadı.</div>'; }

            window.openModal('🌟 Premium Özellikler Merkezi', `
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div class="card" style="background:#F9FAFB; border:1px solid #111827; padding:20px; border-radius:12px;">
                        <h4 style="color:#111827; margin-bottom:12px; font-size:15px; display:flex; align-items:center; gap:5px;"><span>🕵️</span> Kimler Profilime Baktı?</h4>
                        <div style="max-height:200px; overflow-y:auto; padding-right:5px;">${viewersHtml}</div>
                    </div>
                </div>
            `);
        } catch(e) { console.error(e); }
    };

    // =========================================================================
    // 🌟 12 SAATLİK SAYAÇLI HIZLI EŞLEŞME ANA SAYFASI 🌟
    // =========================================================================

    window.toggleHomeSearch = function() {
        const searchContainer = document.getElementById('home-search-container');
        const defaultView = document.getElementById('home-default-view');
        const inputField = document.getElementById('home-friend-search-input');

        if(searchContainer.classList.contains('hidden')) {
            searchContainer.classList.remove('hidden');
            if(defaultView) defaultView.style.display = 'none'; 
            if(inputField) { inputField.style.display = 'block'; setTimeout(() => inputField.focus(), 100); }
        } else {
            searchContainer.classList.add('hidden');
            if(defaultView) defaultView.style.display = 'flex';
            if(inputField) inputField.blur();
        }
    };

    window.renderHome = async function() {
        document.body.classList.add('no-scroll-home');
        if(window.freqTimerInterval) clearInterval(window.freqTimerInterval);
        window.endWebRTCCall();

        let usernameWarning = '';
        if (!window.userProfile.username) {
            usernameWarning = `<div style="background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 12px; border: 1px solid #FCA5A5; margin-bottom: 6px; font-weight: bold; text-align: center; cursor:pointer; flex-shrink:0;" onclick="window.loadPage('profile')">⚠️ Lütfen profilinden bir kullanıcı adı belirle!</div>`;
        }

        let html = `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden; padding: 15px;">
                ${usernameWarning}
                
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; position:relative; background: white; padding: 15px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; flex-shrink:0;">
                    <div id="home-default-view" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <div>
                            <h2 style="font-size:18px; margin-bottom:4px; margin-top:0; color: var(--text-dark);">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
                            <p style="color: var(--text-gray); font-size:12px; margin:0;"><strong style="color:var(--primary);">${window.userProfile.university}</strong></p>
                        </div>
                        <div id="home-icons-container" style="display:flex; gap:15px; align-items:center;">
                            <div style="font-size:24px; cursor:pointer;" onclick="window.toggleHomeSearch()" title="Arkadaşını Bul">🔍</div>
                        </div>
                    </div>
                    <div id="home-search-container" class="hidden" style="position:absolute; left:0; top:0; width:100%; height:100%; z-index:20; display:flex; align-items:center; background:white; border-radius:16px; padding:0 15px; box-sizing:border-box;">
                            <span style="color:var(--primary); font-weight:800; font-size:16px; margin-right:5px;">#</span>
                            <input type="text" id="home-friend-search-input" style="border:none; background:transparent; width:100%; outline:none; font-size:15px; color:black;" placeholder="Kullanıcı adı arat..." onkeypress="if(event.key==='Enter') window.searchAndAddFriendHome()">
                            <button onclick="window.searchAndAddFriendHome()" style="background:transparent; border:none; font-size:20px; cursor:pointer;">➡️</button>
                            <button onclick="window.toggleHomeSearch()" style="background:transparent; border:none; font-size:20px; cursor:pointer; color:#EF4444; margin-left:10px;">✖</button>
                    </div>
                </div>

                <div id="embedded-fast-match-container" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;"></div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        window.initEmbeddedFastMatch();
    };

    window.searchAndAddFriendHome = async function() {
        const input = document.getElementById('home-friend-search-input');
        if(input) {
            const val = input.value;
            const fakeInput = document.createElement('input');
            fakeInput.id = 'friend-search-input'; fakeInput.value = val;
            document.body.appendChild(fakeInput);
            await window.searchAndAddFriend();
            fakeInput.remove(); input.value = '';
            window.toggleHomeSearch();
        }
    };

    window.searchAndAddFriend = async function() {
        try {
            const searchInput = document.getElementById('friend-search-input');
            if(!searchInput) return;
            let rawSearch = searchInput.value.trim().toLowerCase();
            if(!rawSearch) return alert("Lütfen bir kullanıcı adı yazın.");
            if (!window.userProfile.username) return alert("Önce profilinizden kullanıcı adı belirleyin!");

            rawSearch = rawSearch.replace(/^#/, '');
            const searchVal = '#' + rawSearch;
            if(searchVal === window.userProfile.username) return alert("Kendinize istek gönderemezsiniz :)");

            const q = query(collection(db, "users"), where("username", "==", searchVal));
            const snapshot = await getDocs(q);
            
            if(snapshot.empty) { alert("Bu kullanıcı adına sahip kimse bulunamadı!"); } 
            else {
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
        } catch (error) { alert("Arama sırasında hata oluştu: " + error.message); }
    };

    window.sendFriendRequest = async function(targetUserId, targetUserName, isFastMatch = false) {
        try {
            const myUid = window.userProfile.uid;
            const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
            const snap = await getDocs(q);
            
            let existingChat = null;
            snap.forEach(doc => { if (doc.data().participants && doc.data().participants.includes(targetUserId)) { existingChat = { id: doc.id, ...doc.data() }; } });

            if(!existingChat) {
                await addDoc(collection(db, "chats"), {
                    participants: [myUid, targetUserId],
                    participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                    participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                    lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid, messages: [] 
                });
                if(!isFastMatch) alert("✅ Arkadaşlık isteği başarıyla gönderildi!");
            } else {
                if(!isFastMatch) {
                    if(existingChat.status === 'pending') alert("Zaten bir arkadaşlık isteği mevcut.");
                    else alert("Bu kişiyle zaten arkadaşsınız.");
                }
            }
        } catch (error) { if(!isFastMatch) alert("Hata oluştu."); }
    };

    // 12 SAAT MANTIĞI VE HIZLI EŞLEŞME
    window.initEmbeddedFastMatch = async function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;
        let count = window.userProfile.fastMatchCount || 0;
        let resetTime = window.userProfile.fastMatchResetTime || 0;
        const now = Date.now();

        if (count >= maxSwipes) {
            if (resetTime > 0 && now >= resetTime) {
                count = 0;
                window.userProfile.fastMatchCount = 0;
                window.userProfile.fastMatchResetTime = 0;
                await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: 0, fastMatchResetTime: 0 });
            } else {
                if (resetTime === 0) {
                    resetTime = now + (12 * 60 * 60 * 1000); 
                    window.userProfile.fastMatchResetTime = resetTime;
                    await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchResetTime: resetTime });
                }

                container.innerHTML = `
                    <div style="background:white; border-radius:24px; padding:40px 20px; text-align:center; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.05); border: 1px solid var(--border-color);">
                        <div style="font-size:60px; margin-bottom:20px; filter: grayscale(100%); opacity: 0.7;">⏳</div>
                        <h2 style="color:var(--text-dark); margin-bottom:10px; font-size:22px;">Hakkın Doldu!</h2>
                        <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px; line-height: 1.5;">Kampüste kaydıracak kimse kalmadı veya limitine ulaştın. Yeni eşleşmeler için biraz beklemen gerekiyor.</p>
                        
                        <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:16px; padding:15px; margin-bottom:20px;">
                            <span style="font-size:12px; color:var(--text-gray); text-transform:uppercase; font-weight:bold; letter-spacing:1px; display:block; margin-bottom:5px;">Yenilenme Süresi</span>
                            <div id="fast-match-countdown" style="font-size:24px; font-weight:900; color:var(--primary); font-family:monospace;">--:--:--</div>
                        </div>
                        
                        ${!window.userProfile.isPremium ? `<button onclick="window.openPremiumModal()" style="background:linear-gradient(135deg, #111827, #374151); color:white; border:none; border-radius:12px; padding:14px; font-size:15px; font-weight:bold; width:100%; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.2);">👑 Premium ile Limiti Artır</button>` : ''}
                    </div>
                `;

                if (window.fastMatchTimerInterval) clearInterval(window.fastMatchTimerInterval);
                window.fastMatchTimerInterval = setInterval(() => {
                    const timerEl = document.getElementById('fast-match-countdown');
                    if (timerEl) {
                        let diff = resetTime - Date.now();
                        if (diff <= 0) {
                            clearInterval(window.fastMatchTimerInterval);
                            window.initEmbeddedFastMatch();
                        } else {
                            const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                            const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                            timerEl.innerText = `${h}:${m}:${s}`;
                        }
                    }
                }, 1000);
                return;
            }
        }

        container.innerHTML = `<div style="text-align:center; padding:10px;"><div style="font-size:40px; animation: glowPulse 1.5s infinite alternate; margin-bottom:15px;">🔍</div><h3 style="color:var(--text-gray);">Kampüste birileri aranıyor...</h3></div>`;

        try {
            const querySnapshot = await getDocs(query(collection(db, "users"), limit(50)));
            const interactedUids = chatsDB.map(c => c.otherUid);
            window.fastMatchUsers = [];

            querySnapshot.forEach((doc) => {
                const u = doc.data();
                if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid)) window.fastMatchUsers.push(u);
            });

            if(window.fastMatchUsers.length === 0) {
                 container.innerHTML = `
                    <div style="padding:40px 20px; text-align:center; background:white; border-radius:24px; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.05); border:1px solid var(--border-color);">
                        <div style="font-size:50px; margin-bottom:15px;">🌟</div>
                        <h3 style="color:var(--text-dark); margin-bottom:10px;">Şu an kimse yok!</h3>
                        <p style="color:var(--text-gray); font-size:14px;">Ağda karşılaşacak kimse kalmadı. Lütfen daha sonra tekrar kontrol et.</p>
                    </div>
                `;
                return;
            }

            window.fastMatchUsers = window.fastMatchUsers.sort(() => 0.5 - Math.random());
            window.fastMatchCurrentIndex = 0;
            window.renderEmbeddedFastMatchCard();
        } catch(e) { container.innerHTML = '<p style="color:red;">Hata oluştu.</p>'; }
    };

    window.renderEmbeddedFastMatchCard = function() {
        const container = document.getElementById('embedded-fast-match-container');
        if(!container) return;

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;

        if(window.fastMatchCurrentIndex >= window.fastMatchUsers.length) {
            window.fastMatchUsers = window.fastMatchUsers.sort(() => 0.5 - Math.random());
            window.fastMatchCurrentIndex = 0;
        }

        const u = window.fastMatchUsers[window.fastMatchCurrentIndex];
        const initial = u.surname ? u.surname.charAt(0) + '.' : '';
        const premiumIcon = u.isPremium ? '<span style="font-size:18px; margin-left:6px; text-shadow:0 1px 2px rgba(0,0,0,0.5);">👑</span>' : '';
        
        let avatarHtml = u.avatarUrl 
            ? `<img src="${u.avatarUrl}" style="width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;">` 
            : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); display:flex; align-items:center; justify-content:center; font-size:80px; pointer-events:none;">${u.avatar || '👤'}</div>`;

        let tagsHtml = '';
        if(u.interests && Array.isArray(u.interests)) {
            tagsHtml = u.interests.slice(0, 3).map(tag => `<span style="font-size:11px; background:rgba(255,255,255,0.25); color:white; padding:4px 10px; border-radius:12px; font-weight:700; margin-right:4px; margin-bottom:4px; backdrop-filter:blur(5px); display:inline-block; border:1px solid rgba(255,255,255,0.3);">${tag}</span>`).join('');
        }

        let remaining = maxSwipes - window.userProfile.fastMatchCount;
        let headerText = window.userProfile.isPremium ? `<span style="color:#111827; font-size:12px; font-weight:bold; background:white; padding:6px 14px; border-radius:12px; margin-bottom:15px; display:inline-block; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.05);">Kalan Hakkın: ${remaining} / 30 (Premium)</span>` : `<span style="color:#EF4444; font-size:12px; font-weight:bold; background:#FEF2F2; padding:6px 14px; border-radius:12px; margin-bottom:15px; display:inline-block; border:1px solid #FCA5A5;">Kalan Hakkın: ${remaining} / 10</span>`;

        container.innerHTML = `
            ${headerText}
            <div id="swipe-card" class="swipe-card">
                <div class="swipe-card-img-wrapper">${avatarHtml}</div>
                <div style="position:absolute; bottom:0; left:0; right:0; padding:40px 15px 45px 15px; background:linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%); z-index:2; text-align:left; border-bottom-left-radius:20px; border-bottom-right-radius:20px; pointer-events:none;">
                    <h2 style="margin:0 0 6px 0; color:white; font-size:22px; display:flex; align-items:center; text-shadow:0 2px 4px rgba(0,0,0,0.6);">${u.name} ${initial} ${u.age ? `<span style="font-weight:normal; margin-left:8px; font-size:18px; opacity:0.9;">${u.age}</span>` : ''} ${premiumIcon}</h2>
                    <div style="font-size:13px; color:#e2e8f0; font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:4px; text-shadow:0 1px 2px rgba(0,0,0,0.5);"><span style="font-size:15px;">🏛️</span> ${u.faculty || 'Kampüs Öğrencisi'}</div>
                    <div style="display:flex; flex-wrap:wrap; margin-bottom:0;">${tagsHtml}</div>
                </div>
                <div style="position:absolute; bottom:-28px; left:0; right:0; display:flex; justify-content:center; gap:25px; z-index:10;">
                    <button onclick="window.handleSwipe('left')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#EF4444; font-size:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(239,68,68,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">✖</button>
                    <button onclick="window.handleSwipe('right')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#10B981; font-size:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(16,185,129,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">❤</button>
                </div>
            </div>
        `;
    };

    window.handleSwipe = async function(direction) {
        const card = document.getElementById('swipe-card');
        if(!card) return;

        window.userProfile.fastMatchCount += 1;
        try { await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: window.userProfile.fastMatchCount }); } catch(e) {}

        let maxSwipes = window.userProfile.isPremium ? 30 : 10;

        if(direction === 'left') {
            card.style.transform = 'translateX(-200px) rotate(-20deg)'; card.style.opacity = '0';
            setTimeout(() => {
                window.fastMatchCurrentIndex++;
                if (window.userProfile.fastMatchCount >= maxSwipes) { window.initEmbeddedFastMatch(); } else { window.renderEmbeddedFastMatchCard(); }
            }, 300);
        } else if (direction === 'right') {
            card.style.transform = 'translateX(200px) rotate(20deg)'; card.style.opacity = '0';
            const u = window.fastMatchUsers[window.fastMatchCurrentIndex];
            window.sendFriendRequest(u.uid, `${u.name} ${u.surname ? u.surname : ''}`, true);
            setTimeout(() => {
                window.fastMatchCurrentIndex++;
                if (window.userProfile.fastMatchCount >= maxSwipes) { window.initEmbeddedFastMatch(); } else { window.renderEmbeddedFastMatchCard(); }
            }, 300);
        }
    };

    // =========================================================================
    // 🌟 KAMPÜS FREKANSI (SESLİ SOHBET) SEKMESİ 🌟
    // =========================================================================
    let voiceSearchTimeout = null;
    let voiceQueueUnsubscribe = null;
    window.callRole = null; 

    const rtcConfig = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };

    window.renderVoice = function() {
        document.body.classList.add('no-scroll-home');
        if(!document.getElementById('remote-audio-node')) {
            const audioNode = document.createElement('audio');
            audioNode.id = 'remote-audio-node'; audioNode.autoplay = true; document.body.appendChild(audioNode);
        }

        mainContent.innerHTML = `
            <div id="embedded-voice-chat" class="active">
                <div class="voice-chat-card">
                    
                    <div id="state-start" class="screen active">
                        <div style="font-size: 60px; margin-bottom: 20px;">🎙️</div>
                        <h2 style="color: white; margin-bottom: 10px;">Kampüs Frekansı</h2>
                        <p style="color: #9ca3af; font-size: 13px; margin-bottom: 30px; line-height:1.5; padding: 0 10px;">Üniversiteden insanlarla tamamen anonim sesli görüşmeler yap. Maskeni indirmek tamamen senin elinde!</p>
                        <button class="btn-maske" style="width: 100%; padding: 16px; border-radius: 16px; font-weight: bold; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);" onclick="window.startFrequencySearch()">Sohbet Aramaya Başla</button>
                    </div>

                    <div id="state-search" class="screen">
                        <div class="radar-container"><div class="radar-sweep"></div><div style="font-size: 30px; z-index: 10;">📡</div></div>
                        <h3 style="color: #c4b5fd;">Frekans Aranıyor...</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Sıradaki kişiyle eşleştiriliyorsun.</p>
                        <button class="btn-kapat" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;" onclick="window.closeFrequency()">İptal Et ✖</button>
                    </div>

                    <div id="state-timeout" class="screen">
                        <div style="font-size: 50px; margin-bottom: 15px;">🏜️</div>
                        <h3 style="color: #fca5a5;">Frekans Boş!</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 25px;">Şu an ağda eşleşecek kimse bulunamadı.</p>
                        <button class="btn-maske" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; margin-bottom:10px;" onclick="window.startFrequencySearch()">Tekrar Ara 🔄</button>
                        <button class="btn-kapat" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;" onclick="window.closeFrequency()">Kapat ✖</button>
                    </div>

                    <div id="state-chat" class="screen">
                        <h4 style="color: #10b981; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;">Bağlantı Kuruldu</h4>
                        <p id="chat-timer" style="color: #fcd34d; font-family: monospace; font-size: 16px; margin-top: 0; margin-bottom: 20px; background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px;">Kalan Süre: 10:00</p>
                        <div class="blurred-avatar" id="anon-avatar"></div>
                        <div class="visualizer">
                            <div class="bar" id="bar-1"></div><div class="bar" id="bar-2"></div><div class="bar" id="bar-3"></div><div class="bar" id="bar-4"></div><div class="bar" id="bar-5"></div><div class="bar" id="bar-6"></div><div class="bar" id="bar-7"></div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn-gec" id="skip-btn" onclick="window.skipFrequencyUser()" style="flex:1; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;">Geç ⏭</button>
                                <button class="btn-maske" id="reveal-btn" onclick="window.requestReveal()" style="flex:2; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;">Maskeyi İndir 🎭</button>
                            </div>
                            <button class="btn-kapat" onclick="window.closeFrequency()" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;">Görüşmeyi Sonlandır ✖</button>
                        </div>
                        <p id="reveal-status" style="color: #f59e0b; font-size: 13px; margin-top: 15px; display: none;">Onay bekleniyor ⏳</p>
                    </div>

                    <div id="state-revealed" class="screen">
                        <h3 style="color: #10b981; margin-bottom: 20px;">Eşleşme Başarılı! ✨</h3>
                        <img id="reveal-avatar" src="" class="real-avatar" alt="Avatar">
                        <h2 id="reveal-name" style="margin: 0 0 5px 0; color:white;">İsim, Yaş</h2>
                        <p id="reveal-faculty" style="color: #8b5cf6; font-size: 14px; font-weight: bold; margin: 0 0 20px 0;">Fakülte</p>
                        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                            <button id="add-friend-btn" style="background: #10b981; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer;" onclick="window.addRevealedFriend()">Arkadaş Ekle ➕</button>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn-gec" onclick="window.skipFrequencyUser()" style="flex:1; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;">Geç ⏭</button>
                                <button class="btn-kapat" onclick="window.closeFrequency()" style="flex:1; padding: 14px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer;">Kapat ✖</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    };

    window.closeFrequency = async function() {
        clearTimeout(voiceSearchTimeout);
        if(voiceQueueUnsubscribe) voiceQueueUnsubscribe();
        clearInterval(window.freqTimerInterval);
        window.endWebRTCCall(); 
        try { await deleteDoc(doc(db, "voice_queue", window.userProfile.uid)); } catch(e) {}
        window.switchFrequencyState('state-start'); 
    };

    window.switchFrequencyState = function(stateId) {
        document.querySelectorAll('#embedded-voice-chat .screen').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(stateId);
        if(target) target.classList.add('active');
    };

    window.setupLocalAudio = async function() {
        try {
            window.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            window.freqAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = window.freqAudioContext.createMediaStreamSource(window.localStream);
            const analyser = window.freqAudioContext.createAnalyser();
            analyser.fftSize = 32; source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const bars = [document.getElementById('bar-1'), document.getElementById('bar-2'), document.getElementById('bar-3'), document.getElementById('bar-4'), document.getElementById('bar-5'), document.getElementById('bar-6'), document.getElementById('bar-7')];
            
            function animateBars() {
                if(!window.localStream) return;
                requestAnimationFrame(animateBars);
                analyser.getByteFrequencyData(dataArray);
                for(let i = 0; i < 7; i++) {
                    let val = dataArray[i + 2] || 0; 
                    let height = Math.max(10, (val / 255) * 50); 
                    if(bars[i]) { bars[i].style.height = `${height}px`; bars[i].style.background = height > 20 ? '#34d399' : '#059669'; }
                }
            }
            animateBars(); return true;
        } catch(err) { alert("Mikrofon izni alınamadı!"); return false; }
    };

    window.endWebRTCCall = function() {
        if(window.callUnsubscribe) { window.callUnsubscribe(); window.callUnsubscribe = null; }
        if(window.iceUnsubscribe) { window.iceUnsubscribe(); window.iceUnsubscribe = null; }
        if(window.peerConnection) { window.peerConnection.close(); window.peerConnection = null; }
        if(window.localStream) { window.localStream.getTracks().forEach(t => t.stop()); window.localStream = null; }
        if(window.freqAudioContext) { window.freqAudioContext.close(); window.freqAudioContext = null; }
        const remoteAudio = document.getElementById('remote-audio-node');
        if(remoteAudio) { remoteAudio.pause(); remoteAudio.srcObject = null; }
        if(window.callDocId) { deleteDoc(doc(db, "calls", window.callDocId)).catch(e=>{}); window.callDocId = null; }
    };

    window.createWebRTCCall = async function(calleeUid) {
        window.callDocId = window.userProfile.uid + "_" + calleeUid;
        const callDoc = doc(db, "calls", window.callDocId);
        const offerCandidates = collection(callDoc, "offerCandidates");
        const answerCandidates = collection(callDoc, "answerCandidates");

        window.peerConnection = new RTCPeerConnection(rtcConfig);
        window.localStream.getTracks().forEach(track => window.peerConnection.addTrack(track, window.localStream));

        window.peerConnection.ontrack = (event) => {
            const remoteAudio = document.getElementById('remote-audio-node');
            if(remoteAudio) { remoteAudio.srcObject = event.streams[0]; remoteAudio.play().catch(e => console.log(e)); }
        };

        window.peerConnection.onicecandidate = event => { if (event.candidate) { addDoc(offerCandidates, event.candidate.toJSON()); } };
        window.peerConnection.onconnectionstatechange = () => { if (window.peerConnection.connectionState === 'disconnected' || window.peerConnection.connectionState === 'failed') { window.startFrequencySearch(); } };

        const offerDescription = await window.peerConnection.createOffer();
        await window.peerConnection.setLocalDescription(offerDescription);
        await setDoc(callDoc, { offer: { sdp: offerDescription.sdp, type: offerDescription.type }, reveal_caller: false, reveal_callee: false });

        let remoteCandidatesBuffer = [];
        window.callUnsubscribe = onSnapshot(callDoc, async (snapshot) => {
            if (!snapshot.exists()) { if(window.peerConnection) window.startFrequencySearch(); return; }
            const data = snapshot.data();
            if (!window.peerConnection.currentRemoteDescription && data?.answer) {
                await window.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                remoteCandidatesBuffer.forEach(c => window.peerConnection.addIceCandidate(c)); remoteCandidatesBuffer = [];
            }
            if (data.reveal_callee && !data.reveal_caller) {
                const statusEl = document.getElementById('reveal-status');
                if(statusEl && document.getElementById('reveal-btn').style.display !== 'none') { statusEl.style.display = 'block'; statusEl.style.color = '#10b981'; statusEl.innerText = 'Karşı taraf maskesini indirdi!'; }
            }
            if (data.reveal_caller && data.reveal_callee) { window.executeMutualReveal(); }
        });

        window.iceUnsubscribe = onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    if (window.peerConnection.remoteDescription) { window.peerConnection.addIceCandidate(candidate); } else { remoteCandidatesBuffer.push(candidate); }
                }
            });
        });
    };

    window.answerWebRTCCall = async function(callerUid) {
        window.callDocId = callerUid + "_" + window.userProfile.uid;
        const callDoc = doc(db, "calls", window.callDocId);
        const offerCandidates = collection(callDoc, "offerCandidates");
        const answerCandidates = collection(callDoc, "answerCandidates");

        window.peerConnection = new RTCPeerConnection(rtcConfig);
        window.localStream.getTracks().forEach(track => window.peerConnection.addTrack(track, window.localStream));

        window.peerConnection.ontrack = (event) => {
            const remoteAudio = document.getElementById('remote-audio-node');
            if(remoteAudio) { remoteAudio.srcObject = event.streams[0]; remoteAudio.play().catch(e => console.log(e)); }
        };

        window.peerConnection.onicecandidate = event => { if (event.candidate) { addDoc(answerCandidates, event.candidate.toJSON()); } };
        window.peerConnection.onconnectionstatechange = () => { if (window.peerConnection.connectionState === 'disconnected' || window.peerConnection.connectionState === 'failed') { window.startFrequencySearch(); } };

        let remoteCandidatesBuffer = [];
        window.callUnsubscribe = onSnapshot(callDoc, async (snapshot) => {
            if (!snapshot.exists()) { if(window.peerConnection) window.startFrequencySearch(); return; }
            const data = snapshot.data();
            if (data?.offer && !window.peerConnection.currentRemoteDescription) {
                await window.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answerDescription = await window.peerConnection.createAnswer();
                await window.peerConnection.setLocalDescription(answerDescription);
                await updateDoc(callDoc, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } });
                remoteCandidatesBuffer.forEach(c => window.peerConnection.addIceCandidate(c)); remoteCandidatesBuffer = [];
            }
            if (data.reveal_caller && !data.reveal_callee) {
                const statusEl = document.getElementById('reveal-status');
                if(statusEl && document.getElementById('reveal-btn').style.display !== 'none') { statusEl.style.display = 'block'; statusEl.style.color = '#10b981'; statusEl.innerText = 'Karşı taraf maskesini indirdi!'; }
            }
            if (data.reveal_callee && data.reveal_caller) { window.executeMutualReveal(); }
        });

        window.iceUnsubscribe = onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    if (window.peerConnection.remoteDescription) { window.peerConnection.addIceCandidate(candidate); } else { remoteCandidatesBuffer.push(candidate); }
                }
            });
        });
    };

    window.startFrequencySearch = async function() {
        window.switchFrequencyState('state-search');
        window.endWebRTCCall(); 
        clearInterval(window.freqTimerInterval);
        if(voiceQueueUnsubscribe) voiceQueueUnsubscribe();

        const myUid = window.userProfile.uid;
        clearTimeout(voiceSearchTimeout);
        voiceSearchTimeout = setTimeout(async () => {
            if(voiceQueueUnsubscribe) voiceQueueUnsubscribe();
            try { await deleteDoc(doc(db, "voice_queue", myUid)); } catch(e) {}
            window.switchFrequencyState('state-timeout');
        }, 60000);

        try {
            const q = query(collection(db, "voice_queue"), where("status", "==", "waiting"), limit(5));
            const snap = await getDocs(q);
            let partnerFound = null;
            snap.forEach(docSnap => { 
                const d = docSnap.data();
                if(docSnap.id !== myUid && docSnap.id !== window.lastMatchedUid) { partnerFound = { uid: docSnap.id, ...d }; }
            });

            if(partnerFound) {
                clearTimeout(voiceSearchTimeout);
                await updateDoc(doc(db, "voice_queue", partnerFound.uid), { status: "matched", matchedWith: myUid });
                const micReady = await window.setupLocalAudio();
                if(!micReady) { window.closeFrequency(); return; }
                window.callRole = 'caller'; await window.createWebRTCCall(partnerFound.uid);
                const pDoc = await getDoc(doc(db, "users", partnerFound.uid));
                window.currentVoiceMatch = pDoc.exists() ? pDoc.data() : { uid: partnerFound.uid, name: "Kampüs Öğrencisi", faculty: "Gizli", avatar: "🕵️" };
                window.lastMatchedUid = partnerFound.uid; window.connectFrequencyChat();
            } else {
                await setDoc(doc(db, "voice_queue", myUid), { uid: myUid, status: "waiting", matchedWith: null, timestamp: serverTimestamp() });
                voiceQueueUnsubscribe = onSnapshot(doc(db, "voice_queue", myUid), async (docSnap) => {
                    if(docSnap.exists() && docSnap.data().status === "matched") {
                        clearTimeout(voiceSearchTimeout); if(voiceQueueUnsubscribe) voiceQueueUnsubscribe();
                        const matchedUid = docSnap.data().matchedWith;
                        try { await deleteDoc(doc(db, "voice_queue", myUid)); } catch(e) {}
                        const micReady = await window.setupLocalAudio();
                        if(!micReady) { window.closeFrequency(); return; }
                        window.callRole = 'callee'; await window.answerWebRTCCall(matchedUid);
                        const pDoc = await getDoc(doc(db, "users", matchedUid));
                        window.currentVoiceMatch = pDoc.exists() ? pDoc.data() : { uid: matchedUid, name: "Kampüs Öğrencisi", faculty: "Gizli", avatar: "🕵️" };
                        window.lastMatchedUid = matchedUid; window.connectFrequencyChat();
                    }
                });
            }
        } catch(e) { console.error(e); }
    };

    window.skipFrequencyUser = function() { window.startFrequencySearch(); };

    window.connectFrequencyChat = function() {
        window.switchFrequencyState('state-chat');
        window.startFrequencyTimer();
        document.getElementById('reveal-btn').style.display = 'block';
        document.getElementById('skip-btn').style.display = 'block';
        document.getElementById('reveal-status').style.display = 'none';
        document.getElementById('reveal-status').innerText = 'Karşı tarafın onayı bekleniyor ⏳';
        document.getElementById('reveal-status').style.color = '#f59e0b';
    };

    window.startFrequencyTimer = function() {
        let maxSeconds = (window.userProfile.isPremium ? 30 : 10) * 60; 
        clearInterval(window.freqTimerInterval);
        window.freqTimerInterval = setInterval(() => {
            maxSeconds--;
            const m = Math.floor(maxSeconds / 60).toString().padStart(2, '0');
            const s = (maxSeconds % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('chat-timer');
            if(timerEl) { timerEl.innerText = `Kalan Süre: ${m}:${s}`; timerEl.style.color = maxSeconds <= 60 ? '#ef4444' : '#fcd34d'; }
            if (maxSeconds <= 0) { clearInterval(window.freqTimerInterval); alert("Süre bitti!"); window.startFrequencySearch(); }
        }, 1000);
    };

    window.requestReveal = async function() {
        document.getElementById('reveal-btn').style.display = 'none';
        const statusEl = document.getElementById('reveal-status');
        if (statusEl.innerText.includes('Karşı taraf maskesini indirdi')) { statusEl.innerText = 'Eşleşme onaylanıyor...'; } 
        else { statusEl.style.display = 'block'; statusEl.style.color = '#f59e0b'; statusEl.innerText = 'Karşı tarafın onayı bekleniyor ⏳'; }
        if (window.callDocId && window.callRole) { try { await updateDoc(doc(db, "calls", window.callDocId), { ['reveal_' + window.callRole]: true }); } catch(e) {} }
    };

    window.executeMutualReveal = function() {
        const matchUser = window.currentVoiceMatch;
        if(matchUser) {
            const avImg = document.getElementById('reveal-avatar');
            if(avImg) avImg.src = matchUser.avatarUrl || "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70);
            const nameEl = document.getElementById('reveal-name');
            if(nameEl) nameEl.innerText = matchUser.name + (matchUser.age ? ", " + matchUser.age : "");
            const facEl = document.getElementById('reveal-faculty');
            if(facEl) facEl.innerText = matchUser.faculty || "Kampüs Öğrencisi";
        }
        window.switchFrequencyState('state-revealed');
    };

    window.addRevealedFriend = function() {
        if(window.currentVoiceMatch && window.currentVoiceMatch.uid) {
            window.sendFriendRequest(window.currentVoiceMatch.uid, window.currentVoiceMatch.name);
            const btn = document.getElementById('add-friend-btn');
            if (btn) { btn.innerText = "İstek Gönderildi ✔️"; btn.style.background = "#4b5563"; btn.disabled = true; }
        }
    };


    // =========================================================================
    // 🌟 POPÜLERLİK SAVAŞI (TURNUVA) SEKMESİ 🌟
    // =========================================================================

    window.renderPopularity = async function() {
        document.body.classList.add('no-scroll-home');
        if(window.freqTimerInterval) clearInterval(window.freqTimerInterval);
        window.endWebRTCCall();

        mainContent.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden; padding: 15px;">
                <div style="background: linear-gradient(135deg, #111827, #374151); color: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); flex-shrink:0;">
                    <div style="font-size: 40px; margin-bottom: 10px;" class="white-flame-icon">🔥</div>
                    <h2 style="margin: 0 0 5px 0;">Popülerlik Savaşı</h2>
                    <p style="font-size: 13px; color: #9CA3AF; margin: 0;">Kampüsün en popülerlerini seç veya sıralamaya gir!</p>
                </div>
                
                <div id="popularity-main-container" style="flex:1; display:flex; flex-direction:column; overflow:hidden; background: white; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 20px;">
                    <div style="text-align:center; padding:30px;"><div style="font-size:30px; animation: glowPulse 1.5s infinite alternate;">🔥</div><p style="color:var(--text-gray); margin-top:10px;">Liderlik tablosu yükleniyor...</p></div>
                </div>
            </div>
        `;
        
        window.showLeaderboardInTab();
    };

    window.showLeaderboardInTab = async function() {
        const container = document.getElementById('popularity-main-container');
        if(!container) return;

        try {
            const q = query(collection(db, "users"), orderBy("popularity", "desc"), limit(10));
            const snap = await getDocs(q);
            
            let html = '<h3 style="margin-top:0; margin-bottom:15px; color:#111827; text-align:center;">🏆 Liderlik Tablosu</h3><div style="display:flex; flex-direction:column; gap:8px; flex:1; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">';
            let rank = 1;
            snap.forEach(doc => {
                const u = doc.data();
                if(u.popularity > 0) {
                    let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                    html += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#F9FAFB; border-radius:12px; border:1px solid #E5E7EB; cursor:pointer; transition:0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='#E5E7EB'" onclick="window.viewUserProfile('${u.uid}')">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="font-size:18px; font-weight:800; width:25px; text-align:center;">${medal}</div>
                                <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:#E5E7EB; border:1px solid #111827;">
                                    ${u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="font-size:20px; text-align:center; line-height:40px;">${u.avatar || '👤'}</div>`}
                                </div>
                                <span style="font-weight:700; font-size:14px; color:#111827;">${u.name} ${u.surname ? u.surname.charAt(0)+'.' : ''}</span>
                            </div>
                            <div style="font-weight:800; color:#111827; font-size:14px; background:white; padding:4px 10px; border-radius:12px; border:1px solid #111827;">${u.popularity} 🔥</div>
                        </div>
                    `;
                    rank++;
                }
            });
            if(rank === 1) html += '<p style="text-align:center; color:var(--text-gray); padding:20px;">Henüz popülerlik puanı kazanan kimse yok. Savaşı başlat!</p>';
            
            let btnHtml = `<button class="btn-primary" style="width:100%; padding:16px; border-radius:12px; background:#111827; border:none; font-weight:bold; font-size:16px; flex-shrink:0;" onclick="window.startPopularityTournament()">Savaşa Katıl ⚔️</button>`;
            
            if (window.userProfile && window.userProfile.lastTournamentDate) {
                let timeDiff = Date.now() - window.userProfile.lastTournamentDate;
                if (timeDiff < (24 * 60 * 60 * 1000)) {
                    btnHtml = `<button disabled class="btn-primary" style="width:100%; padding:16px; border-radius:12px; background:#9CA3AF; border:none; font-weight:bold; font-size:16px; cursor:not-allowed; flex-shrink:0;">⏳ Savaş İçin Bekleniyor...</button>`;
                }
            }

            html += `</div>${btnHtml}`;
            container.innerHTML = html;
        } catch(e) { container.innerHTML = '<p style="color:red; text-align:center;">Sıralama yüklenirken hata oluştu.</p>'; }
    };

    window.startPopularityTournament = async function() {
        const container = document.getElementById('popularity-main-container');
        if(!container) return;
        
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:50px; animation: glowPulse 1.5s infinite alternate; margin-bottom:15px;">🔥</div>
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
                allUsers.push({ uid: "bot_" + Math.random().toString(36).substr(2, 9), name: "Sistem Botu 🤖", age: "?", faculty: "UniLoop", avatar: "🤖", isClone: true });
            }
            window.tData = { bracket: allUsers, winners: [], currentMatch: 0, stage: 'groups', semiLosers: [], finalists: [], finalWinner: null, secondPlace: null, thirdPlace: null };
            window.renderTournamentRound();
        } catch(e) { container.innerHTML = '<p style="color:red; text-align:center;">Turnuva başlatılamadı.</p>'; }
    };

    window.tourSelect = function(index) {
        const selectedUser = window.tData.bracket[index];
        window.tData.winners.push(selectedUser);
        if(window.tData.stage === 'semis') {
            const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
            window.tData.semiLosers.push(window.tData.bracket[loserIndex]);
        }
        if (window.tData.stage === 'thirdPlace') { window.tData.thirdPlace = selectedUser; }
        if (window.tData.stage === 'final') {
            window.tData.finalWinner = selectedUser;
            const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
            window.tData.secondPlace = window.tData.bracket[loserIndex];
        }
        window.tData.currentMatch++;
        window.renderTournamentRound();
    };

    window.renderTournamentRound = function() {
        const container = document.getElementById('popularity-main-container');
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
            else if (t.stage === 'semis') { t.stage = 'thirdPlace'; t.finalists = [...t.winners]; t.bracket = [...t.semiLosers]; }
            else if (t.stage === 'thirdPlace') { t.stage = 'final'; t.bracket = [...t.finalists]; } 
            else if (t.stage === 'final') { window.finishTournament(); return; }
            t.winners = []; t.currentMatch = 0; window.renderTournamentRound(); return;
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
                <div style="text-align:center; margin-bottom:15px; width:100%;">
                    <h3 style="margin:0; color:#111827; font-size:20px;">${stageTitle}</h3>
                    <p style="font-size:13px; color:var(--text-gray); margin:5px 0 0 0;">En favori profilini seç!</p>
                </div>
                <div class="tour-grid-4">
                    ${users.map((u, i) => `
                        <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+i}), 150);">
                            ${u.avatarUrl ? `<img src="${u.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:40px;">${u.avatar||'👤'}</div>`}
                            <div class="tour-card-name" style="padding-top:40px;">
                                <span style="font-size:10px; color:#D1D5DB; display:block; margin-bottom:2px; font-weight:normal;">${u.age ? u.age : '?'} Yaş • ${u.faculty ? u.faculty : 'Kampüs'}</span>
                                ${u.name}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            const baseIdx = t.currentMatch * 2;
            const u1 = t.bracket[baseIdx]; const u2 = t.bracket[baseIdx+1];
            container.innerHTML = `
                <div style="text-align:center; margin-bottom:15px; width:100%;">
                    <h3 style="margin:0; color:#111827; font-size:22px;">${stageTitle}</h3>
                    <p style="font-size:13px; color:var(--text-gray); margin:5px 0 0 0;">Kazanması gerekeni seç!</p>
                </div>
                <div class="tour-grid-2">
                    <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx}), 150);" style="aspect-ratio: 0.8;">
                        ${u1.avatarUrl ? `<img src="${u1.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u1.avatar||'👤'}</div>`}
                        <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                            <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u1.age ? u1.age : '?'} Yaş • ${u1.faculty ? u1.faculty : 'Kampüs'}</span>
                            ${u1.name}
                        </div>
                    </div>
                    <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+1}), 150);" style="aspect-ratio: 0.8;">
                        ${u2.avatarUrl ? `<img src="${u2.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u2.avatar||'👤'}</div>`}
                        <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                            <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u2.age ? u2.age : '?'} Yaş • ${u2.faculty ? u2.faculty : 'Kampüs'}</span>
                            ${u2.name}
                        </div>
                    </div>
                </div>
            `;
        }
    };

    window.finishTournament = async function() {
        const container = document.getElementById('popularity-main-container');
        if(!container) return;
        const t = window.tData;

        container.innerHTML = `<div style="text-align:center; padding:40px 20px;"><div style="font-size:40px; animation: glowPulse 1s infinite alternate;">⏳</div><h3 style="color:var(--text-dark);">Sonuçlar Kaydediliyor...</h3></div>`;

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
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; height:100%;">
                    <div style="font-size:50px; margin-bottom:10px;">🎉</div>
                    <h3 style="color:#111827; margin-bottom:20px; font-size:22px;">Savaş Sona Erdi!</h3>
                    
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:25px; width:100%; max-width:300px; text-align:left;">
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:12px; border-radius:12px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥇</span><span style="font-weight:800; flex:1; color:#111827;">${t.finalWinner.name}</span><span style="font-weight:bold; color:var(--text-gray);">${t.finalWinner.isClone ? 'BOT' : '+3 🔥'}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:12px; border-radius:12px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥈</span><span style="font-weight:800; flex:1; color:#111827;">${t.secondPlace.name}</span><span style="font-weight:bold; color:var(--text-gray);">${t.secondPlace.isClone ? 'BOT' : '+2 🔥'}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:12px; border-radius:12px; border:1px solid #E5E7EB;">
                            <span style="font-size:24px;">🥉</span><span style="font-weight:800; flex:1; color:#111827;">${t.thirdPlace.name}</span><span style="font-weight:bold; color:var(--text-gray);">${t.thirdPlace.isClone ? 'BOT' : '+1 🔥'}</span>
                        </div>
                    </div>
                    
                    <button class="btn-primary" style="width:100%; max-width:300px; padding:16px; border-radius:12px; font-weight:800; font-size:15px;" onclick="window.showLeaderboardInTab()">Tabloya Dön</button>
                </div>
            `;
        } catch(e) { container.innerHTML = '<p style="color:red; text-align:center;">Sonuçlar kaydedilirken hata oluştu.</p>'; }
    };


    // =========================================================================
    // 🌟 MESAJLAR VE SOHBET (DM) İŞLEMLERİ 🌟
    // =========================================================================

    window.renderMessagesSidebarOnly = function() {
        const sb = document.getElementById('chat-sidebar-list');
        if(!sb) return;

        let sbHtml = '';
        chatsDB.forEach(chat => {
            if (chat.status === 'pending' && chat.initiator !== window.userProfile.uid) {
                // İstek bekleyenlerde UI gösterimi (isteği alan taraf)
            } else if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) {
                 // İstek gönderen tarafta UI gösterimi
            }

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
                    <div style="position:relative; flex-shrink:0;">${avatarHtml}</div>
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
        
        sb.innerHTML = sbHtml || `<div style="padding:40px 20px; text-align:center; color:#9CA3AF;"><div style="font-size:40px; margin-bottom:10px;">💬</div><div style="font-size:14px; font-weight:500;">Mesajınız yok.</div></div>`;
    };

    window.renderMessages = function() {
        document.body.classList.add('no-scroll-messages');
        if(window.freqTimerInterval) clearInterval(window.freqTimerInterval);
        window.endWebRTCCall();

        let unreadCount = 0;
        chatsDB.forEach(chat => {
            if (chat.status === 'accepted') {
                if (chat.messages && chat.messages.length > 0) {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) unreadCount++;
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
                <div class="chat-main" id="chat-main-area" style="display:none; flex-direction:column; height:100%; position:relative; background:#f9fafb; flex:1;"></div>
            </div>
        `;
        mainContent.innerHTML = html;
        window.renderMessagesSidebarOnly();
        
        if (currentChatId) { window.openChatView(currentChatId); } 
        else if (window.innerWidth > 1024 && chatsDB.length > 0) { window.openChatView(chatsDB[0].id); }
    };

    window.openChatViewDirect = function(chatId) { window.loadPage('messages'); setTimeout(() => { window.openChatView(chatId); }, 100); };

    window.clearChatHistory = async function(chatId) {
        if(confirm("Geçmişi silmek istediğinize emin misiniz?")) {
            try { await updateDoc(doc(db, "chats", chatId), { messages: [], lastUpdated: serverTimestamp() }); alert("Temizlendi."); window.updateChatMessagesOnly(chatId); } 
            catch(e) { alert("Hata."); }
        }
    };

    window.blockUser = async function(otherUid, chatId, name) {
        if(confirm(`${name} engellensin mi?`)) {
            try {
                await updateDoc(doc(db, "users", window.userProfile.uid), { blockedUsers: arrayUnion(otherUid) });
                if (!window.userProfile.blockedUsers) window.userProfile.blockedUsers = []; window.userProfile.blockedUsers.push(otherUid);
                await updateDoc(doc(db, "chats", chatId), { status: 'blocked', blockedBy: window.userProfile.uid, lastUpdated: serverTimestamp() });
                alert(`${name} engellendi.`); window.closeChatView(); window.renderMessagesSidebarOnly();
            } catch(e) { alert("Hata."); }
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
                    <div style="font-size:12px; color:#10B981; font-weight:600; display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#10B981; border-radius:50%;"></div> Kampüs İçi Bağlantı</div>
                </div>
                
                <div style="position:relative;">
                    <button onclick="document.getElementById('chat-options-menu').classList.toggle('hidden'); event.stopPropagation();" style="background:none; border:none; font-size:20px; color:var(--text-gray); cursor:pointer;" id="chat-options-dropdown-wrapper">⋮</button>
                    <div id="chat-options-menu" class="hidden" style="position:absolute; right:0; top:35px; background:white; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-radius:12px; overflow:hidden; z-index:100; min-width:180px; border:1px solid #E5E7EB;">
                        <div onclick="window.clearChatHistory('${chat.id}')" style="padding:14px 15px; font-size:13px; font-weight:600; color:var(--text-dark); cursor:pointer; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px;">🗑️ Geçmişi Sil</div>
                        <div onclick="window.blockUser('${chat.otherUid}', '${chat.id}', '${chat.name}')" style="padding:14px 15px; font-size:13px; font-weight:600; color:#EF4444; cursor:pointer; display:flex; align-items:center; gap:10px;">🚫 Kişiyi Engelle</div>
                    </div>
                </div>
            </div>
        `;

        let statusAreaHtml = '';
        if (chat.status === 'pending') {
            if (chat.initiator === window.userProfile.uid) {
                statusAreaHtml = `<div style="padding:15px; background:#EEF2FF; text-align:center; font-size:13px; color:#4F46E5; border-bottom:1px solid #E5E7EB; font-weight:700; flex-shrink:0;">⏳ Karşı tarafın onayı bekleniyor.</div>`;
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
            <div id="chat-messages-scroll" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; background:#f9fafb;"></div>
        `;

        if (chat.status === 'accepted') {
            mainHtml += `
                <div class="chat-input-area" style="padding:15px 20px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:12px; align-items:center; flex-shrink:0;">
                    <input type="file" id="dm-chat-media" accept="image/*, application/pdf" style="display:none;" onchange="window.uploadChatMedia(event, '${chat.id}')">
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
            inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.sendDirectMessage(chat.id, chat.otherUid); });
            if(window.innerWidth > 1024) setTimeout(() => inputField.focus(), 100);
        }
        
        if (chat.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                const updatedMessages = chat.messages.map(m => { if(m.senderId !== window.userProfile.uid) m.read = true; return m; });
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
        
        if (msgs.length === 0) { chatHTML = `<div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px;">Henüz mesaj yok. İlk mesajı sen gönder!</div>`; } 
        else {
            msgs.forEach((msg) => {
                const isMe = msg.senderId === window.userProfile.uid;
                const type = isMe ? 'sent' : 'received';
                const isRead = msg.read ? '✓✓' : '✓';
                
                let mediaHtml = '';
                if (msg.mediaUrl) {
                    if (msg.mediaType === 'pdf') { mediaHtml = `<a href="${msg.mediaUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(0,0,0,0.05); padding:10px; border-radius:8px; margin-bottom:5px; text-decoration:none; color:#EF4444; font-weight:bold; font-size:13px;"><span>📄</span> PDF İndir/Aç</a>`; } 
                    else { mediaHtml = `<img src="${msg.mediaUrl}" style="width:100%; max-width:250px; border-radius:8px; margin-bottom:5px; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([msg.mediaUrl]))}', 0)">`; }
                }

                const textHtml = msg.text ? `<div class="msg-text" style="word-break: break-word;">${msg.text}</div>` : '';
                chatHTML += `
                    <div class="bubble ${type}" style="display:flex; flex-direction:column; position:relative;">
                        ${mediaHtml}${textHtml}
                        <div class="msg-time" style="align-self:flex-end; font-size:10px; opacity:0.7; margin-top:4px; display:flex; align-items:center; gap:4px;">${msg.time || ''} ${isMe ? `<span style="font-weight:bold;">${isRead}</span>` : ''}</div>
                    </div>
                `;
            });
        }

        const isScrolledToBottom = scrollBox.scrollHeight - scrollBox.clientHeight <= scrollBox.scrollTop + 50;
        scrollBox.innerHTML = chatHTML;
        if(isScrolledToBottom || msgs.length <= 1) scrollBox.scrollTop = scrollBox.scrollHeight;
    };

    window.sendDirectMessage = async function(chatId) {
        const input = document.getElementById('chat-input-field');
        if(input && input.value.trim() !== '') {
            const text = input.value.trim(); input.value = '';
            const newMsg = { senderId: window.userProfile.uid, text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false };
            try { await updateDoc(doc(db, "chats", chatId), { messages: arrayUnion(newMsg), lastUpdated: serverTimestamp() }); } 
            catch(error) { alert("Mesaj gönderilemedi."); }
        }
    };

    window.acceptChatRequest = async function(chatId) {
        try { await updateDoc(doc(db, "chats", chatId), { status: 'accepted', lastUpdated: serverTimestamp() }); window.openChatView(chatId); } 
        catch(error) { alert("Onaylanırken hata oluştu."); }
    };

    window.rejectChatRequest = async function(chatId) {
        if(confirm("Reddetmek istediğinize emin misiniz?")) {
            try { await deleteDoc(doc(db, "chats", chatId)); window.closeChatView(); } 
            catch(error) { alert("Hata oluştu."); }
        }
    };

    // =========================================================================
    // 🌟 PROFIL & AYARLAR & BİLDİRİMLER İŞLEMLERİ 🌟
    // =========================================================================

    window.viewUserProfile = async function(targetUid) {
        if (!targetUid) return;
        if(targetUid === window.userProfile.uid) { window.loadPage('profile'); return; }

        const isFriend = chatsDB.some(c => c.otherUid === targetUid && c.status === 'accepted');

        if (!window.userProfile.isPremium && !isFriend) {
            window.openModal('🔒 Detaylı Profil Kilitli', `
                <div style="text-align:center; padding:20px;">
                    <div style="font-size:50px; margin-bottom:15px; filter: blur(2px);">👀</div>
                    <h3 style="color:var(--text-dark); margin-bottom:10px;">Gizli Profil!</h3>
                    <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px; line-height:1.5;">Detaylı profile bakabilmek için Premium üye ol.</p>
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
                    const viewRecord = { uid: window.userProfile.uid, name: window.userProfile.name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + new Date().toLocaleDateString() };
                    await updateDoc(doc(db, "users", targetUid), { profileViewers: arrayUnion(viewRecord) });
                } catch(err) {}

                const initial = u.surname ? u.surname.charAt(0) + '.' : '';
                const isPremium = u.isPremium;

                let avatarHtml = u.avatarUrl 
                    ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'};">` 
                    : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'}; margin:0 auto;">${u.avatar || '👤'}</div>`;
                
                const premiumBadge = isPremium ? `<div style="margin-top:8px; display:inline-block; background:#111827; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.1);">☆ Premium Üye</div>` : '';

                const existingChat = chatsDB.find(c => c.otherUid === u.uid);
                let actionBtnHtml = '';
                
                if (existingChat && existingChat.status === 'accepted') { actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`; } 
                else if (existingChat && existingChat.status === 'pending') { actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF; box-shadow:none;">⏳ İstek Bekleniyor</button>`; } 
                else { actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Arkadaş Olarak Ekle</button>`; }

                window.openModal('Kullanıcı Profili', `
                    <div style="text-align:center;">
                        ${avatarHtml}
                        <h3 style="margin: 10px 0 5px 0; font-size:18px; color:var(--text-dark); display:flex; align-items:center; justify-content:center; gap:5px;">${u.name} ${initial} ${isPremium ? '<span style="font-size:18px;">👑</span>' : ''}</h3>
                        <p style="color:#111827; font-size:14px; margin-bottom: 5px; font-weight:bold;">${u.faculty || 'Belirtilmemiş'} ${u.grade ? ' - ' + u.grade + '. Sınıf' : ''}</p>
                        <p style="color:var(--text-gray); font-size:13px; margin-bottom: 5px;">${u.age ? u.age + " yaşında" : "Yaş belirtilmemiş"}</p>
                        ${premiumBadge}
                        <div style="margin-top:20px;">${actionBtnHtml}</div>
                    </div>
                `);
            }
        } catch (e) { alert("Profil yüklenirken hata oluştu."); }
    };

    window.renderProfile = function() {
        document.body.classList.add('no-scroll-home');
        if(window.freqTimerInterval) clearInterval(window.freqTimerInterval);
        window.endWebRTCCall();

        const u = window.userProfile;
        const initial = u.surname ? u.surname.charAt(0) + '.' : '';
        const isPremium = u.isPremium;
        
        let avatarHtml = u.avatarUrl 
            ? `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()"><img src="${u.avatarUrl}" class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}"><div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827;">📷</div></div>` 
            : `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()"><div class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}">${u.avatar || '👤'}</div><div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827;">📷</div></div>`;

        let tagsHtml = '';
        if(u.interests && Array.isArray(u.interests)) {
            tagsHtml = u.interests.map(tag => `<span class="id-tag" style="background:white; color:#111827; border:1px solid #111827;">${tag}</span>`).join('');
        }

        const premiumBadgeHtml = isPremium ? `<div style="background:white; color:#111827; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-top:5px;">☆ Premium Üye</div>` : ``;
        const friendsCount = chatsDB.filter(c => c.status === 'accepted').length;

        let html = `
            <div style="padding: 15px; display:flex; flex-direction:column; height:100%; overflow-y:auto;">
                <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.openCropper(event, 'profile')">
                <div class="id-card ${isPremium ? 'premium-card-bw' : ''}" style="width:100%; box-sizing:border-box; margin-top:10px; margin-bottom:15px; position:relative; ${isPremium ? 'border-color:#111827;' : ''}">
                    <button class="edit-profile-icon" style="position:absolute; top:15px; right:15px; background:white; color:#111827; border:1px solid #111827;" onclick="window.openProfileEditModal()">✏️ Düzenle</button>
                    <div class="id-card-left">${avatarHtml}</div>
                    <div class="id-card-right">
                        <div class="id-card-name" style="color:#111827;">${u.name} ${initial}</div>
                        <div style="font-size:12px; color:#111827; margin-bottom:4px; font-weight:600;">${u.username ? u.username : '@kullanici_adi'}</div>
                        <div class="id-card-faculty" style="color:#111827;">${u.faculty || 'Bölüm belirtilmemiş'} ${u.grade ? ' - ' + u.grade + '. Sınıf' : ''}</div>
                        <div class="id-card-details">
                            <span style="color:#111827;">🏫 ${u.university || 'UniLoop'}</span>
                            <span style="color:#111827;">🎂 ${u.age ? u.age + ' Yaşında' : 'Yaş belirtilmemiş'}</span>
                            <span style="color:#111827; font-weight:bold;">🔥 Popülerlik Puanı: ${u.popularity || 0}</span>
                            ${premiumBadgeHtml}
                        </div>
                        <div class="id-card-tags">${tagsHtml}</div>
                    </div>
                </div>

                <button class="btn-primary" style="width:100%; padding:14px; font-size:15px; border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; background:white; color:#111827; box-shadow:none; border:1px solid #111827; transition:0.2s;" onclick="window.openFriendsList()">
                    <span style="font-size:20px;">👥</span> <strong>Arkadaşlarım (${friendsCount})</strong>
                </button>
                
                ${!isPremium ? `
                <div class="card premium-glow" style="margin-bottom:15px; background:white; border:1px solid #111827; cursor:pointer; padding:15px;" onclick="window.openPremiumModal()">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <div style="font-weight:800; color:#111827; font-size:16px; margin-bottom:4px;">🌟 UniLoop Premium'a Geç</div>
                            <div style="font-size:12px; color:#111827; font-weight:bold;">Kampüsün en popüler kişisi ol, sınırları kaldır!</div>
                        </div>
                        <div style="font-size:24px;">👑</div>
                    </div>
                </div>
                ` : ''}

                <button class="card" style="width:100%; padding:16px; margin-bottom:20px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:1px solid #111827; cursor:pointer; color:#111827; font-weight:bold; transition:transform 0.2s;" onclick="window.renderSettings()">
                    <span style="font-size:20px;">⚙️</span> <strong style="font-size:15px;">Hesap Ayarları</strong>
                </button>
            </div>
        `;
        mainContent.innerHTML = html;
    };

    window.openFriendsList = function() {
        const friends = chatsDB.filter(c => c.status === 'accepted');
        if (friends.length === 0) {
            window.openModal('👥 Arkadaşlarım', `<div style="text-align:center; padding:30px 10px; color:var(--text-gray);"><div style="font-size:40px; margin-bottom:10px;">🤷‍♂️</div><div style="font-size:14px;">Henüz bağlantı kurduğunuz bir arkadaşınız yok.</div><button class="btn-primary" style="margin-top:15px; padding:10px 20px; border-radius:10px; background:white; color:#111827; border:1px solid #111827;" onclick="window.closeModal(); window.loadPage('home')">Keşfetmeye Başla</button></div>`); return;
        }

        let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">`;
        friends.forEach(f => {
            let avatarHtml = f.avatar && f.avatar.startsWith('http') 
                ? `<img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #111827;">`
                : `<div style="width:40px; height:40px; border-radius:50%; background:white; color:#111827; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #111827;">${f.avatar || '👤'}</div>`;
            listHtml += `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:white; border:1px solid #111827; border-radius:12px;">
                    <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="window.viewUserProfile('${f.otherUid}')">${avatarHtml}<span style="font-weight:700; font-size:14px; color:#111827;">${f.name}</span></div>
                    <div style="display:flex; gap:6px;"><button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; background:white; color:#111827; border:1px solid #111827;" onclick="window.openChatViewDirect('${f.id}'); window.closeModal();">💬 Mesaj</button></div>
                </div>
            `;
        });
        window.openModal(`👥 Arkadaşlarım (${friends.length})`, listHtml + `</div>`);
    };

    window.openProfileEditModal = function() {
        const u = window.userProfile;
        const uNameStr = u.username ? u.username.replace('#', '') : '';
        let facOptions = allFaculties.map(f => `<option value="${f}" ${u.faculty === f ? 'selected' : ''}>${f}</option>`).join('');
        
        window.openModal('✏️ Profilini Düzenle', `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div><label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kullanıcı Adı</label><div style="display:flex; align-items:center; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:0 10px;"><span style="color:var(--primary); font-weight:bold; font-size:14px;">#</span><input type="text" id="edit-username" value="${uNameStr}" style="border:none; background:transparent; width:100%; padding:12px 5px; outline:none; font-size:14px;"></div></div>
                <div><label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Yaş</label><input type="number" id="edit-age" value="${u.age || ''}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;"></div>
                <div><label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Fakülte</label><select id="edit-faculty" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;"><option value="">Fakülte Seçiniz</option>${facOptions}</select></div>
                <div><label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kaçıncı Sınıf</label><select id="edit-grade" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;"><option value="1" ${u.grade == '1' ? 'selected' : ''}>1. Sınıf</option><option value="2" ${u.grade == '2' ? 'selected' : ''}>2. Sınıf</option><option value="3" ${u.grade == '3' ? 'selected' : ''}>3. Sınıf</option><option value="4" ${u.grade == '4' ? 'selected' : ''}>4. Sınıf</option><option value="5" ${u.grade == '5' ? 'selected' : ''}>5. Sınıf</option><option value="6" ${u.grade == '6' ? 'selected' : ''}>6. Sınıf</option></select></div>
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
                if(!snap.empty) { alert("Bu kullanıcı adı alınmış."); return; }
            }
            await updateDoc(doc(db, "users", window.userProfile.uid), { username: finalUsername, age: newAge, faculty: newFaculty, grade: newGrade });
            window.userProfile.username = finalUsername; window.userProfile.age = newAge; window.userProfile.faculty = newFaculty; window.userProfile.grade = newGrade;
            alert("Profil güncellendi!"); window.closeModal(); window.renderProfile();
        } catch(e) { alert("Hata oluştu."); }
    };

    window.renderSettings = function() {
        const currentLang = localStorage.getItem('uniloop_lang') || 'tr';
        let premiumCancelHtml = window.userProfile.isPremium ? `<a href="#" onclick="event.preventDefault(); window.cancelPremium()" style="display:block; text-align:center; font-size:12px; color:#111827; font-weight:bold; text-decoration:underline; margin-bottom:15px;">Premium Üyeliğimi İptal Et</a>` : '';

        window.openModal('⚙️ Ayarlar', `
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div class="form-group" style="margin:0;"><label style="font-size:13px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; display:block;">Dil Seçimi</label><select onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB;"><option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option><option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option></select></div>
                <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>
                <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:10px; background:#4B5563; border-color:#4B5563;" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>
                <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>
                <a href="#" onclick="event.preventDefault(); window.deleteAccount()" style="display:block; text-align:center; font-size:12px; color:#EF4444; text-decoration:underline; margin-bottom:5px;">Hesabımı Sil</a>
                ${premiumCancelHtml}
                <a href="#" onclick="event.preventDefault(); window.openLegalModal()" style="display:block; text-align:center; font-size:12px; color:var(--primary); text-decoration:underline;">Kullanıcı Sözleşmesi ve Hakları</a>
                <div style="text-align:center; font-size:11px; color:#9CA3AF; margin-top:5px;">UniLoop v3.2.0 Pro<br>Made with ❤️ for Students</div>
            </div>
        `);
    };

    window.logout = async function() {
        try {
            if(window.userProfile && window.userProfile.uid) { await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false }); }
            await signOut(auth);
            if(authScreen && appScreen) { appScreen.style.display = 'none'; authScreen.style.display = 'flex'; authScreen.classList.add('active'); document.getElementById('login-card').style.display = 'block'; }
            window.location.reload();
        } catch(error) {}
    };

    window.deleteAccount = async function() {
        if(confirm("Tüm verilerin silinecek. Emin misin?")) {
            try { const user = auth.currentUser; if(user) { await deleteDoc(doc(db, "users", user.uid)); await deleteUser(user); alert("Silindi."); window.location.reload(); } } 
            catch(e) { alert("Güvenlik nedeniyle tekrar giriş yapmalısınız."); }
        }
    };

    window.openLegalModal = function() {
        window.openModal('⚖️ Kullanıcı Sözleşmesi ve Hakları', `
            <div style="max-height: 400px; overflow-y: auto; font-size: 13px; color: var(--text-dark); line-height: 1.6; padding-right: 5px; text-align:left;">
                <h4 style="margin-top:0; color:var(--primary);">1. Taraflar ve Kapsam</h4><p>Bu sözleşme, UniLoop platformunu kullanan üyeler için geçerlidir...</p>
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
            if (chat.status === 'pending' && chat.initiator !== window.userProfile.uid) {
                hasNotif = true;
                html += `
                    <div class="notif-compact-item" style="border-left: 4px solid var(--primary);">
                        <div style="display:flex; align-items:center; gap:10px; flex:1;"><div style="font-size:24px;">👋</div><div><div style="font-weight:800; font-size:14px; color:var(--text-dark);">${chat.name}</div><div style="font-size:12px; color:var(--text-gray);">Bağlantı kurmak istiyor.</div></div></div>
                        <div style="display:flex; gap:5px;"><button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; background:#10B981; border-color:#10B981; box-shadow:none;" onclick="window.acceptChatRequest('${chat.id}')">Kabul</button><button class="btn-danger" style="padding:6px 12px; font-size:12px; border-radius:8px; box-shadow:none;" onclick="window.rejectChatRequest('${chat.id}')">Red</button></div>
                    </div>
                `;
            }
        });

        chatsDB.forEach(chat => {
            if (chat.status === 'accepted') {
                if (chat.messages && chat.messages.length > 0) {
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
                        hasNotif = true;
                        let msgPreview = lastMsg.text || 'Yeni Medya';
                        html += `
                            <div class="notif-compact-item" style="cursor:pointer;" onclick="window.openChatViewDirect('${chat.id}'); window.closeModal();">
                                <div style="display:flex; align-items:center; gap:10px; flex:1;"><div style="font-size:24px;">💬</div><div style="flex:1; min-width:0;"><div style="font-weight:800; font-size:14px; color:var(--text-dark);">${chat.name}</div><div style="font-size:12px; color:var(--primary); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Yeni: ${msgPreview}</div></div></div>
                            </div>
                        `;
                    }
                }
            }
        });

        if (!hasNotif) { html += `<div style="text-align:center; padding:30px 10px; color:var(--text-gray);"><div style="font-size:40px; margin-bottom:10px;">🔔</div><div style="font-size:14px;">Şu an için yeni bir bildiriminiz yok.</div></div>`; }
        html += '</div>'; window.openModal('🔔 Bildirimler', html);
    };

    window.loadPage = function(page) {
        document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
        const targetNav = document.querySelector(`.bottom-nav-item[data-target="${page}"]`);
        if(targetNav) targetNav.classList.add('active');

        window.scrollTo(0, 0);
        document.body.classList.remove('no-scroll-messages');
        document.body.classList.remove('no-scroll-home');
        
        switch(page) {
            case 'home': window.renderHome(); break;
            case 'voice': window.renderVoice(); break; 
            case 'popularity': window.renderPopularity(); break; 
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

// ============================================================================
// 🌟 JS BÖLÜM 2 SONU 🌟
// ============================================================================

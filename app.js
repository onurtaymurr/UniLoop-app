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

// Eşleşme değişkenleri (Hızlı Eşleşme)
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

window.tournamentInterval = null;
window.homeSliderInterval = null; 

window.registrationData = { interests: [] };
window.resetCurrentChatId = function() { currentChatId = null; };

// KULLANICI KAYDI İÇİN FAKÜLTE LİSTESİ
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

// TURNUVA DEĞİŞKENLERİ
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
        .white-flame-icon { filter: grayscale(100%) brightness(200%); text-shadow: 0 0 8px rgba(255,255,255,0.8); cursor:pointer; font-size:24px; transition: 0.2s; display:inline-block; }
        .white-flame-icon:hover { transform: scale(1.15) rotate(5deg); }
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

// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE v3.0 (PURPLE/MODERN EDITION) 🌟
// ============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore, collection, addDoc, onSnapshot, query, orderBy,
    serverTimestamp, doc, setDoc, getDoc, updateDoc, arrayUnion, where, getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// --- GÜNCEL FIREBASE YAPILANDIRMASI ---
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
    uid: "", name: "", surname: "", username: "", email: "", university: "",
    avatar: "👨‍🎓", faculty: "", department: "", grade: "", bio: "",
    avatarUrl: "", age: "", isPremium: false, interests: [], purpose: ""
};

window.joinedFaculties = [];
let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;

// ============================================================================
// 🎓 ONBOARDING (4 ADIMLI PROFİL OLUŞTURMA) SİSTEMİ
// ============================================================================
window._onboardingData = {};

window.showOnboarding = function() {
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    if (onboardingOverlay) {
        onboardingOverlay.style.display = 'flex';
    } else {
        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0F172A; z-index: 99999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px; box-sizing: border-box;`;
        overlay.innerHTML = window.getOnboardingHTML();
        document.body.appendChild(overlay);
    }
    window.showOnboardingStep(1);
};

window.getOnboardingHTML = function() {
    return `
        <div style="width: 100%; max-width: 480px; margin: auto;">
            <div style="margin-bottom: 32px; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
                    <div id="ob-step-dot-1" style="width: 10px; height: 10px; border-radius: 50%; background: #8B5CF6; transition: all 0.3s;"></div>
                    <div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-1" style="height: 100%; width: 0%; background: #8B5CF6; transition: width 0.4s;"></div></div>
                    <div id="ob-step-dot-2" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
                    <div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-2" style="height: 100%; width: 0%; background: #8B5CF6; transition: width 0.4s;"></div></div>
                    <div id="ob-step-dot-3" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
                    <div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-3" style="height: 100%; width: 0%; background: #8B5CF6; transition: width 0.4s;"></div></div>
                    <div id="ob-step-dot-4" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
                    <div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-4" style="height: 100%; width: 0%; background: #8B5CF6; transition: width 0.4s;"></div></div>
                    <div id="ob-step-dot-5" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
                </div>
                <span id="ob-step-label" style="font-size: 13px; color: #64748B; font-family: 'Plus Jakarta Sans', sans-serif;">Adım 1 / 5</span>
            </div>
            <div id="ob-step-container" style="background: #1E293B; border-radius: 24px; padding: 32px; border: 1px solid #334155; min-height: 420px; display: flex; flex-direction: column;">
            </div>
        </div>
    `;
};

window.showOnboardingStep = function(step) {
    const container = document.getElementById('ob-step-container');
    const label = document.getElementById('ob-step-label');
    if (!container) return;

    for (let i = 1; i <= 5; i++) {
        const dot = document.getElementById(`ob-step-dot-${i}`);
        const line = document.getElementById(`ob-line-${i}`);
        if (dot) dot.style.background = i <= step ? '#8B5CF6' : '#1E293B';
        if (dot) dot.style.width = i === step ? '14px' : '10px';
        if (dot) dot.style.height = i === step ? '14px' : '10px';
        if (line && i < step) line.style.width = '100%';
        else if (line) line.style.width = '0%';
    }
    if (label) label.textContent = `Adım ${step} / 5`;

    const stepTitles = ['', '👋 Temel Bilgiler', '🎓 Akademik Bilgiler', '✨ İlgi Alanların', '🎯 Kullanım Amacın', '📸 Profil Fotoğrafı'];

    let stepHTML = `
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 800; color: #F1F5F9; margin: 0 0 6px 0;">${stepTitles[step]}</h2>
            <p id="ob-step-desc" style="font-size: 14px; color: #94A3B8; margin: 0;"></p>
        </div>
        <div id="ob-step-body" style="flex: 1; display: flex; flex-direction: column; gap: 14px;"></div>
        <div style="margin-top: 24px; display: flex; gap: 12px;">
            ${step > 1 ? `<button onclick="window.showOnboardingStep(${step - 1})" style="flex: 1; padding: 14px; border-radius: 14px; border: 1px solid #334155; background: transparent; color: #94A3B8; font-size: 15px; cursor: pointer; font-weight: 600;">← Geri</button>` : ''}
            <button id="ob-next-btn" onclick="window.onboardingNext(${step})" style="flex: 2; padding: 14px; border-radius: 14px; border: none; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(139,92,246,0.4);">
                ${step === 5 ? '🚀 Ağa Giriş Yap!' : 'Devam Et →'}
            </button>
        </div>
    `;

    container.innerHTML = stepHTML;
    container.style.opacity = '0'; container.style.transform = 'translateY(10px)'; container.style.transition = 'all 0.3s ease';
    setTimeout(() => { container.style.opacity = '1'; container.style.transform = 'translateY(0)'; }, 50);

    const desc = document.getElementById('ob-step-desc');
    const body = document.getElementById('ob-step-body');

    if (step === 1) {
        desc.textContent = 'Seni tanıyalım! Birkaç temel bilgi paylaş.';
        body.innerHTML = `
            <div>
                <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Yaşın</label>
                <input type="number" id="ob-age" min="16" max="35" value="${window._onboardingData.age || ''}" placeholder="Örn: 21" 
                    style="width: 100%; margin-top: 8px; padding: 14px 16px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #F1F5F9; font-size: 16px; outline: none; box-sizing: border-box;" onfocus="this.style.borderColor='#8B5CF6'" onblur="this.style.borderColor='#334155'">
            </div>
            <div>
                <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Instagram Kullanıcı Adın</label>
                <div style="display: flex; align-items: center; margin-top: 8px; background: #0F172A; border: 1px solid #334155; border-radius: 12px; overflow: hidden;" id="ob-ig-wrapper">
                    <span style="padding: 14px 12px 14px 16px; color: #8B5CF6; font-weight: 700; font-size: 16px;">@</span>
                    <input type="text" id="ob-instagram" value="${window._onboardingData.instagram || ''}" placeholder="kullaniciadi"
                        style="flex: 1; border: none; background: transparent; color: #F1F5F9; font-size: 15px; outline: none; padding: 14px 16px 14px 0;" onfocus="document.getElementById('ob-ig-wrapper').style.borderColor='#8B5CF6'" onblur="document.getElementById('ob-ig-wrapper').style.borderColor='#334155'">
                </div>
            </div>
        `;
    } else if (step === 2) {
        desc.textContent = 'Hangi fakülte ve bölümde okuyorsun?';
        const faculties = ['Tıp Fakültesi', 'Hukuk Fakültesi', 'Diş Hekimliği Fakültesi', 'Bilgisayar Fakültesi', 'Eczacılık Fakültesi', 'Mühendislik Fakültesi', 'İktisadi ve İdari Bilimler', 'Eğitim Fakültesi', 'Fen-Edebiyat Fakültesi', 'Mimarlık Fakültesi'];
        const grades = ['Hazırlık', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', 'Yüksek Lisans', 'Doktora'];
        const inputStyle = `width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #F1F5F9; font-size: 15px; outline: none; box-sizing: border-box; cursor:pointer;`;
        body.innerHTML = `
            <div>
                <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Fakülte</label>
                <select id="ob-faculty" style="${inputStyle} margin-top: 8px;" onfocus="this.style.borderColor='#8B5CF6'" onblur="this.style.borderColor='#334155'">
                    <option value="">Fakülten seç...</option>
                    ${faculties.map(f => `<option value="${f}" ${window._onboardingData.faculty === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Bölüm</label>
                <input type="text" id="ob-department" value="${window._onboardingData.department || ''}" placeholder="Örn: Bilgisayar Mühendisliği"
                    style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #F1F5F9; font-size: 15px; outline: none; box-sizing: border-box; margin-top: 8px;" onfocus="this.style.borderColor='#8B5CF6'" onblur="this.style.borderColor='#334155'">
            </div>
            <div>
                <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase;">Sınıf</label>
                <select id="ob-grade" style="${inputStyle} margin-top: 8px;" onfocus="this.style.borderColor='#8B5CF6'" onblur="this.style.borderColor='#334155'">
                    <option value="">Sınıfın seç...</option>
                    ${grades.map(g => `<option value="${g}" ${window._onboardingData.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (step === 3) {
        desc.textContent = 'Nelerden hoşlanırsın? İstediğin kadar seç!';
        const interests = ['🎮 Oyun', '🎵 Müzik', '📚 Kitap', '🏋️ Spor', '🎨 Sanat', '💻 Teknoloji', '🍕 Yemek', '✈️ Seyahat', '🎬 Film & Dizi', '📸 Fotoğrafçılık', '🎭 Tiyatro', '🌿 Doğa', '💃 Dans', '🧠 Bilim'];
        const selected = window._onboardingData.interests || [];
        body.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start;">
                ${interests.map(i => `
                    <button class="ob-interest-btn" data-interest="${i}" onclick="window.toggleInterest(this, '${i}')"
                        style="padding: 10px 16px; border-radius: 100px; border: 1px solid ${selected.includes(i) ? '#8B5CF6' : '#334155'}; background: ${selected.includes(i) ? 'rgba(139,92,246,0.2)' : 'transparent'}; color: ${selected.includes(i) ? '#C4B5FD' : '#94A3B8'}; font-size: 14px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                        ${i}
                    </button>
                `).join('')}
            </div>
            <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 4px;"><span id="ob-interest-count">${selected.length}</span> ilgi alanı seçildi</p>
        `;
    } else if (step === 4) {
        desc.textContent = 'Sistemi ne için kullanmak istiyorsun?';
        const purposes = [
            { icon: '📖', label: 'Ders arkadaşı arıyorum', value: 'study' },
            { icon: '🤝', label: 'Sosyalleşmek istiyorum', value: 'social' },
            { icon: '💼', label: 'Staj & kariyer fırsatı', value: 'career' },
            { icon: '🛒', label: 'Kampüs market alışverişi', value: 'market' }
        ];
        const selectedPurpose = window._onboardingData.purpose || '';
        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${purposes.map(p => `
                    <button class="ob-purpose-btn" data-purpose="${p.value}" onclick="window.selectPurpose(this, '${p.value}')"
                        style="padding: 16px 20px; border-radius: 14px; border: 1px solid ${selectedPurpose === p.value ? '#8B5CF6' : '#334155'}; background: ${selectedPurpose === p.value ? 'rgba(139,92,246,0.15)' : 'transparent'}; color: ${selectedPurpose === p.value ? '#C4B5FD' : '#94A3B8'}; font-size: 15px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 14px; text-align: left; transition: all 0.2s;">
                        <span style="font-size: 22px;">${p.icon}</span><span>${p.label}</span>
                        ${selectedPurpose === p.value ? '<span style="margin-left: auto; color: #8B5CF6; font-size: 18px;">✓</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
    } else if (step === 5) {
        desc.textContent = 'Son adım! Bir profil fotoğrafı ekle.';
        const hasAvatar = window._onboardingData.avatarPreview;
        body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 10px 0;">
                <div id="ob-avatar-preview" style="width: 120px; height: 120px; border-radius: 50%; background: ${hasAvatar ? 'transparent' : '#0F172A'}; border: 3px dashed #334155; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; position: relative; transition: all 0.2s;" onclick="document.getElementById('ob-avatar-file').click()">
                    ${hasAvatar ? `<img src="${window._onboardingData.avatarPreview}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="text-align: center;"><div style="font-size: 32px;">📷</div><div style="font-size: 11px; color: #475569; margin-top: 6px;">Fotoğraf Seç</div></div>`}
                </div>
                <input type="file" id="ob-avatar-file" accept="image/*" style="display: none;" onchange="window.previewOnboardingAvatar(this)">
                <button onclick="document.getElementById('ob-avatar-file').click()" style="padding: 12px 28px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #C4B5FD; font-size: 14px; cursor: pointer; font-weight: 600;">
                    ${hasAvatar ? '🔄 Fotoğrafı Değiştir' : '📤 Fotoğraf Yükle'}
                </button>
                <p style="font-size: 13px; color: #475569; text-align: center; margin: 0;">Şimdi eklemek zorunda değilsin.<br>Profilinden sonra da ekleyebilirsin.</p>
            </div>
        `;
    }
};

window.toggleInterest = function(btn, interest) {
    if (!window._onboardingData.interests) window._onboardingData.interests = [];
    const idx = window._onboardingData.interests.indexOf(interest);
    if (idx === -1) {
        window._onboardingData.interests.push(interest);
        btn.style.borderColor = '#8B5CF6'; btn.style.background = 'rgba(139,92,246,0.2)'; btn.style.color = '#C4B5FD';
    } else {
        window._onboardingData.interests.splice(idx, 1);
        btn.style.borderColor = '#334155'; btn.style.background = 'transparent'; btn.style.color = '#94A3B8';
    }
    const countEl = document.getElementById('ob-interest-count');
    if (countEl) countEl.textContent = window._onboardingData.interests.length;
};

window.selectPurpose = function(btn, purpose) {
    window._onboardingData.purpose = purpose;
    document.querySelectorAll('.ob-purpose-btn').forEach(b => {
        b.style.borderColor = '#334155'; b.style.background = 'transparent'; b.style.color = '#94A3B8';
    });
    btn.style.borderColor = '#8B5CF6'; btn.style.background = 'rgba(139,92,246,0.15)'; btn.style.color = '#C4B5FD';
    window.showOnboardingStep(4);
};

window.previewOnboardingAvatar = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        window._onboardingData.avatarPreview = e.target.result;
        window._onboardingData.avatarFile = input.files[0];
        const preview = document.getElementById('ob-avatar-preview');
        if (preview) { preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`; preview.style.border = '3px solid #8B5CF6'; }
    };
    reader.readAsDataURL(input.files[0]);
};

window.onboardingNext = async function(step) {
    if (step === 1) {
        const age = document.getElementById('ob-age')?.value; const instagram = document.getElementById('ob-instagram')?.value;
        if (!age || parseInt(age) < 16) { window.showOnboardingError('Lütfen geçerli bir yaş girin.'); return; }
        window._onboardingData.age = age; window._onboardingData.instagram = instagram;
        window.showOnboardingStep(2);
    } else if (step === 2) {
        const faculty = document.getElementById('ob-faculty')?.value; const department = document.getElementById('ob-department')?.value; const grade = document.getElementById('ob-grade')?.value;
        if (!faculty) { window.showOnboardingError('Lütfen fakültenizi seçin.'); return; }
        if (!department) { window.showOnboardingError('Lütfen bölümünüzü girin.'); return; }
        if (!grade) { window.showOnboardingError('Lütfen sınıfınızı seçin.'); return; }
        window._onboardingData.faculty = faculty; window._onboardingData.department = department; window._onboardingData.grade = grade;
        window.showOnboardingStep(3);
    } else if (step === 3) {
        if (!window._onboardingData.interests || window._onboardingData.interests.length === 0) { window.showOnboardingError('Lütfen en az 1 ilgi alanı seçin.'); return; }
        window.showOnboardingStep(4);
    } else if (step === 4) {
        if (!window._onboardingData.purpose) { window.showOnboardingError('Lütfen bir kullanım amacı seçin.'); return; }
        window.showOnboardingStep(5);
    } else if (step === 5) {
        await window.completeOnboarding();
    }
};

window.showOnboardingError = function(msg) {
    const existing = document.getElementById('ob-error-msg');
    if (existing) existing.remove();
    const err = document.createElement('div');
    err.id = 'ob-error-msg'; err.style.cssText = 'background: rgba(239,68,68,0.15); border: 1px solid #EF4444; border-radius: 10px; padding: 10px 14px; color: #FCA5A5; font-size: 13px; text-align: center; margin-top: -8px;';
    err.textContent = '⚠️ ' + msg;
    const nextBtn = document.getElementById('ob-next-btn');
    if (nextBtn && nextBtn.parentElement) nextBtn.parentElement.insertBefore(err, nextBtn.parentElement.firstChild);
    setTimeout(() => { if (err.parentElement) err.remove(); }, 3000);
};

window.completeOnboarding = async function() {
    const btn = document.getElementById('ob-next-btn');
    if (btn) { btn.textContent = '⏳ Kaydediliyor...'; btn.disabled = true; }
    try {
        const updateData = {
            age: window._onboardingData.age || '', instagram: window._onboardingData.instagram || '',
            faculty: window._onboardingData.faculty || '', department: window._onboardingData.department || '', grade: window._onboardingData.grade || '',
            interests: window._onboardingData.interests || [], purpose: window._onboardingData.purpose || '', onboardingComplete: true
        };
        if (window._onboardingData.avatarFile) {
            const fileName = "avatar_" + window.userProfile.uid + "_" + Date.now() + ".jpg";
            const storageRef = ref(storage, 'avatars/' + fileName);
            await uploadBytes(storageRef, window._onboardingData.avatarFile);
            updateData.avatarUrl = await getDownloadURL(storageRef);
            window.userProfile.avatarUrl = updateData.avatarUrl;
        }
        await updateDoc(doc(db, "users", window.userProfile.uid), updateData);
        Object.assign(window.userProfile, updateData);
        
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) { overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.5s'; setTimeout(() => overlay.remove(), 500); }
        
        window.renderBottomNav();
        window.loadPage('home');
    } catch (e) {
        console.error(e);
        if (btn) { btn.textContent = '🚀 Ağa Giriş Yap!'; btn.disabled = false; }
        window.showOnboardingError('Hata oluştu: ' + e.message);
    }
};

// ============================================================================
// BAŞLANGIÇ & CSS ENJEKSİYONU
// ============================================================================
const FACULTY_PASSCODES = {
    "Tıp Fakültesi": "tıp100", "Hukuk Fakültesi": "hukuk100", "Diş Hekimliği Fakültesi": "dis100",
    "Bilgisayar Fakültesi": "comp100", "Eczacılık Fakültesi": "ecza100"
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
    // ✂️ CROPPER.JS ENJEKSİYONU
    const cropperCss = document.createElement('link'); cropperCss.rel = 'stylesheet'; cropperCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css'; document.head.appendChild(cropperCss);
    const cropperJs = document.createElement('script'); cropperJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js'; document.head.appendChild(cropperJs);
    
    // 🎨 DINAMIK CSS ENJEKSIYONU (Mor Tema ve Bottom Nav Uyumluluğu)
    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        :root {
            --primary: #8B5CF6; 
            --primary-hover: #7C3AED;
            --bg-color: #F8FAFC;
            --card-bg: #FFFFFF;
            --text-dark: #0F172A;
            --text-gray: #64748B;
            --border-color: #E2E8F0;
        }
        .dark-mode {
            --bg-color: #0F172A; --card-bg: #1E293B; --text-dark: #F1F5F9; --text-gray: #94A3B8; --border-color: #334155;
        }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        #bottom-nav {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 9000;
            background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
            border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-around;
            padding: 8px 4px calc(8px + env(safe-area-inset-bottom)); height: 68px; box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
        }
        .dark-mode #bottom-nav { background: rgba(15,23,42,0.95); border-top-color: #1E293B;}
        .bottom-nav-item {
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            flex: 1; cursor: pointer; padding: 6px 4px; border-radius: 12px; transition: all 0.2s; border: none; background: none;
            color: var(--text-gray); font-size: 11px; font-weight: 700;
        }
        .bottom-nav-item .nav-icon { font-size: 24px; transition: transform 0.2s; }
        .bottom-nav-item.active { color: var(--primary); }
        .bottom-nav-item.active .nav-icon { transform: translateY(-2px) scale(1.1); color: var(--primary); }

        #app-screen { padding-bottom: 80px !important; }
        #main-content { padding-bottom: 20px !important; }

        .premium-glow { animation: glowPulse 2s infinite alternate; }
        @keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.4); } 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8); } }
        
        #app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; }
        #app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; }
        
        .market-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-top: 20px;}
        .feed-layout-container { height: calc(100vh - 130px); display: flex; flex-direction: column; overflow: hidden; margin: -20px; background: transparent; }
        #conf-feed { flex: 1; overflow-y: auto; padding: 15px; scroll-behavior: smooth; max-width: 600px !important; margin: 0 auto !important; width: 100%;}
        .feed-post { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 20px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        
        .user-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; width: 100%; }
        .user-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 20px; padding: 20px 10px; text-align: center; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s; cursor: pointer; min-height: 180px;}
        .user-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 12px 24px rgba(139,92,246,0.1); }
        
        .swipe-cards-wrapper { display: flex; gap: 14px; overflow-x: auto; padding: 4px 0 16px; scrollbar-width: none; -ms-overflow-style: none; }
        .swipe-cards-wrapper::-webkit-scrollbar { display: none; }
        .swipe-request-card { min-width: 150px; background: var(--card-bg); border-radius: 20px; padding: 20px 16px; text-align: center; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.04); flex-shrink: 0; }
        
        #chat-layout-container { height: calc(100vh - 140px) !important; max-height: 800px; overflow: hidden !important; display: flex; flex-direction: row; }
        .chat-sidebar { overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; }
        .chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; }
        #chat-messages-scroll { flex: 1 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth; }
        
        @media (max-width: 1024px) {
            #chat-layout-container { height: calc(100vh - 180px) !important; }
            .chat-sidebar { width: 100%; display: block; }
            .chat-active .chat-sidebar { display: none !important; }
            .chat-main { display: none !important; }
            .chat-active .chat-main { display: flex !important; }
        }

        .cropper-view-box, .cropper-face { border-radius: 50%; }
        .cropper-view-box { outline: 0; box-shadow: 0 0 0 1px #8B5CF6; }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.4); border-radius: 10px; }
    `;
    document.head.appendChild(styleFix);

    // ============================================================================
    // ALT NAVİGASYON BARI (BOTTOM NAV)
    // ============================================================================
    window.renderBottomNav = function() {
        const existing = document.getElementById('bottom-nav');
        if (existing) existing.remove();

        const nav = document.createElement('div');
        nav.id = 'bottom-nav';

        const items = [
            { icon: '🏠', label: 'Ana Sayfa', page: 'home' },
            { icon: '🔮', label: 'Anonim', page: 'confessions' },
            { icon: '💬', label: 'Mesajlar', page: 'messages' },
            { icon: '🏛️', label: 'Fakülteler', page: 'faculties' },
            { icon: '👤', label: 'Profil', page: 'profile' },
        ];

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'bottom-nav-item';
            btn.setAttribute('data-page', item.page);
            btn.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.loadPage(item.page);
            });
            nav.appendChild(btn);
        });

        document.body.appendChild(nav);
        window.updateBottomNavActive('home');
    };

    window.updateBottomNavActive = function(page) {
        document.querySelectorAll('.bottom-nav-item').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-page') === page);
        });
    };

    const bind = (id, event, callback) => { const el = document.getElementById(id); if (el) { el.addEventListener(event, callback); } };

    // ============================================================================
    // GİRİŞ, KAYIT VE DOĞRULAMA (AUTH)
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
            const val = this.value; uniList.innerHTML = ''; if (!val) return false;
            const matches = globalUniversities.filter(u => u.toLowerCase().includes(val.toLowerCase()));
            matches.forEach(match => {
                const div = document.createElement('div');
                div.innerHTML = match.replace(new RegExp(`(${val})`, "gi"), "<strong>$1</strong>");
                div.addEventListener('click', function() { uniInput.value = match; uniList.innerHTML = ''; });
                uniList.appendChild(div);
            });
        });
        document.addEventListener('click', (e) => { if(e.target !== uniInput) { uniList.innerHTML = ''; } });
    }

    bind('register-btn', 'click', async (e) => {
        if(e) e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const surname = document.getElementById('reg-surname').value.trim();
        const uni = document.getElementById('reg-uni').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if(!name || !surname || !uni || !email || !password) { alert("Lütfen tüm alanları eksiksiz doldurun."); return; }
        const btn = document.getElementById('register-btn'); const origText = btn.innerText;
        btn.innerText = "Oluşturuluyor..."; btn.disabled = true;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;
            document.getElementById('register-card').style.display = 'none';
            document.getElementById('verify-card').style.display = 'block';
            btn.innerText = origText; btn.disabled = false;

            sendEmailVerification(user).catch(err => { console.error("Mail gönderilemedi:", err); });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid, name: name, surname: surname, username: "", university: uni,
                email: email, avatar: "👨‍🎓", avatarUrl: "", bio: "", age: "", isOnline: false,
                faculty: "", department: "", grade: "", interests: [], purpose: "", isPremium: false,
                onboardingComplete: false
            });
        } catch (error) { alert("Kayıt olurken bir hata oluştu: " + error.message); btn.innerText = origText; btn.disabled = false; }
    });

    bind('verify-code-btn', 'click', async (e) => {
        if(e) e.preventDefault();
        const user = auth.currentUser;
        if(!user) { alert("Oturum zaman aşımına uğradı. Lütfen sayfayı yenileyip giriş yapın."); return; }
        const btn = document.getElementById('verify-code-btn'); const originalText = btn.innerText;
        btn.innerText = "Kontrol Ediliyor..."; btn.disabled = true;
        try {
            await user.reload();
            if(user.emailVerified) { alert("Tebrikler! Hesabınız aktifleştirildi."); window.location.reload(); } 
            else { alert("Hesabınız henüz onaylanmamış! Lütfen e-postanıza gelen linke tıklayın."); btn.innerText = originalText; btn.disabled = false; }
        } catch (err) { alert("Hata: " + err.message); btn.innerText = originalText; btn.disabled = false; }
    });

    bind('login-btn', 'click', async (e) => {
        if(e) e.preventDefault();
        const email = document.getElementById('login-email').value.trim(); const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        if(!email || !password) { alert("Lütfen e-posta ve şifrenizi girin."); return; }
        const originalText = btn.innerText; btn.innerText = "Giriş Yapılıyor..."; btn.disabled = true;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            if(!userCred.user.emailVerified) {
                alert("Hesabınız henüz onaylanmamış."); document.getElementById('login-card').style.display = 'none'; document.getElementById('verify-card').style.display = 'block';
                btn.innerText = originalText; btn.disabled = false; return;
            }
        } catch (error) { alert("Giriş başarısız! E-posta veya şifreniz yanlış."); btn.innerText = originalText; btn.disabled = false; }
    });

    bind('forgot-password-btn', 'click', async (e) => {
        if(e) e.preventDefault();
        const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
        if(!email) return;
        try { await sendPasswordResetEmail(auth, email); alert("Şifre sıfırlama bağlantısı gönderildi!"); } 
        catch (error) { alert("Hata: " + error.message); }
    });

    window.logout = async function() {
        try {
            if(window.userProfile.uid) await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
            await signOut(auth);
            const bottomNav = document.getElementById('bottom-nav'); if (bottomNav) bottomNav.remove();
            if(authScreen && appScreen) {
                appScreen.style.display = 'none'; authScreen.style.display = 'flex';
                document.getElementById('login-card').style.display = 'block'; document.getElementById('register-card').style.display = 'none'; document.getElementById('verify-card').style.display = 'none';
                const btn = document.getElementById('login-btn'); if(btn) { btn.innerText = "Giriş Yap"; btn.disabled = false; }
            }
        } catch(error) { console.error("Çıkış hatası:", error); }
    };

    // ============================================================================
    // OTURUM KONTROLÜ VE REALTIME LISTENERLAR
    // ============================================================================
    onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) {
            if(authScreen && appScreen) { authScreen.style.display = 'none'; appScreen.style.display = 'block'; }
            try {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if(docSnap.exists()) {
                    window.userProfile = docSnap.data();
                    if(!window.userProfile.isPremium) window.userProfile.isPremium = false;
                    if(window.userProfile.onboardingComplete === undefined) window.userProfile.onboardingComplete = false;
                }
                await updateDoc(doc(db, "users", user.uid), { isOnline: true });
                initRealtimeListeners(user.uid);

                if (!window.userProfile.onboardingComplete) {
                    window.showOnboarding();
                } else {
                    window.renderBottomNav();
                    window.loadPage('home');
                }
            } catch(error) { console.error(error); }
        }
    });

    window.addEventListener("beforeunload", () => {
        if(window.userProfile && window.userProfile.uid) { updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false }); }
    });

    function initRealtimeListeners(currentUid) {
        const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

        onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
            marketDB = [];
            snapshot.forEach(d => { marketDB.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }); });
            marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            const activePage = document.querySelector('.bottom-nav-item.active');
            if(activePage && activePage.getAttribute('data-page') === 'market') window.renderListings('market', '🛒 Kampüs Market');
        });

        onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
            confessionsDB = [];
            snapshot.forEach(d => { confessionsDB.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }); });
            confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            const activePage = document.querySelector('.bottom-nav-item.active');
            if(activePage && activePage.getAttribute('data-page') === 'confessions') window.drawConfessionsFeed();
        });

        onSnapshot(query(collection(db, "chats"), where("participants", "array-contains", currentUid)), (snapshot) => {
            chatsDB = [];
            snapshot.forEach(d => {
                try {
                    const data = d.data({ serverTimestamps: 'estimate' });
                    if (!data.participants) return;
                    const otherUid = data.participants.find(p => p !== currentUid) || "system";
                    const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
                    const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
                    let safeTimestamp = data.lastUpdated && typeof data.lastUpdated.toMillis === 'function' ? data.lastUpdated.toMillis() : Date.now();
                    chatsDB.push({
                        id: d.id, otherUid, name: otherName, avatar: otherAvatar,
                        messages: data.messages || [], status: data.status || 'accepted',
                        initiator: data.initiator || null, lastUpdatedTS: safeTimestamp
                    });
                } catch(err) { console.error(err); }
            });
            chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
            const activePage = document.querySelector('.bottom-nav-item.active');
            if(activePage && activePage.getAttribute('data-page') === 'messages') {
                if (currentChatId) { window.renderMessagesSidebarOnly(); window.updateChatMessagesOnly(currentChatId); }
                else { window.renderMessages(); }
            }
            if(activePage && activePage.getAttribute('data-page') === 'home') window.renderHome();
        });
    }

    // ============================================================================
    // MODAL & LIGHTBOX
    // ============================================================================
    window.openModal = function(title, contentHTML) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = contentHTML;
        modal.classList.add('active'); document.body.style.overflow = 'hidden';
    };
    window.closeModal = function() {
        modal.classList.remove('active'); document.getElementById('modal-body').innerHTML = '';
        if (!document.getElementById('lightbox').classList.contains('active')) document.body.style.overflow = 'auto';
    };
    bind('modal-close', 'click', window.closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) window.closeModal(); });

    window.currentLightboxImages = []; window.currentLightboxIndex = 0;
    window.openLightbox = function(imagesJsonStr, index) {
        window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr));
        window.currentLightboxIndex = index; window.updateLightboxView();
        document.getElementById('lightbox').classList.add('active'); document.body.style.overflow = 'hidden';
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
        const imgEl = document.getElementById('lightbox-img'); const counterEl = document.getElementById('lightbox-counter');
        if(imgEl && counterEl) { imgEl.src = window.currentLightboxImages[window.currentLightboxIndex]; counterEl.innerText = (window.currentLightboxIndex + 1) + " / " + window.currentLightboxImages.length; }
    };
    window.resetCurrentChatId = function() { currentChatId = null; };

    // ============================================================================
    // ANA SAYFA (HOME) YENİLENEN TASARIM VE İSTEKLER
    // ============================================================================
    window.renderHome = async function() {
        let usernameWarning = !window.userProfile.username 
            ? `<div style="background: #FEF2F2; color: #DC2626; padding: 14px 18px; border-radius: 14px; border: 1px solid #FCA5A5; margin-bottom: 18px; font-weight: bold; font-size: 14px; text-align: center; cursor:pointer;" onclick="window.loadPage('profile')"> ⚠️ Kullanıcı adını belirlemedin! Tıkla ve ekle.</div>` : '';

        const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
        let swipeRequestsHTML = '';
        if (incomingRequests.length > 0) {
            swipeRequestsHTML = `
                <div class="card" style="padding: 20px; margin-bottom: 20px; border-radius: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <h3 style="margin:0; font-size: 16px; font-weight: 800;">📩 Gelen İstekler</h3>
                        <span style="font-size: 12px; background: #8B5CF6; color: white; padding: 4px 10px; border-radius: 20px; font-weight: 700;">${incomingRequests.length}</span>
                    </div>
                    <div class="swipe-cards-wrapper">
                        ${incomingRequests.map(req => {
                            let avatarHtml = req.avatar && req.avatar.startsWith('http') ? `<img src="${req.avatar}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; margin: 0 auto 12px; display:block;">` : `<div style="width:60px; height:60px; border-radius:50%; background:#F5F3FF; color:#8B5CF6; display:flex; align-items:center; justify-content:center; font-size:28px; margin: 0 auto 12px;">${req.avatar || '👤'}</div>`;
                            return `
                                <div class="swipe-request-card">
                                    ${avatarHtml}
                                    <div style="font-weight: 800; font-size: 14px; color: var(--text-dark); margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${req.name.split(' ')[0]}</div>
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        <button onclick="window.acceptRequest('${req.id}')" style="background: #8B5CF6; color: white; border: none; border-radius: 12px; padding: 8px; font-size: 12px; cursor: pointer; font-weight: 700;">✅ Kabul Et</button>
                                        <button onclick="window.rejectRequest('${req.id}')" style="background: #F1F5F9; color: #64748B; border: none; border-radius: 12px; padding: 8px; font-size: 12px; cursor: pointer; font-weight: 700;">❌ Reddet</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        let html = `
            ${usernameWarning}
            <div class="card" style="background: linear-gradient(135deg, #0F172A, #8B5CF6); color: white; border:none; padding: 24px; border-radius: 24px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(139,92,246,0.3);">
                <h2 style="font-size:24px; margin-bottom:8px; font-weight: 800; color:white;">Merhaba, ${window.userProfile.name}! 👋</h2>
                <p style="opacity:0.9; font-size:15px; margin: 0; font-weight: 500;"><strong style="color:#C4B5FD;">${window.userProfile.university}</strong> ağındasın.</p>
            </div>

            <div onclick="window.updateBottomNavActive('market'); window.loadPage('market');" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 24px; padding: 20px 24px; margin-bottom: 20px; cursor: pointer; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 20px rgba(16,185,129,0.25); transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                <div style="font-size: 36px; background: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(5px);">🛒</div>
                <div>
                    <div style="font-size: 19px; font-weight: 800; margin-bottom: 4px;">Kampüs Market</div>
                    <div style="font-size: 14px; opacity: 0.9; font-weight: 500;">İkinci el ürünleri keşfet & sat →</div>
                </div>
            </div>

            ${swipeRequestsHTML}

            <div class="card" style="padding: 24px; border-radius: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <h2 style="margin:0; font-size:18px; font-weight: 800;">🔥 Önerilen Kişiler</h2>
                </div>
                <div class="user-grid" id="home-users-grid">
                    <div style="grid-column: 1 / -1; text-align:center; padding: 20px; color:var(--text-gray);">Kullanıcılar yükleniyor...</div>
                </div>
            </div>
        `;
        mainContent.innerHTML = html;

        try {
            const querySnapshot = await getDocs(query(collection(db, "users")));
            let usersHtml = ''; let count = 0; const interactedUids = chatsDB.map(c => c.otherUid);
            querySnapshot.forEach((d) => {
                const u = d.data();
                if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid) && count < 10) {
                    count++;
                    const initial = u.surname ? u.surname.charAt(0) + '.' : '';
                    let avatarHtml = u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:68px; height:68px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">` : `<div style="width:68px; height:68px; border-radius:50%; background:#F5F3FF; color:#8B5CF6; display:flex; align-items:center; justify-content:center; font-size:32px; border:2px solid var(--border-color); margin:0 auto;">${u.avatar || '👤'}</div>`;
                    usersHtml += `
                        <div class="user-card" onclick="window.viewUserProfile('${u.uid}')">
                            <div style="margin-bottom: 12px;">${avatarHtml}</div>
                            <div style="font-weight:800; font-size:15px; color:var(--text-dark);">${u.name} ${initial}</div>
                            <div style="font-size:12px; color:var(--text-gray); margin-top:4px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 95%; text-align: center; font-weight: 500;">${u.faculty || u.department || 'Kampüs Öğrencisi'}</div>
                            <button class="btn-primary" style="margin-top:14px; padding:10px; font-size:13px; border-radius:12px; width:100%; box-shadow:none; font-weight: 700; background: #F5F3FF; color: #8B5CF6;" onclick="event.stopPropagation(); window.sendFriendRequest('${u.uid}', '${u.name} ${initial}')">➕ İstek Gönder</button>
                        </div>
                    `;
                }
            });
            document.getElementById('home-users-grid').innerHTML = usersHtml || '<p style="grid-column: 1 / -1; text-align:center; color:var(--text-gray);">Önerecek yeni kullanıcı bulunamadı.</p>';
        } catch(e) { console.error(e); }
    };

    window.sendFriendRequest = async function(targetUserId, targetUserName) {
        try {
            const myUid = auth.currentUser.uid;
            await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid,
                messages: [{ senderId: "system", text: "Arkadaşlık isteği gönderildi.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
            });
            alert("Arkadaşlık isteği gönderildi! 🚀");
        } catch (error) { alert("Hata: " + error.message); }
    };

    window.acceptRequest = async function(chatId) {
        try { await updateDoc(doc(db, "chats", chatId), { status: 'accepted', lastUpdated: serverTimestamp() }); window.loadPage('home'); } 
        catch(error) { alert("Hata: " + error.message); }
    };
    
    window.rejectRequest = async function(chatId) {
        try { await deleteDoc(doc(db, "chats", chatId)); window.loadPage('home'); } 
        catch(error) { alert("Hata: " + error.message); }
    };

    window.viewUserProfile = async function(targetUid) {
        if(targetUid === window.userProfile.uid) { window.loadPage('profile'); return; }
        try {
            const docSnap = await getDoc(doc(db, "users", targetUid));
            if (docSnap.exists()) {
                const u = docSnap.data();
                let avatarHtml = u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--border-color); margin: 0 auto; display: block;">` : `<div style="width:100px; height:100px; border-radius:50%; background:#F5F3FF; color:#8B5CF6; display:flex; align-items:center; justify-content:center; font-size:44px; border:3px solid var(--border-color); margin:0 auto;">${u.avatar || '👤'}</div>`;
                const existingChat = chatsDB.find(c => c.otherUid === u.uid);
                let btnHtml = '';
                if (existingChat && existingChat.status === 'accepted') {
                    btnHtml = `<button class="btn-primary" style="width:100%; padding:14px; border-radius:14px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
                } else if (existingChat && existingChat.status === 'pending') {
                    btnHtml = `<button class="btn-primary" disabled style="width:100%; padding:14px; border-radius:14px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
                } else {
                    btnHtml = `<button class="btn-primary" style="width:100%; padding:14px; border-radius:14px;" onclick="window.sendFriendRequest('${u.uid}', '${u.name}'); window.closeModal();">➕ Arkadaş Ekle</button>`;
                }
                
                window.openModal('Öğrenci Profili', `
                    <div style="text-align:center;">
                        ${avatarHtml}
                        <h3 style="margin: 12px 0 4px 0; font-size:20px; font-weight:800;">${u.name} ${u.surname}</h3>
                        <p style="color:#8B5CF6; font-size:15px; font-weight:bold; margin-bottom:12px;">${u.faculty || 'Fakülte Belirtilmemiş'}</p>
                        <div style="background:#F8FAFC; padding:16px; border-radius:16px; text-align:left; margin-bottom: 20px;">
                            <strong style="font-size:12px; color:#64748B; text-transform:uppercase;">Hakkında</strong>
                            <p style="font-size:15px; margin-top:6px; line-height:1.5; font-weight:500;">${u.bio || "Henüz bir biyografi eklemedi."}</p>
                        </div>
                        ${btnHtml}
                    </div>
                `);
            }
        } catch (e) { console.error(e); }
    };

    // ============================================================================
    // KAMPÜS MARKET (İLAN EKLEME VE LİSTELEME)
    // ============================================================================
    window.renderListings = function(type, title) {
        let html = `<div class="card" style="border-radius:24px;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;"> <h2 style="margin:0;">${title}</h2> <button class="btn-primary" style="width:auto; padding: 12px 20px; border-radius:14px;" onclick="window.openListingForm('${type}')">+ Yeni İlan</button> </div> <input type="text" id="local-search-input" class="local-search-bar" placeholder="İlan ara..."> <div class="market-grid" id="listings-grid-container"></div> </div>`;
        mainContent.innerHTML = html;
        window.drawListingsGrid(type, '');
        const searchInput = document.getElementById('local-search-input');
        if(searchInput) { searchInput.addEventListener('input', (e) => { window.drawListingsGrid(type, e.target.value.toLowerCase()); }); }
    };

    window.drawListingsGrid = function(type, filterText) {
        const container = document.getElementById('listings-grid-container'); if(!container) return;
        const filteredData = marketDB.filter(item => item.type === type && (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText)));
        if(filteredData.length === 0) { container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok.</p>`; return; }
        let gridHtml = '';
        filteredData.forEach(item => {
            let imgHtml = item.isPdf ? `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#F8FAFC;"><span style="font-size:40px;">📄</span><span style="font-size:12px; font-weight:bold; color:#EF4444; margin-top:5px;">PDF</span></div>` 
            : (item.imgUrl ? `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">` : `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`);
            gridHtml += `<div class="item-card" onclick="window.openListingDetail('${item.id}')"> <div class="item-img-large">${imgHtml}</div> <div class="item-details"> <div class="item-title">${item.title}</div> <div class="item-price-large">${item.price} ${item.currency || '₺'}</div> </div> </div>`;
        });
        container.innerHTML = gridHtml;
    };

    window.openListingDetail = function(docId) {
        const item = marketDB.find(i => i.id === docId); if(!item) return;
        let imgHtml = '', indicatorsHtml = '';
        if (item.isPdf) { imgHtml = `<div style="width:100%; height:200px; background:#F8FAFC; border:2px dashed #EF4444; border-radius:16px; margin-bottom:16px; display:flex; align-items:center; justify-content:center; flex-direction:column;"><span style="font-size:50px;">📄</span></div>`; } 
        else if (item.imgUrls && item.imgUrls.length > 0) {
            imgHtml += '<div class="image-gallery" style="height:220px; border-radius:16px; margin-bottom:16px;">';
            const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
            item.imgUrls.forEach((url, i) => {
                imgHtml += `<div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;"><img src="${url}" alt="İlan" style="border-radius:16px;"></div>`;
                indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`;
            });
            imgHtml += '</div>';
            if(item.imgUrls.length > 1) imgHtml += `<div class="gallery-indicators" style="bottom: 25px;">${indicatorsHtml}</div>`;
        } else if (item.imgUrl) {
            const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
            imgHtml = `<img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:220px; object-fit:cover; border-radius:16px; margin-bottom:16px; cursor:pointer;">`;
        }

        let actionButtonsHtml = '';
        const currentUid = window.userProfile.uid;
        const existingChat = chatsDB.find(c => c.otherUid === item.sellerId);
        if (item.sellerId === currentUid) {
            actionButtonsHtml = `<div style="display:flex; gap:10px; margin-top: 16px;"> <button class="action-btn" style="flex:1; padding:12px; border-radius:12px;" onclick="window.editListing('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${item.price}')">✏️ Güncelle</button> <button class="btn-danger" style="flex:1; padding:12px; border-radius:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button> </div>`;
        } else if (existingChat && existingChat.status === 'accepted') {
            actionButtonsHtml = `<button class="btn-primary" style="margin-top: 16px; padding:14px; border-radius:14px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
        } else if (existingChat && existingChat.status === 'pending') {
            actionButtonsHtml = `<button class="btn-primary" disabled style="margin-top: 16px; padding:14px; border-radius:14px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
        } else {
            actionButtonsHtml = `<button class="btn-primary" style="margin-top: 16px; padding:14px; border-radius:14px;" onclick="window.sendFriendRequest('${item.sellerId}', '${item.sellerName}'); window.closeModal();">➕ İstek Gönder</button>`;
        }

        window.openModal(item.title, `<div style="position:relative;">${imgHtml}</div> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;"> <div style="font-size:22px; font-weight:800; color:#059669;">${item.price} ${item.currency || '₺'}</div> <div style="font-size:12px; color:var(--text-gray); background:#F3F4F6; padding:5px 10px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div> </div> <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F8FAFC; padding:16px; border-radius:16px; border:1px solid var(--border-color);">${item.desc}</div> ${actionButtonsHtml}`);
    };

    window.openListingForm = function(type) {
        window.openModal('🛒 Yeni İlan Ekle', `<div class="form-group"><input type="text" id="new-item-title" placeholder="İlan Başlığı"></div> <div class="form-group" style="display: flex; gap: 10px;"> <input type="number" id="new-item-price" placeholder="Fiyat" style="flex: 2;"> <select id="new-item-currency" style="flex: 1;"> <option value="₺">TL (₺)</option> <option value="$">Dolar ($)</option> <option value="€">Euro (€)</option> </select> </div> <div class="form-group"><textarea id="new-item-desc" rows="3" placeholder="Açıklama..."></textarea></div> <div class="upload-btn-wrapper" style="margin-bottom:15px;"> <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf veya 📄 PDF Seç</button> <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;" /> </div> <div id="preview-container" class="preview-container" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;"></div> <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')" style="border-radius:12px; padding:14px; font-size:16px;">İlanı Yayınla</button> <p id="upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none;">Dosyalar Yükleniyor...</p>`);
        setTimeout(() => {
            const photoBtn = document.getElementById('photo-trigger-btn'); const photoInput = document.getElementById('new-item-photo');
            if(photoBtn && photoInput) {
                photoBtn.addEventListener('click', () => { photoInput.click(); });
                photoInput.addEventListener('change', function(e) {
                    const files = Array.from(e.target.files).slice(0, 3);
                    const previewContainer = document.getElementById('preview-container'); previewContainer.innerHTML = '';
                    files.forEach(file => {
                        if (file.type === "application/pdf") { previewContainer.innerHTML += `<div style="width:70px; height:70px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#F8FAFC; border:1px solid var(--border-color);"><span style="font-size:30px;">📄</span></div>`; } 
                        else { const reader = new FileReader(); reader.onload = function(event) { previewContainer.innerHTML += `<div style="width:70px; height:70px; border-radius:8px; overflow:hidden; border:1px solid var(--border-color);"><img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover;"></div>`; }; reader.readAsDataURL(file); }
                    });
                });
            }
        }, 100);
    };

    window.submitListing = async function(type) {
        const titleEl = document.getElementById('new-item-title'), priceEl = document.getElementById('new-item-price'), currencyEl = document.getElementById('new-item-currency'), descEl = document.getElementById('new-item-desc'), photoInput = document.getElementById('new-item-photo'), statusEl = document.getElementById('upload-status'), btn = document.getElementById('publish-listing-btn');
        const title = titleEl.value.trim(), price = priceEl.value.trim(), currency = currencyEl.value, desc = descEl.value.trim();
        if (title === "" || price === "" || desc === "") { alert("Lütfen tüm alanları doldurun."); return; }
        let files = photoInput.files ? Array.from(photoInput.files).slice(0, 3) : [];
        if(files.length === 0) { alert("Lütfen en az 1 dosya seçin."); return; }
        
        btn.disabled = true; statusEl.style.display = 'block';
        let imgUrlsArray = []; let isPdf = files[0].type === "application/pdf";
        try {
            for (let file of files) {
                const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/' + Date.now() + '_' + file.name.replace(/\s/g, ''));
                await uploadBytes(storageRef, file);
                imgUrlsArray.push(await getDownloadURL(storageRef));
            }
            await addDoc(collection(db, "listings"), {
                type, title, price, currency, desc, imgUrls: imgUrlsArray, imgUrl: imgUrlsArray.length > 0 ? imgUrlsArray[0] : "", isPdf,
                sellerId: window.userProfile.uid, sellerName: window.userProfile.name + " " + window.userProfile.surname, createdAt: serverTimestamp()
            });
            window.closeModal(); alert("İlanınız yayınlandı!");
        } catch (error) { alert("Hata: " + error.message); } 
        finally { statusEl.style.display = 'none'; btn.disabled = false; }
    };

    window.deleteListing = async function(docId) {
        if(confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
            try { await deleteDoc(doc(db, "listings", docId)); alert("İlan silindi!"); } catch(e) { alert("Hata: " + e.message); }
        }
    };
    window.editListing = async function(docId, oldTitle, oldPrice) {
        let newPrice = prompt(`"${oldTitle}" için yeni fiyat:`, oldPrice);
        if(newPrice !== null && newPrice.trim() !== "") {
            try { await updateDoc(doc(db, "listings", docId), { price: newPrice.trim() }); alert("Güncellendi!"); } catch(e) { alert("Hata: " + e.message); }
        }
    };

    // ============================================================================
    // ANONİM KAMPÜS (CONFESSIONS)
    // ============================================================================
    window.drawConfessionsFeed = function() {
        mainContent.innerHTML = `<div class="feed-layout-container"> <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px 20px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 24px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);"> <h2 style="margin:0; font-size: 20px; font-weight: 800;">🔮 Anonim Kampüs</h2> <button class="btn-primary" style="width:auto; padding: 10px 20px; border-radius: 16px; font-size: 14px;" onclick="window.openConfessionForm()">+ Paylaş</button> </div> <div class="confessions-feed" id="conf-feed"></div> </div>`;
        const feed = document.getElementById('conf-feed');
        if(confessionsDB.length === 0) { feed.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding: 40px 20px;"><div style="font-size:40px; margin-bottom: 10px;">🔮</div>Henüz paylaşım yok. İlk sen yaz!</div>`; return; }
        
        let html = '<div style="display:flex; flex-direction:column;">';
        confessionsDB.forEach((post) => {
            let imgHtml = post.imgUrl ? `<img src="${post.imgUrl}" class="feed-post-img" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">` : '';
            let deleteBtnHtml = post.authorId === window.userProfile.uid ? `<button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">🗑️ Sil</button>` : '';
            let avatarHtml = post.avatar && post.avatar.startsWith('http') ? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` : post.avatar;
            html += `<div class="feed-post"> <div class="feed-post-header"> <div class="feed-post-avatar" style="font-size: 26px;">${avatarHtml}</div> <div class="feed-post-meta"> <span class="feed-post-author">${post.user}</span> <span class="feed-post-time">${post.time || 'Az önce'}</span> </div> </div> <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div> ${imgHtml} <div class="feed-post-actions"> <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">💬 Yorum Yap (${post.comments ? post.comments.length : 0})</button> ${deleteBtnHtml} </div> </div>`;
        });
        html += '</div>'; feed.innerHTML = html;
    };

    window.openConfessionForm = function() {
        window.openModal('Yeni Gönderi', `<div class="form-group"> <label>Kimliğinizi Seçin</label> <select id="new-conf-identity" style="width:100%; padding:14px; border-radius:12px; border:1px solid var(--border-color);"><option value="anon">🤫 Anonim Olarak Paylaş</option><option value="real">👤 İsmimle Paylaş (${window.userProfile.username || window.userProfile.name})</option></select> </div> <textarea id="new-conf-text" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:15px; margin-top:10px; resize:none; outline:none; border: 1px solid var(--border-color);" placeholder="Aklından ne geçiyor?..."></textarea> <div class="upload-btn-wrapper" style="margin: 12px 0;"> <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf Ekle (İsteğe Bağlı)</button> <input type="file" id="new-conf-photo" accept="image/*" style="display:none;" /> </div> <div id="conf-preview-container" class="preview-container"></div> <button class="btn-primary" id="publish-conf-btn" onclick="window.submitConfession()" style="padding:14px; font-size:16px; border-radius:12px;">Paylaş</button> <p id="conf-upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none;">Yükleniyor...</p>`);
        setTimeout(() => {
            const photoBtn = document.getElementById('conf-photo-trigger-btn'); const photoInput = document.getElementById('new-conf-photo');
            if(photoBtn && photoInput) {
                photoBtn.addEventListener('click', () => { photoInput.click(); });
                photoInput.addEventListener('change', function(e) {
                    if(e.target.files[0]) {
                        const reader = new FileReader(); reader.onload = function(event) { document.getElementById('conf-preview-container').innerHTML = `<div class="preview-box" style="width:100%; height:auto; padding:0; border:none; margin-bottom:15px;"><img src="${event.target.result}" style="width:100%; max-height:200px; object-fit:contain; border-radius:12px; border:1px solid var(--border-color);"></div>`; }; reader.readAsDataURL(e.target.files[0]);
                    }
                });
            }
        }, 100);
    };

    window.submitConfession = async function() {
        const textEl = document.getElementById('new-conf-text'), identityEl = document.getElementById('new-conf-identity'), photoInput = document.getElementById('new-conf-photo'), btn = document.getElementById('publish-conf-btn'), statusEl = document.getElementById('conf-upload-status');
        if(!textEl || textEl.value.trim() === '') { alert("Lütfen bir şeyler yazın."); return; }
        btn.disabled = true; let imgUrl = "";
        if(photoInput && photoInput.files && photoInput.files.length > 0) {
            statusEl.style.display = 'block';
            try {
                const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/feed_' + Date.now());
                await uploadBytes(storageRef, photoInput.files[0]); imgUrl = await getDownloadURL(storageRef);
            } catch(err) { alert("Fotoğraf yüklenemedi: " + err.message); btn.disabled = false; statusEl.style.display = 'none'; return; }
        }
        const isAnon = identityEl.value === 'anon';
        const authorName = isAnon ? "Anonim Kullanıcı" : (window.userProfile.username || window.userProfile.name);
        const authorAvatar = isAnon ? ["👻","👽","🤖","🦊","🎭"][Math.floor(Math.random()*5)] : window.userProfile.avatarUrl || window.userProfile.avatar;
        try {
            await addDoc(collection(db, "confessions"), { authorId: window.userProfile.uid, avatar: authorAvatar, user: authorName, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: textEl.value.trim(), imgUrl, comments: [], createdAt: serverTimestamp() });
            window.closeModal();
        } catch(e) { alert("Hata: " + e.message); btn.disabled = false; }
    };

    window.deleteConfession = async function(docId) {
        if(confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
            try { await deleteDoc(doc(db, "confessions", docId)); } catch(e) { alert("Hata: " + e.message); }
        }
    };

    window.openConfessionDetail = function(docId) {
        window.openModal('Gönderi', `<div id="confession-detail-container">Yükleniyor...</div>`);
        window.updateConfessionDetailLive(docId);
    };

    window.updateConfessionDetailLive = function(docId) {
        const container = document.getElementById('confession-detail-container'); if(!container) return;
        const post = confessionsDB.find(p => p.id === docId); if(!post) { container.innerHTML = "Gönderi bulunamadı."; return; }
        let imgHtml = post.imgUrl ? `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:16px; max-height:300px; object-fit:contain; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">` : '';
        let commentsHtml = '';
        if(!post.comments || post.comments.length === 0) { commentsHtml = '<p style="text-align:center; padding:15px; color:var(--text-gray); font-size:14px;">Henüz yorum yok.</p>'; } 
        else { post.comments.forEach(c => { commentsHtml += `<div style="padding:12px; border-radius:12px; margin-bottom:8px; background:#F8FAFC; border:1px solid var(--border-color);"><div style="font-weight:800; color:var(--text-dark); margin-bottom:4px; font-size:13px;">${c.user}</div><div style="font-size:14px; color:var(--text-dark);">${c.text}</div></div>`; }); }
        let avatarHtml = post.avatar && post.avatar.startsWith('http') ? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` : post.avatar;
        
        container.innerHTML = `<div style="margin-bottom:18px;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;"> <div class="feed-post-avatar" style="width:44px; height:44px; font-size:26px;">${avatarHtml}</div> <div><div style="font-weight:bold; font-size:15px;">${post.user}</div><div style="font-size:12px; color:var(--text-gray);">${post.time}</div></div> </div> <div style="font-size:15px; margin-bottom:14px; line-height:1.6; color:var(--text-dark);">${post.text.replace(/\n/g, '<br>')}</div> ${imgHtml} </div> <div style="border-top:1px solid var(--border-color); padding-top:14px; margin-bottom:14px;"> <h4 style="margin-bottom:10px; font-size:14px; font-weight:bold;">Yorumlar (${post.comments ? post.comments.length : 0})</h4> <div style="max-height: 220px; overflow-y: auto;" id="conf-comments-scroll">${commentsHtml}</div> </div> <div style="display:flex; gap:10px; align-items:center; background:inherit; padding:10px; border-radius:12px; border:1px solid var(--border-color);"> <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:14px;" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')"> <button class="btn-primary" style="width:auto; padding:8px 14px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button> </div>`;
        const scrollBox = document.getElementById('conf-comments-scroll'); if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
    };

    window.submitConfessionComment = async function(docId) {
        const input = document.getElementById('new-conf-comment');
        if(input && input.value.trim() !== '') {
            try { await updateDoc(doc(db, "confessions", docId), { comments: arrayUnion({ user: window.userProfile.username || window.userProfile.name, text: input.value.trim() }) }); } 
            catch(e) { alert("Yorum gönderilemedi: " + e.message); }
        }
    };

    // ============================================================================
    // MESAJLAŞMA (CHAT)
    // ============================================================================
    window.renderMessages = function() {
        mainContent.innerHTML = `<div class="card" style="padding:0; border:none; background:transparent;"> <div class="chat-layout" id="chat-layout-container"> <div class="chat-sidebar" id="sidebar-container" style="background:var(--card-bg); border-radius:20px 0 0 20px; overflow:hidden;"></div> <div class="chat-main" id="chat-main-view" style="background:#F8FAFC; border-radius:0 20px 20px 0;"> <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-gray); opacity:0.7;"> <div style="font-size:48px; margin-bottom:10px;">💬</div> <div style="font-weight:600;">Sol taraftan bir sohbet seçin.</div> </div> </div> </div> </div>`;
        window.renderMessagesSidebarOnly();
        const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
        if(currentChatId && visibleChats.find(c => c.id === currentChatId)) window.openChatView(currentChatId);
    };

    window.renderMessagesSidebarOnly = function() {
        const sidebar = document.querySelector('.chat-sidebar'); if(!sidebar) return;
        const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
        let html = `<div class="chat-sidebar-header">Mesajlarım</div>`;
        if (visibleChats.length === 0) html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Henüz mesajınız yok.</p>`;
        visibleChats.forEach(chat => {
            const lastMsgObj = chat.messages[chat.messages.length - 1];
            let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
            if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) rawLastMsg = "⏳ İstek gönderildi...";
            const previewMsg = rawLastMsg.replace(/<[^>]+>/g, '').substring(0, 35) + (rawLastMsg.length > 35 ? "..." : "");
            const isActive = chat.id === currentChatId ? 'active' : '';
            let avatarHtml = chat.avatar && chat.avatar.startsWith('http') ? `<img src="${chat.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">` : `<div style="width:48px; height:48px; border-radius:50%; background:#F5F3FF; color:#8B5CF6; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0;">${chat.avatar || '👤'}</div>`;
            html += `<div class="chat-contact ${isActive}" onclick="window.openChatView('${chat.id}')"> ${avatarHtml} <div class="chat-contact-info"> <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="font-weight:800; font-size:14px;">${chat.name}</span><span style="font-size:11px; color:#9CA3AF;">${lastMsgObj ? lastMsgObj.time : ""}</span></div> <div style="font-size:13px; color:var(--text-gray);">${previewMsg}</div> </div> </div>`;
        });
        sidebar.innerHTML = html;
    };

    window.updateChatMessagesOnly = function(chatId) {
        const activeChat = chatsDB.find(c => c.id === chatId); if(!activeChat) return;
        const scrollBox = document.getElementById('chat-messages-scroll'); if(!scrollBox) return;
        let chatHTML = '';
        activeChat.messages.forEach(msg => {
            const type = msg.senderId === window.userProfile.uid ? 'sent' : 'received';
            let ticks = type === 'sent' ? (msg.read ? '<span style="color:#D1D5DB; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>' : '<span style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>') : '';
            chatHTML += `<div class="bubble ${type}"><div class="msg-text">${msg.text}</div><div style="display:flex; align-items:center; justify-content:flex-end; font-size:10px; opacity:0.7; margin-top:4px;">${msg.time} ${ticks}</div></div>`;
        });
        scrollBox.innerHTML = chatHTML; scrollBox.scrollTop = scrollBox.scrollHeight;
    };

    window.openChatView = function(chatId) {
        currentChatId = chatId; const activeChat = chatsDB.find(c => c.id === chatId); if(!activeChat) return;
        let hasUnread = false;
        const updatedMessages = activeChat.messages.map(msg => {
            if (msg.senderId !== window.userProfile.uid && msg.read === false) { hasUnread = true; return { ...msg, read: true }; }
            return msg;
        });
        if (hasUnread) { updateDoc(doc(db, "chats", chatId), { messages: updatedMessages }); activeChat.messages = updatedMessages; }
        
        window.renderMessagesSidebarOnly();
        const container = document.getElementById('chat-main-view'); document.getElementById('chat-layout-container').classList.add('chat-active');
        let avatarHtml = activeChat.avatar && activeChat.avatar.startsWith('http') ? `<img src="${activeChat.avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover;">` : `<div style="width:42px; height:42px; border-radius:50%; background:#F5F3FF; color:#8B5CF6; display:flex; align-items:center; justify-content:center; font-size:22px; margin:0;">${activeChat.avatar || '👤'}</div>`;
        
        let chatHTML = `<div class="chat-header"> <button class="back-btn" onclick="document.getElementById('chat-layout-container').classList.remove('chat-active'); window.resetCurrentChatId();" style="border:none; background:none; font-size:24px; cursor:pointer; color:var(--text-gray); margin-right:10px;">←</button> ${avatarHtml} <div> <div style="font-weight:800; font-size:16px; cursor:pointer;" onclick="window.viewUserProfile('${activeChat.otherUid}')">${activeChat.name}</div> <div style="font-size:12px; color:#10B981; font-weight:600;">UniLoop Ağı</div> </div> </div> <div class="chat-messages" id="chat-messages-scroll"></div>`;
        if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
            chatHTML += `<div style="padding: 16px; text-align: center; color: var(--text-gray); background: white; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ İsteğinizin kabul edilmesi bekleniyor...</div>`;
        } else {
            chatHTML += `<div class="chat-input-area"> <div class="chat-input-wrapper"><input type="text" id="chat-input-field" placeholder="Mesaj yazın..." onkeypress="if(event.key==='Enter') window.sendMsg('${chatId}')"></div> <button class="chat-send-btn" onclick="window.sendMsg('${chatId}')">➤</button> </div>`;
        }
        container.innerHTML = chatHTML; window.updateChatMessagesOnly(chatId);
        const inputField = document.getElementById('chat-input-field'); if(inputField && window.innerWidth > 1024) inputField.focus();
    };

    window.sendMsg = async function(chatId) {
        const input = document.getElementById('chat-input-field');
        if(input && input.value.trim() !== '') {
            try {
                const text = input.value.trim(); input.value = '';
                await updateDoc(doc(db, "chats", chatId), {
                    messages: arrayUnion({ senderId: window.userProfile.uid, text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }),
                    lastUpdated: serverTimestamp()
                });
            } catch(error) { console.error("Mesaj gönderilemedi: ", error); }
        }
    };

    window.openChatViewDirect = function(chatId) {
        window.updateBottomNavActive('messages'); window.loadPage('messages'); setTimeout(() => window.openChatView(chatId), 200);
    };

    // ============================================================================
    // FAKÜLTELER (FORUM) SİSTEMİ
    // ============================================================================
    window.currentFacultyPosts = [];
    window.renderFaculties = function() {
        const faculties = [
            { name: "Tıp Fakültesi", icon: "🩺", color: "linear-gradient(135deg, #EF4444, #B91C1C)", desc: "Tıp öğrencileri için özel ağ" },
            { name: "Diş Hekimliği Fakültesi", icon: "🦷", color: "linear-gradient(135deg, #06B6D4, #0891B2)", desc: "Diş hekimliği topluluğu" },
            { name: "Bilgisayar Fakültesi", icon: "💻", color: "linear-gradient(135deg, #3B82F6, #1D4ED8)", desc: "Yazılım ve teknoloji ağı" },
            { name: "Eczacılık Fakültesi", icon: "💊", color: "linear-gradient(135deg, #10B981, #047857)", desc: "Eczacılık öğrencileri" },
            { name: "Hukuk Fakültesi", icon: "⚖️", color: "linear-gradient(135deg, #8B5CF6, #6D28D9)", desc: "Hukuk topluluğu" },
        ];
        let html = `<div class="card" style="padding: 0; overflow: hidden; border-radius: 24px;"> <div style="padding: 24px 24px 0;"> <h2 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">🏛️ Fakülteler</h2> <p style="color: var(--text-gray); font-size: 15px; margin: 0 0 24px 0;">Fakülte kodunla giriş yap ve topluluğuna katıl.</p> </div> <div style="display: flex; flex-direction: column; gap: 0;">`;
        faculties.forEach((f, idx) => {
            const isJoined = window.joinedFaculties.some(jf => jf.name === f.name) || window.userProfile.faculty === f.name;
            html += `<div onclick="window.handleFacultyClick('${f.name}', '${f.icon}', '${f.color}')" style="display: flex; align-items: center; gap: 16px; padding: 20px 24px; cursor: pointer; border-top: ${idx > 0 ? '1px solid var(--border-color)' : 'none'}; transition: background 0.2s;" onmouseenter="this.style.background='var(--bg-color)'" onmouseleave="this.style.background='transparent'"> <div style="width: 56px; height: 56px; border-radius: 16px; background: ${f.color}; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; box-shadow:0 4px 10px rgba(0,0,0,0.1);"> ${f.icon} </div> <div style="flex: 1;"> <div style="font-weight: 800; font-size: 16px; color: var(--text-dark); margin-bottom: 4px;">${f.name}</div> <div style="font-size: 14px; color: var(--text-gray); font-weight:500;">${f.desc}</div> </div> <div style="display: flex; align-items: center; gap: 8px;"> ${isJoined ? '<span style="font-size: 12px; background: #D1FAE5; color: #065F46; padding: 4px 10px; border-radius: 20px; font-weight: 700;">✓ Üye</span>' : ''} <span style="color: var(--text-gray); font-size: 20px;">›</span> </div> </div>`;
        });
        html += `</div></div>`; mainContent.innerHTML = html;
    };

    window.handleFacultyClick = async function(name, icon, bgColor) {
        const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;
        if(isJoined) { window.loadFacultyFeed(name, icon, bgColor); }
        else {
            mainContent.innerHTML = `<div class="join-faculty-box" style="text-align:center; padding:50px 24px; background:white; border-radius:24px; border:1px solid var(--border-color); margin-top:20px; box-shadow:0 10px 25px rgba(0,0,0,0.05);"> <div style="font-size:60px; margin-bottom:20px;">${icon}</div> <h2 style="font-size:24px; margin-bottom:10px; font-weight:800;">${name}</h2> <p style="color:var(--text-gray); font-size:15px; margin-bottom:24px;">Bu alan kapalı bir ağdır. Girmek için fakülte kodunu gir.</p> <div style="max-width: 300px; margin: 0 auto 20px auto;"> <input type="text" id="faculty-passcode-input" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 16px; border: 2px solid var(--border-color); border-radius: 16px; outline:none;" placeholder="Giriş Kodunu Yaz"> </div> <button class="btn-primary" style="max-width:240px; font-size:16px; padding:16px; border-radius:16px;" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">Ağa Katıl</button> </div>`;
            window.scrollTo(0,0);
        }
    };

    window.verifyFacultyCode = async function(name, icon, bgColor) {
        const inputCode = document.getElementById('faculty-passcode-input').value.trim();
        if (FACULTY_PASSCODES[name] && inputCode.toLowerCase() === FACULTY_PASSCODES[name].toLowerCase()) {
            window.userProfile.faculty = name; window.joinedFaculties = [{name, icon, color: bgColor}];
            await updateDoc(doc(db, "users", window.userProfile.uid), { faculty: name });
            window.loadFacultyFeed(name, icon, bgColor);
        } else { alert("Hatalı kod!"); }
    };

    window.loadFacultyFeed = async function(name, icon, bgColor) {
        const activeUsersCount = Math.floor(Math.random() * 80) + 20;
        mainContent.innerHTML = `<div style="display:flex; flex-direction:column; gap:20px;"> <div style="padding:24px; background:${bgColor}; color:white; border-radius:24px; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"> <div style="display:flex; align-items:center; gap:16px;"> <div style="font-size:36px; background:rgba(255,255,255,0.2); width:64px; height:64px; display:flex; align-items:center; justify-content:center; border-radius:18px; backdrop-filter:blur(5px);">${icon}</div> <div> <h2 style="margin:0; font-size:22px; font-weight: 800; color:white;">${name}</h2> <span style="font-size:14px; opacity:0.9; font-weight:500;">Fakülte Forumu</span> </div> </div> <div style="background: rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 14px; font-weight: 800; font-size: 13px; backdrop-filter:blur(5px);">🟢 ${activeUsersCount} Çevrimiçi</div> </div> <div class="card" style="padding:20px; display:flex; gap:14px; align-items:flex-start; border-radius:20px;"> <div style="width:44px; height:44px; font-size:22px; display:flex; align-items: center; justify-content: center; flex-shrink:0; background:#F5F3FF; border-radius:50%;">${window.userProfile.avatarUrl ?`<img src="${window.userProfile.avatarUrl}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">`: window.userProfile.avatar}</div> <div style="flex:1;"> <textarea id="faculty-post-input" placeholder="Fakülteye özel bir şeyler paylaş..." style="width:100%; border:none; resize:none; outline:none; font-size:15px; background:transparent; min-height:60px;"></textarea> <div style="display:flex; justify-content:flex-end; border-top:1px solid var(--border-color); padding-top:12px; margin-top:8px;"> <button class="btn-primary" style="width:auto; padding:10px 20px; border-radius:14px; font-size:14px;" onclick="window.submitFacultyPost()">Paylaş</button> </div> </div> </div> <div id="faculty-posts-container" style="display:flex; flex-direction:column; gap:20px;"></div> </div>`;
        if(window.currentFacultyPosts.length === 0) {
            window.currentFacultyPosts.push({ id: 1, user: "Sistem Moderatörü", avatar: "🤖", text: "Fakülte forumuna hoş geldin! Bu alan yalnızca fakültendeki öğrencilere özeldir.", time: "Bugün", likes: 12, replies: 0 });
        }
        window.renderFacultyPosts();
    };

    window.submitFacultyPost = function() {
        const input = document.getElementById('faculty-post-input'); if(!input || input.value.trim() === '') return;
        window.currentFacultyPosts.unshift({ id: Date.now(), user: window.userProfile.name + " " + window.userProfile.surname, avatar: window.userProfile.avatarUrl || window.userProfile.avatar, text: input.value.trim(), time: "Az önce", likes: 0, replies: 0 });
        input.value = ''; window.renderFacultyPosts();
    };

    window.renderFacultyPosts = function() {
        const container = document.getElementById('faculty-posts-container'); if(!container) return;
        let html = '';
        window.currentFacultyPosts.forEach(post => {
            let avatarHtml = post.avatar && post.avatar.startsWith('http') ? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` : post.avatar;
            html += `<div class="card" style="padding:20px; border-radius:20px;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;"> <div style="width:44px; height:44px; font-size:22px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#F5F3FF; flex-shrink:0;">${avatarHtml}</div> <div> <div style="font-weight:800; font-size:15px; color:var(--text-dark);">${post.user}</div> <div style="font-size:12px; color:var(--text-gray); font-weight:600;">${post.time}</div> </div> </div> <div style="font-size:15px; line-height:1.6; color:var(--text-dark); margin-bottom:16px;">${post.text.replace(/\n/g, '<br>')}</div> <div style="display:flex; gap:16px; border-top:1px solid var(--border-color); padding-top:12px;"> <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; color:var(--text-gray); font-weight:700; font-size:14px;" onclick="this.style.color='var(--primary)'; this.innerHTML='💙 ${post.likes + 1}'">🤍 ${post.likes}</button> <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; color:var(--text-gray); font-weight:700; font-size:14px;">💬 ${post.replies}</button> </div> </div>`;
        });
        container.innerHTML = html;
    };

    // ============================================================================
    // PROFİL (BİLDİRİMLER, ARKADAŞLAR, DÜZENLEME)
    // ============================================================================
    window.renderProfile = function() {
        const acceptedFriends = chatsDB.filter(c => c.status === 'accepted');
        const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
        let premiumBadge = window.userProfile.isPremium ? '<span style="font-size:11px; background:#FEF3C7; color:#D97706; padding:4px 10px; border-radius:12px; font-weight:800; margin-left:8px;">🌟 Premium</span>' : '';
        let avatarHtml = window.userProfile.avatarUrl ? `<img src="${window.userProfile.avatarUrl}" style="width:110px; height:110px; border-radius:50%; border: 4px solid white; object-fit:cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">` : `<div style="width:110px; height:110px; border-radius:50%; border: 4px solid white; font-size:50px; display:flex; align-items:center; justify-content:center; background:#F5F3FF; color:#8B5CF6; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">${window.userProfile.avatar}</div>`;
        const interestTags = (window.userProfile.interests && window.userProfile.interests.length > 0) ? window.userProfile.interests.map(i => `<span class="interest-tag" style="background:rgba(139,92,246,0.1); color:#8B5CF6; font-weight:700;">${i}</span>`).join('') : '';

        mainContent.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="padding: 0; overflow: hidden; border-radius: 24px;">
                    <div style="background: linear-gradient(135deg, #0F172A, #8B5CF6); height: 130px; position: relative;"></div>
                    <div style="text-align: center; margin-top: -55px; padding: 0 24px 24px;">
                        <div style="position: relative; display: inline-block;">
                            ${avatarHtml}
                            <button onclick="document.getElementById('avatar-upload').click()" style="position: absolute; bottom: 4px; right: 4px; background: var(--primary); color: white; border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; box-shadow: 0 4px 10px rgba(139,92,246,0.4); display:flex; align-items:center; justify-content:center; font-size:16px;">📷</button>
                            <input type="file" id="avatar-upload" accept="image/*" style="display: none;" onchange="window.triggerAvatarCrop(this)">
                        </div>
                        <h2 style="margin: 12px 0 4px 0; font-size:22px; font-weight: 800;">${window.userProfile.name} ${window.userProfile.surname} ${premiumBadge}</h2>
                        <p style="color: var(--primary); font-size: 15px; margin-bottom: 4px; font-weight: 700;">${window.userProfile.username || '@kullaniciadi'}</p>
                        <p style="color: var(--text-gray); font-size: 13px; margin-bottom: 12px; font-weight:500;">🎓 ${window.userProfile.university}${window.userProfile.faculty ? ' · ' + window.userProfile.faculty : ''}${window.userProfile.grade ? ' · ' + window.userProfile.grade : ''}</p>
                        ${interestTags ? `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 12px;">${interestTags}</div>` : ''}
                    </div>
                </div>

                <div class="card" style="padding: 24px; border-radius: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800;">✏️ Profili Düzenle</h3>
                    <div class="form-group">
                        <label>Biyografi / Hobiler</label>
                        <textarea id="prof-bio" rows="3" placeholder="Kendinden biraz bahset..." style="resize:none;">${window.userProfile.bio || ''}</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
                        <div class="form-group"><label>Ad</label><input type="text" id="prof-name" value="${window.userProfile.name}"></div>
                        <div class="form-group"><label>Soyad</label><input type="text" id="prof-surname" value="${window.userProfile.surname}"></div>
                        <div class="form-group"><label>Yaş</label><input type="number" id="prof-age" value="${window.userProfile.age || ''}" placeholder="Yaşınız"></div>
                        <div class="form-group">
                            <label>Kullanıcı Adı</label>
                            <div style="display:flex; align-items:center; background:var(--bg-color); border:1px solid var(--border-color); border-radius:12px; overflow:hidden;">
                                <span style="padding-left:14px; color:var(--primary); font-weight:800; font-size:16px;">#</span>
                                <input type="text" id="prof-username" value="${(window.userProfile.username || '').replace('#', '')}" placeholder="kullaniciadi" style="border:none; background:transparent;">
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="window.saveProfile()" style="width: 100%; padding: 16px; font-size: 16px; border-radius: 16px; margin-top:20px; font-weight:800;">💾 Profili Güncelle</button>

                    ${!window.userProfile.isPremium ? `
                    <div onclick="alert('Premium özellikleri yakında!')" style="margin-top: 16px; background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 1px solid #FCD34D; border-radius: 16px; padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 16px; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                        <span style="font-size: 32px;">👑</span>
                        <div>
                            <div style="font-weight: 800; color: #92400E; font-size: 16px;">UniLoop Premium'a Geç</div>
                            <div style="font-size: 14px; color: #B45309; font-weight:600;">Özel özellikler için tıkla →</div>
                        </div>
                    </div>` : ''}

                    <button class="btn-danger" onclick="window.logout()" style="width: 100%; padding: 16px; font-size: 16px; border-radius: 16px; background: transparent; color: #EF4444; border: 2px solid #EF4444; font-weight:800; margin-top: 16px;">🚪 Çıkış Yap</button>
                </div>
            </div>
        `;
    };

    window.triggerAvatarCrop = function(inputEl) {
        if(!inputEl.files || inputEl.files.length === 0) return;
        const file = inputEl.files[0]; const reader = new FileReader();
        reader.onload = function(e) {
            window.openModal('Profil Fotoğrafını Kırp', `<div style="width: 100%; max-height: 380px; margin-bottom: 18px; display:flex; justify-content:center;"> <img id="cropper-image" src="${e.target.result}" style="max-width: 100%; display:block;"> </div> <button class="btn-primary" id="crop-upload-btn" style="width: 100%; padding: 16px; font-size: 16px; font-weight: 800; border-radius:16px;">✂️ Kırp ve Yükle</button> <p id="profile-upload-status" style="display:none; color:var(--primary); text-align:center; margin-top:10px; font-size:14px; font-weight:bold;"></p>`);
            setTimeout(() => {
                const image = document.getElementById('cropper-image');
                if (window.cropperInstance) { window.cropperInstance.destroy(); }
                window.cropperInstance = new Cropper(image, { aspectRatio: 1, viewMode: 1, dragMode: 'move', guides: false, center: false, highlight: false });
                document.getElementById('crop-upload-btn').addEventListener('click', async function() {
                    const btn = this; const statusEl = document.getElementById('profile-upload-status');
                    btn.disabled = true; btn.style.opacity = "0.7"; statusEl.style.display = 'block'; statusEl.innerText = 'Yükleniyor...';
                    window.cropperInstance.getCroppedCanvas({ width: 400, height: 400 }).toBlob(async function(blob) {
                        try {
                            const storageRef = ref(storage, 'avatars/avatar_' + window.userProfile.uid + "_" + Date.now() + ".png");
                            await uploadBytes(storageRef, blob);
                            const url = await getDownloadURL(storageRef);
                            window.userProfile.avatarUrl = url;
                            await updateDoc(doc(db, "users", window.userProfile.uid), { avatarUrl: url });
                            window.closeModal(); window.renderProfile();
                        } catch(err) { statusEl.innerText = "❌ " + err.message; statusEl.style.color = "red"; btn.disabled = false; btn.style.opacity = "1"; }
                    }, 'image/png');
                });
            }, 200);
        };
        reader.readAsDataURL(file);
    };

    window.saveProfile = async function() {
        const name = document.getElementById('prof-name').value; const surname = document.getElementById('prof-surname').value;
        const bio = document.getElementById('prof-bio').value; const age = document.getElementById('prof-age').value;
        let rawUsername = document.getElementById('prof-username').value.trim().toLowerCase();
        if(!rawUsername) { alert("Kullanıcı adı boş bırakılamaz!"); return; }
        const username = '#' + rawUsername.replace(/^#/, '');
        
        if(username !== window.userProfile.username) {
            try {
                const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", username)));
                if(!snapshot.empty) { alert("Bu kullanıcı adı alınmış."); return; }
            } catch(e) { alert("Hata: " + e.message); return; }
        }
        window.userProfile.name = name; window.userProfile.surname = surname; window.userProfile.username = username; window.userProfile.bio = bio; window.userProfile.age = age;
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { name, surname, username, bio, age });
            alert("Profil güncellendi! ✅"); window.renderProfile();
        } catch(e) { alert("Hata: " + e.message); }
    };

    // ============================================================================
    // ROUTER
    // ============================================================================
    window.loadPage = function(pageName) {
        window.scrollTo(0,0); window.updateBottomNavActive(pageName);
        if (pageName === 'home') window.renderHome();
        else if (pageName === 'confessions') window.drawConfessionsFeed();
        else if (pageName === 'messages') window.renderMessages();
        else if (pageName === 'faculties') window.renderFaculties();
        else if (pageName === 'profile') window.renderProfile();
        else if (pageName === 'market') window.renderListings('market', '🛒 Kampüs Market');
    };
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeUniLoop); } 
else { initializeUniLoop(); }

// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE v2.0 🌟
// ============================================================================
import { initializeApp } from “https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js”;
import { getAnalytics } from “https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js”;
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendEmailVerification,
sendPasswordResetEmail,
signOut,
onAuthStateChanged
} from “https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js”;
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
} from “https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js”;
import {
getStorage,
ref,
uploadBytes,
getDownloadURL
} from “https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js”;

// — GÜNCEL FIREBASE YAPILANDIRMASI —
const firebaseConfig = {
apiKey: “AIzaSyDukYf45XqFM-trtEY2MdTY8thd8iXl20I”,
authDomain: “uniloop-app.firebaseapp.com”,
projectId: “uniloop-app”,
storageBucket: “uniloop-app.firebasestorage.app”,
messagingSenderId: “272654005890”,
appId: “1:272654005890:web:0b1dd388364e86d22f269b”,
measurementId: “G-PJ0XE1PXH5”
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// — SİSTEM HAFIZASI (GLOBAL DEĞİŞKENLER) —
window.userProfile = {
uid: “”, name: “”, surname: “”, username: “”, email: “”, university: “”,
avatar: “👨‍🎓”, faculty: “”, department: “”, grade: “”, bio: “”,
avatarUrl: “”, age: “”, isPremium: false, interests: [], purpose: “”
};

window.joinedFaculties = [];
let marketDB = [];
let confessionsDB = [];
let chatsDB = [];
let currentChatId = null;

// ============================================================================
// 🎓 ONBOARDİNG (4 ADIMLI PROFİL OLUŞTURMA) SİSTEMİ
// ============================================================================

// Onboarding geçici veri deposu
window._onboardingData = {};

window.showOnboarding = function() {
const onboardingOverlay = document.getElementById(‘onboarding-overlay’);
if (onboardingOverlay) {
onboardingOverlay.style.display = ‘flex’;
} else {
// Onboarding overlay HTML’i body’e inject et
const overlay = document.createElement(‘div’);
overlay.id = ‘onboarding-overlay’;
overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%;  background: #0F172A; z-index: 99999; display: flex;  align-items: center; justify-content: center; overflow-y: auto; padding: 20px; box-sizing: border-box;`;
overlay.innerHTML = window.getOnboardingHTML();
document.body.appendChild(overlay);
}
window.showOnboardingStep(1);
};

window.getOnboardingHTML = function() {
return `
<div style="width: 100%; max-width: 480px; margin: auto;">
<!-- Progress Bar -->
<div style="margin-bottom: 32px; text-align: center;">
<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
<div id="ob-step-dot-1" style="width: 10px; height: 10px; border-radius: 50%; background: #6366F1; transition: all 0.3s;"></div>
<div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-1" style="height: 100%; width: 0%; background: #6366F1; transition: width 0.4s;"></div></div>
<div id="ob-step-dot-2" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
<div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-2" style="height: 100%; width: 0%; background: #6366F1; transition: width 0.4s;"></div></div>
<div id="ob-step-dot-3" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
<div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-3" style="height: 100%; width: 0%; background: #6366F1; transition: width 0.4s;"></div></div>
<div id="ob-step-dot-4" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
<div style="width: 40px; height: 2px; background: #1E293B; border-radius: 2px; overflow: hidden;"><div id="ob-line-4" style="height: 100%; width: 0%; background: #6366F1; transition: width 0.4s;"></div></div>
<div id="ob-step-dot-5" style="width: 10px; height: 10px; border-radius: 50%; background: #1E293B; transition: all 0.3s;"></div>
</div>
<span id="ob-step-label" style="font-size: 13px; color: #64748B; font-family: 'Plus Jakarta Sans', sans-serif;">Adım 1 / 5</span>
</div>

```
        <!-- Step Container -->
        <div id="ob-step-container" style="background: #1E293B; border-radius: 24px; padding: 32px; border: 1px solid #334155; min-height: 420px; display: flex; flex-direction: column;">
            <!-- Steps inject edilir -->
        </div>
    </div>
`;
```

};

window.showOnboardingStep = function(step) {
const container = document.getElementById(‘ob-step-container’);
const label = document.getElementById(‘ob-step-label’);
if (!container) return;

```
// Progress dots güncelle
for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById(`ob-step-dot-${i}`);
    const line = document.getElementById(`ob-line-${i}`);
    if (dot) dot.style.background = i <= step ? '#6366F1' : '#1E293B';
    if (dot) dot.style.width = i === step ? '14px' : '10px';
    if (dot) dot.style.height = i === step ? '14px' : '10px';
    if (line && i < step) line.style.width = '100%';
    else if (line) line.style.width = '0%';
}
if (label) label.textContent = `Adım ${step} / 5`;

const stepTitles = [
    '', 
    '👋 Temel Bilgiler',
    '🎓 Akademik Bilgiler',
    '✨ İlgi Alanların',
    '🎯 Kullanım Amacın',
    '📸 Profil Fotoğrafı'
];

let stepHTML = `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 800; color: #F1F5F9; margin: 0 0 6px 0; font-family: 'Plus Jakarta Sans', sans-serif;">${stepTitles[step]}</h2>
        <p id="ob-step-desc" style="font-size: 14px; color: #64748B; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;"></p>
    </div>
    <div id="ob-step-body" style="flex: 1; display: flex; flex-direction: column; gap: 14px;">
    </div>
    <div style="margin-top: 24px; display: flex; gap: 12px;">
        ${step > 1 ? `<button onclick="window.showOnboardingStep(${step - 1})" style="flex: 1; padding: 14px; border-radius: 14px; border: 1px solid #334155; background: transparent; color: #94A3B8; font-size: 15px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;">← Geri</button>` : ''}
        <button id="ob-next-btn" onclick="window.onboardingNext(${step})" style="flex: 2; padding: 14px; border-radius: 14px; border: none; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 4px 15px rgba(99,102,241,0.4);">
            ${step === 5 ? '🚀 UniLoop\'a Giriş Yap!' : 'Devam Et →'}
        </button>
    </div>
`;

container.innerHTML = stepHTML;
container.style.opacity = '0';
container.style.transform = 'translateY(10px)';
container.style.transition = 'all 0.3s ease';
setTimeout(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
}, 50);

const desc = document.getElementById('ob-step-desc');
const body = document.getElementById('ob-step-body');

if (step === 1) {
    desc.textContent = 'Seni tanıyalım! Birkaç temel bilgi paylaş.';
    body.innerHTML = `
        <div>
            <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Yaşın</label>
            <input type="number" id="ob-age" min="16" max="35" value="${window._onboardingData.age || ''}" placeholder="Örn: 21" 
                style="width: 100%; margin-top: 8px; padding: 14px 16px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #F1F5F9; font-size: 16px; outline: none; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif;"
                onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#334155'">
        </div>
        <div>
            <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Instagram Kullanıcı Adın</label>
            <div style="display: flex; align-items: center; margin-top: 8px; background: #0F172A; border: 1px solid #334155; border-radius: 12px; overflow: hidden;" id="ob-ig-wrapper" onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#334155'">
                <span style="padding: 14px 12px 14px 16px; color: #6366F1; font-weight: 700; font-size: 16px;">@</span>
                <input type="text" id="ob-instagram" value="${window._onboardingData.instagram || ''}" placeholder="kullaniciadi"
                    style="flex: 1; border: none; background: transparent; color: #F1F5F9; font-size: 15px; outline: none; padding: 14px 16px 14px 0; font-family: 'Plus Jakarta Sans', sans-serif;"
                    onfocus="document.getElementById('ob-ig-wrapper').style.borderColor='#6366F1'" onblur="document.getElementById('ob-ig-wrapper').style.borderColor='#334155'">
            </div>
            <p style="font-size: 12px; color: #475569; margin-top: 6px; font-family: 'Plus Jakarta Sans', sans-serif;">İsteğe bağlı — Arkadaşların seni bulabilsin</p>
        </div>
    `;
} else if (step === 2) {
    desc.textContent = 'Hangi fakülte ve bölümde okuyorsun?';
    const faculties = ['Tıp Fakültesi', 'Hukuk Fakültesi', 'Diş Hekimliği Fakültesi', 'Bilgisayar Fakültesi', 'Eczacılık Fakültesi', 'Mühendislik Fakültesi', 'İktisadi ve İdari Bilimler', 'Eğitim Fakültesi', 'Fen-Edebiyat Fakültesi', 'Mimarlık Fakültesi'];
    const grades = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', 'Yüksek Lisans', 'Doktora'];
    const inputStyle = `width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #F1F5F9; font-size: 15px; outline: none; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif;`;
    body.innerHTML = `
        <div>
            <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Fakülte</label>
            <select id="ob-faculty" style="${inputStyle} margin-top: 8px; cursor: pointer;" onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#334155'">
                <option value="">Fakülten seç...</option>
                ${faculties.map(f => `<option value="${f}" ${window._onboardingData.faculty === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
        </div>
        <div>
            <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Bölüm</label>
            <input type="text" id="ob-department" value="${window._onboardingData.department || ''}" placeholder="Örn: Bilgisayar Mühendisliği"
                style="${inputStyle} margin-top: 8px;" onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#334155'">
        </div>
        <div>
            <label style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Sınıf</label>
            <select id="ob-grade" style="${inputStyle} margin-top: 8px; cursor: pointer;" onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#334155'">
                <option value="">Sınıfın seç...</option>
                ${grades.map(g => `<option value="${g}" ${window._onboardingData.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
        </div>
    `;
} else if (step === 3) {
    desc.textContent = 'Nelerden hoşlanırsın? İstediğin kadar seç!';
    const interests = [
        '🎮 Oyun', '🎵 Müzik', '📚 Kitap', '🏋️ Spor', '🎨 Sanat',
        '💻 Teknoloji', '🍕 Yemek', '✈️ Seyahat', '🎬 Film & Dizi',
        '📸 Fotoğrafçılık', '🎭 Tiyatro', '🌿 Doğa', '💃 Dans',
        '🧠 Bilim', '🎤 Podcast', '🏊 Yüzme', '🚴 Bisiklet', '🎸 Enstrüman'
    ];
    const selected = window._onboardingData.interests || [];
    body.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start;">
            ${interests.map(i => `
                <button class="ob-interest-btn" data-interest="${i}" onclick="window.toggleInterest(this, '${i}')"
                    style="padding: 10px 16px; border-radius: 100px; border: 1px solid ${selected.includes(i) ? '#6366F1' : '#334155'}; background: ${selected.includes(i) ? 'rgba(99,102,241,0.2)' : 'transparent'}; color: ${selected.includes(i) ? '#A5B4FC' : '#94A3B8'}; font-size: 14px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; transition: all 0.2s;">
                    ${i}
                </button>
            `).join('')}
        </div>
        <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <span id="ob-interest-count">${selected.length}</span> ilgi alanı seçildi
        </p>
    `;
} else if (step === 4) {
    desc.textContent = 'UniLoop\'u ne için kullanmak istiyorsun?';
    const purposes = [
        { icon: '📖', label: 'Ders arkadaşı arıyorum', value: 'study' },
        { icon: '🤝', label: 'Sosyalleşmek istiyorum', value: 'social' },
        { icon: '💼', label: 'Staj & kariyer fırsatı', value: 'career' },
        { icon: '🏠', label: 'Ev & oda arkadaşı arıyorum', value: 'roommate' },
        { icon: '🛒', label: 'Kampüs market alışverişi', value: 'market' },
        { icon: '🎉', label: 'Etkinlik & organizasyon', value: 'events' },
    ];
    const selectedPurpose = window._onboardingData.purpose || '';
    body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${purposes.map(p => `
                <button class="ob-purpose-btn" data-purpose="${p.value}" onclick="window.selectPurpose(this, '${p.value}')"
                    style="padding: 16px 20px; border-radius: 14px; border: 1px solid ${selectedPurpose === p.value ? '#6366F1' : '#334155'}; background: ${selectedPurpose === p.value ? 'rgba(99,102,241,0.15)' : 'transparent'}; color: ${selectedPurpose === p.value ? '#A5B4FC' : '#94A3B8'}; font-size: 15px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 14px; text-align: left; transition: all 0.2s;">
                    <span style="font-size: 22px;">${p.icon}</span>
                    <span>${p.label}</span>
                    ${selectedPurpose === p.value ? '<span style="margin-left: auto; color: #6366F1; font-size: 18px;">✓</span>' : ''}
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
                ${hasAvatar ? `<img src="${window._onboardingData.avatarPreview}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="text-align: center;"><div style="font-size: 32px;">📷</div><div style="font-size: 11px; color: #475569; margin-top: 6px; font-family: 'Plus Jakarta Sans', sans-serif;">Fotoğraf Seç</div></div>`}
            </div>
            <input type="file" id="ob-avatar-file" accept="image/*" style="display: none;" onchange="window.previewOnboardingAvatar(this)">
            <button onclick="document.getElementById('ob-avatar-file').click()" style="padding: 12px 28px; border-radius: 12px; border: 1px solid #334155; background: #0F172A; color: #A5B4FC; font-size: 14px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;">
                ${hasAvatar ? '🔄 Fotoğrafı Değiştir' : '📤 Fotoğraf Yükle'}
            </button>
            <p style="font-size: 13px; color: #475569; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0;">
                Şimdi eklemek zorunda değilsin.<br>Profilinden sonra da ekleyebilirsin.
            </p>
        </div>
    `;
}
```

};

window.toggleInterest = function(btn, interest) {
if (!window._onboardingData.interests) window._onboardingData.interests = [];
const idx = window._onboardingData.interests.indexOf(interest);
if (idx === -1) {
window._onboardingData.interests.push(interest);
btn.style.borderColor = ‘#6366F1’;
btn.style.background = ‘rgba(99,102,241,0.2)’;
btn.style.color = ‘#A5B4FC’;
} else {
window._onboardingData.interests.splice(idx, 1);
btn.style.borderColor = ‘#334155’;
btn.style.background = ‘transparent’;
btn.style.color = ‘#94A3B8’;
}
const countEl = document.getElementById(‘ob-interest-count’);
if (countEl) countEl.textContent = window._onboardingData.interests.length;
};

window.selectPurpose = function(btn, purpose) {
window._onboardingData.purpose = purpose;
document.querySelectorAll(’.ob-purpose-btn’).forEach(b => {
b.style.borderColor = ‘#334155’;
b.style.background = ‘transparent’;
b.style.color = ‘#94A3B8’;
});
btn.style.borderColor = ‘#6366F1’;
btn.style.background = ‘rgba(99,102,241,0.15)’;
btn.style.color = ‘#A5B4FC’;
// Re-render to show checkmark
window.showOnboardingStep(4);
};

window.previewOnboardingAvatar = function(input) {
if (!input.files || !input.files[0]) return;
const reader = new FileReader();
reader.onload = function(e) {
window._onboardingData.avatarPreview = e.target.result;
window._onboardingData.avatarFile = input.files[0];
const preview = document.getElementById(‘ob-avatar-preview’);
if (preview) {
preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
preview.style.border = ‘3px solid #6366F1’;
}
};
reader.readAsDataURL(input.files[0]);
};

window.onboardingNext = async function(step) {
if (step === 1) {
const age = document.getElementById(‘ob-age’)?.value;
const instagram = document.getElementById(‘ob-instagram’)?.value;
if (!age || parseInt(age) < 16) { window.showOnboardingError(‘Lütfen geçerli bir yaş girin.’); return; }
window._onboardingData.age = age;
window._onboardingData.instagram = instagram;
window.showOnboardingStep(2);
} else if (step === 2) {
const faculty = document.getElementById(‘ob-faculty’)?.value;
const department = document.getElementById(‘ob-department’)?.value;
const grade = document.getElementById(‘ob-grade’)?.value;
if (!faculty) { window.showOnboardingError(‘Lütfen fakültenizi seçin.’); return; }
if (!department) { window.showOnboardingError(‘Lütfen bölümünüzü girin.’); return; }
if (!grade) { window.showOnboardingError(‘Lütfen sınıfınızı seçin.’); return; }
window._onboardingData.faculty = faculty;
window._onboardingData.department = department;
window._onboardingData.grade = grade;
window.showOnboardingStep(3);
} else if (step === 3) {
if (!window._onboardingData.interests || window._onboardingData.interests.length === 0) {
window.showOnboardingError(‘Lütfen en az 1 ilgi alanı seçin.’); return;
}
window.showOnboardingStep(4);
} else if (step === 4) {
if (!window._onboardingData.purpose) { window.showOnboardingError(‘Lütfen bir kullanım amacı seçin.’); return; }
window.showOnboardingStep(5);
} else if (step === 5) {
await window.completeOnboarding();
}
};

window.showOnboardingError = function(msg) {
const existing = document.getElementById(‘ob-error-msg’);
if (existing) existing.remove();
const err = document.createElement(‘div’);
err.id = ‘ob-error-msg’;
err.style.cssText = ‘background: rgba(239,68,68,0.15); border: 1px solid #EF4444; border-radius: 10px; padding: 10px 14px; color: #FCA5A5; font-size: 13px; text-align: center; margin-top: -8px; font-family: Plus Jakarta Sans, sans-serif;’;
err.textContent = ’⚠️ ’ + msg;
const nextBtn = document.getElementById(‘ob-next-btn’);
if (nextBtn && nextBtn.parentElement) nextBtn.parentElement.insertBefore(err, nextBtn.parentElement.firstChild);
setTimeout(() => { if (err.parentElement) err.remove(); }, 3000);
};

window.completeOnboarding = async function() {
const btn = document.getElementById(‘ob-next-btn’);
if (btn) { btn.textContent = ‘⏳ Kaydediliyor…’; btn.disabled = true; }

```
try {
    const updateData = {
        age: window._onboardingData.age || '',
        instagram: window._onboardingData.instagram || '',
        faculty: window._onboardingData.faculty || '',
        department: window._onboardingData.department || '',
        grade: window._onboardingData.grade || '',
        interests: window._onboardingData.interests || [],
        purpose: window._onboardingData.purpose || '',
        onboardingComplete: true
    };

    // Profil fotoğrafı varsa yükle
    if (window._onboardingData.avatarFile) {
        const fileName = "avatar_" + window.userProfile.uid + "_" + Date.now() + ".jpg";
        const storageRef = ref(storage, 'avatars/' + fileName);
        await uploadBytes(storageRef, window._onboardingData.avatarFile);
        const url = await getDownloadURL(storageRef);
        updateData.avatarUrl = url;
        window.userProfile.avatarUrl = url;
    }

    await updateDoc(doc(db, "users", window.userProfile.uid), updateData);
    Object.assign(window.userProfile, updateData);

    // Overlay kaldır
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }

    window.renderSidebarAccordions();
    window.renderBottomNav();
    window.loadPage('home');
} catch (e) {
    console.error(e);
    if (btn) { btn.textContent = '🚀 UniLoop\'a Giriş Yap!'; btn.disabled = false; }
    window.showOnboardingError('Hata oluştu: ' + e.message);
}
```

};

const FACULTY_PASSCODES = {
“Tıp Fakültesi”: “tıpfak100”,
“Hukuk Fakültesi”: “hukuk1000”,
“Diş Hekimliği Fakültesi”: “dis1000”,
“Bilgisayar Fakültesi”: “comp100”,
“Eczacılık Fakültesi”: “ecza100”
};

const globalUniversities = [
“Yakın Doğu Üniversitesi (NEU)”, “Doğu Akdeniz Üniversitesi (EMU)”, “Girne Amerikan Üniversitesi (GAU)”, “Uluslararası Kıbrıs Üniversitesi (CIU)”,
“Orta Doğu Teknik Üniversitesi (ODTÜ)”, “Boğaziçi Üniversitesi”, “İstanbul Teknik Üniversitesi (İTÜ)”, “Bilkent Üniversitesi”, “Koç Üniversitesi”
];

const authScreen = document.getElementById(‘auth-screen’);
const appScreen = document.getElementById(‘app-screen’);
const mainContent = document.getElementById(‘main-content’);
const modal = document.getElementById(‘app-modal’);

function initializeUniLoop() {

// ✂️ CROPPER.JS ENJEKSİYONU
const cropperCss = document.createElement(‘link’);
cropperCss.rel = ‘stylesheet’;
cropperCss.href = ‘https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css’;
document.head.appendChild(cropperCss);

const cropperJs = document.createElement(‘script’);
cropperJs.src = ‘https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js’;
document.head.appendChild(cropperJs);

// Font inject
const fontLink = document.createElement(‘link’);
fontLink.rel = ‘stylesheet’;
fontLink.href = ‘https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap’;
document.head.appendChild(fontLink);

// 🎨 DINAMIK CSS ENJEKSIYONU
const styleFix = document.createElement(‘style’);
styleFix.innerHTML = `
*, *::before, *::after { box-sizing: border-box; }
html, body { scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch; font-family: ‘Plus Jakarta Sans’, sans-serif; }

```
/* ============ BOTTOM NAV ============ */
#bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 9000;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
    border-top: 1px solid #E2E8F0;
    display: flex; align-items: center; justify-content: space-around;
    padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
    height: 64px;
}
.dark-mode #bottom-nav { background: rgba(15,23,42,0.95); border-top-color: #1E293B; }
.bottom-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    flex: 1; cursor: pointer; padding: 6px 4px;
    border-radius: 12px; transition: all 0.2s; border: none; background: none;
    color: #94A3B8; font-size: 11px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
}
.bottom-nav-item .nav-icon { font-size: 22px; transition: transform 0.2s; }
.bottom-nav-item.active { color: #6366F1; }
.bottom-nav-item.active .nav-icon { transform: scale(1.15); }
.dark-mode .bottom-nav-item { color: #475569; }
.dark-mode .bottom-nav-item.active { color: #818CF8; }

/* Main content artık bottom nav için alt boşluk bırakır */
#app-screen { padding-bottom: 70px !important; }
#main-content { padding-bottom: 20px !important; }

/* ============ MODALS ============ */
#app-modal:not(.active), #lightbox:not(.active), .modal:not(.active) { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; z-index: -999 !important; }
#app-modal.active, #lightbox.active, .modal.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; z-index: 99999 !important; }
#auth-screen { position: relative; z-index: 1000 !important; }
#auth-screen button, #auth-screen a, #auth-screen input, #auth-screen select { pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 1001 !important; }
button, .menu-item, .chat-contact, .action-btn, .btn-primary, .btn-danger { cursor: pointer !important; position: relative; pointer-events: auto !important; z-index: 10; }

/* ============ SIDEBAR ============ */
#sidebar { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; overscroll-behavior: contain; justify-content: flex-start !important; align-items: stretch !important; max-height: 100vh !important; top: 0 !important; padding-top: 75px !important; padding-bottom: 100px !important; }

/* ============ CHAT ============ */
#chat-layout-container { height: calc(100vh - 140px) !important; max-height: 800px; overflow: hidden !important; display: flex; flex-direction: row; }
.chat-sidebar { overflow-y: auto !important; height: 100% !important; -webkit-overflow-scrolling: touch !important; flex-shrink: 0; }
.chat-main { height: 100% !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; flex: 1; }
#chat-messages-scroll { flex: 1 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth; }

/* ============ FEED / CONFESSIONS ============ */
.feed-layout-container { height: calc(100vh - 130px); display: flex; flex-direction: column; overflow: hidden; margin: -20px; background: #F3F4F6; }
#conf-feed { flex: 1; overflow-y: auto; padding: 15px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; max-width: 600px !important; margin: 0 auto !important; width: 100%;}
.dark-mode .feed-layout-container, .dark-mode #conf-feed { background-color: #121212 !important; }
.feed-post { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
.feed-post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.feed-post-avatar { font-size: 24px; width: 44px; height: 44px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; border: 1px solid #E5E7EB; overflow: hidden;}
.feed-post-meta { display: flex; flex-direction: column; }
.feed-post-author { font-weight: 800; font-size: 15px; color: #111827; }
.feed-post-time { font-size: 12px; color: #6B7280; margin-top: 2px; }
.feed-post-text { font-size: 15px; margin-bottom: 12px; line-height: 1.5; color: #374151; word-break: break-word; }
.feed-post-img { width: 100%; border-radius: 12px; margin-bottom: 12px; max-height: 450px; object-fit: cover; cursor: pointer; border: 1px solid #E5E7EB; }
.feed-post-actions { display: flex; border-top: 1px solid #E5E7EB; padding-top: 12px; gap: 20px; }
.feed-action-btn { background: none; border: none; color: #6B7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; padding: 5px; outline: none; transition: 0.2s; border-radius: 8px; z-index: 10; font-family: 'Plus Jakarta Sans', sans-serif; }
.feed-action-btn:hover { color: var(--primary); background: #EEF2FF; }

/* ============ USER CARDS ============ */
.user-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; width: 100%; }
.user-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 20px; padding: 20px 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; justify-content: center; min-height: 180px; position: relative; overflow: hidden;}
.user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: var(--primary); }

/* ============ SWIPE CARDS (Gelen İstekler) ============ */
.swipe-cards-wrapper { display: flex; gap: 14px; overflow-x: auto; padding: 4px 0 12px; scrollbar-width: none; -ms-overflow-style: none; }
.swipe-cards-wrapper::-webkit-scrollbar { display: none; }
.swipe-request-card { min-width: 160px; background: white; border-radius: 18px; padding: 18px 14px; text-align: center; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); flex-shrink: 0; }
.dark-mode .swipe-request-card { background: #1e1e1e; border-color: #374151; }

/* ============ MARKET ============ */
#listings-grid-container { max-height: calc(100vh - 200px) !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; }
.answers-container { max-height: 250px !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding-right: 8px; scroll-behavior: smooth; }

/* ============ CROPPER ============ */
.cropper-view-box, .cropper-face { border-radius: 50%; }
.cropper-view-box { outline: 0; box-shadow: 0 0 0 1px #39f; }

/* ============ PREMIUM ============ */
.premium-glow { animation: glowPulse 2s infinite alternate; }
@keyframes glowPulse { 0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); } 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); } }
.premium-upgrade-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 8px; font-family: 'Plus Jakarta Sans', sans-serif; }
.premium-upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }

/* ============ DARK MODE ============ */
body.dark-mode, .dark-mode #main-content { background-color: #0F172A !important; color: #e5e7eb !important; }
.dark-mode .card, .dark-mode .feed-post, .dark-mode .item-card, .dark-mode .chat-sidebar-header, .dark-mode .user-card { background-color: #1e293b !important; border-color: #334155 !important; color: #e5e7eb !important; }
.dark-mode .card > div { border-color: #334155 !important; }
.dark-mode .feed-post-author, .dark-mode .feed-post-text, .dark-mode h2, .dark-mode label, .dark-mode .item-title { color: #e5e7eb !important; }
.dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #374151 !important; color: #e5e7eb !important; border-color: #4b5563 !important; }
.dark-mode .feed-post-avatar, .dark-mode .avatar { background-color: #374151 !important; border-color: #4b5563 !important; }
.dark-mode .feed-action-btn:hover { background: #374151 !important; }
.dark-mode .chat-contact:hover { background: #374151 !important; }
.dark-mode .chat-input-wrapper input { background: #374151 !important; color: #e5e7eb !important; }
.dark-mode .modal-content { background-color: #1e293b !important; color: #e5e7eb !important; border-color: #334155 !important;}
.dark-mode .menu-item { color: #9ca3af; }
.dark-mode .menu-item.active { background: #374151 !important; color: var(--primary) !important; }
.dark-mode #app-header { background: #1e293b !important; border-bottom-color: #334155 !important; }
.dark-mode #sidebar { background: #1e293b !important; border-right-color: #334155 !important; }

/* ============ HEADER ============ */
#app-header, header { display: flex !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; white-space: nowrap !important; overflow: hidden !important; padding: 5px 15px !important; }
#app-header > :first-child, .logo, .logo-title, #logo-btn { flex-shrink: 0 !important; }
#app-header > :last-child, .header-right-menu { display: flex !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; }
#profile-btn, #nav-premium-action { font-size: 12px !important; padding: 0 10px !important; height: 32px !important; line-height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: nowrap !important; flex-shrink: 0 !important; margin: 0 !important; border-radius: 8px !important; }

/* ============ TABLET / MOBILE CHAT ============ */
@media (max-width: 1024px) {
    #chat-layout-container { height: calc(100vh - 180px) !important; }
    .chat-sidebar { width: 100%; display: block; }
    .chat-active .chat-sidebar { display: none !important; }
    .chat-main { display: none !important; }
    .chat-active .chat-main { display: flex !important; }
}

/* ============ ACCORDION ============ */
.accordion-section { margin-bottom: 12px; background: transparent; }
.accordion-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 14px 16px; font-weight: bold; font-size: 15px; transition: 0.2s; color: var(--text-dark);}
.accordion-header:hover { background: #EEF2FF; color: var(--primary); border-radius: 12px; }
.accordion-content { max-height: 0; overflow: hidden; padding: 0 16px; background: transparent; transition: max-height 0.3s ease, padding 0.3s ease; }
.accordion-content.open { max-height: 600px; padding: 10px 16px; }
.accordion-icon { display: inline-block; margin-left: auto; font-size: 12px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: var(--text-gray); }

/* ============ SCROLLBAR ============ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }

/* ============ EXPANDED USER CARD MODAL ============ */
.interest-tag { display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 100px; background: #EEF2FF; color: #6366F1; font-size: 12px; font-weight: 600; margin: 3px; }
.dark-mode .interest-tag { background: #1E3A5F; color: #93C5FD; }

/* ============ PROFILE PAGE ============ */
.profile-notification-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
.profile-notification-item:hover { transform: translateX(3px); border-color: #6366F1; }
.dark-mode .profile-notification-item { background: #1E293B; border-color: #334155; }
.profile-friend-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; margin-bottom: 10px; }
.dark-mode .profile-friend-item { background: #1E293B; border-color: #334155; }
```

`;
document.head.appendChild(styleFix);

// ============================================================================
// ALT NAVİGASYON BARI (BOTTOM NAV)
// ============================================================================

window.renderBottomNav = function() {
const existing = document.getElementById(‘bottom-nav’);
if (existing) existing.remove();

```
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
// Aktif tab işaretle
window.updateBottomNavActive('home');
```

};

window.updateBottomNavActive = function(page) {
document.querySelectorAll(’.bottom-nav-item’).forEach(b => {
b.classList.toggle(‘active’, b.getAttribute(‘data-page’) === page);
});
};

window.setLanguage = function(lang) {
localStorage.setItem(‘uniloop_lang’, lang);
window.renderSettings();
};

window.toggleTheme = function(theme) {
localStorage.setItem(‘uniloop_theme’, theme);
if(theme === ‘dark’) {
document.body.classList.add(‘dark-mode’);
} else {
document.body.classList.remove(‘dark-mode’);
}
};

const savedTheme = localStorage.getItem(‘uniloop_theme’) || ‘light’;
window.toggleTheme(savedTheme);

const TRANSLATIONS = {
‘tr’: { settingsTitle: ‘⚙️ Uygulama Ayarları’, langLabel: ‘Dil Seçimi’, themeLabel: ‘Tema’, lightMode: ‘Aydınlık Mod’, darkMode: ‘Karanlık Mod’, logoutBtn: ‘🚪 Güvenli Çıkış Yap’ },
‘en’: { settingsTitle: ‘⚙️ App Settings’, langLabel: ‘Language’, themeLabel: ‘Theme’, lightMode: ‘Light Mode’, darkMode: ‘Dark Mode’, logoutBtn: ‘🚪 Secure Logout’ }
};

const closeSidebarIfOutside = (e) => {
const sidebar = document.getElementById(‘sidebar’);
const mobileBtn = document.getElementById(‘mobile-menu-btn’);
if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains(‘open’)) {
if (!sidebar.contains(e.target) && (!mobileBtn || !mobileBtn.contains(e.target))) {
sidebar.classList.remove(‘open’);
}
}
};
document.addEventListener(‘click’, closeSidebarIfOutside);
document.addEventListener(‘touchstart’, closeSidebarIfOutside, {passive: true});

const bind = (id, event, callback) => {
const el = document.getElementById(id);
if (el) { el.addEventListener(event, callback); }
};

// ============================================================================
// SIDEBAR (Masaüstü menü)
// ============================================================================
window.renderSidebarAccordions = function() {
const sidebarContainer = document.getElementById(‘sidebar-networks-container’);
const rightContainer = document.getElementById(‘right-networks-container’);

```
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
```

};

window.updateMyFacultiesSidebar = function() {
const container = document.getElementById(‘bana-ozel-container’);
if(!container) return;

```
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
    <div class="menu-item" id="nav-notifications-btn" data-target="notifications" onclick="document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active')); this.classList.add('active'); window.loadPage('notifications');">🔔 Bildirimler <span id="notif-badge" class="badge" style="display:none; background:#EF4444; color:white; padding:2px 8px; border-radius:12px; font-size:11px; margin-left:auto;">0</span></div>
    <div class="menu-item" id="nav-friends-btn" data-target="friends" onclick="document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active')); this.classList.add('active'); window.loadPage('friends');">👥 Arkadaşlarım</div>
`;

container.innerHTML = html;
```

};

// ============================================================================
// 1. GİRİŞ, KAYIT VE DOĞRULAMA
// ============================================================================

bind(‘show-register-btn’, ‘click’, (e) => {
if(e) e.preventDefault();
document.getElementById(‘login-card’).style.display = ‘none’;
document.getElementById(‘register-card’).style.display = ‘block’;
});

bind(‘show-login-btn’, ‘click’, (e) => {
if(e) e.preventDefault();
document.getElementById(‘register-card’).style.display = ‘none’;
document.getElementById(‘login-card’).style.display = ‘block’;
});

const uniInput = document.getElementById(‘reg-uni’);
const uniList = document.getElementById(‘uni-autocomplete-list’);

if (uniInput && uniList) {
uniInput.addEventListener(‘input’, function() {
const val = this.value;
uniList.innerHTML = ‘’;
if (!val) return false;
const matches = globalUniversities.filter(u => u.toLowerCase().includes(val.toLowerCase()));
matches.forEach(match => {
const div = document.createElement(‘div’);
const regex = new RegExp(`(${val})`, “gi”);
div.innerHTML = match.replace(regex, “<strong>$1</strong>”);
div.addEventListener(‘click’, function() { uniInput.value = match; uniList.innerHTML = ‘’; });
uniList.appendChild(div);
});
});
document.addEventListener(‘click’, (e) => { if(e.target !== uniInput) { uniList.innerHTML = ‘’; } });
}

bind(‘register-btn’, ‘click’, async (e) => {
if(e) e.preventDefault();
const name = document.getElementById(‘reg-name’).value.trim();
const surname = document.getElementById(‘reg-surname’).value.trim();
const uni = document.getElementById(‘reg-uni’).value.trim();
const email = document.getElementById(‘reg-email’).value.trim();
const password = document.getElementById(‘reg-password’).value;

```
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
        uid: user.uid, name: name, surname: surname, username: "", university: uni,
        email: email, avatar: "👨‍🎓", avatarUrl: "", bio: "", age: "", isOnline: false,
        faculty: "", department: "", grade: "", interests: [], purpose: "", isPremium: false,
        onboardingComplete: false
    }).then(() => {
        window.ensureWelcomeMessage(user, name);
    }).catch(dbError => { console.error("Veritabanı Kayıt Hatası:", dbError); });

} catch (error) {
    if (error.code === 'auth/email-already-in-use') {
        alert("Bu e-posta adresi zaten kullanımda.");
    } else {
        alert("Kayıt olurken bir hata oluştu: " + error.message);
    }
    btn.innerText = origText;
    btn.disabled = false;
}
```

});

bind(‘verify-code-btn’, ‘click’, async (e) => {
if(e) e.preventDefault();
const user = auth.currentUser;
if(!user) {
alert(“Oturum zaman aşımına uğradı. Lütfen sayfayı yenileyip giriş yapın.”);
return;
}
const btn = document.getElementById(‘verify-code-btn’);
const originalText = btn.innerText;
btn.innerText = “Kontrol Ediliyor…”;
btn.disabled = true;
try {
await user.reload();
if(user.emailVerified) {
alert(“Tebrikler! Hesabınız aktifleştirildi.”);
window.location.reload();
} else {
alert(“Hesabınız henüz onaylanmamış! Lütfen e-postanıza gelen linke tıklayın.”);
btn.innerText = originalText;
btn.disabled = false;
}
} catch (err) {
console.error(err);
alert(“Hata: “ + err.message);
btn.innerText = originalText;
btn.disabled = false;
}
});

bind(‘login-btn’, ‘click’, async (e) => {
if(e) e.preventDefault();
const email = document.getElementById(‘login-email’).value.trim();
const password = document.getElementById(‘login-password’).value;
const btn = document.getElementById(‘login-btn’);

```
if(!email || !password) { alert("Lütfen e-posta ve şifrenizi girin."); return; }

const originalText = btn.innerText;
btn.innerText = "Giriş Yapılıyor...";
btn.disabled = true;

try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    if(!userCred.user.emailVerified) {
        alert("Hesabınız henüz onaylanmamış.");
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
```

});

bind(‘forgot-password-btn’, ‘click’, async (e) => {
if(e) e.preventDefault();
const email = prompt(“Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:”);
if(!email) return;
try {
await sendPasswordResetEmail(auth, email);
alert(“Şifre sıfırlama bağlantısı gönderildi!”);
} catch (error) {
alert(“Hata: “ + error.message);
}
});

window.ensureWelcomeMessage = async function(user, userName) {
if(!user) return;
try {
const chatId = user.uid + “_system_welcome”;
const chatRef = doc(db, “chats”, chatId);
const chatSnap = await getDoc(chatRef);

```
    if (!chatSnap.exists()) {
        const systemMessageText = `Merhaba ${userName}! UniLoop'a hoş geldin. 🎓✨<br><br>Kampüs ağında seni neler bekliyor?<br><br>🛒 <b>Kampüs Market:</b> İhtiyacın olmayan eşyaları sat.<br>📸 <b>Anonim Kampüs:</b> Düşüncelerini özgürce paylaş.<br>👥 <b>Önerilen Kişiler:</b> Yeni arkadaşlar edin.<br><br>Profilinden ilgi alanlarını ve fotoğrafını eklemeyi unutma!`;
        await setDoc(chatRef, {
            participants: [user.uid, "system"],
            participantNames: { [user.uid]: userName, "system": "UniLoop Team" },
            participantAvatars: { [user.uid]: "👨‍🎓", "system": "🌍" },
            lastUpdated: serverTimestamp(), status: 'accepted', initiator: 'system',
            messages: [{ senderId: "system", text: systemMessageText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }]
        });
    }
} catch (error) {
    console.error("Karşılama mesajı oluşturulamadı: ", error);
}
```

};

window.logout = async function() {
try {
if(window.userProfile.uid) {
await updateDoc(doc(db, “users”, window.userProfile.uid), { isOnline: false });
}
await signOut(auth);
const bottomNav = document.getElementById(‘bottom-nav’);
if (bottomNav) bottomNav.remove();
if(authScreen && appScreen) {
appScreen.style.display = ‘none’;
authScreen.style.display = ‘flex’;
document.getElementById(‘login-card’).style.display = ‘block’;
document.getElementById(‘register-card’).style.display = ‘none’;
document.getElementById(‘verify-card’).style.display = ‘none’;
const btn = document.getElementById(‘login-btn’);
if(btn) { btn.innerText = “Giriş Yap”; btn.disabled = false; }
}
} catch(error) { console.error(“Çıkış hatası:”, error); }
};

// ============================================================================
// 2. OTURUM DURUMU KONTROLÜ
// ============================================================================

onAuthStateChanged(auth, async (user) => {
if (user && user.emailVerified) {
if(authScreen && appScreen) {
authScreen.style.display = ‘none’;
appScreen.style.display = ‘block’;
}

```
    try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if(docSnap.exists()) {
            window.userProfile = docSnap.data();
            // Eksik alanları tamamla
            if(!window.userProfile.isPremium) window.userProfile.isPremium = false;
            if(!window.userProfile.bio) window.userProfile.bio = "";
            if(!window.userProfile.age) window.userProfile.age = "";
            if(!window.userProfile.avatarUrl) window.userProfile.avatarUrl = "";
            if(!window.userProfile.interests) window.userProfile.interests = [];
            if(!window.userProfile.department) window.userProfile.department = "";
            if(!window.userProfile.grade) window.userProfile.grade = "";
            if(window.userProfile.onboardingComplete === undefined) window.userProfile.onboardingComplete = false;
        } else {
            window.userProfile = {
                uid: user.uid, name: "Öğrenci", surname: "", username: "",
                email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓",
                faculty: "", department: "", grade: "", bio: "", age: "", avatarUrl: "",
                isOnline: true, isPremium: false, interests: [], onboardingComplete: false
            };
            await setDoc(userDocRef, window.userProfile);
        }

        await window.ensureWelcomeMessage(user, window.userProfile.name);
        await updateDoc(userDocRef, { isOnline: true });

        window.renderSidebarAccordions();
        window.renderBottomNav();
        initRealtimeListeners(user.uid);

        // Onboarding kontrolü
        if (!window.userProfile.onboardingComplete) {
            window.showOnboarding();
        } else {
            window.loadPage('home');
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
```

});

window.addEventListener(“beforeunload”, () => {
if(window.userProfile && window.userProfile.uid) {
updateDoc(doc(db, “users”, window.userProfile.uid), { isOnline: false });
}
});

function initRealtimeListeners(currentUid) {
const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

```
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
    let pendingRequestsCount = 0;

    snapshot.forEach(d => {
        try {
            const data = d.data({ serverTimestamps: 'estimate' });
            if (!data.participants || !Array.isArray(data.participants)) return;
            const otherUid = data.participants.find(p => p !== currentUid) || "system";
            const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
            const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
            let safeTimestamp = data.lastUpdated && typeof data.lastUpdated.toMillis === 'function' ? data.lastUpdated.toMillis() : Date.now();
            const chatItem = {
                id: d.id, otherUid, name: otherName, avatar: otherAvatar,
                messages: data.messages || [], status: data.status || 'accepted',
                initiator: data.initiator || null, lastUpdatedTS: safeTimestamp
            };
            chatsDB.push(chatItem);
            if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) pendingRequestsCount++;
        } catch(err) { console.error("Hatalı mesaj belgesi:", err); }
    });

    chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);

    const notifBadge = document.getElementById('notif-badge');
    if(notifBadge) {
        if(pendingRequestsCount > 0) { notifBadge.style.display = 'inline-block'; notifBadge.innerText = pendingRequestsCount; }
        else { notifBadge.style.display = 'none'; }
    }

    const activePage = document.querySelector('.bottom-nav-item.active');
    if(activePage) {
        const pg = activePage.getAttribute('data-page');
        if(pg === 'messages') {
            if (currentChatId) { window.renderMessagesSidebarOnly(); window.updateChatMessagesOnly(currentChatId); }
            else { window.renderMessages(); }
        } else if (pg === 'profile') {
            // profil sayfasındaki bildirim/arkadaş listesi güncellenir
        }
    }
});
```

}

// ============================================================================
// PREMIUM
// ============================================================================
window.openPremiumModal = function() {
window.openModal(‘🌟 UniLoop Premium’, `<div style="text-align:center; padding: 10px;"> <div style="font-size: 48px; margin-bottom: 10px;">👑</div> <h3 style="color:#D97706; margin-bottom: 10px; font-size: 22px;">Kampüsün Zirvesine Çık!</h3> <p style="margin-bottom:20px; font-size:15px; color:var(--text-gray);">UniLoop Premium ile sınırları kaldır.</p> <ul style="text-align:left; background:#FEF3C7; padding: 20px; border-radius: 12px; margin-bottom:20px; list-style:none; color:#92400E; font-weight:500; font-size: 14px;"> <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🟢</span> <span><strong>Gelişmiş AI Radarı:</strong> Şu an çevrimiçi bölümdaşlarını gör.</span></li> <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🕵️</span> <span><strong>Seni Kimler Beğendi?:</strong> Profilini gezen herkesi gör.</span></li> <li style="display:flex; gap:10px;"><span style="font-size:18px;">🚀</span> <span><strong>Super DM:</strong> Mesajların kilit ekranına düşsün.</span></li> </ul> <div style="font-size:32px; font-weight:800; margin-bottom:20px; color:var(--text-dark);">49.99 ₺ <span style="font-size:14px; color:var(--text-gray); font-weight:normal;">/ aylık</span></div> <button id="buy-premium-btn" onclick="window.upgradeToPremium()" class="premium-upgrade-btn premium-glow" style="width:100%; justify-content:center; padding: 16px; font-size: 16px;">💳 Güvenli Ödeme İle Satın Al</button> <p style="font-size:11px; color:#9CA3AF; margin-top:10px;">*İstediğin zaman iptal edebilirsin.</p> </div>`);
};

window.upgradeToPremium = async function() {
const btn = document.getElementById(‘buy-premium-btn’);
btn.innerText = ‘⏳ Ödeme İşleniyor…’;
btn.disabled = true;
setTimeout(async () => {
try {
await updateDoc(doc(db, “users”, window.userProfile.uid), { isPremium: true });
window.userProfile.isPremium = true;
const navBtn = document.getElementById(‘nav-premium-action’);
if(navBtn) navBtn.style.display = ‘none’;
window.closeModal();
alert(“🎉 UniLoop Premium ayrıcalıklarına sahipsiniz!”);
window.loadPage(‘home’);
} catch(e) {
alert(“Hata: “ + e.message);
btn.innerText = ‘💳 Güvenli Ödeme İle Satın Al’;
btn.disabled = false;
}
}, 3000);
};

// ============================================================================
// 3. MODAL VE GENEL FONKSİYONLAR
// ============================================================================

window.goToMessages = function() {
window.updateBottomNavActive(‘messages’);
window.loadPage(‘messages’);
};

window.openModal = function(title, contentHTML) {
document.getElementById(‘modal-title’).innerText = title;
document.getElementById(‘modal-body’).innerHTML = contentHTML;
modal.classList.add(‘active’);
document.body.style.overflow = ‘hidden’;
};

window.closeModal = function() {
modal.classList.remove(‘active’);
document.getElementById(‘modal-body’).innerHTML = ‘’;
if (!document.getElementById(‘lightbox’).classList.contains(‘active’)) {
document.body.style.overflow = ‘auto’;
}
};

bind(‘modal-close’, ‘click’, window.closeModal);
window.addEventListener(‘click’, (e) => { if (e.target === modal) window.closeModal(); });
bind(‘mobile-menu-btn’, ‘click’, () => { document.getElementById(‘sidebar’).classList.toggle(‘open’); });

document.body.addEventListener(‘click’, (e) => {
const accordionHeader = e.target.closest(’.accordion-header’);
if(accordionHeader) {
const content = accordionHeader.nextElementSibling;
const icon = accordionHeader.querySelector(’.accordion-icon’);
if(content.classList.contains(‘open’)) {
content.classList.remove(‘open’);
if(icon) icon.style.transform = ‘rotate(0deg)’;
} else {
content.classList.add(‘open’);
if(icon) icon.style.transform = ‘rotate(90deg)’;
}
return;
}
const link = e.target.closest(’.community-link’);
if(link) {
const name = link.getAttribute(‘data-name’);
const icon = link.getAttribute(‘data-icon’);
const color = link.getAttribute(‘data-color’);
if(typeof window.handleFacultyClick === ‘function’) window.handleFacultyClick(name, icon, color);
return;
}
});

window.resetCurrentChatId = function() { currentChatId = null; };

// ============================================================================
// 4. ANA SAYFA (HOME) - EXPANDABLE KARTLAR, SWIPE İSTEKLER, MARKET BUTONU
// ============================================================================

window.searchAndAddFriend = async function() {
try {
const searchInput = document.getElementById(‘friend-search-input’);
if(!searchInput) return;
let rawSearch = searchInput.value.trim().toLowerCase();
if(!rawSearch) { alert(“Lütfen bir kullanıcı adı yazın.”); return; }
if (!window.userProfile.username) { alert(“Arkadaş eklemeden önce profilden bir kullanıcı adı belirleyin!”); return; }
rawSearch = rawSearch.replace(/^#/, ‘’);
const searchVal = ‘#’ + rawSearch;
if(searchVal === window.userProfile.username) { alert(“Kendinizi ekleyemezsiniz :)”); return; }
const btn = document.getElementById(‘friend-search-btn’);
const origText = btn.innerText;
btn.innerText = “Aranıyor…”;
btn.disabled = true;
const q = query(collection(db, “users”), where(“username”, “==”, searchVal));
const snapshot = await getDocs(q);
if(snapshot.empty) { alert(“Bu kullanıcı adına sahip kimse bulunamadı!”); }
else {
const targetUser = snapshot.docs[0].data();
await window.sendFriendRequest(targetUser.uid, targetUser.name + “ “ + targetUser.surname);
}
btn.innerText = origText;
btn.disabled = false;
searchInput.value = ‘’;
} catch (error) {
console.error(error);
alert(“Arama hatası: “ + error.message);
}
};

window.sendFriendRequest = async function(targetUserId, targetUserName) {
try {
const myUid = auth.currentUser.uid;
const q = query(collection(db, “chats”), where(“participants”, “array-contains”, myUid));
const snap = await getDocs(q);
let existingChat = null;
snap.forEach(d => {
if (d.data().participants && d.data().participants.includes(targetUserId)) existingChat = { id: d.id, …d.data() };
});
if(!existingChat) {
await addDoc(collection(db, “chats”), {
participants: [myUid, targetUserId],
participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || “👨‍🎓”, [targetUserId]: “👤” },
lastUpdated: serverTimestamp(), status: ‘pending’, initiator: myUid,
messages: [{ senderId: “system”, text: “Sizi arkadaş olarak eklemek istiyor.”, time: new Date().toLocaleTimeString([], {hour: ‘2-digit’, minute:‘2-digit’}), read: false }]
});
alert(“Arkadaşlık isteği gönderildi!”);
} else {
if(existingChat.status === ‘pending’) alert(“Bu kişiye zaten istek gönderilmiş.”);
else alert(“Bu kişiyle zaten arkadaşsınız.”);
}
} catch (error) {
alert(“İstek gönderilirken hata: “ + error.message);
}
};

window.viewUserProfile = async function(targetUid) {
if(targetUid === window.userProfile.uid) { window.loadPage(‘profile’); return; }
try {
const docSnap = await getDoc(doc(db, “users”, targetUid));
if (docSnap.exists()) {
const u = docSnap.data();
const initial = u.surname ? u.surname.charAt(0) + ‘.’ : ‘’;
let avatarHtml = u.avatarUrl
? `<img src="${u.avatarUrl}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #E5E7EB; margin: 0 auto; display: block;">`
: `<div style="width:90px; height:90px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;

```
        const bioText = u.bio ? u.bio : "Henüz bir biyografi eklemedi.";
        const ageText = u.age ? u.age + " yaşında" : "";
        const facText = u.faculty ? u.faculty : "Fakülte belirtilmemiş";
        const depText = u.department ? u.department : "";
        const gradeText = u.grade ? u.grade : "";
        const interestTags = (u.interests && u.interests.length > 0)
            ? u.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')
            : '';

        const existingChat = chatsDB.find(c => c.otherUid === u.uid);
        let actionBtnHtml = '';
        if (existingChat && existingChat.status === 'accepted') {
            actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
        } else if (existingChat && existingChat.status === 'pending') {
            actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
        } else {
            actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Arkadaş Ekle</button>`;
        }

        window.openModal('Kullanıcı Profili', `
            <div style="text-align:center;">
                ${avatarHtml}
                <h3 style="margin: 10px 0 4px 0; font-size:19px; color:var(--text-dark);">${u.name} ${initial}</h3>
                <p style="color:var(--primary); font-size:14px; margin-bottom: 3px; font-weight:bold;">${facText}${depText ? ' · ' + depText : ''}</p>
                ${gradeText ? `<p style="color:var(--text-gray); font-size:13px; margin-bottom: 3px;">${gradeText}</p>` : ''}
                ${ageText ? `<p style="color:var(--text-gray); font-size:13px; margin-bottom: 12px;">${ageText}</p>` : '<div style="margin-bottom:12px;"></div>'}
                
                ${interestTags ? `<div style="margin-bottom: 16px; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">${interestTags}</div>` : ''}
                
                <div style="background:#F9FAFB; padding:14px; border-radius:12px; text-align:left; margin-bottom: 18px; border:1px solid #E5E7EB;">
                    <strong style="font-size:11px; color:#6B7280; text-transform:uppercase; letter-spacing:1px;">Hakkında</strong>
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
```

};

window.renderHome = async function() {
let usernameWarning = ‘’;
if (!window.userProfile.username) {
usernameWarning = `<div style="background: #FEF2F2; color: #DC2626; padding: 14px 18px; border-radius: 14px; border: 1px solid #FCA5A5; margin-bottom: 18px; font-weight: bold; font-size: 14px; text-align: center; cursor:pointer;" onclick="window.loadPage('profile')"> ⚠️ Bir kullanıcı adı belirlemedin! Arkadaşların seni bulsun. (Tıkla) </div>`;
}

```
// Gelen istekler
const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
let swipeRequestsHTML = '';
if (incomingRequests.length > 0) {
    swipeRequestsHTML = `
        <div class="card" style="padding: 18px 20px; margin-bottom: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h3 style="margin:0; font-size: 16px; font-weight: 800;">📩 Gelen İstekler</h3>
                <span style="font-size: 13px; background: #6366F1; color: white; padding: 3px 10px; border-radius: 20px; font-weight: 700;">${incomingRequests.length}</span>
            </div>
            <div class="swipe-cards-wrapper">
                ${incomingRequests.map(req => {
                    let avatarHtml = req.avatar && req.avatar.startsWith('http')
                        ? `<img src="${req.avatar}" style="width:54px; height:54px; border-radius:50%; object-fit:cover; margin: 0 auto 10px; display:block;">`
                        : `<div style="width:54px; height:54px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:26px; margin: 0 auto 10px;">${req.avatar || '👤'}</div>`;
                    return `
                        <div class="swipe-request-card">
                            ${avatarHtml}
                            <div style="font-weight: 700; font-size: 13px; color: var(--text-dark); margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${req.name.split(' ')[0]}</div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <button onclick="window.acceptRequest('${req.id}')" style="background: #6366F1; color: white; border: none; border-radius: 10px; padding: 7px; font-size: 12px; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">✅ Kabul</button>
                                <button onclick="window.rejectRequest('${req.id}')" style="background: #F1F5F9; color: #64748B; border: none; border-radius: 10px; padding: 7px; font-size: 12px; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">❌ Reddet</button>
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
    <div class="card" style="background: linear-gradient(135deg, #0F172A, #6366F1); color: white; border:none; padding: 22px 24px; border-radius: 20px; margin-bottom: 16px;">
        <h2 style="font-size:22px; margin-bottom:6px; font-weight: 800;">Merhaba, ${window.userProfile.name}! 👋</h2>
        <p style="opacity:0.85; font-size:14px; margin: 0;">
            <strong style="color:#A5F3FC;">${window.userProfile.university}</strong> ağındasın.
        </p>
    </div>

    <!-- Arkadaş Arama -->
    <div class="card" style="padding: 14px 16px; margin-bottom: 16px; display:flex; align-items:center; gap:10px; border-radius: 16px;">
        <div style="display:flex; flex:1; align-items:center; background:#F8FAFC; border-radius:12px; padding:0 12px; border:1px solid #E2E8F0;">
            <span style="color:#6366F1; font-weight:800; font-size:16px;">#</span>
            <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:10px 8px; outline:none; font-size:15px; font-weight:600; color:var(--text-dark); font-family:'Plus Jakarta Sans',sans-serif;" placeholder="kullaniciadini_bul" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
        </div>
        <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:10px 18px; border-radius:12px; font-size:14px;" onclick="window.searchAndAddFriend()">Ekle</button>
    </div>

    <!-- Gelen İstekler (swipe) -->
    ${swipeRequestsHTML}

    <!-- Kampüs Market Butonu -->
    <div onclick="window.updateBottomNavActive('market'); window.loadPage('market');" style="background: linear-gradient(135deg, #059669, #10B981); color: white; border-radius: 18px; padding: 18px 22px; margin-bottom: 16px; cursor: pointer; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 16px rgba(16,185,129,0.3); transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="font-size: 36px; background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🛒</div>
        <div>
            <div style="font-size: 18px; font-weight: 800; margin-bottom: 3px;">Kampüs Market</div>
            <div style="font-size: 13px; opacity: 0.9;">İkinci el ürünleri keşfet ve sat →</div>
        </div>
    </div>

    <!-- Önerilen Kişiler -->
    <div class="card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h2 style="margin:0; font-size:18px; font-weight: 800;">🔥 Önerilen Kişiler</h2>
            <span style="font-size:12px; background:#6366F1; color:white; padding:4px 10px; border-radius:8px; font-weight: 700;">Yeni</span>
        </div>
        <div class="user-grid" id="home-users-grid">
            <div style="grid-column: 1 / -1; text-align:center; padding: 20px; color:var(--text-gray);">Kullanıcılar yükleniyor...</div>
        </div>
    </div>
`;

mainContent.innerHTML = html;

// Kullanıcıları yükle
try {
    const querySnapshot = await getDocs(query(collection(db, "users")));
    let usersHtml = '';
    let count = 0;
    const interactedUids = chatsDB.map(c => c.otherUid);

    querySnapshot.forEach((d) => {
        const u = d.data();
        if(u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid) && count < 10) {
            count++;
            const initial = u.surname ? u.surname.charAt(0) + '.' : '';
            let avatarHtml = u.avatarUrl
                ? `<img src="${u.avatarUrl}" style="width:62px; height:62px; border-radius:50%; object-fit:cover; border:2px solid #E5E7EB;">`
                : `<div style="width:62px; height:62px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:30px; border:2px solid #E5E7EB; margin:0 auto;">${u.avatar || '👤'}</div>`;

            // Ortak ilgi alanları
            const myInterests = window.userProfile.interests || [];
            const theirInterests = u.interests || [];
            const commonInterests = myInterests.filter(i => theirInterests.includes(i));
            const commonTag = commonInterests.length > 0 ? `<div style="font-size: 10px; color: #6366F1; font-weight: 700; margin-top: 4px; background: #EEF2FF; border-radius: 100px; padding: 2px 8px;">${commonInterests[0]}</div>` : '';

            usersHtml += `
                <div class="user-card" onclick="window.viewUserProfile('${u.uid}')">
                    <div style="margin-bottom: 10px;">${avatarHtml}</div>
                    <div style="font-weight:800; font-size:14px; color:var(--text-dark);">${u.name} ${initial}</div>
                    <div style="font-size:11px; color:var(--text-gray); margin-top:3px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; text-align: center;">${u.faculty || u.department || 'Kampüs Öğrencisi'}</div>
                    ${commonTag}
                    <button class="btn-primary" style="margin-top:12px; padding:8px; font-size:12px; border-radius:10px; width:100%; box-shadow:none; font-weight: 700;" onclick="event.stopPropagation(); window.sendFriendRequest('${u.uid}', '${u.name} ${initial}')">➕ İstek Gönder</button>
                </div>
            `;
        }
    });

    document.getElementById('home-users-grid').innerHTML = usersHtml || '<p style="grid-column: 1 / -1; text-align:center; color:var(--text-gray);">Önerecek yeni kullanıcı bulunamadı.</p>';
} catch(e) {
    console.error("Kullanıcılar çekilemedi", e);
    const grid = document.getElementById('home-users-grid');
    if(grid) grid.innerHTML = '<p style="grid-column: 1 / -1; text-align:center; color:red;">Kullanıcılar yüklenirken hata oluştu.</p>';
}
```

};

// ============================================================================
// 5. TAM EKRAN FOTOĞRAF GALERİSİ (LIGHTBOX)
// ============================================================================

window.currentLightboxImages = [];
window.currentLightboxIndex = 0;

window.openLightbox = function(imagesJsonStr, index) {
window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr));
window.currentLightboxIndex = index;
window.updateLightboxView();
document.getElementById(‘lightbox’).classList.add(‘active’);
document.body.style.overflow = ‘hidden’;
};

window.closeLightbox = function() {
document.getElementById(‘lightbox’).classList.remove(‘active’);
if(!document.getElementById(‘app-modal’).classList.contains(‘active’)) document.body.style.overflow = ‘auto’;
};

window.changeLightboxImage = function(step) {
window.currentLightboxIndex += step;
if(window.currentLightboxIndex < 0) window.currentLightboxIndex = window.currentLightboxImages.length - 1;
if(window.currentLightboxIndex >= window.currentLightboxImages.length) window.currentLightboxIndex = 0;
window.updateLightboxView();
};

window.updateLightboxView = function() {
const imgEl = document.getElementById(‘lightbox-img’);
const counterEl = document.getElementById(‘lightbox-counter’);
if(imgEl && counterEl) {
imgEl.src = window.currentLightboxImages[window.currentLightboxIndex];
counterEl.innerText = (window.currentLightboxIndex + 1) + “ / “ + window.currentLightboxImages.length;
}
};

let touchstartX = 0, touchendX = 0;
function handleSwipe() {
if (touchendX < touchstartX - 40) window.changeLightboxImage(1);
if (touchendX > touchstartX + 40) window.changeLightboxImage(-1);
}
const lb = document.getElementById(‘lightbox’);
if(lb) {
lb.addEventListener(‘touchstart’, e => { touchstartX = e.changedTouches[0].screenX; });
lb.addEventListener(‘touchend’, e => { touchendX = e.changedTouches[0].screenX; handleSwipe(); });
}

// ============================================================================
// 6. KAMPÜS MARKET
// ============================================================================

window.renderListings = function(type, title) {
let html = `<div class="card"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;"> <h2 style="margin:0;">${title}</h2> <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openListingForm('${type}')">+ Yeni İlan</button> </div> <input type="text" id="local-search-input" class="local-search-bar" placeholder="İlan ara..."> <div class="market-grid" id="listings-grid-container"></div> </div>`;
mainContent.innerHTML = html;
window.drawListingsGrid(type, ‘’);
const searchInput = document.getElementById(‘local-search-input’);
if(searchInput) { searchInput.addEventListener(‘input’, (e) => { window.drawListingsGrid(type, e.target.value.toLowerCase()); }); }
};

window.drawListingsGrid = function(type, filterText) {
const container = document.getElementById(‘listings-grid-container’);
if(!container) return;
const filteredData = marketDB.filter(item =>
item.type === type && (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText))
);
if(filteredData.length === 0) {
container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok.</p>`;
return;
}
let gridHtml = ‘’;
filteredData.forEach(item => {
let imgHtml = ‘’;
const displayCurrency = item.currency || ‘₺’;
if (item.isPdf) {
imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#F9FAFB;"><span style="font-size:40px;">📄</span><span style="font-size:12px; font-weight:bold; color:#EF4444; margin-top:5px;">PDF</span></div>`;
} else if (item.imgUrl) {
imgHtml = `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">`;
} else {
imgHtml = `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`;
}
gridHtml += `<div class="item-card" onclick="window.openListingDetail('${item.id}')"> <div class="item-img-large">${imgHtml}</div> <div class="item-details"> <div class="item-title">${item.title}</div> <div class="item-price-large">${item.price} ${displayCurrency}</div> </div> </div>`;
});
container.innerHTML = gridHtml;
};

window.openListingDetail = function(docId) {
const item = marketDB.find(i => i.id === docId);
if(!item) return;
let imgHtml = ‘’, indicatorsHtml = ‘’;
const displayCurrency = item.currency || ‘₺’;
if (item.isPdf) {
imgHtml = `<div style="width:100%; height:200px; background:#F9FAFB; border:2px dashed #EF4444; border-radius:12px; margin-bottom:16px; display:flex; align-items:center; justify-content:center; flex-direction:column;"><span style="font-size:50px;">📄</span></div>`;
} else if (item.imgUrls && item.imgUrls.length > 0) {
imgHtml += ‘<div class="image-gallery" style="height:220px; border-radius:12px; margin-bottom:16px;">’;
const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
item.imgUrls.forEach((url, i) => {
imgHtml += `<div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;"><img src="${url}" alt="İlan" style="border-radius:12px;"></div>`;
indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`;
});
imgHtml += ‘</div>’;
if(item.imgUrls.length > 1) imgHtml += `<div class="gallery-indicators" style="bottom: 25px;">${indicatorsHtml}</div>`;
} else if (item.imgUrl) {
const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
imgHtml = `<img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">`;
}
let actionButtonsHtml = ‘’;
const currentUid = window.userProfile.uid || (auth.currentUser ? auth.currentUser.uid : null);
const safeTitle = item.title.replace(/’/g, “\’”);
const existingChat = chatsDB.find(c => c.otherUid === item.sellerId);
if (item.sellerId === currentUid) {
actionButtonsHtml = ` <div style="display:flex; gap:10px; margin-top: 16px;"> <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Güncelle</button> <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button> </div>`;
} else if (existingChat && existingChat.status === ‘accepted’) {
actionButtonsHtml = `<button class="btn-primary" style="margin-top: 16px; padding:12px;" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
} else if (existingChat && existingChat.status === ‘pending’) {
actionButtonsHtml = `<button class="btn-primary" disabled style="margin-top: 16px; padding:12px; background:#9CA3AF;">⏳ İstek Bekleniyor</button>`;
} else {
actionButtonsHtml = `<button class="btn-primary" style="margin-top: 16px; padding:12px;" onclick="window.sendFriendRequest('${item.sellerId}', '${item.sellerName}'); window.closeModal();">➕ İstek Gönder</button>`;
}
window.openModal(item.title, `<div style="position:relative;">${imgHtml}</div> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;"> <div style="font-size:22px; font-weight:800; color:#059669;">${item.price} ${displayCurrency}</div> <div style="font-size:12px; color:var(--text-gray); background:#F3F4F6; padding:5px 10px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div> </div> <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:14px; border-radius:12px; border:1px solid var(--border-color);">${item.desc}</div> ${actionButtonsHtml}`);
};

window.deleteListing = async function(docId) {
if(confirm(“Bu ilanı silmek istediğinize emin misiniz?”)) {
try { await deleteDoc(doc(db, “listings”, docId)); alert(“İlan silindi!”); }
catch(e) { alert(“Hata: “ + e.message); }
}
};

window.editListing = async function(docId, oldTitle, oldPrice) {
let newPrice = prompt(`"${oldTitle}" için yeni fiyat:`, oldPrice);
if(newPrice !== null && newPrice.trim() !== “”) {
try { await updateDoc(doc(db, “listings”, docId), { price: newPrice.trim() }); alert(“Güncellendi!”); }
catch(e) { alert(“Hata: “ + e.message); }
}
};

window.openListingForm = function(type) {
window.openModal(‘🛒 Yeni İlan Ekle’, `<div class="form-group"><input type="text" id="new-item-title" placeholder="İlan Başlığı"></div> <div class="form-group" style="display: flex; gap: 10px;"> <input type="number" id="new-item-price" placeholder="Fiyat" style="flex: 2;"> <select id="new-item-currency" style="flex: 1;"> <option value="₺">TL (₺)</option> <option value="$">Dolar ($)</option> <option value="€">Euro (€)</option> <option value="£">Sterlin (£)</option> </select> </div> <div class="form-group"><textarea id="new-item-desc" rows="3" placeholder="Açıklama..."></textarea></div> <div class="upload-btn-wrapper"> <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf veya 📄 PDF Seç</button> <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;" /> </div> <div id="preview-container" class="preview-container"></div> <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button> <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none;">Dosyalar Yükleniyor...</p>`);
setTimeout(() => {
const photoBtn = document.getElementById(‘photo-trigger-btn’);
const photoInput = document.getElementById(‘new-item-photo’);
if(photoBtn && photoInput) {
photoBtn.addEventListener(‘click’, () => { photoInput.click(); });
photoInput.addEventListener(‘change’, function(e) {
const files = Array.from(e.target.files).slice(0, 3);
const previewContainer = document.getElementById(‘preview-container’);
previewContainer.innerHTML = ‘’;
files.forEach(file => {
if (file.type === “application/pdf”) {
previewContainer.innerHTML += `<div class="preview-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#F9FAFB;"><span style="font-size:30px;">📄</span></div>`;
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
const titleEl = document.getElementById(‘new-item-title’);
const priceEl = document.getElementById(‘new-item-price’);
const currencyEl = document.getElementById(‘new-item-currency’);
const descEl = document.getElementById(‘new-item-desc’);
const photoInput = document.getElementById(‘new-item-photo’);
const statusEl = document.getElementById(‘upload-status’);
const btn = document.getElementById(‘publish-listing-btn’);
if (!titleEl || !priceEl || !descEl || !currencyEl) return;
const title = titleEl.value.trim(), price = priceEl.value.trim(), currency = currencyEl.value, desc = descEl.value.trim();
if (title === “” || price === “” || desc === “”) { alert(“Lütfen tüm alanları doldurun.”); return; }
let files = [];
if(photoInput && photoInput.files && photoInput.files.length > 0) files = Array.from(photoInput.files).slice(0, 3);
if(files.length === 0) { alert(“Lütfen en az 1 dosya seçin.”); return; }
let isPdf = files.length > 0 && files[0].type === “application/pdf”;
btn.disabled = true;
statusEl.style.display = ‘block’;
let imgUrlsArray = [];
try {
for (let file of files) {
const fileName = Date.now() + ‘_’ + file.name.replace(/\s/g, ‘’);
const storageRef = ref(storage, ‘listings/’ + window.userProfile.uid + ‘/’ + fileName);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
imgUrlsArray.push(url);
}
await addDoc(collection(db, “listings”), {
type, title, price, currency, desc, imgUrls: imgUrlsArray,
imgUrl: imgUrlsArray.length > 0 ? imgUrlsArray[0] : “”, isPdf,
sellerId: window.userProfile.uid, sellerName: window.userProfile.name + “ “ + window.userProfile.surname,
createdAt: serverTimestamp()
});
window.closeModal();
alert(“İlanınız yayınlandı!”);
} catch (error) {
alert(“Hata: “ + error.message);
} finally {
statusEl.style.display = ‘none’;
btn.disabled = false;
}
};

// ============================================================================
// 7. ARKADAŞLARIM, BİLDİRİMLER VE MESAJLAŞMA
// ============================================================================

window.renderFriends = function() {
const acceptedFriends = chatsDB.filter(c => c.status === ‘accepted’);
let html = `<div class="card" style="padding: 20px; min-height: calc(100vh - 150px);"> <h2 style="margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px; display:flex; align-items:center; gap:10px;"> <span>👥 Arkadaşlarım</span> <span style="font-size:14px; background:#EEF2FF; color:#6366F1; padding:4px 12px; border-radius:12px; font-weight: 700;">${acceptedFriends.length} Kişi</span> </h2>`;
if (acceptedFriends.length === 0) {
html += `<div style="text-align:center; padding: 40px 20px; color:var(--text-gray);">Henüz arkadaşın yok. Ana sayfadan yeni insanlarla tanış!</div>`;
} else {
html += `<div class="user-grid">`;
acceptedFriends.forEach(friend => {
let avatarHtml = friend.avatar && friend.avatar.startsWith(‘http’)
? `<img src="${friend.avatar}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #E5E7EB;">`
: `<div style="width:70px; height:70px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:35px; border:2px solid #E5E7EB; margin:0 auto;">${friend.avatar || '👤'}</div>`;
html += `<div class="user-card" onclick="window.viewUserProfile('${friend.otherUid}')"> <div style="margin-bottom: 10px;">${avatarHtml}</div> <div style="font-weight:bold; font-size:14px; color:var(--text-dark);">${friend.name}</div> <button class="btn-primary" style="margin-top:12px; padding:8px; font-size:12px; border-radius:10px; width:100%; box-shadow:none; font-weight: 700;" onclick="event.stopPropagation(); window.openChatViewDirect('${friend.id}')">💬 Mesaj</button> </div>`;
});
html += `</div>`;
}
html += `</div>`;
mainContent.innerHTML = html;
};

window.openChatViewDirect = function(chatId) {
window.updateBottomNavActive(‘messages’);
window.loadPage(‘messages’);
setTimeout(() => window.openChatView(chatId), 200);
};

window.renderNotifications = function() {
const incomingRequests = chatsDB.filter(c => c.status === ‘pending’ && c.initiator !== window.userProfile.uid);
let html = `<div class="card" style="min-height: calc(100vh - 150px);"><h2 style="margin-bottom: 20px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">🔔 Bildirimler</h2>`;
if (incomingRequests.length === 0) {
html += `<p style="text-align:center; color:var(--text-gray); padding: 40px 0;">Henüz bekleyen bir bildiriminiz yok.</p>`;
} else {
html += `<div style="display:flex; flex-direction:column; gap:12px;">`;
incomingRequests.forEach(req => {
let avatarHtml = req.avatar && req.avatar.startsWith(‘http’)
? `<img src="${req.avatar}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">`
: `<div style="width:50px; height:50px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:22px; margin:0;">${req.avatar || '👤'}</div>`;
html += `<div style="display:flex; justify-content:space-between; align-items:center; background:#F9FAFB; padding:14px 18px; border-radius:14px; border:1px solid var(--border-color); flex-wrap:wrap; gap:12px;"> <div style="display:flex; align-items:center; gap:12px;"> ${avatarHtml} <div> <strong style="display:block; font-size:15px; cursor:pointer;" onclick="window.viewUserProfile('${req.otherUid}')">${req.name}</strong> <span style="font-size:13px; color:var(--text-gray);">Sizi arkadaş olarak eklemek istiyor.</span> </div> </div> <div style="display:flex; gap:8px;"> <button class="btn-primary" style="padding:9px 18px; width:auto; font-size:13px;" onclick="window.acceptRequest('${req.id}')">✅ Kabul</button> <button class="btn-danger" style="padding:9px 18px; width:auto; font-size:13px;" onclick="window.rejectRequest('${req.id}')">❌ Reddet</button> </div> </div>`;
});
html += `</div>`;
}
html += `</div>`;
mainContent.innerHTML = html;
};

window.acceptRequest = async function(chatId) {
try {
const timeStr = new Date().toLocaleTimeString([], {hour: ‘2-digit’, minute:‘2-digit’});
await updateDoc(doc(db, “chats”, chatId), {
status: ‘accepted’,
messages: arrayUnion({ senderId: “system”, text: “Arkadaşlık isteği kabul edildi! 🎉”, time: timeStr, read: false }),
lastUpdated: serverTimestamp()
});
alert(“İstek kabul edildi!”);
window.renderNotifications();
} catch(error) { alert(“Hata: “ + error.message); }
};

window.rejectRequest = async function(chatId) {
if(confirm(“Bu isteği reddetmek istediğinize emin misiniz?”)) {
try { await deleteDoc(doc(db, “chats”, chatId)); alert(“İstek silindi.”); window.renderNotifications(); }
catch(error) { alert(“Hata: “ + error.message); }
}
};

window.renderMessagesSidebarOnly = function() {
const sidebar = document.querySelector(’.chat-sidebar’);
if(!sidebar) return;
const visibleChats = chatsDB.filter(c => c.status === ‘accepted’ || (c.status === ‘pending’ && c.initiator === window.userProfile.uid));
let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10; padding:15px; border-bottom:1px solid var(--border-color); font-weight:bold;">Mesajlarım</div>`;
if (visibleChats.length === 0) html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Henüz mesajınız yok.</p>`;
visibleChats.forEach(chat => {
const lastMsgObj = chat.messages[chat.messages.length - 1];
let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : “Sohbet başladı.”;
const isActive = chat.id === currentChatId ? ‘active’ : ‘’;
if (chat.status === ‘pending’ && chat.initiator === window.userProfile.uid) rawLastMsg = “⏳ İstek gönderildi…”;
const previewMsg = rawLastMsg.replace(/<br>/g, ’ ’).replace(/<[^>]+>/g, ‘’).substring(0, 35) + (rawLastMsg.length > 35 ? “…” : “”);
let avatarHtml = chat.avatar && chat.avatar.startsWith(‘http’)
? `<img src="${chat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">`
: `<div style="width:40px; height:40px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${chat.avatar || '👤'}</div>`;
html += `<div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')" style="padding:14px; border-bottom:1px solid #E5E7EB; display:flex; gap:10px; cursor:pointer;"> ${avatarHtml} <div class="chat-contact-info" style="flex:1;"> <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="font-weight:bold; font-size:14px;">${chat.name}</span><span style="font-size:11px; color:#9CA3AF;">${lastMsgObj ? lastMsgObj.time : ""}</span></div> <div style="font-size:13px; color:#6B7280;">${previewMsg}</div> </div> </div>`;
});
sidebar.innerHTML = html;
};

window.updateChatMessagesOnly = function(chatId) {
const activeChat = chatsDB.find(c => c.id === chatId);
if(!activeChat) return;
const scrollBox = document.getElementById(‘chat-messages-scroll’);
if(!scrollBox) return;
let chatHTML = ‘’;
activeChat.messages.forEach(msg => {
const type = msg.senderId === window.userProfile.uid ? ‘sent’ : ‘received’;
let ticks = ‘’;
if (type === ‘sent’) {
if (msg.read) ticks = ‘<span style="color:#D1D5DB; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>’;
else ticks = ‘<span style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>’;
}
chatHTML += `<div class="bubble ${type}"><div class="msg-text">${msg.text}</div><div style="display:flex; align-items:center; justify-content:flex-end; font-size:10px; opacity:0.7; margin-top:4px;">${msg.time} ${ticks}</div></div>`;
});
scrollBox.innerHTML = chatHTML;
scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.renderMessages = function() {
let html = `<div class="card" style="padding:0; border:none; background:transparent;"> <div class="chat-layout" id="chat-layout-container"> <div class="chat-sidebar" id="sidebar-container" style="background:white; border-radius:12px 0 0 12px; overflow:hidden;"></div> <div class="chat-main" id="chat-main-view" style="background:#F9FAFB; border-radius:0 12px 12px 0;"> <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-gray); opacity:0.7;"> <div style="font-size:48px; margin-bottom:10px;">💬</div> <div>Sol taraftan bir kişi seçin.</div> </div> </div> </div> </div>`;
mainContent.innerHTML = html;
window.renderMessagesSidebarOnly();
const visibleChats = chatsDB.filter(c => c.status === ‘accepted’ || (c.status === ‘pending’ && c.initiator === window.userProfile.uid));
if(currentChatId && visibleChats.find(c => c.id === currentChatId)) window.openChatView(currentChatId);
};

window.openChatView = function(chatId) {
currentChatId = chatId;
const activeChat = chatsDB.find(c => c.id === chatId);
if(!activeChat) return;
let hasUnread = false;
const updatedMessages = activeChat.messages.map(msg => {
if (msg.senderId !== window.userProfile.uid && msg.read === false) { hasUnread = true; return { …msg, read: true }; }
return msg;
});
if (hasUnread) {
updateDoc(doc(db, “chats”, chatId), { messages: updatedMessages });
activeChat.messages = updatedMessages;
}
window.renderMessagesSidebarOnly();
const container = document.getElementById(‘chat-main-view’);
document.getElementById(‘chat-layout-container’).classList.add(‘chat-active’);
let avatarHtml = activeChat.avatar && activeChat.avatar.startsWith(‘http’)
? `<img src="${activeChat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">`
: `<div style="width:40px; height:40px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0;">${activeChat.avatar || '👤'}</div>`;
let chatHTML = `<div class="chat-header" style="padding:14px; border-bottom:1px solid #E5E7EB; background:white; display:flex; align-items:center; gap:14px;"> <button class="back-btn" onclick="document.getElementById('chat-layout-container').classList.remove('chat-active'); window.resetCurrentChatId();" style="border:none; background:none; font-size:20px; cursor:pointer;">←</button> ${avatarHtml} <div> <div style="font-weight:bold; font-size:15px; cursor:pointer;" onclick="window.viewUserProfile('${activeChat.otherUid}')">${activeChat.name}</div> <div style="font-size:12px; color:#10B981;">UniLoop Ağı</div> </div> </div> <div class="chat-messages" id="chat-messages-scroll" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column;"></div>`;
if (activeChat.status === ‘pending’ && activeChat.initiator === window.userProfile.uid) {
chatHTML += `<div style="padding: 16px; text-align: center; color: var(--text-gray); background: white; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ İsteğinizin kabul edilmesi bekleniyor...</div>`;
} else {
chatHTML += `<div style="padding:12px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:10px;"> <div style="flex:1;"><input type="text" id="chat-input-field" placeholder="Mesaj yazın..." style="width:100%; padding:12px; border-radius:20px; border:1px solid #D1D5DB; background:#F9FAFB; outline:none; font-family:'Plus Jakarta Sans',sans-serif;"></div> <button onclick="window.sendMsg('${chatId}')" style="background:#6366F1; color:white; border:none; border-radius:50%; width:44px; height:44px; cursor:pointer; font-size:18px;">➤</button> </div>`;
}
container.innerHTML = chatHTML;
window.updateChatMessagesOnly(chatId);
const inputField = document.getElementById(‘chat-input-field’);
if(inputField) {
inputField.addEventListener(‘keypress’, (e) => { if(e.key === ‘Enter’) window.sendMsg(chatId); });
if(window.innerWidth > 1024) inputField.focus();
}
};

window.sendMsg = async function(chatId) {
const input = document.getElementById(‘chat-input-field’);
if(input && input.value.trim() !== ‘’) {
try {
const text = input.value.trim();
input.value = ‘’;
const timeStr = new Date().toLocaleTimeString([], {hour: ‘2-digit’, minute:‘2-digit’});
await updateDoc(doc(db, “chats”, chatId), {
messages: arrayUnion({ senderId: window.userProfile.uid, text, time: timeStr, read: false }),
lastUpdated: serverTimestamp()
});
} catch(error) { console.error(“Mesaj gönderilemedi: “, error); }
}
};

// ============================================================================
// 8. ANONİM KAMPÜS (eski Confessions / Feed)
// ============================================================================

window.renderConfessions = function() {
let html = `<div class="feed-layout-container"> <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px 18px; background: inherit; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);"> <h2 style="margin:0; font-size: 19px; font-weight: 800;">🔮 Anonim Kampüs</h2> <button class="btn-primary" style="width:auto; padding: 8px 16px; border-radius: 20px; font-size: 14px;" onclick="window.openConfessionForm()">+ Paylaş</button> </div> <div class="confessions-feed" id="conf-feed"></div> </div>`;
mainContent.innerHTML = html;
if(confessionsDB) window.drawConfessionsFeed();
};

window.openConfessionForm = function() {
window.openModal(‘Yeni Gönderi’, `<div class="form-group"> <label style="font-weight:bold; margin-bottom:8px; display:block;">Kimliğinizi Seçin</label> <select id="new-conf-identity" style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; outline:none; font-size:15px; background:var(--bg-secondary); cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;"> <option value="anon">🤫 Anonim Olarak Paylaş</option> <option value="real">👤 İsmimle Paylaş (${window.userProfile.username || window.userProfile.name})</option> </select> </div> <textarea id="new-conf-text" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:16px; margin-top:10px; resize:none; outline:none; border: 1px solid #E5E7EB; font-family:'Plus Jakarta Sans',sans-serif;" placeholder="Aklından ne geçiyor?..."></textarea> <div class="upload-btn-wrapper" style="margin: 12px 0;"> <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf Ekle (İsteğe Bağlı)</button> <input type="file" id="new-conf-photo" accept="image/*" style="display:none;" /> </div> <div id="conf-preview-container" class="preview-container"></div> <button class="btn-primary" id="publish-conf-btn" onclick="window.submitConfession()" style="padding:14px; font-size:16px; border-radius:12px; font-weight:bold;">Paylaş</button> <p id="conf-upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none;">Yükleniyor...</p>`);
setTimeout(() => {
const photoBtn = document.getElementById(‘conf-photo-trigger-btn’);
const photoInput = document.getElementById(‘new-conf-photo’);
if(photoBtn && photoInput) {
photoBtn.addEventListener(‘click’, () => { photoInput.click(); });
photoInput.addEventListener(‘change’, function(e) {
const file = e.target.files[0];
if(file) {
const reader = new FileReader();
reader.onload = function(event) {
document.getElementById(‘conf-preview-container’).innerHTML = `<div class="preview-box" style="width:100%; height:auto; padding:0; border:none; margin-bottom:15px;"><img src="${event.target.result}" style="width:100%; max-height:200px; object-fit:contain; border-radius:12px; border:1px solid #E5E7EB;"></div>`;
}
reader.readAsDataURL(file);
}
});
}
}, 100);
};

window.submitConfession = async function() {
const textEl = document.getElementById(‘new-conf-text’);
const identityEl = document.getElementById(‘new-conf-identity’);
const photoInput = document.getElementById(‘new-conf-photo’);
const btn = document.getElementById(‘publish-conf-btn’);
const statusEl = document.getElementById(‘conf-upload-status’);
if(!textEl || textEl.value.trim() === ‘’) { alert(“Lütfen bir şeyler yazın.”); return; }
btn.disabled = true;
let imgUrl = “”;
if(photoInput && photoInput.files && photoInput.files.length > 0) {
statusEl.style.display = ‘block’;
try {
const file = photoInput.files[0];
const fileName = Date.now() + ‘*’ + file.name.replace(/\s/g, ‘’);
const storageRef = ref(storage, ‘listings/’ + window.userProfile.uid + ’/feed*’ + fileName);
await uploadBytes(storageRef, file);
imgUrl = await getDownloadURL(storageRef);
} catch(err) { alert(“Fotoğraf yüklenemedi: “ + err.message); btn.disabled = false; statusEl.style.display = ‘none’; return; }
}
const isAnon = identityEl.value === ‘anon’;
const authorName = isAnon ? “Anonim Kullanıcı” : (window.userProfile.username || window.userProfile.name);
const authorAvatar = isAnon ? [“👻”,“👽”,“🤖”,“🦊”,“🎭”][Math.floor(Math.random()*5)] : window.userProfile.avatar;
try {
await addDoc(collection(db, “confessions”), {
authorId: window.userProfile.uid, avatar: authorAvatar, user: authorName,
time: new Date().toLocaleTimeString([], {hour: ‘2-digit’, minute:‘2-digit’}),
text: textEl.value.trim(), imgUrl, comments: [], createdAt: serverTimestamp()
});
window.closeModal();
} catch(e) { alert(“Hata: “ + e.message); btn.disabled = false; }
};

window.deleteConfession = async function(docId) {
if(confirm(‘Bu gönderiyi silmek istediğinize emin misiniz?’)) {
try { await deleteDoc(doc(db, “confessions”, docId)); }
catch(e) { alert(“Hata: “ + e.message); }
}
};

window.drawConfessionsFeed = function() {
const feed = document.getElementById(‘conf-feed’);
if(!feed) return;
if(confessionsDB.length === 0) {
feed.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding: 40px 20px;"><div style="font-size:40px; margin-bottom: 10px;">🔮</div>Henüz paylaşım yok. İlk sen yaz!</div>`;
return;
}
let html = ‘<div style="display:flex; flex-direction:column;">’;
confessionsDB.forEach((post) => {
let imgHtml = ‘’;
if(post.imgUrl) imgHtml = `<img src="${post.imgUrl}" class="feed-post-img" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`;
const commentCount = post.comments ? post.comments.length : 0;
let deleteBtnHtml = post.authorId === window.userProfile.uid ? `<button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">🗑️ Sil</button>` : ‘’;
let premiumHintHtml = (post.user === “Anonim Kullanıcı” && window.userProfile.isPremium) ? `<div style="font-size:11px; color:#D97706; font-weight:bold; margin-top:4px;">🌟 Premium İpucu: Bilgisayar Müh. bölümünden.</div>` : ‘’;
let avatarHtml = post.avatar && post.avatar.startsWith(‘http’)
? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">`
: post.avatar;
html += `<div class="feed-post"> <div class="feed-post-header"> <div class="feed-post-avatar" style="cursor:pointer;" onclick="${post.user !== 'Anonim Kullanıcı' ?`window.viewUserProfile(’${post.authorId}’)`: ''}">${avatarHtml}</div> <div class="feed-post-meta"> <span class="feed-post-author" style="cursor:pointer;" onclick="${post.user !== 'Anonim Kullanıcı' ?`window.viewUserProfile(’${post.authorId}’)` : ''}">${post.user}</span> <span class="feed-post-time">${post.time || 'Az önce'}</span> ${premiumHintHtml} </div> </div> <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div> ${imgHtml} <div class="feed-post-actions"> <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">💬 Yorum Yap (${commentCount})</button> ${deleteBtnHtml} </div> </div>`;
});
html += ‘</div>’;
feed.innerHTML = html;
};

window.openConfessionDetail = function(docId) {
window.openModal(‘Gönderi’, `<div id="confession-detail-container">Yükleniyor...</div>`);
window.updateConfessionDetailLive(docId);
const container = document.getElementById(‘confession-detail-container’);
if(container) container.insertAdjacentHTML(‘afterend’, `<input type="hidden" id="active-post-id" value="${docId}">`);
};

window.updateConfessionDetailLive = function(docId) {
const container = document.getElementById(‘confession-detail-container’);
if(!container) return;
const post = confessionsDB.find(p => p.id === docId);
if(!post) { container.innerHTML = “Gönderi bulunamadı.”; return; }
let imgHtml = ‘’;
if(post.imgUrl) imgHtml = `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:16px; max-height:300px; object-fit:contain; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`;
let commentsHtml = ‘’;
const commentsArray = post.comments || [];
if(commentsArray.length === 0) {
commentsHtml = ‘<p style="text-align:center; padding:15px; color:var(--text-gray); font-size:14px;">Henüz yorum yok.</p>’;
} else {
commentsArray.forEach(c => {
commentsHtml += `<div style="padding:12px; border-radius:12px; margin-bottom:8px; border:1px solid var(--border-color);"><div style="font-weight:800; color:var(--text-dark); margin-bottom:4px; font-size:13px;">${c.user}</div><div style="font-size:14px; color:var(--text-dark);">${c.text}</div></div>`;
});
}
let avatarHtml = post.avatar && post.avatar.startsWith(‘http’)
? `<img src="${post.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">`
: post.avatar;
container.innerHTML = `<div style="margin-bottom:18px;"> <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;"> <div class="feed-post-avatar" style="width:44px; height:44px; font-size:26px;">${avatarHtml}</div> <div><div style="font-weight:bold; font-size:15px;">${post.user}</div><div style="font-size:12px; color:var(--text-gray);">${post.time}</div></div> </div> <div style="font-size:15px; margin-bottom:14px; line-height:1.6; color:var(--text-dark);">${post.text.replace(/\n/g, '<br>')}</div> ${imgHtml} </div> <div style="border-top:1px solid var(--border-color); padding-top:14px; margin-bottom:14px;"> <h4 style="margin-bottom:10px; font-size:14px; font-weight:bold;">Yorumlar (${commentsArray.length})</h4> <div style="max-height: 220px; overflow-y: auto;" id="conf-comments-scroll">${commentsHtml}</div> </div> <div style="display:flex; gap:10px; align-items:center; background:inherit; padding:10px; border-radius:12px; border:1px solid var(--border-color);"> <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif;" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')"> <button class="btn-primary" style="width:auto; padding:8px 14px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button> </div>`;
const scrollBox = document.getElementById(‘conf-comments-scroll’);
if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.submitConfessionComment = async function(docId) {
const input = document.getElementById(‘new-conf-comment’);
if(input && input.value.trim() !== ‘’) {
try {
await updateDoc(doc(db, “confessions”, docId), { comments: arrayUnion({ user: window.userProfile.username || window.userProfile.name, text: input.value.trim() }) });
} catch(e) { alert(“Yorum gönderilemedi: “ + e.message); }
}
};

// ============================================================================
// 9. FAKÜLTELER SAYFASI (Bottom Nav’dan erişim)
// ============================================================================

window.renderFaculties = function() {
const faculties = [
{ name: “Tıp Fakültesi”, icon: “🩺”, color: “linear-gradient(135deg, #EF4444, #B91C1C)”, desc: “Tıp öğrencileri için özel ağ” },
{ name: “Diş Hekimliği Fakültesi”, icon: “🦷”, color: “linear-gradient(135deg, #06B6D4, #0891B2)”, desc: “Diş hekimliği topluluğu” },
{ name: “Bilgisayar Fakültesi”, icon: “💻”, color: “linear-gradient(135deg, #3B82F6, #1D4ED8)”, desc: “Yazılım ve teknoloji ağı” },
{ name: “Eczacılık Fakültesi”, icon: “💊”, color: “linear-gradient(135deg, #10B981, #047857)”, desc: “Eczacılık öğrencileri” },
{ name: “Hukuk Fakültesi”, icon: “⚖️”, color: “linear-gradient(135deg, #8B5CF6, #6D28D9)”, desc: “Hukuk topluluğu” },
];

```
let html = `
    <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 20px 20px 0;">
            <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800;">🏛️ Fakülteler</h2>
            <p style="color: var(--text-gray); font-size: 14px; margin: 0 0 20px 0;">Fakülte kodunla giriş yap ve topluluğuna katıl.</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0;">
`;

faculties.forEach((f, idx) => {
    const isJoined = window.joinedFaculties.some(jf => jf.name === f.name) || window.userProfile.faculty === f.name;
    html += `
        <div onclick="window.handleFacultyClick('${f.name}', '${f.icon}', '${f.color}')" style="display: flex; align-items: center; gap: 16px; padding: 18px 20px; cursor: pointer; border-top: ${idx > 0 ? '1px solid var(--border-color)' : 'none'}; transition: background 0.2s;" onmouseenter="this.style.background='#F8FAFC'" onmouseleave="this.style.background='transparent'">
            <div style="width: 52px; height: 52px; border-radius: 16px; background: ${f.color}; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;">
                ${f.icon}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 15px; color: var(--text-dark); margin-bottom: 3px;">${f.name}</div>
                <div style="font-size: 13px; color: var(--text-gray);">${f.desc}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                ${isJoined ? '<span style="font-size: 12px; background: #D1FAE5; color: #065F46; padding: 4px 10px; border-radius: 20px; font-weight: 700;">✓ Üye</span>' : ''}
                <span style="color: var(--text-gray); font-size: 18px;">›</span>
            </div>
        </div>
    `;
});

html += `</div></div>`;
mainContent.innerHTML = html;
```

};

// ============================================================================
// 10. FAKÜLTE FORUM SİSTEMİ
// ============================================================================

window.currentFacultyPosts = [];

window.handleFacultyClick = async function(name, icon, bgColor) {
if(window.innerWidth <= 1024 && document.getElementById(‘sidebar’)) document.getElementById(‘sidebar’).classList.remove(‘open’);
const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;
if(isJoined) { window.loadFacultyFeed(name, icon, bgColor); }
else {
mainContent.innerHTML = `<div class="join-faculty-box" style="text-align:center; padding:40px 20px; background:white; border-radius:16px; border:1px solid var(--border-color); margin-top:20px;"> <div style="font-size:60px; margin-bottom:20px;">${icon}</div> <h2 style="font-size:22px; margin-bottom:10px;">${name}</h2> <p style="color:var(--text-gray); font-size:15px; margin-bottom:24px;">Bu alan kapalı bir ağdır. Girmek için fakülte kodunu gir.</p> <div style="max-width: 300px; margin: 0 auto 20px auto;"> <input type="text" id="faculty-passcode-input" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; outline:none; font-family:'Plus Jakarta Sans',sans-serif;" placeholder="Giriş Kodunu Yaz"> </div> <button class="btn-primary" style="max-width:240px; font-size:15px; padding:14px; border-radius:12px;" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">Ağa Katıl</button> </div>`;
window.scrollTo(0,0);
}
};

window.verifyFacultyCode = async function(name, icon, bgColor) {
const inputCode = document.getElementById(‘faculty-passcode-input’).value.trim();
if (FACULTY_PASSCODES[name] && inputCode.toLowerCase() === FACULTY_PASSCODES[name].toLowerCase()) {
window.userProfile.faculty = name;
window.joinedFaculties = [{name, icon, color: bgColor}];
await updateDoc(doc(db, “users”, window.userProfile.uid), { faculty: name });
window.updateMyFacultiesSidebar();
window.loadFacultyFeed(name, icon, bgColor);
} else { alert(“Hatalı kod!”); }
};

window.loadFacultyFeed = async function(name, icon, bgColor) {
const activeUsersCount = Math.floor(Math.random() * 80) + 20;
mainContent.innerHTML = `<div style="display:flex; flex-direction:column; gap:16px;"> <div style="padding:20px; background:${bgColor}; color:white; border-radius:18px; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.15);"> <div style="display:flex; align-items:center; gap:14px;"> <div style="font-size:36px; background:rgba(255,255,255,0.2); width:56px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:14px;">${icon}</div> <div> <h2 style="margin:0; font-size:20px; font-weight: 800;">${name}</h2> <span style="font-size:13px; opacity:0.9;">Fakülte Forumu</span> </div> </div> <div style="background: rgba(255,255,255,0.2); padding: 7px 12px; border-radius: 12px; font-weight: bold; font-size: 12px;">🟢 ${activeUsersCount}</div> </div> <div class="card" style="padding:14px 16px; display:flex; gap:12px; align-items:flex-start;"> <div class="avatar" style="width:38px; height:38px; font-size:18px; margin:0; display:flex; align-items: center; justify-content: center; flex-shrink:0;">${window.userProfile.avatarUrl ?`<img src="${window.userProfile.avatarUrl}" style="width:38px; height:38px; border-radius:50%; object-fit:cover;">`: window.userProfile.avatar}</div> <div style="flex:1;"> <textarea id="faculty-post-input" placeholder="Fakülteye özel bir şeyler paylaş..." style="width:100%; border:none; resize:none; outline:none; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; background:transparent; min-height:56px;"></textarea> <div style="display:flex; justify-content:flex-end; border-top:1px solid var(--border-color); padding-top:10px; margin-top:8px;"> <button class="btn-primary" style="width:auto; padding:8px 18px; border-radius:20px; font-size:14px;" onclick="window.submitFacultyPost()">Paylaş</button> </div> </div> </div> <div id="faculty-posts-container" style="display:flex; flex-direction:column; gap:14px;"></div> </div>`;
if(window.currentFacultyPosts.length === 0) {
window.currentFacultyPosts.push({ id: 1, user: “Sistem Moderatörü”, avatar: “🤖”, text: “Fakülte forumuna hoş geldin! Bu alan yalnızca fakültendeki öğrencilere özeldir.”, time: “Bugün”, likes: 12, replies: 0 });
}
window.renderFacultyPosts();
};

window.submitFacultyPost = function() {
const input = document.getElementById(‘faculty-post-input’);
if(!input || input.value.trim() === ‘’) return;
window.currentFacultyPosts.unshift({ id: Date.now(), user: window.userProfile.name + “ “ + window.userProfile.surname, avatar: window.userProfile.avatarUrl || window.userProfile.avatar, text: input.value.trim(), time: “Az önce”, likes: 0, replies: 0 });
input.value = ‘’;
window.renderFacultyPosts();
};

window.renderFacultyPosts = function() {
const container = document.getElementById(‘faculty-posts-container’);
if(!container) return;
let html = ‘’;
window.currentFacultyPosts.forEach(post => {
let avatarHtml = post.avatar && post.avatar.startsWith(‘http’)
? `<img src="${post.avatar}" style="width:38px; height:38px; border-radius:50%; object-fit:cover;">`
: post.avatar;
html += `<div class="card" style="padding:14px;"> <div style="display:flex; justify-content:space-between; margin-bottom:10px;"> <div style="display:flex; align-items:center; gap:10px;"> <div style="width:38px; height:38px; font-size:18px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#F3F4F6; flex-shrink:0;">${avatarHtml}</div> <div> <div style="font-weight:bold; font-size:14px;">${post.user}</div> <div style="font-size:12px; color:var(--text-gray);">${post.time}</div> </div> </div> </div> <div style="font-size:14px; line-height:1.5; color:var(--text-dark); margin-bottom:12px;">${post.text.replace(/\n/g, '<br>')}</div> <div style="display:flex; gap:14px; border-top:1px solid var(--border-color); padding-top:10px;"> <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; color:var(--text-gray); font-weight:600; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif;" onclick="this.style.color='#6366F1'; this.innerHTML='💙 ${post.likes + 1}'">🤍 ${post.likes}</button> <button style="background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; color:var(--text-gray); font-weight:600; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif;">💬 ${post.replies}</button> </div> </div>`;
});
container.innerHTML = html;
};

// ============================================================================
// 11. SAYFA YÖNLENDİRME (ROUTING)
// ============================================================================

window.loadPage = function(pageName) {
if(window.innerWidth <= 1024 && document.getElementById(‘sidebar’)) document.getElementById(‘sidebar’).classList.remove(‘open’);
window.scrollTo(0,0);
window.updateBottomNavActive(pageName);

```
if (pageName === 'home') window.renderHome();
else if (pageName === 'confessions') window.renderConfessions();
else if (pageName === 'messages') window.renderMessages();
else if (pageName === 'faculties') window.renderFaculties();
else if (pageName === 'profile') window.renderProfile();
else if (pageName === 'market') window.renderListings('market', '🛒 Kampüs Market');
else if (pageName === 'notifications') window.renderNotifications();
else if (pageName === 'friends') window.renderFriends();
else if (pageName === 'settings') window.renderSettings();
// Eski menu item desteği
else if (pageName === 'confessions') window.renderConfessions();
```

};

document.querySelectorAll(’.menu-item[data-target]’).forEach(item => {
item.addEventListener(‘click’, (e) => {
if(e.currentTarget.getAttribute(‘data-target’)) {
document.querySelectorAll(’.menu-item’).forEach(m => m.classList.remove(‘active’));
e.currentTarget.classList.add(‘active’);
window.loadPage(e.currentTarget.getAttribute(‘data-target’));
}
});
});

bind(‘logo-btn’, ‘click’, () => {
window.updateBottomNavActive(‘home’);
window.loadPage(‘home’);
});

bind(‘profile-btn’, ‘click’, () => {
window.updateBottomNavActive(‘profile’);
window.loadPage(‘profile’);
});

// ============================================================================
// 12. PROFİL SAYFASI (BİLDİRİMLER + ARKADAŞ LİSTESİ + DÜZENLEME)
// ============================================================================

window.renderProfile = function() {
const acceptedFriends = chatsDB.filter(c => c.status === ‘accepted’);
const incomingRequests = chatsDB.filter(c => c.status === ‘pending’ && c.initiator !== window.userProfile.uid);

```
let premiumBadge = window.userProfile.isPremium
    ? '<span style="font-size:11px; background:#FEF3C7; color:#D97706; padding:3px 8px; border-radius:8px; font-weight:700; margin-left:8px;">🌟 Premium</span>'
    : '';

let avatarHtml = window.userProfile.avatarUrl
    ? `<img src="${window.userProfile.avatarUrl}" style="width:90px; height:90px; border-radius:50%; border: 3px solid white; object-fit:cover; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">`
    : `<div style="width:90px; height:90px; border-radius:50%; border: 3px solid white; font-size:44px; display:flex; align-items:center; justify-content:center; background:#EEF2FF; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">${window.userProfile.avatar}</div>`;

const interestTags = (window.userProfile.interests && window.userProfile.interests.length > 0)
    ? window.userProfile.interests.map(i => `<span class="interest-tag">${i}</span>`).join('')
    : '';

mainContent.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">

        <!-- Profil Kartı -->
        <div class="card" style="padding: 0; overflow: hidden; border-radius: 20px;">
            <div style="background: linear-gradient(135deg, #0F172A, #6366F1); height: 110px; position: relative;"></div>
            <div style="text-align: center; margin-top: -45px; padding: 0 20px 20px;">
                <div style="position: relative; display: inline-block;">
                    ${avatarHtml}
                    <button onclick="document.getElementById('avatar-upload').click()" style="position: absolute; bottom: 2px; right: 2px; background: #6366F1; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; font-size:14px;">📷</button>
                    <input type="file" id="avatar-upload" accept="image/*" style="display: none;" onchange="window.triggerAvatarCrop(this)">
                </div>
                <h2 style="margin: 10px 0 3px 0; font-size:18px; font-weight: 800;">${window.userProfile.name} ${window.userProfile.surname} ${premiumBadge}</h2>
                <p style="color: #6366F1; font-size: 14px; margin-bottom: 3px; font-weight: 700;">${window.userProfile.username || '@kullaniciadi'}</p>
                <p style="color: var(--text-gray); font-size: 12px; margin-bottom: 10px;">🎓 ${window.userProfile.university}${window.userProfile.faculty ? ' · ' + window.userProfile.faculty : ''}${window.userProfile.grade ? ' · ' + window.userProfile.grade : ''}</p>
                ${interestTags ? `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-bottom: 10px;">${interestTags}</div>` : ''}
            </div>
        </div>

        <!-- Bildirimler -->
        <div class="card" style="padding: 18px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800;">🔔 Bildirimler</h3>
                ${incomingRequests.length > 0 ? `<span style="background: #EF4444; color: white; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">${incomingRequests.length} Yeni</span>` : ''}
            </div>
            ${incomingRequests.length === 0
                ? `<p style="color: var(--text-gray); font-size: 14px; text-align: center; padding: 12px 0;">Yeni bildirim yok.</p>`
                : incomingRequests.slice(0, 3).map(req => {
                    let av = req.avatar && req.avatar.startsWith('http')
                        ? `<img src="${req.avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; flex-shrink:0;">`
                        : `<div style="width:42px; height:42px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">${req.avatar || '👤'}</div>`;
                    return `
                        <div class="profile-notification-item">
                            ${av}
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 14px; color: var(--text-dark);">${req.name}</div>
                                <div style="font-size: 12px; color: var(--text-gray);">Arkadaşlık isteği gönderdi</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <button onclick="window.acceptRequest('${req.id}')" style="background: #6366F1; color: white; border: none; border-radius: 10px; padding: 7px 12px; font-size: 12px; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">✅</button>
                                <button onclick="window.rejectRequest('${req.id}')" style="background: #F1F5F9; color: #64748B; border: none; border-radius: 10px; padding: 7px 12px; font-size: 12px; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">❌</button>
                            </div>
                        </div>
                    `;
                }).join('')
            }
            ${incomingRequests.length > 3 ? `<button onclick="window.renderNotifications()" style="width:100%; margin-top:10px; padding:10px; border-radius:12px; border:1px solid var(--border-color); background:transparent; color:var(--primary); font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;">Tümünü Gör (${incomingRequests.length})</button>` : ''}
        </div>

        <!-- Arkadaş Listesi -->
        <div class="card" style="padding: 18px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800;">👥 Arkadaşlarım</h3>
                <span style="background: #EEF2FF; color: #6366F1; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">${acceptedFriends.length} Kişi</span>
            </div>
            ${acceptedFriends.length === 0
                ? `<p style="color: var(--text-gray); font-size: 14px; text-align: center; padding: 12px 0;">Henüz arkadaşın yok.</p>`
                : acceptedFriends.slice(0, 4).map(friend => {
                    let av = friend.avatar && friend.avatar.startsWith('http')
                        ? `<img src="${friend.avatar}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0;">`
                        : `<div style="width:44px; height:44px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">${friend.avatar || '👤'}</div>`;
                    return `
                        <div class="profile-friend-item" onclick="window.viewUserProfile('${friend.otherUid}')">
                            ${av}
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 14px; color: var(--text-dark);">${friend.name}</div>
                            </div>
                            <button onclick="event.stopPropagation(); window.openChatViewDirect('${friend.id}')" style="background: #EEF2FF; color: #6366F1; border: none; border-radius: 10px; padding: 7px 14px; font-size: 12px; cursor: pointer; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; flex-shrink:0;">💬 Mesaj</button>
                        </div>
                    `;
                }).join('')
            }
            ${acceptedFriends.length > 4 ? `<button onclick="window.renderFriends()" style="width:100%; margin-top:8px; padding:10px; border-radius:12px; border:1px solid var(--border-color); background:transparent; color:var(--primary); font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;">Tümünü Gör (${acceptedFriends.length})</button>` : ''}
        </div>

        <!-- Profil Düzenleme -->
        <div class="card" style="padding: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 800;">✏️ Profili Düzenle</h3>
            <div class="form-group">
                <label style="font-size:12px; color:#6B7280; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Biyografi / Hobiler</label>
                <textarea id="prof-bio" rows="3" placeholder="Kendinden biraz bahset..." style="width:100%; border:1px solid #D1D5DB; border-radius:12px; padding:12px; font-family:'Plus Jakarta Sans',sans-serif; resize:none; outline:none; font-size:14px; margin-top:6px;">${window.userProfile.bio || ''}</textarea>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
                <div class="form-group">
                    <label style="font-size:12px; color:#6B7280; font-weight:700;">Ad</label>
                    <input type="text" id="prof-name" value="${window.userProfile.name}" style="border:1px solid #D1D5DB; border-radius:12px; padding:12px; margin-top:6px; width:100%; font-family:'Plus Jakarta Sans',sans-serif; outline:none; font-size:14px;">
                </div>
                <div class="form-group">
                    <label style="font-size:12px; color:#6B7280; font-weight:700;">Soyad</label>
                    <input type="text" id="prof-surname" value="${window.userProfile.surname}" style="border:1px solid #D1D5DB; border-radius:12px; padding:12px; margin-top:6px; width:100%; font-family:'Plus Jakarta Sans',sans-serif; outline:none; font-size:14px;">
                </div>
                <div class="form-group">
                    <label style="font-size:12px; color:#6B7280; font-weight:700;">Yaş</label>
                    <input type="number" id="prof-age" value="${window.userProfile.age || ''}" placeholder="Yaşınız" style="border:1px solid #D1D5DB; border-radius:12px; padding:12px; margin-top:6px; width:100%; font-family:'Plus Jakarta Sans',sans-serif; outline:none; font-size:14px;">
                </div>
                <div class="form-group">
                    <label style="font-size:12px; color:#6B7280; font-weight:700;">Kullanıcı Adı</label>
                    <div style="display:flex; align-items:center; background:white; border:1px solid #D1D5DB; border-radius:12px; overflow:hidden; margin-top:6px;">
                        <span style="padding-left:14px; color:#6366F1; font-weight:800; font-size:16px;">#</span>
                        <input type="text" id="prof-username" value="${(window.userProfile.username || '').replace('#', '')}" placeholder="kullaniciadi" style="border:none; background:transparent; width:100%; padding:12px 10px; outline:none; font-size:14px; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif;">
                    </div>
                </div>
            </div>
            <button class="btn-primary" onclick="window.saveProfile()" style="width: 100%; padding: 14px; font-size: 15px; border-radius: 12px; margin-top:16px; font-weight:800;">💾 Profili Güncelle</button>

            ${!window.userProfile.isPremium ? `
            <div onclick="window.openPremiumModal()" style="margin-top: 12px; background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 1px solid #FCD34D; border-radius: 14px; padding: 16px 18px; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.01)'" onmouseleave="this.style.transform='scale(1)'">
                <span style="font-size: 28px;">👑</span>
                <div>
                    <div style="font-weight: 800; color: #92400E; font-size: 15px;">UniLoop Premium'a Geç</div>
                    <div style="font-size: 13px; color: #B45309;">Özel özellikler için tıkla →</div>
                </div>
            </div>` : ''}

            <button class="btn-danger" onclick="window.logout()" style="width: 100%; padding: 14px; font-size: 15px; border-radius: 12px; background: transparent; color: #EF4444; border: 2px solid #EF4444; font-weight:700; margin-top: 12px;">🚪 Çıkış Yap</button>
        </div>
    </div>
`;
```

};

// ============================================================================
// AVATAR KIRPMA (CROPPER.JS)
// ============================================================================

window.triggerAvatarCrop = function(inputEl) {
if(!inputEl.files || inputEl.files.length === 0) return;
const file = inputEl.files[0];
const reader = new FileReader();
reader.onload = function(e) {
window.openModal(‘Profil Fotoğrafını Kırp’, `<div style="width: 100%; max-height: 380px; margin-bottom: 18px; display:flex; justify-content:center;"> <img id="cropper-image" src="${e.target.result}" style="max-width: 100%; display:block;"> </div> <button class="btn-primary" id="crop-upload-btn" style="width: 100%; padding: 14px; font-size: 15px; font-weight: bold; border-radius:12px;">✂️ Kırp ve Yükle</button> <p id="profile-upload-status" style="display:none; color:var(--primary); text-align:center; margin-top:10px; font-size:13px; font-weight:bold;"></p>`);
setTimeout(() => {
const image = document.getElementById(‘cropper-image’);
if (window.cropperInstance) { window.cropperInstance.destroy(); }
window.cropperInstance = new Cropper(image, { aspectRatio: 1, viewMode: 1, dragMode: ‘move’, guides: false, center: false, highlight: false });
document.getElementById(‘crop-upload-btn’).addEventListener(‘click’, async function() {
const btn = this;
const statusEl = document.getElementById(‘profile-upload-status’);
btn.disabled = true; btn.style.opacity = “0.7”;
statusEl.style.display = ‘block’; statusEl.innerText = ‘Yükleniyor…’;
window.cropperInstance.getCroppedCanvas({ width: 400, height: 400 }).toBlob(async function(blob) {
try {
const fileName = “avatar_” + window.userProfile.uid + “_” + Date.now() + “.png”;
const storageRef = ref(storage, ‘avatars/’ + fileName);
await uploadBytes(storageRef, blob);
const url = await getDownloadURL(storageRef);
window.userProfile.avatarUrl = url;
await updateDoc(doc(db, “users”, window.userProfile.uid), { avatarUrl: url });
window.closeModal();
window.renderProfile();
} catch(err) {
statusEl.innerText = “❌ “ + err.message; statusEl.style.color = “red”;
btn.disabled = false; btn.style.opacity = “1”;
}
}, ‘image/png’);
});
}, 200);
};
reader.readAsDataURL(file);
};

window.saveProfile = async function() {
const name = document.getElementById(‘prof-name’).value;
const surname = document.getElementById(‘prof-surname’).value;
const bio = document.getElementById(‘prof-bio’).value;
const age = document.getElementById(‘prof-age’).value;
let rawUsername = document.getElementById(‘prof-username’).value.trim().toLowerCase();
if(!rawUsername) { alert(“Kullanıcı adı boş bırakılamaz!”); return; }
rawUsername = rawUsername.replace(/^#/, ‘’);
const username = ‘#’ + rawUsername;
if(username !== window.userProfile.username) {
try {
const q = query(collection(db, “users”), where(“username”, “==”, username));
const snapshot = await getDocs(q);
if(!snapshot.empty) { alert(“Bu kullanıcı adı alınmış.”); return; }
} catch(e) { alert(“Hata: “ + e.message); return; }
}
window.userProfile.name = name; window.userProfile.surname = surname;
window.userProfile.username = username; window.userProfile.bio = bio; window.userProfile.age = age;
try {
await updateDoc(doc(db, “users”, window.userProfile.uid), { name, surname, username, bio, age });
alert(“Profil güncellendi! ✅”);
window.renderProfile();
} catch(e) { alert(“Hata: “ + e.message); }
};

window.renderSettings = function() {
const currentLang = localStorage.getItem(‘uniloop_lang’) || ‘tr’;
const currentTheme = localStorage.getItem(‘uniloop_theme’) || ‘light’;
const t = TRANSLATIONS[currentLang];
mainContent.innerHTML = `<div class="card"> <h2>${t.settingsTitle}</h2> <div style="background: inherit; padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid var(--border-color);"> <div class="form-group"> <label>${t.langLabel}</label> <select onchange="window.setLanguage(this.value)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; background:transparent; font-family:'Plus Jakarta Sans',sans-serif;"> <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>Türkçe</option> <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option> </select> </div> <div class="form-group"> <label>${t.themeLabel}</label> <select onchange="window.toggleTheme(this.value)" style="width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; background:transparent; font-family:'Plus Jakarta Sans',sans-serif;"> <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>${t.lightMode}</option> <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>${t.darkMode}</option> </select> </div> </div> <button class="btn-danger" onclick="window.logout()">${t.logoutBtn}</button> </div>`;
};

} // initializeUniLoop sonu

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, initializeUniLoop);
} else {
initializeUniLoop();
}
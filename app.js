// ============================================================================
// 🌟 UNILOOP - GLOBAL CAMPUS NETWORK | CORE ENGINE (FIREBASE) 🌟
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

// — FIREBASE YAPILANDIRMASI —
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

function initializeUniLoop() {

```
// ============================================================================
// 🔧 ACCORDION MENÜ — SAYFA YÜKLENİRKEN BAĞLA
// ============================================================================
function bindAllAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        // Önceki listener'ı kaldırmak için clone trick
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        newHeader.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            if (!content) return;

            const isOpen = content.classList.contains('open');
            if (isOpen) {
                content.classList.remove('open');
                if (icon) icon.classList.remove('rotated');
            } else {
                content.classList.add('open');
                if (icon) icon.classList.add('rotated');
            }
        });
    });
}

// İlk yüklemede bağla
bindAllAccordions();

// ============================================================================
// 🔧 TEMA, DİL, GLOBAL FONKSİYONLAR
// ============================================================================
window.setLanguage = function (lang) {
    localStorage.setItem('uniloop_lang', lang);
    window.renderSettings();
};

window.toggleTheme = function (theme) {
    localStorage.setItem('uniloop_theme', theme);
    if (theme === 'dark') {
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

// Mobilde sidebar dışına tıklandığında kapat
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
document.addEventListener('touchstart', closeSidebarIfOutside, { passive: true });

const bind = (id, event, callback) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
};

// ============================================================================
// SİSTEM HAFIZASI
// ============================================================================
window.userProfile = {
    uid: "", name: "", surname: "", username: "",
    email: "", university: "", avatar: "👨‍🎓",
    faculty: "", organization: "", isPremium: false
};

window.joinedFaculties = [];
window.joinedOrganizations = [];
let marketDB = [];
let confessionsDB = [];
let qaDB = [];
let chatsDB = [];
let currentChatId = null;

window.resetCurrentChatId = function () { currentChatId = null; };

const FACULTY_PASSCODES = {
    "Tıp Fakültesi": "tıpfak100",
    "Hukuk Fakültesi": "hukuk1000",
    "Diş Hekimliği Fakültesi": "dis1000"
};

const ORGANIZATION_PASSCODES = {
    "Spor Kulübü": "spor1000",
    "Tiyatro Kulübü": "tiyatro1000",
    "Sağlık Kulübü": "saglik1000"
};

const globalUniversities = [
    "Yakın Doğu Üniversitesi (NEU)", "Doğu Akdeniz Üniversitesi (EMU)",
    "Girne Amerikan Üniversitesi (GAU)", "Uluslararası Kıbrıs Üniversitesi (CIU)",
    "Orta Doğu Teknik Üniversitesi (ODTÜ)", "Boğaziçi Üniversitesi",
    "İstanbul Teknik Üniversitesi (İTÜ)", "Bilkent Üniversitesi", "Koç Üniversitesi",
    "Stanford University", "Massachusetts Institute of Technology (MIT)", "Harvard University"
];

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const mainContent = document.getElementById('main-content');
const modal = document.getElementById('app-modal');

// ============================================================================
// 1. GİRİŞ, KAYIT, ONAY, ŞİFREMİ UNUTTUM
// ============================================================================

bind('show-register-btn', 'click', (e) => {
    if (e) e.preventDefault();
    document.getElementById('login-card').style.display = 'none';
    document.getElementById('register-card').style.display = 'block';
});

bind('show-login-btn', 'click', (e) => {
    if (e) e.preventDefault();
    document.getElementById('register-card').style.display = 'none';
    document.getElementById('login-card').style.display = 'block';
});

const uniInput = document.getElementById('reg-uni');
const uniList = document.getElementById('uni-autocomplete-list');

if (uniInput && uniList) {
    uniInput.addEventListener('input', function () {
        const val = this.value;
        uniList.innerHTML = '';
        if (!val) return false;
        const matches = globalUniversities.filter(u => u.toLowerCase().includes(val.toLowerCase()));
        matches.forEach(match => {
            const div = document.createElement('div');
            const regex = new RegExp(`(${val})`, "gi");
            div.innerHTML = match.replace(regex, "<strong>$1</strong>");
            div.addEventListener('click', function () { uniInput.value = match; uniList.innerHTML = ''; });
            uniList.appendChild(div);
        });
    });
    document.addEventListener('click', (e) => { if (e.target !== uniInput) uniList.innerHTML = ''; });
}

bind('register-btn', 'click', async (e) => {
    if (e) e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const surname = document.getElementById('reg-surname').value.trim();
    const uni = document.getElementById('reg-uni').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!name || !surname || !uni || !email || !password) { alert("Lütfen tüm alanları eksiksiz doldurun."); return; }
    const btn = document.getElementById('register-btn');
    const origText = btn.innerText;
    btn.innerText = "Hesap Oluşturuluyor..."; btn.disabled = true;
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        document.getElementById('register-card').style.display = 'none';
        document.getElementById('verify-card').style.display = 'block';
        btn.innerText = origText; btn.disabled = false;
        sendEmailVerification(user).catch(err => console.error("Mail gönderilemedi:", err));
        setDoc(doc(db, "users", user.uid), {
            uid: user.uid, name, surname, username: "", university: uni,
            email, avatar: "👨‍🎓", isOnline: false, faculty: "", organization: "", isPremium: false
        }).then(() => window.ensureWelcomeMessage(user, name))
          .catch(dbError => console.error("Veritabanı Kayıt Hatası:", dbError));
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') alert("Bu e-posta adresi zaten kullanımda.");
        else alert("Kayıt olurken bir hata oluştu: " + error.message);
        btn.innerText = origText; btn.disabled = false;
    }
});

bind('verify-code-btn', 'click', async (e) => {
    if (e) e.preventDefault();
    const user = auth.currentUser;
    if (!user) { alert("Oturum zaman aşımına uğradı. Lütfen yeniden giriş yapın."); return; }
    const btn = document.getElementById('verify-code-btn');
    const originalText = btn.innerText;
    btn.innerText = "Kontrol Ediliyor..."; btn.disabled = true;
    try {
        await user.reload();
        if (user.emailVerified) { alert("Tebrikler! Hesabınız aktifleştirildi."); window.location.reload(); }
        else { alert("Hesabınız henüz onaylanmamış! Lütfen e-postanıza gelen linke tıklayın."); btn.innerText = originalText; btn.disabled = false; }
    } catch (err) { console.error(err); alert("Hata: " + err.message); btn.innerText = originalText; btn.disabled = false; }
});

bind('login-btn', 'click', async (e) => {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    if (!email || !password) { alert("Lütfen e-posta ve şifrenizi girin."); return; }
    const originalText = btn.innerText;
    btn.innerText = "Giriş Yapılıyor..."; btn.disabled = true;
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (!userCred.user.emailVerified) {
            alert("Hesabınız henüz onaylanmamış. Lütfen e-postanızı kontrol edin.");
            document.getElementById('login-card').style.display = 'none';
            document.getElementById('verify-card').style.display = 'block';
            btn.innerText = originalText; btn.disabled = false; return;
        }
        await window.ensureWelcomeMessage(userCred.user, userCred.user.displayName || "Öğrenci");
    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert("Giriş başarısız! E-posta veya şifreniz yanlış.");
        btn.innerText = originalText; btn.disabled = false;
    }
});

bind('forgot-password-btn', 'click', async (e) => {
    if (e) e.preventDefault();
    const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
    if (!email) return;
    try { await sendPasswordResetEmail(auth, email); alert("Şifre sıfırlama bağlantısı gönderildi!"); }
    catch (error) { alert("Hata: " + error.message); }
});

window.ensureWelcomeMessage = async function (user, userName) {
    if (!user) return;
    try {
        const chatId = user.uid + "_system_welcome";
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
            const systemMessageText = `Merhaba ${userName}! UniLoop'a hoş geldin. 🎓✨<br><br>🛒 <b>Kampüs Market:</b> İhtiyacın olmayan eşyaları sat.<br>📸 <b>Kampüs Akışı:</b> Düşüncelerini özgürce paylaş.<br>❓ <b>Soru & Cevap:</b> Aklına takılan her şeyi sor.<br>Hemen "Profilim" sekmesinden kullanıcı adı belirle!`;
            await setDoc(chatRef, {
                participants: [user.uid, "system"],
                participantNames: { [user.uid]: userName, "system": "UniLoop Team" },
                participantAvatars: { [user.uid]: "👨‍🎓", "system": "🌍" },
                lastUpdated: serverTimestamp(), status: 'accepted', initiator: 'system',
                messages: [{ senderId: "system", text: systemMessageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false }]
            });
        }
    } catch (error) { console.error("Karşılama mesajı oluşturulamadı:", error); }
};

window.logout = async function () {
    try {
        if (window.userProfile.uid) await updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
        await signOut(auth);
        if (authScreen && appScreen) {
            appScreen.style.display = 'none';
            authScreen.style.display = 'flex';
            document.getElementById('login-card').style.display = 'block';
            document.getElementById('register-card').style.display = 'none';
            document.getElementById('verify-card').style.display = 'none';
            const btn = document.getElementById('login-btn');
            if (btn) { btn.innerText = "Giriş Yap"; btn.disabled = false; }
        }
    } catch (error) { console.error("Çıkış hatası:", error); }
};

// ============================================================================
// 2. AUTH STATE & REALTIME
// ============================================================================

onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
        if (authScreen && appScreen) { authScreen.style.display = 'none'; appScreen.style.display = 'block'; }

        // Bildirimler butonunu ekle (bir kez)
        if (!document.getElementById('nav-notifications-btn')) {
            const msgBtn = document.getElementById('nav-messages-btn');
            if (msgBtn) {
                msgBtn.insertAdjacentHTML('afterend', `
                    <div class="menu-item" id="nav-notifications-btn" data-target="notifications">
                        ↳ Bildirimler <span id="notif-badge" class="badge" style="display:none; background:#EF4444; color:white; padding:2px 8px; border-radius:12px; font-size:11px; margin-left:auto;">0</span>
                    </div>
                `);
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
            if (docSnap.exists()) {
                window.userProfile = docSnap.data();
                if (window.userProfile.isPremium === undefined) window.userProfile.isPremium = false;
                if (window.userProfile.organization === undefined) window.userProfile.organization = "";
            } else {
                window.userProfile = {
                    uid: user.uid, name: "Öğrenci", surname: "", username: "",
                    email: user.email, university: "UniLoop Kampüsü", avatar: "👨‍🎓",
                    faculty: "", organization: "", isOnline: true, isPremium: false
                };
                await setDoc(userDocRef, window.userProfile);
            }
            await window.ensureWelcomeMessage(user, window.userProfile.name);
            await updateDoc(userDocRef, { isOnline: true });
            initRealtimeListeners(user.uid);

            const activeTab = document.querySelector('.menu-item.active');
            if (typeof window.loadPage === 'function') window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home');

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

            // Sidebar accordion'ları yeniden bağla (DOM güncellenmiş olabilir)
            bindAllAccordions();

        } catch (error) {
            window.userProfile = {
                uid: user.uid, name: "Misafir", surname: "", username: "", email: user.email,
                university: "Lütfen Firestore'u Test Moduna Alın", avatar: "⚠️",
                faculty: "", organization: "", isOnline: true, isPremium: false
            };
            if (typeof window.loadPage === 'function') window.loadPage('home');
        }
    }
});

window.addEventListener("beforeunload", () => {
    if (window.userProfile && window.userProfile.uid)
        updateDoc(doc(db, "users", window.userProfile.uid), { isOnline: false });
});

function initRealtimeListeners(currentUid) {
    const safeSortTime = (item) => item.createdAt && item.createdAt.seconds ? item.createdAt.seconds : 0;

    onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
        marketDB = [];
        snapshot.forEach(d => marketDB.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
        marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        const activeTab = document.querySelector('.menu-item.active');
        if (activeTab && activeTab.getAttribute('data-target') === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
        if (activeTab && activeTab.getAttribute('data-target') === 'housing') window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
    });

    onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
        confessionsDB = [];
        snapshot.forEach(d => confessionsDB.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
        confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        const activeTab = document.querySelector('.menu-item.active');
        if (activeTab && activeTab.getAttribute('data-target') === 'confessions') window.drawConfessionsFeed();
        if (document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
            const activePostId = document.getElementById('active-post-id').value;
            if (activePostId) window.updateConfessionDetailLive(activePostId);
        }
    });

    onSnapshot(query(collection(db, "qa"), orderBy("createdAt", "desc")), (snapshot) => {
        qaDB = [];
        snapshot.forEach(d => qaDB.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
        qaDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
        const activeTab = document.querySelector('.menu-item.active');
        if (activeTab && activeTab.getAttribute('data-target') === 'qa') {
            const activeFilter = document.querySelector('.qa-filter-btn.active');
            window.drawQAGrid(activeFilter ? activeFilter.getAttribute('data-filter') : 'Genel');
        }
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
            } catch (err) { console.error("Hatalı mesaj belgesi:", err); }
        });
        chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);
        const notifBadge = document.getElementById('notif-badge');
        if (notifBadge) {
            if (pendingRequestsCount > 0) { notifBadge.style.display = 'inline-block'; notifBadge.innerText = pendingRequestsCount; }
            else notifBadge.style.display = 'none';
        }
        const activeTab = document.querySelector('.menu-item.active');
        if (activeTab && activeTab.getAttribute('data-target') === 'messages') {
            const inputField = document.getElementById('chat-input-field');
            const isFocused = inputField && inputField === document.activeElement;
            const currentText = inputField ? inputField.value : '';
            if (currentChatId) {
                window.renderMessagesSidebarOnly();
                window.updateChatMessagesOnly(currentChatId);
                const newInputField = document.getElementById('chat-input-field');
                if (newInputField) { newInputField.value = currentText; if (isFocused) { newInputField.focus(); newInputField.selectionStart = newInputField.selectionEnd = newInputField.value.length; } }
            } else { window.renderMessages(); }
        } else if (activeTab && activeTab.getAttribute('data-target') === 'notifications') { window.renderNotifications(); }
    });
}

// ============================================================================
// 🌟 PREMIUM
// ============================================================================
window.openPremiumModal = function () {
    window.openModal('🌟 UniLoop Premium', `
        <div style="text-align:center; padding: 10px;">
            <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
            <h3 style="color:#D97706; margin-bottom: 10px; font-size: 22px;">Kampüsün Zirvesine Çık!</h3>
            <p style="margin-bottom:20px; font-size:15px; color:var(--text-gray);">UniLoop Premium ile sınırları kaldır.</p>
            <ul style="text-align:left; background:#FEF3C7; padding: 20px; border-radius: 12px; margin-bottom:20px; list-style:none; color:#92400E; font-weight:500; font-size: 14px;">
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🟢</span> <span><strong>Gelişmiş AI Radarı:</strong> Bölümdaşlarını anında gör.</span></li>
                <li style="margin-bottom:12px; display:flex; gap:10px;"><span style="font-size:18px;">🕵️</span> <span><strong>Seni Kimler Beğendi?:</strong> Profilini gezen herkesi gör.</span></li>
                <li style="display:flex; gap:10px;"><span style="font-size:18px;">🚀</span> <span><strong>Super DM:</strong> Mesajların kilit ekranına düşsün.</span></li>
            </ul>
            <div style="font-size:32px; font-weight:800; margin-bottom:20px; color:var(--text-dark);">49.99 ₺ <span style="font-size:14px; color:var(--text-gray); font-weight:normal;">/ aylık</span></div>
            <button id="buy-premium-btn" onclick="window.upgradeToPremium()" class="premium-upgrade-btn premium-glow" style="width:100%; justify-content:center; padding: 16px; font-size: 16px;">💳 Güvenli Ödeme İle Satın Al</button>
            <p style="font-size:11px; color:#9CA3AF; margin-top:10px;">*İstediğin zaman iptal edebilirsin.</p>
        </div>
    `);
};

window.upgradeToPremium = async function () {
    const btn = document.getElementById('buy-premium-btn');
    btn.innerText = '⏳ İşleniyor...'; btn.disabled = true;
    setTimeout(async () => {
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: true });
            window.userProfile.isPremium = true;
            const navBtn = document.getElementById('nav-premium-action');
            if (navBtn) navBtn.style.display = 'none';
            window.closeModal();
            alert("🎉 Premium aktifleştirildi!");
            window.loadPage('home');
        } catch (e) { alert("Hata: " + e.message); btn.innerText = '💳 Güvenli Ödeme İle Satın Al'; btn.disabled = false; }
    }, 3000);
};

// ============================================================================
// 3. MODAL VE TIKLAMA YÖNETİMİ
// ============================================================================

window.goToMessages = function () {
    const msgTab = document.querySelector('[data-target="messages"]');
    if (msgTab) msgTab.click();
};

window.openModal = function (title, contentHTML) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = contentHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function () {
    modal.classList.remove('active');
    document.getElementById('modal-body').innerHTML = '';
    if (!document.getElementById('lightbox').classList.contains('active')) document.body.style.overflow = 'auto';
};

bind('modal-close', 'click', window.closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) window.closeModal(); });

bind('mobile-menu-btn', 'click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ====================================================
// 🌐 GLOBAL TIKLAMA DİNLEYİCİ — Fakülte & Kulüp Linkleri
// ====================================================
document.body.addEventListener('click', (e) => {
    // Fakülte linki
    const communityLink = e.target.closest('.community-link');
    if (communityLink) {
        const name = communityLink.getAttribute('data-name');
        const icon = communityLink.getAttribute('data-icon');
        const color = communityLink.getAttribute('data-color');
        if (typeof window.handleFacultyClick === 'function') window.handleFacultyClick(name, icon, color);
        // Mobilde sidebar'ı kapat
        if (window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');
        return;
    }

    // Kulüp/Organizasyon linki
    const orgLink = e.target.closest('.org-link');
    if (orgLink) {
        const name = orgLink.getAttribute('data-name');
        const icon = orgLink.getAttribute('data-icon');
        const color = orgLink.getAttribute('data-color');
        if (typeof window.handleOrganizationClick === 'function') window.handleOrganizationClick(name, icon, color);
        if (window.innerWidth <= 1024) document.getElementById('sidebar').classList.remove('open');
        return;
    }
});

// ============================================================================
// 4. ANA SAYFA
// ============================================================================

window.searchAndAddFriend = async function () {
    try {
        const searchInput = document.getElementById('friend-search-input');
        if (!searchInput) return;
        let rawSearch = searchInput.value.trim().toLowerCase();
        if (!rawSearch) { alert("Lütfen bir kullanıcı adı yazın."); return; }
        if (!window.userProfile.username) { alert("Arkadaş eklemeden önce profilinizden kullanıcı adı belirleyin!"); return; }
        rawSearch = rawSearch.replace(/^#/, '');
        const searchVal = '#' + rawSearch;
        if (searchVal === window.userProfile.username) { alert("Kendinizi arkadaş olarak ekleyemezsiniz :)"); return; }
        const btn = document.getElementById('friend-search-btn');
        const origText = btn.innerText;
        btn.innerText = "Aranıyor..."; btn.disabled = true;
        const q = query(collection(db, "users"), where("username", "==", searchVal));
        const snapshot = await getDocs(q);
        if (snapshot.empty) alert("Bu kullanıcı adına sahip kimse bulunamadı!");
        else { const targetUser = snapshot.docs[0].data(); await window.sendFriendRequest(targetUser.uid, targetUser.name + " " + targetUser.surname); }
        btn.innerText = origText; btn.disabled = false; searchInput.value = '';
    } catch (error) { console.error(error); alert("Arama hatası: " + error.message); }
};

window.sendFriendRequest = async function (targetUserId, targetUserName) {
    try {
        const myUid = auth.currentUser.uid;
        const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
        const snap = await getDocs(q);
        let existingChat = null;
        snap.forEach(d => { if (d.data().participants && d.data().participants.includes(targetUserId)) existingChat = { id: d.id, ...d.data() }; });
        if (!existingChat) {
            await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(), status: 'pending', initiator: myUid,
                messages: [{ senderId: "system", text: "Arkadaşlık isteği gönderildi.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false }]
            });
            alert("Arkadaşlık isteği gönderildi!");
            window.loadPage('messages');
        } else {
            if (existingChat.status === 'pending') alert("Bu kişiyle zaten bekleyen bir istek var.");
            else { alert("Bu kişiyle zaten arkadaşsınız."); window.loadPage('messages'); setTimeout(() => window.openChatView(existingChat.id), 500); }
        }
    } catch (error) { alert("İstek gönderilirken hata: " + error.message); }
};

function getHomeContent() {
    let usernameWarning = '';
    if (!window.userProfile.username) {
        usernameWarning = `<div style="background: #FEF2F2; color: #DC2626; padding: 15px; border-radius: 12px; border: 1px solid #FCA5A5; margin-bottom: 20px; font-weight: bold; text-align: center; cursor:pointer;" onclick="window.loadPage('profile')">⚠️ Lütfen profilinden bir kullanıcı adı belirle! (Tıkla ve Belirle)</div>`;
    }
    let aiRadarContent = '';
    const isPremium = window.userProfile.isPremium;
    const userFac = window.userProfile.faculty || "Kampüs";
    if (isPremium) {
        aiRadarContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;"><h2 style="margin:0;">🌟 Gelişmiş AI Kampüs Radarı</h2><span style="font-size:12px; background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:8px; font-weight:bold;">Premium Aktif</span></div>
            <div class="match-grid">
                <div class="match-card premium-match-card"><div class="avatar">👨‍💻</div><h4>John D.</h4><p style="color:#D97706; font-size:12px; font-weight:bold;">🟢 Şu an aktif</p><p>${userFac}</p><button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Super DM At 🚀</button></div>
                <div class="match-card premium-match-card"><div class="avatar">👩‍⚕️</div><h4>Sarah B.</h4><p style="color:#D97706; font-size:12px; font-weight:bold;">🎧 Ortak İlgi: Müzik</p><p>${userFac}</p><button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Super DM At 🚀</button></div>
                <div class="match-card premium-match-card"><div class="avatar">🎮</div><h4>Ali K.</h4><p style="color:#D97706; font-size:12px; font-weight:bold;">🔍 Dün profilini gezdi</p><p>Mimarlık</p><button class="action-btn" onclick="window.goToMessages()" style="margin-top:10px; background:#FEF3C7; color:#D97706;">Geri Dönüş Yap</button></div>
            </div>`;
    } else {
        aiRadarContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;"><h2 style="margin:0; color:#DC2626;">🔥 Kampüs Tespitleri</h2></div>
            <div style="background: linear-gradient(135deg, #FEF2F2, #FEF3C7); color: #92400E; padding: 16px; border-radius: 12px; margin-bottom: 15px; font-size: 14px; border: 1px solid #FCD34D; line-height: 1.6; font-weight: 800;">🚨 <strong>${userFac}</strong> ağında hareketlilik var!<br>🔥 Gizli hayranlarını bul ve kampüsün en popülerleriyle eşleş! 👇</div>
            <div class="match-grid">
                <div class="match-card locked-container"><div class="locked-overlay" onclick="window.openPremiumModal()"><span style="font-size:28px;">🔒</span><span style="font-size:13px; font-weight:bold;">Kim Olduğunu Görmek İçin Tıkla</span></div><div class="locked-blur"><div class="avatar">👨‍🎓</div><h4>A*** K***</h4><p>${userFac}</p><button class="action-btn">Mesaj At</button></div></div>
                <div class="match-card locked-container"><div class="locked-overlay" onclick="window.openPremiumModal()"><span style="font-size:28px;">🔒</span><span style="font-size:13px; font-weight:bold;">Kilidi Aç & Bağlan!</span></div><div class="locked-blur"><div class="avatar">👩‍🎓</div><h4>B*** Y***</h4><p>${userFac}</p><button class="action-btn">Mesaj At</button></div></div>
                <div class="match-card locked-container"><div class="locked-overlay" onclick="window.openPremiumModal()"><span style="font-size:28px;">🔒</span><span style="font-size:13px; font-weight:bold;">Seni İnceleyen Kişi</span></div><div class="locked-blur"><div class="avatar">👀</div><h4>M*** E***</h4><p>${userFac}</p><button class="action-btn">Mesaj At</button></div></div>
            </div>
            <div style="text-align:center; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);"><button class="premium-upgrade-btn premium-glow" onclick="window.openPremiumModal()">🌟 Kilitleri Açmak İçin Premium'a Geç</button></div>`;
    }
    return `
        ${usernameWarning}
        <div class="card" style="background: linear-gradient(135deg, #1E3A8A, #4F46E5); color: white; border:none;">
            <h2 style="font-size:24px; margin-bottom:8px;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
            <p style="opacity:0.9; font-size:15px;"><strong style="color:#D9FDD3;">${window.userProfile.university}</strong> ağındasın.</p>
        </div>
        <div class="card" style="padding: 12px 20px; display:flex; align-items:center; gap:12px; margin-bottom: 24px; border-radius: 16px;">
            <div style="font-size:18px;">🔍</div>
            <div style="display:flex; flex:1; align-items:center; background:#F3F4F6; border-radius:12px; padding:0 12px; border:1px solid transparent;">
                <span style="color:var(--primary); font-weight:800; font-size:16px;">#</span>
                <input type="text" id="friend-search-input" style="border:none; background:transparent; width:100%; padding:10px 8px; outline:none; font-size:15px; font-weight:600;" placeholder="arkadasini_bul" onkeypress="if(event.key==='Enter') window.searchAndAddFriend()">
            </div>
            <button class="btn-primary" id="friend-search-btn" style="width:auto; padding:10px 18px; border-radius:12px;" onclick="window.searchAndAddFriend()">Ekle</button>
        </div>
        <div class="card">${aiRadarContent}</div>`;
}

// ============================================================================
// 5. LIGHTBOX
// ============================================================================
window.currentLightboxImages = [];
window.currentLightboxIndex = 0;

window.openLightbox = function (imagesJsonStr, index) {
    window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr));
    window.currentLightboxIndex = index;
    window.updateLightboxView();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
};
window.closeLightbox = function () {
    document.getElementById('lightbox').classList.remove('active');
    if (!document.getElementById('app-modal').classList.contains('active')) document.body.style.overflow = 'auto';
};
window.changeLightboxImage = function (step) {
    window.currentLightboxIndex += step;
    if (window.currentLightboxIndex < 0) window.currentLightboxIndex = window.currentLightboxImages.length - 1;
    if (window.currentLightboxIndex >= window.currentLightboxImages.length) window.currentLightboxIndex = 0;
    window.updateLightboxView();
};
window.updateLightboxView = function () {
    const imgEl = document.getElementById('lightbox-img');
    const counterEl = document.getElementById('lightbox-counter');
    if (imgEl && counterEl) { imgEl.src = window.currentLightboxImages[window.currentLightboxIndex]; counterEl.innerText = (window.currentLightboxIndex + 1) + " / " + window.currentLightboxImages.length; }
};

let touchstartX = 0, touchendX = 0;
const lb = document.getElementById('lightbox');
if (lb) {
    lb.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; });
    lb.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; if (touchendX < touchstartX - 40) window.changeLightboxImage(1); if (touchendX > touchstartX + 40) window.changeLightboxImage(-1); });
}

// ============================================================================
// 6. MARKET
// ============================================================================
window.renderListings = function (type, title, buttonTextType) {
    mainContent.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;">
                <h2 style="margin:0;">${title}</h2>
                <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openListingForm('${type}')">+ Yeni İlan Ekle</button>
            </div>
            <input type="text" id="local-search-input" class="local-search-bar" placeholder="${title} içinde hızlıca ara...">
            <div class="market-grid" id="listings-grid-container"></div>
        </div>`;
    window.drawListingsGrid(type, buttonTextType, '');
    const searchInput = document.getElementById('local-search-input');
    if (searchInput) searchInput.addEventListener('input', (e) => window.drawListingsGrid(type, buttonTextType, e.target.value.toLowerCase()));
};

window.drawListingsGrid = function (type, buttonTextType, filterText) {
    const container = document.getElementById('listings-grid-container');
    if (!container) return;
    const filteredData = marketDB.filter(item => item.type === type && (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText)));
    if (filteredData.length === 0) { container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok.</p>`; return; }
    let gridHtml = '';
    filteredData.forEach(item => {
        const displayCurrency = item.currency || '₺';
        let imgHtml = item.imgUrl ? `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">` : `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`;
        gridHtml += `<div class="item-card" onclick="window.openListingDetail('${item.id}', '${buttonTextType}')"><div class="item-img-large">${imgHtml}</div><div class="item-details"><div class="item-title">${item.title}</div><div class="item-price-large">${item.price} ${displayCurrency}</div></div></div>`;
    });
    container.innerHTML = gridHtml;
};

window.openListingDetail = function (docId, type) {
    const item = marketDB.find(i => i.id === docId);
    if (!item) return;
    let imgHtml = '', indicatorsHtml = '';
    const displayCurrency = item.currency || '₺';
    if (item.imgUrls && item.imgUrls.length > 0) {
        imgHtml += '<div class="image-gallery" style="height:250px; border-radius:12px; margin-bottom:16px;">';
        const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
        item.imgUrls.forEach((url, i) => { imgHtml += `<div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;"><img src="${url}" alt="İlan" style="border-radius:12px;"></div>`; indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`; });
        imgHtml += '</div>';
        if (item.imgUrls.length > 1) imgHtml += `<div class="gallery-indicators" style="bottom: 25px;">${indicatorsHtml}</div>`;
    } else if (item.imgUrl) {
        const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
        imgHtml = `<img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">`;
    }
    let actionButtonsHtml = '';
    const currentUid = window.userProfile.uid || (auth.currentUser ? auth.currentUser.uid : null);
    const safeTitle = item.title.replace(/'/g, "\\'");
    if (item.sellerId === currentUid) {
        actionButtonsHtml = `<div style="display:flex; gap:10px; margin-top: 20px;"><button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button><button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button></div>`;
    } else {
        const btnText = type === 'market' ? 'Satıcıya Yaz' : 'İletişime Geç';
        actionButtonsHtml = `<button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px;" onclick="window.startMarketChat('${item.sellerId}', '${item.sellerName}', 'Merhaba, \\'${safeTitle}\\' ilanınızla ilgileniyorum.'); window.closeModal();">💬 ${btnText}</button>`;
    }
    window.openModal(item.title, `
        <div style="position:relative;">${imgHtml}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:24px; font-weight:800; color:#059669;">${item.price} ${displayCurrency}</div>
            <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div>
        </div>
        <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:16px; border-radius:12px; border:1px solid var(--border-color);">${item.desc}</div>
        ${actionButtonsHtml}`);
};

window.deleteListing = async function (docId) {
    if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
        try { await deleteDoc(doc(db, "listings", docId)); alert("İlan silindi!"); }
        catch (e) { alert("Silinirken hata: " + e.message); }
    }
};

window.editListing = async function (docId, oldTitle, oldPrice) {
    let newPrice = prompt(`"${oldTitle}" için yeni fiyat:`, oldPrice);
    if (newPrice !== null && newPrice.trim() !== "") {
        try { await updateDoc(doc(db, "listings", docId), { price: newPrice.trim() }); alert("Fiyat güncellendi!"); }
        catch (e) { alert("Hata: " + e.message); }
    }
};

window.openListingForm = function (type) {
    const formTitle = type === 'market' ? '🛒 Kampüs Market İlanı Ekle' : '🔑 Ev Arkadaşı & Yurt İlanı Ekle';
    window.openModal(formTitle, `
        <div class="form-group"><input type="text" id="new-item-title" placeholder="İlan Başlığı"></div>
        <div class="form-group" style="display: flex; gap: 10px;">
            <input type="number" id="new-item-price" placeholder="Fiyat" style="flex: 2;">
            <select id="new-item-currency" style="flex: 1;"><option value="₺">TL (₺)</option><option value="$">Dolar ($)</option><option value="€">Euro (€)</option><option value="£">Sterlin (£)</option></select>
        </div>
        <div class="form-group"><textarea id="new-item-desc" rows="3" placeholder="Açıklama"></textarea></div>
        <div class="upload-btn-wrapper">
            <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf Seç (Max 3)</button>
            <input type="file" id="new-item-photo" accept="image/*" multiple style="display:none;" />
        </div>
        <div id="preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
        <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Fotoğraflar Yükleniyor...</p>`);
    setTimeout(() => {
        const photoBtn = document.getElementById('photo-trigger-btn');
        const photoInput = document.getElementById('new-item-photo');
        if (photoBtn && photoInput) {
            photoBtn.addEventListener('click', () => photoInput.click());
            photoInput.addEventListener('change', function (e) {
                const files = Array.from(e.target.files).slice(0, 3);
                const previewContainer = document.getElementById('preview-container');
                previewContainer.innerHTML = '';
                files.forEach(file => { const reader = new FileReader(); reader.onload = function (event) { previewContainer.innerHTML += `<div class="preview-box"><img src="${event.target.result}"></div>`; }; reader.readAsDataURL(file); });
            });
        }
    }, 100);
};

window.submitListing = async function (type) {
    const titleEl = document.getElementById('new-item-title');
    const priceEl = document.getElementById('new-item-price');
    const currencyEl = document.getElementById('new-item-currency');
    const descEl = document.getElementById('new-item-desc');
    const photoInput = document.getElementById('new-item-photo');
    const statusEl = document.getElementById('upload-status');
    const btn = document.getElementById('publish-listing-btn');
    if (!titleEl || !priceEl || !descEl || !currencyEl) return;
    const title = titleEl.value.trim(), price = priceEl.value.trim(), currency = currencyEl.value, desc = descEl.value.trim();
    if (!title || !price || !desc) { alert("Lütfen tüm alanları doldurun."); return; }
    let files = photoInput && photoInput.files && photoInput.files.length > 0 ? Array.from(photoInput.files).slice(0, 3) : [];
    if (files.length === 0) { alert("Lütfen en az 1 fotoğraf seçin."); return; }
    btn.disabled = true; statusEl.style.display = 'block';
    let imgUrlsArray = [];
    try {
        for (let file of files) {
            const fileName = Date.now() + '_' + file.name.replace(/\s/g, '');
            const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/' + fileName);
            await uploadBytes(storageRef, file);
            imgUrlsArray.push(await getDownloadURL(storageRef));
        }
        await addDoc(collection(db, "listings"), { type, title, price, currency, desc, imgUrls: imgUrlsArray, imgUrl: imgUrlsArray[0] || "", sellerId: window.userProfile.uid, sellerName: window.userProfile.name + " " + window.userProfile.surname, createdAt: serverTimestamp() });
        window.closeModal(); alert("İlanınız yayınlandı!");
    } catch (error) { statusEl.innerText = "HATA: " + error.message; statusEl.style.color = "red"; alert("Hata: " + error.message); }
    finally { statusEl.style.display = 'none'; btn.disabled = false; }
};

// ============================================================================
// 7. MESAJLAŞMA VE BİLDİRİMLER
// ============================================================================
window.startMarketChat = async function (targetUserId, targetUserName, autoText) {
    try {
        const myUid = auth.currentUser.uid;
        const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
        const snap = await getDocs(q);
        let existingChatId = null;
        snap.forEach(d => { const p = d.data().participants || []; if (p.includes(targetUserId)) existingChatId = d.id; });
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!existingChatId) {
            const newDocRef = await addDoc(collection(db, "chats"), { participants: [myUid, targetUserId], participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName }, participantAvatars: { [myUid]: window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" }, lastUpdated: serverTimestamp(), status: 'accepted', messages: [{ senderId: myUid, text: autoText, time: timeStr, read: false }] });
            existingChatId = newDocRef.id;
        } else {
            await updateDoc(doc(db, "chats", existingChatId), { status: 'accepted', messages: arrayUnion({ senderId: myUid, text: autoText, time: timeStr, read: false }), lastUpdated: serverTimestamp() });
        }
        window.loadPage('messages');
        setTimeout(() => window.openChatView(existingChatId), 500);
    } catch (error) { alert("Mesaj başlatılırken hata: " + error.message); }
};

window.renderNotifications = function () {
    const incomingRequests = chatsDB.filter(c => c.status === 'pending' && c.initiator !== window.userProfile.uid);
    let html = `<div class="card"><h2 style="margin-bottom: 20px;">🔔 Bildirimler</h2>`;
    if (incomingRequests.length === 0) html += `<p style="text-align:center; color:var(--text-gray); padding: 40px 0;">Bekleyen bildirim yok.</p>`;
    else {
        html += `<div style="display:flex; flex-direction:column; gap:15px;">`;
        incomingRequests.forEach(req => {
            html += `<div style="display:flex; justify-content:space-between; align-items:center; background:#F9FAFB; padding:15px 20px; border-radius:12px; border:1px solid var(--border-color); flex-wrap:wrap; gap:15px;"><div style="display:flex; align-items:center; gap:15px;"><div class="avatar" style="margin:0; width:50px; height:50px; font-size:24px;">${req.avatar}</div><div><strong style="display:block; font-size:16px;">${req.name}</strong><span style="font-size:13px; color:var(--text-gray);">Sizi arkadaş olarak eklemek istiyor.</span></div></div><div style="display:flex; gap:10px;"><button class="btn-primary" style="padding:10px 20px; width:auto; font-size:14px;" onclick="window.acceptRequest('${req.id}')">✅ Kabul Et</button><button class="btn-danger" style="padding:10px 20px; width:auto; font-size:14px;" onclick="window.rejectRequest('${req.id}')">❌ Reddet</button></div></div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;
    mainContent.innerHTML = html;
};

window.acceptRequest = async function (chatId) {
    try {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await updateDoc(doc(db, "chats", chatId), { status: 'accepted', messages: arrayUnion({ senderId: "system", text: "Arkadaşlık isteği kabul edildi! 🎉", time: timeStr, read: false }), lastUpdated: serverTimestamp() });
        alert("İstek kabul edildi!"); window.renderNotifications();
    } catch (error) { alert("Hata: " + error.message); }
};

window.rejectRequest = async function (chatId) {
    if (confirm("Bu isteği reddetmek istediğinize emin misiniz?")) {
        try { await deleteDoc(doc(db, "chats", chatId)); alert("İstek silindi."); window.renderNotifications(); }
        catch (error) { alert("Hata: " + error.message); }
    }
};

window.renderMessagesSidebarOnly = function () {
    const sidebar = document.querySelector('.chat-sidebar');
    if (!sidebar) return;
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
    let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10;">Mesajlarım</div>`;
    if (visibleChats.length === 0) html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Aktif mesajınız bulunmuyor.</p>`;
    visibleChats.forEach(chat => {
        const lastMsgObj = chat.messages[chat.messages.length - 1];
        let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
        const isActive = chat.id === currentChatId ? 'active' : '';
        if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) rawLastMsg = "⏳ İstek bekleniyor...";
        const previewMsg = rawLastMsg.replace(/<br>/g, ' ').substring(0, 35) + (rawLastMsg.length > 35 ? "..." : "");
        html += `<div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')"><div class="avatar">${chat.avatar}</div><div class="chat-contact-info"><div class="chat-contact-top"><span class="chat-contact-name">${chat.name}</span><span class="chat-contact-time">${lastMsgObj ? lastMsgObj.time : ""}</span></div><div class="chat-contact-last">${previewMsg}</div></div></div>`;
    });
    sidebar.innerHTML = html;
};

window.updateChatMessagesOnly = function (chatId) {
    const activeChat = chatsDB.find(c => c.id === chatId);
    if (!activeChat) return;
    const scrollBox = document.getElementById('chat-messages-scroll');
    if (!scrollBox) return;
    let chatHTML = '';
    activeChat.messages.forEach(msg => {
        const type = msg.senderId === window.userProfile.uid ? 'sent' : 'received';
        let ticks = '';
        if (type === 'sent') ticks = msg.read ? '<span class="ticks" style="color:#3B82F6; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>' : '<span class="ticks" style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>';
        chatHTML += `<div class="bubble ${type}"><div class="msg-text">${msg.text}</div><div class="msg-time" style="display:flex; align-items:center; justify-content:flex-end;">${msg.time} ${ticks}</div></div>`;
    });
    scrollBox.innerHTML = chatHTML;
    scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.renderMessages = function () {
    mainContent.innerHTML = `
        <div class="card" style="padding:0; border:none; background:transparent;">
            <div class="chat-layout" id="chat-layout-container">
                <div class="chat-sidebar" id="sidebar-container"></div>
                <div class="chat-main" id="chat-main-view">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-gray); opacity:0.7;">
                        <div style="font-size:48px; margin-bottom:10px;">💬</div>
                        <div>Sol taraftan bir kişi seçin.</div>
                    </div>
                </div>
            </div>
        </div>`;
    window.renderMessagesSidebarOnly();
    const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
    if (currentChatId && visibleChats.find(c => c.id === currentChatId)) window.openChatView(currentChatId);
};

window.openChatView = function (chatId) {
    currentChatId = chatId;
    const activeChat = chatsDB.find(c => c.id === chatId);
    if (!activeChat) return;
    let hasUnread = false;
    const updatedMessages = activeChat.messages.map(msg => { if (msg.senderId !== window.userProfile.uid && msg.read === false) { hasUnread = true; return { ...msg, read: true }; } return msg; });
    if (hasUnread) { updateDoc(doc(db, "chats", chatId), { messages: updatedMessages }); activeChat.messages = updatedMessages; }
    window.renderMessagesSidebarOnly();
    const container = document.getElementById('chat-main-view');
    document.getElementById('chat-layout-container').classList.add('chat-active');
    let chatHTML = `
        <div class="chat-header">
            <button class="back-btn" onclick="document.getElementById('chat-layout-container').classList.remove('chat-active'); window.resetCurrentChatId();">←</button>
            <div class="avatar" style="width:42px; height:42px; font-size:20px; margin:0;">${activeChat.avatar}</div>
            <div class="chat-header-info"><div class="chat-header-name">${activeChat.name}</div><div class="chat-header-status">UniLoop Ağı</div></div>
        </div>
        <div class="chat-messages" id="chat-messages-scroll"></div>`;
    if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
        chatHTML += `<div style="padding: 20px; text-align: center; color: var(--text-gray); background: #F9FAFB; border-top: 1px solid var(--border-color); font-weight:bold;">⏳ Arkadaşlık isteğinin kabul edilmesi bekleniyor...</div>`;
    } else {
        chatHTML += `<div class="chat-input-area"><div class="chat-input-wrapper"><input type="text" id="chat-input-field" placeholder="Bir mesaj yazın..."></div><button class="chat-send-btn" onclick="window.sendMsg('${chatId}')">➤</button></div>`;
    }
    container.innerHTML = chatHTML;
    window.updateChatMessagesOnly(chatId);
    const inputField = document.getElementById('chat-input-field');
    if (inputField) { inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.sendMsg(chatId); }); if (window.innerWidth > 1024) inputField.focus(); }
};

window.sendMsg = async function (chatId) {
    const input = document.getElementById('chat-input-field');
    if (input && input.value.trim() !== '') {
        try {
            const text = input.value.trim(); input.value = '';
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await updateDoc(doc(db, "chats", chatId), { messages: arrayUnion({ senderId: window.userProfile.uid, text, time: timeStr, read: false }), lastUpdated: serverTimestamp() });
        } catch (error) { console.error("Mesaj gönderilemedi:", error); }
    }
};

// ============================================================================
// 8. KAMPÜS AKIŞI (FEED)
// ============================================================================
window.renderConfessions = function () {
    mainContent.innerHTML = `
        <div class="feed-layout-container">
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 20px; border-bottom: 1px solid var(--border-color);">
                <h2 style="margin:0; font-size: 20px; font-weight: 800;">📸 Kampüs Akışı</h2>
                <button class="btn-primary" style="width:auto; padding: 8px 16px; border-radius: 20px; font-size: 14px;" onclick="window.openConfessionForm()">+ Gönderi Oluştur</button>
            </div>
            <div class="confessions-feed" id="conf-feed"></div>
        </div>`;
    if (confessionsDB) window.drawConfessionsFeed();
};

window.openConfessionForm = function () {
    window.openModal('Yeni Gönderi Oluştur', `
        <div class="form-group">
            <label style="font-weight:bold; margin-bottom:8px; display:block;">Kimliğinizi Seçin</label>
            <select id="new-conf-identity" style="width:100%; padding:12px; border-radius:12px; border:1px solid #d1d5db; outline:none; font-size:15px;">
                <option value="anon">🤫 Tamamen Anonim</option>
                <option value="real">👤 İsmimle Paylaş (${window.userProfile.username || window.userProfile.name})</option>
            </select>
        </div>
        <textarea id="new-conf-text" class="form-group" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:16px; margin-top:10px; resize:none; outline:none; border: 1px solid #E5E7EB;" placeholder="Ne düşünüyorsun?"></textarea>
        <div class="upload-btn-wrapper" style="margin-bottom: 15px;">
            <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center;">📷 Fotoğraf Ekle</button>
            <input type="file" id="new-conf-photo" accept="image/*" style="display:none;" />
        </div>
        <div id="conf-preview-container" class="preview-container"></div>
        <button class="btn-primary" id="publish-conf-btn" onclick="window.submitConfession()">Gönderiyi Yayınla</button>
        <p id="conf-upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">Yükleniyor...</p>`);
    setTimeout(() => {
        const photoBtn = document.getElementById('conf-photo-trigger-btn');
        const photoInput = document.getElementById('new-conf-photo');
        if (photoBtn && photoInput) {
            photoBtn.addEventListener('click', () => photoInput.click());
            photoInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) { const reader = new FileReader(); reader.onload = function (event) { document.getElementById('conf-preview-container').innerHTML = `<div class="preview-box" style="width:100%; height:auto; padding:0; border:none; margin-bottom:15px;"><img src="${event.target.result}" style="width:100%; max-height:200px; object-fit:contain; border-radius:12px;"></div>`; }; reader.readAsDataURL(file); }
            });
        }
    }, 100);
};

window.submitConfession = async function () {
    const textEl = document.getElementById('new-conf-text');
    const identityEl = document.getElementById('new-conf-identity');
    const photoInput = document.getElementById('new-conf-photo');
    const btn = document.getElementById('publish-conf-btn');
    const statusEl = document.getElementById('conf-upload-status');
    if (!textEl || textEl.value.trim() === '') { alert("Lütfen bir şeyler yazın."); return; }
    btn.disabled = true;
    let imgUrl = "";
    if (photoInput && photoInput.files && photoInput.files.length > 0) {
        statusEl.style.display = 'block';
        try {
            const file = photoInput.files[0];
            const fileName = Date.now() + '_' + file.name.replace(/\s/g, '');
            const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/feed_' + fileName);
            await uploadBytes(storageRef, file);
            imgUrl = await getDownloadURL(storageRef);
        } catch (err) { alert("Fotoğraf yüklenemedi: " + err.message); btn.disabled = false; statusEl.style.display = 'none'; return; }
    }
    const isAnon = identityEl.value === 'anon';
    const authorName = isAnon ? "Anonim Kullanıcı" : (window.userProfile.username || window.userProfile.name);
    const authorAvatar = isAnon ? ["👻", "👽", "🤖", "🦊", "🎭"][Math.floor(Math.random() * 5)] : window.userProfile.avatar;
    try {
        await addDoc(collection(db, "confessions"), { authorId: window.userProfile.uid, avatar: authorAvatar, user: authorName, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: textEl.value.trim(), imgUrl, comments: [], createdAt: serverTimestamp() });
        window.closeModal();
    } catch (e) { alert("Hata: " + e.message); btn.disabled = false; }
};

window.deleteConfession = async function (docId) {
    if (confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
        try { await deleteDoc(doc(db, "confessions", docId)); }
        catch (e) { alert("Hata: " + e.message); }
    }
};

window.drawConfessionsFeed = function () {
    const feed = document.getElementById('conf-feed');
    if (!feed) return;
    if (confessionsDB.length === 0) { feed.innerHTML = `<div style="text-align:center; color:var(--text-gray); padding: 40px 20px;"><div style="font-size:40px; margin-bottom: 10px;">📸</div>İlk gönderiyi sen paylaş!</div>`; return; }
    let html = '<div style="display:flex; flex-direction:column; gap:0;">';
    confessionsDB.forEach((post) => {
        let imgHtml = '';
        if (post.imgUrl) imgHtml = `<img src="${post.imgUrl}" class="feed-post-img" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`;
        const commentCount = post.comments ? post.comments.length : 0;
        let deleteBtnHtml = post.authorId === window.userProfile.uid ? `<button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">🗑️ Sil</button>` : '';
        let premiumHintHtml = (post.user === "Anonim Kullanıcı" && window.userProfile.isPremium) ? `<div style="font-size:11px; color:#D97706; font-weight:bold; margin-top:4px;">🌟 Premium İpucu: Bu kişi Bilgisayar Müh. bölümünden.</div>` : '';
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
                <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">💬 Yorum Yap (${commentCount})</button>
                ${deleteBtnHtml}
            </div>
        </div>`;
    });
    html += '</div>';
    feed.innerHTML = html;
};

window.openConfessionDetail = function (docId) {
    window.openModal('Gönderi', `<div id="confession-detail-container">Yükleniyor...</div>`);
    window.updateConfessionDetailLive(docId);
    const container = document.getElementById('confession-detail-container');
    if (container) container.insertAdjacentHTML('afterend', `<input type="hidden" id="active-post-id" value="${docId}">`);
};

window.updateConfessionDetailLive = function (docId) {
    const container = document.getElementById('confession-detail-container');
    if (!container) return;
    const post = confessionsDB.find(p => p.id === docId);
    if (!post) { container.innerHTML = "Gönderi bulunamadı."; return; }
    let imgHtml = post.imgUrl ? `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:16px; max-height:300px; object-fit:contain; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">` : '';
    const commentsArray = post.comments || [];
    let commentsHtml = commentsArray.length === 0 ? '<p style="text-align:center; padding:15px; color:var(--text-gray); font-size:14px;">İlk yorumu sen yap!</p>' : commentsArray.map(c => `<div style="padding:14px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border-color);"><div style="font-weight:800; color:var(--text-dark); margin-bottom:6px; font-size:14px;">${c.user}</div><div style="font-size:14px; color:var(--text-dark); line-height:1.4;">${c.text}</div></div>`).join('');
    container.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <div class="feed-post-avatar" style="width:48px; height:48px; font-size:28px;">${post.avatar}</div>
                <div><div style="font-weight:bold; font-size:16px;">${post.user}</div><div style="font-size:12px; color:var(--text-gray);">${post.time}</div></div>
            </div>
            <div style="font-size:16px; margin-bottom:16px; line-height:1.6;">${post.text.replace(/\n/g, '<br>')}</div>
            ${imgHtml}
        </div>
        <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-bottom:16px;">
            <h4 style="margin-bottom:12px; font-size:15px;">Yorumlar (${commentsArray.length})</h4>
            <div class="answers-container" style="max-height: 250px; overflow-y: auto; padding-right:5px;" id="conf-comments-scroll">${commentsHtml}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center; padding:10px; border-radius:12px; border:1px solid var(--border-color);">
            <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:15px;" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')">
            <button class="btn-primary" style="width:auto; padding:8px 16px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button>
        </div>`;
    const scrollBox = document.getElementById('conf-comments-scroll');
    if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
};

window.submitConfessionComment = async function (docId) {
    const input = document.getElementById('new-conf-comment');
    if (input && input.value.trim() !== '') {
        try { await updateDoc(doc(db, "confessions", docId), { comments: arrayUnion({ user: window.userProfile.username || window.userProfile.name, text: input.value.trim() }) }); }
        catch (e) { alert("Yorum gönderilemedi: " + e.message); }
    }
};

// ============================================================================
// 9. SORU VE CEVAP
// ============================================================================
window.renderQA = function () {
    mainContent.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:10px;">
                <h2 style="margin:0;">❓ Kampüs Soru & Cevap</h2>
                <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openQAForm()">+ Soru Sor</button>
            </div>
            <div class="qa-filters">
                <button class="qa-filter-btn active" data-filter="Genel" onclick="window.filterQA(this, 'Genel')">Genel</button>
                <button class="qa-filter-btn" data-filter="Yurtlar" onclick="window.filterQA(this, 'Yurtlar')">Yurtlar</button>
                <button class="qa-filter-btn" data-filter="Ders" onclick="window.filterQA(this, 'Ders')">Ders</button>
                <button class="qa-filter-btn" data-filter="Kampüs Yaşamı" onclick="window.filterQA(this, 'Kampüs Yaşamı')">Kampüs Yaşamı</button>
            </div>
            <div id="qa-feed"></div>
        </div>`;
    window.drawQAGrid('Genel');
};

window.filterQA = function (btn, filterName) {
    document.querySelectorAll('.qa-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); window.drawQAGrid(filterName);
};

window.openQAForm = function () {
    window.openModal('Yeni Soru Sor', `
        <div class="form-group"><label>Kategori Seç</label><select id="new-qa-tag"><option>Genel</option><option>Yurtlar</option><option>Ders</option><option>Kampüs Yaşamı</option></select></div>
        <textarea id="new-qa-text" class="form-group" style="width:100%; height:120px; border-radius:12px; padding:15px; font-size:15px;" placeholder="Sorunuzu detaylı yazın..."></textarea>
        <button class="btn-primary" id="publish-qa-btn" onclick="window.submitQA()">Soruyu Yayınla</button>`);
};

window.submitQA = async function () {
    const textEl = document.getElementById('new-qa-text');
    const tagEl = document.getElementById('new-qa-tag');
    const btn = document.getElementById('publish-qa-btn');
    if (!textEl || textEl.value.trim() === '') return;
    btn.disabled = true;
    try {
        await addDoc(collection(db, "qa"), { avatar: window.userProfile.avatar, user: window.userProfile.name, time: "Şimdi", tag: tagEl.value, question: textEl.value, answers: [], createdAt: serverTimestamp() });
        window.closeModal();
    } catch (e) { alert("Hata: " + e.message); btn.disabled = false; }
};

window.drawQAGrid = function (filterTag = 'Genel') {
    const feed = document.getElementById('qa-feed');
    if (!feed) return;
    const filteredDB = filterTag === 'Genel' ? qaDB : qaDB.filter(q => q.tag === filterTag);
    if (filteredDB.length === 0) { feed.innerHTML = `<p style="text-align:center; padding: 30px 0; color:var(--text-gray);">Bu kategoride henüz soru yok.</p>`; return; }
    feed.innerHTML = filteredDB.map(q => `
        <div class="qa-card" onclick="window.openQADetail('${q.id}')">
            <div class="qa-left-stats"><div class="qa-stat-box ${q.answers.length > 0 ? 'answered' : ''}"><div style="font-size:18px;">${q.answers.length}</div><div style="font-weight:500;">Cevap</div></div></div>
            <div class="qa-right-content"><div class="qa-title">${q.question}</div><div class="qa-meta"><span class="qa-tag">${q.tag}</span><span>Soran: <strong>${q.user}</strong></span></div></div>
        </div>`).join('');
};

window.openQADetail = function (docId) {
    const q = qaDB.find(item => item.id === docId);
    if (!q) return;
    const answersHtml = q.answers.length === 0
        ? '<p style="text-align:center; padding:20px; color:var(--text-gray);">İlk cevap veren sen ol!</p>'
        : q.answers.map(ans => `<div style="background:inherit; padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border-color);"><div style="font-weight:bold; color:var(--primary); margin-bottom:6px;">${ans.user}</div><div style="font-size:15px;">${ans.text}</div></div>`).join('');
    window.openModal('Soru Detayı', `
        <div style="margin-bottom: 24px;"><span class="qa-tag" style="font-size:12px;">${q.tag}</span><div style="font-size:18px; font-weight:800; margin-top:12px;">${q.question}</div></div>
        <div style="border-top:1px solid var(--border-color); padding-top:24px; margin-bottom:24px;"><h4>Cevaplar (${q.answers.length})</h4><div class="answers-container">${answersHtml}</div></div>
        <div style="display:flex; gap:10px;"><input type="text" id="new-answer-input" class="form-group" style="flex:1; margin:0;" placeholder="Cevabını yaz..."><button class="btn-primary" style="width:auto;" onclick="window.submitAnswer('${q.id}')">Gönder</button></div>`);
};

window.submitAnswer = async function (docId) {
    const ansInput = document.getElementById('new-answer-input');
    if (ansInput && ansInput.value.trim() !== '') {
        try { await updateDoc(doc(db, "qa", docId), { answers: arrayUnion({ user: window.userProfile.name, text: ansInput.value.trim() }) }); window.closeModal(); }
        catch (e) { console.error(e); }
    }
};

// ============================================================================
// 10. 🌐 AĞLARIM — FAKÜLTELEr (FORUM YAPISI) & KULÜPLER (MEETING YAPISI)
// ============================================================================

// -------------------------------------------------------
// FAKÜLTE — Forum Usulü
// -------------------------------------------------------
window.handleFacultyClick = async function (name, icon, bgColor) {
    const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;
    if (isJoined) {
        window.loadFacultyForumPage(name, icon, bgColor);
    } else {
        mainContent.innerHTML = `
            <div class="join-faculty-box">
                <div class="icon">${icon}</div>
                <h2>${name} Ağına Hoş Geldin</h2>
                <p>Bu alan kapalı bir fakülte ağıdır. Giriş kodunu girerek foruma katılabilirsin.</p>
                <div style="max-width: 300px; margin: 0 auto 20px auto;">
                    <input type="text" id="faculty-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Fakülte Kodunu Girin">
                </div>
                <button class="btn-primary" style="max-width:250px; font-size:16px; padding:12px;" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">Foruma Katıl</button>
            </div>`;
        window.scrollTo(0, 0);
    }
};

window.verifyFacultyCode = async function (name, icon, bgColor) {
    const inputCode = document.getElementById('faculty-passcode-input').value.trim();
    if (FACULTY_PASSCODES[name] && inputCode.toLowerCase() === FACULTY_PASSCODES[name].toLowerCase()) {
        window.userProfile.faculty = name;
        window.joinedFaculties = [{ name, icon, color: bgColor }];
        await updateDoc(doc(db, "users", window.userProfile.uid), { faculty: name });
        window.loadFacultyForumPage(name, icon, bgColor);
    } else { alert("Hatalı kod! Lütfen tekrar deneyin."); }
};

// 🏛️ FAKÜLTE FORUM SAYFASI — Gerçek Forum Arayüzü
window.loadFacultyForumPage = async function (name, icon, bgColor) {
    let totalMembers = 1, onlineMembers = 1;
    try {
        const q = query(collection(db, "users"), where("faculty", "==", name));
        const snap = await getDocs(q);
        totalMembers = Math.max(snap.size, 1);
        snap.forEach(d => { if (d.data().isOnline) onlineMembers++; });
        onlineMembers = Math.max(onlineMembers - 1, 1);
    } catch (e) { console.error(e); }

    // Demo forum gönderileri
    const demoPosts = [
        { avatar: "🩺", author: "Mehmet A.", time: "09:15", text: "Anatomi sınavı için en iyi kaynak ne? Gray's Anatomy mı yoksa Netter mi tercih edersiniz?" },
        { avatar: "👩‍⚕️", author: "Selin K.", time: "10:30", text: "Bu hafta PDÖ vakası için Grup 3'te yer var, ilgilenen var mı?" },
        { avatar: "🎓", author: "Can T.", time: "11:45", text: "Klinik staj çizelgesi güncellendi, dekanlik panelinden kontrol edin!" },
    ];

    mainContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0;">
            <!-- Forum Banner -->
            <div style="background:${bgColor}; padding:20px 24px; border-radius:16px 16px 0 0; color:white; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:14px;">
                    <div style="font-size:36px; background:rgba(255,255,255,0.2); width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center;">${icon}</div>
                    <div>
                        <h2 style="margin:0; font-size:20px; font-weight:800;">${name}</h2>
                        <span style="font-size:13px; opacity:0.85;">📋 Fakülte Forumu · Sadece üyeler görebilir</span>
                    </div>
                </div>
                <div style="display:flex; gap:16px; font-size:13px; font-weight:600;">
                    <span style="background:rgba(0,0,0,0.2); padding:6px 14px; border-radius:20px;">👥 ${totalMembers} Üye</span>
                    <span style="background:rgba(16,185,129,0.3); padding:6px 14px; border-radius:20px;">🟢 ${onlineMembers} Çevrimiçi</span>
                </div>
            </div>

            <!-- Yeni Gönderi Kutusu -->
            <div style="background:var(--card-bg); border-left:1px solid var(--border-color); border-right:1px solid var(--border-color); padding:18px 20px; border-bottom:1px solid var(--border-color);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <div style="width:42px; height:42px; background:#EEF2FF; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; border:1px solid #c7d2fe;">${window.userProfile.avatar}</div>
                    <div style="flex:1;">
                        <textarea id="forum-new-post-text" rows="2" style="width:100%; border:1px solid var(--border-color); border-radius:12px; padding:12px 14px; font-size:14px; resize:none; outline:none; background:#F9FAFB; font-family:inherit; transition:0.2s;" placeholder="${name} öğrencilerine bir şeyler yaz..." onfocus="this.style.borderColor='var(--primary)'; this.style.background='white'; this.rows=4;" onblur="this.style.borderColor='var(--border-color)'; this.style.background='#F9FAFB'; if(!this.value) this.rows=2;"></textarea>
                        <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                            <button class="btn-primary" style="width:auto; padding:9px 22px; border-radius:10px; font-size:14px;" onclick="window.submitForumPost('${name}')">📤 Paylaş</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forum Gönderileri -->
            <div style="background:var(--card-bg); border:1px solid var(--border-color); border-top:none; border-radius:0 0 16px 16px; padding:16px 20px;" id="forum-posts-container">
                <div class="forum-feed-container">
                    ${demoPosts.map(p => `
                        <div class="forum-post-card">
                            <div class="forum-post-header">
                                <div class="forum-post-avatar">${p.avatar}</div>
                                <div class="forum-post-meta">
                                    <span class="forum-post-author">${p.author}</span>
                                    <span class="forum-post-time">${p.time}</span>
                                </div>
                            </div>
                            <div class="forum-post-text">${p.text}</div>
                            <div class="forum-post-actions">
                                <button class="forum-action-btn">👍 Beğen</button>
                                <button class="forum-action-btn">💬 Yanıtla</button>
                                <button class="forum-action-btn">🔗 Paylaş</button>
                            </div>
                        </div>`).join('')}
                </div>
            </div>
        </div>`;

    window.scrollTo(0, 0);
};

window.submitForumPost = function (facultyName) {
    const textarea = document.getElementById('forum-new-post-text');
    if (!textarea || !textarea.value.trim()) { alert("Lütfen bir şeyler yazın."); return; }
    const text = textarea.value.trim();
    textarea.value = '';
    textarea.rows = 2;

    const container = document.getElementById('forum-posts-container');
    const feedContainer = container ? container.querySelector('.forum-feed-container') : null;
    if (!feedContainer) return;

    const newPostHTML = `
        <div class="forum-post-card" style="border-color: var(--primary); background: #F0F4FF;">
            <div class="forum-post-header">
                <div class="forum-post-avatar">${window.userProfile.avatar}</div>
                <div class="forum-post-meta">
                    <span class="forum-post-author">${window.userProfile.username || window.userProfile.name} <span style="background:#EEF2FF; color:var(--primary); font-size:11px; padding:1px 8px; border-radius:10px; margin-left:6px;">Sen</span></span>
                    <span class="forum-post-time">Şimdi</span>
                </div>
            </div>
            <div class="forum-post-text">${text.replace(/\n/g, '<br>')}</div>
            <div class="forum-post-actions">
                <button class="forum-action-btn">👍 Beğen</button>
                <button class="forum-action-btn">💬 Yanıtla</button>
                <button class="forum-action-btn">🔗 Paylaş</button>
            </div>
        </div>`;

    feedContainer.insertAdjacentHTML('afterbegin', newPostHTML);
    window.scrollTo(0, 0);
};

// -------------------------------------------------------
// KULÜP VE ORGANİZASYONLAR — Meeting (Toplantı) Usulü
// -------------------------------------------------------
window.handleOrganizationClick = async function (name, icon, bgColor) {
    const isJoined = window.joinedOrganizations.some(o => o.name === name) || window.userProfile.organization === name;
    if (isJoined) {
        window.loadOrganizationMeetingPage(name, icon, bgColor);
    } else {
        mainContent.innerHTML = `
            <div class="join-faculty-box">
                <div class="icon">${icon}</div>
                <h2>${name}'e Hoş Geldin</h2>
                <p>Bu kulüp kapalı bir organizasyondur. Katılmak için kulüp kodunu gir.</p>
                <div style="max-width: 300px; margin: 0 auto 20px auto;">
                    <input type="text" id="org-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Kulüp Kodunu Girin">
                </div>
                <button class="btn-primary" style="max-width:250px; font-size:16px; padding:12px;" onclick="window.verifyOrganizationCode('${name}', '${icon}', '${bgColor}')">Kulübe Katıl</button>
            </div>`;
        window.scrollTo(0, 0);
    }
};

window.verifyOrganizationCode = async function (name, icon, bgColor) {
    const inputCode = document.getElementById('org-passcode-input').value.trim();
    if (ORGANIZATION_PASSCODES[name] && inputCode.toLowerCase() === ORGANIZATION_PASSCODES[name].toLowerCase()) {
        window.userProfile.organization = name;
        window.joinedOrganizations = [{ name, icon, color: bgColor }];
        await updateDoc(doc(db, "users", window.userProfile.uid), { organization: name });
        window.loadOrganizationMeetingPage(name, icon, bgColor);
    } else { alert("Hatalı kod! Kulüp yönetimi ile iletişime geçin."); }
};

// 🎭 KULÜP MEETING SAYFASI — Sesli/Görüntülü Toplantı Arayüzü
window.loadOrganizationMeetingPage = function (name, icon, bgColor) {
    mainContent.innerHTML = `
        <div class="meeting-room-container">
            <!-- Meeting Header -->
            <div class="meeting-header">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:22px;">${icon}</span>
                    <div>
                        <div style="font-weight:700; font-size:16px;">${name}</div>
                        <div style="font-size:12px; color:#9CA3AF;">Canlı Toplantı Odası</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                    <span style="background:rgba(239,68,68,0.2); color:#FCA5A5; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:bold; display:flex; align-items:center; gap:6px;">
                        <span style="width:8px; height:8px; background:#EF4444; border-radius:50%; display:inline-block; animation: livePulse 1.5s infinite;"></span> CANLI
                    </span>
                    <span style="background:#374151; padding:4px 12px; border-radius:12px; font-size:12px; color:#D1D5DB;">👥 3 Katılımcı</span>
                </div>
            </div>

            <!-- Meeting Body -->
            <div class="meeting-body">
                <!-- Video Grid -->
                <div class="meeting-video-grid">
                    <!-- Kullanıcının kendisi -->
                    <div class="video-tile self-tile">
                        <div class="video-tile-avatar">${window.userProfile.avatar}</div>
                        <div class="video-tile-label">Sen (${window.userProfile.name})</div>
                        <div style="position:absolute; top:8px; right:8px; width:12px; height:12px; background:#10B981; border-radius:50%; box-shadow:0 0 6px #10B981;"></div>
                    </div>

                    <!-- Konuşan katılımcı -->
                    <div class="video-tile speaking">
                        <div class="video-tile-avatar">👨‍💼</div>
                        <div class="video-tile-label">Moderatör</div>
                        <div class="video-tile-status">🎙️ Konuşuyor</div>
                    </div>

                    <!-- Sessiz katılımcı -->
                    <div class="video-tile">
                        <div class="video-tile-avatar">👩‍🎓</div>
                        <div class="video-tile-label">Ayşe Y.</div>
                        <div class="video-tile-status">🔇</div>
                    </div>

                    <!-- Kamera kapalı katılımcı -->
                    <div class="video-tile" style="background:#0F172A;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                            <div style="width:48px; height:48px; background:#374151; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px;">👨‍🎓</div>
                            <span style="font-size:12px; color:#6B7280;">Kamera Kapalı</span>
                        </div>
                        <div class="video-tile-label">Ali K.</div>
                    </div>
                </div>

                <!-- Meeting Chat Panel -->
                <div class="meeting-chat-panel">
                    <div class="meeting-chat-header">
                        <span>💬 Toplantı Sohbeti</span>
                        <span style="font-size:11px; background:#374151; padding:2px 8px; border-radius:10px; color:#9CA3AF;">👥 3</span>
                    </div>
                    <div class="meeting-chat-messages" id="meeting-chat-scroll">
                        <div style="font-size:12px; color:#6B7280; text-align:center; padding:8px 0; border-bottom:1px solid #374151; margin-bottom:12px;">Toplantı başladı · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div>
                            <div style="font-size:12px; color:#60A5FA; font-weight:700; margin-bottom:2px;">Moderatör</div>
                            <div style="font-size:13px; color:#E5E7EB; line-height:1.5; background:#374151; padding:8px 12px; border-radius:10px; border-radius-top-left:2px; margin-bottom:4px;">Herkese merhaba! Bu haftaki etkinlik planlamasını konuşacağız. Saat 20:00'de ajandayı paylaşacağım.</div>
                            <div style="font-size:10px; color:#6B7280;">19:55</div>
                        </div>
                        <div>
                            <div style="font-size:12px; color:#F9A8D4; font-weight:700; margin-bottom:2px;">Ayşe Y.</div>
                            <div style="font-size:13px; color:#E5E7EB; background:#374151; padding:8px 12px; border-radius:10px; border-radius-top-left:2px; margin-bottom:4px;">Harika, bekliyoruz! 👏</div>
                            <div style="font-size:10px; color:#6B7280;">19:57</div>
                        </div>
                    </div>
                    <div class="meeting-chat-input">
                        <input type="text" id="meeting-chat-input" placeholder="Mesaj yaz..." style="flex:1; padding:9px 12px; border-radius:8px; border:none; background:#374151; color:white; outline:none; font-size:13px;" onkeypress="if(event.key==='Enter') window.sendMeetingChatMsg()">
                        <button onclick="window.sendMeetingChatMsg()" style="background:var(--primary); border:none; color:white; border-radius:8px; padding:0 14px; cursor:pointer; font-size:16px;">➤</button>
                    </div>
                </div>
            </div>

            <!-- Meeting Controls -->
            <div class="meeting-controls">
                <button class="meeting-ctrl-btn" id="mic-btn" title="Mikrofon" onclick="window.toggleMeetingCtrl('mic-btn', '🎙️', '🔇')">🎙️</button>
                <button class="meeting-ctrl-btn" id="cam-btn" title="Kamera" onclick="window.toggleMeetingCtrl('cam-btn', '📹', '🚫')">📹</button>
                <button class="meeting-ctrl-btn" id="screen-btn" title="Ekran Paylaş" onclick="alert('Ekran paylaşımı yakında aktif olacak.')">💻</button>
                <button class="meeting-ctrl-btn" id="hand-btn" title="El Kaldır" onclick="window.raiseHand()">✋</button>
                <button class="meeting-ctrl-btn" id="emoji-btn" title="Reaksiyon" onclick="window.sendMeetingReaction()">😄</button>
                <button class="meeting-ctrl-btn danger" title="Odadan Ayrıl" onclick="if(confirm('Toplantıdan ayrılmak istediğinize emin misiniz?')) window.loadPage('home')">📵</button>
            </div>
        </div>
        <style>
            @keyframes livePulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.85); }
                100% { opacity: 1; transform: scale(1); }
            }
        </style>`;

    window.scrollTo(0, 0);
};

// Meeting yardımcı fonksiyonları
window.sendMeetingChatMsg = function () {
    const input = document.getElementById('meeting-chat-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    const scroll = document.getElementById('meeting-chat-scroll');
    if (!scroll) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    scroll.insertAdjacentHTML('beforeend', `
        <div>
            <div style="font-size:12px; color:#A5B4FC; font-weight:700; margin-bottom:2px;">${window.userProfile.name} (Sen)</div>
            <div style="font-size:13px; color:#E5E7EB; background:#4F46E5; padding:8px 12px; border-radius:10px; margin-bottom:4px;">${text}</div>
            <div style="font-size:10px; color:#6B7280;">${timeStr}</div>
        </div>`);
    scroll.scrollTop = scroll.scrollHeight;
};

window.toggleMeetingCtrl = function (btnId, activeIcon, offIcon) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const isOff = btn.innerHTML === offIcon;
    btn.innerHTML = isOff ? activeIcon : offIcon;
    btn.style.background = isOff ? '#374151' : '#EF4444';
};

window.raiseHand = function () {
    const btn = document.getElementById('hand-btn');
    if (!btn) return;
    const isRaised = btn.style.background === 'rgb(245, 158, 11)';
    btn.style.background = isRaised ? '#374151' : '#F59E0B';
    btn.title = isRaised ? 'El Kaldır' : 'Eli İndir';
};

const reactions = ['👍', '❤️', '😂', '🎉', '👏', '🔥'];
window.sendMeetingReaction = function () {
    const emoji = reactions[Math.floor(Math.random() * reactions.length)];
    const el = document.createElement('div');
    el.innerText = emoji;
    el.style.cssText = `position:fixed; bottom:100px; right:${60 + Math.random() * 80}px; font-size:32px; z-index:9999; pointer-events:none; animation:floatUp 2s ease forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);

    if (!document.getElementById('reaction-anim-style')) {
        const style = document.createElement('style');
        style.id = 'reaction-anim-style';
        style.innerHTML = `@keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-120px)} }`;
        document.head.appendChild(style);
    }
};

// ============================================================================
// 11. ROUTING VE PROFİL
// ============================================================================

window.loadPage = function (pageName) {
    if (pageName === 'home') mainContent.innerHTML = getHomeContent();
    else if (pageName === 'market') window.renderListings('market', '🛒 Kampüs Market', 'market');
    else if (pageName === 'housing') window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
    else if (pageName === 'campus' || pageName === 'confessions') window.renderConfessions();
    else if (pageName === 'qa') window.renderQA();
    else if (pageName === 'messages') window.renderMessages();
    else if (pageName === 'notifications') window.renderNotifications();
    else if (pageName === 'settings') window.renderSettings();
    else if (pageName === 'profile') window.renderProfile();

    if (window.innerWidth <= 1024 && document.getElementById('sidebar')) document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0, 0);
};

document.querySelectorAll('.menu-item[data-target]').forEach(item => {
    item.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        if (target) {
            document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
            e.currentTarget.classList.add('active');
            window.loadPage(target);
        }
    });
});

bind('logo-btn', 'click', () => {
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
    const homeItem = document.querySelector('[data-target="home"]');
    if (homeItem) homeItem.classList.add('active');
    window.loadPage('home');
});

bind('profile-btn', 'click', () => {
    document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
    window.loadPage('profile');
});

window.renderProfile = function () {
    const premiumBadge = window.userProfile.isPremium ? '<span style="font-size:12px; background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:8px; font-weight:bold; margin-left:10px;">🌟 Premium</span>' : '';
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
                    <div style="display:flex; align-items:center; background:inherit; border:1px solid #D1D5DB; border-radius:10px; overflow:hidden;">
                        <span style="padding-left:12px; color:var(--primary); font-weight:800; font-size:16px;">#</span>
                        <input type="text" id="prof-username" value="${(window.userProfile.username || '').replace('#', '')}" placeholder="kullaniciadi" style="border:none; background:transparent; width:100%; padding:12px 8px; outline:none; font-size:15px; font-weight:600;">
                    </div>
                </div>
                <div class="form-group"><label>Üniversite</label><input type="text" disabled value="${window.userProfile.university}" style="background:#E5E7EB; cursor:not-allowed;"></div>
                <div class="form-group"><label>E-posta</label><input type="email" disabled value="${window.userProfile.email}" style="background:#E5E7EB; cursor:not-allowed;"></div>
                <button class="btn-primary" onclick="window.saveProfile()" style="padding:12px; margin-bottom: 15px;">Profilimi Kaydet</button>
                <button class="btn-danger" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>
            </div>
        </div>`;
};

window.saveProfile = async function () {
    const name = document.getElementById('prof-name').value;
    const surname = document.getElementById('prof-surname').value;
    let rawUsername = document.getElementById('prof-username').value.trim().toLowerCase();
    if (!rawUsername) { alert("Kullanıcı adı boş bırakılamaz!"); return; }
    rawUsername = rawUsername.replace(/^#/, '');
    const username = '#' + rawUsername;
    if (username !== window.userProfile.username) {
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) { alert("Bu kullanıcı adı alınmış. Başka bir tane deneyin."); return; }
        } catch (e) { alert("Hata: " + e.message); return; }
    }
    window.userProfile.name = name; window.userProfile.surname = surname; window.userProfile.username = username;
    try {
        await updateDoc(doc(db, "users", window.userProfile.uid), { name, surname, username });
        window.openModal('Başarılı', `<div style="text-align:center;"><p style="font-size:40px; margin:0;">✅</p><p>Profil güncellendi!</p></div>`);
    } catch (e) { alert("Profil kaydedilirken hata: " + e.message); }
};

window.renderSettings = function () {
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
        </div>`;
};
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, initializeUniLoop);
} else {
initializeUniLoop();
}
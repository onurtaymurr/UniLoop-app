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

function initializeUniLoop() {
    
    // 🎨 DINAMIK CSS ENJEKSIYONU: Yumuşak Kaydırma (Smooth Scroll) ve Yeni Akış Fixleri
    const styleFix = document.createElement('style');
    styleFix.innerHTML = `
        /* Sert kaydırmayı engeller ve estetik yumuşak kaydırma sağlar */
        html, body { 
            scroll-behavior: smooth !important; 
            -webkit-overflow-scrolling: touch; 
        }
        
        /* Buton tıklama sorunlarını gideren z-index ve pointer ayarları */
        button, .menu-item, .chat-contact, .action-btn { 
            cursor: pointer !important; 
            position: relative; 
            z-index: 10; 
        }
        
        /* Mobilde Sidebar Kaydırma Fix - Dışarı Taşmayı Engeller */
        #sidebar { 
            overflow-y: auto !important; 
            -webkit-overflow-scrolling: touch !important; 
            overscroll-behavior: contain; 
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
        
        /* 📱 YENİ: Instagram / Twitter Tarzı Akış (Feed) Stilleri */
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
            /* YENİ: Akış sayfanın ortasına alındı (max 600px) */
            max-width: 600px !important;
            margin: 0 auto !important;
            width: 100%;
        }
        .feed-post { 
            background: #fff; 
            border: 1px solid #E5E7EB; 
            border-radius: 16px; 
            padding: 16px; 
            /* YENİ: Gönderiler arası daha belirgin boşluk ve modern gölge */
            margin-bottom: 24px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.04); 
        }
        .feed-post-header { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin-bottom: 12px; 
        }
        .feed-post-avatar { 
            font-size: 24px; 
            width: 44px; 
            height: 44px; 
            background: #F3F4F6; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0; 
            border: 1px solid #E5E7EB; 
        }
        .feed-post-meta { 
            display: flex; 
            flex-direction: column; 
        }
        .feed-post-author { 
            font-weight: 800; 
            font-size: 15px; 
            color: #111827; 
        }
        .feed-post-time { 
            font-size: 12px; 
            color: #6B7280; 
            margin-top: 2px; 
        }
        .feed-post-text { 
            font-size: 15px; 
            margin-bottom: 12px; 
            line-height: 1.5; 
            color: #374151; 
            word-break: break-word; 
        }
        .feed-post-img { 
            width: 100%; 
            border-radius: 12px; 
            margin-bottom: 12px; 
            max-height: 450px; 
            object-fit: cover; 
            cursor: pointer; 
            border: 1px solid #E5E7EB; 
        }
        .feed-post-actions { 
            display: flex; 
            border-top: 1px solid #E5E7EB; 
            padding-top: 12px; 
            gap: 20px; 
        }
        .feed-action-btn { 
            background: none; 
            border: none; 
            color: #6B7280; 
            font-weight: 600; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 14px; 
            padding: 5px; 
            outline: none; 
            transition: 0.2s; 
            border-radius: 8px; 
            z-index: 10; 
        }
        .feed-action-btn:hover { 
            color: var(--primary); 
            background: #EEF2FF; 
        }

        /* YENİ: GERÇEK ÇALIŞAN KARANLIK MOD (DARK MODE) DESTEĞİ */
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

        @media (max-width: 1024px) {
            #chat-layout-container { height: calc(100vh - 160px) !important; }
            .chat-sidebar { width: 100%; display: block; }
            .chat-active .chat-sidebar { display: none !important; }
            .chat-main { display: none !important; }
            .chat-active .chat-main { display: flex !important; }
        }
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

    // 🔒 Mobilde Sidebar (Sol Menü) dışına tıklandığında menüyü kapatma garantisi (Mobil Uyumlu)
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
        if (el) {
            el.addEventListener(event, callback); 
        }
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
        faculty: "" 
    };
    
    window.joinedFaculties = [];
    let marketDB = [];
    let confessionsDB = [];
    let qaDB = [];
    let chatsDB = [];
    let currentChatId = null;

    window.resetCurrentChatId = function() {
        currentChatId = null;
    };

    const FACULTY_PASSCODES = {
        "Tıp Fakültesi": "tıpfak100", 
        "Bilgisayar Fakültesi": "bil1000", 
        "Diş Hekimliği": "dis1000",
        "Hukuk Fakültesi": "hukuk1000", 
        "Mimarlık Fakültesi": "mim1000", 
        "Eğitim Fakültesi": "egt1000"
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

    // ============================================================================
    // 1. GİRİŞ, KAYIT, ONAY VE ŞİFREMİ UNUTTUM
    // ============================================================================
    
    bind('show-register-btn', 'click', (e) => {
        if(e) {
            e.preventDefault();
        }
        document.getElementById('login-card').style.display = 'none'; 
        document.getElementById('register-card').style.display = 'block';
    });
    
    bind('show-login-btn', 'click', (e) => {
        if(e) {
            e.preventDefault();
        }
        document.getElementById('register-card').style.display = 'none'; 
        document.getElementById('login-card').style.display = 'block';
    });

    const uniInput = document.getElementById('reg-uni');
    const uniList = document.getElementById('uni-autocomplete-list');
    
    if (uniInput && uniList) {
        uniInput.addEventListener('input', function() {
            const val = this.value;
            uniList.innerHTML = '';
            
            if (!val) {
                return false;
            }
            
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
            if(e.target !== uniInput) {
                uniList.innerHTML = ''; 
            }
        });
    }

    bind('register-btn', 'click', async (e) => {
        if(e) {
            e.preventDefault(); 
        }
        
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

            sendEmailVerification(user).catch(err => {
                console.error("Mail gönderilemedi:", err);
            });

            setDoc(doc(db, "users", user.uid), {
                uid: user.uid, 
                name: name, 
                surname: surname, 
                username: "", 
                university: uni, 
                email: email, 
                avatar: "👨‍🎓", 
                isOnline: false, 
                faculty: ""
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
        if(e) {
            e.preventDefault();
        }
        
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
                alert("Hesabınız henüz onaylanmamış! Lütfen e-postanıza gelen linke tıklayın. Linke tıkladıktan sonra bu butona tekrar basabilirsiniz.");
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
        if(e) {
            e.preventDefault(); 
        }

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
        if(e) {
            e.preventDefault();
        }
        
        const email = prompt("Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin:");
        
        if(!email) {
            return;
        }
        
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Şifre sıfırlama bağlantısı e-posta adresinize başarıyla gönderildi! Lütfen gelen kutunuzu (ve Spam klasörünü) kontrol edin.");
        } catch (error) {
            alert("Hata: " + error.message);
        }
    });

    // ============================================================================
    // 🌍 SİSTEM MESAJI GARANTİSİ 
    // ============================================================================
    window.ensureWelcomeMessage = async function(user, userName) {
        if(!user) {
            return;
        }
        try {
            const chatId = user.uid + "_system_welcome";
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                const systemMessageText = `
                    Merhaba ${userName}! Dünyanın en yenilikçi kampüs ağı UniLoop'a hoş geldin. 🎓✨<br><br>
                    Bu platform senin dijital kampüsün! Neler mi yapabilirsin?<br><br>
                    🛒 <b>Kampüs Market:</b> İhtiyacın olmayan eşyaları sat veya diğer öğrencilerin ilanlarına göz at. İlanlara tıklayıp direkt mesaj atarak güvenle iletişime geç.<br><br>
                    📸 <b>Kampüs Akışı:</b> İstersen tamamen anonim olarak, istersen kullanıcı adınla fotoğraf ve düşüncelerini özgürce paylaş.<br><br>
                    ❓ <b>Soru & Cevap:</b> Dersler veya kampüs yaşamı hakkında aklına takılan her şeyi sor.<br><br>
                    🤝 <b>Bağlantı Kur:</b> Ana sayfadaki arama çubuğuna arkadaşlarının '#' kullanıcı adını yazarak onlara istek gönder. Bildirimler (🔔) kısmından gelen istekleri kabul et ve hemen mesajlaşmaya başla.<br><br>
                    Burası senin alanın. Hemen "Profilim" sekmesine giderek kendine unutulmaz bir kullanıcı adı belirle ve döngüye katıl! Seni aramızda gördüğümüz için çok mutluyuz.
                `;
                
                await setDoc(chatRef, {
                    participants: [user.uid, "system"],
                    participantNames: { 
                        [user.uid]: userName, 
                        "system": "UniLoop Team" 
                    },
                    participantAvatars: { 
                        [user.uid]: "👨‍🎓", 
                        "system": "🌍" 
                    },
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
                if(btn) { 
                    btn.innerText = "Giriş Yap"; 
                    btn.disabled = false; 
                }
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
                            🔔 Bildirimler <span id="notif-badge" class="badge" style="display:none; background:#EF4444; color:white; padding:2px 8px; border-radius:12px; font-size:11px; margin-left:auto;">0</span>
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
                } else {
                    window.userProfile = { 
                        uid: user.uid, 
                        name: "Öğrenci", 
                        surname: "", 
                        username: "",
                        email: user.email, 
                        university: "UniLoop Kampüsü", 
                        avatar: "👨‍🎓", 
                        faculty: "", 
                        isOnline: true
                    };
                    await setDoc(userDocRef, window.userProfile);
                }
                
                if(!window.userProfile.email) {
                    window.userProfile.email = user.email;
                }
                if(!window.userProfile.university) {
                    window.userProfile.university = "UniLoop Kampüsü";
                }
                if(window.userProfile.username === undefined) {
                    window.userProfile.username = "";
                }

                await window.ensureWelcomeMessage(user, window.userProfile.name);
                await updateDoc(userDocRef, { isOnline: true });
                
                initRealtimeListeners(user.uid);

                const activeTab = document.querySelector('.menu-item.active');
                if(typeof window.loadPage === 'function') {
                    window.loadPage(activeTab ? activeTab.getAttribute('data-target') : 'home'); 
                }

                if(window.userProfile.faculty && typeof window.updateMyFacultiesSidebar === 'function') {
                    window.joinedFaculties = [{ 
                        name: window.userProfile.faculty, 
                        icon: "🏢", 
                        color: "linear-gradient(135deg, #1E3A8A, #4F46E5)" 
                    }];
                    window.updateMyFacultiesSidebar();
                }

            } catch(error) { 
                window.userProfile = { 
                    uid: user.uid, 
                    name: "Misafir", 
                    surname: "", 
                    username: "", 
                    email: user.email, 
                    university: "Lütfen Firestore'u Test Moduna Alın", 
                    avatar: "⚠️", 
                    faculty: "", 
                    isOnline: true 
                };
                if(typeof window.loadPage === 'function') {
                    window.loadPage('home'); 
                }
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

        // Pazar Yeri Dinleyicisi
        onSnapshot(query(collection(db, "listings"), orderBy("createdAt", "desc")), (snapshot) => {
            marketDB = [];
            snapshot.forEach(doc => {
                marketDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
            });
            marketDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            
            const activeTab = document.querySelector('.menu-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'market') {
                window.renderListings('market', '🛒 Kampüs Market', 'market');
            }
            if(activeTab && activeTab.getAttribute('data-target') === 'housing') {
                window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
            }
        });

        // 🌟 KAMPÜS AKIŞI (FEED) DİNLEYİCİSİ
        onSnapshot(query(collection(db, "confessions"), orderBy("createdAt", "desc")), (snapshot) => {
            confessionsDB = [];
            snapshot.forEach(doc => {
                confessionsDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
            });
            confessionsDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            
            const activeTab = document.querySelector('.menu-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'confessions') {
                window.drawConfessionsFeed();
            }

            if(document.getElementById('app-modal').classList.contains('active') && document.getElementById('active-post-id')) {
                const activePostId = document.getElementById('active-post-id').value;
                if(activePostId) {
                    window.updateConfessionDetailLive(activePostId);
                }
            }
        });

        // Soru/Cevap Dinleyicisi
        onSnapshot(query(collection(db, "qa"), orderBy("createdAt", "desc")), (snapshot) => {
            qaDB = [];
            snapshot.forEach(doc => {
                qaDB.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
            });
            qaDB.sort((a, b) => safeSortTime(b) - safeSortTime(a));
            
            const activeTab = document.querySelector('.menu-item.active');
            if(activeTab && activeTab.getAttribute('data-target') === 'qa') {
                const activeFilter = document.querySelector('.qa-filter-btn.active');
                window.drawQAGrid(activeFilter ? activeFilter.getAttribute('data-filter') : 'Genel');
            }
        });

        // 🛡️ CHATS LİSTENER: CANLI GÜNCELLEMELER VE KESİNTİSİZ ODAK FIXI
        onSnapshot(query(collection(db, "chats"), where("participants", "array-contains", currentUid)), (snapshot) => {
            chatsDB = [];
            let pendingRequestsCount = 0;
            
            snapshot.forEach(doc => {
                try {
                    const data = doc.data({ serverTimestamps: 'estimate' }); 
                    
                    if (!data.participants || !Array.isArray(data.participants)) {
                        return;
                    } 
                    
                    const otherUid = data.participants.find(p => p !== currentUid) || "system";
                    const otherName = (data.participantNames && data.participantNames[otherUid]) ? data.participantNames[otherUid] : "UniLoop Team";
                    const otherAvatar = (data.participantAvatars && data.participantAvatars[otherUid]) ? data.participantAvatars[otherUid] : "👤";
                    
                    let safeTimestamp = 0;
                    if (data.lastUpdated && typeof data.lastUpdated.toMillis === 'function') {
                        safeTimestamp = data.lastUpdated.toMillis();
                    } else {
                        safeTimestamp = Date.now();
                    }
                    
                    const chatItem = { 
                        id: doc.id, 
                        otherUid: otherUid, 
                        name: otherName, 
                        avatar: otherAvatar, 
                        messages: data.messages || [],
                        status: data.status || 'accepted', 
                        initiator: data.initiator || null,
                        lastUpdatedTS: safeTimestamp 
                    };

                    chatsDB.push(chatItem);

                    if (chatItem.status === 'pending' && chatItem.initiator !== currentUid) {
                        pendingRequestsCount++;
                    }
                } catch(err) {
                    console.error("Hatalı bir mesaj belgesi es geçildi:", err);
                }
            });

            chatsDB.sort((a, b) => b.lastUpdatedTS - a.lastUpdatedTS);

            const notifBadge = document.getElementById('notif-badge');
            if(notifBadge) {
                if(pendingRequestsCount > 0) { 
                    notifBadge.style.display = 'inline-block'; 
                    notifBadge.innerText = pendingRequestsCount; 
                } else { 
                    notifBadge.style.display = 'none'; 
                }
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
                        if(isFocused) {
                            newInputField.focus();
                            newInputField.selectionStart = newInputField.selectionEnd = newInputField.value.length;
                        }
                    }
                } else {
                    window.renderMessages();
                }

            } else if (activeTab && activeTab.getAttribute('data-target') === 'notifications') {
                window.renderNotifications();
            }
        });
    }

    // ============================================================================
    // 3. AÇILIR PENCERELER VE ARKA PLAN KAYMASINI ÖNLEME
    // ============================================================================

    window.goToMessages = function() {
        const msgTab = document.querySelector('[data-target="messages"]');
        if(msgTab) {
            msgTab.click();
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
        if (!document.getElementById('lightbox').classList.contains('active')) {
            document.body.style.overflow = 'auto'; 
        }
    };
    
    bind('modal-close', 'click', window.closeModal);
    
    window.addEventListener('click', (e) => { 
        if (e.target === modal) {
            window.closeModal(); 
        }
    });

    bind('mobile-menu-btn', 'click', () => { 
        document.getElementById('sidebar').classList.toggle('open'); 
    });

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.community-link');
        if(link) {
            const name = link.getAttribute('data-name');
            const icon = link.getAttribute('data-icon');
            const color = link.getAttribute('data-color');
            
            if(typeof window.handleFacultyClick === 'function') {
                window.handleFacultyClick(name, icon, color);
            }
        }
    });

    const setupShowMore = (btnId, containerId) => {
        const btn = document.getElementById(btnId);
        const container = document.getElementById(containerId);
        
        if(btn && container) {
            btn.addEventListener('click', () => {
                if(container.style.display === 'none') { 
                    container.style.display = 'block'; 
                    btn.innerText = 'Daha Az Göster'; 
                } else { 
                    container.style.display = 'none'; 
                    btn.innerText = 'Daha Fazla Göster'; 
                }
            });
        }
    };
    
    setupShowMore('desktop-show-more-btn', 'desktop-more-faculties');
    setupShowMore('mobile-show-more-btn', 'mobile-more-faculties');

    // ============================================================================
    // 4. ARKADAŞ ARAMA MOTORU VE ARKADAŞLIK İSTEĞİ SİSTEMİ
    // ============================================================================

    window.searchAndAddFriend = async function() {
        try {
            const searchInput = document.getElementById('friend-search-input');
            if(!searchInput) return;
            
            let rawSearch = searchInput.value.trim().toLowerCase();
            if(!rawSearch) {
                alert("Lütfen bir kullanıcı adı yazın.");
                return;
            }
            
            if (!window.userProfile.username) {
                alert("Arkadaş eklemeden önce lütfen profilinizden bir kullanıcı adı belirleyin!");
                return;
            }

            rawSearch = rawSearch.replace(/^#/, '');
            const searchVal = '#' + rawSearch;
            
            if(searchVal === window.userProfile.username) {
                alert("Kendinizi arkadaş olarak ekleyemezsiniz :)");
                return;
            }

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
                if (doc.data().participants && doc.data().participants.includes(targetUserId)) {
                    existingChat = { id: doc.id, ...doc.data() };
                }
            });

            if(!existingChat) {
                await addDoc(collection(db, "chats"), {
                    participants: [myUid, targetUserId],
                    participantNames: { 
                        [myUid]: window.userProfile.name, 
                        [targetUserId]: targetUserName 
                    },
                    participantAvatars: { 
                        [myUid]: window.userProfile.avatar || "👨‍🎓", 
                        [targetUserId]: "👤" 
                    },
                    lastUpdated: serverTimestamp(), 
                    status: 'pending', 
                    initiator: myUid, 
                    messages: [{
                        senderId: "system",
                        text: "Arkadaşlık isteği gönderildi.",
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        read: false
                    }]
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
                <h2>✨ AI Kampüs Eşleşmeleri</h2>
                <div class="match-grid">
                    <div class="match-card">
                        <div class="avatar">👨‍💻</div>
                        <h4>John D.</h4>
                        <p>Bilgisayar Müh.</p>
                        <button class="action-btn" onclick="window.openModal('Bağlantı Kur', '<p>Sistem yakında aktif edilecek!</p>')">Bağlan</button>
                    </div>
                    <div class="match-card">
                        <div class="avatar">👩‍⚕️</div>
                        <h4>Sarah B.</h4>
                        <p>Tıp Fakültesi</p>
                        <button class="action-btn" onclick="window.goToMessages()">Mesaj At</button>
                    </div>
                </div>
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
        if(!document.getElementById('app-modal').classList.contains('active')) {
            document.body.style.overflow = 'auto';
        }
    };

    window.changeLightboxImage = function(step) {
        window.currentLightboxIndex += step;
        if(window.currentLightboxIndex < 0) {
            window.currentLightboxIndex = window.currentLightboxImages.length - 1;
        }
        if(window.currentLightboxIndex >= window.currentLightboxImages.length) {
            window.currentLightboxIndex = 0;
        }
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
        if (touchendX < touchstartX - 40) {
            window.changeLightboxImage(1); 
        }
        if (touchendX > touchstartX + 40) {
            window.changeLightboxImage(-1); 
        }
    }

    const lb = document.getElementById('lightbox');
    if(lb) {
        lb.addEventListener('touchstart', e => { 
            touchstartX = e.changedTouches[0].screenX; 
        });
        lb.addEventListener('touchend', e => { 
            touchendX = e.changedTouches[0].screenX; 
            handleSwipe(); 
        });
    }

    // ============================================================================
    // 6. İLAN YÖNETİMİ (MARKET VE LIGHTBOX ENTEGRASYONU)
    // ============================================================================

    window.renderListings = function(type, title, buttonTextType) {
        let html = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;">
                    <h2 style="margin:0;">${title}</h2>
                    <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openListingForm('${type}')">
                        + Yeni İlan Ekle
                    </button>
                </div>
                <input type="text" id="local-search-input" class="local-search-bar" placeholder="${title} içinde hızlıca ara...">
                <div class="market-grid" id="listings-grid-container"></div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        window.drawListingsGrid(type, buttonTextType, '');
        
        const searchInput = document.getElementById('local-search-input');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                window.drawListingsGrid(type, buttonTextType, e.target.value.toLowerCase());
            }); 
        }
    };

    window.drawListingsGrid = function(type, buttonTextType, filterText) {
        const container = document.getElementById('listings-grid-container');
        if(!container) {
            return;
        }

        const filteredData = marketDB.filter(item => 
            item.type === type && 
            (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText))
        );
        
        if(filteredData.length === 0) {
            container.innerHTML = `
                <p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">
                    Henüz ilan yok veya bulunamadı.
                </p>
            `; 
            return;
        }

        let gridHtml = '';
        
        filteredData.forEach(item => {
            let imgHtml = ''; 
            const displayCurrency = item.currency || '₺';

            if (item.imgUrl) { 
                imgHtml = `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                imgHtml = `
                    <div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                        📦
                    </div>
                `;
            }

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
        if(!item) {
            return;
        }

        let imgHtml = '';
        let indicatorsHtml = '';
        const displayCurrency = item.currency || '₺';

        if (item.imgUrls && item.imgUrls.length > 0) {
            imgHtml += '<div class="image-gallery" style="height:250px; border-radius:12px; margin-bottom:16px;">';
            
            const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
            
            item.imgUrls.forEach((url, i) => {
                imgHtml += `
                    <div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;">
                        <img src="${url}" alt="İlan" style="border-radius:12px;">
                    </div>
                `;
                indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`;
            });
            
            imgHtml += '</div>';
            
            if(item.imgUrls.length > 1) { 
                imgHtml += `
                    <div class="gallery-indicators" style="bottom: 25px;">
                        ${indicatorsHtml}
                    </div>
                `; 
            }
        } else if (item.imgUrl) { 
            const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
            imgHtml = `
                <img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">
            `;
        }

        let actionButtonsHtml = '';
        const btnText = type === 'market' ? 'Satıcıya Yaz' : 'İletişime Geç';
        const currentUid = window.userProfile.uid || (auth.currentUser ? auth.currentUser.uid : null);
        const safeTitle = item.title.replace(/'/g, "\\'"); 

        if (item.sellerId === currentUid) {
             actionButtonsHtml = `
                <div style="display:flex; gap:10px; margin-top: 20px;">
                    <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">
                        ✏️ Fiyatı Güncelle
                    </button>
                    <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">
                        🗑️ Sil
                    </button>
                </div>
             `;
        } else {
             actionButtonsHtml = `
                <button class="btn-primary" style="margin-top: 20px; padding:12px; font-size:15px;" onclick="window.startMarketChat('${item.sellerId}', '${item.sellerName}', 'Merhaba, \\'${safeTitle}\\' ilanınızla ilgileniyorum.'); window.closeModal();">
                    💬 ${btnText}
                </button>
             `;
        }

        window.openModal(item.title, `
            <div style="position:relative;">
                ${imgHtml}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="font-size:24px; font-weight:800; color:#059669;">
                    ${item.price} ${displayCurrency}
                </div>
                <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px;">
                    Satıcı: <strong>${item.sellerName}</strong>
                </div>
            </div>
            
            <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:16px; border-radius:12px; border:1px solid var(--border-color);">
                ${item.desc}
            </div>
            
            ${actionButtonsHtml}
        `);
    };

    window.deleteListing = async function(docId) {
        if(confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) {
            try { 
                await deleteDoc(doc(db, "listings", docId)); 
                alert("İlan başarıyla silindi!"); 
            } catch(e) { 
                console.error(e); 
                alert("Silinirken bir hata oluştu: " + e.message); 
            }
        }
    };

    window.editListing = async function(docId, oldTitle, oldPrice) {
        let newPrice = prompt(`"${oldTitle}" için yeni fiyatı girin (Sadece rakam):`, oldPrice);
        
        if(newPrice !== null && newPrice.trim() !== "") {
            try { 
                await updateDoc(doc(db, "listings", docId), { price: newPrice.trim() }); 
                alert("İlan fiyatı güncellendi!"); 
            } catch(e) { 
                console.error(e); 
                alert("Hata: " + e.message);
            }
        }
    };

    window.openListingForm = function(type) {
        const formTitle = type === 'market' ? '🛒 Kampüs Market İlanı Ekle' : '🔑 Ev Arkadaşı & Yurt İlanı Ekle';
        const titlePlaceholder = type === 'market' ? 'İlan Başlığı (Örn: Temiz Çalışma Masası)' : 'İlan Başlığı (Örn: Acil Ev Arkadaşı Aranıyor)';
        const descPlaceholder = type === 'market' ? 'Ürünün durumu ve detayları...' : 'Evin kuralları, konumu ve aranan özellikler...';

        window.openModal(formTitle, `
            <div class="form-group">
                <input type="text" id="new-item-title" placeholder="${titlePlaceholder}">
            </div>
            
            <div class="form-group" style="display: flex; gap: 10px;">
                <input type="number" id="new-item-price" placeholder="Fiyat / Kira Bedeli" style="flex: 2;">
                <select id="new-item-currency" style="flex: 1;">
                    <option value="₺">TL (₺)</option>
                    <option value="$">Dolar ($)</option>
                    <option value="€">Euro (€)</option>
                    <option value="£">Sterlin (£)</option>
                </select>
            </div>
            
            <div class="form-group">
                <textarea id="new-item-desc" rows="3" placeholder="${descPlaceholder}"></textarea>
            </div>
            
            <div class="upload-btn-wrapper">
                <button class="action-btn" id="photo-trigger-btn" style="width:100%; justify-content:center;">
                    📷 Fotoğraf Çek / Galeriden Seç (Max 3)
                </button>
                <input type="file" id="new-item-photo" accept="image/*" multiple style="display:none;" />
            </div>
            
            <div id="preview-container" class="preview-container"></div>
            
            <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
            <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">
                Fotoğraflar Yükleniyor, lütfen bekleyin...
            </p>
        `);

        setTimeout(() => {
            const photoBtn = document.getElementById('photo-trigger-btn');
            const photoInput = document.getElementById('new-item-photo');
            
            if(photoBtn && photoInput) {
                photoBtn.addEventListener('click', () => { 
                    photoInput.click(); 
                });
                
                photoInput.addEventListener('change', function(e) {
                    const files = Array.from(e.target.files).slice(0, 3);
                    const previewContainer = document.getElementById('preview-container');
                    previewContainer.innerHTML = ''; 
                    
                    files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(event) { 
                            previewContainer.innerHTML += `
                                <div class="preview-box">
                                    <img src="${event.target.result}">
                                </div>
                            `; 
                        }
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

        if (!titleEl || !priceEl || !descEl || !currencyEl) {
            return;
        }

        const title = titleEl.value.trim();
        const price = priceEl.value.trim();
        const currency = currencyEl.value;
        const desc = descEl.value.trim();

        if (title === "" || price === "" || desc === "") {
            alert("Lütfen başlık, fiyat ve açıklama alanlarını eksiksiz doldurun.");
            return;
        }

        let files = [];
        if(photoInput && photoInput.files && photoInput.files.length > 0) {
            files = Array.from(photoInput.files).slice(0, 3);
        }
        
        if(files.length === 0) {
            alert("Lütfen en az 1 fotoğraf seçin veya çekin.");
            return;
        }

        btn.disabled = true;
        statusEl.style.display = 'block';
        statusEl.innerText = "Fotoğraflar Yükleniyor, lütfen bekleyin...";
        statusEl.style.color = "var(--primary)";

        let imgUrlsArray = [];

        try {
            const uploadTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Yükleme süresi doldu. Firebase Storage izinlerinizi kontrol edin.")), 15000);
            });

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
                type: type, 
                title: title, 
                price: price, 
                currency: currency, 
                desc: desc, 
                imgUrls: imgUrlsArray, 
                imgUrl: imgUrlsArray.length > 0 ? imgUrlsArray[0] : "", 
                sellerId: window.userProfile.uid, 
                sellerName: window.userProfile.name + " " + window.userProfile.surname, 
                createdAt: serverTimestamp()
            });

            window.closeModal();
            alert("İlanınız başarıyla fotoğraflarıyla birlikte yayınlandı!");

        } catch (error) {
            console.error("İlan eklenirken hata:", error);
            statusEl.innerText = "HATA: " + error.message; 
            statusEl.style.color = "red";
            alert("İlan yayınlanamadı! Hata: " + error.message);
        } finally {
            if(statusEl.innerText !== "HATA: " + error.message) {
                statusEl.style.display = 'none';
            }
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
                if (p.includes(targetUserId)) {
                    existingChatId = doc.id;
                }
            });

            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            if(!existingChatId) {
                const newDocRef = await addDoc(collection(db, "chats"), {
                    participants: [myUid, targetUserId],
                    participantNames: { 
                        [myUid]: window.userProfile.name, 
                        [targetUserId]: targetUserName 
                    },
                    participantAvatars: { 
                        [myUid]: window.userProfile.avatar || "👨‍🎓", 
                        [targetUserId]: "👤" 
                    },
                    lastUpdated: serverTimestamp(), 
                    status: 'accepted', 
                    messages: [{ senderId: myUid, text: autoText, time: timeStr, read: false }] 
                });
                existingChatId = newDocRef.id;
            } else {
                await updateDoc(doc(db, "chats", existingChatId), {
                    status: 'accepted',
                    messages: arrayUnion({ senderId: myUid, text: autoText, time: timeStr, read: false }),
                    lastUpdated: serverTimestamp()
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
        
        let html = `
            <div class="card">
                <h2 style="margin-bottom: 20px;">🔔 Bildirimler ve Arkadaşlık İstekleri</h2>
        `;
        
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
        } catch(error) {
            alert("Hata oluştu: " + error.message);
        }
    };

    window.rejectRequest = async function(chatId) {
        if(confirm("Bu arkadaşlık isteğini reddetmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "chats", chatId));
                alert("İstek silindi.");
                window.renderNotifications();
            } catch(error) {
                alert("Hata oluştu: " + error.message);
            }
        }
    };

    window.renderMessagesSidebarOnly = function() {
        const sidebar = document.querySelector('.chat-sidebar');
        if(!sidebar) {
            return;
        }
        
        const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));
        
        let html = `<div class="chat-sidebar-header" style="position:sticky; top:0; background:white; z-index:10;">Mesajlarım</div>`;
        
        if (visibleChats.length === 0) {
            html += `<p style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Aktif mesajınız bulunmuyor.</p>`;
        }

        visibleChats.forEach(chat => {
            const lastMsgObj = chat.messages[chat.messages.length - 1];
            let rawLastMsg = lastMsgObj && lastMsgObj.text ? String(lastMsgObj.text) : "Sohbet başladı.";
            const isActive = chat.id === currentChatId ? 'active' : '';
            
            if (chat.status === 'pending' && chat.initiator === window.userProfile.uid) {
                rawLastMsg = "⏳ İstek gönderildi, bekleniyor...";
            }
            
            const previewMsg = rawLastMsg.replace(/<br>/g, ' ').substring(0, 35) + (rawLastMsg.length > 35 ? "..." : "");

            html += `
                <div class="chat-contact ${isActive}" data-id="${chat.id}" onclick="window.openChatView('${chat.id}')">
                    <div class="avatar">${chat.avatar}</div>
                    <div class="chat-contact-info">
                        <div class="chat-contact-top">
                            <span class="chat-contact-name">${chat.name}</span>
                            <span class="chat-contact-time">${lastMsgObj ? lastMsgObj.time : ""}</span>
                        </div>
                        <div class="chat-contact-last">${previewMsg}</div>
                    </div>
                </div>
            `;
        });
        
        sidebar.innerHTML = html;
    };

    window.updateChatMessagesOnly = function(chatId) {
        const activeChat = chatsDB.find(c => c.id === chatId);
        if(!activeChat) {
            return;
        }
        
        const scrollBox = document.getElementById('chat-messages-scroll');
        if(!scrollBox) {
            return; 
        }
        
        let chatHTML = '';
        
        activeChat.messages.forEach(msg => { 
            const type = msg.senderId === window.userProfile.uid ? 'sent' : 'received';
            
            let ticks = '';
            if (type === 'sent') {
                if (msg.read) {
                    ticks = '<span class="ticks" title="Okundu" style="color:#3B82F6; font-weight:bold; margin-left:6px; font-size:12px;">✓✓</span>';
                } else {
                    ticks = '<span class="ticks" title="İletildi" style="color:#9CA3AF; font-weight:bold; margin-left:6px; font-size:12px;">✓</span>';
                }
            }
            
            chatHTML += `
                <div class="bubble ${type}">
                    <div class="msg-text">${msg.text}</div>
                    <div class="msg-time" style="display:flex; align-items:center; justify-content:flex-end;">${msg.time} ${ticks}</div>
                </div>
            `; 
        });
        
        scrollBox.innerHTML = chatHTML;
        scrollBox.scrollTop = scrollBox.scrollHeight;
    };

    window.renderMessages = function() {
        const visibleChats = chatsDB.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.initiator === window.userProfile.uid));

        let html = `
            <div class="card" style="padding:0; border:none; background:transparent;">
                <div class="chat-layout" id="chat-layout-container">
                    <div class="chat-sidebar" id="sidebar-container">
                    </div>
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
        
        if(currentChatId && visibleChats.find(c => c.id === currentChatId)) {
            window.openChatView(currentChatId);
        }
    };

    window.openChatView = function(chatId) {
        currentChatId = chatId;
        const activeChat = chatsDB.find(c => c.id === chatId);
        
        if(!activeChat) {
            return;
        }

        let hasUnread = false;
        const updatedMessages = activeChat.messages.map(msg => {
            if (msg.senderId !== window.userProfile.uid && msg.read === false) {
                hasUnread = true;
                return { ...msg, read: true };
            }
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
            <div class="chat-messages" id="chat-messages-scroll">
            </div>
        `;
        
        if (activeChat.status === 'pending' && activeChat.initiator === window.userProfile.uid) {
             chatHTML += `
                <div style="padding: 20px; text-align: center; color: var(--text-gray); background: #F9FAFB; border-top: 1px solid var(--border-color); font-weight:bold;">
                    ⏳ Arkadaşlık isteğinizin karşı tarafça kabul edilmesi bekleniyor...
                </div>
            `;
        } else {
             chatHTML += `
                <div class="chat-input-area">
                    <div class="chat-input-wrapper">
                        <input type="text" id="chat-input-field" placeholder="Bir mesaj yazın...">
                    </div>
                    <button class="chat-send-btn" onclick="window.sendMsg('${chatId}')">➤</button>
                </div>
            `;
        }
        
        container.innerHTML = chatHTML;
        
        window.updateChatMessagesOnly(chatId); 

        const inputField = document.getElementById('chat-input-field');
        if(inputField) {
            inputField.addEventListener('keypress', (e) => { 
                if(e.key === 'Enter') {
                    window.sendMsg(chatId); 
                }
            });
            
            if(window.innerWidth > 1024) {
                inputField.focus();
            }
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
            } catch(error) {
                console.error("Mesaj gönderilemedi: ", error);
            }
        }
    };

    // ============================================================================
    // 8. 🌟 YENİ KAMPÜS AKIŞI (MODAL İLE GÖNDERİ OLUŞTURMA + INSTAGRAM/TWITTER FEED)
    // ============================================================================

    window.renderConfessions = function() {
        let html = `
            <div class="feed-layout-container">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 20px; background: inherit; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10;">
                    <h2 style="margin:0; font-size: 20px; font-weight: 800;">📸 Kampüs Akışı</h2>
                    <button class="btn-primary" style="width:auto; padding: 8px 16px; border-radius: 20px; font-size: 14px; box-shadow: 0 2px 4px rgba(79,70,229,0.2);" onclick="window.openConfessionForm()">
                        + Gönderi Oluştur
                    </button>
                </div>

                <div class="confessions-feed" id="conf-feed">
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        if(confessionsDB) {
            window.drawConfessionsFeed();
        }
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
                <button class="action-btn" id="conf-photo-trigger-btn" style="width:100%; justify-content:center; font-size:15px; border:1px dashed var(--primary); background:var(--bg-secondary); padding:12px; border-radius:12px;">
                    📷 Fotoğraf Ekle (İsteğe Bağlı)
                </button>
                <input type="file" id="new-conf-photo" accept="image/*" style="display:none;" />
            </div>
            
            <div id="conf-preview-container" class="preview-container"></div>
            
            <button class="btn-primary" id="publish-conf-btn" onclick="window.submitConfession()" style="padding:14px; font-size:16px; border-radius:12px; font-weight:bold;">Gönderiyi Yayınla</button>
            <p id="conf-upload-status" style="font-size:13px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">
                Yükleniyor, lütfen bekleyin...
            </p>
        `);

        // Fotoğraf Seçme ve Önizleme Dinleyicisi
        setTimeout(() => {
            const photoBtn = document.getElementById('conf-photo-trigger-btn');
            const photoInput = document.getElementById('new-conf-photo');
            
            if(photoBtn && photoInput) {
                photoBtn.addEventListener('click', () => { 
                    photoInput.click(); 
                });
                
                photoInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if(file) {
                        const reader = new FileReader();
                        reader.onload = function(event) { 
                            document.getElementById('conf-preview-container').innerHTML = `
                                <div class="preview-box" style="width:100%; height:auto; padding:0; border:none; margin-bottom:15px;">
                                    <img src="${event.target.result}" style="width:100%; max-height:200px; object-fit:contain; border-radius:12px; border:1px solid #E5E7EB; background:var(--bg-secondary);">
                                </div>
                            `; 
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
        
        if(!textEl || textEl.value.trim() === '') {
            alert("Lütfen bir şeyler yazın.");
            return;
        }
        
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
                btn.disabled = false;
                statusEl.style.display = 'none';
                return;
            }
        }

        const isAnon = identityEl.value === 'anon';
        const authorName = isAnon ? "Anonim Kullanıcı" : (window.userProfile.username || window.userProfile.name);
        const authorAvatar = isAnon ? ["👻","👽","🤖","🦊","🎭"][Math.floor(Math.random()*5)] : window.userProfile.avatar;

        try {
            await addDoc(collection(db, "confessions"), {
                authorId: window.userProfile.uid, // YENİ: Kendi gönderini silebilmen için arkaya UID eklendi
                avatar: authorAvatar, 
                user: authorName, 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                text: textEl.value.trim(), 
                imgUrl: imgUrl,
                comments: [], 
                createdAt: serverTimestamp()
            });
            window.closeModal(); 
        } catch(e) { 
            alert("Hata: Firebase kurallarını kontrol edin. Mesaj: " + e.message); 
            btn.disabled = false; 
        }
    };

    // YENİ: Gönderi Silme Fonksiyonu eklendi
    window.deleteConfession = async function(docId) {
        const lang = localStorage.getItem('uniloop_lang') || 'tr';
        const msg = lang === 'en' ? 'Are you sure you want to delete this post?' : 'Bu gönderiyi silmek istediğinize emin misiniz?';
        
        if(confirm(msg)) {
            try { 
                await deleteDoc(doc(db, "confessions", docId)); 
            } catch(e) { 
                console.error(e); 
                alert("Hata oluştu: " + e.message); 
            }
        }
    };

    window.drawConfessionsFeed = function() {
        const feed = document.getElementById('conf-feed');
        if(!feed) {
            return;
        }
        
        if(confessionsDB.length === 0) {
            feed.innerHTML = `
                <div style="text-align:center; color:var(--text-gray); padding: 40px 20px; border-radius: 12px; margin-top: 20px;">
                    <div style="font-size:40px; margin-bottom: 10px;">📸</div>
                    Henüz hiçbir paylaşım yok. İlk gönderiyi sen paylaş!
                </div>
            `;
            return;
        }

        let html = '<div style="display:flex; flex-direction:column; gap:0;">';
        
        confessionsDB.forEach((post) => {
            let imgHtml = '';
            if(post.imgUrl) {
                imgHtml = `
                    <img src="${post.imgUrl}" class="feed-post-img" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">
                `;
            }
            
            const commentCount = post.comments ? post.comments.length : 0;
            
            // YENİ: Silme butonu sadece post.authorId ile kendi sistem uid'in eşleşiyorsa görünecek
            let deleteBtnHtml = '';
            if (post.authorId === window.userProfile.uid) {
                deleteBtnHtml = `
                    <button class="feed-action-btn" style="color: #ef4444; margin-left: auto;" onclick="window.deleteConfession('${post.id}')">
                        🗑️ Sil
                    </button>
                `;
            }

            html += `
            <div class="feed-post">
                <div class="feed-post-header">
                    <div class="feed-post-avatar">${post.avatar}</div>
                    <div class="feed-post-meta">
                        <span class="feed-post-author">${post.user}</span>
                        <span class="feed-post-time">${post.time || 'Az önce'}</span>
                    </div>
                </div>
                
                <div class="feed-post-text">${post.text.replace(/\n/g, '<br>')}</div>
                
                ${imgHtml}
                
                <div class="feed-post-actions">
                    <button class="feed-action-btn" onclick="window.openConfessionDetail('${post.id}')">
                        💬 Yorum Yap veya Görüntüle (${commentCount})
                    </button>
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
        if(container) {
            container.insertAdjacentHTML('afterend', `<input type="hidden" id="active-post-id" value="${docId}">`);
        }
    };

    window.updateConfessionDetailLive = function(docId) {
        const container = document.getElementById('confession-detail-container');
        if(!container) {
            return;
        }

        const post = confessionsDB.find(p => p.id === docId);
        if(!post) { 
            container.innerHTML = "Gönderi bulunamadı veya silinmiş."; 
            return; 
        }
        
        let imgHtml = '';
        if(post.imgUrl) {
            imgHtml = `
                <img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:16px; max-height:300px; object-fit:contain; background:inherit; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">
            `;
        }
        
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
                
                <div style="font-size:16px; margin-bottom:16px; line-height:1.6; color:var(--text-dark);">
                    ${post.text.replace(/\n/g, '<br>')}
                </div>
                
                ${imgHtml}
            </div>
            
            <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-bottom:16px;">
                <h4 style="margin-bottom:12px; font-size:15px; font-weight:bold;">Yorumlar (${commentsArray.length})</h4>
                <div class="answers-container" style="max-height: 250px; overflow-y: auto; padding-right:5px;" id="conf-comments-scroll">
                    ${commentsHtml}
                </div>
            </div>
            
            <div style="display:flex; gap:10px; align-items:center; background:inherit; padding:10px; border-radius:12px; border:1px solid var(--border-color);">
                <input type="text" id="new-conf-comment" style="flex:1; border:none; outline:none; background:transparent; font-size:15px; color:var(--text-dark);" placeholder="Yorum yaz..." onkeypress="if(event.key==='Enter') window.submitConfessionComment('${post.id}')">
                <button class="btn-primary" style="width:auto; padding:8px 16px; border-radius:8px;" onclick="window.submitConfessionComment('${post.id}')">Gönder</button>
            </div>
        `;

        const scrollBox = document.getElementById('conf-comments-scroll');
        if(scrollBox) {
            scrollBox.scrollTop = scrollBox.scrollHeight;
        }
    };

    window.submitConfessionComment = async function(docId) {
        const input = document.getElementById('new-conf-comment');
        
        if(input && input.value.trim() !== '') {
            try {
                await updateDoc(doc(db, "confessions", docId), {
                    comments: arrayUnion({ 
                        user: window.userProfile.username || window.userProfile.name, 
                        text: input.value.trim() 
                    })
                });
            } catch(e) {
                alert("Yorum gönderilemedi: " + e.message);
            }
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
                    <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openQAForm()">
                        + Soru Sor
                    </button>
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
                    <option>Genel</option>
                    <option>Yurtlar</option>
                    <option>Ders</option>
                    <option>Kampüs Yaşamı</option>
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
        
        if(!textEl || textEl.value.trim() === '') {
            return;
        }
        
        btn.disabled = true;
        
        try {
            await addDoc(collection(db, "qa"), {
                avatar: window.userProfile.avatar, 
                user: window.userProfile.name, 
                time: "Şimdi", 
                tag: tagEl.value, 
                question: textEl.value, 
                answers: [], 
                createdAt: serverTimestamp()
            });
            window.closeModal();
        } catch(e) { 
            alert("Hata: Firebase kilitlerini kontrol edin."); 
            btn.disabled = false; 
        }
    };

    window.drawQAGrid = function(filterTag = 'Genel') {
        const feed = document.getElementById('qa-feed');
        if(!feed) {
            return;
        }
        
        let filteredDB = filterTag === 'Genel' ? qaDB : qaDB.filter(q => q.tag === filterTag);
        
        if(filteredDB.length === 0) { 
            feed.innerHTML = `
                <p style="text-align:center; padding: 30px 0; color:var(--text-gray);">
                    Bu kategoride henüz soru yok.
                </p>
            `; 
            return; 
        }

        let html = '';
        
        filteredDB.forEach((q) => {
            const statusClass = q.answers.length > 0 ? 'answered' : '';
            
            html += `
                <div class="qa-card" onclick="window.openQADetail('${q.id}')">
                    <div class="qa-left-stats">
                        <div class="qa-stat-box ${statusClass}">
                            <div style="font-size:18px;">${q.answers.length}</div>
                            <div style="font-weight:500;">Cevap</div>
                        </div>
                    </div>
                    <div class="qa-right-content">
                        <div class="qa-title">${q.question}</div>
                        <div class="qa-meta">
                            <span class="qa-tag">${q.tag}</span>
                            <span>Soran: <strong>${q.user}</strong></span>
                        </div>
                    </div>
                </div>`;
        });
        
        feed.innerHTML = html;
    };

    window.openQADetail = function(docId) {
        const q = qaDB.find(item => item.id === docId);
        if(!q) {
            return;
        }
        
        let answersHtml = '';
        
        if(q.answers.length === 0) {
            answersHtml = '<p style="text-align:center; padding:20px; color:var(--text-gray);">İlk cevap veren sen ol!</p>';
        } else {
            q.answers.forEach(ans => { 
                answersHtml += `
                    <div style="background:inherit; padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border-color);">
                        <div style="font-weight:bold; color:var(--primary); margin-bottom:6px;">${ans.user}</div>
                        <div style="font-size:15px;">${ans.text}</div>
                    </div>
                `; 
            });
        }

        window.openModal('Soru Detayı', `
            <div style="margin-bottom: 24px;">
                <span class="qa-tag" style="font-size:12px;">${q.tag}</span>
                <div style="font-size:18px; font-weight:800; margin-top:12px;">${q.question}</div>
            </div>
            
            <div style="border-top:1px solid var(--border-color); padding-top:24px; margin-bottom:24px;">
                <h4>Cevaplar (${q.answers.length})</h4>
                <div class="answers-container">
                    ${answersHtml}
                </div>
            </div>
            
            <div style="display:flex; gap:10px;">
                <input type="text" id="new-answer-input" class="form-group" style="flex:1; margin:0;" placeholder="Cevabını yaz...">
                <button class="btn-primary" style="width:auto;" onclick="window.submitAnswer('${q.id}')">Gönder</button>
            </div>
        `);
    };

    window.submitAnswer = async function(docId) {
        const ansInput = document.getElementById('new-answer-input');
        
        if(ansInput && ansInput.value.trim() !== '') {
            try { 
                await updateDoc(doc(db, "qa", docId), { 
                    answers: arrayUnion({ user: window.userProfile.name, text: ansInput.value.trim() }) 
                }); 
                window.closeModal(); 
            } catch(e) { 
                console.error(e); 
            }
        }
    };

    // ============================================================================
    // 10. FAKÜLTE SİSTEMİ
    // ============================================================================

    window.updateMyFacultiesSidebar = function() {
        const container = document.getElementById('my-joined-faculties');
        if(!container) {
            return;
        }
        
        let html = '';
        
        window.joinedFaculties.forEach(fac => { 
            html += `
                <div class="menu-item community-link" data-name="${fac.name}" data-icon="${fac.icon}" data-color="${fac.color}" onclick="window.handleFacultyClick('${fac.name}', '${fac.icon}', '${fac.color}')">
                    ${fac.icon} ${fac.name}
                </div>
            `; 
        });
        
        container.innerHTML = html;
    };

    window.handleFacultyClick = async function(name, icon, bgColor) {
        document.querySelectorAll('.menu-item[data-target]').forEach(m => m.classList.remove('active'));
        
        if(window.innerWidth <= 1024) {
            document.getElementById('sidebar').classList.remove('open');
        }

        const isJoined = window.joinedFaculties.some(f => f.name === name) || window.userProfile.faculty === name;

        if(isJoined) {
            window.loadFacultyFeed(name, icon, bgColor);
        } else {
            mainContent.innerHTML = `
                <div class="join-faculty-box">
                    <div class="icon">${icon}</div>
                    <h2>${name} Ağına Hoş Geldin</h2>
                    <p>Bu alan kapalı bir ağdır. Girmek için fakülte kodunu girmelisin.</p>
                    
                    <div style="max-width: 300px; margin: 0 auto 20px auto;">
                        <input type="text" id="faculty-passcode-input" class="form-group" style="width: 100%; text-align:center; font-size:18px; font-weight:bold; letter-spacing:2px; padding: 15px; border: 2px solid var(--border-color); border-radius: 12px; outline:none;" placeholder="Giriş Kodunu Yazın">
                    </div>
                    
                    <button class="btn-primary" style="max-width:250px; font-size:16px; padding:12px;" onclick="window.verifyFacultyCode('${name}', '${icon}', '${bgColor}')">
                        Ağa Katıl
                    </button>
                </div>
            `;
            window.scrollTo(0,0);
        }
    };

    window.verifyFacultyCode = async function(name, icon, bgColor) {
        const inputCode = document.getElementById('faculty-passcode-input').value.trim();
        
        if (inputCode.toLowerCase() === FACULTY_PASSCODES[name].toLowerCase()) {
            window.userProfile.faculty = name; 
            window.joinedFaculties = [{name: name, icon: icon, color: bgColor}]; 
            window.updateMyFacultiesSidebar();
            
            await updateDoc(doc(db, "users", window.userProfile.uid), { faculty: name });
            
            window.loadFacultyFeed(name, icon, bgColor);
        } else { 
            alert("Hatalı kod girdiniz. Lütfen tekrar deneyin."); 
        }
    };

    window.loadFacultyFeed = async function(name, icon, bgColor) {
        let totalMembers = 0; 
        let onlineMembers = 0;
        
        try {
            const q = query(collection(db, "users"), where("faculty", "==", name));
            const querySnapshot = await getDocs(q);
            totalMembers = querySnapshot.size;
            
            querySnapshot.forEach((doc) => { 
                if(doc.data().isOnline) {
                    onlineMembers++; 
                }
            });
        } catch (e) { 
            console.error(e); 
        }
        
        if(totalMembers === 0) totalMembers = 1; 
        if(onlineMembers === 0) onlineMembers = 1;

        mainContent.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div class="community-banner" style="background: ${bgColor};">
                    <div class="comm-banner-left">
                        <h1>${icon} ${name}</h1>
                        <p>Küresel Ağa Bağlısın</p>
                    </div>
                    <div class="comm-banner-right">
                        <div class="member-avatars">
                            <div class="avatar">👨‍💻</div>
                            <div class="avatar" style="background:white; color:var(--primary); font-size:11px; font-weight:bold;">
                                +${totalMembers}
                            </div>
                        </div>
                        <div class="community-stats">
                            <span class="online-dot"></span> Gerçek Çevrimiçi: ${onlineMembers}
                        </div>
                    </div>
                </div>
                <div class="create-post-box">
                    <div class="cp-top">
                        <div class="avatar" style="background:#F3F4F6; font-size:20px;">
                            ${window.userProfile.avatar}
                        </div>
                        <input type="text" placeholder="${name} ağında paylaşım yap..." onclick="alert('Bu özellik premium sürüme (v2) saklanmıştır.')">
                    </div>
                </div>
            </div>
        `;
    };

    // ============================================================================
    // 11. SAYFA YÖNLENDİRME (ROUTING) VE PROFİL YÖNETİMİ
    // ============================================================================

    window.loadPage = function(pageName) {
        if (pageName === 'home') {
            mainContent.innerHTML = getHomeContent();
        } else if (pageName === 'market') {
            window.renderListings('market', '🛒 Kampüs Market', 'market');
        } else if (pageName === 'housing') {
            window.renderListings('housing', '🔑 Ev Arkadaşı & Yurt', 'housing');
        } else if (pageName === 'confessions') {
            window.renderConfessions();
        } else if (pageName === 'qa') {
            window.renderQA(); 
        } else if (pageName === 'messages') {
            window.renderMessages(); 
        } else if (pageName === 'notifications') {
            window.renderNotifications();
        } else if (pageName === 'settings') {
            window.renderSettings();
        } else if (pageName === 'profile') {
            window.renderProfile();
        }
        
        if(window.innerWidth <= 1024 && document.getElementById('sidebar')) {
            document.getElementById('sidebar').classList.remove('open');
        }
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
        mainContent.innerHTML = `
            <div class="card">
                <h2>👤 Profil Bilgilerim</h2>
                <div style="background: inherit; padding: 24px; border-radius: 16px; border: 1px solid var(--border-color);">
                    <div class="grid-2col" style="margin-top:0;">
                        <div class="form-group">
                            <label>Ad</label>
                            <input type="text" id="prof-name" value="${window.userProfile.name}">
                        </div>
                        <div class="form-group">
                            <label>Soyad</label>
                            <input type="text" id="prof-surname" value="${window.userProfile.surname}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Kullanıcı Adı</label>
                        <div style="display:flex; align-items:center; background:inherit; border:1px solid #D1D5DB; border-radius:10px; overflow:hidden; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 0 3px rgba(79, 70, 229, 0.1)';" onblur="this.style.borderColor='#D1D5DB'; this.style.boxShadow='none';">
                            <span style="padding-left:12px; color:var(--primary); font-weight:800; font-size:16px;">#</span>
                            <input type="text" id="prof-username" value="${(window.userProfile.username || '').replace('#', '')}" placeholder="kullaniciadi" style="border:none; background:transparent; width:100%; padding:12px 8px; outline:none; font-size:15px; box-shadow:none; font-weight:600; color:var(--text-dark);">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Üniversite</label>
                        <input type="text" disabled value="${window.userProfile.university}" style="background:#E5E7EB; cursor:not-allowed;">
                    </div>
                    <div class="form-group">
                        <label>E-posta</label>
                        <input type="email" disabled value="${window.userProfile.email}" style="background:#E5E7EB; cursor:not-allowed;">
                    </div>
                    
                    <button class="btn-primary" onclick="window.saveProfile()" style="padding:12px; margin-bottom: 15px;">
                        Profilimi Kaydet
                    </button>
                    <button class="btn-danger" onclick="window.logout()">
                        🚪 Güvenli Çıkış Yap
                    </button>
                </div>
            </div>
        `;
    };

    window.saveProfile = async function() {
        const name = document.getElementById('prof-name').value; 
        const surname = document.getElementById('prof-surname').value;
        let rawUsername = document.getElementById('prof-username').value.trim().toLowerCase();
        
        if(!rawUsername) {
            alert("Kullanıcı adı boş bırakılamaz!");
            return;
        }
        
        rawUsername = rawUsername.replace(/^#/, '');
        const username = '#' + rawUsername;
        
        if(username !== window.userProfile.username) {
            try {
                const q = query(collection(db, "users"), where("username", "==", username));
                const snapshot = await getDocs(q);
                
                if(!snapshot.empty) {
                    alert("Bu kullanıcı adı başkası tarafından alınmış. Lütfen başka bir tane deneyin.");
                    return;
                }
            } catch(e) {
                console.error(e);
                alert("Bir hata oluştu, lütfen tekrar deneyin.");
                return;
            }
        }
        
        window.userProfile.name = name; 
        window.userProfile.surname = surname;
        window.userProfile.username = username;
        
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { 
                name: name, 
                surname: surname,
                username: username
            });
            window.openModal('Başarılı', `
                <div style="text-align:center;">
                    <p style="font-size:40px; margin:0;">✅</p>
                    <p>Profil güncellendi!</p>
                </div>
            `);
        } catch(e) {
            alert("Profil kaydedilirken hata: " + e.message);
        }
    };

    // YENİ: DİNAMİK VE ÇALIŞAN AYARLAR (DİL VE KARANLIK MOD BAĞLANTILI)
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

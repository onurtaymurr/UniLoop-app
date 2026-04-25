// ==========================================
// 1. FİREBASE YAPILANDIRMASI (Senin Verilerin)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDukYf45XqFM-trtEY2MdTY8thd8iXl20I",
  authDomain: "uniloop-app.firebaseapp.com",
  projectId: "uniloop-app",
  storageBucket: "uniloop-app.firebasestorage.app",
  messagingSenderId: "272654005890",
  appId: "1:272654005890:web:0b1dd388364e86d22f269b",
  measurementId: "G-PJ0XE1PXH5"
};

// Uygulama Çökmesin diye Try-Catch ile başlatıyoruz
try {
    firebase.initializeApp(firebaseConfig);
} catch(e) { console.error("Firebase Başlatma Hatası:", e); }

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

let currentUserData = null; 

// ==========================================
// 2. KAYIT VE MAİL ONAYI
// ==========================================
function toggleReg() { 
    document.getElementById('login-block').style.display = 'none'; 
    document.getElementById('reg-block').style.display = 'block'; 
}

function nextStep(step) { 
    document.querySelectorAll('.reg-step').forEach(e => e.classList.remove('active')); 
    document.getElementById('step-' + step).classList.add('active'); 
    document.getElementById('reg-prog').style.width = (step * 33.3) + '%'; 
}

let selectedFile = null;
function previewImage(event) {
    selectedFile = event.target.files[0];
    if(selectedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.innerHTML = '';
        }
        reader.readAsDataURL(selectedFile);
    }
}

async function registerUserToFirebase() {
    const email = document.getElementById('r-email').value;
    const pass = document.getElementById('r-pass').value;
    const name = document.getElementById('r-name').value;
    const age = document.getElementById('r-age').value;
    const dept = document.getElementById('r-dept').value;
    const classLevel = document.getElementById('r-class').value;
    const purpose = document.getElementById('r-purpose').value;
    
    const hobbies = [];
    document.querySelectorAll('.hobi-tag.selected').forEach(tag => hobbies.push(tag.innerText));

    if(!email || !pass || !name || !age || !dept || !classLevel) {
        alert("Lütfen tüm alanları doldurun!"); return;
    }
    if(hobbies.length < 3) {
        alert("Lütfen en az 3 hobi seçin!"); return;
    }

    document.getElementById('btn-register').innerText = "Kaydediliyor...";

    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        const user = userCred.user;
        await user.sendEmailVerification();

        let photoUrl = ""; 
        if(selectedFile) {
            const ref = storage.ref(`profile_images/${user.uid}`);
            await ref.put(selectedFile);
            photoUrl = await ref.getDownloadURL();
        }

        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            name: name,
            age: age,
            faculty: dept,
            classLevel: classLevel,
            purpose: purpose,
            hobbies: hobbies,
            photoUrl: photoUrl,
            elo: 1000, 
            lastVoteTime: null 
        });

        alert("Kayıt başarılı! Lütfen e-postanıza gelen doğrulama linkine tıklayın ve ardından giriş yapın.");
        window.location.reload();

    } catch(err) {
        alert("Kayıt Hatası: " + err.message);
        document.getElementById('btn-register').innerText = "Kayıt Ol";
    }
}

async function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    if(!email || !pass) { alert("E-posta ve şifre giriniz."); return; }

    try {
        const userCred = await auth.signInWithEmailAndPassword(email, pass);
        // İstersen mail doğrulama zorunluluğunu buradan açabilirsin:
        /* if(!userCred.user.emailVerified) {
            alert("Lütfen önce e-posta adresinizi doğrulayın!");
            auth.signOut(); return;
        } */
        
        const doc = await db.collection('users').doc(userCred.user.uid).get();
        currentUserData = doc.data() || {}; // Undefined hatasını önler
        
        enterApp();
    } catch(err) { alert("Giriş Hatası: Geçersiz bilgi."); }
}

function enterApp() { 
    document.getElementById('auth-screen').classList.remove('active'); 
    document.getElementById('app-container').classList.add('active'); 
    nav('discover', document.querySelector('.nav-btn')); 
}

// Oturum açık kalma kontrolü
auth.onAuthStateChanged(async (user) => {
    if(user) {
        const doc = await db.collection('users').doc(user.uid).get();
        if(doc.exists) {
            currentUserData = doc.data();
            enterApp();
        }
    }
});

// --- 3. SAYFA YÖNETİMİ ---
const appContent = document.getElementById('app-content');

function nav(page, btn) {
    closeChat(); 
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); 
    if(btn) btn.classList.add('active');
    
    if(page === 'discover') renderDiscover();
    if(page === 'tournament') renderTournament();
    if(page === 'messages') renderMessagesList();
    if(page === 'profile') renderProfile();
    if(page === 'voice') renderVoiceHome();
}

// --- 4. SIFIR "UNDEFINED" VE PÜRÜZSÜZ KEŞFET ---
async function renderDiscover() {
    appContent.innerHTML = `<h3 style="text-align:center; margin-top:50px; color:#1e293b;">Kullanıcılar Çekiliyor...</h3>`;
    
    try {
        const snapshot = await db.collection('users').where('uid', '!=', auth.currentUser.uid).limit(15).get();
        
        if(snapshot.empty) {
            appContent.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fa-solid fa-ghost" style="font-size:50px; color:#ccc;"></i><h3 style="margin-top:20px; color:#666;">Şu an yeni kullanıcı yok.</h3></div>`;
            return;
        }

        let zIndex = snapshot.docs.length;

        appContent.innerHTML = `
            <div class="tinder-wrapper">
                <div class="tinder-cards-container" id="cards-container"></div>
                <div style="display: flex; gap: 30px; margin-top: 10px;">
                    <button onclick="forceSwipe(-1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #EF4444; font-size: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                    <button onclick="forceSwipe(1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor:pointer;"><i class="fa-solid fa-heart"></i></button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('cards-container');

        snapshot.forEach(doc => {
            const u = doc.data();
            // FALLBACKS (Sıfır undefined)
            const name = u.name || "Anonim";
            const age = u.age || "--";
            const dept = u.faculty || u.dept || "Bölüm Belirtilmedi";
            const hobbies = u.hobbies || ["Sosyalleşmek"];
            const displayImg = u.photoUrl ? u.photoUrl : `https://ui-avatars.com/api/?name=${name}&background=4A00E0&color=fff&size=512`;
            
            const card = document.createElement('div');
            card.className = 'user-card';
            card.style.zIndex = zIndex--;
            card.dataset.uid = u.uid;
            
            card.innerHTML = `
                <img src="${displayImg}" alt="Profil">
                <div class="swipe-stamp stamp-like">BEĞEN</div>
                <div class="swipe-stamp stamp-nope">PAS</div>
                <div class="info">
                    <h3>${name}, ${age}</h3>
                    <p style="font-size:15px; margin-bottom:10px;"><i class="fa-solid fa-graduation-cap"></i> ${dept}</p>
                    <div class="tags">${hobbies.map(t => `<span style="background:rgba(255,255,255,0.2); padding:5px 10px; border-radius:15px; font-size:12px; margin-right:5px; display:inline-block;">${t}</span>`).join('')}</div>
                </div>
            `;
            container.appendChild(card);
            attachDrag(card);
        });

    } catch(err) { appContent.innerHTML = `<p style="text-align:center; padding:20px;">Hata: ${err.message}</p>`; }
}

function attachDrag(card) {
    let sX = 0, cX = 0, drag = false;
    const start = e => { drag=true; sX = e.pageX||e.touches[0].pageX; card.classList.add('moving'); card.classList.remove('resetting'); };
    const move = e => {
        if(!drag) return; 
        cX = (e.pageX||e.touches[0].pageX)-sX; 
        card.style.transform=`translateX(${cX}px) rotate(${cX*0.04}deg)`; // Yavaş dönüş
        if(cX>0){ card.querySelector('.stamp-like').style.opacity=cX/120; card.querySelector('.stamp-nope').style.opacity=0; }
        else { card.querySelector('.stamp-nope').style.opacity=Math.abs(cX)/120; card.querySelector('.stamp-like').style.opacity=0; }
    };
    const end = () => {
        drag=false; card.classList.remove('moving');
        if(cX>100) sOut(card,1); else if(cX<-100) sOut(card,-1);
        else { card.classList.add('resetting'); card.style.transform=''; card.querySelector('.stamp-like').style.opacity=0; card.querySelector('.stamp-nope').style.opacity=0; }
    };
    card.addEventListener('mousedown',start); card.addEventListener('touchstart',start,{passive:true});
    document.addEventListener('mousemove',move); document.addEventListener('touchmove',move,{passive:true});
    document.addEventListener('mouseup',end); document.addEventListener('touchend',end);
}

function sOut(c, d) { 
    c.style.transition = '0.6s cubic-bezier(0.2,0.8,0.2,1)'; 
    c.style.transform = `translateX(${d*1000}px) rotate(${d*30}deg)`; 
    setTimeout(()=>c.remove(), 600); 
    
    // Swipe kaydı
    const targetUid = c.dataset.uid;
    db.collection('swipes').add({
        from: auth.currentUser.uid,
        to: targetUid,
        type: d === 1 ? 'like' : 'pass',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}
function forceSwipe(d) { const c = document.querySelectorAll('.user-card'); if(c.length) sOut(c[c.length-1], d); }

// --- 5. TURNUVA ---
async function renderTournament() {
    appContent.innerHTML = `<h3 style="text-align:center; margin-top:50px;">Turnuva Yükleniyor...</h3>`;
    
    const now = new Date().getTime();
    const lastVote = currentUserData.lastVoteTime ? (currentUserData.lastVoteTime.toMillis ? currentUserData.lastVoteTime.toMillis() : currentUserData.lastVoteTime) : 0;
    const diffHours = (now - lastVote) / (1000 * 60 * 60);
    
    if(diffHours < 12) {
        const remainingHours = Math.floor(12 - diffHours);
        appContent.innerHTML = `
            <div style="display:flex; justify-content:center; padding:20px;">
                <div class="timer-box">
                    <i class="fa-solid fa-clock" style="font-size:40px; color:#FFD700;"></i>
                    <h3 style="margin-top:15px; color:white;">Oylama Kilitli</h3>
                    <p style="color:#ccc; font-size:14px;">Günde 2 kez oylama yapabilirsin.</p>
                    <h2>${remainingHours} Saat</h2>
                    <p style="color:#ccc; font-size:14px;">sonra tekrar gel!</p>
                </div>
            </div>
            ${await renderPopularsHtml()}
        `;
        return;
    }

    try {
        const snapshot = await db.collection('users').where('uid', '!=', auth.currentUser.uid).limit(10).get();
        const users = [];
        snapshot.forEach(doc => users.push(doc.data()));
        
        if(users.length < 2) {
            appContent.innerHTML = `<p style="text-align:center; margin-top:20px;">Yeterli kullanıcı yok.</p>`;
            return;
        }

        const u1 = users[0]; const u2 = users[1]; 
        const n1 = u1.name || "Anonim"; const n2 = u2.name || "Anonim";
        const img1 = u1.photoUrl || `https://ui-avatars.com/api/?name=${n1}`;
        const img2 = u2.photoUrl || `https://ui-avatars.com/api/?name=${n2}`;

        appContent.innerHTML = `
            <div class="tourney-container">
                <p style="color:#64748b; font-size:15px; margin-bottom:10px;">En Çekici Olanı Seç!</p>
                <div class="t-card-wrap">
                    <div class="t-card" onclick="castVote('${u1.uid}')"><img src="${img1}"><div class="t-card-name">${n1}</div></div>
                    <div class="vs-badge">VS</div>
                    <div class="t-card" onclick="castVote('${u2.uid}')"><img src="${img2}"><div class="t-card-name">${n2}</div></div>
                </div>
            </div>
            ${await renderPopularsHtml()}
        `;
    } catch(err) { console.error(err); }
}

async function renderPopularsHtml() {
    const popSnap = await db.collection('users').orderBy('elo', 'desc').limit(4).get();
    let popHtml = `<div class="popular-row-title">Haftanın Popülerleri <i class="fa-solid fa-fire" style="color:#EF4444;"></i></div><div class="popular-row">`;
    popSnap.forEach(doc => {
        const u = doc.data();
        const name = u.name || "Anonim";
        const img = u.photoUrl || `https://ui-avatars.com/api/?name=${name}`;
        popHtml += `
            <div class="pop-card">
                <img src="${img}">
                <div style="position:absolute; bottom:0; width:100%; background:rgba(0,0,0,0.7); color:white; font-size:12px; font-weight:bold; text-align:center; padding:5px;">${name}</div>
            </div>
        `;
    });
    popHtml += `</div>`;
    return popHtml;
}

async function castVote(winnerUid) {
    try {
        await db.collection('users').doc(winnerUid).update({ elo: firebase.firestore.FieldValue.increment(25) });
        await db.collection('users').doc(auth.currentUser.uid).update({ lastVoteTime: firebase.firestore.FieldValue.serverTimestamp() });
        currentUserData.lastVoteTime = new Date().getTime();
        renderTournament(); 
    } catch(err) { alert("Hata: " + err.message); }
}

// --- 6. MESAJLAŞMA (Z-INDEX HATASI ÇÖZÜLDÜ) ---
let currentChatUnsubscribe = null;

async function renderMessagesList() {
    appContent.innerHTML = `<h3 style="text-align:center; margin-top:30px;">Sohbetler Yükleniyor...</h3>`;
    const snapshot = await db.collection('users').where('uid', '!=', auth.currentUser.uid).limit(5).get();
    
    let html = `<div style="padding: 15px;"><h2 style="color: #1e293b; margin-bottom: 15px;">Sohbetler</h2>`;
    snapshot.forEach(doc => {
        const u = doc.data();
        const name = u.name || "Anonim";
        const img = u.photoUrl || `https://ui-avatars.com/api/?name=${name}`;
        html += `
            <div onclick="openChat('${u.uid}', '${name}', '${img}')" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); margin-bottom:10px; cursor:pointer;">
                <img src="${img}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1; margin-left: 15px;">
                    <h4 style="color: #1e293b; font-size: 16px;">${name}</h4>
                    <p style="color: #64748b; font-size: 13px;">Sohbete başlamak için dokun...</p>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    appContent.innerHTML = html;
}

function openChat(targetUid, targetName, targetImg) {
    // Chat Screen fixed on top of everything
    const html = `
        <div class="chat-screen" id="active-chat">
            <div class="chat-header">
                <i class="fa-solid fa-arrow-left" style="font-size: 22px; cursor: pointer; color: #1e293b; margin-right: 15px; padding: 10px;" onclick="closeChat()"></i>
                <img src="${targetImg}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
                <h3 style="color: #1e293b; font-size: 18px;">${targetName}</h3>
            </div>
            <div class="chat-messages" id="chat-msgs"></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" style="flex: 1; padding: 15px; border: 1px solid #eee; border-radius: 25px; outline: none;" placeholder="Mesaj yaz..." onkeypress="if(event.key === 'Enter') sendMsg('${targetUid}')">
                <button onclick="sendMsg('${targetUid}')" style="background: #4A00E0; color: white; border: none; width: 50px; height: 50px; border-radius: 50%;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html); // Direk body'e atıyoruz ki her şeyin üstünde çıksın

    const chatId = [auth.currentUser.uid, targetUid].sort().join('_'); 
    currentChatUnsubscribe = db.collection('messages').doc(chatId).collection('chats').orderBy('timestamp')
        .onSnapshot(snapshot => {
            const container = document.getElementById('chat-msgs');
            if(!container) return;
            container.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.sender === auth.currentUser.uid;
                container.innerHTML += `<div class="bubble ${isMe ? 'sent' : 'received'}">${msg.text}</div>`;
            });
            container.scrollTop = container.scrollHeight;
        });
}

function closeChat() {
    if(currentChatUnsubscribe) currentChatUnsubscribe(); 
    const chat = document.getElementById('active-chat');
    if(chat) chat.remove();
}

async function sendMsg(targetUid) {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    input.value = '';

    const chatId = [auth.currentUser.uid, targetUid].sort().join('_');
    await db.collection('messages').doc(chatId).collection('chats').add({
        text: text,
        sender: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// --- 7. DİKDÖRTGEN PROFİL ---
function renderProfile() {
    const name = currentUserData.name || "Anonim";
    const age = currentUserData.age || "--";
    const dept = currentUserData.faculty || currentUserData.dept || "Bölüm Belirtilmedi";
    const classLvl = currentUserData.classLevel || "";
    const purpose = currentUserData.purpose || "Keşfetmek";
    const elo = currentUserData.elo || 1000;
    const hobbies = currentUserData.hobbies || ["Eğlence"];
    const img = currentUserData.photoUrl || `https://ui-avatars.com/api/?name=${name}&background=4A00E0&color=fff&size=512`;

    const tagsHtml = hobbies.map(t => `<span style="background: rgba(74,0,224,0.1); color: #4A00E0; padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; margin-right:5px; display:inline-block; margin-bottom:5px;">${t}</span>`).join('');
    
    appContent.innerHTML = `
        <div style="padding: 20px; display: flex; flex-direction: column; align-items: center;">
            <div class="profile-rect-header">
                <img src="${img}">
                <div class="profile-info">
                    <h3>${name}</h3>
                    <p style="font-weight:bold; color:#4A00E0;">${age} Yaş</p>
                    <p><i class="fa-solid fa-graduation-cap"></i> ${dept} / ${classLvl}</p>
                    <p><i class="fa-solid fa-bullseye"></i> ${purpose}</p>
                </div>
            </div>

            <div style="width: 90%; max-width: 400px; text-align: left; margin-bottom: 20px;">
                <p style="color:#1e293b; font-weight:800; margin-bottom:10px;">Hobilerin</p>
                ${tagsHtml}
            </div>

            <div style="display: flex; gap: 15px; width: 90%; max-width: 400px; margin-bottom: 30px;">
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #4A00E0; font-size: 24px;">${elo}</h3>
                    <p style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 5px;">Popülerlik</p>
                </div>
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #4CAF50; font-size: 24px;">0</h3>
                    <p style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 5px;">Arkadaşlarım</p>
                </div>
            </div>
            
            <button onclick="auth.signOut(); location.reload();" style="width: 90%; max-width: 400px; padding: 15px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 15px; font-weight: bold; cursor: pointer;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Çıkış Yap</button>
        </div>
    `;
}

// --- 8. BLINDTALK ---
function renderVoiceHome() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 20px;">
            <i class="fa-solid fa-mask" style="font-size: 80px; color: #4A00E0; margin-bottom: 20px;"></i>
            <h2 style="color: #1e293b; font-size: 28px;">BlindTalk Odası</h2>
            <p style="color: #64748b; margin-top: 15px; font-size: 16px; max-width: 80%;">Dış görünüş yok, sadece sesin var.</p>
            <button onclick="appContent.innerHTML='<h3>Bağlanılıyor...</h3>'" style="margin-top: 40px; padding: 18px 50px; background: #4A00E0; color: white; border: none; border-radius: 30px; font-weight: 900; font-size: 18px; cursor: pointer;">Rastgele Bağlan</button>
        </div>
    `;
}

// --- 1. FIREBASE GERÇEK YAPILANDIRMASI ---
// UYARI: BURAYA KENDİ FİREBASE BİLGİLERİNİ YAPIŞTIRMALISIN
const firebaseConfig = {
    apiKey: "SENIN_API_KEY",
    authDomain: "uniloop.firebaseapp.com",
    projectId: "uniloop",
    storageBucket: "uniloop.appspot.com",
    messagingSenderId: "12345",
    appId: "1:12345:web:abc"
};
// Firebase'i Başlat (Eğer config girdiysen yorumları kaldır)
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const storage = firebase.storage();
// const auth = firebase.auth();

// Yerel Simülasyon Veritabanı (Bağlantı kurulana kadar çalışması için)
const usersDB = [
    { id: 1, name: "Ceren", age: 21, dept: "Yazılım Mühendisliği", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", tags: ["Kodlama", "Kahve", "Müzik"], elo: 1450 },
    { id: 2, name: "Aylin", age: 20, dept: "Mimarlık ve Tasarım", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", tags: ["Sanat", "Sinema", "Gezi"], elo: 1800 },
    { id: 3, name: "Melis", age: 22, dept: "Hukuk Fakültesi", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", tags: ["Yoga", "Kitap"], elo: 1550 },
    { id: 4, name: "Burcu", age: 21, dept: "Tıp Fakültesi", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400", tags: ["Müzik", "Spor"], elo: 1620 }
];

let activeUser = { name: "", age: null, dept: "", purpose: "", tags: [], elo: 1000, img: "https://via.placeholder.com/150", file: null };

// --- 2. GERÇEK KAYIT VE FOTOĞRAF YÜKLEME ---
function toggleReg() { document.getElementById('login-block').style.display = 'none'; document.getElementById('reg-block').style.display = 'block'; }
function nextStep(step) { document.querySelectorAll('.reg-step').forEach(e => e.classList.remove('active')); document.getElementById('step-' + step).classList.add('active'); document.getElementById('reg-prog').style.width = (step * 33) + '%'; }

function previewImage(event) {
    const file = event.target.files[0];
    if(file) {
        activeUser.file = file; // Firebase'e göndermek için dosyayı tut
        const reader = new FileReader();
        reader.onload = function(e) {
            activeUser.img = e.target.result;
            const preview = document.getElementById('photo-preview');
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.innerHTML = '';
        }
        reader.readAsDataURL(file);
    }
}

async function registerUserToFirebase() {
    document.getElementById('btn-register').innerText = "Kaydediliyor...";
    activeUser.name = document.getElementById('r-name').value;
    activeUser.age = document.getElementById('r-age').value;
    activeUser.dept = document.getElementById('r-dept').value;
    activeUser.purpose = document.getElementById('r-purpose').value;
    document.querySelectorAll('.hobi-tag.selected').forEach(t => activeUser.tags.push(t.innerText));

    /* GERÇEK FİREBASE KODU (Config girince aktif et)
    try {
        // 1. Kullanıcıyı oluştur
        const email = document.getElementById('r-email').value;
        const pass = document.getElementById('r-pass').value;
        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        const uid = userCred.user.uid;

        // 2. Fotoğrafı Storage'a yükle (Kurallarına uygun, max 5MB)
        let photoUrl = "";
        if(activeUser.file) {
            const ref = storage.ref(`profile_images/${uid}`);
            await ref.put(activeUser.file);
            photoUrl = await ref.getDownloadURL();
            activeUser.img = photoUrl;
        }

        // 3. Veriyi Firestore'a kaydet
        await db.collection('users').doc(uid).set({
            name: activeUser.name, age: activeUser.age, dept: activeUser.dept,
            purpose: activeUser.purpose, tags: activeUser.tags, elo: 1000, img: photoUrl
        });

        enterApp();
    } catch(err) { alert("Kayıt Hatası: " + err.message); }
    */

    // Şimdilik direkt uygulamaya gir (Firebase bağlı değilse)
    enterApp();
}

function loginUser() { enterApp(); }

function enterApp() { 
    document.getElementById('auth-screen').classList.remove('active'); 
    document.getElementById('app-container').classList.add('active'); 
    nav('discover', document.querySelector('.nav-btn')); 
}

// --- 3. SAYFA YÖNETİMİ ---
const appContent = document.getElementById('app-content');

function nav(page, btn) {
    closeChat(); // Sekme değişirse açık mesaj ekranını kapat
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active');
    
    if(page === 'discover') renderDiscover();
    if(page === 'tournament') renderTournament('vote');
    if(page === 'messages') renderMessagesList();
    if(page === 'profile') renderProfile();
    if(page === 'voice') renderVoiceHome();
}

// --- 4. TAM BOYUT KEŞFET (SWIPE) ---
function renderDiscover() {
    appContent.innerHTML = `
        <div class="tinder-wrapper">
            <div class="tinder-cards-container" id="cards-container"></div>
            <div style="display: flex; gap: 30px; margin-top: 10px;">
                <button onclick="forceSwipe(-1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #EF4444; font-size: 30px; box-shadow: 0 10px 20px rgba(239,68,68,0.2); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <button onclick="forceSwipe(1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 30px; box-shadow: 0 10px 20px rgba(76,175,80,0.2); cursor:pointer;"><i class="fa-solid fa-heart"></i></button>
            </div>
        </div>
    `;
    const container = document.getElementById('cards-container');
    [...usersDB].reverse().forEach((u, i) => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.zIndex = i;
        card.innerHTML = `
            <img src="${u.image}">
            <div class="swipe-stamp stamp-like">BEĞEN</div>
            <div class="swipe-stamp stamp-nope">PAS</div>
            <div class="info">
                <h3>${u.name}, ${u.age}</h3>
                <p style="font-size:16px; margin-bottom:10px;"><i class="fa-solid fa-graduation-cap"></i> ${u.dept}</p>
                <div class="tags">${u.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        `;
        container.appendChild(card);
        attachDrag(card);
    });
}

function attachDrag(card) {
    let sX = 0, cX = 0, drag = false;
    const start = e => { drag=true; sX = e.pageX||e.touches[0].pageX; card.classList.add('moving'); card.classList.remove('resetting'); };
    const move = e => {
        if(!drag) return; cX = (e.pageX||e.touches[0].pageX)-sX; card.style.transform=`translateX(${cX}px) rotate(${cX*0.08}deg)`;
        if(cX>0){ card.querySelector('.stamp-like').style.opacity=cX/100; card.querySelector('.stamp-nope').style.opacity=0; }
        else { card.querySelector('.stamp-nope').style.opacity=Math.abs(cX)/100; card.querySelector('.stamp-like').style.opacity=0; }
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
    c.style.transition = '0.5s cubic-bezier(0.25,0.8,0.25,1)'; 
    c.style.transform = `translateX(${d*1000}px) rotate(${d*45}deg)`; 
    setTimeout(()=>c.remove(), 500); 
    // BURAYA FİREBASE SWIPE KODU YAZILACAK db.collection('swipes').add(...)
}
function forceSwipe(d) { const c = document.querySelectorAll('.user-card'); if(c.length) sOut(c[c.length-1], d); }

// --- 5. GELİŞTİRİLMİŞ TURNUVA (SEÇİLME EFEKTİ) ---
function renderTournament(tab) {
    let content = '';
    if (tab === 'vote') {
        const u1 = usersDB[0], u2 = usersDB[1]; // Örnek iki kişi
        content = `
            <p style="color:#64748b; font-size:15px; margin-bottom:10px;">Daha çekici olanı seç, Popülerliği belirle!</p>
            <div class="t-card-wrap">
                <div class="t-card" id="tcard-${u1.id}" onclick="voteTourney(${u1.id}, ${u2.id})">
                    <img src="${u1.image}"><div class="t-card-name">${u1.name}</div>
                </div>
                <div class="vs-badge">VS</div>
                <div class="t-card" id="tcard-${u2.id}" onclick="voteTourney(${u2.id}, ${u1.id})">
                    <img src="${u2.image}"><div class="t-card-name">${u2.name}</div>
                </div>
            </div>
        `;
    } else {
        let sorted = [...usersDB].sort((a,b) => b.elo - a.elo);
        content = `<div style="text-align:left; padding:0 15px; margin-top:15px;">
            <h3 style="color:#1e293b; margin-bottom:15px;">Kampüs Liderleri</h3>
            ${sorted.map((u, i) => `
                <div style="display:flex; align-items:center; padding:12px; background:white; border-radius:15px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                    <span style="font-weight:900; font-size:20px; color:${i===0?'#FFD700':(i===1?'#C0C0C0':'#CD7F32')}; width:35px;">#${i+1}</span>
                    <img src="${u.image}" style="width:45px; height:45px; border-radius:50%; object-fit:cover; margin-right:15px;">
                    <div style="flex:1; font-weight:bold; color:#1e293b; font-size:16px;">${u.name}</div>
                    <div style="color:#4A00E0; font-weight:900;"><i class="fa-solid fa-fire"></i> ${u.elo}</div>
                </div>
            `).join('')}
        </div>`;
    }
    appContent.innerHTML = `
        <div class="tourney-container">
            <div class="tourney-toggle">
                <button class="${tab==='vote'?'active':''}" onclick="renderTournament('vote')">Oylama</button>
                <button class="${tab==='board'?'active':''}" onclick="renderTournament('board')">Haftanın Popülerleri</button>
            </div>
            ${content}
        </div>
    `;
}

function voteTourney(winnerId, loserId) {
    const wCard = document.getElementById(`tcard-${winnerId}`);
    const lCard = document.getElementById(`tcard-${loserId}`);
    
    // Animasyon Efektleri
    wCard.classList.add('selected-winner');
    lCard.classList.add('selected-loser');

    const winner = usersDB.find(u => u.id === winnerId);
    if(winner) winner.elo += 15; // Gerçekte Firebase'e db.collection('users').doc(winnerId).update({ elo: firebase.firestore.FieldValue.increment(15) })
    
    setTimeout(() => renderTournament('vote'), 1000); // 1 saniye efekti göster sonra yenile
}

// --- 6. ÇALIŞAN MESAJLAR SİSTEMİ ---
function renderMessagesList() {
    appContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Sohbetler</h2>
            <div onclick="openChat()" style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); cursor:pointer;">
                <img src="${usersDB[0].image}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1; margin-left: 15px;">
                    <h4 style="color: #1e293b; font-size: 18px;">${usersDB[0].name}</h4>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 600;">Son mesaj burada görünecek...</p>
                </div>
            </div>
        </div>
    `;
}

function openChat() {
    const html = `
        <div class="chat-screen" id="active-chat">
            <div class="chat-header">
                <i class="fa-solid fa-arrow-left" style="font-size: 22px; cursor: pointer; color: #1e293b; margin-right: 15px; padding: 10px;" onclick="closeChat()"></i>
                <img src="${usersDB[0].image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
                <h3 style="color: #1e293b; font-size: 18px;">${usersDB[0].name}</h3>
            </div>
            <div class="chat-messages" id="chat-msgs">
                <div class="bubble received">Selam! Uygulamada yeni eşleştik galiba? ✌️</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" style="flex: 1; padding: 15px; border: 1px solid #eee; border-radius: 25px; background: #f8fafc; outline: none; font-size:15px;" placeholder="Mesaj yaz..." onkeypress="if(event.key === 'Enter') sendMsg()">
                <button onclick="sendMsg()" style="background: #4A00E0; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; font-size:18px;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
}

function closeChat() {
    const chat = document.getElementById('active-chat');
    if(chat) chat.remove();
}

function sendMsg() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    // Arayüze Ekle
    const container = document.getElementById('chat-msgs');
    container.innerHTML += `<div class="bubble sent">${msg}</div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // GERÇEK FİREBASE KODU BURAYA GELECEK:
    // db.collection('messages').add({ text: msg, sender: auth.currentUser.uid, timestamp: firebase.firestore.FieldValue.serverTimestamp() })
}

// --- 7. GERÇEKÇİ BLINDTALK (MİKROFON İSTEKLİ) ---
function renderVoiceHome() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 20px;">
            <i class="fa-solid fa-mask" style="font-size: 80px; color: #4A00E0; margin-bottom: 20px;"></i>
            <h2 style="color: #1e293b; font-size: 28px;">BlindTalk Odası</h2>
            <p style="color: #64748b; margin-top: 15px; font-size: 16px; max-width: 80%;">Dış görünüş yok, sadece sesin var. Eşleştiğinde mikrofonun açılacak.</p>
            <button onclick="requestMicAndSearch()" style="margin-top: 40px; padding: 18px 50px; background: #4A00E0; color: white; border: none; border-radius: 30px; font-weight: 900; font-size: 18px; cursor: pointer; box-shadow: 0 10px 20px rgba(74,0,224,0.3);">Rastgele Bağlan</button>
        </div>
    `;
}

// Gerçek Mikrofon İzni İstemesi
function requestMicAndSearch() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            // İzin alındı, Arama ekranına geç
            showSearchingScreen();
            // TODO: WebRTC Stream'i burada bağlanacak
        })
        .catch(function(err) {
            alert("Mikrofon izni reddedildi! Görüşme yapabilmek için izin vermelisin.");
        });
    } else {
        alert("Tarayıcın mikrofonu desteklemiyor.");
        showSearchingScreen(); // Test amaçlı yinede geç
    }
}

function showSearchingScreen() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
            <div class="cool-radar">
                <div class="core"><i class="fa-solid fa-microphone"></i></div>
                <div class="ring"></div><div class="ring"></div><div class="ring"></div>
            </div>
            <h3 style="margin-top: 30px; color: #1e293b; font-size:22px;">Bağlantı Kuruluyor...</h3>
        </div>
    `;
    
    // Gerçek bir backend ile db.collection('voice_queues').add() atılır
    setTimeout(() => {
        appContent.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px; text-align: center;">
                <h3 style="color: #4CAF50; font-size: 28px; margin-bottom: 30px;">Bağlandı!</h3>
                <i class="fa-solid fa-wave-square" style="font-size: 60px; color: #4A00E0; margin-bottom: 40px; animation: pulse 1s infinite alternate;"></i>
                <button onclick="alert('Maske İndirme İsteği Gönderildi. Karşı tarafın onayı bekleniyor...');" style="width: 100%; max-width: 250px; padding: 18px; background: #FFD700; color: #1e293b; border: none; border-radius: 20px; font-weight: 900; font-size: 16px; margin-bottom: 15px; cursor: pointer;"><i class="fa-solid fa-unlock"></i> Maskeyi İndir</button>
                <button onclick="renderVoiceHome()" style="width: 100%; max-width: 250px; padding: 18px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 20px; font-weight: 900; font-size: 16px; cursor: pointer;">Görüşmeyi Bitir</button>
            </div>
        `;
    }, 3000);
}

// --- 8. PROFİL KARTI ---
function renderProfile() {
    appContent.innerHTML = `
        <div style="padding: 30px 20px; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 100%; max-width: 350px; height: 450px; position: relative;">
                <div class="user-card" style="box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
                    <img src="${activeUser.img}">
                    <div class="info">
                        <h3>${activeUser.name}, ${activeUser.age}</h3>
                        <p><i class="fa-solid fa-graduation-cap"></i> ${activeUser.dept}</p>
                        <div class="tags">${activeUser.tags.map(t => `<span>${t}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
            <button onclick="location.reload()" style="margin-top: 30px; width: 100%; max-width: 350px; padding: 18px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 20px; font-weight: 900; font-size: 16px; cursor: pointer;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Çıkış Yap</button>
        </div>
    `;
}

// --- SAHTE VERİTABANI ---
const usersDB = [
    { id: 1, name: "Ceren", age: 21, dept: "Yazılım Mühendisliği", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", tags: ["Kodlama", "Kahve", "Müzik"], elo: 1450 },
    { id: 2, name: "Aylin", age: 20, dept: "Mimarlık ve Tasarım", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", tags: ["Sanat", "Sinema", "Gezi"], elo: 1800 },
    { id: 3, name: "Melis", age: 22, dept: "Hukuk Fakültesi", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", tags: ["Yoga", "Kitap", "Girişimcilik"], elo: 1550 },
    { id: 4, name: "Burcu", age: 21, dept: "Tıp Fakültesi", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400", tags: ["Müzik", "Gezi", "Spor"], elo: 1620 }
];

// OLUŞTURULAN KULLANICI
let activeUser = { name: "Anonim", age: 20, dept: "Fakülte", purpose: "Arkadaş", tags: [], elo: 1000, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" };

// --- 1. KAYIT İŞLEMLERİ ---
function toggleReg() { document.getElementById('login-block').style.display = 'none'; document.getElementById('reg-block').style.display = 'block'; }
function nextStep(step) { document.querySelectorAll('.reg-step').forEach(e => e.classList.remove('active')); document.getElementById('step-' + step).classList.add('active'); document.getElementById('reg-prog').style.width = (step * 25) + '%'; }

function finishReg() {
    activeUser.name = document.getElementById('r-name').value || "Kullanıcı";
    activeUser.age = document.getElementById('r-age').value || 20;
    activeUser.dept = document.getElementById('r-dept').value || "Belirtilmedi";
    activeUser.purpose = document.getElementById('r-purpose').value;
    document.querySelectorAll('.hobi-tag.selected').forEach(t => activeUser.tags.push(t.innerText));
    if(activeUser.tags.length === 0) activeUser.tags = ["Eğlence"];

    // Animasyonlu Kartı Göster
    const cardHtml = generateUserCardHtml(activeUser);
    document.getElementById('generated-card-container').innerHTML = cardHtml;
    document.getElementById('welcome-modal').classList.add('active');
}

function closeWelcome() {
    document.getElementById('welcome-modal').classList.remove('active');
    enterApp();
}

function enterApp() { 
    document.getElementById('auth-screen').classList.remove('active'); 
    document.getElementById('app-container').classList.add('active'); 
    nav('discover', document.querySelector('.nav-btn')); 
}

// Ortak Kullanıcı Kartı HTML Üreticisi (Keşfet ve Profil için)
function generateUserCardHtml(u) {
    return `
        <div class="user-card">
            <img src="${u.img || u.image}" alt="">
            <div class="info">
                <h3>${u.name}, ${u.age}</h3>
                <p><i class="fa-solid fa-graduation-cap"></i> ${u.dept}</p>
                <div class="tags">${u.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        </div>
    `;
}

// --- 2. SAYFA YÖNLENDİRİCİSİ (SABİT KALMA HATASI ÇÖZÜLDÜ) ---
const appContent = document.getElementById('app-content');

function nav(page, btn) {
    // AÇIK CHAT VARSA KAPAT (Bug fix)
    const activeChat = document.getElementById('active-chat');
    if(activeChat) activeChat.remove();

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active');
    
    if(page === 'discover') renderDiscover();
    if(page === 'tournament') renderTournament('vote');
    if(page === 'messages') renderMessagesList();
    if(page === 'profile') renderProfile();
    if(page === 'voice') renderVoiceHome();
}

// --- 3. KEŞFET (SWIPE) ---
function renderDiscover() {
    appContent.innerHTML = `
        <div class="tinder-cards-container" id="cards-container"></div>
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
            <button onclick="forceSwipe(-1)" style="width: 60px; height: 60px; border-radius: 50%; border:none; background: white; color: #EF4444; font-size: 26px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            <button onclick="forceSwipe(1)" style="width: 60px; height: 60px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 26px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor:pointer;"><i class="fa-solid fa-heart"></i></button>
        </div>
    `;
    const container = document.getElementById('cards-container');
    let deck = [...usersDB].reverse();

    deck.forEach((user, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'tinder-card';
        wrapper.style.zIndex = index;
        wrapper.innerHTML = `
            ${generateUserCardHtml(user)}
            <div class="swipe-stamp stamp-like">BEĞEN</div>
            <div class="swipe-stamp stamp-nope">PAS</div>
        `;
        container.appendChild(wrapper);
        attachSmoothDrag(wrapper);
    });
}

function attachSmoothDrag(card) {
    let startX = 0, currentX = 0, isDragging = false;
    const start = (e) => { isDragging = true; startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX; card.classList.add('moving'); card.classList.remove('resetting'); };
    const drag = (e) => {
        if (!isDragging) return;
        currentX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX) - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.08}deg)`;
        if(currentX > 0) { card.querySelector('.stamp-like').style.opacity = currentX/100; card.querySelector('.stamp-nope').style.opacity = 0; } 
        else { card.querySelector('.stamp-nope').style.opacity = Math.abs(currentX)/100; card.querySelector('.stamp-like').style.opacity = 0; }
    };
    const end = () => {
        if (!isDragging) return;
        isDragging = false; card.classList.remove('moving');
        if (currentX > 100) swipeOut(card, 1);
        else if (currentX < -100) swipeOut(card, -1);
        else { card.classList.add('resetting'); card.style.transform = ''; card.querySelector('.stamp-like').style.opacity = 0; card.querySelector('.stamp-nope').style.opacity = 0; }
    };
    card.addEventListener('mousedown', start); card.addEventListener('touchstart', start, {passive: true});
    document.addEventListener('mousemove', drag); document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
}

function swipeOut(card, direction) {
    card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    card.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 45}deg)`;
    setTimeout(() => card.remove(), 400);
}
function forceSwipe(dir) { const cards = document.querySelectorAll('.tinder-card'); if(cards.length) swipeOut(cards[cards.length-1], dir); }

// --- 4. TURNUVA (ELO & LİDERLİK TABLOSU) ---
function renderTournament(tab) {
    let content = '';
    if (tab === 'vote') {
        // İki rastgele kişi
        const u1 = usersDB[Math.floor(Math.random() * usersDB.length)];
        let u2 = usersDB[Math.floor(Math.random() * usersDB.length)];
        while(u1.id === u2.id) u2 = usersDB[Math.floor(Math.random() * usersDB.length)];

        content = `
            <p style="color:#666; font-size:14px; margin-bottom:15px;">Daha çekici olanı seç, Elo puanını artır!</p>
            <div class="t-card-wrap">
                <div class="t-card" onclick="voteTourney(${u1.id})"><img src="${u1.image}"><div class="t-card-name">${u1.name}</div></div>
                <div class="vs-badge">VS</div>
                <div class="t-card" onclick="voteTourney(${u2.id})"><img src="${u2.image}"><div class="t-card-name">${u2.name}</div></div>
            </div>
        `;
    } else {
        // Liderlik Tablosu
        let sorted = [...usersDB].sort((a,b) => b.elo - a.elo);
        content = `<div style="text-align:left; padding:0 10px;">
            ${sorted.map((u, i) => `
                <div class="leaderboard-item">
                    <span style="font-weight:900; font-size:18px; color:${i===0?'#FFD700':(i===1?'#C0C0C0':'#CD7F32')}; width:30px;">#${i+1}</span>
                    <img src="${u.image}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-right:15px;">
                    <div style="flex:1; font-weight:bold; color:#1e293b;">${u.name}</div>
                    <div style="color:#4A00E0; font-weight:bold; font-size:14px;"><i class="fa-solid fa-fire"></i> ${u.elo}</div>
                </div>
            `).join('')}
        </div>`;
    }

    appContent.innerHTML = `
        <div class="tourney-container">
            <div class="tourney-toggle">
                <button class="${tab==='vote'?'active':''}" onclick="renderTournament('vote')">Oylama</button>
                <button class="${tab==='board'?'active':''}" onclick="renderTournament('board')">Global Sıralama</button>
            </div>
            ${content}
        </div>
    `;
}

function voteTourney(winnerId) {
    const w = usersDB.find(u => u.id === winnerId);
    if(w) w.elo += 15; // Kazanan 15 Elo alır
    renderTournament('vote');
}

// --- 5. MESAJLAR (GÖNDERME EKLENDİ) ---
function renderMessagesList() {
    appContent.innerHTML = `
        <div style="padding: 15px;">
            <h2 style="color: #1e293b; margin-bottom: 15px;">Mesajlar</h2>
            <div onclick="openChat(1)" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); cursor:pointer;">
                <img src="${usersDB[0].image}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1; margin-left: 15px;">
                    <h4 style="color: #1e293b; font-size: 16px;">${usersDB[0].name}</h4>
                    <p style="color: #64748b; font-size: 13px; font-weight: 600;">Naber? Aynı bölümdeyiz sanırım 😊</p>
                </div>
            </div>
        </div>
    `;
}

function openChat() {
    const html = `
        <div class="chat-screen" id="active-chat">
            <div class="chat-header">
                <i class="fa-solid fa-arrow-left" style="font-size: 20px; cursor: pointer; color: #1e293b; margin-right: 15px;" onclick="document.getElementById('active-chat').remove()"></i>
                <img src="${usersDB[0].image}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
                <h3 style="color: #1e293b; font-size: 16px;">${usersDB[0].name}</h3>
            </div>
            <div class="chat-messages" id="chat-msgs">
                <div class="bubble received">Selam! Uygulamada yeni eşleştik galiba? ✌️</div>
                <div class="bubble received">Naber? Aynı bölümdeyiz sanırım 😊</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" style="flex: 1; padding: 12px; border: 1px solid #eee; border-radius: 20px; background: #f8fafc; outline: none;" placeholder="Mesaj yaz..." onkeypress="if(event.key === 'Enter') sendMsg()">
                <button onclick="sendMsg()" style="background: #4A00E0; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
}

function sendMsg() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    const container = document.getElementById('chat-msgs');
    container.innerHTML += `<div class="bubble sent">${msg}</div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight; // Mesaj atınca alta kaydır
}

// --- 6. BLINDTALK (SESLİ SOHBET SİMÜLASYONU) ---
function renderVoiceHome() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 20px;">
            <i class="fa-solid fa-mask" style="font-size: 60px; color: #4A00E0; margin-bottom: 20px;"></i>
            <h2 style="color: #1e293b;">BlindTalk Odası</h2>
            <p style="color: #64748b; margin-top: 10px; font-size: 14px;">Kimlikler gizli, sadece sesin var. Konuş, etkile, maskeyi indir!</p>
            <button onclick="startVoiceSearch()" style="margin-top: 30px; padding: 15px 40px; background: #4A00E0; color: white; border: none; border-radius: 25px; font-weight: bold; font-size: 16px; cursor: pointer;">Rastgele Bağlan</button>
        </div>
    `;
}

function startVoiceSearch() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
            <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #4A00E0; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            <h3 style="margin-top: 20px; color: #1e293b;">Eşleşme Aranıyor...</h3>
        </div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;
    
    // 2 saniye sonra eşleş
    setTimeout(() => {
        appContent.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px; text-align: center;">
                <div class="voice-wave">
                    <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
                </div>
                <h3 style="color: #4CAF50; margin: 20px 0 10px;">Bağlantı Kuruldu!</h3>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Şu an anonim olarak konuşuyorsunuz.</p>
                <button onclick="dropMaskRequest()" style="width: 100%; max-width: 250px; padding: 15px; background: #FFD700; color: #1e293b; border: none; border-radius: 15px; font-weight: bold; font-size: 15px; margin-bottom: 10px;"><i class="fa-solid fa-unlock"></i> Maskeyi İndir</button>
                <button onclick="renderVoiceHome()" style="width: 100%; max-width: 250px; padding: 15px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 15px; font-weight: bold; font-size: 15px;">Görüşmeyi Bitir</button>
            </div>
        `;
    }, 2000);
}

function dropMaskRequest() {
    alert("Karşı tarafa maske indirme isteği gönderildi. Bekleniyor...");
    // Karşı taraf kabul etti simülasyonu
    setTimeout(() => {
        const matchedUser = usersDB[1]; // Aylin ile eşleşti varsayalım
        appContent.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; height: 100%;">
                <h3 style="color: #4A00E0; margin-bottom: 10px;">İkiniz de Kabul Ettiniz!</h3>
                <div style="width: 280px; height: 400px; margin-bottom: 20px;">
                    ${generateUserCardHtml(matchedUser)}
                </div>
                <div style="display: flex; gap: 10px; width: 100%; max-width: 280px;">
                    <button onclick="alert('Arkadaş eklendi! Mesajlar sekmesinden yazabilirsin.'); renderVoiceHome();" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 15px; font-weight: bold;"><i class="fa-solid fa-user-plus"></i> Ekle</button>
                    <button onclick="renderVoiceHome()" style="flex: 1; padding: 12px; background: #EF4444; color: white; border: none; border-radius: 15px; font-weight: bold;">Çıkış</button>
                </div>
            </div>
        `;
    }, 1500);
}

// --- 7. PROFİL (KİMLİK KARTIYLA BİRLİKTE) ---
function renderProfile() {
    appContent.innerHTML = `
        <div style="padding: 20px; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 280px; height: 400px; margin-bottom: 25px;">
                ${generateUserCardHtml(activeUser)}
            </div>

            <div style="display: flex; gap: 15px; width: 100%; max-width: 320px;">
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #4A00E0; font-size: 22px;">${activeUser.elo}</h3>
                    <p style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 5px;">Turnuva Puanı</p>
                </div>
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #EF4444; font-size: 22px;">12</h3>
                    <p style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 5px;">Eşleşme</p>
                </div>
            </div>
            
            <button onclick="location.reload()" style="margin-top: 25px; width: 100%; max-width: 320px; padding: 15px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 15px; font-weight: bold; cursor: pointer;">Çıkış Yap</button>
        </div>
    `;
}

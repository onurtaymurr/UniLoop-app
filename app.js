// SAHTE VERİTABANI (Firebase'e bağlayacağın yerler)
const usersDB = [
    { id: 1, name: "Ceren", age: 21, dept: "Yazılım Müh.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", tags: ["Kodlama", "Kahve"] },
    { id: 2, name: "Aylin", age: 20, dept: "Mimarlık", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", tags: ["Sanat", "Sinema"] },
    { id: 3, name: "Melis", age: 22, dept: "Psikoloji", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", tags: ["Yoga", "Kitap"] },
    { id: 4, name: "Burcu", age: 21, dept: "Hukuk", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400", tags: ["Müzik", "Gezi"] },
    { id: 5, name: "Ece", age: 19, dept: "Tasarım", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400", tags: ["Çizim", "Moda"] },
    { id: 6, name: "İrem", age: 23, dept: "İşletme", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", tags: ["Borsa", "Kahve"] },
    { id: 7, name: "Zeynep", age: 20, dept: "Tıp", image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400", tags: ["Bilim", "Spor"] },
    { id: 8, name: "Defne", age: 22, dept: "Edebiyat", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", tags: ["Şiir", "Tiyatro"] }
];

// OTURUM AÇAN KULLANICI BİLGİLERİ (Kayıt ekranından doldurulacak)
let activeUser = { name: "", age: null, dept: "", purpose: "", tags: [], elo: 1000, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" };

// --- 1. KİMLİK DOĞRULAMA VE KAYIT MANTIĞI ---
function toggleReg() { 
    document.getElementById('login-block').style.display = 'none'; 
    document.getElementById('reg-block').style.display = 'block'; 
}

function nextStep(step) { 
    document.querySelectorAll('.reg-step').forEach(e => e.classList.remove('active')); 
    document.getElementById('step-' + step).classList.add('active'); 
    document.getElementById('reg-prog').style.width = (step * 33.3) + '%'; 
}

function finishReg() {
    activeUser.name = document.getElementById('r-name').value || "Kullanıcı";
    activeUser.age = document.getElementById('r-age').value || 20;
    activeUser.dept = document.getElementById('r-dept').value || "Belirtilmedi";
    activeUser.purpose = document.getElementById('r-purpose').value;
    document.querySelectorAll('.hobi-tag.selected').forEach(t => activeUser.tags.push(t.innerText));
    enterApp();
}

function enterApp() { 
    document.getElementById('auth-screen').classList.remove('active'); 
    document.getElementById('app-container').classList.add('active'); 
    nav('discover', document.querySelector('.nav-btn')); // Direkt keşfet'e git
}

// --- 2. SAYFA YÖNLENDİRİCİSİ (ROUTER) ---
const appContent = document.getElementById('app-content');

function nav(page, btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active');
    
    if(page === 'discover') renderDiscover();
    if(page === 'tournament') initTournament();
    if(page === 'messages') renderMessagesList();
    if(page === 'profile') renderProfile();
    if(page === 'voice') renderVoice();
}

// --- 3. KEŞFET (PÜRÜZSÜZ TINDER SWIPE) ---
function renderDiscover() {
    appContent.innerHTML = `
        <div class="tinder-wrapper">
            <div class="tinder-cards-container" id="cards-container"></div>
            <div style="display: flex; gap: 30px; margin-top: 20px;">
                <button onclick="forceSwipe(-1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #EF4444; font-size: 30px; box-shadow: 0 10px 25px rgba(239,68,68,0.2); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <button onclick="forceSwipe(1)" style="width: 70px; height: 70px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 30px; box-shadow: 0 10px 25px rgba(76,175,80,0.2); cursor:pointer;"><i class="fa-solid fa-heart"></i></button>
            </div>
        </div>
    `;
    const container = document.getElementById('cards-container');
    let deck = [...usersDB].reverse(); // Son kullanıcı en üstte

    deck.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        card.style.zIndex = index;
        card.innerHTML = `
            <img src="${user.image}" alt="">
            <div class="swipe-stamp stamp-like">BEĞEN</div>
            <div class="swipe-stamp stamp-nope">PAS</div>
            <div class="info">
                <h3>${user.name}, ${user.age}</h3>
                <p style="font-size:16px; margin-bottom:10px;"><i class="fa-solid fa-graduation-cap"></i> ${user.dept}</p>
                <div class="tags">${user.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        `;
        container.appendChild(card);
        attachSmoothDrag(card);
    });
}

function attachSmoothDrag(card) {
    let startX = 0, currentX = 0, isDragging = false;
    const start = (e) => { 
        isDragging = true; 
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX; 
        card.classList.add('moving'); 
        card.classList.remove('resetting'); 
    };
    const drag = (e) => {
        if (!isDragging) return;
        currentX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX) - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.08}deg)`;
        
        if(currentX > 0) { 
            card.querySelector('.stamp-like').style.opacity = currentX/150; 
            card.querySelector('.stamp-nope').style.opacity = 0; 
        } else { 
            card.querySelector('.stamp-nope').style.opacity = Math.abs(currentX)/150; 
            card.querySelector('.stamp-like').style.opacity = 0; 
        }
    };
    const end = () => {
        if (!isDragging) return;
        isDragging = false; 
        card.classList.remove('moving');
        
        if (currentX > 100) swipeOut(card, 1);
        else if (currentX < -100) swipeOut(card, -1);
        else {
            card.classList.add('resetting');
            card.style.transform = '';
            card.querySelector('.stamp-like').style.opacity = 0; 
            card.querySelector('.stamp-nope').style.opacity = 0;
        }
    };
    card.addEventListener('mousedown', start); card.addEventListener('touchstart', start, {passive: true});
    document.addEventListener('mousemove', drag); document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
}

function swipeOut(card, direction) {
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    card.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 45}deg)`;
    setTimeout(() => card.remove(), 500);
}
function forceSwipe(dir) { const cards = document.querySelectorAll('.tinder-card'); if(cards.length) swipeOut(cards[cards.length-1], dir); }

// --- 4. GERÇEK TURNUVA AĞACI MANTIĞI ---
let tourneyStage = 'Çeyrek Final', currentMatchIndex = 0;
let currentBracket = [], nextBracket = [];

function initTournament() {
    currentBracket = [...usersDB].sort(() => 0.5 - Math.random()).slice(0, 8); // Rastgele 8 kişi
    nextBracket = [];
    tourneyStage = 'Çeyrek Final';
    currentMatchIndex = 0;
    renderTournamentMatch();
}

function renderTournamentMatch() {
    if (tourneyStage === 'Şampiyon') {
        const winner = currentBracket[0];
        appContent.innerHTML = `
            <div style="text-align:center; padding: 50px 20px;">
                <i class="fa-solid fa-trophy" style="font-size: 80px; color: #FFD700; margin-bottom: 20px; filter: drop-shadow(0 0 20px rgba(255,215,0,0.5));"></i>
                <h2 style="color: #1e293b; margin-bottom: 30px;">Haftanın Şampiyonu!</h2>
                <div style="width: 220px; height: 220px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 8px solid #FFD700; box-shadow: 0 10px 30px rgba(255,215,0,0.5);">
                    <img src="${winner.image}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="margin-top: 25px; font-size: 32px; color: #1e293b;">${winner.name}</h3>
                <button onclick="initTournament()" style="margin-top: 40px; padding: 18px 40px; background: #4A00E0; color: white; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 16px;">Yeniden Oyna</button>
            </div>
        `;
        return;
    }

    const u1 = currentBracket[currentMatchIndex * 2];
    const u2 = currentBracket[currentMatchIndex * 2 + 1];

    appContent.innerHTML = `
        <div class="tourney-stage">${tourneyStage} <span style="font-size:14px; color:#94a3b8; display:block;">Maç ${currentMatchIndex + 1} / ${currentBracket.length / 2}</span></div>
        <div class="t-card-wrap">
            <div class="t-card" onclick="advanceUser(${u1.id})">
                <img src="${u1.image}"><div class="t-card-name">${u1.name}</div>
            </div>
            <div class="vs-badge">VS</div>
            <div class="t-card" onclick="advanceUser(${u2.id})">
                <img src="${u2.image}"><div class="t-card-name">${u2.name}</div>
            </div>
        </div>
    `;
}

function advanceUser(winnerId) {
    const winner = currentBracket.find(u => u.id === winnerId);
    nextBracket.push(winner);
    currentMatchIndex++;

    if (currentMatchIndex * 2 >= currentBracket.length) {
        currentBracket = [...nextBracket];
        nextBracket = [];
        currentMatchIndex = 0;

        if(currentBracket.length === 4) tourneyStage = 'Yarı Final';
        else if(currentBracket.length === 2) tourneyStage = 'Büyük Final';
        else if(currentBracket.length === 1) tourneyStage = 'Şampiyon';
    }
    setTimeout(renderTournamentMatch, 150);
}

// --- 5. MESAJLAR VE SOHBET ---
function renderMessagesList() {
    appContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="margin-bottom: 20px; color: #1e293b;">Mesajlar</h2>
            <div onclick="openChat()" style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); cursor:pointer;">
                <img src="${usersDB[0].image}" style="width: 65px; height: 65px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1; margin-left: 15px;">
                    <h4 style="color: #1e293b; font-size: 18px;">${usersDB[0].name}</h4>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 600;">Naber? Aynı bölümdeyiz sanırım 😊</p>
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
                <img src="${usersDB[0].image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
                <h3 style="color: #1e293b;">${usersDB[0].name}</h3>
            </div>
            <div class="chat-messages">
                <div class="bubble received">Selam! Uygulamada yeni eşleştik galiba? ✌️</div>
                <div class="bubble received">Naber? Aynı bölümdeyiz sanırım 😊</div>
                <div class="bubble sent">Selam Ceren! Evet ben de yeni katıldım, iyidir senden?</div>
            </div>
            <div style="background: white; padding: 15px 20px; display: flex; gap: 10px; align-items: center;">
                <input type="text" style="flex: 1; padding: 15px; border: 1px solid #eee; border-radius: 25px; background: #f8fafc; outline: none;" placeholder="Mesaj yaz...">
                <button style="background: #4A00E0; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer;"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
}

// --- 6. BLINDTALK ---
function renderVoice() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 20px;">
            <div class="radar"><i class="fa-solid fa-microphone" style="font-size: 50px; color: #4A00E0;"></i></div>
            <h2 style="color: #1e293b; margin-top: 40px;">BlindTalk Odası</h2>
            <p style="color: #64748b; margin-top: 15px; max-width: 80%;">Dış görünüş yok, sadece sesin var. Eşleşirsen maskeleri indirmek için onayla!</p>
            <button onclick="this.innerText='Eşleşme Aranıyor...'; this.style.background='#FFD700'; this.style.color='#1e293b';" style="margin-top: 40px; padding: 18px 50px; background: #4A00E0; color: white; border: none; border-radius: 30px; font-weight: bold; font-size: 18px; cursor: pointer;">Rastgele Bağlan</button>
        </div>
    `;
}

// --- 7. DİNAMİK PROFİL (KAYITTAKİ BİLGİLERLE) ---
function renderProfile() {
    const tagsHtml = activeUser.tags.map(t => `<span style="background: rgba(74,0,224,0.1); color: #4A00E0; padding: 8px 15px; border-radius: 20px; font-size: 13px; font-weight: bold;">${t}</span>`).join('');
    
    appContent.innerHTML = `
        <div style="padding: 30px 20px; text-align: center;">
            <div style="position: relative; display: inline-block;">
                <img src="${activeUser.img}" style="width: 140px; height: 140px; border-radius: 50%; border: 5px solid #4A00E0; object-fit: cover; box-shadow: 0 10px 25px rgba(74,0,224,0.2);">
                <div style="position: absolute; bottom: 5px; right: 5px; background: white; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); color: #4A00E0;"><i class="fa-solid fa-pen"></i></div>
            </div>
            
            <h2 style="color: #1e293b; margin-top: 20px; font-size: 28px;">${activeUser.name}, ${activeUser.age}</h2>
            <p style="color: #64748b; font-size: 16px; margin-top: 5px;">${activeUser.dept}</p>
            <p style="color: #4A00E0; font-weight: 800; font-size: 14px; margin-top: 15px;">Arıyor: ${activeUser.purpose}</p>
            
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 20px 0 30px 0;">
                ${tagsHtml}
            </div>

            <div style="display: flex; gap: 15px;">
                <div style="flex: 1; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.04);">
                    <h3 style="color: #4A00E0; font-size: 24px;">${activeUser.elo}</h3>
                    <p style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 5px;">Turnuva Puanı</p>
                </div>
                <div style="flex: 1; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.04);">
                    <h3 style="color: #EF4444; font-size: 24px;">42</h3>
                    <p style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 5px;">Eşleşme</p>
                </div>
            </div>
            
            <button onclick="location.reload()" style="margin-top: 30px; width: 100%; padding: 18px; background: transparent; border: 2px solid #EF4444; color: #EF4444; border-radius: 20px; font-weight: bold; font-size: 16px; cursor: pointer;">Çıkış Yap</button>
        </div>
    `;
}

// --- 1. FIREBASE HAZIRLIĞI (Gerçek yapılandırmanı buraya girebilirsin) ---
const firebaseConfig = {
    apiKey: "SENIN_API_KEY",
    authDomain: "uniloop-app.firebaseapp.com",
    projectId: "uniloop-app",
    storageBucket: "uniloop-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// --- 2. SAHTE VERİ TABANI (Tüm özellikleri test etmen için) ---
let usersDB = [
    { id: 1, name: "Ceren", age: 21, dept: "Yazılım Mühendisliği", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", tags: ["Kodlama", "Kahve"], elo: 1450 },
    { id: 2, name: "Berk", age: 23, dept: "Hukuk Fakültesi", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400", tags: ["Spor", "Müzik"], elo: 1620 },
    { id: 3, name: "Aylin", age: 20, dept: "Mimarlık", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", tags: ["Sanat", "Sinema"], elo: 1800 },
    { id: 4, name: "Kaan", age: 22, dept: "İşletme", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", tags: ["Borsa", "Girişimcilik"], elo: 1300 },
    { id: 5, name: "Melis", age: 21, dept: "Psikoloji", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", tags: ["Yoga", "Kitap"], elo: 1550 }
];

// --- 3. SAYFA İÇERİKLERİ YÖNETİCİSİ ---
const appContent = document.getElementById('app-content');

const renderPage = {
    discover: () => {
        appContent.innerHTML = `
            <div class="tinder-cards-container" id="cards-container"></div>
            <div style="position: absolute; bottom: 20px; display: flex; gap: 30px; z-index: 10;">
                <button onclick="forceSwipe('left')" style="width: 65px; height: 65px; border-radius: 50%; border:none; background: white; color: #F44336; font-size: 28px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <button onclick="forceSwipe('right')" style="width: 65px; height: 65px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 28px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); cursor:pointer;"><i class="fa-solid fa-heart"></i></button>
            </div>
        `;
        initSwipeCards();
    },

    voice: () => {
        appContent.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;">
                <div style="width: 160px; height: 160px; border-radius: 50%; background: linear-gradient(135deg, #4A00E0, #8E2DE2); display: flex; justify-content: center; align-items: center; animation: pulseGlow 2s infinite;">
                    <i class="fa-solid fa-microphone-lines" style="font-size: 60px; color: white;"></i>
                </div>
                <h2 style="margin-top: 40px; color: #333;">BlindTalk Odası</h2>
                <p style="color: #666; margin-top: 10px; max-width: 80%;">Dış görünüş yok, sadece sesin var. Konuş, etkile ve maskeleri indirmek için onayla!</p>
                <button class="btn-primary" style="margin-top: 40px; border-radius: 30px; width: 80%; max-width: 300px; padding: 18px; font-size: 18px;" onclick="alert('Eşleşme aranıyor...')">Rastgele Bağlan</button>
            </div>
        `;
    },

    tournament: (subTab = 'vote') => {
        let contentHTML = '';
        if (subTab === 'vote') {
            const u1 = usersDB[2]; // Örnek Aday 1
            const u2 = usersDB[4]; // Örnek Aday 2
            contentHTML = `
                <h3 style="text-align: center; color: #333; margin-bottom: 20px;">Haftanın Popüleri Kim?</h3>
                <div style="display: flex; gap: 10px; justify-content: center; width: 100%; padding: 0 10px;">
                    <div onclick="voteFor(${u1.id})" style="flex: 1; max-width: 160px; border-radius: 15px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <img src="${u1.image}" style="width: 100%; height: 220px; object-fit: cover;">
                        <div style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center; font-weight: bold; font-size: 14px;">${u1.name}</div>
                    </div>
                    <div style="display: flex; align-items: center; font-weight: 800; font-size: 24px; color: #4A00E0;">VS</div>
                    <div onclick="voteFor(${u2.id})" style="flex: 1; max-width: 160px; border-radius: 15px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <img src="${u2.image}" style="width: 100%; height: 220px; object-fit: cover;">
                        <div style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center; font-weight: bold; font-size: 14px;">${u2.name}</div>
                    </div>
                </div>
            `;
        } else {
            let sortedUsers = [...usersDB].sort((a, b) => b.elo - a.elo).slice(0, 5); // İlk 5
            contentHTML = `
                <h3 style="margin-bottom: 15px; color: #333; width: 100%; text-align: center;">Top 5 Liderlik Tablosu</h3>
                <div style="width: 90%; max-width: 400px; margin: 0 auto;">
                    ${sortedUsers.map((u, i) => `
                        <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="font-weight: 800; font-size: 20px; color: ${i===0 ? '#FFD700' : (i===1 ? '#C0C0C0' : '#CD7F32')}; width: 40px; text-align: center;">#${i+1}</div>
                            <img src="${u.image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin: 0 15px;">
                            <div style="flex: 1; font-weight: 600; color: #333;">${u.name}</div>
                            <div style="color: #4A00E0; font-weight: bold;"><i class="fa-solid fa-fire"></i> ${u.elo}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        appContent.innerHTML = `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                <div style="display: flex; background: #fff; border-radius: 20px; padding: 5px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <button style="border: none; background: ${subTab === 'vote' ? '#4A00E0' : 'transparent'}; color: ${subTab === 'vote' ? 'white' : '#666'}; padding: 10px 20px; border-radius: 15px; font-weight: bold; cursor: pointer;" onclick="renderPage.tournament('vote')">Oylama</button>
                    <button style="border: none; background: ${subTab === 'leaderboard' ? '#4A00E0' : 'transparent'}; color: ${subTab === 'leaderboard' ? 'white' : '#666'}; padding: 10px 20px; border-radius: 15px; font-weight: bold; cursor: pointer;" onclick="renderPage.tournament('leaderboard')">Tablo</button>
                </div>
                <div id="tournament-body" style="width: 100%;">
                    ${contentHTML}
                </div>
            </div>
        `;
    },

    messages: () => {
        appContent.innerHTML = `
            <div style="width: 100%; max-width: 400px; padding: 0 20px;">
                <h2 style="margin-bottom: 20px; color: #333;">Mesajlar (1)</h2>
                <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor:pointer;">
                    <div style="position: relative;">
                        <img src="${usersDB[0].image}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                        <div style="position: absolute; bottom: 2px; right: 2px; width: 16px; height: 16px; background: #4CAF50; border-radius: 50%; border: 3px solid white;"></div>
                    </div>
                    <div style="flex: 1; margin-left: 15px;">
                        <h4 style="color: #333; margin-bottom: 3px;">${usersDB[0].name}</h4>
                        <p style="color: #666; font-size: 13px; font-weight: bold;">Selam, naber? Aynı bölümdeyiz sanırım 😊</p>
                    </div>
                    <span style="font-size: 12px; color: #4A00E0; font-weight: bold;">Şimdi</span>
                </div>
            </div>
        `;
    },

    profile: () => {
        appContent.innerHTML = `
            <div style="width: 100%; max-width: 400px; text-align: center; padding: 20px;">
                <img src="https://via.placeholder.com/150/4A00E0/FFFFFF?text=Sen" style="width: 130px; height: 130px; border-radius: 50%; border: 5px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 15px;">
                <h2 style="color: #333;">Kullanıcı Adın</h2>
                <p style="color: #666; margin-bottom: 25px;">Yazılım Mühendisliği • 22</p>
                
                <div style="background: white; border-radius: 20px; padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); text-align: left;">
                    <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; cursor: pointer; color: #333; font-weight: 600;">
                        <span><i class="fa-solid fa-user-pen" style="width: 25px; color: #4A00E0;"></i> Profili Düzenle</span>
                        <i class="fa-solid fa-chevron-right" style="color: #ccc;"></i>
                    </div>
                    <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; cursor: pointer; color: #333; font-weight: 600;">
                        <span><i class="fa-solid fa-gear" style="width: 25px; color: #4A00E0;"></i> Ayarlar</span>
                        <i class="fa-solid fa-chevron-right" style="color: #ccc;"></i>
                    </div>
                    <div onclick="logout()" style="padding: 15px; display: flex; justify-content: space-between; cursor: pointer; color: #F44336; font-weight: 600;">
                        <span><i class="fa-solid fa-arrow-right-from-bracket" style="width: 25px;"></i> Çıkış Yap</span>
                    </div>
                </div>
            </div>
        `;
    }
};

// --- 4. UYGULAMA MOTORU VE OLAYLAR (EVENTS) ---
document.addEventListener('DOMContentLoaded', () => {
    // Giriş İşlemi
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-container').classList.add('active');
        switchTab('discover'); // İlk açılışta keşfet sayfası gelsin
    });

    // Menü Yönlendirmeleri
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pageName = e.currentTarget.dataset.page;
            switchTab(pageName);
        });
    });

    // Modallar
    document.getElementById('btn-premium').addEventListener('click', () => openModal('premium-modal'));
    document.getElementById('btn-notifications').addEventListener('click', () => openModal('notifications-modal'));
});

function switchTab(pageName) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add('active');
    renderPage[pageName]();
}

function logout() {
    document.getElementById('app-container').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('login-form').reset();
}

// --- 5. TINDER KAYDIRMA (SWIPE) MANTIĞI EKSİKSİZ ---
function initSwipeCards() {
    const container = document.getElementById('cards-container');
    if(!container) return;
    container.innerHTML = '';
    let deck = [...usersDB].reverse(); // Son kullanıcı en üstte

    deck.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        card.style.zIndex = index;
        card.innerHTML = `
            <img src="${user.image}" alt="Profil">
            <div class="swipe-stamp stamp-like">BEĞEN</div>
            <div class="swipe-stamp stamp-nope">PAS</div>
            <div class="info">
                <h3>${user.name}, ${user.age}</h3>
                <p><i class="fa-solid fa-graduation-cap"></i> ${user.dept}</p>
                <div class="tags">${user.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        `;
        container.appendChild(card);
        attachDragEvents(card);
    });
}

function attachDragEvents(card) {
    let startX = 0, currentX = 0;
    let isDragging = false;

    const startDrag = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        card.classList.add('moving');
    };

    const drag = (e) => {
        if (!isDragging) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = x - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;

        // Stamp opaklık ayarı
        if (currentX > 0) {
            card.querySelector('.stamp-like').style.opacity = currentX / 100;
            card.querySelector('.stamp-nope').style.opacity = 0;
        } else {
            card.querySelector('.stamp-nope').style.opacity = Math.abs(currentX) / 100;
            card.querySelector('.stamp-like').style.opacity = 0;
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('moving');

        if (currentX > 100) { swipeCardOut(card, 'right'); } // Sağa kaydırdı
        else if (currentX < -100) { swipeCardOut(card, 'left'); } // Sola kaydırdı
        else {
            card.style.transform = ''; // Geri bırak
            card.querySelector('.stamp-like').style.opacity = 0;
            card.querySelector('.stamp-nope').style.opacity = 0;
        }
        currentX = 0;
    };

    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag, {passive: true});
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function forceSwipe(direction) {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) return;
    swipeCardOut(cards[cards.length - 1], direction);
}

function swipeCardOut(card, direction) {
    card.style.transition = 'transform 0.4s ease-out';
    card.style.transform = direction === 'right' ? `translateX(1000px) rotate(30deg)` : `translateX(-1000px) rotate(-30deg)`;
    setTimeout(() => card.remove(), 400);
}

// --- 6. TURNUVA OYLAMA İŞLEMİ ---
function voteFor(userId) {
    // Burada elo puanını artırıyoruz (Mock Data)
    const user = usersDB.find(u => u.id === userId);
    if(user) {
        user.elo += 25; // 25 puan kazandı
        alert(`Oyun ${user.name}'e gitti! Puanı arttı.`);
    }
    // Sonraki tura geçmek için sayfayı yenile
    renderPage.tournament('vote');
}

// --- 7. MODAL SİSTEMİ ---
function openModal(id) {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
}
function closeModals() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
document.getElementById('modal-overlay').addEventListener('click', closeModals);

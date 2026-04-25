// --- 1. FIREBASE VERİTABANI BAĞLANTISI VE KODLARI ---
// NOT: Buradaki bilgileri kendi Firebase proje ayarlarından almalısın.
const firebaseConfig = {
    apiKey: "API_KEY", authDomain: "uniloop.firebaseapp.com",
    projectId: "uniloop", storageBucket: "uniloop.appspot.com"
};
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

/* FİREBASE KAYIT FONKSİYONU ÖRNEĞİ (Sistemde hazırlandı, yorumu kaldırıp kullanabilirsin):
async function saveUserToFirebase(userData) {
    try {
        // Auth ile kullanıcı oluştur
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password);
        const uid = userCredential.user.uid;
        // Firestore'a datayı yaz
        await db.collection('users').doc(uid).set({
            name: userData.name, age: userData.age, faculty: userData.faculty,
            year: userData.year, hobbies: userData.hobbies, purpose: userData.purpose,
            photoUrl: userData.photo, elo: 1000, friendsCount: 0, likesReceived: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) { console.error("Kayıt Hatası: ", error); }
}
*/

// --- 2. UYGULAMA DEĞİŞKENLERİ ---
let currentUser = {
    name: "Berkant", age: 23, faculty: "Hukuk", year: "3. Sınıf", 
    hobbies: ["Spor", "Sinema"], purpose: "Network", photo: "https://via.placeholder.com/150",
    elo: 1540, likesReceived: 124, friendsCount: 45
};

let usersDB = [
    { id: 1, name: "Ceren", age: 21, dept: "Yazılım Müh.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", tags: ["Kodlama", "Kahve"], elo: 1450 },
    { id: 2, name: "Aylin", age: 20, dept: "Mimarlık", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", tags: ["Sanat", "Sinema"], elo: 1800 },
    { id: 3, name: "Melis", age: 22, dept: "Psikoloji", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", tags: ["Yoga", "Kitap"], elo: 1550 }
];

// --- 3. KAYIT (ONBOARDING) MANTIĞI ---
let selectedHobbies = [];
function startRegistration() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('register-screen').classList.add('active');
}

function nextStep(step) {
    if(step === 2 && (!document.getElementById('reg-name').value || !document.getElementById('reg-age').value)) {
        alert("Lütfen temel bilgileri doldur!"); return;
    }
    if(step === 3 && selectedHobbies.length < 3) {
        alert("Lütfen en az 3 hobi seç!"); return;
    }
    
    document.querySelectorAll('.reg-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    document.getElementById('reg-progress').style.width = `${step * 25}%`;
}

function prevStep(step) {
    document.querySelectorAll('.reg-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    document.getElementById('reg-progress').style.width = `${step * 25}%`;
}

function toggleHobi(element) {
    const hobi = element.innerText;
    if (selectedHobbies.includes(hobi)) {
        selectedHobbies = selectedHobbies.filter(h => h !== hobi);
        element.classList.remove('selected');
    } else {
        selectedHobbies.push(hobi);
        element.classList.add('selected');
    }
}

function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-upload').style.backgroundImage = `url(${e.target.result})`;
            document.getElementById('photo-upload').innerHTML = '';
            currentUser.photo = e.target.result; // Fotoğrafı sisteme kaydet
        }
        reader.readAsDataURL(file);
    }
}

function finishRegistration() {
    // Verileri currentUser objesine kaydet
    currentUser.name = document.getElementById('reg-name').value;
    currentUser.age = document.getElementById('reg-age').value;
    currentUser.faculty = document.getElementById('reg-faculty').value;
    currentUser.year = document.getElementById('reg-year').value;
    currentUser.hobbies = selectedHobbies;
    currentUser.purpose = document.getElementById('reg-purpose').value;
    
    // Uygulamaya Gir
    document.getElementById('register-screen').classList.remove('active');
    document.getElementById('app-container').classList.add('active');
    switchTab('discover');
}

// Normal Giriş Butonu
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-container').classList.add('active');
    switchTab('discover');
});

// --- 4. SAYFA VE İÇERİK MOTORU ---
const appContent = document.getElementById('app-content');
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.page));
});

function switchTab(pageName) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add('active');
    
    if(pageName === 'discover') renderDiscover();
    if(pageName === 'voice') renderVoice();
    if(pageName === 'tournament') renderTournament();
    if(pageName === 'messages') renderMessages();
    if(pageName === 'profile') renderProfile();
}

// --- KEŞFET (PÜRÜZSÜZ TINDER KAYDIRMA) ---
function renderDiscover() {
    appContent.innerHTML = `
        <div class="tinder-cards-container" id="cards-container"></div>
        <div style="position: absolute; bottom: 20px; display: flex; gap: 30px; z-index: 10;">
            <button onclick="forceSwipe('left')" style="width: 60px; height: 60px; border-radius: 50%; border:none; background: white; color: #F44336; font-size: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); cursor:pointer; transition:0.2s;"><i class="fa-solid fa-xmark"></i></button>
            <button onclick="forceSwipe('right')" style="width: 60px; height: 60px; border-radius: 50%; border:none; background: white; color: #4CAF50; font-size: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); cursor:pointer; transition:0.2s;"><i class="fa-solid fa-heart"></i></button>
        </div>
    `;
    const container = document.getElementById('cards-container');
    let deck = [...usersDB].reverse();

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
                <p><i class="fa-solid fa-graduation-cap"></i> ${user.dept}</p>
                <div class="tags">${user.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        `;
        container.appendChild(card);
        attachSmoothDrag(card);
    });
}

function attachSmoothDrag(card) {
    let startX = 0, currentX = 0, isDragging = false;
    const start = (e) => { isDragging = true; startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX; card.classList.add('moving'); card.classList.remove('resetting'); };
    const drag = (e) => {
        if (!isDragging) return;
        currentX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX) - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
        if(currentX > 0) { card.querySelector('.stamp-like').style.opacity = currentX/100; card.querySelector('.stamp-nope').style.opacity = 0; }
        else { card.querySelector('.stamp-nope').style.opacity = Math.abs(currentX)/100; card.querySelector('.stamp-like').style.opacity = 0; }
    };
    const end = () => {
        if (!isDragging) return;
        isDragging = false; card.classList.remove('moving');
        if (currentX > 120) swipeOut(card, 1);
        else if (currentX < -120) swipeOut(card, -1);
        else {
            card.classList.add('resetting');
            card.style.transform = '';
            card.querySelector('.stamp-like').style.opacity = 0; card.querySelector('.stamp-nope').style.opacity = 0;
        }
    };
    card.addEventListener('mousedown', start); card.addEventListener('touchstart', start, {passive: true});
    document.addEventListener('mousemove', drag); document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
}

function swipeOut(card, direction) {
    card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 30}deg)`;
    setTimeout(() => card.remove(), 600);
}
function forceSwipe(dir) { const cards = document.querySelectorAll('.tinder-card'); if(cards.length) swipeOut(cards[cards.length-1], dir==='right'?1:-1); }

// --- TURNUVA (SON 16 ANİMASYONU) ---
function renderTournament() {
    appContent.innerHTML = `
        <h3 style="color: #4A00E0; margin-bottom: 5px;">🔥 Son 16 Turu</h3>
        <p style="color: #666; margin-bottom: 25px; font-size: 14px;">Hangisi daha çekici? Seçimini yap!</p>
        <div style="display: flex; gap: 15px; width: 90%; justify-content: center; align-items: center;" id="tournament-arena">
            <div class="tournament-card" id="t-card-1" onclick="selectWinner(1, 2)" style="flex: 1; border-radius: 20px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <img src="${usersDB[0].image}" style="width: 100%; height: 260px; object-fit: cover;">
                <div style="position: absolute; bottom: 0; width: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 15px; text-align: center; font-weight: bold;">${usersDB[0].name}</div>
            </div>
            <div style="font-weight: 900; font-size: 24px; color: #ddd;" id="t-vs">VS</div>
            <div class="tournament-card" id="t-card-2" onclick="selectWinner(2, 1)" style="flex: 1; border-radius: 20px; overflow: hidden; position: relative; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <img src="${usersDB[1].image}" style="width: 100%; height: 260px; object-fit: cover;">
                <div style="position: absolute; bottom: 0; width: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 15px; text-align: center; font-weight: bold;">${usersDB[1].name}</div>
            </div>
        </div>
    `;
}

function selectWinner(winnerNum, loserNum) {
    const winnerCard = document.getElementById(`t-card-${winnerNum}`);
    const loserCard = document.getElementById(`t-card-${loserNum}`);
    const vsText = document.getElementById('t-vs');
    
    loserCard.classList.add('tournament-loser');
    vsText.style.opacity = 0;
    
    setTimeout(() => {
        winnerCard.classList.add('tournament-winner');
        winnerCard.innerHTML += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(74,0,224,0.9); color:white; padding:10px 20px; border-radius:20px; font-weight:bold; font-size:18px;">KAZANDI!</div>`;
    }, 300);

    // Yeni tura geç
    setTimeout(() => { renderTournament(); }, 1800);
}

// --- BLINDTALK (EŞLEŞME ARANIYOR MANTIĞI) ---
function renderVoice() {
    appContent.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;">
            <i class="fa-solid fa-mask" style="font-size: 60px; color: #4A00E0; margin-bottom: 20px;"></i>
            <h2 style="color: #333;">BlindTalk Odası</h2>
            <p style="color: #666; margin-top: 10px; max-width: 80%;">Dış görünüş yok, sadece sesin var. Eşleşirsen maskeleri indirmek için onayla!</p>
            <button class="btn-primary" id="btn-search-voice" style="margin-top: 40px; border-radius: 30px; width: 80%; max-width: 300px; padding: 18px; font-size: 18px;" onclick="startVoiceSearch()">Rastgele Bağlan</button>
        </div>
    `;
}

function startVoiceSearch() {
    appContent.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
            <div class="radar"><i class="fa-solid fa-microphone" style="font-size: 40px; color: #4A00E0;"></i></div>
            <h3 style="margin-top: 40px; color: #333;">Eşleşme Aranıyor...</h3>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Kampüsteki anonim kişiler taranıyor</p>
        </div>
    `;
    
    // 3 saniye sonra eşleşti simülasyonu
    setTimeout(() => {
        appContent.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align:center; padding: 20px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #4CAF50; display: flex; justify-content: center; align-items: center; color: white; font-size: 40px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(76,175,80,0.5);">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h2 style="color: #4CAF50;">Eşleşme Bulundu!</h2>
                <p style="color: #666; margin-top: 10px;">Bağlantı kuruluyor... Mikrofonuna izin ver.</p>
                <div style="display: flex; gap: 20px; align-items: center; margin-top: 40px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: #ddd; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-user" style="font-size:30px; color:#aaa;"></i></div>
                    <div style="font-size: 24px; color: #4A00E0;"><i class="fa-solid fa-wave-square"></i></div>
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: #ddd; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-user" style="font-size:30px; color:#aaa;"></i></div>
                </div>
                <button class="btn-outline" style="margin-top: 50px; border-color: #F44336; color: #F44336;" onclick="renderVoice()">Görüşmeyi Sonlandır</button>
            </div>
        `;
    }, 3000);
}

// --- MESAJLAR ---
function renderMessages() {
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
            </div>
        </div>
    `;
}

// --- DİNAMİK PROFİL (Kullanıcı Verilerini Çeker) ---
function renderProfile() {
    appContent.innerHTML = `
        <div style="width: 100%; max-width: 400px; text-align: center; padding: 10px 20px;">
            <div style="position: relative; display: inline-block;">
                <img src="${currentUser.photo}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #4A00E0; box-shadow: 0 5px 15px rgba(74,0,224,0.2); object-fit: cover; margin-bottom: 10px;">
                <div style="position: absolute; bottom: 10px; right: 0; background: white; width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); color: #4A00E0;"><i class="fa-solid fa-pen"></i></div>
            </div>
            <h2 style="color: #333;">${currentUser.name}, ${currentUser.age}</h2>
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">${currentUser.faculty} • ${currentUser.year}</p>
            <p style="color: #4A00E0; font-weight: bold; font-size: 13px; margin-bottom: 20px;">Arıyor: ${currentUser.purpose}</p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-fire" style="color: #FF8C00; font-size: 20px; margin-bottom: 5px;"></i>
                    <h3 style="color: #333;">${currentUser.elo}</h3>
                    <p style="font-size: 11px; color: #777;">Turnuva Puanı</p>
                </div>
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-heart" style="color: #F44336; font-size: 20px; margin-bottom: 5px;"></i>
                    <h3 style="color: #333;">${currentUser.likesReceived}</h3>
                    <p style="font-size: 11px; color: #777;">Beğenilme</p>
                </div>
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-user-group" style="color: #4CAF50; font-size: 20px; margin-bottom: 5px;"></i>
                    <h3 style="color: #333;">${currentUser.friendsCount}</h3>
                    <p style="font-size: 11px; color: #777;">Bağlantı</p>
                </div>
            </div>

            <div style="background: white; border-radius: 20px; padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); text-align: left;">
                <div style="padding: 15px; border-bottom: 1px solid #eee; font-weight: 600; color: #333;"><i class="fa-solid fa-gear" style="width: 25px; color: #4A00E0;"></i> Ayarlar</div>
                <div onclick="location.reload()" style="padding: 15px; font-weight: 600; color: #F44336; cursor: pointer;"><i class="fa-solid fa-arrow-right-from-bracket" style="width: 25px;"></i> Çıkış Yap</div>
            </div>
        </div>
    `;
}

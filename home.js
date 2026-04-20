// ============================================================================
// 🌟 UNILOOP - HOME PAGE
// ============================================================================
// Home.js — Ana sayfa render fonksiyonları ve ilgili tüm mantık:
//   • renderHome()             → Slider + Embedded Fast Match
//   • initEmbeddedFastMatch()  → Hızlı eşleşme / turnuva başlatma
//   • renderEmbeddedFastMatchCard() → Swipe kartı
//   • handleSwipe()            → Sol/sağ swipe işlemi
//   • startPopularityTournament() + renderTournamentRound() + finishTournament()
//   • showLeaderboard()        → Popülerlik sıralaması modal
//   • searchAndAddFriend / searchAndAddFriendHome → Kullanıcı arama
//   • sendFriendRequest()      → Arkadaşlık isteği gönderme
//   • viewUserProfile()        → Başka kullanıcının profil modali
//   • openFrequency / closeFrequency / WebRTC ses chat bölümü
// ============================================================================

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    where,
    getDocs,
    limit,
    deleteDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

// ─── SLIDER AUTO-SCROLL ────────────────────────────────────────────────────

window.renderHome = async function() {
    document.body.classList.add('no-scroll-home');

    let usernameWarning = '';
    if (!window.userProfile.username) {
        usernameWarning = `
            <div style="background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 12px;
                        border: 1px solid #FCA5A5; margin-bottom: 6px; font-weight: bold;
                        text-align: center; cursor:pointer; flex-shrink:0;"
                 onclick="window.loadPage('profile')">
                ⚠️ Lütfen profilinden bir kullanıcı adı belirle!
            </div>
        `;
    }

    const slides = [
        `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; position:relative;">
            <div id="home-default-view" style="display:flex; justify-content:space-between; align-items:center; width:100%; transition: opacity 0.2s;">
                <div>
                    <h2 style="font-size:18px; margin-bottom:4px; margin-top:0;">Hoş Geldin, ${window.userProfile.name}! 👋</h2>
                    <p style="opacity:0.9; font-size:12px; margin:0;"><strong style="color:#D9FDD3;">${window.userProfile.university}</strong></p>
                </div>
                <div id="home-icons-container" style="display:flex; gap:15px; align-items:center;">
                    <div class="white-flame-icon" onclick="window.showLeaderboard()" title="Popülerlik Savaşı Sıralaması">🔥</div>
                    <div style="font-size:24px; cursor:pointer;" onclick="window.openFrequency()" title="Kampüs Frekansı">🎙️</div>
                    <div style="font-size:24px; cursor:pointer;" onclick="window.toggleHomeSearch()" title="Arkadaşını Bul">🔍</div>
                </div>
            </div>
            <div id="home-search-container" class="hidden"
                style="position:absolute; left:0; top:50%; transform:translateY(-50%); z-index:20;
                       display:flex; align-items:center; background:white; border-radius:20px;
                       padding:5px 12px; width:100%; box-sizing:border-box; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                <span style="color:var(--primary); font-weight:800; font-size:14px; margin-right:5px;">#</span>
                <input type="text" id="home-friend-search-input"
                    style="border:none; background:transparent; width:100%; outline:none; font-size:13px; color:black;"
                    placeholder="Kullanıcı adı..."
                    onkeypress="if(event.key==='Enter') window.searchAndAddFriendHome()">
                <button onclick="window.searchAndAddFriendHome()" style="background:transparent; border:none; font-size:16px; cursor:pointer;">➡️</button>
                <button onclick="window.toggleHomeSearch()" style="background:transparent; border:none; font-size:16px; cursor:pointer; color:#EF4444; margin-left:5px;">✖</button>
            </div>
        </div>
        `,
        `
        <div>
            <h2 style="font-size:18px; margin-bottom:4px; margin-top:0; color:#FBBF24;">🎙️ Anonim Sesli Sohbet</h2>
            <p style="opacity:0.9; font-size:12px; margin:0; line-height:1.4;">Üniversiteden insanlarla anonim bir şekilde konuş, yeni bağlantılar kur ve frekansı yakala!</p>
        </div>
        `,
        `
        <div>
            <h2 style="font-size:18px; margin-bottom:4px; margin-top:0; color:#FBBF24;">🌟 Premium Ayrıcalıkları</h2>
            <p style="opacity:0.9; font-size:12px; margin:0; line-height:1.4;">Profiline kim baktı öğrenmek için hemen Premium'a geçiş yap.</p>
        </div>
        `
    ];

    const mainContent = document.getElementById('main-content');
    let html = `
        <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
            ${usernameWarning}
            <div style="position:relative; margin: 10px; border-radius:16px; flex-shrink:0;
                        box-shadow:0 6px 15px rgba(0,0,0,0.1); background:#1F2937;">
                <div id="home-slider-container" class="home-slider"
                    style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory;
                           width:100%; scroll-behavior:smooth;">
                    ${slides.map(slide => `
                        <div style="flex: 0 0 100%; scroll-snap-align: center; padding: 15px;
                                    box-sizing:border-box; display:flex; justify-content:flex-start;
                                    align-items:center; color:white; min-height:80px;">
                            ${slide}
                        </div>
                    `).join('')}
                </div>
                <div style="position:absolute; bottom:5px; left:0; right:0; display:flex;
                            justify-content:center; gap:5px; pointer-events:none;">
                    ${slides.map((_, i) => `
                        <div class="slider-dot" id="slider-dot-${i}"
                            style="width:6px; height:6px; border-radius:50%;
                                   background:${i===0 ? 'white' : 'rgba(255,255,255,0.3)'};">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="embedded-fast-match-container"
                style="flex:1; display:flex; flex-direction:column; align-items:center;
                       justify-content:center; padding:5px 10px 10px 10px; overflow:hidden;">
            </div>
        </div>
    `;

    mainContent.innerHTML = html;

    const sliderContainer = document.getElementById('home-slider-container');
    if (sliderContainer) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        sliderContainer.addEventListener('scroll', () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const clientWidth = sliderContainer.clientWidth;
            currentIndex = Math.round(scrollLeft / clientWidth);
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.getElementById(`slider-dot-${i}`);
                if (dot) dot.style.background = (i === currentIndex) ? 'white' : 'rgba(255,255,255,0.3)';
            }
        });

        if (window.homeSliderInterval) clearInterval(window.homeSliderInterval);
        window.homeSliderInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex >= totalSlides) currentIndex = 0;
            sliderContainer.scrollTo({ left: currentIndex * sliderContainer.clientWidth, behavior: 'smooth' });
        }, 15000);
    }

    window.initEmbeddedFastMatch();
};

// ─── HOME SEARCH ────────────────────────────────────────────────────────────

window.toggleHomeSearch = function() {
    const searchContainer = document.getElementById('home-search-container');
    const defaultView = document.getElementById('home-default-view');
    const inputField = document.getElementById('home-friend-search-input');

    if (searchContainer.classList.contains('hidden')) {
        searchContainer.classList.remove('hidden');
        if (defaultView) defaultView.style.opacity = '0';
        if (inputField) { inputField.style.display = 'block'; setTimeout(() => inputField.focus(), 100); }
    } else {
        searchContainer.classList.add('hidden');
        if (defaultView) defaultView.style.opacity = '1';
        if (inputField) inputField.blur();
    }
};

window.searchAndAddFriendHome = async function() {
    const input = document.getElementById('home-friend-search-input');
    if (input) {
        const val = input.value;
        const fakeInput = document.createElement('input');
        fakeInput.id = 'friend-search-input';
        fakeInput.value = val;
        document.body.appendChild(fakeInput);
        await window.searchAndAddFriend();
        fakeInput.remove();
        input.value = '';
        window.toggleHomeSearch();
    }
};

window.searchAndAddFriend = async function() {
    try {
        const searchInput = document.getElementById('friend-search-input');
        if (!searchInput) return;

        let rawSearch = searchInput.value.trim().toLowerCase();
        if (!rawSearch) { alert("Lütfen bir kullanıcı adı yazın."); return; }
        if (!window.userProfile.username) { alert("Bağlantı kurmadan önce lütfen profilinizden bir kullanıcı adı belirleyin!"); return; }

        rawSearch = rawSearch.replace(/^#/, '');
        const searchVal = '#' + rawSearch;

        if (searchVal === window.userProfile.username) { alert("Kendinize istek gönderemezsiniz :)"); return; }

        const q = query(collection(db, "users"), where("username", "==", searchVal));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("Bu kullanıcı adına sahip kimse bulunamadı!");
        } else {
            const targetUser = snapshot.docs[0].data();
            const premiumIcon = targetUser.isPremium ? '<span style="font-size:18px; margin-left:5px;" title="Premium Üye">👑</span>' : '';
            window.openModal('🔍 Kullanıcı Bulundu', `
                <div style="text-align:center; padding:10px;">
                    <div style="width:80px; height:80px; border-radius:50%; margin:0 auto 10px auto;
                                overflow:hidden; border:2px solid ${targetUser.isPremium ? '#111827' : '#E5E7EB'};
                                display:flex; align-items:center; justify-content:center;
                                background:#F3F4F6; font-size:32px;">
                        ${targetUser.avatarUrl ? `<img src="${targetUser.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (targetUser.avatar || '👤')}
                    </div>
                    <h3 style="margin-bottom:5px; color:var(--text-dark); display:flex; align-items:center; justify-content:center;">
                        ${targetUser.name} ${targetUser.surname.charAt(0)}. ${premiumIcon}
                    </h3>
                    <p style="font-size:13px; color:var(--text-gray); margin-bottom:20px;">${targetUser.faculty || 'Kampüs Öğrencisi'}</p>
                    <button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px;"
                        onclick="window.sendFriendRequest('${targetUser.uid}', '${targetUser.name} ${targetUser.surname}'); window.closeModal();">
                        ➕ Arkadaş Olarak Ekle
                    </button>
                </div>
            `);
        }
        searchInput.value = '';
    } catch (error) {
        alert("Arama sırasında hata oluştu: " + error.message);
    }
};

// ─── FRIEND REQUEST ─────────────────────────────────────────────────────────

window.sendFriendRequest = async function(targetUserId, targetUserName, isFastMatch = false) {
    try {
        const myUid = window.userProfile.uid;
        const q = query(collection(db, "chats"), where("participants", "array-contains", myUid));
        const snap = await getDocs(q);

        let existingChat = null;
        snap.forEach(docSnap => {
            if (docSnap.data().participants && docSnap.data().participants.includes(targetUserId) && !docSnap.data().isMarketChat) {
                existingChat = { id: docSnap.id, ...docSnap.data() };
            }
        });

        if (!existingChat) {
            await addDoc(collection(db, "chats"), {
                participants: [myUid, targetUserId],
                participantNames: { [myUid]: window.userProfile.name, [targetUserId]: targetUserName },
                participantAvatars: { [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [targetUserId]: "👤" },
                lastUpdated: serverTimestamp(),
                status: 'pending',
                initiator: myUid,
                isMarketChat: false,
                messages: []
            });
            if (!isFastMatch) alert("✅ Arkadaşlık isteği başarıyla gönderildi! Karşı taraf onayladığında arkadaş listenizde görünecektir.");
        } else {
            if (!isFastMatch) {
                if (existingChat.status === 'pending') {
                    alert("Bu kişiye zaten bir arkadaşlık isteği gönderilmiş veya ondan size istek gelmiş.");
                } else {
                    alert("Bu kişiyle zaten arkadaşsınız.");
                }
            }
        }
    } catch (error) {
        if (!isFastMatch) alert("İstek gönderilirken hata oluştu: " + error.message);
    }
};

// ─── VIEW USER PROFILE ───────────────────────────────────────────────────────

window.viewUserProfile = async function(targetUid) {
    if (!targetUid) { alert("Kullanıcı verisi eksik!"); return; }
    if (targetUid === window.userProfile.uid) { window.loadPage('profile'); return; }

    const isFriend = window.chatsDB.some(c => c.otherUid === targetUid && c.status === 'accepted' && !c.isMarketChat);

    if (!window.userProfile.isPremium && !isFriend) {
        window.openModal('🔒 Detaylı Profil Kilitli', `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:50px; margin-bottom:15px; filter: blur(2px);">👀</div>
                <h3 style="color:var(--text-dark); margin-bottom:10px;">Gizli Profil!</h3>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px; line-height:1.5;">
                    Detaylı profile bakabilmek için Premium üye ol. Tüm blurları kaldır ve kampüstekileri yakından tanı!
                </p>
                <button style="width:100%; justify-content:center; padding: 16px; font-size: 16px;
                               background:white; color:#111827; border:1px solid #111827; border-radius:12px;
                               cursor:pointer; font-weight:bold;"
                    onclick="window.openPremiumModal()">☆ Premium'a Yükselt</button>
            </div>
        `);
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, "users", targetUid));
        if (docSnap.exists()) {
            const u = docSnap.data();

            try {
                const viewRecord = {
                    uid: window.userProfile.uid,
                    name: window.userProfile.name,
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + new Date().toLocaleDateString()
                };
                await updateDoc(doc(db, "users", targetUid), { profileViewers: window.arrayUnion ? window.arrayUnion(viewRecord) : [viewRecord] });
                if (u.isPremium) {
                    window.sendSystemNotification(targetUid, `👀 <strong>${window.userProfile.name}</strong> profilini inceledi! (Premium Özelliği)`);
                }
            } catch (err) { console.warn("Görüntülenme kaydedilemedi, ancak profil açılıyor."); }

            const initial = u.surname ? u.surname.charAt(0) + '.' : '';
            const isPremium = u.isPremium;
            let avatarHtml = u.avatarUrl
                ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'};">`
                : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'}; margin:0 auto;">${u.avatar || '👤'}</div>`;

            const ageText   = u.age    ? u.age + " yaşında"     : "Yaş belirtilmemiş";
            const facText   = u.faculty ? u.faculty              : "Fakülte belirtilmemiş";
            const gradeText = u.grade  ? u.grade + ". Sınıf"    : "";
            const premiumBadge = isPremium ? `<div style="margin-top:8px; display:inline-block; background:#111827; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.1);">☆ Premium Üye</div>` : '';

            const existingChat = window.chatsDB.find(c => c.otherUid === u.uid && !c.isMarketChat);
            let actionBtnHtml = '';
            if (existingChat && existingChat.status === 'accepted') {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">💬 Mesaj Gönder</button>`;
            } else if (existingChat && existingChat.status === 'pending') {
                actionBtnHtml = `<button class="btn-primary" disabled style="width:100%; padding:12px; font-size:15px; border-radius:12px; background:#9CA3AF; box-shadow:none;">⏳ İstek Bekleniyor</button>`;
            } else {
                actionBtnHtml = `<button class="btn-primary" style="width:100%; padding:12px; font-size:15px; border-radius:12px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendFriendRequest('${u.uid}', '${u.name} ${initial}'); window.closeModal();">➕ Arkadaş Olarak Ekle</button>`;
            }

            window.openModal('Kullanıcı Profili', `
                <div style="text-align:center;">
                    ${avatarHtml}
                    <h3 style="margin: 10px 0 5px 0; font-size:18px; color:var(--text-dark); display:flex; align-items:center; justify-content:center; gap:5px;">
                        ${u.name} ${initial} ${isPremium ? '<span style="font-size:18px;">👑</span>' : ''}
                    </h3>
                    <p style="color:#111827; font-size:14px; margin-bottom: 5px; font-weight:bold;">${facText}${gradeText ? ' - ' + gradeText : ''}</p>
                    <p style="color:var(--text-gray); font-size:13px; margin-bottom: 5px;">${ageText}</p>
                    ${premiumBadge}
                    <div style="margin-top:20px;">${actionBtnHtml}</div>
                </div>
            `);
        }
    } catch (e) {
        console.error(e);
        alert("Profil yüklenirken hata oluştu.");
    }
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────

window.showLeaderboard = async function() {
    window.openModal('🔥 Popülerlik Sıralaması', `
        <div style="text-align:center; padding:30px;">
            <div style="font-size:30px; animation: glowPulse 1.5s infinite alternate;">🔥</div>
            <p style="color:var(--text-gray); margin-top:10px;">Sıralama yükleniyor...</p>
        </div>
    `);
    try {
        const q = query(collection(db, "users"), orderBy("popularity", "desc"), limit(15));
        const snap = await getDocs(q);

        let html = '<div style="display:flex; flex-direction:column; gap:8px; max-height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">';
        let rank = 1;
        snap.forEach(docSnap => {
            const u = docSnap.data();
            if (u.popularity > 0) {
                let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                html += `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px;
                                background:#F9FAFB; border-radius:12px; border:1px solid #E5E7EB; cursor:pointer; transition:0.2s;"
                         onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='#E5E7EB'"
                         onclick="window.closeModal(); window.viewUserProfile('${u.uid}')">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="font-size:18px; font-weight:800; width:25px; text-align:center;">${medal}</div>
                            <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:#E5E7EB; border:1px solid #111827;">
                                ${u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="font-size:20px; text-align:center; line-height:40px;">${u.avatar || '👤'}</div>`}
                            </div>
                            <span style="font-weight:700; font-size:14px;">${u.name} ${u.surname ? u.surname.charAt(0)+'.' : ''}</span>
                        </div>
                        <div style="font-weight:800; color:#111827; font-size:14px; background:white; padding:4px 10px; border-radius:12px; border:1px solid #111827;">${u.popularity} 🔥</div>
                    </div>
                `;
                rank++;
            }
        });

        if (rank === 1) html += '<p style="text-align:center; color:var(--text-gray); padding:20px;">Henüz popülerlik puanı kazanan kimse yok. İlk sen ol!</p>';

        let btnHtml = `<button id="join-tour-btn-modal" class="btn-primary" style="width:100%; padding:14px; border-radius:12px; background:#111827; border:none; font-weight:bold;" onclick="window.closeModal(); window.startPopularityTournament();">Savaşa Katıl ⚔️</button>`;
        if (window.userProfile && window.userProfile.lastTournamentDate) {
            let timeDiff = Date.now() - window.userProfile.lastTournamentDate;
            if (timeDiff < (24 * 60 * 60 * 1000)) btnHtml = `<button id="join-tour-btn-modal" disabled class="btn-primary" style="width:100%; padding:14px; border-radius:12px; background:#9CA3AF; border:none; font-weight:bold; cursor:not-allowed;">⏳ Bekleniyor...</button>`;
        }
        html += `</div>${btnHtml}`;
        document.getElementById('modal-body').innerHTML = html;
    } catch (e) {
        document.getElementById('modal-body').innerHTML = '<p style="color:red; text-align:center;">Sıralama yüklenirken hata oluştu.</p>';
    }
};

// ─── FAST MATCH ──────────────────────────────────────────────────────────────

window.initEmbeddedFastMatch = async function() {
    let count = window.userProfile.fastMatchCount || 0;
    let today = new Date().toLocaleDateString();

    if (window.userProfile.fastMatchDate !== today) {
        count = 0;
        window.userProfile.fastMatchCount = 0;
        window.userProfile.fastMatchDate = today;
        await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: 0, fastMatchDate: today });
    }

    const container = document.getElementById('embedded-fast-match-container');
    if (!container) return;

    let maxSwipes = window.userProfile.isPremium ? 30 : 10;

    if (count >= maxSwipes) {
        const isPremium = window.userProfile.isPremium;

        let canJoinTournament = true;
        let tCooldownStr = "";
        let remainingSecs = 0;

        if (window.userProfile && window.userProfile.lastTournamentDate) {
            let timeDiff = Date.now() - window.userProfile.lastTournamentDate;
            let cooldown = 24 * 60 * 60 * 1000;
            if (timeDiff < cooldown) {
                canJoinTournament = false;
                let remaining = cooldown - timeDiff;
                remainingSecs = Math.floor(remaining / 1000);
                let h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                let m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                let s = Math.floor((remaining % (1000 * 60)) / 1000).toString().padStart(2, '0');
                tCooldownStr = `⏳ ${h}:${m}:${s}`;
            }
        }

        let top3 = [];
        try {
            const q = query(collection(db, "users"), orderBy("popularity", "desc"), limit(3));
            const snap = await getDocs(q);
            snap.forEach(docSnap => top3.push(docSnap.data()));
        } catch (e) { console.error("Kürsü yüklenemedi", e); }

        let podiumHtml = `
            <div style="margin-top:20px; width:100%; display:flex; justify-content:center; align-items:flex-end; gap:10px; height:150px; padding:0 15px; box-sizing:border-box;">
                ${top3[1] ? `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[1].uid}')">
                    <img src="${top3[1].avatarUrl || ''}" style="width:45px; height:45px; border-radius:50%; border:3px solid #C0C0C0; object-fit:cover; background:#1F2937; margin-bottom:5px;">
                    <span style="font-size:11px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[1].name}</span>
                    <div style="width:100%; background:linear-gradient(to top, #e2e8f0, #f8fafc); height:50px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#64748b; border:1px solid #cbd5e1; border-bottom:none; box-shadow:0 -2px 10px rgba(0,0,0,0.05);">2.</div>
                </div>
                ` : '<div style="flex:1;"></div>'}
                ${top3[0] ? `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[0].uid}')">
                    <img src="${top3[0].avatarUrl || ''}" style="width:55px; height:55px; border-radius:50%; border:3px solid #FBBF24; object-fit:cover; background:#1F2937; z-index:5; margin-bottom:5px;">
                    <span style="font-size:12px; font-weight:900; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[0].name}</span>
                    <div style="width:100%; background:linear-gradient(to top, #fef3c7, #fffbeb); height:80px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#b45309; border:1px solid #fde68a; border-bottom:none; box-shadow:0 -4px 15px rgba(251,191,36,0.3);">1.</div>
                </div>
                ` : '<div style="flex:1;"></div>'}
                ${top3[2] ? `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center;" onclick="window.viewUserProfile('${top3[2].uid}')">
                    <img src="${top3[2].avatarUrl || ''}" style="width:45px; height:45px; border-radius:50%; border:3px solid #CD7F32; object-fit:cover; background:#1F2937; margin-bottom:5px;">
                    <span style="font-size:11px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${top3[2].name}</span>
                    <div style="width:100%; background:linear-gradient(to top, #ffedd5, #fffbeb); height:40px; border-radius:8px 8px 0 0; display:flex; align-items:center; justify-content:center; font-weight:900; color:#b45309; border:1px solid #fde047; border-bottom:none; box-shadow:0 -2px 10px rgba(0,0,0,0.05);">3.</div>
                </div>
                ` : '<div style="flex:1;"></div>'}
            </div>
        `;

        container.innerHTML = `
            <div style="width:100%; max-width:380px; display:flex; flex-direction:row; gap:12px; padding:10px;">
                <div style="flex:1; background:#1F2937; border-radius:16px; padding:15px 10px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.15); aspect-ratio:1/1.15; border:1px solid #374151;">
                    <div style="font-size:24px; margin-bottom:5px;">⚡</div>
                    <h4 style="margin:0 0 5px 0; color:white; font-size:13px; text-align:center;">Hızlı Eşleşme</h4>
                    ${isPremium ? `
                        <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 10px 0; line-height:1.4;">Bugünlük hakkın doldu, yarın bir daha gel!</p>
                        <div style="background:#374151; padding:8px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" id="fast-match-timer">⏳ Bekleniyor...</div>
                    ` : `
                        <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 5px 0; line-height:1.4;">Daha fazla eşleşme için</p>
                        <button onclick="window.openPremiumModal()" style="background:white; color:#111827; border:1px solid #D1D5DB; border-radius:8px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:8px; transition:0.2s;">Premium Ol ☆</button>
                        <div style="background:#374151; padding:6px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" id="fast-match-timer">⏳ Bekleniyor...</div>
                    `}
                </div>
                <div style="flex:1; background:#1F2937; border-radius:16px; padding:15px 10px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.15); aspect-ratio:1/1.15; border:1px solid #374151;">
                    <div style="font-size:24px; margin-bottom:5px;" class="white-flame-icon">🔥</div>
                    <h4 style="margin:0 0 5px 0; color:white; font-size:13px; text-align:center;">Popülerlik Savaşı</h4>
                    <p style="font-size:11px; color:#9CA3AF; text-align:center; margin:0 0 10px 0; line-height:1.4;">Kampüsün en popülerlerini seç veya seçil! 👑</p>
                    ${canJoinTournament ? `
                        <button onclick="window.startPopularityTournament()" style="background:white; color:#111827; border:none; border-radius:8px; padding:8px; font-size:12px; font-weight:bold; cursor:pointer; width:100%; transition:0.2s;">Savaşa Katıl ⚔️</button>
                    ` : `
                        <div style="background:#374151; padding:8px 5px; border-radius:8px; font-weight:800; color:white; font-size:12px; width:100%; box-sizing:border-box; text-align:center;" data-remaining="${remainingSecs}" id="pop-battle-timer">${tCooldownStr}</div>
                    `}
                </div>
            </div>
            <div style="flex:1; width:100%; min-height:50px; display:flex; flex-direction:column; justify-content:flex-end;">
                ${top3.length > 0 ? podiumHtml : '<p style="text-align:center; color:#9CA3AF; font-size:12px;">Henüz kürsüye çıkan kimse yok!</p>'}
            </div>
        `;

        if (window.fastMatchTimerInterval) clearInterval(window.fastMatchTimerInterval);
        window.fastMatchTimerInterval = setInterval(() => {
            const timerEl = document.getElementById('fast-match-timer');
            if (timerEl) {
                const now = new Date();
                const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const diff = tomorrow - now;
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                timerEl.innerText = `⏳ ${h}:${m}:${s}`;
            }
            const popTimerEl = document.getElementById('pop-battle-timer');
            if (popTimerEl) {
                let rem = parseInt(popTimerEl.getAttribute('data-remaining'));
                if (rem > 0) {
                    rem -= 1;
                    popTimerEl.setAttribute('data-remaining', rem);
                    let h = Math.floor(rem / 3600).toString().padStart(2, '0');
                    let m = Math.floor((rem % 3600) / 60).toString().padStart(2, '0');
                    let s = (rem % 60).toString().padStart(2, '0');
                    popTimerEl.innerText = `⏳ ${h}:${m}:${s}`;
                } else {
                    popTimerEl.outerHTML = `<button onclick="window.startPopularityTournament()" style="background:white; color:#111827; border:none; border-radius:8px; padding:8px; font-size:12px; font-weight:bold; cursor:pointer; width:100%; transition:0.2s; animation: fadeIn 0.3s ease;">Savaşa Katıl ⚔️</button>`;
                }
            }
        }, 1000);

        return;
    }

    container.innerHTML = `
        <div style="text-align:center; padding:10px; display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:40px; animation: glowPulse 1.5s infinite alternate; margin-bottom:15px;">🔍</div>
            <h3 style="color:var(--text-gray);">Kampüste birileri aranıyor...</h3>
        </div>
    `;

    try {
        const querySnapshot = await getDocs(query(collection(db, "users"), limit(50)));
        const interactedUids = window.chatsDB
            .filter(c => c.status === 'accepted' || c.status === 'blocked')
            .map(c => c.otherUid);

        window.fastMatchUsers = [];
        querySnapshot.forEach((docSnap) => {
            const u = docSnap.data();
            if (u.uid !== window.userProfile.uid && !interactedUids.includes(u.uid)) {
                window.fastMatchUsers.push(u);
            }
        });

        if (window.fastMatchUsers.length === 0) {
            container.innerHTML = `
                <div style="padding:40px 10px; text-align:center; background:white; border-radius:16px; width:100%; max-width:320px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size:50px; margin-bottom:15px;">🌟</div>
                    <h3 style="color:var(--text-dark); margin-bottom:10px;">Şu an kimse yok!</h3>
                    <p style="color:var(--text-gray); font-size:13px; margin-bottom:15px;">Ağda karşılaşacak kimse kalmadı. Lütfen daha sonra tekrar kontrol et.</p>
                    <button id="join-tour-btn-empty" class="btn-primary" style="width:100%; justify-content:center; padding:12px; background:#111827; border:none; border-radius:12px;" onclick="window.startPopularityTournament()">Savaşa Katıl ⚔️</button>
                </div>
            `;
            return;
        }

        window.fastMatchUsers = window.fastMatchUsers.sort(() => 0.5 - Math.random());
        window.fastMatchCurrentIndex = 0;
        window.renderEmbeddedFastMatchCard();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color:red;">Kullanıcılar yüklenirken hata oluştu.</p>';
    }
};

window.renderEmbeddedFastMatchCard = function() {
    const container = document.getElementById('embedded-fast-match-container');
    if (!container) return;

    let maxSwipes = window.userProfile.isPremium ? 30 : 10;

    if (window.fastMatchCurrentIndex >= window.fastMatchUsers.length) {
        window.fastMatchUsers = window.fastMatchUsers.sort(() => 0.5 - Math.random());
        window.fastMatchCurrentIndex = 0;
    }

    const u = window.fastMatchUsers[window.fastMatchCurrentIndex];
    const initial = u.surname ? u.surname.charAt(0) + '.' : '';
    const premiumIcon = u.isPremium ? '<span style="font-size:18px; margin-left:6px; text-shadow:0 1px 2px rgba(0,0,0,0.5);" title="Premium Üye">👑</span>' : '';

    let avatarHtml = u.avatarUrl
        ? `<img src="${u.avatarUrl}" style="width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;">`
        : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); display:flex; align-items:center; justify-content:center; font-size:80px; pointer-events:none;">${u.avatar || '👤'}</div>`;

    let tagsHtml = '';
    if (u.interests && Array.isArray(u.interests)) {
        tagsHtml = u.interests.slice(0, 3).map(tag => `<span style="font-size:11px; background:rgba(255,255,255,0.25); color:white; padding:4px 10px; border-radius:12px; font-weight:700; margin-right:4px; margin-bottom:4px; backdrop-filter:blur(5px); display:inline-block; border:1px solid rgba(255,255,255,0.3);">${tag}</span>`).join('');
    }

    let remaining = maxSwipes - window.userProfile.fastMatchCount;
    let headerText = window.userProfile.isPremium
        ? `<span style="color:#111827; font-size:12px; font-weight:bold; background:white; padding:4px 12px; border-radius:12px; margin-bottom:10px; display:inline-block; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.05);">Kalan Hakkın: ${remaining} / 30 (Premium)</span>`
        : `<span style="color:#EF4444; font-size:12px; font-weight:bold; background:#FEF2F2; padding:4px 12px; border-radius:12px; margin-bottom:10px; display:inline-block; border:1px solid #FCA5A5;">Kalan Hakkın: ${remaining} / 10</span>`;

    container.innerHTML = `
        ${headerText}
        <div id="swipe-card" class="swipe-card">
            <div class="swipe-card-img-wrapper">${avatarHtml}</div>
            <div style="position:absolute; bottom:0; left:0; right:0; padding:40px 15px 45px 15px; background:linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%); z-index:2; text-align:left; border-bottom-left-radius:20px; border-bottom-right-radius:20px; pointer-events:none;">
                <h2 style="margin:0 0 6px 0; color:white; font-size:22px; display:flex; align-items:center; text-shadow:0 2px 4px rgba(0,0,0,0.6);">${u.name} ${initial} ${u.age ? `<span style="font-weight:normal; margin-left:8px; font-size:18px; opacity:0.9;">${u.age}</span>` : ''} ${premiumIcon}</h2>
                <div style="font-size:13px; color:#e2e8f0; font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:4px; text-shadow:0 1px 2px rgba(0,0,0,0.5);"><span style="font-size:15px;">🏛️</span> ${u.faculty || 'Kampüs Öğrencisi'}</div>
                <div style="display:flex; flex-wrap:wrap; margin-bottom:0;">${tagsHtml}</div>
            </div>
            <div style="position:absolute; bottom:-28px; left:0; right:0; display:flex; justify-content:center; gap:25px; z-index:10;">
                <button onclick="window.handleSwipe('left')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#EF4444; font-size:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(239,68,68,0.3); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 25px rgba(239,68,68,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 20px rgba(239,68,68,0.3)';">✖</button>
                <button onclick="window.handleSwipe('right')" style="width:60px; height:60px; border-radius:50%; background:white; border:none; color:#10B981; font-size:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(16,185,129,0.3); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 25px rgba(16,185,129,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 20px rgba(16,185,129,0.3)';">❤</button>
            </div>
        </div>
        <div style="height:35px;"></div>
    `;
};

window.handleSwipe = async function(direction) {
    const card = document.getElementById('swipe-card');
    if (!card) return;

    window.userProfile.fastMatchCount += 1;
    try {
        await updateDoc(doc(db, "users", window.userProfile.uid), { fastMatchCount: window.userProfile.fastMatchCount });
    } catch (e) {}

    let maxSwipes = window.userProfile.isPremium ? 30 : 10;

    if (direction === 'left') {
        card.style.transform = 'translateX(-200px) rotate(-20deg)';
        card.style.opacity = '0';
        setTimeout(() => {
            window.fastMatchCurrentIndex++;
            if (window.userProfile.fastMatchCount >= maxSwipes) {
                window.initEmbeddedFastMatch();
            } else {
                window.renderEmbeddedFastMatchCard();
            }
        }, 300);
    } else if (direction === 'right') {
        card.style.transform = 'translateX(200px) rotate(20deg)';
        card.style.opacity = '0';
        const u = window.fastMatchUsers[window.fastMatchCurrentIndex];
        window.sendFriendRequest(u.uid, `${u.name} ${u.surname ? u.surname : ''}`, true);
        setTimeout(() => {
            window.fastMatchCurrentIndex++;
            if (window.userProfile.fastMatchCount >= maxSwipes) {
                window.initEmbeddedFastMatch();
            } else {
                window.renderEmbeddedFastMatchCard();
            }
        }, 300);
    }
};

// ─── TOURNAMENT ──────────────────────────────────────────────────────────────

window.startPopularityTournament = async function() {
    const container = document.getElementById('embedded-fast-match-container');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <div style="font-size:50px; animation: glowPulse 1.5s infinite alternate;" class="white-flame-icon">🔥</div>
            <h3 style="color:var(--text-dark); margin-bottom:10px;">Adaylar Toplanıyor...</h3>
            <p style="color:var(--text-gray); font-size:13px;">Tarafını seçmeye hazırlan!</p>
        </div>
    `;

    try {
        const qSnap = await getDocs(query(collection(db, "users"), limit(100)));
        let allUsers = [];
        qSnap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.uid !== window.userProfile.uid) allUsers.push(d);
        });

        allUsers = allUsers.sort(() => 0.5 - Math.random()).slice(0, 32);

        while (allUsers.length < 32) {
            allUsers.push({ uid: "bot_" + Math.random().toString(36).substr(2, 9), name: "Sistem Botu 🤖", age: "?", faculty: "UniLoop", avatar: "🤖", isClone: true });
        }

        window.tData = { bracket: allUsers, winners: [], currentMatch: 0, stage: 'groups', semiLosers: [], finalists: [], finalWinner: null, secondPlace: null, thirdPlace: null };
        window.renderTournamentRound();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color:red; text-align:center;">Turnuva başlatılamadı.</p>';
    }
};

window.tourSelect = function(index) {
    const selectedUser = window.tData.bracket[index];
    window.tData.winners.push(selectedUser);
    if (window.tData.stage === 'semis') {
        const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
        window.tData.semiLosers.push(window.tData.bracket[loserIndex]);
    }
    if (window.tData.stage === 'thirdPlace') { window.tData.thirdPlace = selectedUser; }
    if (window.tData.stage === 'final') {
        window.tData.finalWinner = selectedUser;
        const loserIndex = index % 2 === 0 ? index + 1 : index - 1;
        window.tData.secondPlace = window.tData.bracket[loserIndex];
    }
    window.tData.currentMatch++;
    window.renderTournamentRound();
};

window.renderTournamentRound = function() {
    const container = document.getElementById('embedded-fast-match-container');
    if (!container) return;
    const t = window.tData;

    let totalMatchesInStage = 0;
    if (t.stage === 'groups')     totalMatchesInStage = 8;
    if (t.stage === 'quarters')   totalMatchesInStage = 4;
    if (t.stage === 'semis')      totalMatchesInStage = 2;
    if (t.stage === 'thirdPlace') totalMatchesInStage = 1;
    if (t.stage === 'final')      totalMatchesInStage = 1;

    if (t.currentMatch >= totalMatchesInStage) {
        if (t.stage === 'groups')      { t.stage = 'quarters';   t.bracket = [...t.winners]; }
        else if (t.stage === 'quarters') { t.stage = 'semis';    t.bracket = [...t.winners]; }
        else if (t.stage === 'semis')    { t.stage = 'thirdPlace'; t.finalists = [...t.winners]; t.bracket = [...t.semiLosers]; }
        else if (t.stage === 'thirdPlace') { t.stage = 'final';  t.bracket = [...t.finalists]; }
        else if (t.stage === 'final')    { window.finishTournament(); return; }
        t.winners = [];
        t.currentMatch = 0;
        window.renderTournamentRound();
        return;
    }

    let stageTitle = '';
    if (t.stage === 'groups')     stageTitle = `🔥 Grup Aşaması (${t.currentMatch+1}/8)`;
    if (t.stage === 'quarters')   stageTitle = `⚡ Çeyrek Final (${t.currentMatch+1}/4)`;
    if (t.stage === 'semis')      stageTitle = `⚔️ Yarı Final (${t.currentMatch+1}/2)`;
    if (t.stage === 'thirdPlace') stageTitle = `🥉 3. lük Maçı`;
    if (t.stage === 'final')      stageTitle = `🏆 BÜYÜK FİNAL`;

    if (t.stage === 'groups') {
        const baseIdx = t.currentMatch * 4;
        const users = [t.bracket[baseIdx], t.bracket[baseIdx+1], t.bracket[baseIdx+2], t.bracket[baseIdx+3]];
        container.innerHTML = `
            <div style="text-align:center; margin-bottom:10px; width:100%;">
                <h3 style="margin:0; color:#111827; font-size:18px;">${stageTitle}</h3>
                <p style="font-size:12px; color:var(--text-gray); margin:5px 0 0 0;">En favori profilini seç!</p>
            </div>
            <div class="tour-grid-4">
                ${users.map((u, i) => `
                    <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+i}), 150);">
                        ${u.avatarUrl ? `<img src="${u.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:40px;">${u.avatar||'👤'}</div>`}
                        <div class="tour-card-name" style="padding-top:40px;">
                            <span style="font-size:10px; color:#D1D5DB; display:block; margin-bottom:2px; font-weight:normal;">${u.age ? u.age : '?'} Yaş • ${u.faculty ? u.faculty : 'Belirtilmemiş'}</span>
                            ${u.name}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        const baseIdx = t.currentMatch * 2;
        const u1 = t.bracket[baseIdx];
        const u2 = t.bracket[baseIdx+1];
        container.innerHTML = `
            <div style="text-align:center; margin-bottom:10px; width:100%;">
                <h3 style="margin:0; color:#111827; font-size:20px;">${stageTitle}</h3>
                <p style="font-size:12px; color:var(--text-gray); margin:5px 0 0 0;">Kazanması gerekeni seç!</p>
            </div>
            <div class="tour-grid-2">
                <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx}), 150);" style="aspect-ratio: 0.8;">
                    ${u1.avatarUrl ? `<img src="${u1.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u1.avatar||'👤'}</div>`}
                    <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                        <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u1.age ? u1.age : '?'} Yaş • ${u1.faculty ? u1.faculty : 'Belirtilmemiş'}</span>
                        ${u1.name}
                    </div>
                </div>
                <div class="tour-card" onclick="this.style.transform='scale(0.95)'; setTimeout(() => window.tourSelect(${baseIdx+1}), 150);" style="aspect-ratio: 0.8;">
                    ${u2.avatarUrl ? `<img src="${u2.avatarUrl}" class="tour-card-img">` : `<div style="width:100%;height:100%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:50px;">${u2.avatar||'👤'}</div>`}
                    <div class="tour-card-name" style="font-size:16px; padding-top:40px;">
                        <span style="font-size:11px; color:#D1D5DB; display:block; margin-bottom:4px; font-weight:normal;">${u2.age ? u2.age : '?'} Yaş • ${u2.faculty ? u2.faculty : 'Belirtilmemiş'}</span>
                        ${u2.name}
                    </div>
                </div>
            </div>
        `;
    }
};

window.finishTournament = async function() {
    const container = document.getElementById('embedded-fast-match-container');
    if (!container) return;
    const t = window.tData;

    container.innerHTML = `<div style="text-align:center; padding:30px;"><div style="font-size:40px; animation: glowPulse 1s infinite alternate;">⏳</div><h3 style="color:var(--text-dark);">Sonuçlar Kaydediliyor...</h3></div>`;

    try {
        const nowTs = Date.now();
        await updateDoc(doc(db, "users", window.userProfile.uid), { lastTournamentDate: nowTs });
        window.userProfile.lastTournamentDate = nowTs;

        if (t.finalWinner && !t.finalWinner.isClone) {
            const uDoc = await getDoc(doc(db, "users", t.finalWinner.uid));
            if (uDoc.exists()) await updateDoc(doc(db, "users", t.finalWinner.uid), { popularity: (uDoc.data().popularity || 0) + 3 });
        }
        if (t.secondPlace && !t.secondPlace.isClone) {
            const uDoc = await getDoc(doc(db, "users", t.secondPlace.uid));
            if (uDoc.exists()) await updateDoc(doc(db, "users", t.secondPlace.uid), { popularity: (uDoc.data().popularity || 0) + 2 });
        }
        if (t.thirdPlace && !t.thirdPlace.isClone) {
            const uDoc = await getDoc(doc(db, "users", t.thirdPlace.uid));
            if (uDoc.exists()) await updateDoc(doc(db, "users", t.thirdPlace.uid), { popularity: (uDoc.data().popularity || 0) + 1 });
        }

        container.innerHTML = `
            <div style="position:relative; text-align:center; padding:20px; background:white; border-radius:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05); width:100%; max-width:350px;">
                <button onclick="window.loadPage('home')" style="position:absolute; top:10px; right:10px; background:transparent; border:none; font-size:24px; color:#9CA3AF; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">✖</button>
                <div style="font-size:50px; margin-bottom:10px; margin-top:10px;">🎉</div>
                <h3 style="color:#111827; margin-bottom:20px;">Savaş Sona Erdi!</h3>
                <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; text-align:left;">
                    <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                        <span style="font-size:24px;">🥇</span>
                        <span style="font-weight:800; flex:1; color:#111827;">${t.finalWinner.name}</span>
                        <span style="font-weight:bold; color:var(--text-gray);">${t.finalWinner.isClone ? 'BOT' : '+3 🔥'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                        <span style="font-size:24px;">🥈</span>
                        <span style="font-weight:800; flex:1; color:#111827;">${t.secondPlace.name}</span>
                        <span style="font-weight:bold; color:var(--text-gray);">${t.secondPlace.isClone ? 'BOT' : '+2 🔥'}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; background:#F9FAFB; padding:10px; border-radius:10px; border:1px solid #E5E7EB;">
                        <span style="font-size:24px;">🥉</span>
                        <span style="font-weight:800; flex:1; color:#111827;">${t.thirdPlace.name}</span>
                        <span style="font-weight:bold; color:var(--text-gray);">${t.thirdPlace.isClone ? 'BOT' : '+1 🔥'}</span>
                    </div>
                </div>
                <button class="btn-primary" style="width:100%; justify-content:center; padding:12px; border-radius:12px; font-weight:800;" onclick="window.showLeaderboard()">Liderlik Tablosunu Gör</button>
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color:red;">Sonuçlar kaydedilirken hata oluştu.</p>';
    }
};

// ─── WEBRTC / FREQUENCY CHAT ─────────────────────────────────────────────────
// (Tüm ses chat (Kampüs Frekansı) kodu burada yer alır)

let voiceSearchTimeout = null;
let voiceQueueUnsubscribe = null;
window.callRole = null;

const rtcConfig = {
    iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:stun4.l.google.com:19302'] }
    ]
};

window.openFrequency = function() {
    const freqChat = document.getElementById('embedded-voice-chat');
    const mainContent = document.getElementById('main-content');
    if (freqChat) {
        freqChat.style.display = 'flex';
        freqChat.classList.add('active');
        if (mainContent) { mainContent.style.visibility = 'hidden'; mainContent.style.height = '0'; }
        document.body.style.backgroundColor = "#FFFFFF";
        window.scrollTo(0, 0);
    }
    window.lastMatchedUid = null;
    if (!document.getElementById('remote-audio-node')) {
        const audioNode = document.createElement('audio');
        audioNode.id = 'remote-audio-node';
        audioNode.autoplay = true;
        document.body.appendChild(audioNode);
    }
    window.startFrequencySearch();
};

window.closeFrequency = async function() {
    const freqChat = document.getElementById('embedded-voice-chat');
    const mainContent = document.getElementById('main-content');
    if (freqChat) {
        freqChat.style.display = 'none';
        freqChat.classList.remove('active');
        if (mainContent) { mainContent.style.visibility = 'visible'; mainContent.style.height = 'auto'; }
    }
    clearTimeout(voiceSearchTimeout);
    if (voiceQueueUnsubscribe) voiceQueueUnsubscribe();
    clearInterval(window.freqTimerInterval);
    window.endWebRTCCall();
    try { await deleteDoc(doc(db, "voice_queue", window.userProfile.uid)); } catch (e) {}
    window.switchFrequencyState('state-search');
};

window.switchFrequencyState = function(stateId) {
    document.querySelectorAll('#embedded-voice-chat .screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(stateId);
    if (target) target.classList.add('active');
};

window.setupLocalAudio = async function() {
    try {
        window.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        window.freqAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = window.freqAudioContext.createMediaStreamSource(window.localStream);
        const analyser = window.freqAudioContext.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const bars = [1,2,3,4,5,6,7].map(i => document.getElementById(`bar-${i}`));
        function animateBars() {
            if (!window.localStream) return;
            requestAnimationFrame(animateBars);
            analyser.getByteFrequencyData(dataArray);
            for (let i = 0; i < 7; i++) {
                let val = dataArray[i + 2] || 0;
                let height = Math.max(10, (val / 255) * 50);
                if (bars[i]) { bars[i].style.height = `${height}px`; bars[i].style.background = height > 20 ? '#34d399' : '#059669'; }
            }
        }
        animateBars();
        return true;
    } catch (err) {
        alert("Mikrofon izni alınamadı! Konuşabilmek için cihaz ayarlarından izin verin.");
        return false;
    }
};

window.endWebRTCCall = function() {
    if (window.callUnsubscribe) { window.callUnsubscribe(); window.callUnsubscribe = null; }
    if (window.iceUnsubscribe)  { window.iceUnsubscribe();  window.iceUnsubscribe  = null; }
    if (window.peerConnection)  { window.peerConnection.close(); window.peerConnection = null; }
    if (window.localStream)     { window.localStream.getTracks().forEach(t => t.stop()); window.localStream = null; }
    if (window.freqAudioContext){ window.freqAudioContext.close(); window.freqAudioContext = null; }
    const remoteAudio = document.getElementById('remote-audio-node');
    if (remoteAudio) { remoteAudio.pause(); remoteAudio.srcObject = null; }
    if (window.callDocId) { deleteDoc(doc(db, "calls", window.callDocId)).catch(e => {}); window.callDocId = null; }
};

window.createWebRTCCall = async function(calleeUid) {
    window.callDocId = window.userProfile.uid + "_" + calleeUid;
    const callDoc = doc(db, "calls", window.callDocId);
    const offerCandidates  = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    window.peerConnection = new RTCPeerConnection(rtcConfig);
    window.localStream.getTracks().forEach(track => window.peerConnection.addTrack(track, window.localStream));

    window.peerConnection.ontrack = (event) => {
        const remoteAudio = document.getElementById('remote-audio-node');
        if (remoteAudio) { remoteAudio.srcObject = event.streams[0]; remoteAudio.play().catch(e => {}); }
    };
    window.peerConnection.onicecandidate = event => {
        if (event.candidate) { addDoc(offerCandidates, event.candidate.toJSON()); }
    };
    window.peerConnection.onconnectionstatechange = () => {
        if (window.peerConnection.connectionState === 'disconnected' || window.peerConnection.connectionState === 'failed') {
            window.startFrequencySearch();
        }
    };

    const offerDescription = await window.peerConnection.createOffer();
    await window.peerConnection.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await setDoc(callDoc, { offer });

    window.callUnsubscribe = (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (!window.peerConnection.currentRemoteDescription && data?.answer) {
            await window.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
        if (data?.reveal_caller && data?.reveal_callee) { window.executeMutualReveal(); }
    });

    (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                window.peerConnection.addIceCandidate(candidate).catch(e => {});
            }
        });
    });
};

window.answerWebRTCCall = async function(callerUid) {
    window.callDocId = callerUid + "_" + window.userProfile.uid;
    const callDoc = doc(db, "calls", window.callDocId);
    const offerCandidates  = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    window.peerConnection = new RTCPeerConnection(rtcConfig);
    window.localStream.getTracks().forEach(track => window.peerConnection.addTrack(track, window.localStream));

    window.peerConnection.ontrack = (event) => {
        const remoteAudio = document.getElementById('remote-audio-node');
        if (remoteAudio) { remoteAudio.srcObject = event.streams[0]; remoteAudio.play().catch(e => {}); }
    };
    window.peerConnection.onicecandidate = event => {
        if (event.candidate) { addDoc(answerCandidates, event.candidate.toJSON()); }
    };
    window.peerConnection.onconnectionstatechange = () => {
        if (window.peerConnection.connectionState === 'disconnected' || window.peerConnection.connectionState === 'failed') {
            window.startFrequencySearch();
        }
    };

    const callData = (await getDoc(callDoc)).data();
    await window.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
    const answerDescription = await window.peerConnection.createAnswer();
    await window.peerConnection.setLocalDescription(answerDescription);
    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
    await updateDoc(callDoc, { answer });

    window.callUnsubscribe = (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (data?.reveal_caller && data?.reveal_callee) { window.executeMutualReveal(); }
    });

    (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                window.peerConnection.addIceCandidate(candidate).catch(e => {});
            }
        });
    });
};

window.startFrequencySearch = async function() {
    window.switchFrequencyState('state-search');
    window.endWebRTCCall();

    const myUid = window.userProfile.uid;
    try {
        await deleteDoc(doc(db, "voice_queue", myUid));
    } catch (e) {}

    voiceSearchTimeout = setTimeout(async () => {
        if (voiceQueueUnsubscribe) voiceQueueUnsubscribe();
        try { await deleteDoc(doc(db, "voice_queue", myUid)); } catch (e) {}
    }, 30000);

    try {
        const snapshot = await getDocs(query(collection(db, "voice_queue"), where("status", "==", "waiting"), limit(10)));
        let partnerFound = null;
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            if (d.uid !== myUid && d.uid !== window.lastMatchedUid && !partnerFound) { partnerFound = d; }
        });

        if (partnerFound) {
            clearTimeout(voiceSearchTimeout);
            await updateDoc(doc(db, "voice_queue", partnerFound.uid), { status: "matched", matchedWith: myUid });
            const micReady = await window.setupLocalAudio();
            if (!micReady) { window.closeFrequency(); return; }
            window.callRole = 'caller';
            await window.createWebRTCCall(partnerFound.uid);
            const pDoc = await getDoc(doc(db, "users", partnerFound.uid));
            window.currentVoiceMatch = pDoc.exists() ? pDoc.data() : { uid: partnerFound.uid, name: "Kampüs Öğrencisi", faculty: "Gizli", avatar: "🕵️" };
            window.lastMatchedUid = partnerFound.uid;
            window.connectFrequencyChat();
        } else {
            await setDoc(doc(db, "voice_queue", myUid), { uid: myUid, status: "waiting", matchedWith: null, timestamp: serverTimestamp() });
            voiceQueueUnsubscribe = (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).onSnapshot(doc(db, "voice_queue", myUid), async (docSnap) => {
                if (docSnap.exists() && docSnap.data().status === "matched") {
                    clearTimeout(voiceSearchTimeout);
                    if (voiceQueueUnsubscribe) voiceQueueUnsubscribe();
                    const matchedUid = docSnap.data().matchedWith;
                    try { await deleteDoc(doc(db, "voice_queue", myUid)); } catch (e) {}
                    const micReady = await window.setupLocalAudio();
                    if (!micReady) { window.closeFrequency(); return; }
                    window.callRole = 'callee';
                    await window.answerWebRTCCall(matchedUid);
                    const pDoc = await getDoc(doc(db, "users", matchedUid));
                    window.currentVoiceMatch = pDoc.exists() ? pDoc.data() : { uid: matchedUid, name: "Kampüs Öğrencisi", faculty: "Gizli", avatar: "🕵️" };
                    window.lastMatchedUid = matchedUid;
                    window.connectFrequencyChat();
                }
            });
        }
    } catch (e) { console.error("Eşleşme hatası:", e); }
};

window.skipFrequencyUser = function() { window.startFrequencySearch(); };

window.connectFrequencyChat = function() {
    window.switchFrequencyState('state-chat');
    window.startFrequencyTimer();
    document.getElementById('reveal-btn').style.display = 'block';
    document.getElementById('skip-btn').style.display = 'block';
    document.getElementById('reveal-status').style.display = 'none';
    document.getElementById('reveal-status').innerText = 'Karşı tarafın onayı bekleniyor ⏳';
    document.getElementById('reveal-status').style.color = '#f59e0b';
};

window.startFrequencyTimer = function() {
    let isPremium = window.userProfile && window.userProfile.isPremium;
    let maxSeconds = (isPremium ? 30 : 10) * 60;
    clearInterval(window.freqTimerInterval);
    window.freqTimerInterval = setInterval(() => {
        maxSeconds--;
        const m = Math.floor(maxSeconds / 60).toString().padStart(2, '0');
        const s = (maxSeconds % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('chat-timer');
        if (timerEl) { timerEl.innerText = `Kalan Süre: ${m}:${s}`; timerEl.style.color = maxSeconds <= 60 ? '#ef4444' : '#fcd34d'; }
        if (maxSeconds <= 0) { clearInterval(window.freqTimerInterval); alert("Süre sınırına ulaştınız! Başka birine bağlanıyorsunuz."); window.startFrequencySearch(); }
    }, 1000);
};

window.requestReveal = async function() {
    document.getElementById('reveal-btn').style.display = 'none';
    const statusEl = document.getElementById('reveal-status');
    if (statusEl.innerText.includes('Karşı taraf maskesini indirdi')) { statusEl.innerText = 'Eşleşme onaylanıyor...'; }
    else { statusEl.style.display = 'block'; statusEl.style.color = '#f59e0b'; statusEl.innerText = 'Karşı tarafın onayı bekleniyor ⏳'; }
    if (window.callDocId && window.callRole) {
        try { await updateDoc(doc(db, "calls", window.callDocId), { ['reveal_' + window.callRole]: true }); } catch (e) {}
    }
};

window.executeMutualReveal = function() {
    const matchUser = window.currentVoiceMatch;
    if (matchUser) {
        const avImg = document.getElementById('reveal-avatar');
        if (avImg) avImg.src = matchUser.avatarUrl || "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70);
        const nameEl = document.getElementById('reveal-name');
        if (nameEl) nameEl.innerText = matchUser.name + (matchUser.age ? ", " + matchUser.age : "");
        const facEl = document.getElementById('reveal-faculty');
        if (facEl) facEl.innerText = matchUser.faculty || "Kampüs Öğrencisi";
    }
    window.switchFrequencyState('state-revealed');
};

window.addRevealedFriend = function() {
    if (window.currentVoiceMatch && window.currentVoiceMatch.uid && window.currentVoiceMatch.uid !== "anon") {
        window.sendFriendRequest(window.currentVoiceMatch.uid, window.currentVoiceMatch.name);
        const btn = document.getElementById('add-friend-btn');
        if (btn) { btn.innerText = "İstek Gönderildi ✔️"; btn.style.background = "#4b5563"; btn.disabled = true; }
    } else {
        alert("Bilinmeyen bir kullanıcıya istek gönderilemez.");
    }
};
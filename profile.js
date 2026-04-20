// ============================================================================
// 👤 UNILOOP - PROFILE PAGE
// ============================================================================

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    updateDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadString,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// NOTE: db, auth, storage, allFaculties, chatsDB, confessionsDB, marketDB,
// mainContent are imported/shared from the core engine (app.js globals).

// ============================================================================
// RENDER PROFILE (Ana Profil Sayfası)
// ============================================================================

window.renderProfile = function() {
    const u = window.userProfile;
    const initial = u.surname ? u.surname.charAt(0) + '.' : '';
    const isPremium = u.isPremium;

    let avatarHtml = u.avatarUrl
        ? `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
             <img src="${u.avatarUrl}" class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}">
             <div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
           </div>`
        : `<div style="position:relative; cursor:pointer;" onclick="document.getElementById('profile-avatar-upload').click()">
             <div class="id-card-avatar" style="${isPremium ? 'border-color:#111827;' : ''}">${u.avatar || '👤'}</div>
             <div style="position:absolute; bottom:0; right:0; background:white; color:#111827; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.2);">📷</div>
           </div>`;

    let tagsHtml = '';
    if (u.interests && Array.isArray(u.interests)) {
        tagsHtml = u.interests.map(tag => `<span class="id-tag" style="background:white; color:#111827; border:1px solid #111827;">${tag}</span>`).join('');
    }

    const premiumBadgeHtml = isPremium
        ? `<div style="background:white; color:#111827; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-top:5px;">☆ Premium Üye</div>`
        : ``;

    const friendsCount = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat).length;

    let html = `
        <input type="file" id="profile-avatar-upload" accept="image/*" style="display:none;" onchange="window.openCropper(event, 'profile')">

        <div class="id-card ${isPremium ? 'premium-card-bw' : ''}" style="width:100%; max-width:100%; box-sizing:border-box; margin-top:10px; margin-bottom:15px; position:relative; ${isPremium ? 'border-color:#111827;' : ''}">
            <button class="edit-profile-icon" style="position:absolute; top:15px; right:15px; background:white; color:#111827; border:1px solid #111827;" onclick="window.openProfileEditModal()">✏️ Düzenle</button>
            <div class="id-card-left">${avatarHtml}</div>
            <div class="id-card-right">
                <div class="id-card-name" style="color:#111827;">${u.name} ${initial}</div>
                <div style="font-size:12px; color:#111827; margin-bottom:4px; font-weight:600;">${u.username ? u.username : '@kullanici_adi'}</div>
                <div class="id-card-faculty" style="color:#111827;">${u.faculty || 'Bölüm belirtilmemiş'} ${u.grade ? ' - ' + u.grade + '. Sınıf' : ''}</div>
                <div class="id-card-details">
                    <span style="color:#111827;">🏫 ${u.university || 'UniLoop'}</span>
                    <span style="color:#111827;">🎂 ${u.age ? u.age + ' Yaşında' : 'Yaş belirtilmemiş'}</span>
                    <span style="color:#111827; font-weight:bold;">🔥 Popülerlik: ${u.popularity || 0}</span>
                    ${premiumBadgeHtml}
                </div>
                <div class="id-card-tags">${tagsHtml}</div>
            </div>
        </div>

        <button class="btn-primary" style="width:100%; padding:14px; font-size:15px; border-radius:12px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; background:white; color:#111827; box-shadow:none; border:1px solid #111827; transition:0.2s;" onclick="window.openFriendsList()">
            <span style="font-size:20px;">👥</span> <strong>Arkadaşlarım (${friendsCount})</strong>
        </button>

        <div class="card" style="margin-bottom:15px;">
            <h3 style="font-size:15px; margin-bottom:10px; color:#111827; border-bottom:1px solid #111827; padding-bottom:8px;">İstatistiklerim</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">
                <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                    <div style="font-size:20px; font-weight:800; color:#111827;">${confessionsDB.filter(c => c.authorId === u.uid).length}</div>
                    <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Gönderi</div>
                </div>
                <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                    <div style="font-size:20px; font-weight:800; color:#111827;">${marketDB.filter(m => m.sellerId === u.uid).length}</div>
                    <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Market İlanı</div>
                </div>
                <div style="background:white; padding:15px 10px; border-radius:12px; border:1px solid #111827;">
                    <div style="font-size:20px; font-weight:800; color:#111827;">${friendsCount}</div>
                    <div style="font-size:11px; color:#111827; font-weight:bold; margin-top:4px;">Bağlantı</div>
                </div>
            </div>
        </div>

        ${!isPremium ? `
        <div class="card premium-glow" style="margin-bottom:15px; background:white; border:1px solid #111827; cursor:pointer;" onclick="window.openPremiumModal()">
            <div style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <div style="font-weight:800; color:#111827; font-size:16px; margin-bottom:4px;">🌟 UniLoop Premium'a Geç</div>
                    <div style="font-size:12px; color:#111827; font-weight:bold;">Kampüsün en popüler kişisi ol, sınırları kaldır!</div>
                </div>
                <div style="font-size:24px;">👑</div>
            </div>
        </div>
        ` : ''}

        <button class="card" style="width:100%; padding:16px; margin-bottom:20px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; border:1px solid #111827; cursor:pointer; color:#111827; font-weight:bold; transition:transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);" onclick="window.renderSettings()">
            <span style="font-size:20px;">⚙️</span> <strong style="font-size:15px;">Hesap Ayarları</strong>
        </button>
    `;
    mainContent.innerHTML = html;
};

// ============================================================================
// ARKADAŞ LİSTESİ
// ============================================================================

window.openFriendsList = function() {
    const friends = chatsDB.filter(c => c.status === 'accepted' && !c.isMarketChat);

    if (friends.length === 0) {
        window.openModal('👥 Arkadaşlarım', `
            <div style="text-align:center; padding:30px 10px; color:var(--text-gray);">
                <div style="font-size:40px; margin-bottom:10px;">🤷‍♂️</div>
                <div style="font-size:14px;">Henüz bağlantı kurduğunuz bir arkadaşınız yok.</div>
                <button class="btn-primary" style="margin-top:15px; padding:10px 20px; border-radius:10px; font-size:13px; background:white; color:#111827; border:1px solid #111827;" onclick="window.closeModal(); window.loadPage('home')">Keşfetmeye Başla</button>
            </div>
        `);
        return;
    }

    let listHtml = `<div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">`;
    friends.forEach(f => {
        let avatarHtml = f.avatar && f.avatar.startsWith('http')
            ? `<img src="${f.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #111827;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background:white; color:#111827; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #111827;">${f.avatar || '👤'}</div>`;

        listHtml += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:white; border:1px solid #111827; border-radius:12px;">
                <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="window.viewUserProfile('${f.otherUid}')">
                    ${avatarHtml}
                    <span style="font-weight:700; font-size:14px; color:#111827;">${f.name}</span>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:8px; box-shadow:none; background:white; color:#111827; border:1px solid #111827;" onclick="window.openChatViewDirect('${f.id}'); window.closeModal();">💬 Mesaj</button>
                </div>
            </div>
        `;
    });
    listHtml += `</div>`;

    window.openModal(`👥 Arkadaşlarım (${friends.length})`, listHtml);
};

// ============================================================================
// DİĞER KULLANICI PROFİLİNİ GÖRÜNTÜLE
// ============================================================================

window.viewUserProfile = async function(targetUid) {
    if (!targetUid) {
        alert("Kullanıcı verisi eksik!");
        return;
    }

    if (targetUid === window.userProfile.uid) {
        window.loadPage('profile');
        return;
    }

    const isFriend = chatsDB.some(c => c.otherUid === targetUid && c.status === 'accepted' && !c.isMarketChat);

    if (!window.userProfile.isPremium && !isFriend) {
        window.openModal('🔒 Detaylı Profil Kilitli', `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:50px; margin-bottom:15px; filter: blur(2px);">👀</div>
                <h3 style="color:var(--text-dark); margin-bottom:10px;">Gizli Profil!</h3>
                <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px; line-height:1.5;">Detaylı profile bakabilmek için Premium üye ol. Tüm blurları kaldır ve kampüstekileri yakından tanı!</p>
                <button style="width:100%; justify-content:center; padding: 16px; font-size: 16px; background:white; color:#111827; border:1px solid #111827; border-radius:12px; cursor:pointer; font-weight:bold;" onclick="window.openPremiumModal()">☆ Premium'a Yükselt</button>
            </div>
        `);
        return;
    }

    try {
        const db = getFirestore();
        const docSnap = await getDoc(doc(db, "users", targetUid));
        if (docSnap.exists()) {
            const u = docSnap.data();

            try {
                const viewRecord = {
                    uid: window.userProfile.uid,
                    name: window.userProfile.name,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString()
                };
                await updateDoc(doc(db, "users", targetUid), {
                    profileViewers: arrayUnion(viewRecord)
                });

                if (u.isPremium) {
                    window.sendSystemNotification(targetUid, `👀 <strong>${window.userProfile.name}</strong> profilini inceledi! (Premium Özelliği)`);
                }
            } catch (err) {
                console.warn("Görüntülenme kaydedilemedi, ancak profil açılıyor.");
            }

            const initial = u.surname ? u.surname.charAt(0) + '.' : '';
            const isPremium = u.isPremium;

            let avatarHtml = u.avatarUrl
                ? `<img src="${u.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'};">`
                : `<div style="width:100px; height:100px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:40px; border:3px solid ${isPremium ? '#111827' : '#E5E7EB'}; margin:0 auto;">${u.avatar || '👤'}</div>`;

            const ageText = u.age ? u.age + " yaşında" : "Yaş belirtilmemiş";
            const facText = u.faculty ? u.faculty : "Fakülte belirtilmemiş";
            const gradeText = u.grade ? u.grade + ". Sınıf" : "";
            const premiumBadge = isPremium
                ? `<div style="margin-top:8px; display:inline-block; background:#111827; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:1px solid #111827; box-shadow:0 2px 4px rgba(0,0,0,0.1);">☆ Premium Üye</div>`
                : '';

            const existingChat = chatsDB.find(c => c.otherUid === u.uid && !c.isMarketChat);
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
                    <p style="color:#111827; font-size:14px; margin-bottom: 5px; font-weight:bold;">${facText} ${gradeText ? ' - ' + gradeText : ''}</p>
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

// ============================================================================
// PROFİL DÜZENLEME MODALİ
// ============================================================================

window.openProfileEditModal = function() {
    const u = window.userProfile;
    const uNameStr = u.username ? u.username.replace('#', '') : '';

    let facOptions = allFaculties.map(f => `<option value="${f}" ${u.faculty === f ? 'selected' : ''}>${f}</option>`).join('');

    window.openModal('✏️ Profilini Düzenle', `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
                <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kullanıcı Adı</label>
                <div style="display:flex; align-items:center; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:0 10px;">
                    <span style="color:var(--primary); font-weight:bold; font-size:14px;">#</span>
                    <input type="text" id="edit-username" value="${uNameStr}" style="border:none; background:transparent; width:100%; padding:12px 5px; outline:none; font-size:14px;">
                </div>
            </div>
            <div>
                <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Yaş</label>
                <input type="number" id="edit-age" value="${u.age || ''}" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
            </div>
            <div>
                <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Fakülte</label>
                <select id="edit-faculty" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
                    <option value="">Fakülte Seçiniz</option>
                    ${facOptions}
                </select>
            </div>
            <div>
                <label style="font-size:12px; font-weight:bold; color:var(--text-gray); margin-bottom:4px; display:block;">Kaçıncı Sınıf</label>
                <select id="edit-grade" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white;">
                    <option value="1" ${u.grade == '1' ? 'selected' : ''}>1. Sınıf</option>
                    <option value="2" ${u.grade == '2' ? 'selected' : ''}>2. Sınıf</option>
                    <option value="3" ${u.grade == '3' ? 'selected' : ''}>3. Sınıf</option>
                    <option value="4" ${u.grade == '4' ? 'selected' : ''}>4. Sınıf</option>
                    <option value="5" ${u.grade == '5' ? 'selected' : ''}>5. Sınıf</option>
                    <option value="6" ${u.grade == '6' ? 'selected' : ''}>6. Sınıf</option>
                </select>
            </div>
            <button class="btn-primary" style="width:100%; padding:14px; border-radius:10px; font-size:15px; font-weight:bold; margin-top:10px;" onclick="window.saveProfileEdits()">Değişiklikleri Kaydet</button>
        </div>
    `);
};

window.saveProfileEdits = async function() {
    const usernameInput = document.getElementById('edit-username').value.trim().toLowerCase().replace(/\s+/g, '');
    const newAge = document.getElementById('edit-age').value.trim();
    const newFaculty = document.getElementById('edit-faculty').value;
    const newGrade = document.getElementById('edit-grade').value;

    if (!usernameInput || !newAge || !newFaculty) return alert("Lütfen tüm alanları eksiksiz doldurun.");

    const finalUsername = '#' + usernameInput;

    try {
        const db = getFirestore();
        if (finalUsername !== window.userProfile.username) {
            const qU = query(collection(db, "users"), where("username", "==", finalUsername));
            const snap = await getDocs(qU);
            if (!snap.empty) {
                alert("Bu kullanıcı adı alınmış. Lütfen başka bir tane seçin.");
                return;
            }
        }

        await updateDoc(doc(db, "users", window.userProfile.uid), {
            username: finalUsername,
            age: newAge,
            faculty: newFaculty,
            grade: newGrade
        });

        window.userProfile.username = finalUsername;
        window.userProfile.age = newAge;
        window.userProfile.faculty = newFaculty;
        window.userProfile.grade = newGrade;

        alert("Profil bilgileriniz başarıyla güncellendi!");
        window.closeModal();
        window.renderProfile();

    } catch (e) {
        console.error(e);
        alert("Güncellenirken hata oluştu.");
    }
};

// ============================================================================
// AVATAR YÜKLEME (Profil Fotoğrafı)
// ============================================================================

window.uploadProfileAvatarDirect = async function(base64Image) {
    try {
        const storage = getStorage();
        const db = getFirestore();
        const fileName = window.userProfile.uid + '_avatar_' + Date.now() + '.jpg';
        const storageRef = ref(storage, 'avatars/' + fileName);
        await uploadString(storageRef, base64Image, 'data_url');
        const url = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "users", window.userProfile.uid), { avatarUrl: url });
        window.userProfile.avatarUrl = url;
        window.renderProfile();
        alert("Profil fotoğrafınız başarıyla güncellendi!");
    } catch (e) {
        console.error(e);
        alert("Fotoğraf yüklenirken hata oluştu: " + e.message);
    }
};

// ============================================================================
// AYARLAR MODALİ
// ============================================================================

window.renderSettings = function() {
    const currentLang = localStorage.getItem('uniloop_lang') || 'tr';

    let premiumCancelHtml = window.userProfile.isPremium
        ? `<a href="#" onclick="event.preventDefault(); window.cancelPremium()" style="display:block; text-align:center; font-size:12px; color:#111827; font-weight:bold; text-decoration:underline; margin-bottom:15px;">Premium Üyeliğimi İptal Et</a>`
        : '';

    window.openModal('⚙️ Ayarlar', `
        <div style="display:flex; flex-direction:column; gap:15px;">
            <div class="form-group" style="margin:0;">
                <label style="font-size:13px; font-weight:bold; color:var(--text-dark); margin-bottom:5px; display:block;">Dil Seçimi</label>
                <select onchange="window.setLanguage(this.value)" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; background:#F9FAFB;">
                    <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
                    <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                </select>
            </div>

            <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>

            <button class="btn-primary" style="width:100%; padding:14px; font-weight:bold; font-size:15px; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px; background:#4B5563; border-color:#4B5563;" onclick="window.logout()">🚪 Güvenli Çıkış Yap</button>

            <div style="border-top:1px solid #E5E7EB; margin:10px 0;"></div>

            <a href="#" onclick="event.preventDefault(); window.deleteAccount()" style="display:block; text-align:center; font-size:12px; color:#EF4444; text-decoration:underline; margin-bottom:5px;">Hesabımı Sil</a>

            ${premiumCancelHtml}

            <a href="#" onclick="event.preventDefault(); window.openLegalModal()" style="display:block; text-align:center; font-size:12px; color:var(--primary); text-decoration:underline;">Kullanıcı Sözleşmesi ve Hakları</a>

            <div style="text-align:center; font-size:11px; color:#9CA3AF; margin-top:5px;">
                UniLoop v3.2.0 Pro<br>Made with ❤️ for Students
            </div>
        </div>
    `);
};

window.setLanguage = function(lang) {
    localStorage.setItem('uniloop_lang', lang);
    window.renderSettings();
};

// ============================================================================
// HESAP SİLME
// ============================================================================

window.deleteAccount = async function() {
    if (confirm("Emin misin? Hesabın kalıcı olarak silinecek!")) {
        if (confirm("Emin misin? Tüm verilerin, mesajların ve eşleşmelerin tamamen kaybolacak!")) {
            if (confirm("Son onay: Bu işlem kesinlikle geri alınamaz. Devam edilsin mi?")) {
                try {
                    const auth = getAuth();
                    const db = getFirestore();
                    const user = auth.currentUser;
                    if (user) {
                        await deleteDoc(doc(db, "users", user.uid));
                        await deleteUser(user);
                        alert("Hesabınız başarıyla silindi. Elveda!");
                        window.location.reload();
                    }
                } catch (e) {
                    if (e.code === 'auth/requires-recent-login') {
                        alert("Güvenlik nedeniyle hesabınızı silmek için yeniden giriş yapmanız gerekmektedir. Lütfen çıkış yapıp tekrar girin ve silme işlemini tekrar başlatın.");
                    } else {
                        alert("Hata: " + e.message);
                    }
                }
            }
        }
    }
};

// ============================================================================
// PREMİUM İPTAL
// ============================================================================

window.cancelPremium = async function() {
    if (confirm("Premium üyeliğinizi iptal etmek istediğinize emin misiniz? Gelecek ay aboneliğiniz yenilenmeyecektir.")) {
        try {
            const db = getFirestore();
            await updateDoc(doc(db, "users", window.userProfile.uid), { isPremium: false });
            window.userProfile.isPremium = false;

            const navBtn = document.getElementById('nav-premium-action');
            if (navBtn) {
                navBtn.outerHTML = `<div class="menu-item premium-glow" id="nav-premium-action" style="height:36px; display:inline-flex; align-items:center; justify-content:center; background:white; color:#111827; border:1px solid #111827; padding:0 16px; border-radius:18px; font-weight:700; font-size:13px; cursor:pointer; box-sizing:border-box; margin:0;" onclick="window.openPremiumModal()">☆ Premium</div>`;
            }

            alert("Premium üyeliğiniz başarıyla iptal edildi.");
            window.closeModal();
            window.renderSettings();
        } catch (e) {
            alert("Hata oluştu: " + e.message);
        }
    }
};

// ============================================================================
// AKADEMİK YIL GÜNCELLEME MODALİ
// ============================================================================

window.showAcademicYearUpdateModal = function(activeYear) {
    let facOptions = allFaculties.map(f => `<option value="${f}" ${window.userProfile.faculty === f ? 'selected' : ''}>${f}</option>`).join('');

    window.openModal('🎓 Yeni Akademik Yıl!', `
        <div style="text-align:center; padding:10px;">
            <div style="font-size:40px; margin-bottom:10px;">🎉</div>
            <h3 style="color:var(--text-dark); margin-bottom:10px;">Yeni Eğitim Yılı Başladı!</h3>
            <p style="color:var(--text-gray); font-size:14px; margin-bottom:20px;">Geçtiğimiz akademik yılı geride bıraktık. Arşiv haklarının sıfırlanması ve profilinin güncellenmesi için lütfen güncel sınıfını ve fakülteni onayla.</p>

            <select id="reset-faculty" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white; margin-bottom:10px;">
                <option value="">Fakülte Seçiniz</option>
                ${facOptions}
            </select>

            <select id="reset-grade" style="width:100%; padding:12px; border-radius:10px; border:1px solid #E5E7EB; outline:none; font-size:14px; box-sizing:border-box; background:white; margin-bottom:15px;">
                <option value="1" ${window.userProfile.grade == '1' ? 'selected' : ''}>1. Sınıf</option>
                <option value="2" ${window.userProfile.grade == '2' ? 'selected' : ''}>2. Sınıf</option>
                <option value="3" ${window.userProfile.grade == '3' ? 'selected' : ''}>3. Sınıf</option>
                <option value="4" ${window.userProfile.grade == '4' ? 'selected' : ''}>4. Sınıf</option>
                <option value="5" ${window.userProfile.grade == '5' ? 'selected' : ''}>5. Sınıf</option>
                <option value="6" ${window.userProfile.grade == '6' ? 'selected' : ''}>6. Sınıf</option>
            </select>

            <button class="btn-primary" style="width:100%; padding:14px; border-radius:10px; font-size:15px; font-weight:bold;" onclick="window.saveAcademicYearReset(${activeYear})">Güncelle ve Arşivi Sıfırla</button>
        </div>
    `);

    setTimeout(() => {
        const closeBtn = document.querySelector('#app-modal .close-btn') || document.getElementById('modal-close');
        if (closeBtn) closeBtn.style.display = 'none';
    }, 100);
};

window.saveAcademicYearReset = async function(activeYear) {
    const newFac = document.getElementById('reset-faculty').value;
    const newGr = document.getElementById('reset-grade').value;
    if (!newFac || !newGr) return alert("Lütfen fakülte ve sınıf seçin.");

    try {
        const db = getFirestore();
        await updateDoc(doc(db, "users", window.userProfile.uid), {
            faculty: newFac,
            grade: newGr,
            lastArchiveResetYear: activeYear,
            lockedArchiveFaculty: "",
            lockedArchiveGrade: ""
        });
        window.userProfile.faculty = newFac;
        window.userProfile.grade = newGr;
        window.userProfile.lastArchiveResetYear = activeYear;
        window.userProfile.lockedArchiveFaculty = "";
        window.userProfile.lockedArchiveGrade = "";

        alert("Harika! Yeni yıl profilin güncellendi ve arşiv kilidin sıfırlandı.");

        const closeBtn = document.querySelector('#app-modal .close-btn') || document.getElementById('modal-close');
        if (closeBtn) closeBtn.style.display = 'block';

        window.closeModal();
        window.renderProfile();
    } catch (e) {
        alert("Hata oluştu: " + e.message);
    }
};

// ============================================================================
// KULLANICI SÖZLEŞMESİ MODALİ
// ============================================================================

window.openLegalModal = function() {
    window.openModal('⚖️ Kullanıcı Sözleşmesi ve Hakları', `
        <div style="max-height: 400px; overflow-y: auto; font-size: 13px; color: var(--text-dark); line-height: 1.6; padding-right: 5px; text-align:left;">
            <h4 style="margin-top:0; color:var(--primary);">1. Taraflar ve Kapsam</h4>
            <p>Bu sözleşme, UniLoop platformunu ("Sistem") kullanan tüm üyeler için geçerlidir. Platform, KKTC (Kuzey Kıbrıs Türk Cumhuriyeti) ve Türkiye Cumhuriyeti kanunlarına tabidir ve hizmetler bu yasal çerçevede sunulmaktadır.</p>

            <h4 style="color:var(--primary);">2. Kullanım Şartları</h4>
            <p>Kullanıcılar yasadışı, hakaret içeren, tehditkar, müstehcen veya başkalarının telif haklarını/kişisel haklarını ihlal eden içerikler paylaşamazlar. Kullanıcıların platform üzerinde gerçekleştirdiği tüm eylemler kendi sorumluluğundadır. Sistem sahibi veya yöneticileri bu ihlallerden hiçbir suretle hukuki veya cezai olarak sorumlu tutulamaz.</p>

            <h4 style="color:var(--primary);">3. Gizlilik Politikası</h4>
            <p>Kullanıcı verileri (e-posta, isim, vb.) güvenli sunucularda saklanır. Bu veriler, yasal zorunluluklar veya yetkili makamların resmi talepleri dışında kesinlikle 3. şahıslarla veya kurumlarla paylaşılmaz.</p>

            <h4 style="color:var(--primary);">4. İhlal ve Fesih Politikası</h4>
            <p>Yukarıda belirtilen kurallara uymayan hesaplar, sistem yöneticileri tarafından önceden haber verilmeksizin kalıcı olarak askıya alınabilir veya silinebilir. Sistem, ihlal durumunda yasal mercilerle işbirliği yapma hakkını saklı tutar.</p>

            <div style="margin-top:20px; font-weight:bold; text-align:center; font-size:12px; color:var(--text-gray);">
                Sisteme kayıt olan her kullanıcı, bu şartları okumuş ve kabul etmiş sayılır.
            </div>
        </div>
        <button class="btn-primary" style="width:100%; margin-top:15px; padding:12px; border-radius:10px;" onclick="window.closeModal(); window.renderSettings();">Geri Dön</button>
    `);
};
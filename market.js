// ============================================================================
// 🌟 UNILOOP - MARKET PAGE
// ============================================================================
// Market.js — Kampüs Market sayfası ve tüm ilan işlemleri:
//   • renderListings()          → Market ana sayfası ve arama
//   • drawListingsGrid()        → İlan grid render
//   • openListingDetail()       → İlan detay modal
//   • openListingForm()         → Yeni ilan form modal
//   • previewMarketImages()     → Resim/PDF önizleme
//   • submitListing()           → İlan kaydetme
//   • editListing()             → Fiyat güncelleme
//   • deleteListing()           → İlan silme
//   • sendMarketMessage()       → Satıcıya mesaj gönderme
//   • openLightbox / closeLightbox / changeLightboxImage / updateLightboxView
// ============================================================================

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const db      = getFirestore();
const storage = getStorage();

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────

window.renderListings = function(type, title) {
    const mainContent = document.getElementById('main-content');
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap:wrap; gap:10px;">
                <h2 style="margin:0;">${title}</h2>
                <button class="btn-primary" style="width:auto; padding: 10px 24px;" onclick="window.openListingForm('${type}')">+ Yeni İlan Ekle</button>
            </div>
            <input type="text" id="local-search-input" class="local-search-bar" placeholder="${title} içinde hızlıca ara...">
            <div class="market-grid" id="listings-grid-container"></div>
        </div>
    `;

    mainContent.innerHTML = html;
    window.drawListingsGrid(type, '');

    const searchInput = document.getElementById('local-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => { window.drawListingsGrid(type, e.target.value.toLowerCase()); });
    }
};

// ─── GRID RENDER ─────────────────────────────────────────────────────────────

window.drawListingsGrid = function(type, filterText) {
    const container = document.getElementById('listings-grid-container');
    if (!container) return;

    const filteredData = window.marketDB.filter(item =>
        item.type === type &&
        (item.title.toLowerCase().includes(filterText) || item.desc.toLowerCase().includes(filterText))
    );

    if (filteredData.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-gray); text-align:center; padding: 40px 0;">Henüz ilan yok veya bulunamadı.</p>`;
        return;
    }

    let gridHtml = '';
    filteredData.forEach(item => {
        let imgHtml = '';
        const displayCurrency = item.currency || '₺';

        if (item.isPdf) {
            imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#F9FAFB;"><span style="font-size:40px;">📄</span><span style="font-size:12px; font-weight:bold; color:#EF4444; margin-top:5px;">PDF Dosyası</span></div>`;
        } else if (item.imgUrl) {
            imgHtml = `<img src="${item.imgUrl}" alt="İlan" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            imgHtml = `<div style="font-size:48px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">📦</div>`;
        }

        gridHtml += `
            <div class="item-card" onclick="window.openListingDetail('${item.id}')">
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

// ─── LISTING DETAIL ───────────────────────────────────────────────────────────

window.openListingDetail = function(docId) {
    const item = window.marketDB.find(i => i.id === docId);
    if (!item) return;

    let imgHtml = '';
    let indicatorsHtml = '';
    const displayCurrency = item.currency || '₺';

    if (item.isPdf) {
        imgHtml = `<div style="width:100%; height:250px; background:#F9FAFB; border:2px dashed #EF4444; border-radius:12px; margin-bottom:16px; display:flex; align-items:center; justify-content:center; flex-direction:column;"><span style="font-size:60px;">📄</span><h3 style="color:#EF4444; margin-top:10px; margin-bottom:5px;">PDF Dosyası</h3><p style="font-size:13px; color:var(--text-gray);">Bu içerik bir PDF belgesidir.</p></div>`;
    } else if (item.imgUrls && item.imgUrls.length > 0) {
        imgHtml += '<div class="image-gallery" style="height:250px; border-radius:12px; margin-bottom:16px;">';
        const imgArrayStr = encodeURIComponent(JSON.stringify(item.imgUrls));
        item.imgUrls.forEach((url, i) => {
            imgHtml += `<div class="gallery-item" onclick="window.openLightbox('${imgArrayStr}', ${i})" style="cursor:pointer;"><img src="${url}" alt="İlan" style="border-radius:12px;"></div>`;
            indicatorsHtml += `<div class="gallery-dot ${i === 0 ? 'active' : ''}"></div>`;
        });
        imgHtml += '</div>';
        if (item.imgUrls.length > 1) { imgHtml += `<div class="gallery-indicators" style="bottom: 25px;">${indicatorsHtml}</div>`; }
    } else if (item.imgUrl) {
        const singleImgStr = encodeURIComponent(JSON.stringify([item.imgUrl]));
        imgHtml = `<img src="${item.imgUrl}" onclick="window.openLightbox('${singleImgStr}', 0)" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:16px; cursor:pointer;">`;
    }

    let actionButtonsHtml = '';
    const currentUid = window.userProfile.uid;
    const safeTitle  = item.title.replace(/'/g, "\\'");

    if (item.sellerId === currentUid) {
        actionButtonsHtml = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="action-btn" style="flex:1; padding:12px;" onclick="window.editListing('${item.id}', '${safeTitle}', '${item.price}')">✏️ Fiyatı Güncelle</button>
                <button class="btn-danger" style="flex:1; padding:12px;" onclick="window.deleteListing('${item.id}'); window.closeModal();">🗑️ Sil</button>
            </div>
        `;
    } else {
        const existingChat        = window.chatsDB.find(c => c.otherUid === item.sellerId && c.isMarketChat);
        const hasMessagedThisListing = existingChat && existingChat.listingIds && existingChat.listingIds.includes(item.id);

        if (hasMessagedThisListing) {
            actionButtonsHtml = `
                <button class="btn-primary" style="margin-top: 20px; width:100%; padding:12px; font-size:15px; background:#10B981; border-color:#10B981; box-shadow:0 4px 6px rgba(16,185,129,0.3);" onclick="window.openChatViewDirect('${existingChat.id}'); window.closeModal();">
                    💬 Mevcut Sohbete Git
                </button>
            `;
        } else {
            actionButtonsHtml = `
                <button class="btn-primary" style="margin-top: 20px; width:100%; padding:12px; font-size:15px; box-shadow:0 4px 6px rgba(79,70,229,0.3);" onclick="window.sendMarketMessage('${item.sellerId}', '${item.sellerName}', '${safeTitle}', '${item.id}'); window.closeModal();">
                    💬 Satıcıya Mesaj Gönder
                </button>
            `;
        }
    }

    window.openModal(item.title, `
        <div style="position:relative;">${imgHtml}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:24px; font-weight:800; color:#059669;">${item.price} ${displayCurrency}</div>
            <div style="font-size:13px; color:var(--text-gray); background:#F3F4F6; padding:6px 12px; border-radius:20px;">Satıcı: <strong>${item.sellerName}</strong></div>
        </div>
        <div style="font-size:15px; line-height:1.6; color:var(--text-dark); background:#F9FAFB; padding:16px; border-radius:12px; border:1px solid var(--border-color);">${item.desc}</div>
        ${actionButtonsHtml}
    `);
};

// ─── DELETE / EDIT ────────────────────────────────────────────────────────────

window.deleteListing = async function(docId) {
    if (confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) {
        try {
            await deleteDoc(doc(db, "listings", docId));
            alert("İlan başarıyla silindi!");
        } catch (e) { console.error(e); alert("Silinirken bir hata oluştu: " + e.message); }
    }
};

window.editListing = async function(docId, oldTitle, oldPrice) {
    let newPrice = prompt(`"${oldTitle}" için yeni fiyatı girin (Sadece rakam):`, oldPrice);
    if (newPrice !== null && newPrice.trim() !== "") {
        try {
            await updateDoc(doc(db, "listings", docId), { price: newPrice.trim() });
            alert("İlan fiyatı güncellendi!");
        } catch (e) { console.error(e); alert("Hata: " + e.message); }
    }
};

// ─── NEW LISTING FORM ─────────────────────────────────────────────────────────

window.previewMarketImages = function(event) {
    const files = Array.from(event.target.files).slice(0, 3);
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';
    files.forEach(file => {
        if (file.type === "application/pdf") {
            previewContainer.innerHTML += `<div class="preview-box" style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; background:#F9FAFB; border:1px solid #E5E7EB; width:80px; height:80px; border-radius:8px; margin-right:8px;"><span style="font-size:30px;">📄</span><span style="font-size:10px; color:#EF4444; font-weight:bold; margin-top:5px;">PDF</span></div>`;
        } else {
            const reader = new FileReader();
            reader.onload = function(ev) {
                previewContainer.innerHTML += `<div class="preview-box" style="width:80px; height:80px; overflow:hidden; border-radius:8px; border:1px solid #E5E7EB; display:inline-block; margin-right:8px;"><img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;"></div>`;
            };
            reader.readAsDataURL(file);
        }
    });
};

window.openListingForm = function(type) {
    window.openModal('🛒 Kampüs Market İlanı Ekle', `
        <div class="form-group">
            <input type="text" id="new-item-title" placeholder="İlan Başlığı (Örn: Temiz Çalışma Masası veya Çıkmış Sorular)">
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
            <textarea id="new-item-desc" rows="3" placeholder="Ürünün durumu ve detayları..."></textarea>
        </div>

        <div class="upload-btn-wrapper" style="margin-bottom: 15px;">
            <button class="action-btn" onclick="document.getElementById('new-item-photo').click()"
                style="width:100%; justify-content:center; padding: 12px; font-weight:bold;
                       background: #EEF2FF; color: var(--primary); border:none; border-radius:12px;">
                📷 Fotoğraf veya 📄 PDF Seç
            </button>
            <input type="file" id="new-item-photo" accept="image/*, application/pdf" multiple style="display:none;"
                onchange="window.previewMarketImages(event)" />
        </div>

        <div id="preview-container" class="preview-container" style="display:flex; flex-wrap:wrap; margin-bottom:15px; min-height:0px;"></div>

        <button class="btn-primary" id="publish-listing-btn" onclick="window.submitListing('${type}')">İlanı Yayınla</button>
        <p id="upload-status" style="font-size:12px; color:var(--primary); text-align:center; margin-top:10px; display:none; font-weight:bold;">
            Dosyalar Yükleniyor, lütfen bekleyin...
        </p>
    `);
};

window.submitListing = async function(type) {
    const title      = document.getElementById('new-item-title').value.trim();
    const price      = document.getElementById('new-item-price').value.trim();
    const currency   = document.getElementById('new-item-currency').value;
    const desc       = document.getElementById('new-item-desc').value.trim();
    const fileInput  = document.getElementById('new-item-photo');
    const files      = fileInput ? fileInput.files : [];

    if (!title || !price || !desc) return alert("Lütfen başlık, fiyat ve açıklama alanlarını eksiksiz doldurun.");

    const btn        = document.getElementById('publish-listing-btn');
    const statusText = document.getElementById('upload-status');
    btn.disabled     = true;
    btn.innerText    = "Yükleniyor... Lütfen Bekleyin";
    if (files.length > 0) statusText.style.display = "block";

    let imgUrls = [];
    let isPdf   = false;

    try {
        for (let i = 0; i < files.length; i++) {
            const file      = files[i];
            if (file.type === "application/pdf") isPdf = true;
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
            const storageRef = ref(storage, 'listings/' + window.userProfile.uid + '/' + Date.now() + '_' + cleanName);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            imgUrls.push(url);
        }

        await addDoc(collection(db, "listings"), {
            type:       type,
            title:      title,
            price:      price,
            currency:   currency,
            desc:       desc,
            sellerId:   window.userProfile.uid,
            sellerName: window.userProfile.name,
            imgUrls:    imgUrls,
            imgUrl:     imgUrls[0] || null,
            isPdf:      isPdf,
            createdAt:  serverTimestamp()
        });

        alert("Harika! İlanınız başarıyla yayınlandı.");
        window.closeModal();
        window.loadPage('market');
    } catch (error) {
        console.error(error);
        alert("İlan yüklenirken bir hata oluştu: " + error.message);
        btn.disabled  = false;
        btn.innerText = "İlanı Yayınla";
        statusText.style.display = "none";
    }
};

// ─── MARKET MESSAGE ───────────────────────────────────────────────────────────

window.sendMarketMessage = async function(sellerId, sellerName, itemTitle, listingId) {
    try {
        const myUid   = window.userProfile.uid;
        const msgText = `Merhaba, "${itemTitle}" başlıklı ilanınızla ilgileniyorum. Durumu nedir?`;
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const existingChat = window.chatsDB.find(c => c.otherUid === sellerId && c.isMarketChat);

        if (existingChat) {
            if (existingChat.listingIds && existingChat.listingIds.includes(listingId)) {
                alert("Bu ilan için satıcıya zaten mesaj gönderdiniz!");
                window.openChatViewDirect(existingChat.id);
                return;
            }
            await updateDoc(doc(db, "chats", existingChat.id), {
                messages:   arrayUnion({ senderId: myUid, text: msgText, time: timeStr, read: false }),
                listingIds: arrayUnion(listingId),
                lastUpdated: (await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")).serverTimestamp()
            });
            alert("Yeni ilan için mesajınız satıcıyla olan sohbetinize eklendi!");
            window.loadPage('messages');
            setTimeout(() => window.openChatView(existingChat.id), 300);
        } else {
            const { default: _db, collection: _coll, addDoc: _add, serverTimestamp: _ts } =
                await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

            const newChatRef = await addDoc(collection(db, "chats"), {
                participants:      [myUid, sellerId],
                participantNames:  { [myUid]: window.userProfile.name, [sellerId]: sellerName },
                participantAvatars:{ [myUid]: window.userProfile.avatarUrl || window.userProfile.avatar || "👨‍🎓", [sellerId]: "👤" },
                lastUpdated:       serverTimestamp(),
                status:            'pending',
                initiator:         myUid,
                isMarketChat:      true,
                listingIds:        [listingId],
                messages:          [{ senderId: myUid, text: msgText, time: timeStr, read: false }]
            });

            const newLocalChat = {
                id: newChatRef.id, otherUid: sellerId, name: sellerName, avatar: "👤",
                messages: [{ senderId: myUid, text: msgText, time: timeStr, read: false }],
                status: 'pending', initiator: myUid, isMarketChat: true, listingIds: [listingId]
            };
            window.chatsDB.unshift(newLocalChat);

            alert("Satıcıya mesaj isteği başarıyla gönderildi!");
            window.loadPage('messages');
            setTimeout(() => window.openChatView(newChatRef.id), 100);
        }
    } catch (error) {
        alert("Hata oluştu: " + error.message);
    }
};

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────

window.currentLightboxImages = [];
window.currentLightboxIndex  = 0;

window.openLightbox = function(imagesJsonStr, index) {
    window.currentLightboxImages = JSON.parse(decodeURIComponent(imagesJsonStr));
    window.currentLightboxIndex  = index;
    window.updateLightboxView();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('active');
    if (!document.getElementById('app-modal').classList.contains('active') &&
        !document.body.classList.contains('no-scroll-messages') &&
        !document.body.classList.contains('no-scroll-home')) {
        document.body.style.overflow = 'auto';
    }
};

window.changeLightboxImage = function(step) {
    window.currentLightboxIndex += step;
    if (window.currentLightboxIndex < 0) window.currentLightboxIndex = window.currentLightboxImages.length - 1;
    if (window.currentLightboxIndex >= window.currentLightboxImages.length) window.currentLightboxIndex = 0;
    window.updateLightboxView();
};

window.updateLightboxView = function() {
    const imgEl     = document.getElementById('lightbox-img');
    const counterEl = document.getElementById('lightbox-counter');
    if (imgEl && counterEl) {
        imgEl.src        = window.currentLightboxImages[window.currentLightboxIndex];
        counterEl.innerText = (window.currentLightboxIndex + 1) + " / " + window.currentLightboxImages.length;
    }
};
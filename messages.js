// ============================================================================
// 🌟 UNILOOP - MESSAGES PAGE
// ============================================================================
// Messages.js — Mesajlaşma sayfası ve tüm sohbet işlemleri:
//   • renderMessages()            → Ana mesajlar layout
//   • renderMessagesSidebarOnly() → Sidebar listesi güncelleme
//   • openChatView()              → Chat detay paneli açma
//   • openChatViewDirect()        → Başka sayfadan direkt sohbet açma
//   • closeChatView()             → Chat panelini kapatma
//   • updateChatMessagesOnly()    → Mesaj baloncuklarını güncelleme
//   • sendDirectMessage()         → Mesaj gönderme
//   • uploadChatMedia()           → Dosya/resim gönderme
//   • acceptChatRequest()         → Arkadaşlık isteği kabul
//   • rejectChatRequest()         → Arkadaşlık isteği red
//   • clearChatHistory()          → Sohbet geçmişini temizleme
//   • blockUser()                 → Kullanıcı engelleme
// ============================================================================

import {
    getFirestore,
    doc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
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

// currentChatId bu modülde yönetilir; app.js'deki resetCurrentChatId hâlâ çalışır.
let currentChatId = null;
window.resetCurrentChatId = function() { currentChatId = null; };

// ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────

window.renderMessages = function() {
    document.body.classList.add('no-scroll-messages');

    let unreadCount = 0;
    window.chatsDB.forEach(chat => {
        if (chat.status === 'accepted' || chat.isMarketChat) {
            if (chat.messages && chat.messages.length > 0) {
                const lastMsg = chat.messages[chat.messages.length - 1];
                if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) unreadCount++;
            }
        }
    });

    const unreadHtml = unreadCount > 0
        ? `<span style="background:var(--primary); color:white; font-size:12px; padding:2px 8px; border-radius:12px; margin-left:5px; vertical-align:middle;">${unreadCount} Yeni</span>`
        : '';

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div id="chat-layout-container" style="display:flex; width:100%; height:100%; flex-direction:row;">
            <div class="chat-sidebar" id="chat-sidebar-main">
                <div class="chat-sidebar-header"
                    style="padding:15px 20px; border-bottom:1px solid #E5E7EB; background:white;
                           position:sticky; top:0; z-index:10; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:20px; font-weight:800;">Sohbetler ${unreadHtml}</h2>
                </div>
                <div id="chat-sidebar-list" style="padding-bottom:20px;"></div>
            </div>
            <div class="chat-main" id="chat-main-area" style="display:none; flex-direction:column; height:100%; position:relative; background:#f9fafb; flex:1;"></div>
        </div>
    `;

    window.renderMessagesSidebarOnly();

    if (currentChatId) {
        window.openChatView(currentChatId);
    } else if (window.innerWidth > 1024 && window.chatsDB.length > 0) {
        window.openChatView(window.chatsDB[0].id);
    }
};

// ─── SIDEBAR LIST ─────────────────────────────────────────────────────────────

window.renderMessagesSidebarOnly = function() {
    const sb = document.getElementById('chat-sidebar-list');
    if (!sb) return;

    let sbHtml = '';
    window.chatsDB.forEach(chat => {
        if (chat.status === 'pending' && !chat.isMarketChat) return;

        const lastMsgObj = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : { text: 'Yeni bağlantı' };
        let lastMsg  = lastMsgObj.text || (lastMsgObj.mediaUrl ? (lastMsgObj.mediaType === 'pdf' ? '📄 PDF Belgesi' : '📷 Fotoğraf') : '');
        const msgTime = lastMsgObj.time || '';
        const isUnread = lastMsgObj.senderId !== window.userProfile.uid && lastMsgObj.read === false;

        let statusBadge = '';
        if (chat.status === 'pending') {
            statusBadge = chat.initiator === window.userProfile.uid
                ? ' <span style="font-size:10px; color:#9CA3AF; font-weight:normal;">(Bekleniyor)</span>'
                : ' <span style="font-size:10px; color:#EF4444; font-weight:bold;">(İstek!)</span>';
        }

        const activeClass  = (chat.id === currentChatId) ? 'active' : '';
        const unreadStyle  = isUnread ? 'font-weight:800; color:var(--text-dark);' : 'color:var(--text-gray);';
        const badgeHtml    = isUnread ? `<div style="width:12px; height:12px; background:var(--primary); border-radius:50%; border:2px solid white; box-shadow:0 0 0 1px var(--primary); margin-left:auto;"></div>` : '';

        let avatarHtml = chat.avatar && chat.avatar.startsWith('http')
            ? `<img src="${chat.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
            : `<div style="width:48px; height:48px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:24px; border:1px solid #E5E7EB;">${chat.avatar || '👤'}</div>`;

        sbHtml += `
            <div class="chat-contact ${activeClass}" onclick="window.openChatView('${chat.id}')"
                style="display:flex; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9; cursor:pointer; gap:12px; transition:background 0.2s;">
                <div style="position:relative; flex-shrink:0;">
                    ${avatarHtml}
                    ${chat.isMarketChat ? '<div style="position:absolute; bottom:-5px; right:-5px; font-size:14px; background:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1);">🛒</div>' : ''}
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                        <span style="font-weight:800; font-size:15px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${chat.name}${statusBadge}</span>
                        <span style="font-size:11px; color:#64748b; margin-left:5px; font-weight:500;">${msgTime}</span>
                    </div>
                    <div style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${unreadStyle}">
                        ${lastMsgObj.senderId === window.userProfile.uid ? 'Sen: ' : ''}${lastMsg}
                    </div>
                </div>
                ${badgeHtml}
            </div>
        `;
    });

    sb.innerHTML = sbHtml || `
        <div style="padding:40px 20px; text-align:center; color:#9CA3AF;">
            <div style="font-size:40px; margin-bottom:10px;">💬</div>
            <div style="font-size:14px; font-weight:500;">Mesajınız yok.</div>
            <div style="font-size:12px; margin-top:5px;">Keşfet'ten yeni insanlarla tanışın.</div>
        </div>
    `;
};

// ─── OPEN CHAT VIEW ───────────────────────────────────────────────────────────

window.openChatViewDirect = function(chatId) {
    window.goToMessages();
    setTimeout(() => { window.openChatView(chatId); }, 100);
};

window.openChatView = function(chatId) {
    currentChatId = chatId;
    const chatLayout = document.getElementById('chat-layout-container');
    if (chatLayout) chatLayout.classList.add('chat-active');

    window.renderMessagesSidebarOnly();

    const chat     = window.chatsDB.find(c => c.id === chatId);
    const mainArea = document.getElementById('chat-main-area');
    if (!chat || !mainArea) return;

    mainArea.style.display = 'flex';

    let avatarHtml = chat.avatar && chat.avatar.startsWith('http')
        ? `<img src="${chat.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #E5E7EB;">`
        : `<div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid #E5E7EB;">${chat.avatar || '👤'}</div>`;

    let headerHtml = `
        <div class="chat-header" style="padding:10px 15px; border-bottom:1px solid #E5E7EB; background:white;
                                         display:flex; align-items:center; gap:12px;
                                         box-shadow: 0 1px 3px rgba(0,0,0,0.02); z-index:10; flex-shrink:0;">
            <button onclick="window.closeChatView()"
                style="background:#F3F4F6; border:none; border-radius:50%; width:40px; height:40px;
                       font-size:20px; cursor:pointer; font-weight:bold; color:var(--text-dark);
                       display:flex; align-items:center; justify-content:center; transition:0.2s;
                       display:block !important; pointer-events:auto; z-index:9999;"
                class="back-btn-mobile">←</button>
            ${avatarHtml}
            <div style="flex:1;">
                <div style="font-weight:800; font-size:16px; color:#0f172a; cursor:pointer;"
                     onclick="window.viewUserProfile('${chat.otherUid}')">${chat.name}</div>
                <div style="font-size:12px; color:#10B981; font-weight:600; display:flex; align-items:center; gap:4px;">
                    <div style="width:8px; height:8px; background:#10B981; border-radius:50%;"></div>
                    ${chat.isMarketChat ? 'Market İletişimi' : 'Kampüs İçi'}
                </div>
            </div>
            <div style="position:relative;">
                <button onclick="document.getElementById('chat-options-menu').classList.toggle('hidden'); event.stopPropagation();"
                    style="background:none; border:none; font-size:20px; color:var(--text-gray); cursor:pointer;"
                    id="chat-options-dropdown-wrapper">⋮</button>
                <div id="chat-options-menu" class="hidden"
                    style="position:absolute; right:0; top:35px; background:white; box-shadow:0 10px 25px rgba(0,0,0,0.1);
                           border-radius:12px; overflow:hidden; z-index:100; min-width:180px; border:1px solid #E5E7EB;">
                    <div onclick="window.clearChatHistory('${chat.id}')"
                        style="padding:14px 15px; font-size:13px; font-weight:600; color:var(--text-dark); cursor:pointer;
                               border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px; transition:0.2s;"
                        onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='white'">
                        🗑️ Geçmişi Sil
                    </div>
                    <div onclick="window.blockUser('${chat.otherUid}', '${chat.id}', '${chat.name}')"
                        style="padding:14px 15px; font-size:13px; font-weight:600; color:#EF4444; cursor:pointer;
                               display:flex; align-items:center; gap:10px; transition:0.2s;"
                        onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='white'">
                        🚫 Kişiyi Engelle
                    </div>
                </div>
            </div>
        </div>
    `;

    let statusAreaHtml = '';
    if (chat.status === 'pending') {
        if (chat.initiator === window.userProfile.uid) {
            statusAreaHtml = `<div style="padding:15px; background:#EEF2FF; text-align:center; font-size:13px; color:#4F46E5; border-bottom:1px solid #E5E7EB; font-weight:700; flex-shrink:0;">⏳ Karşı tarafın onayı bekleniyor. ${chat.isMarketChat ? 'Onaylanana kadar manuel mesaj gönderemezsiniz.' : ''}</div>`;
        } else {
            statusAreaHtml = `
                <div style="padding:20px 15px; background:#F0FDF4; text-align:center; border-bottom:1px solid #E5E7EB; flex-shrink:0;">
                    <div style="font-size:14px; color:#166534; margin-bottom:12px; font-weight:700;">👋 ${chat.name} seninle bağlantı kurmak istiyor.</div>
                    <div style="display:flex; justify-content:center; gap:10px;">
                        <button class="btn-primary" style="padding:10px 20px; background:#10B981; border-color:#10B981; font-size:14px; box-shadow:none; border-radius:10px;" onclick="window.acceptChatRequest('${chat.id}')">✅ Kabul Et</button>
                        <button class="btn-danger" style="padding:10px 20px; font-size:14px; box-shadow:none; border-radius:10px;" onclick="window.rejectChatRequest('${chat.id}')">❌ Reddet</button>
                    </div>
                </div>
            `;
        }
    }

    let mainHtml = `
        ${headerHtml}
        ${statusAreaHtml}
        <div id="chat-messages-scroll" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; background:#f9fafb;">
            <div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px;">Mesajlar yükleniyor...</div>
        </div>
    `;

    if (chat.status === 'accepted') {
        mainHtml += `
            <div class="chat-input-area" style="padding:15px 20px; background:white; border-top:1px solid #E5E7EB; display:flex; gap:12px; align-items:center; flex-shrink:0;">
                <input type="file" id="dm-chat-media" accept="image/*, application/pdf" style="display:none;"
                    onchange="window.uploadChatMedia(event, '${chat.id}', 'dm')">
                <button onclick="document.getElementById('dm-chat-media').click()"
                    style="background:transparent; color:#6B7280; border:none; border-radius:50%; width:40px; height:40px;
                           cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📎</button>
                <input type="text" id="chat-input-field" placeholder="Mesaj yaz..."
                    style="flex:1; padding:14px 20px; border-radius:25px; border:1px solid #E5E7EB;
                           background:#F9FAFB; outline:none; font-size:15px; color:var(--text-dark);">
                <button onclick="window.sendDirectMessage('${chat.id}', '${chat.otherUid}')"
                    style="background:var(--primary); color:white; border:none; border-radius:50%; width:48px; height:48px;
                           cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;
                           box-shadow:0 4px 6px rgba(79,70,229,0.3); flex-shrink:0; transition: transform 0.2s;">➤</button>
            </div>
        `;
    }

    mainArea.innerHTML = mainHtml;
    window.updateChatMessagesOnly(chatId);

    const inputField = document.getElementById('chat-input-field');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendDirectMessage(chat.id, chat.otherUid);
        });
        if (window.innerWidth > 1024) setTimeout(() => inputField.focus(), 100);
    }

    // Okundu işaretle
    if (chat.messages && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.senderId !== window.userProfile.uid && lastMsg.read === false) {
            const updatedMessages = chat.messages.map(m => {
                if (m.senderId !== window.userProfile.uid) m.read = true;
                return m;
            });
            updateDoc(doc(db, "chats", chatId), { messages: updatedMessages }).catch(err => console.error(err));
        }
    }
};

window.closeChatView = function() {
    const chatLayout = document.getElementById('chat-layout-container');
    if (chatLayout) chatLayout.classList.remove('chat-active');
    currentChatId = null;
    window.renderMessagesSidebarOnly();
};

// ─── MESSAGE BUBBLES ──────────────────────────────────────────────────────────

window.updateChatMessagesOnly = function(chatId) {
    if (currentChatId !== chatId) return;
    const scrollBox = document.getElementById('chat-messages-scroll');
    if (!scrollBox) return;

    const chat = window.chatsDB.find(c => c.id === chatId);
    if (!chat) return;

    let chatHTML = '';
    const msgs   = chat.messages || [];

    if (msgs.length === 0) {
        chatHTML = `<div style="text-align:center; padding:20px; color:#9CA3AF; font-size:14px;">Henüz mesaj yok. İlk mesajı sen gönder!</div>`;
    } else {
        msgs.forEach((msg) => {
            const isMe   = msg.senderId === window.userProfile.uid;
            const type   = isMe ? 'sent' : 'received';
            const msgTime = msg.time || '';
            const isRead  = msg.read ? '✓✓' : '✓';

            let mediaHtml = '';
            if (msg.mediaUrl) {
                if (msg.mediaType === 'pdf') {
                    mediaHtml = `<a href="${msg.mediaUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(0,0,0,0.05); padding:10px; border-radius:8px; margin-bottom:5px; text-decoration:none; color:#EF4444; font-weight:bold; font-size:13px;"><span>📄</span> PDF İndir/Aç</a>`;
                } else {
                    mediaHtml = `<img src="${msg.mediaUrl}" style="width:100%; max-width:250px; border-radius:8px; margin-bottom:5px; cursor:pointer;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([msg.mediaUrl]))}', 0)">`;
                }
            }

            const textHtml = msg.text ? `<div class="msg-text" style="word-break: break-word;">${msg.text}</div>` : '';

            chatHTML += `
                <div class="bubble ${type}" style="display:flex; flex-direction:column; position:relative;">
                    ${mediaHtml}
                    ${textHtml}
                    <div class="msg-time" style="align-self:flex-end; font-size:10px; opacity:0.7; margin-top:4px; display:flex; align-items:center; gap:4px;">
                        ${msgTime} ${isMe ? `<span style="font-weight:bold;">${isRead}</span>` : ''}
                    </div>
                </div>
            `;
        });
    }

    const isScrolledToBottom = scrollBox.scrollHeight - scrollBox.clientHeight <= scrollBox.scrollTop + 50;
    scrollBox.innerHTML = chatHTML;
    if (isScrolledToBottom || msgs.length <= 1) { scrollBox.scrollTop = scrollBox.scrollHeight; }
};

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────

window.sendDirectMessage = async function(chatId, otherUid) {
    const input = document.getElementById('chat-input-field');
    if (input && input.value.trim() !== '') {
        const text    = input.value.trim();
        input.value   = '';
        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const newMsg  = { senderId: window.userProfile.uid, text, time: timeStr, read: false };

        try {
            await updateDoc(doc(db, "chats", chatId), { messages: arrayUnion(newMsg), lastUpdated: serverTimestamp() });
        } catch (error) {
            console.error("Mesaj gönderilemedi:", error);
            alert("Mesaj gönderilirken bir hata oluştu.");
        }
    }
};

window.uploadChatMedia = async function(event, targetId, chatType) {
    const file = event.target.files[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    try {
        const cleanName    = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
        const storagePath  = `chat_media/${window.userProfile.uid}/${Date.now()}_${cleanName}`;
        const storageRef   = ref(storage, storagePath);
        alert("Medya yükleniyor, lütfen bekleyin...");
        await uploadBytes(storageRef, file);
        const downloadUrl  = await getDownloadURL(storageRef);
        const timeStr      = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const msgObj       = { senderId: window.userProfile.uid, text: "", time: timeStr, mediaUrl: downloadUrl, mediaType: isPdf ? 'pdf' : 'image', read: false };
        await updateDoc(doc(db, "chats", targetId), { messages: arrayUnion(msgObj), lastUpdated: serverTimestamp() });
        event.target.value = '';
    } catch (error) {
        console.error("Medya yüklenemedi:", error);
        alert("Medya gönderilirken bir hata oluştu.");
    }
};

// ─── CHAT REQUEST ACTIONS ─────────────────────────────────────────────────────

window.acceptChatRequest = async function(chatId) {
    try {
        await updateDoc(doc(db, "chats", chatId), { status: 'accepted', lastUpdated: serverTimestamp() });
        window.openChatView(chatId);
    } catch (error) { alert("İstek onaylanırken hata oluştu."); }
};

window.rejectChatRequest = async function(chatId) {
    if (confirm("Bu bağlantı isteğini reddetmek ve silmek istediğinize emin misiniz?")) {
        try {
            await deleteDoc(doc(db, "chats", chatId));
            window.closeChatView();
        } catch (error) { alert("İstek silinirken hata oluştu."); }
    }
};

window.clearChatHistory = async function(chatId) {
    if (confirm("Bu kişiyle olan tüm mesaj geçmişini silmek istediğinize emin misiniz?")) {
        try {
            await updateDoc(doc(db, "chats", chatId), { messages: [], lastUpdated: serverTimestamp() });
            alert("Mesaj geçmişi başarıyla temizlendi.");
            window.updateChatMessagesOnly(chatId);
        } catch (e) { alert("Hata: " + e.message); }
    }
};

window.blockUser = async function(otherUid, chatId, name) {
    if (confirm(`${name} adlı kullanıcıyı engellemek istediğinize emin misiniz? Artık ondan mesaj alamayacaksınız.`)) {
        try {
            await updateDoc(doc(db, "users", window.userProfile.uid), { blockedUsers: arrayUnion(otherUid) });
            if (!window.userProfile.blockedUsers) window.userProfile.blockedUsers = [];
            window.userProfile.blockedUsers.push(otherUid);

            await updateDoc(doc(db, "chats", chatId), { status: 'blocked', blockedBy: window.userProfile.uid, lastUpdated: serverTimestamp() });

            alert(`${name} başarıyla engellendi.`);
            window.closeChatView();
            window.renderMessagesSidebarOnly();
        } catch (e) { alert("Engelleme işlemi sırasında hata oluştu: " + e.message); }
    }
};
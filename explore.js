// ============================================================================
// 🌟 UNILOOP - EXPLORE (KEŞİF) PAGE
// ============================================================================
// Explore.js — Confession / Gönderi akışı ve ilgili tüm işlemler:
//   • drawConfessionsFeed()         → Akış HTML'ini render eder
//   • openConfessionForm()          → Yeni gönderi modal
//   • previewPostImage()            → Resim ön izleme
//   • submitPost()                  → Gönderi kaydetme
//   • likePost()                    → Beğeni toggle
//   • openConfessionDetail()        → Gönderi detay modal
//   • updateConfessionDetailLive()  → Detay modal canlı güncelleme
//   • addComment()                  → Yorum ekleme
//   • deleteConfession()            → Gönderi silme
// ============================================================================

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDocs,
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

// ─── FEED RENDER ─────────────────────────────────────────────────────────────

window.drawConfessionsFeed = function() {
    const mainContent = document.getElementById('main-content');

    let html = `
        <div class="feed-layout-container">
            <div style="background: white; padding: 15px; border-bottom: 1px solid #E5E7EB; z-index: 10;
                        display:flex; gap:10px; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="width:40px; height:40px; border-radius:50%; background:#F3F4F6; display:flex;
                            align-items:center; justify-content:center; font-size:20px; overflow:hidden;
                            border:1px solid #E5E7EB; flex-shrink:0;">
                    ${window.userProfile.avatarUrl
                        ? `<img src="${window.userProfile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">`
                        : window.userProfile.avatar}
                </div>
                <button onclick="window.openConfessionForm()"
                    style="background:var(--primary); color:white; border:none; border-radius:50%;
                           width:36px; height:36px; font-size:20px; font-weight:bold; cursor:pointer;
                           display:flex; align-items:center; justify-content:center;
                           box-shadow:0 2px 5px rgba(79,70,229,0.3); flex-shrink:0; transition: transform 0.2s;"
                    onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"
                    title="Yeni Paylaşım Ekle">+</button>
                <button class="btn-primary"
                    style="flex:1; text-align:left; background:#F9FAFB; color:var(--text-gray);
                           border:1px solid #E5E7EB; box-shadow:none; padding:12px 15px;
                           font-weight:normal; border-radius:20px;"
                    onclick="window.openConfessionForm()">Kampüste neler oluyor?</button>
            </div>
            <div id="conf-feed"></div>
        </div>
    `;

    mainContent.innerHTML = html;
    const feedContainer = document.getElementById('conf-feed');

    if (window.confessionsDB.length === 0) {
        feedContainer.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-gray);">
                <div style="font-size:48px; margin-bottom:10px;">📭</div>
                <p>Henüz paylaşım yok. İlk sen paylaş!</p>
            </div>`;
        return;
    }

    let feedHtml = '';
    window.confessionsDB.forEach(post => {
        const isLiked      = post.likes && post.likes.includes(window.userProfile.uid);
        const likeIcon     = isLiked ? '❤️' : '🤍';
        const likeCount    = post.likes    ? post.likes.length    : 0;
        const commentCount = post.comments ? post.comments.length : 0;

        let imgHtml = post.imgUrl
            ? `<img src="${post.imgUrl}" class="feed-post-img" onclick="event.stopPropagation(); window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`
            : '';

        let avatarHtml = post.isAnonymous
            ? '🕵️'
            : (post.authorAvatarUrl
                ? `<img src="${post.authorAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">`
                : (post.authorAvatar || '👤'));

        feedHtml += `
            <div class="feed-post" onclick="window.openConfessionDetail('${post.id}')" style="cursor:pointer; transition: transform 0.2s;">
                <div class="feed-post-header">
                    <div class="feed-post-avatar">${avatarHtml}</div>
                    <div class="feed-post-meta">
                        <span class="feed-post-author">${post.isAnonymous ? 'Gizli Kullanıcı' : post.authorName}</span>
                        <span class="feed-post-time">${post.time || 'Yeni'}</span>
                    </div>
                </div>
                <div class="feed-post-text">${post.text}</div>
                ${imgHtml}
                <div class="feed-post-actions">
                    <button class="feed-action-btn" id="like-btn-${post.id}"
                        onclick="event.stopPropagation(); window.likePost('${post.id}', event)">
                        ${likeIcon} <span style="margin-left:4px;">${likeCount}</span>
                    </button>
                    <button class="feed-action-btn" id="comment-count-${post.id}">
                        💬 <span style="margin-left:4px;">${commentCount}</span>
                    </button>
                </div>
            </div>
        `;
    });
    feedContainer.innerHTML = feedHtml;
};

// ─── NEW POST FORM ────────────────────────────────────────────────────────────

window.openConfessionForm = function() {
    window.openModal('📝 Gönderi Paylaş', `
        <textarea id="new-post-text" rows="4" placeholder="Düşüncelerini özgürce paylaş..."
            style="width:100%; padding:15px; border-radius:12px; border:1px solid #E5E7EB; outline:none;
                   resize:none; font-size:15px; margin-bottom:15px; box-sizing:border-box; background:#F9FAFB;">
        </textarea>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;
                    background:#fff; padding:10px; border-radius:12px; border:1px solid #E5E7EB;">
            <label style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600;
                           cursor:pointer; color:var(--text-dark);">
                <input type="checkbox" id="new-post-anon" style="width:18px; height:18px; accent-color:var(--primary);">
                🕵️ Gizli Paylaş
            </label>
            <div style="position:relative;">
                <button class="action-btn"
                    onclick="document.getElementById('post-img-upload').click()"
                    style="padding:8px 16px; font-size:13px; background:#EEF2FF; color:var(--primary); border:none;">
                    📷 Fotoğraf Ekle
                </button>
                <input type="file" id="post-img-upload" accept="image/*" style="display:none;"
                    onchange="window.previewPostImage(event)">
            </div>
        </div>

        <div id="post-img-preview" style="margin-bottom:15px; display:none; position:relative;
                                          border-radius:12px; overflow:hidden; border:1px solid #E5E7EB;">
            <img id="post-img-display" style="width:100%; max-height:250px; object-fit:cover; display:block;">
            <button onclick="document.getElementById('post-img-upload').value=''; document.getElementById('post-img-preview').style.display='none';"
                style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:white;
                       border:none; border-radius:50%; width:30px; height:30px; font-size:16px;
                       font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">×</button>
        </div>

        <button id="publish-post-btn" class="btn-primary"
            style="width:100%; padding:16px; font-size:16px; font-weight:bold; border-radius:12px;
                   box-shadow:0 4px 10px rgba(79,70,229,0.3);"
            onclick="window.submitPost()">Paylaş 🚀</button>
    `);
};

window.previewPostImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('post-img-display').src = e.target.result;
            document.getElementById('post-img-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

window.submitPost = async function() {
    const text       = document.getElementById('new-post-text').value.trim();
    const isAnon     = document.getElementById('new-post-anon').checked;
    const fileInput  = document.getElementById('post-img-upload');

    if (!text && (!fileInput || fileInput.files.length === 0)) {
        return alert("Lütfen bir şeyler yazın veya bir fotoğraf seçin.");
    }

    const btn = document.getElementById('publish-post-btn');
    btn.disabled = true;
    btn.innerText = "Gönderiliyor... ⏳";

    try {
        let imgUrl = null;
        if (fileInput && fileInput.files.length > 0) {
            try {
                const file = fileInput.files[0];
                const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                const storageRef = ref(storage, 'confessions/' + window.userProfile.uid + '/' + Date.now() + '_' + cleanName);
                await uploadBytes(storageRef, file);
                imgUrl = await getDownloadURL(storageRef);
            } catch (uploadError) {
                console.error("Resim yükleme hatası: ", uploadError);
                alert("Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
                btn.disabled = false;
                btn.innerText = "Paylaş 🚀";
                return;
            }
        }

        await addDoc(collection(db, "confessions"), {
            text:           text,
            authorId:       window.userProfile.uid,
            authorName:     window.userProfile.name,
            authorAvatar:   window.userProfile.avatar || "👤",
            authorAvatarUrl: window.userProfile.avatarUrl || null,
            isAnonymous:    isAnon,
            imgUrl:         imgUrl,
            time:           new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            createdAt:      serverTimestamp(),
            likes:          [],
            comments:       []
        });

        window.closeModal();
    } catch (error) {
        console.error(error);
        alert("Paylaşılırken hata oluştu: " + error.message);
        btn.disabled = false;
        btn.innerText = "Paylaş 🚀";
    }
};

// ─── LIKE ─────────────────────────────────────────────────────────────────────

window.likePost = async function(postId, event) {
    if (event) {
        const btn = event.currentTarget || event.target;
        const rect = btn.getBoundingClientRect();
        const flyingEmoji = document.createElement('div');
        flyingEmoji.innerText = '❤️';
        flyingEmoji.style.cssText = `position:fixed; left:${rect.left + rect.width/2 - 12}px; top:${rect.top}px; font-size:24px; z-index:999999; pointer-events:none; animation:flyUpAndFade 1s ease-out forwards;`;
        document.body.appendChild(flyingEmoji);
        setTimeout(() => flyingEmoji.remove(), 1000);
    }

    const postRef = doc(db, "confessions", postId);
    const post    = window.confessionsDB.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes && post.likes.includes(window.userProfile.uid);
    try {
        if (isLiked) {
            await updateDoc(postRef, { likes: post.likes.filter(id => id !== window.userProfile.uid) });
        } else {
            await updateDoc(postRef, { likes: arrayUnion(window.userProfile.uid) });
        }
    } catch (e) { console.error(e); }
};

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

window.openConfessionDetail = function(postId) {
    window.updateConfessionDetailLive(postId);
};

window.updateConfessionDetailLive = function(postId) {
    const post = window.confessionsDB.find(p => p.id === postId);
    if (!post) { window.closeModal(); return; }

    const isLiked   = post.likes && post.likes.includes(window.userProfile.uid);
    const likeIcon  = isLiked ? '❤️' : '🤍';
    const likeCount = post.likes ? post.likes.length : 0;
    let imgHtml = post.imgUrl
        ? `<img src="${post.imgUrl}" style="width:100%; border-radius:12px; margin-bottom:15px; cursor:pointer; max-height:400px; object-fit:cover; border:1px solid #E5E7EB;" onclick="window.openLightbox('${encodeURIComponent(JSON.stringify([post.imgUrl]))}', 0)">`
        : '';

    let commentsHtml = '';
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(c => {
            commentsHtml += `
                <div style="background:#F9FAFB; padding:12px; border-radius:12px; margin-bottom:10px;
                            display:flex; gap:12px; border:1px solid #f1f5f9;">
                    <div style="font-size:20px; flex-shrink:0; width:36px; height:36px; background:#E5E7EB;
                                border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${c.avatarUrl ? `<img src="${c.avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : (c.avatar || '👤')}
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:800; color:var(--text-dark); margin-bottom:4px;
                                    display:flex; justify-content:space-between;">
                            <span>${c.name}</span>
                            <span style="color:var(--text-gray); font-weight:normal; font-size:11px;">${c.time || ''}</span>
                        </div>
                        <div style="font-size:14px; color:#374151; line-height:1.4; word-break:break-word;">${c.text}</div>
                    </div>
                </div>
            `;
        });
    } else {
        commentsHtml = '<div style="text-align:center; padding:20px; color:var(--text-gray); font-size:13px;">Bu gönderiye henüz yorum yapılmamış. İlk yorumu sen yap!</div>';
    }

    let deleteBtn = post.authorId === window.userProfile.uid
        ? `<button onclick="window.deleteConfession('${post.id}')" style="background:none; border:none; color:#EF4444; font-size:12px; font-weight:bold; cursor:pointer; padding:5px;">🗑️ Sil</button>`
        : '';

    let postAvatarHtml = post.isAnonymous
        ? '🕵️'
        : (post.authorAvatarUrl
            ? `<img src="${post.authorAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">`
            : (post.authorAvatar || '👤'));

    const html = `
        <input type="hidden" id="active-post-id" value="${post.id}">
        <div class="feed-post-header" style="justify-content:space-between; margin-bottom:15px;">
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="feed-post-avatar">${postAvatarHtml}</div>
                <div class="feed-post-meta">
                    <span class="feed-post-author">${post.isAnonymous ? 'Gizli Kullanıcı' : post.authorName}</span>
                    <span class="feed-post-time">${post.time || ''}</span>
                </div>
            </div>
            ${deleteBtn}
        </div>
        <div class="feed-post-text" style="font-size:16px; margin-bottom:15px;">${post.text}</div>
        ${imgHtml}
        <div class="feed-post-actions" style="margin-bottom:15px; border-bottom:1px solid #E5E7EB; padding-bottom:15px;">
            <button class="feed-action-btn" onclick="window.likePost('${post.id}', event)" style="font-size:15px;">
                ${likeIcon} <span style="margin-left:5px; font-weight:bold;">${likeCount} Beğeni</span>
            </button>
        </div>
        <div class="answers-container" id="comments-container" style="margin-bottom:15px; max-height: 300px; overflow-y:auto;">${commentsHtml}</div>
        <div style="display:flex; gap:10px; background:white; padding-top:10px;">
            <input type="text" id="comment-input" placeholder="Bir yanıt yaz..."
                style="flex:1; padding:14px 15px; border-radius:25px; border:1px solid #E5E7EB; outline:none;
                       background:#F9FAFB; font-size:14px;"
                onkeypress="if(event.key==='Enter') window.addComment('${post.id}')">
            <button class="chat-send-btn" onclick="window.addComment('${post.id}')"
                style="width:46px; height:46px; border-radius:50%; background:var(--primary); color:white;
                       border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
                       box-shadow:0 2px 6px rgba(79,70,229,0.3); font-size:18px;">➤</button>
        </div>
    `;

    if (!document.getElementById('app-modal').classList.contains('active')) {
        window.openModal('Gönderi Detayı', html);
    } else {
        document.getElementById('modal-body').innerHTML = html;
        const commContainer = document.getElementById('comments-container');
        if (commContainer) commContainer.scrollTop = commContainer.scrollHeight;
    }
};

// ─── COMMENT ──────────────────────────────────────────────────────────────────

window.addComment = async function(postId) {
    const input = document.getElementById('comment-input');
    if (!input || !input.value.trim()) return;

    const commentText = input.value.trim();
    input.value = '';

    const newComment = {
        userId:    window.userProfile.uid,
        name:      window.userProfile.name,
        avatar:    window.userProfile.avatar || '👤',
        avatarUrl: window.userProfile.avatarUrl || null,
        text:      commentText,
        time:      new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
        await updateDoc(doc(db, "confessions", postId), { comments: arrayUnion(newComment) });
    } catch (e) { console.error(e); }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

window.deleteConfession = async function(postId) {
    if (confirm("Bu gönderiyi tamamen silmek istediğinize emin misiniz?")) {
        try {
            await deleteDoc(doc(db, "confessions", postId));
            window.closeModal();
            alert("Gönderi silindi.");
        } catch (e) { alert("Hata: " + e.message); }
    }
};
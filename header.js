// ============================================================================
// 🌟 UNILOOP - HEADER COMPONENT
// ============================================================================
// Header.js — App header (top bar) ve Bottom Navigation Bar'ı yönetir.
// onAuthStateChanged callback'inden çağrılır; kullanıcı giriş yaptıktan sonra
// hem header içeriğini hem de alt navigasyon çubuğunu DOM'a ekler.
// ============================================================================

import {
    getFirestore,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

/**
 * Header sağ menüsünü (Premium butonu + Bildirim zili) render eder.
 * onAuthStateChanged içinden, kullanıcı profili yüklendikten sonra çağrılır.
 */
window.renderHeaderRightMenu = function() {
    const headerRightMenu = document.querySelector('.header-right-menu');
    if (!headerRightMenu) return;

    headerRightMenu.innerHTML = '';

    if (!window.userProfile.isPremium) {
        headerRightMenu.insertAdjacentHTML('beforeend', `
            <div class="menu-item premium-glow" id="nav-premium-action"
                style="height:36px; display:inline-flex; align-items:center; justify-content:center;
                       background:white; color:#111827; border:1px solid #111827; padding:0 16px;
                       border-radius:18px; font-weight:700; font-size:13px; cursor:pointer;
                       box-sizing:border-box; margin:0;"
                onclick="window.openPremiumModal()">☆ Premium</div>
        `);
    } else {
        headerRightMenu.insertAdjacentHTML('beforeend', `
            <div class="menu-item premium-glow" id="nav-premium-action"
                style="height:36px; display:inline-flex; align-items:center; justify-content:center;
                       background:white; color:#111827; border:1px solid #111827; padding:0 16px;
                       border-radius:18px; font-weight:700; font-size:13px; cursor:pointer;
                       box-sizing:border-box; margin:0;"
                onclick="window.openPremiumFeaturesModal()">☆ Ayrıcalıklar</div>
        `);
    }

    headerRightMenu.insertAdjacentHTML('beforeend', `
        <div id="notif-btn-top" onclick="window.renderNotifications()" title="Bildirimler"
            style="background:white; border:1px solid #111827; width:36px; height:36px;
                   border-radius:50%; display:flex; align-items:center; justify-content:center;
                   position:relative; cursor:pointer; box-sizing:border-box; margin:0;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#111827" stroke-width="2"
                 fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span id="notif-badge-top"
                style="display:none; position:absolute; top:-4px; right:-4px;
                       background:#EF4444; color:white; border-radius:50%;
                       width:16px; height:16px; font-size:10px; align-items:center;
                       justify-content:center; font-weight:bold; border:2px solid white;">0</span>
        </div>
    `);
};

/**
 * Bottom Navigation Bar'ı DOM'a ekler (eğer henüz eklenmemişse).
 * @param {HTMLElement} appScreen - #app-screen elementi
 */
window.renderBottomNav = function(appScreen) {
    if (document.getElementById('uniloop-bottom-nav')) return;

    const bottomNav = document.createElement('div');
    bottomNav.id = 'uniloop-bottom-nav';
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
        <div class="menu-item bottom-nav-item active" data-target="home" onclick="window.loadPage('home')">
            <div class="bottom-nav-icon">
                <svg class="fill-active" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </div>
            <span>Ana Sayfa</span>
        </div>

        <div class="menu-item bottom-nav-item" data-target="confessions" onclick="window.loadPage('confessions')">
            <div class="bottom-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
            </div>
            <span>Keşfet</span>
        </div>

        <div class="menu-item bottom-nav-item" data-target="market" onclick="window.loadPage('market')">
            <div class="bottom-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            </div>
            <span>Market</span>
        </div>

        <div class="menu-item bottom-nav-item" data-target="messages" onclick="window.loadPage('messages')">
            <div class="bottom-nav-icon" style="position:relative;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span id="notif-badge"
                    style="display:none; position:absolute; top:-4px; right:-6px;
                           background:#EF4444; color:white; border-radius:50%;
                           width:14px; height:14px; font-size:9px; align-items:center;
                           justify-content:center; font-weight:bold; border:2px solid white;">0</span>
            </div>
            <span>Mesajlar</span>
        </div>

        <div class="menu-item bottom-nav-item" data-target="profile" onclick="window.loadPage('profile')">
            <div class="bottom-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span>Profil</span>
        </div>
    `;

    if (appScreen) appScreen.appendChild(bottomNav);
};

/**
 * Kullanıcı çıkış yaptığında veya hesabı silindiğinde
 * Bottom Nav ve header butonlarını temizler.
 */
window.cleanupHeader = function() {
    const bottomNav = document.getElementById('uniloop-bottom-nav');
    if (bottomNav) bottomNav.remove();

    const topNotifBtn = document.getElementById('notif-btn-top');
    if (topNotifBtn) topNotifBtn.remove();

    const navPremium = document.getElementById('nav-premium-action');
    if (navPremium) navPremium.remove();
};

/**
 * Navigasyon badge'lerini (bildirim sayıları) günceller.
 * initRealtimeListeners → chatsDB snapshot'ında çağrılır.
 * @param {number} totalNotifs
 */
window.updateNavBadges = function(totalNotifs) {
    const notifBadge    = document.getElementById('notif-badge');
    const notifBadgeTop = document.getElementById('notif-badge-top');

    if (notifBadge) {
        if (totalNotifs > 0) { notifBadge.style.display = 'flex'; notifBadge.innerText = totalNotifs; }
        else { notifBadge.style.display = 'none'; }
    }
    if (notifBadgeTop) {
        if (totalNotifs > 0) { notifBadgeTop.style.display = 'flex'; notifBadgeTop.innerText = totalNotifs; }
        else { notifBadgeTop.style.display = 'none'; }
    }
};

/**
 * Mesajlar sekmesine programatik olarak geçiş yapar.
 * openChatViewDirect gibi yardımcı fonksiyonlardan çağrılır.
 */
window.goToMessages = function() {
    document.querySelectorAll('.bottom-nav-item').forEach(m => m.classList.remove('active'));
    const msgTab = document.querySelector('.bottom-nav-item[data-target="messages"]');
    if (msgTab) { msgTab.classList.add('active'); window.loadPage('messages'); }
};
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navButtons = document.querySelectorAll('.nav-btn');

    // Sayfa yükleme fonksiyonu
    function loadPage(pageName) {
        // İlgili sayfanın HTML'ini content alanına bas
        appContent.innerHTML = Pages[pageName];
        
        // Menüdeki aktif class'ı güncelle
        navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${pageName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Navigasyon butonlarına tıklama olayı ekle
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Uygulama ilk açıldığında 'Keşfet' sayfasını yükle
    loadPage('discover');
});

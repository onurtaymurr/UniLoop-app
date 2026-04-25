// Sayfa içeriklerini burada tutuyoruz. React/Vue gibi çerçevelerin yaptığı işin temeli budur.
const Pages = {
    discover: `
        <div class="swipe-card">
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" alt="Kullanıcı">
            <div class="card-info">
                <h2>Ceren, 21</h2>
                <p>Bilgisayar Mühendisliği</p>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <span style="background: rgba(255,255,255,0.3); padding: 5px 10px; border-radius: 15px; font-size: 12px;">Yüzme</span>
                    <span style="background: rgba(255,255,255,0.3); padding: 5px 10px; border-radius: 15px; font-size: 12px;">Sinema</span>
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 30px;">
            <button style="width: 60px; height: 60px; border-radius: 50%; border: none; background: #fff; color: #ff4b4b; font-size: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"><i class="fa-solid fa-xmark"></i></button>
            <button style="width: 60px; height: 60px; border-radius: 50%; border: none; background: #fff; color: #4CAF50; font-size: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"><i class="fa-solid fa-heart"></i></button>
        </div>
    `,
    
    voice: `
        <div class="page-container">
            <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, #4A00E0, #8E2DE2); display: flex; justify-content: center; align-items: center; box-shadow: 0 0 30px rgba(74, 0, 224, 0.5); animation: pulse 2s infinite;">
                <i class="fa-solid fa-microphone" style="font-size: 50px; color: white;"></i>
            </div>
            <h2 style="margin-top: 30px; color: #333;">Anonim Ses Odası</h2>
            <p style="color: #777; margin-top: 10px; max-width: 300px;">Maskeler arkasında konuşmaya başla. İki taraf da onaylarsa profiller açılır.</p>
            <button style="margin-top: 40px; background: #4A00E0; color: white; border: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; cursor: pointer; font-weight: bold;">Eşleşme Bul</button>
        </div>
        <style>
            @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 0, 224, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(74, 0, 224, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 0, 224, 0); } }
        </style>
    `,

    tournament: `
        <div class="page-container" style="justify-content: flex-start; padding-top: 20px;">
            <h2 style="color: #333; margin-bottom: 30px;">Popülerlik Savaşı</h2>
            <p style="color: #777; margin-bottom: 20px;">Sence hangisi daha çekici?</p>
            <div style="display: flex; gap: 10px; width: 100%; max-width: 400px;">
                <div style="flex: 1; border-radius: 15px; overflow: hidden; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80" style="width: 100%; height: 250px; object-fit: cover;">
                    <div style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.6); color: white; padding: 10px; font-size: 14px;">Aylin, 20</div>
                </div>
                <div style="display: flex; align-items: center; font-weight: bold; color: #4A00E0;">VS</div>
                <div style="flex: 1; border-radius: 15px; overflow: hidden; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" style="width: 100%; height: 250px; object-fit: cover;">
                    <div style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.6); color: white; padding: 10px; font-size: 14px;">Burcu, 22</div>
                </div>
            </div>
        </div>
    `,

    messages: `
        <div style="width: 100%; height: 100%; align-items: flex-start;">
            <h2 style="color: #333; margin-bottom: 20px; text-align: left; width: 100%;">Mesajlar</h2>
            <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); width: 100%;">
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=50&q=80" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="color: #333;">Ceren</h4>
                    <p style="color: #777; font-size: 14px;">Selam, naber? 😊</p>
                </div>
                <span style="color: #4A00E0; font-size: 12px; font-weight: bold;">12:30</span>
            </div>
            </div>
    `,

    profile: `
        <div class="page-container" style="justify-content: flex-start; padding-top: 40px;">
            <div style="position: relative;">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #4A00E0;">
                <button style="position: absolute; bottom: 0; right: 0; background: #fff; border: none; width: 35px; height: 35px; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2); color: #4A00E0; cursor: pointer;"><i class="fa-solid fa-pen"></i></button>
            </div>
            <h2 style="margin-top: 15px; color: #333;">Berkant, 23</h2>
            <p style="color: #777;">@berkant_loop • Hukuk Fakültesi</p>
            
            <div style="display: flex; gap: 20px; margin-top: 30px; width: 100%; max-width: 300px;">
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #4A00E0;">1.2k</h3>
                    <p style="font-size: 12px; color: #777;">Turnuva Elo</p>
                </div>
                <div style="flex: 1; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                    <h3 style="color: #4A00E0;">48</h3>
                    <p style="font-size: 12px; color: #777;">Eşleşme</p>
                </div>
            </div>
        </div>
    `
};

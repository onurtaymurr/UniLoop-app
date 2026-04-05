// 1. İLK GİRİŞTE HOŞ GELDİN MESAJI OLUŞTURMA
async function createWelcomeMessage(userId) {
    const systemId = "uniloop_team_official";
    const chatId = [userId, systemId].sort().join("_"); // Benzersiz sohbet ID

    const chatRef = db.collection("chats").doc(chatId);
    
    await chatRef.set({
        users: [userId, systemId],
        lastMessage: "UniLoop dünyasına hoş geldin! Soruların olursa buradayız.",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        senderName: "UniLoop Team"
    });

    await chatRef.collection("messages").add({
        senderId: systemId,
        text: "Selam! UniLoop'a katıldığın için mutluyuz. Kampüs marketi gezebilir veya arkadaşlarınla mesajlaşabilirsin.",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// 2. KAMPÜS MARKET - İLAN ÜZERİNDEN MESAJ GÖNDERME
async function startMarketChat(sellerId, itemName) {
    const buyerId = auth.currentUser.uid;
    if (sellerId === buyerId) return alert("Kendi ilanınıza mesaj gönderemezsiniz.");

    const chatId = [buyerId, sellerId].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);

    // Sohbet odasını oluştur/güncelle
    await chatRef.set({
        users: [buyerId, sellerId],
        lastMessage: `İlan hakkında: ${itemName}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Otomatik mesajı gönder
    await chatRef.collection("messages").add({
        senderId: buyerId,
        text: `Merhaba, "${itemName}" ilanınızla ilgileniyorum. Hala satılık mı?`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Mesajlar sayfasına yönlendir
    window.location.href = "messages.html?chatId=" + chatId;
}

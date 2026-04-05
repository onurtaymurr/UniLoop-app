// GİRİŞ YAPAN KULLANICININ SOHBETLERİNİ GETİR
function loadMyChats() {
    const currentUid = auth.currentUser.uid;

    db.collection("chats")
        .where("users", "array-contains", currentUid) // Sadece benim dahil olduğum odalar
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            const chatListElement = document.getElementById("chat-list");
            chatListElement.innerHTML = ""; // Temizle

            snapshot.forEach((doc) => {
                const chatData = doc.data();
                // "UniLoop Team" ise veya diğer kullanıcının adını çek
                const displayName = chatData.senderName || "Kullanıcı"; 
                
                chatListElement.innerHTML += `
                    <div class="chat-item" onclick="openChat('${doc.id}')">
                        <b>${displayName}</b>
                        <p>${chatData.lastMessage}</p>
                    </div>
                `;
            });
        });
}

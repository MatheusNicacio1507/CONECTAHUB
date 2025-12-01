// ============================================
//  EXPANSÃO DO MENU LATERAL
// ============================================
const sidebar = document.getElementById('sidebar');

function isMobile() {
    return window.innerWidth <= 680;
}

sidebar.addEventListener('click', function (e) {
    if (isMobile()) return;

    if (
        !e.target.classList.contains('submenu-toggle') &&
        !e.target.closest('.submenu-toggle') &&
        !e.target.closest('.submenu')
    ) {
        sidebar.classList.toggle('expanded');
    }
});

/* =============================
      CHAT VISUAL - LOCALSTORAGE
   ============================= */

const chatBox = document.getElementById("chat-messages");
const inputMsg = document.getElementById("chat-input-msg");
const btnSend = document.getElementById("chat-send-btn");

function loadMessages() {
    const saved = JSON.parse(localStorage.getItem("chat_msgs")) || [];
    chatBox.innerHTML = "";

    saved.forEach(msg => {
        const card = document.createElement("div");
        card.className = msg.me ? "message-card-me" : "message-card";

        card.innerHTML = `
            <div class="avatar"></div>
            <div class="user-data">
                <span class="user">${msg.me ? "Eu" : msg.user}:</span><br>
                <span class="msg">${msg.text}</span>
                <span class="time">${msg.time}</span>
            </div>
        `;

        chatBox.appendChild(card);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const text = inputMsg.value.trim();
    if (text.length === 0) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg = {
        user: "Pessoa",
        text,
        time,
        me: true
    };

    const saved = JSON.parse(localStorage.getItem("chat_msgs")) || [];
    saved.push(newMsg);
    localStorage.setItem("chat_msgs", JSON.stringify(saved));

    inputMsg.value = "";
    loadMessages();
}

btnSend.addEventListener("click", sendMessage);
inputMsg.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

// Carrega mensagens ao abrir a página
loadMessages();

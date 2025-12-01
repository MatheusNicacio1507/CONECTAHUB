// ===============================
//  perfil_core.js (corrigido e completo)
//  Core: dados do usuário + display + init
// ===============================

// ===============================
//   VERIFICA SE O USUÁRIO ESTÁ LOGADO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Você precisa fazer login.");
        window.location.href = "index.html";
        return;
    }

    // Preenche dados vindos do login:
    userData.name = user.nome || "";
    userData.department = user.setor || "";
    userData.cpf = user.cpf || " — ";
    userData.email = user.email || " — ";

    // Atualiza a tela imediatamente com os dados do login
    updateProfileDisplay();

    // Continua a inicialização (foto, localStorage, UI...)
    init();
});

// ============================================
//  DADOS DO USUÁRIO
// ============================================
let userData = {
    name: "",
    department: "",
    cpf: "",
    email: "",
    photo: null,
    score: 0,
    badges: 0
};

window.userData = userData;

// ============================================
//  FUNÇÕES DE ATUALIZAÇÃO DO PERFIL (CORE)
// ============================================
function updateProfileDisplay() {
    const elUserName = document.getElementById("user-name");
    const elDisplayName = document.getElementById("display-name");
    const elDept = document.getElementById("display-department");
    const elCpf = document.getElementById("display-cpf");
    const elEmail = document.getElementById("display-email");

    if (elUserName) elUserName.textContent = userData.name || "Usuário";
    if (elDisplayName) elDisplayName.textContent = userData.name || "Usuário";
    if (elDept) elDept.textContent = userData.department || "Setor";

    if (elEmail) elEmail.textContent = userData.email || " — ";
    if (elCpf) elCpf.textContent = userData.cpf || " — ";

    const statScore = document.querySelector("#stat-pontuacao .stat-value");
    const statBadges = document.querySelector("#stat-medalhas .stat-value");

    if (statScore) statScore.textContent = typeof userData.score === "number" ? userData.score : 0;
    if (statBadges) statBadges.textContent = typeof userData.badges === "number" ? userData.badges : 0;
}

// ============================================
//  INICIALIZAÇÃO (CORE)
// ============================================
function init() {
    const savedData = localStorage.getItem("conectahub_user_data");

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);

            // Mescla salvamento local (foto, etc.)
            userData = { ...userData, ...parsed };

            window.userData = userData;
        } catch (err) {
            console.warn("Erro ao ler conectahub_user_data:", err);
        }
    }

    // Atualiza a UI com nome/email/cpf/setor/foto
    updateProfileDisplay();

    // Inicializa UI (do arquivo perfil_ui.js)
    if (typeof setupUI === "function") {
        try {
            setupUI();
        } catch (err) {
            console.error("Erro em setupUI:", err);
        }
    }
}

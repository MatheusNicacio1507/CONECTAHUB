// ===============================
//  perfil_core.js (100% corrigido)
// ===============================

// --- DADOS DO USUÁRIO ---
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

// --- VERIFICA LOGIN ---
document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Você precisa fazer login.");
        window.location.href = "index.html";
        return;
    }

    // Dados reais do login (supabase)
    userData.name = user.nome || "";
    userData.department = user.setor || "";
    userData.cpf = user.cpf || "—";
    userData.email = user.email || "—";

    updateProfileDisplay();
    init();
});

// --- ATUALIZA PERFIL NA TELA ---
function updateProfileDisplay() {
    const elUserName = document.getElementById("user-name");
    const elDisplayName = document.getElementById("display-name");
    const elDept = document.getElementById("display-department");
    const elCpf = document.getElementById("display-cpf");
    const elEmail = document.getElementById("display-email");

    if (elUserName) elUserName.textContent = userData.name || "Usuário";
    if (elDisplayName) elDisplayName.textContent = userData.name || "Usuário";
    if (elDept) elDept.textContent = userData.department || "Setor";
    if (elCpf) elCpf.textContent = userData.cpf || "—";
    if (elEmail) elEmail.textContent = userData.email || "—";
}

// --- INICIALIZAÇÃO ---
function init() {

    // Carrega APENAS a foto salva localmente
    const saved = localStorage.getItem("conectahub_user_data");

    if (saved) {
        try {
            const parsed = JSON.parse(saved);

            // mantém SOMENTE a foto
            if (parsed.photo) {
                userData.photo = parsed.photo;
            }

        } catch (e) {
            console.warn("Erro ao carregar foto local:", e);
        }
    }

    updateProfileDisplay();

    if (typeof setupUI === "function") {
        setupUI();
    }
}

// --- LOGOUT (SEM SEGUNDO DOMContentLoaded) ---
document.getElementById("logout-btn")?.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {

        // limpar tudo relacionado ao usuário
        localStorage.removeItem("user");
        // a foto você decide se limpa ou não:
        // localStorage.removeItem("conectahub_user_data");

        window.location.href = "index.html";
    }
});

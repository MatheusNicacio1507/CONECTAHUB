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

    // Preenchendo dados reais vindos do login:
    userData.name = user.nome;
    userData.department = user.setor;
    userData.cpf = user.cpf || " — ";
    userData.email = user.email || " — ";

    updateProfileDisplay();
    init();
});


// ============================================
//  DADOS DO USUÁRIO (carregados + foto local)
// ============================================
let userData = {
    name: "",
    department: "",
    cpf: "",
    email: "",
    photo: null,
    score: 1250,
    badges: 8
};


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


// ============================================
//  FUNÇÕES DO PERFIL
// ============================================
function openPhotoModal() {
    const photoModal = document.getElementById('photo-modal');
    const modalProfileImg = document.getElementById('modal-profile-img');

    modalProfileImg.src = userData.photo || "";
    photoModal.classList.add('show');
}

function closePhotoModal() {
    document.getElementById('photo-modal').classList.remove('show');
}

function changePhoto() {
    document.getElementById('photo-upload').click();
}

function removePhoto() {
    if (confirm("Deseja remover sua foto?")) {
        userData.photo = null;
        updateProfileDisplay();
        localStorage.setItem("conectahub_user_data", JSON.stringify(userData));
        closePhotoModal();
    }
}

function updateProfileDisplay() {
    document.getElementById("user-name").textContent = userData.name;

    document.getElementById("display-name").textContent = userData.name;
    document.getElementById("display-email").textContent = userData.email;
    document.getElementById("display-department").textContent = userData.department;
    document.getElementById("display-cpf").textContent = userData.cpf;

    const profileImg = document.getElementById("profile-img");
    profileImg.src = userData.photo || "static/imagens/user_default.png";
}


// ============================================
//  STATS EXPAND / COLLAPSE
// ============================================
function setupStatsToggle() {
    const statItems = document.querySelectorAll(".stat-item");

    statItems.forEach(item => {
        item.addEventListener("click", () => {
            statItems.forEach(i => {
                if (i !== item) i.classList.remove("active");
            });
            item.classList.toggle("active");
        });
    });
}


// ============================================
//  SUBMENU
// ============================================
function setupSubmenuToggle() {
    const submenuToggle = document.querySelector(".submenu-toggle");
    const navItem = document.querySelector(".nav-item.has-submenu");

    if (!submenuToggle || !navItem) return;

    submenuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        navItem.classList.toggle("active");
    });
}


// ============================================
//  UPLOAD DE FOTO
// ============================================
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Arquivo inválido. Apenas imagens.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (ev) => {
        userData.photo = ev.target.result;
        updateProfileDisplay();
        localStorage.setItem("conectahub_user_data", JSON.stringify(userData));
        closePhotoModal();
    };

    reader.readAsDataURL(file);
}


// ============================================
//  EVENTOS
// ============================================
function setupEventListeners() {
    document.getElementById("photo-upload").addEventListener("change", handlePhotoUpload);

    const modal = document.getElementById("photo-modal");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closePhotoModal();
    });
}


// ============================================
//  INICIALIZAR TUDO
// ============================================
function init() {
    const saved = localStorage.getItem("conectahub_user_data");
    if (saved) userData = { ...userData, ...JSON.parse(saved) };

    updateProfileDisplay();
    setupEventListeners();
    setupStatsToggle();
    setupSubmenuToggle();
}

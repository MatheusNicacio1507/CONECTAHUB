// ===============================
//  perfil_ui.js
//  (UI: toggles + foto + event listeners)
//  Deve ser incluido APÓS perfil_core.js
// ===============================

/*
  IMPORTANTE:
  - Este arquivo utiliza `userData` e `updateProfileDisplay()` definidos em perfil_core.js.
  - Inclua no HTML: primeiro perfil_core.js, depois perfil_ui.js
*/

// ---------- Toggle do menu lateral ----------
(function(){
    const sidebar = document.getElementById('sidebar');
    function isMobile() { return window.innerWidth <= 680; }

    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            if (isMobile()) return; // no celular não expande

            // Só não expande/recolhe se clicar especificamente na setinha do submenu
            if (!e.target.classList.contains('submenu-toggle') &&
                !e.target.closest('.submenu-toggle') &&
                !e.target.closest('.submenu')) {
                sidebar.classList.toggle('expanded');
            }
        });
    }
})();


// ---------- Funções de foto / modal ----------
function openPhotoModal() {
    const photoModal = document.getElementById('photo-modal');
    const modalProfileImg = document.getElementById('modal-profile-img');
    if (modalProfileImg) modalProfileImg.src = window.userData.photo ? window.userData.photo : "static/imagens/user_default.png";
    if (photoModal) photoModal.classList.add('show');
}

function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) modal.classList.remove('show');
}

function changePhoto() {
    const upload = document.getElementById('photo-upload');
    if (upload) upload.click();
}

function removePhoto() {
    if (!confirm('Deseja remover sua foto?')) return;
    window.userData.photo = null;
    // salva localmente
    localStorage.setItem('conectahub_user_data', JSON.stringify(window.userData));
    // aplica na UI
    const profileImg = document.getElementById('profile-img');
    const modalImg = document.getElementById('modal-profile-img');
    if (profileImg) profileImg.src = "static/imagens/user_default.png";
    if (modalImg) modalImg.src = "static/imagens/user_default.png";
    // Atualiza textos se necessário
    if (typeof updateProfileDisplay === "function") updateProfileDisplay();
    closePhotoModal();
}

// ---------- Mostra imagem atual no perfil (chamado por handlers) ----------
function applyProfileImage() {
    const profileImg = document.getElementById('profile-img');
    const modalImg = document.getElementById('modal-profile-img');
    const src = window.userData.photo ? window.userData.photo : "static/imagens/user_default.png";
    if (profileImg) profileImg.src = src;
    if (modalImg) modalImg.src = src;
}

// ---------- Toggle dos stats ----------
function setupStatsToggle() {
    const statItems = document.querySelectorAll('.stat-item');

    statItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Fecha outros itens abertos
            statItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Abre/fecha o item atual
            item.classList.toggle('active');
        });
    });
}

// ---------- Submenu toggle (setinha) ----------
function setupSubmenuToggle() {
    const submenuToggle = document.querySelector('.submenu-toggle');
    const navItem = document.querySelector('.nav-item.has-submenu');

    if (submenuToggle && navItem) {
        submenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            navItem.classList.toggle('active');
        });

        const navItemMain = document.querySelector('.nav-item-main');
        if (navItemMain) {
            navItemMain.addEventListener('click', function(e) {
                // Só abre/fecha o submenu se não clicar na setinha
                if (!e.target.classList.contains('submenu-toggle') && !e.target.closest('.submenu-toggle')) {
                    navItem.classList.toggle('active');
                }
            });
        }
    }
}

// ---------- Upload da foto ----------
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        window.userData.photo = e.target.result;
        // salva localmente (não usa Supabase)
        localStorage.setItem('conectahub_user_data', JSON.stringify(window.userData));
        // aplica na UI
        applyProfileImage();
        alert('Foto de perfil atualizada com sucesso!');
        closePhotoModal();
    };
    reader.readAsDataURL(file);
}

// ---------- Configura listeners do modal e upload ----------
function setupUIEventListeners() {
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) photoUpload.addEventListener('change', handlePhotoUpload);

    const photoModal = document.getElementById('photo-modal');
    if (photoModal) {
        photoModal.addEventListener('click', function(e) {
            if (e.target === photoModal) closePhotoModal();
        });
    }
}

// ---------- Função pública para inicializar UI (chamada por core) ----------
function setupUI() {
    // Aplica imagem atual (caso tenha vindo de localStorage)
    applyProfileImage();

    // Configura listeners
    setupUIEventListeners();

    // Configura toggles
    setupStatsToggle();
    setupSubmenuToggle();

    // se quiser, podemos expor funções globais para uso inline no HTML (botões onclick)
    window.openPhotoModal = openPhotoModal;
    window.closePhotoModal = closePhotoModal;
    window.changePhoto = changePhoto;
    window.removePhoto = removePhoto;
}

// Exponha para o core chamar (se core rodar antes, chamará; se core rodar depois, user pode chamar manualmente)
window.setupUI = setupUI;

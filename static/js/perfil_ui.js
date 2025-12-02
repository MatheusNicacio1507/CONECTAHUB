// ===============================
//  perfil_ui.js (VERSÃO SIMPLIFICADA)
// ===============================

// ---------- Modal de Foto ----------
function openPhotoModal() {
    console.log("Abrindo modal de foto");
    const photoModal = document.getElementById('photo-modal');
    const modalProfileImg = document.getElementById('modal-profile-img');
    
    // Usa window.userData que foi exposto pelo perfil.js
    const userPhoto = window.userData ? window.userData.photo : null;
    const defaultImg = "static/imagens/user_default.png";
    
    if (modalProfileImg) {
        modalProfileImg.src = userPhoto || defaultImg;
    }
    
    if (photoModal) {
        photoModal.classList.add('show');
        photoModal.style.display = 'flex';
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function changePhoto() {
    const upload = document.getElementById('photo-upload');
    if (upload) {
        upload.click();
    }
}

async function removePhoto() {
    if (!confirm('Deseja remover sua foto?')) return;
    
    try {
        // Chama função do perfil.js
        if (window.removerFotoPerfil) {
            await window.removerFotoPerfil();
        }
        
        alert('Foto removida com sucesso!');
        closePhotoModal();
        
    } catch (error) {
        console.error('Erro ao remover foto:', error);
        alert('Erro ao remover foto.');
    }
}

// ---------- Upload de Foto (COM STORAGE) ----------
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validações
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione uma imagem (JPEG, PNG, etc).');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }

    try {
        console.log("Processando arquivo:", file.name, file.size);
        
        // Mostra loading
        const modal = document.getElementById('photo-modal');
        if (modal) {
            const originalContent = modal.querySelector('.modal-content').innerHTML;
            modal.querySelector('.modal-content').innerHTML = `
                <div class="modal-header">
                    <h3>Enviando Foto...</h3>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <div class="spinner"></div>
                    <p>Enviando para o servidor...</p>
                </div>
            `;
        }
        
        // Chama função do perfil.js que usa Storage
        if (window.salvarFotoPerfil) {
            const resultado = await window.salvarFotoPerfil(file);
            console.log("Resultado do upload:", resultado);
            
            alert('✅ Foto atualizada com sucesso!');
            closePhotoModal();
        } else {
            throw new Error("Função salvarFotoPerfil não encontrada");
        }
        
    } catch (error) {
        console.error('Erro ao processar foto:', error);
        
        // Restaura modal em caso de erro
        closePhotoModal();
        setTimeout(() => openPhotoModal(), 100);
        
        alert('❌ Erro ao salvar foto: ' + error.message);
    } finally {
        // Limpa o input
        event.target.value = '';
    }
}

// ---------- Toggle dos Stats ----------
function setupStatsToggle() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        item.addEventListener('click', function() {
            // Fecha outros
            statItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Abre/fecha este
            this.classList.toggle('active');
        });
    });
    
    console.log("Stats toggles configurados:", statItems.length);
}

// ---------- Submenu Toggle ----------
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
                if (!e.target.classList.contains('submenu-toggle') && 
                    !e.target.closest('.submenu-toggle')) {
                    navItem.classList.toggle('active');
                }
            });
        }
    }
}

// ---------- Configura Event Listeners ----------
function setupUIEventListeners() {
    // Upload de foto
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) {
        photoUpload.addEventListener('change', handlePhotoUpload);
    }
    
    // Fechar modal ao clicar fora
    const photoModal = document.getElementById('photo-modal');
    if (photoModal) {
        photoModal.addEventListener('click', function(e) {
            if (e.target === photoModal) {
                closePhotoModal();
            }
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePhotoModal();
        }
    });
}

// ---------- Inicialização da UI ----------
function setupUI() {
    console.log("Configurando UI...");
    
    // Aplica foto inicial
    if (window.aplicarFotoNaInterface) {
        window.aplicarFotoNaInterface();
    }
    
    // Configura listeners
    setupUIEventListeners();
    setupStatsToggle();
    setupSubmenuToggle();
    
    // Exporta funções globais
    window.openPhotoModal = openPhotoModal;
    window.closePhotoModal = closePhotoModal;
    window.changePhoto = changePhoto;
    window.removePhoto = removePhoto;
    
    console.log("UI configurada com sucesso");
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Espera um pouco para garantir que perfil.js já carregou
    setTimeout(() => {
        setupUI();
    }, 100);
});

// Exporta para uso
window.setupUI = setupUI;
/* ---------- Toggle do menu lateral ---------- */    
const sidebar = document.getElementById('sidebar');

function isMobile() {
    return window.innerWidth <= 680;
}

// Toggle sidebar no desktop
sidebar.addEventListener('click', function(e) {    
    if (isMobile()) return;
    
    if (!e.target.classList.contains('submenu-toggle') && 
        !e.target.closest('.submenu-toggle') &&
        !e.target.closest('.submenu')) {    
        sidebar.classList.toggle('expanded');    
    }    
});

function setupSubmenuToggle() {  
    const submenuToggle = document.querySelector('.submenu-toggle');  
    const navItem = document.querySelector('.nav-item.has-submenu');  
    
    if (submenuToggle && navItem) {      
        submenuToggle.addEventListener('click', function(e) {      
            e.stopPropagation();      
            navItem.classList.toggle('active');      
        });      
              
        const navItemMain = document.querySelector('.nav-item-main');      
        navItemMain.addEventListener('click', function(e) {      
            if (!e.target.classList.contains('submenu-toggle')) {      
                navItem.classList.toggle('active');      
            }      
        });      
    }  
}  

// Ajustar sidebar na mudança de tamanho da tela
window.addEventListener('resize', function() {
    if (isMobile() && sidebar.classList.contains('expanded')) {
        sidebar.classList.remove('expanded');
    }
});

// Navegação entre páginas
document.addEventListener('DOMContentLoaded', () => {
    setupSubmenuToggle();
    
    // Marcar comunicados como ativo
    const currentPage = window.location.pathname;
    if (currentPage.includes('comunicados.html') || currentPage.endsWith('/comunicados')) {
        // Remove active de todos os itens
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        // Adiciona active nos comunicados
        const comunicadosItem = document.querySelector('a[href*="comunicados"]').parentElement;
        if (comunicadosItem) {
            comunicadosItem.classList.add('active');
        }
    }
    
    // elementos do modal e da página
    const modal = document.getElementById('modal');
    const modalTextarea = document.getElementById('modal-text');
    const modalSave = document.getElementById('btn-save');
    const modalClose = document.getElementById('modal-close');
    const dateInput = document.getElementById('calendar-input');

    let setorAtual = null;

    // ---------- Funções utilitárias ----------
    function abrirModal(setorId) {
        setorAtual = setorId;
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modalTextarea && modalTextarea.focus(), 100);
    }

    function fecharModal() {
        if (!modal) return;
        modal.style.display = 'none';
        setorAtual = null;
        if (modalTextarea) modalTextarea.value = '';
    }

    function formatDateIsoToBr(isoDate) {
        if (!isoDate) return '';
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    }

    function obterDataSelecionadaOuHoje() {
        if (dateInput && dateInput.value) {
            return formatDateIsoToBr(dateInput.value);
        }
        const hoje = new Date();
        const dd = String(hoje.getDate()).padStart(2, '0');
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const yyyy = hoje.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    // ---------- Abrir modal ao clicar no card "new" ----------
    document.querySelectorAll('.card.new').forEach(card => {
        card.addEventListener('click', (e) => {
            const setor = card.dataset.setor || card.getAttribute('data-setor');
            if (!setor) {
                console.warn('Card "new" sem data-setor definido.');
                return;
            }
            abrirModal(setor);
        });
    });

    // ---------- Fechar modal ----------
    if (modalClose) {
        modalClose.addEventListener('click', fecharModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });

    // ---------- Salvar comunicado (criar card) ----------
    if (modalSave) {
        modalSave.addEventListener('click', () => {
            const texto = (modalTextarea && modalTextarea.value || '').trim();
            if (!texto) {
                alert('Digite o comunicado antes de salvar.');
                if (modalTextarea) modalTextarea.focus();
                return;
            }

            const data = obterDataSelecionadaOuHoje();

            // Encontrar o container do setor
            let container = null;
            if (setorAtual) {
                container = document.querySelector(`#${setorAtual} .card-container`);
            }
            
            if (!container) {
                container = Array.from(document.querySelectorAll('.card-container')).find(cc => {
                    const parentSetor = cc.closest('.setor');
                    if (!parentSetor) return false;
                    return (parentSetor.id === setorAtual) || (parentSetor.getAttribute('data-setor') === setorAtual);
                });
            }

            if (!container) {
                alert('Não foi possível encontrar o setor destino do comunicado.');
                fecharModal();
                return;
            }

            // Garantir que o container tenha a classe de rolagem horizontal
            if (!container.classList.contains('horizontal-scroll')) {
                container.classList.add('horizontal-scroll');
            }

            // criar o card
            const novoCard = document.createElement('div');
            novoCard.className = 'card';
            novoCard.innerHTML = `
                <div class="icons">
                    <div class="left">
                        <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>
                    </div>
                    <div class="right">
                        <small>${data}</small>
                    </div>
                </div>
                <div class="card-text">
                    ${escapeHtml(texto)}
                </div>
            `;

            // Adicionar funcionalidade de clique no card (opcional - pode ser expandido)
            novoCard.addEventListener('click', function() {
                // Aqui você pode adicionar funcionalidade para expandir/editar o comunicado
                console.log('Comunicado clicado:', texto);
            });

            // Inserir antes do card "new" para manter o + sempre no final
            const cardNew = container.querySelector('.card.new');
            if (cardNew) {
                container.insertBefore(novoCard, cardNew);
            } else {
                container.appendChild(novoCard);
            }

            // Limpar e fechar
            fecharModal();
        });
    }

    // Permitir salvar com Ctrl+Enter
    if (modalTextarea) {
        modalTextarea.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && e.metaKey)) {
                e.preventDefault();
                if (modalSave) modalSave.click();
            }
        });
    }

    // Configurar data atual como padrão no calendário
    if (dateInput) {
        const hoje = new Date();
        const dd = String(hoje.getDate()).padStart(2, '0');
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const yyyy = hoje.getFullYear();
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // função simples para escapar HTML (prevenir markup acidental)
    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    // Inicializar todos os containers com a classe horizontal-scroll
    document.querySelectorAll('.card-container').forEach(container => {
        if (!container.classList.contains('horizontal-scroll')) {
            container.classList.add('horizontal-scroll');
        }
    });
});
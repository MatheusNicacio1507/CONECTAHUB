// Verificar se é admin e adicionar item na sidebar
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = userData.isAdmin === true;
    
    if (!isAdmin) return;
    
    console.log('👑 Admin logado, adicionando link para painel...');
    
    // Encontrar a sidebar existente
    const sidebar = document.querySelector('.sidebar .nav-menu');
    
    if (sidebar) {
        // Criar item do painel admin
        const adminItem = document.createElement('li');
        adminItem.className = 'nav-item';
        
        // Se estiver na página admin, marcar como ativo
        const isAdminPage = window.location.pathname.includes('admin.html');
        if (isAdminPage) {
            adminItem.classList.add('active');
        }
        
        adminItem.innerHTML = `
            <a href="admin.html">
                <i class="fas fa-user-shield"></i>
                <span>Painel Admin</span>
            </a>
        `;
        
        // Inserir no início da sidebar (após o perfil)
        const primeiroItem = sidebar.querySelector('.nav-item');
        if (primeiroItem) {
            primeiroItem.parentNode.insertBefore(adminItem, primeiroItem.nextSibling);
        } else {
            sidebar.prepend(adminItem);
        }
        
        // Adicionar ícone de admin ao perfil atual
        const perfilItem = sidebar.querySelector('a[href="perfil.html"]');
        if (perfilItem) {
            perfilItem.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Perfil <small style="color: #52C0F9;">(Admin)</small></span>
            `;
        }
    }
});
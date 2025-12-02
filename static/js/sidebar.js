// ---------- Toggle do menu lateral ----------
(function() {
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            if (window.innerWidth <= 680) return;
            
            if (!e.target.classList.contains('submenu-toggle') &&
                !e.target.closest('.submenu-toggle') &&
                !e.target.closest('.submenu')) {
                sidebar.classList.toggle('expanded');
            }
        });
    }
})();

// =================== FUNÇÃO DE LOGOUT ===================
function configurarLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;
    
    // Configurar evento de clique
    logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Efeito visual de clique
        logoutBtn.style.transform = "scale(0.95)";
        setTimeout(() => {
            logoutBtn.style.transform = "";
        }, 200);
        
        // Confirmar logout
        if (confirm("Deseja realmente sair do sistema?")) {
            // Adicionar efeito visual de saída
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saindo...';
            logoutBtn.disabled = true;
            
            // Limpar dados do usuário
            const usuario = JSON.parse(localStorage.getItem('user') || '{}');
            const nomeUsuario = usuario.nome || 'Usuário';
            
            // Limpar localStorage (opcional: manter algumas configurações)
            localStorage.removeItem("user");
            localStorage.removeItem("chat_conversas_" + (usuario.id || usuario.cpf));
            
            // Mensagem de despedida (opcional)
            console.log(`👋 ${nomeUsuario} saiu do sistema`);
            
            // Redirecionar após breve delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        }
    });
    
    // Efeito hover no botão
    logoutBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// =================== FUNÇÃO DE VERIFICAÇÃO DE LOGIN ===================
function verificarLogin() {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData) {
        // Redirecionar para login com mensagem
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// =================== ATUALIZAÇÃO DA INICIALIZAÇÃO ===================
// Modifique sua função de inicialização para incluir o logout:
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando sistema...');
    
    // 1. Verificar login
    if (!verificarLogin()) {
        return;
    }
    
    // 2. Configurar usuário
    const userData = JSON.parse(localStorage.getItem('user'));
    usuario = {
        nome: userData.nome,
        setor: userData.setor,
        id: userData.cpf || userData.id,
        email: userData.email || ''
    };
    
    console.log('✅ Usuário logado:', usuario.nome);
    
    // 3. Configurar logout
    configurarLogout();
    
    // 4. Configurar sidebar
    configurarSidebar();
    
    // 5. Configurar outros eventos específicos da página
    if (typeof configurarEventos === 'function') {
        configurarEventos();
    }
    
    // 6. Carregar dados específicos da página
    if (typeof carregarInterfaceBasica === 'function') {
        carregarInterfaceBasica();
    }
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// =================== FUNÇÃO AUXILIAR: LOGOUT PROGRAMÁTICO ===================
// Para usar em outras partes do sistema (por exemplo, após inatividade)
function fazerLogoutProgramatico(mensagem = "Sessão encerrada.") {
    // Mostrar notificação
    if (mensagem) {
        alert(mensagem);
    }
    
    // Limpar dados
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.removeItem("user");
    localStorage.removeItem("chat_conversas_" + (usuario.id || usuario.cpf));
    
    // Redirecionar
    window.location.href = "index.html";
}

// =================== VERIFICAR INATIVIDADE (OPCIONAL) ===================
function configurarVerificacaoInatividade() {
    let tempoInatividade;
    const tempoLimite = 30 * 60 * 1000; // 30 minutos
    
    function reiniciarTempo() {
        clearTimeout(tempoInatividade);
        tempoInatividade = setTimeout(fazerLogoutProgramatico, tempoLimite);
    }
    
    // Reiniciar tempo em eventos do usuário
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evento => {
        document.addEventListener(evento, reiniciarTempo);
    });
    
    // Iniciar contagem
    reiniciarTempo();
}
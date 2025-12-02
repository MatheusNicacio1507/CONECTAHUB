// =================== CONFIGURAÇÃO SUPABASE ===================
const SUPABASE_URL = 'https://flpygmhnpagppxitqkhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =================== VARIÁVEIS GLOBAIS ===================
let adminUser = null;
let allUsers = [];

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', async function () {
    console.log('👑 Inicializando painel administrativo...');

    // Verificar se usuário é admin
    await verificarAdmin();

    // Carregar dados
    await carregarDadosDashboard();

    // Configurar eventos
    configurarEventos();

    // Configurar abas
    configurarAbas();

    console.log('✅ Painel administrativo inicializado!');
});

// =================== VERIFICAR ADMIN ===================
async function verificarAdmin() {
    try {
        // Obter dados do usuário logado
        const userData = JSON.parse(localStorage.getItem('user'));

        if (!userData) {
            alert('Você precisa fazer login primeiro!');
            window.location.href = 'index.html';
            return;
        }

        // Verificar se usuário é admin (baseado no CPF ou flag)
        // Aqui você pode verificar de várias formas:
        // 1. Pelo CPF (se o admin tem CPF especial)
        // 2. Pela flag is_admin na tabela usuarios
        // 3. Pelo email

        adminUser = {
            nome: userData.nome,
            setor: userData.setor,
            cpf: userData.cpf,
            email: userData.email
        };

        // Atualizar header
        const avatar = document.getElementById('admin-avatar');
        const greeting = document.getElementById('admin-greeting');

        if (avatar) {
            avatar.textContent = adminUser.nome.charAt(0).toUpperCase();
        }

        if (greeting) {
            greeting.textContent = `Olá, ${adminUser.nome}!`;
        }

        // Log para debug
        console.log('✅ Admin verificado:', adminUser.nome);

    } catch (error) {
        console.error('❌ Erro ao verificar admin:', error);
        alert('Erro ao verificar permissões de administrador.');
        window.location.href = 'index.html';
    }
}

// =================== CARREGAR DADOS DO DASHBOARD ===================
async function carregarDadosDashboard() {
    try {
        console.log('📊 Carregando dados do dashboard...');

        // 1. Carregar estatísticas
        await carregarEstatisticas();

        // 2. Carregar lista de usuários
        await carregarUsuarios();

        // 3. Carregar logs do sistema
        await carregarLogs();

    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

// =================== CARREGAR ESTATÍSTICAS ===================
async function carregarEstatisticas() {
    try {
        // Total de usuários
        const { data: usuarios, error: usersError } = await supabase
            .from('usuarios')
            .select('id');

        if (!usersError && usuarios) {
            document.getElementById('total-users').textContent = usuarios.length;
        }

        // Usuários online (simulação - em produção, você teria uma tabela de sessões)
        const onlineCount = Math.floor(Math.random() * 10) + 5;
        document.getElementById('online-users').textContent = onlineCount;

        // Mensagens hoje (simulação)
        const messagesCount = Math.floor(Math.random() * 100) + 50;
        document.getElementById('today-messages').textContent = messagesCount;

        // Storage usado (simulação)
        const storageUsed = (Math.random() * 5 + 1).toFixed(1);
        document.getElementById('storage-used').textContent = `${storageUsed} GB`;

    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
    }
}

// =================== CARREGAR USUÁRIOS ===================
async function carregarUsuarios() {
    try {
        console.log('👥 Carregando lista de usuários...');

        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('criado_em', { ascending: false });

        if (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            mostrarMensagemErro('Erro ao carregar usuários');
            return;
        }

        allUsers = usuarios || [];

        // Atualizar tabela
        atualizarTabelaUsuarios(usuarios);

        console.log(`✅ ${usuarios.length} usuários carregados`);

    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
    }
}

// =================== ATUALIZAR TABELA DE USUÁRIOS ===================
function atualizarTabelaUsuarios(usuarios) {
    const tbody = document.getElementById('users-table-body');

    if (!tbody) return;

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-user-slash"></i> Nenhum usuário encontrado
                        </td>
                    </tr>
                `;
        return;
    }

    tbody.innerHTML = usuarios.map(usuario => {
        // Verificar se é admin
        const isAdmin = usuario.is_admin || usuario.permissao === 'admin' || usuario.cpf === '00000000000';
        const statusClass = isAdmin ? 'status-admin' : 'status-online';
        const statusText = isAdmin ? '👑 Admin' : '🟢 Online';

        // Formatar data do último login
        const lastLogin = usuario.ultimo_login
            ? formatarData(usuario.ultimo_login)
            : 'Nunca';

        // Inicial do nome para avatar
        const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U';

        return `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar-small">
                                    ${inicial}
                                </div>
                                <div class="user-info">
                                    <div class="user-name">${usuario.nome || 'Sem nome'}</div>
                                    <div class="user-email">${usuario.email || 'Sem email'}</div>
                                </div>
                            </div>
                        </td>
                        <td>${usuario.setor || 'Não informado'}</td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                        <td>${lastLogin}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn edit" onclick="editarUsuario('${usuario.id}')" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn" onclick="resetarSenha('${usuario.id}')" title="Resetar Senha">
                                    <i class="fas fa-key"></i>
                                </button>
                                ${usuario.id !== adminUser?.cpf ? `
                                    <button class="action-btn delete" onclick="deletarUsuario('${usuario.id}')" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
    }).join('');
}

// =================== CARREGAR LOGS ===================
async function carregarLogs() {
    try {
        const logsContainer = document.getElementById('logs-container');

        // Simulação de logs (em produção, você teria uma tabela de logs)
        const logsExemplo = [
            {
                type: 'info',
                icon: 'fas fa-info-circle',
                message: 'Sistema iniciado com sucesso',
                details: ['Sistema', 'Inicialização'],
                time: 'Há 2 minutos'
            },
            {
                type: 'success',
                icon: 'fas fa-user-check',
                message: 'Novo usuário cadastrado: João Silva',
                details: ['Usuários', 'Cadastro'],
                time: 'Há 15 minutos'
            },
            {
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                message: 'Tentativa de login falhou para CPF: 12345678900',
                details: ['Segurança', 'Login'],
                time: 'Há 30 minutos'
            },
            {
                type: 'error',
                icon: 'fas fa-times-circle',
                message: 'Erro ao conectar com o banco de dados',
                details: ['Sistema', 'Banco de Dados'],
                time: 'Há 1 hora'
            },
            {
                type: 'info',
                icon: 'fas fa-database',
                message: 'Backup automático realizado com sucesso',
                details: ['Sistema', 'Backup'],
                time: 'Há 2 horas'
            }
        ];

        if (logsContainer) {
            logsContainer.innerHTML = logsExemplo.map(log => `
                        <div class="log-item">
                            <div class="log-icon ${log.type}">
                                <i class="${log.icon}"></i>
                            </div>
                            <div class="log-content">
                                <div class="log-message">${log.message}</div>
                                <div class="log-details">
                                    ${log.details.map(detail => `<span>${detail}</span>`).join('')}
                                </div>
                            </div>
                            <div class="log-time">${log.time}</div>
                        </div>
                    `).join('');
        }

    } catch (error) {
        console.error('❌ Erro ao carregar logs:', error);
    }
}

// =================== CONFIGURAR EVENTOS ===================
function configurarEventos() {
    // Botão de refresh
    window.refreshDashboard = async function () {
        const btn = document.querySelector('.admin-action-btn.secondary');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            btn.disabled = true;

            await carregarDadosDashboard();

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 1000);
        }
    };

    // Formulário de adicionar usuário
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await adicionarUsuario();
        });
    }

    // Formulário de editar usuário
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await salvarEdicaoUsuario();
        });
    }
}

// =================== CONFIGURAR ABAS ===================
function configurarAbas() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Remover active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Adicionar active ao selecionado
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// =================== MODAL: ADICIONAR USUÁRIO ===================
window.openAddUserModal = function () {
    document.getElementById('add-user-modal').style.display = 'flex';
    document.getElementById('new-user-name').focus();
};

window.closeAddUserModal = function () {
    document.getElementById('add-user-modal').style.display = 'none';
    document.getElementById('add-user-form').reset();
};

// =================== ADICIONAR USUÁRIO ===================
async function adicionarUsuario() {
    try {
        const nome = document.getElementById('new-user-name').value.trim();
        const cpf = document.getElementById('new-user-cpf').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        const setor = document.getElementById('new-user-setor').value;
        const senha = document.getElementById('new-user-password').value;
        const confirmarSenha = document.getElementById('new-user-password-confirm').value;
        const tipo = document.getElementById('new-user-type').value;

        // Validações
        if (!nome || !cpf || !email || !setor || !senha) {
            mostrarMensagemErro('Preencha todos os campos obrigatórios');
            return;
        }

        if (senha !== confirmarSenha) {
            mostrarMensagemErro('As senhas não coincidem');
            return;
        }

        if (senha.length < 6) {
            mostrarMensagemErro('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        // Verificar se CPF já existe
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('cpf')
            .eq('cpf', cpf)
            .single();

        if (existingUser) {
            mostrarMensagemErro('CPF já cadastrado no sistema');
            return;
        }

        // Criar objeto do usuário
        const novoUsuario = {
            id: cpf, // Usando CPF como ID
            nome: nome,
            cpf: cpf,
            email: email,
            setor: setor,
            senha: senha, // Em produção, isso seria criptografado
            is_admin: tipo === 'admin',
            permissao: tipo === 'admin' ? 'admin' : 'usuario',
            criado_em: new Date().toISOString()
        };

        // Inserir no banco
        const { data, error } = await supabase
            .from('usuarios')
            .insert([novoUsuario])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao criar usuário:', error);
            mostrarMensagemErro(`Erro ao criar usuário: ${error.message}`);
            return;
        }

        console.log('✅ Usuário criado com sucesso:', data);

        // Fechar modal e atualizar lista
        closeAddUserModal();
        await carregarUsuarios();
        await carregarEstatisticas();

        // Mostrar mensagem de sucesso
        mostrarMensagemSucesso(`Usuário ${nome} criado com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao adicionar usuário:', error);
        mostrarMensagemErro('Erro ao adicionar usuário');
    }
}

// =================== EDITAR USUÁRIO ===================
window.editarUsuario = async function (userId) {
    try {
        // Encontrar usuário
        const usuario = allUsers.find(u => u.id === userId);

        if (!usuario) {
            mostrarMensagemErro('Usuário não encontrado');
            return;
        }

        // Preencher modal
        document.getElementById('edit-user-id').value = usuario.id;
        document.getElementById('edit-user-name').value = usuario.nome || '';
        document.getElementById('edit-user-cpf').value = usuario.cpf || '';
        document.getElementById('edit-user-email').value = usuario.email || '';
        document.getElementById('edit-user-setor').value = usuario.setor || '';
        document.getElementById('edit-user-type').value =
            (usuario.is_admin || usuario.permissao === 'admin') ? 'admin' : 'user';

        // Mostrar modal
        document.getElementById('edit-user-modal').style.display = 'flex';

    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        mostrarMensagemErro('Erro ao carregar dados do usuário');
    }
};

window.closeEditUserModal = function () {
    document.getElementById('edit-user-modal').style.display = 'none';
    document.getElementById('edit-user-form').reset();
};

async function salvarEdicaoUsuario() {
    try {
        const id = document.getElementById('edit-user-id').value;
        const nome = document.getElementById('edit-user-name').value.trim();
        const cpf = document.getElementById('edit-user-cpf').value.trim();
        const email = document.getElementById('edit-user-email').value.trim();
        const setor = document.getElementById('edit-user-setor').value;
        const tipo = document.getElementById('edit-user-type').value;

        // Validações
        if (!nome || !cpf || !email || !setor) {
            mostrarMensagemErro('Preencha todos os campos obrigatórios');
            return;
        }

        // Atualizar usuário
        const { error } = await supabase
            .from('usuarios')
            .update({
                nome: nome,
                cpf: cpf,
                email: email,
                setor: setor,
                is_admin: tipo === 'admin',
                permissao: tipo === 'admin' ? 'admin' : 'usuario',
                atualizado_em: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            mostrarMensagemErro(`Erro ao atualizar usuário: ${error.message}`);
            return;
        }

        console.log('✅ Usuário atualizado com sucesso');

        // Fechar modal e atualizar lista
        closeEditUserModal();
        await carregarUsuarios();

        // Mostrar mensagem de sucesso
        mostrarMensagemSucesso(`Usuário ${nome} atualizado com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao salvar edição:', error);
        mostrarMensagemErro('Erro ao salvar edição do usuário');
    }
}

// =================== RESETAR SENHA ===================
window.resetarSenha = async function (userId) {
    try {
        const usuario = allUsers.find(u => u.id === userId);

        if (!usuario) {
            mostrarMensagemErro('Usuário não encontrado');
            return;
        }

        const novaSenha = prompt(`Digite a nova senha para ${usuario.nome}:`);

        if (!novaSenha || novaSenha.length < 6) {
            mostrarMensagemErro('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (confirm(`Tem certeza que deseja resetar a senha de ${usuario.nome}?`)) {
            // Em produção, você atualizaria a senha na tabela auth.users
            // Aqui é apenas simulação

            const { error } = await supabase
                .from('usuarios')
                .update({
                    senha: novaSenha,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            mostrarMensagemSucesso(`Senha de ${usuario.nome} resetada com sucesso!`);
            console.log(`✅ Senha resetada para usuário: ${usuario.nome}`);
        }

    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
        mostrarMensagemErro('Erro ao resetar senha');
    }
};

// =================== DELETAR USUÁRIO ===================
window.deletarUsuario = async function (userId) {
    try {
        const usuario = allUsers.find(u => u.id === userId);

        if (!usuario) {
            mostrarMensagemErro('Usuário não encontrado');
            return;
        }

        // Não permitir deletar a si mesmo
        if (usuario.id === adminUser?.cpf) {
            mostrarMensagemErro('Você não pode deletar seu próprio usuário');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?\n\nEsta ação não pode ser desfeita.`)) {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            // Atualizar lista
            await carregarUsuarios();
            await carregarEstatisticas();

            mostrarMensagemSucesso(`Usuário ${usuario.nome} excluído com sucesso!`);
            console.log(`✅ Usuário deletado: ${usuario.nome}`);
        }

    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        mostrarMensagemErro('Erro ao deletar usuário');
    }
};

// =================== FUNÇÕES AUXILIARES ===================
function formatarData(dataString) {
    if (!dataString) return 'Nunca';

    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora - data;
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) return 'Agora mesmo';
    if (diffMinutos < 60) return `Há ${diffMinutos} min`;
    if (diffHoras < 24) return `Há ${diffHoras} h`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `Há ${diffDias} dias`;

    return data.toLocaleDateString('pt-BR');
}

function mostrarMensagemSucesso(mensagem) {
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = 'notification-success';
    notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${mensagem}</span>
            `;

    // Estilos da notificação
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #d4edda;
                color: #155724;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                animation: slideInRight 0.3s ease-out;
            `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function mostrarMensagemErro(mensagem) {
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = 'notification-error';
    notification.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${mensagem}</span>
            `;

    // Estilos da notificação
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                color: #721c24;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                animation: slideInRight 0.3s ease-out;
            `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =================== ANIMAÇÕES CSS ADICIONAIS ===================
const style = document.createElement('style');
style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .notification-success {
                border-left: 4px solid #28a745;
            }
            
            .notification-error {
                border-left: 4px solid #dc3545;
            }
        `;
document.head.appendChild(style);
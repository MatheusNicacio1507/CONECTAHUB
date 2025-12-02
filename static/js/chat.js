// ===================================================
// chat.js - CHAT COMPLETO COM MENSAGENS DIRETAS (CORRIGIDO)
// ===================================================

// 1. CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://flpygmhnpagppxitqkhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. VARIÁVEIS GLOBAIS
let usuario = null;
let canalAtual = 'CHAT GERAL';
let todasMensagens = [];
let chatPrivadoAtual = null;
let todosUsuarios = [];
let conversasAtivas = [];
let intervaloAtualizacao = null;

// 3. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando chat com mensagens diretas...');
    
    // Verificar login
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'index.html';
        return;
    }
    
    usuario = {
        nome: userData.nome,
        setor: userData.setor,
        id: userData.cpf || userData.id || `user_${Date.now()}`,
        email: userData.email || ''
    };
    
    console.log('✅ Usuário logado:', usuario.nome);
    
    // Configurar eventos
    configurarEventos();
    
    // Carregar todos os usuários
    await carregarUsuarios();
    
    // Carregar interface
    carregarInterfaceBasica();
    
    // Carregar conversas ativas
    await carregarConversasAtivas();
    
    // Carregar mensagens iniciais
    await carregarMensagensIniciais();
    
    // Iniciar atualização automática
    iniciarAtualizacaoAutomatica();
    
    console.log('✅ Sistema completo inicializado!');
});

// 4. CONFIGURAR EVENTOS
function configurarEventos() {
    // Botão enviar mensagem
    const sendBtn = document.getElementById('chat-send-btn');
    const inputMsg = document.getElementById('chat-input-msg');
    
    if (sendBtn) sendBtn.addEventListener('click', enviarMensagem);
    
    if (inputMsg) {
        inputMsg.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
            }
        });
    }
    
    // Botão nova conversa
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) newChatBtn.addEventListener('click', mostrarModalUsuarios);
    
    // Botão "+" no título (fallback)
    const directTitle = document.querySelector('.direct-title span');
    if (directTitle) {
        directTitle.innerHTML = '<i class="fas fa-plus"></i>';
        directTitle.style.cursor = 'pointer';
        directTitle.addEventListener('click', mostrarModalUsuarios);
    }
    
    // Fechar modal
    const closeModal = document.getElementById('close-modal');
    if (closeModal) closeModal.addEventListener('click', fecharModalUsuarios);
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('users-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) fecharModalUsuarios();
        });
    }
    
    // Buscar usuários (com debounce)
    const searchInput = document.getElementById('search-users');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                filtrarUsuarios(this.value);
            }, 300);
        });
    }
}

// Substitua a função carregarUsuarios() por esta versão corrigida:

// 5. CARREGAR USUÁRIOS DO BANCO
async function carregarUsuarios() {
    try {
        console.log('👥 Carregando usuários da tabela "usuarios"...');
        
        // IMPORTANTE: Verificar qual campo usar como ID
        const userData = JSON.parse(localStorage.getItem('user'));
        const meuCpf = userData?.cpf;
        
        if (!meuCpf) {
            console.error('❌ CPF não encontrado no localStorage');
            alert('Erro: CPF do usuário não encontrado. Faça login novamente.');
            return;
        }
        
        // Atualizar o ID do usuário com o CPF
        usuario.id = meuCpf;
        
        // Buscar da tabela usuarios, excluindo o próprio usuário pelo CPF
        const { data: usuariosDB, error } = await supabase
            .from('usuarios')
            .select('id, nome, email, setor, cpf')
            .neq('cpf', meuCpf); // Excluir pelo CPF
        
        if (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            // Fallback para localStorage
            const usuariosSalvos = JSON.parse(localStorage.getItem('chat_usuarios')) || [];
            todosUsuarios = usuariosSalvos;
        } else if (usuariosDB && usuariosDB.length > 0) {
            console.log(`✅ ${usuariosDB.length} usuários encontrados`);
            
            // Mapear para o formato correto, usando CPF como ID principal
            todosUsuarios = usuariosDB.map(user => ({
                id: user.cpf, // Usar CPF como ID
                nome: user.nome,
                setor: user.setor || 'Não informado',
                email: user.email || '',
                cpf: user.cpf,
                user_id: user.id // Manter o ID UUID também
            }));
            
            // Salvar no localStorage como cache
            localStorage.setItem('chat_usuarios', JSON.stringify(todosUsuarios));
        } else {
            console.log('📭 Nenhum usuário encontrado, criando lista básica');
            todosUsuarios = criarUsuariosFallback();
        }
        
        console.log(`✅ ${todosUsuarios.length} usuários disponíveis para chat`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        todosUsuarios = criarUsuariosFallback();
    }
}

// 6. CRIAR USUÁRIOS FALLBACK
function criarUsuariosFallback() {
    return [
        { id: 'cpf_001', nome: 'Ana Silva', setor: 'RH', email: 'ana@empresa.com' },
        { id: 'cpf_002', nome: 'Carlos Santos', setor: 'TI', email: 'carlos@empresa.com' },
        { id: 'cpf_003', nome: 'Mariana Oliveira', setor: 'Financeiro', email: 'mariana@empresa.com' },
        { id: 'cpf_004', nome: 'Roberto Alves', setor: 'Produção', email: 'roberto@empresa.com' },
        { id: 'cpf_005', nome: 'Fernanda Lima', setor: 'Administração', email: 'fernanda@empresa.com' }
    ].filter(u => u.id !== usuario.id);
}

// 7. INTERFACE BÁSICA
function carregarInterfaceBasica() {
    // Canais fixos
    const canais = ['CHAT GERAL', 'Produção', 'Engenharia', 'Administração', 'TI', 'Financeiro', 'RH'];
    const container = document.getElementById('channels-list');
    
    if (container) {
        container.innerHTML = '';
        canais.forEach(nome => {
            const li = document.createElement('li');
            li.className = 'channel' + (nome === canalAtual && !chatPrivadoAtual ? ' selected' : '');
            li.textContent = `# ${nome}`;
            li.dataset.canal = nome;
            li.addEventListener('click', () => selecionarCanal(nome));
            container.appendChild(li);
        });
    }
    
    atualizarInterfaceChat();
}

// 8. MODAL DE USUÁRIOS
async function mostrarModalUsuarios() {
    const modal = document.getElementById('users-modal');
    const usersList = document.getElementById('users-list');
    
    if (!modal || !usersList) {
        console.error('Modal elements not found');
        return;
    }
    
    // Mostrar loading
    usersList.innerHTML = `
        <div class="loading-users">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando usuários...</p>
        </div>
    `;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Carregar usuários se necessário
    if (todosUsuarios.length === 0) {
        await carregarUsuarios();
    }
    
    // Atualizar lista
    atualizarListaUsuariosNoModal('');
}

function fecharModalUsuarios() {
    const modal = document.getElementById('users-modal');
    if (modal) modal.style.display = 'none';
}

function filtrarUsuarios(termo) {
    atualizarListaUsuariosNoModal(termo.toLowerCase());
}

function atualizarListaUsuariosNoModal(termoBusca) {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    
    if (todosUsuarios.length === 0) {
        usersList.innerHTML = `
            <div class="no-users">
                <i class="fas fa-user-slash"></i>
                <p>Nenhum usuário disponível</p>
            </div>
        `;
        return;
    }
    
    // Filtrar usuários
    const usuariosFiltrados = todosUsuarios.filter(user => {
        if (!termoBusca) return true;
        
        const nome = user.nome.toLowerCase();
        const setor = user.setor.toLowerCase();
        const email = user.email.toLowerCase();
        
        return nome.includes(termoBusca) || 
               setor.includes(termoBusca) || 
               email.includes(termoBusca);
    });
    
    if (usuariosFiltrados.length === 0) {
        usersList.innerHTML = `
            <div class="no-users">
                <i class="fas fa-search"></i>
                <p>Nenhum usuário encontrado</p>
            </div>
        `;
        return;
    }
    
    // Criar lista HTML
    usersList.innerHTML = '';
    
    usuariosFiltrados.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        // Cor do avatar baseada no nome
        const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#A29BFE'];
        const corIndex = user.nome.length % cores.length;
        const inicial = user.nome.charAt(0).toUpperCase();
        
        userItem.innerHTML = `
            <div class="user-avatar" style="background: ${cores[corIndex]}">
                ${inicial}
            </div>
            <div class="user-info">
                <div class="user-name">${user.nome}</div>
                <div class="user-setor">${user.setor}</div>
            </div>
            <div class="status-indicator status-online"></div>
        `;
        
        userItem.addEventListener('click', () => {
            iniciarChatPrivado(user);
            fecharModalUsuarios();
        });
        
        usersList.appendChild(userItem);
    });
}

// 9. INICIAR CHAT PRIVADO
function iniciarChatPrivado(outroUsuario) {
    console.log('💬 Iniciando chat com:', outroUsuario.nome);
    
    // Definir chat privado atual
    chatPrivadoAtual = outroUsuario;
    canalAtual = null;
    
    // Limpar mensagens
    todasMensagens = [];
    
    // Atualizar UI
    atualizarInterfaceChat();
    
    // Carregar histórico
    carregarHistoricoChatPrivado();
    
    // Atualizar conversas
    atualizarListaConversas();
}

// 10. ATUALIZAR INTERFACE DO CHAT
function atualizarInterfaceChat() {
    const titulo = document.getElementById('current-channel');
    const input = document.getElementById('chat-input-msg');
    
    if (!titulo || !input) return;
    
    if (chatPrivadoAtual) {
        // Modo chat privado
        titulo.innerHTML = `
            <i class="fas fa-user-friends"></i>
            <b>${chatPrivadoAtual.nome}</b>
            <span class="private-chat-indicator">
                <i class="fas fa-lock"></i> Privado
            </span>
        `;
        input.placeholder = `Digite uma mensagem para ${chatPrivadoAtual.nome}...`;
    } else {
        // Modo canal público
        titulo.innerHTML = `<b># ${canalAtual}</b>`;
        input.placeholder = `Digite uma mensagem no ${canalAtual}...`;
    }
    
    // Atualizar seleção nos canais
    document.querySelectorAll('.channel').forEach(el => {
        el.classList.remove('selected');
        if (!chatPrivadoAtual && el.dataset.canal === canalAtual) {
            el.classList.add('selected');
        }
    });
    
    input.focus();
}

// 11. CARREGAR HISTÓRICO DO CHAT PRIVADO
async function carregarHistoricoChatPrivado() {
    if (!chatPrivadoAtual) return;
    
    try {
        console.log('📨 Carregando histórico do chat privado...');
        
        // Buscar mensagens (usando criado_em em vez de created_at)
        const { data: mensagens, error } = await supabase
            .from('mensagens_diretas')
            .select('*')
            .or(`and(remetente_id.eq.${usuario.id},destinatario_id.eq.${chatPrivadoAtual.id}),and(remetente_id.eq.${chatPrivadoAtual.id},destinatario_id.eq.${usuario.id})`)
            .order('criado_em', { ascending: true }); // Note: criado_em
        
        if (error) {
            console.error('❌ Erro ao carregar histórico:', error);
            mostrarMensagemBoasVindasPrivado();
            return;
        }
        
        todasMensagens = mensagens || [];
        
        // Marcar como lidas
        await marcarMensagensComoLidas();
        
        // Mostrar mensagens
        mostrarMensagensNaTela(todasMensagens, true);
        
        console.log(`✅ ${todasMensagens.length} mensagens carregadas`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
        mostrarMensagemBoasVindasPrivado();
    }
}

// 12. CARREGAR CONVERSAS ATIVAS
async function carregarConversasAtivas() {
    try {
        console.log('💬 Carregando conversas...');
        
        // Buscar mensagens diretas do usuário
        const { data: mensagens, error } = await supabase
            .from('mensagens_diretas')
            .select('*')
            .or(`remetente_id.eq.${usuario.id},destinatario_id.eq.${usuario.id}`)
            .order('criado_em', { ascending: false });
        
        if (error) {
            console.warn('⚠️ Erro ao carregar conversas:', error);
            // Usar localStorage como fallback
            const conversasSalvas = JSON.parse(localStorage.getItem(`chat_conversas_${usuario.id}`)) || [];
            conversasAtivas = conversasSalvas;
        } else if (mensagens && mensagens.length > 0) {
            // Processar para criar lista de conversas
            const conversasMap = new Map();
            
            mensagens.forEach(msg => {
                const outroId = msg.remetente_id === usuario.id ? msg.destinatario_id : msg.remetente_id;
                const outroNome = msg.remetente_id === usuario.id ? msg.destinatario_nome : msg.remetente_nome;
                
                if (!conversasMap.has(outroId)) {
                    const naoLidas = msg.destinatario_id === usuario.id && !msg.lida ? 1 : 0;
                    
                    // Encontrar usuário correspondente
                    const userInfo = todosUsuarios.find(u => u.id === outroId) || {
                        id: outroId,
                        nome: outroNome,
                        setor: 'Usuário'
                    };
                    
                    conversasMap.set(outroId, {
                        id: outroId,
                        nome: userInfo.nome,
                        setor: userInfo.setor,
                        ultimaMensagem: msg.texto,
                        timestamp: msg.criado_em, // Note: criado_em
                        naoLidas: naoLidas
                    });
                }
            });
            
            conversasAtivas = Array.from(conversasMap.values());
        }
        
        // Atualizar lista
        atualizarListaConversas();
        
        console.log(`✅ ${conversasAtivas.length} conversas carregadas`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar conversas:', error);
    }
}

// 13. ATUALIZAR LISTA DE CONVERSAS
function atualizarListaConversas() {
    const container = document.getElementById('conversations-list');
    if (!container) return;
    
    if (conversasAtivas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-style: italic;">
                Nenhuma conversa
            </div>
        `;
        return;
    }
    
    // Ordenar por data
    conversasAtivas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = '';
    
    conversasAtivas.forEach(conversa => {
        const item = document.createElement('div');
        item.className = 'conversation-item' + 
            (chatPrivadoAtual && chatPrivadoAtual.id === conversa.id ? ' active' : '');
        
        // Avatar
        const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const corIndex = conversa.nome.length % cores.length;
        const inicial = conversa.nome.charAt(0).toUpperCase();
        
        // Preview da mensagem
        const preview = conversa.ultimaMensagem.length > 25 ? 
            conversa.ultimaMensagem.substring(0, 25) + '...' : 
            conversa.ultimaMensagem;
        
        item.innerHTML = `
            <div class="conversation-avatar" style="background: ${cores[corIndex]}">
                ${inicial}
            </div>
            <div class="conversation-info">
                <div class="conversation-name">${conversa.nome}</div>
                <div class="conversation-preview">${preview}</div>
            </div>
            ${conversa.naoLidas > 0 ? `<div class="unread-badge">${conversa.naoLidas}</div>` : ''}
        `;
        
        item.addEventListener('click', () => {
            iniciarChatPrivado({
                id: conversa.id,
                nome: conversa.nome,
                setor: conversa.setor
            });
        });
        
        container.appendChild(item);
    });
}

// 14. ENVIAR MENSAGEM
async function enviarMensagem() {
    const input = document.getElementById('chat-input-msg');
    const texto = input.value.trim();
    
    if (!texto) return;
    
    console.log('✉️ Enviando mensagem...');
    
    if (chatPrivadoAtual) {
        await enviarMensagemPrivada(texto);
    } else {
        await enviarMensagemPublica(texto);
    }
    
    input.value = '';
    input.focus();
}

// 15. ENVIAR MENSAGEM PRIVADA (ATUALIZADA PARA ATUALIZAÇÃO IMEDIATA)
async function enviarMensagemPrivada(texto) {
    if (!chatPrivadoAtual) {
        console.error('❌ Nenhum chat privado selecionado');
        return;
    }
    
    try {
        console.log('💬 Enviando mensagem privada para:', chatPrivadoAtual.nome);
        
        // 1. CRIAR MENSAGEM TEMPORÁRIA PARA FEEDBACK IMEDIATO
        const mensagemTemp = {
            id: 'temp_' + Date.now(),
            remetente_id: usuario.id,
            remetente_nome: usuario.nome,
            destinatario_id: chatPrivadoAtual.id,
            destinatario_nome: chatPrivadoAtual.nome,
            texto: texto,
            criado_em: new Date().toISOString(),
            lida: true,
            isTemp: true
        };
        
        // Adicionar temporariamente à lista
        todasMensagens.push(mensagemTemp);
        
        // Mostrar IMEDIATAMENTE na tela
        mostrarMensagensNaTela(todasMensagens, true);
        
        // 2. ENVIAR PARA O BANCO
        const mensagemData = {
            remetente_id: usuario.id.toString(),
            remetente_nome: usuario.nome,
            destinatario_id: chatPrivadoAtual.id.toString(),
            destinatario_nome: chatPrivadoAtual.nome,
            texto: texto,
            lida: false,
            criado_em: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('mensagens_diretas')
            .insert([mensagemData])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            
            // Tentar inserção simplificada
            const { error: simpleError } = await supabase
                .from('mensagens_diretas')
                .insert([{
                    remetente_id: usuario.id.toString(),
                    remetente_nome: usuario.nome,
                    destinatario_id: chatPrivadoAtual.id.toString(),
                    destinatario_nome: chatPrivadoAtual.nome,
                    texto: texto
                }]);
            
            if (simpleError) {
                console.error('❌ Erro na tentativa simplificada:', simpleError);
                
                // Manter a mensagem temporária marcando como local
                const index = todasMensagens.findIndex(m => m.id === mensagemTemp.id);
                if (index !== -1) {
                    todasMensagens[index].isLocal = true;
                    todasMensagens[index].isTemp = false;
                }
                
                alert('Mensagem salva localmente (servidor indisponível)');
                return;
            }
            
            // Se a inserção simplificada funcionou, buscar a mensagem
            const { data: mensagensRecentes } = await supabase
                .from('mensagens_diretas')
                .select('*')
                .eq('remetente_id', usuario.id)
                .eq('destinatario_id', chatPrivadoAtual.id)
                .order('criado_em', { ascending: false })
                .limit(1);
            
            if (mensagensRecentes && mensagensRecentes.length > 0) {
                data = mensagensRecentes[0];
            }
        }
        
        // 3. SUBSTITUIR MENSAGEM TEMPORÁRIA PELA REAL
        if (data) {
            // Remover temporária
            todasMensagens = todasMensagens.filter(m => m.id !== mensagemTemp.id);
            
            // Adicionar mensagem real
            todasMensagens.push(data);
            
            // Ordenar
            todasMensagens.sort((a, b) => 
                new Date(a.criado_em || a.created_at) - new Date(b.criado_em || b.created_at)
            );
            
            // Mostrar atualizado
            mostrarMensagensNaTela(todasMensagens, true);
            
            console.log('✅ Mensagem enviada e salva:', data.id);
        } else {
            // Se não conseguiu buscar a mensagem real, manter a local
            const index = todasMensagens.findIndex(m => m.id === mensagemTemp.id);
            if (index !== -1) {
                todasMensagens[index].isLocal = true;
                todasMensagens[index].isTemp = false;
            }
        }
        
        // 4. ATUALIZAR CONVERSAS
        atualizarConversaApósMensagem(texto);
        
        // 5. FORÇAR VERIFICAÇÃO DE NOVAS MENSAGENS (para caso o outro usuário responda)
        setTimeout(() => {
            verificarNovasMensagensNoChatAtual();
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro crítico ao enviar mensagem:', error);
        
        // Manter mensagem local em caso de erro
        const index = todasMensagens.findIndex(m => m.isTemp);
        if (index !== -1) {
            todasMensagens[index].isLocal = true;
            todasMensagens[index].isTemp = false;
        }
        
        alert('Erro ao enviar mensagem. Ela foi salva localmente.');
    }
}

// 16. ENVIAR MENSAGEM PÚBLICA
async function enviarMensagemPublica(texto) {
    try {
        console.log('📢 Enviando mensagem pública para:', canalAtual);
        
        const { data, error } = await supabase
            .from('chat_mensagens')
            .insert([{
                usuario_nome: usuario.nome,
                usuario_setor: usuario.setor,
                texto: texto,
                canal: canalAtual
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Atualizar localmente
        todasMensagens.push(data);
        mostrarMensagensNaTela(todasMensagens);
        
        console.log('✅ Mensagem pública enviada');
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem pública:', error);
    }
}

// 17. MOSTRAR MENSAGENS NA TELA
function mostrarMensagensNaTela(mensagens, isPrivado = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (mensagens.length === 0) {
        if (isPrivado && chatPrivadoAtual) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: white;">
                    <i class="fas fa-user-friends" style="font-size: 48px; margin-bottom: 20px; color: #52C0F9;"></i>
                    <h3>Conversa com ${chatPrivadoAtual.nome}</h3>
                    <p>Inicie a conversa enviando uma mensagem!</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: white;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>${canalAtual || 'Chat'}</h3>
                    <p>Nenhuma mensagem ainda.</p>
                </div>
            `;
        }
        return;
    }
    
    mensagens.forEach(msg => {
        const isMinha = isPrivado ? 
            (msg.remetente_id === usuario.id) : 
            (msg.usuario_nome === usuario.nome);
        
        const card = document.createElement('div');
        card.className = isMinha ? 'message-card-me' : 'message-card';
        
        // Informações
        const nome = isPrivado ? 
            (isMinha ? 'Você' : msg.remetente_nome) : 
            msg.usuario_nome;
        
        const setor = isPrivado ? 
            (isMinha ? usuario.setor : chatPrivadoAtual?.setor) : 
            msg.usuario_setor;
        
        // Cor do avatar
        const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const corIndex = nome.length % cores.length;
        
        // Hora formatada (usando criado_em)
        const dataMsg = new Date(msg.criado_em || msg.created_at);
        const hora = dataMsg.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        card.innerHTML = `
            <div class="avatar" style="background: ${cores[corIndex]};">
                ${nome.charAt(0).toUpperCase()}
            </div>
            <div class="user-data">
                <div class="user">
                    ${nome} 
                    <span style="font-size: 12px; color: #ddd;">(${setor})</span>
                    <span style="font-size: 11px; color: #999; margin-left: 10px;">${hora}</span>
                    ${isPrivado && isMinha ? 
                        (msg.lida ? 
                            '<i class="fas fa-check-double" style="margin-left: 5px; color: #4ECDC4;"></i>' : 
                            '<i class="fas fa-check" style="margin-left: 5px; color: #ccc;"></i>') : 
                        ''}
                </div>
                <div style="margin-top: 5px; color: ${isMinha ? '#000' : '#fff'};">${msg.texto}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Scroll para baixo
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// 18. MARCAR MENSAGENS COMO LIDAS
async function marcarMensagensComoLidas() {
    if (!chatPrivadoAtual) return;
    
    try {
        const { error } = await supabase
            .from('mensagens_diretas')
            .update({ lida: true })
            .eq('destinatario_id', usuario.id)
            .eq('remetente_id', chatPrivadoAtual.id)
            .eq('lida', false);
        
        if (error) throw error;
        
        // Atualizar contador local
        const conversa = conversasAtivas.find(c => c.id === chatPrivadoAtual.id);
        if (conversa) {
            conversa.naoLidas = 0;
            atualizarListaConversas();
        }
        
    } catch (error) {
        console.error('❌ Erro ao marcar como lida:', error);
    }
}

// 19. ATUALIZAR CONVERSA APÓS MENSAGEM
function atualizarConversaApósMensagem(ultimaMensagem) {
    if (!chatPrivadoAtual) return;
    
    const index = conversasAtivas.findIndex(c => c.id === chatPrivadoAtual.id);
    
    if (index !== -1) {
        conversasAtivas[index].ultimaMensagem = ultimaMensagem;
        conversasAtivas[index].timestamp = new Date().toISOString();
        conversasAtivas[index].naoLidas = 0;
    } else {
        conversasAtivas.push({
            id: chatPrivadoAtual.id,
            nome: chatPrivadoAtual.nome,
            setor: chatPrivadoAtual.setor,
            ultimaMensagem: ultimaMensagem,
            timestamp: new Date().toISOString(),
            naoLidas: 0
        });
    }
    
    // Ordenar
    conversasAtivas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Salvar
    localStorage.setItem(`chat_conversas_${usuario.id}`, JSON.stringify(conversasAtivas));
    
    // Atualizar UI
    atualizarListaConversas();
}

// 20. SELECIONAR CANAL
async function selecionarCanal(nome) {
    console.log('🔄 Selecionando canal:', nome);
    
    chatPrivadoAtual = null;
    canalAtual = nome;
    todasMensagens = [];
    
    atualizarInterfaceChat();
    atualizarListaConversas();
    
    await carregarMensagensIniciais();
}

// 21. CARREGAR MENSAGENS INICIAIS
async function carregarMensagensIniciais() {
    if (chatPrivadoAtual) {
        await carregarHistoricoChatPrivado();
        return;
    }
    
    try {
        const { data: mensagens, error } = await supabase
            .from('chat_mensagens')
            .select('*')
            .eq('canal', canalAtual)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.warn('⚠️ Erro:', error.message);
            return;
        }
        
        todasMensagens = mensagens || [];
        mostrarMensagensNaTela(todasMensagens);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// 22. INICIAR ATUALIZAÇÃO AUTOMÁTICA (CORRIGIDA)
function iniciarAtualizacaoAutomatica() {
    if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
    
    intervaloAtualizacao = setInterval(async () => {
        await verificarNovasMensagens();
        
        // Se estiver em um chat privado, verificar novas mensagens específicas
        if (chatPrivadoAtual) {
            await verificarNovasMensagensNoChatAtual();
        }
    }, 2000); // 2 segundos (mais rápido)
    
    console.log('⏱️ Atualização automática ativada (2 segundos)');
}

// Nova função para verificar mensagens no chat atual
async function verificarNovasMensagensNoChatAtual() {
    if (!chatPrivadoAtual) return;
    
    try {
        // Pegar o timestamp da última mensagem que temos
        let ultimoTimestamp = null;
        if (todasMensagens.length > 0) {
            const ultimaMsg = todasMensagens[todasMensagens.length - 1];
            ultimoTimestamp = ultimaMsg.criado_em || ultimaMsg.created_at;
        }
        
        // Construir query
        let query = supabase
            .from('mensagens_diretas')
            .select('*')
            .or(`and(remetente_id.eq.${usuario.id},destinatario_id.eq.${chatPrivadoAtual.id}),and(remetente_id.eq.${chatPrivadoAtual.id},destinatario_id.eq.${usuario.id})`)
            .order('criado_em', { ascending: true });
        
        // Se temos timestamp, buscar apenas mensagens novas
        if (ultimoTimestamp) {
            query = query.gt('criado_em', ultimoTimestamp);
        }
        
        const { data: novasMensagens, error } = await query;
        
        if (error) {
            console.warn('⚠️ Erro ao verificar novas mensagens:', error);
            return;
        }
        
        if (novasMensagens && novasMensagens.length > 0) {
            console.log(`📥 ${novasMensagens.length} nova(s) mensagem(ns) no chat atual`);
            
            // Filtrar duplicatas
            const idsExistentes = todasMensagens.map(m => m.id);
            const mensagensNovas = novasMensagens.filter(m => !idsExistentes.includes(m.id));
            
            if (mensagensNovas.length > 0) {
                // Adicionar novas mensagens
                todasMensagens.push(...mensagensNovas);
                
                // Ordenar por data
                todasMensagens.sort((a, b) => 
                    new Date(a.criado_em || a.created_at) - new Date(b.criado_em || b.created_at)
                );
                
                // Atualizar tela
                mostrarMensagensNaTela(todasMensagens, true);
                
                // Marcar como lidas
                await marcarMensagensComoLidas();
                
                // Play som de notificação (opcional)
                playNotificationSound();
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar mensagens do chat atual:', error);
    }
}

// Função para tocar som de notificação
function playNotificationSound() {
    try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
        audio.volume = 0.3;
        audio.play();
    } catch (e) {
        console.log('🔇 Som de notificação não disponível');
    }
}

// 23. VERIFICAR NOVAS MENSAGENS
async function verificarNovasMensagens() {
    try {
        // Verificar mensagens privadas não lidas
        const { data: novasPrivadas, error } = await supabase
            .from('mensagens_diretas')
            .select('*')
            .eq('destinatario_id', usuario.id)
            .eq('lida', false);
        
        if (!error && novasPrivadas && novasPrivadas.length > 0) {
            // Atualizar conversas
            novasPrivadas.forEach(msg => {
                const conversa = conversasAtivas.find(c => c.id === msg.remetente_id);
                if (conversa) {
                    conversa.naoLidas = (conversa.naoLidas || 0) + 1;
                    conversa.ultimaMensagem = msg.texto;
                    conversa.timestamp = msg.criado_em;
                } else {
                    // Adicionar nova conversa
                    conversasAtivas.push({
                        id: msg.remetente_id,
                        nome: msg.remetente_nome,
                        ultimaMensagem: msg.texto,
                        timestamp: msg.criado_em,
                        naoLidas: 1
                    });
                }
            });
            
            // Atualizar UI
            atualizarListaConversas();
            localStorage.setItem(`chat_conversas_${usuario.id}`, JSON.stringify(conversasAtivas));
            
            console.log(`📩 ${novasPrivadas.length} nova(s) mensagem(ns) privada(s)`);
        }
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}

// 24. DEBUG FUNCTIONS
window.testarChat = function() {
    console.log('=== DEBUG CHAT ===');
    console.log('Usuário:', usuario);
    console.log('Canal atual:', canalAtual);
    console.log('Chat privado:', chatPrivadoAtual);
    console.log('Total usuários:', todosUsuarios.length);
    console.log('Total conversas:', conversasAtivas.length);
    console.log('Usuários:', todosUsuarios);
};

window.limparDados = function() {
    localStorage.removeItem('chat_usuarios');
    localStorage.removeItem(`chat_conversas_${usuario.id}`);
    console.log('🧹 Dados locais limpos');
    location.reload();
};
// ===============================
// chat.js - CHAT FUNCIONAL 100%
// ===============================

// 1. CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://flpygmhnpagppxitqkhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. VARIÁVEIS GLOBAIS
let usuario = null;
let canalAtual = 'CHAT GERAL';
let todasMensagens = []; // ← ARMAZENA TODAS AS MENSAGENS

// 3. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando chat...');
    
    // Verifica login
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'index.html';
        return;
    }
    
    usuario = {
        nome: userData.nome,
        setor: userData.setor,
        id: userData.id || userData.cpf
    };
    
    console.log('✅ Usuário logado:', usuario.nome);
    
    // Configura sidebar
    configurarSidebar();
    
    // Configura eventos
    configurarEventos();
    
    // Carrega interface
    carregarInterfaceBasica();
    
    // Carrega mensagens iniciais
    await carregarMensagensIniciais();
    
    // Inicia atualização automática
    iniciarAtualizacaoAutomatica();
    
    console.log('✅ Chat inicializado com sucesso!');
});

// 4. CONFIGURAR SIDEBAR
function configurarSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    sidebar.addEventListener('click', function(e) {
        if (window.innerWidth > 680 && 
            !e.target.classList.contains('submenu-toggle') &&
            !e.target.closest('.submenu-toggle') &&
            !e.target.closest('.submenu')) {
            sidebar.classList.toggle('expanded');
        }
    });
    
    // Submenu
    const submenuToggle = document.querySelector('.submenu-toggle');
    const navItem = document.querySelector('.nav-item.has-submenu');
    
    if (submenuToggle && navItem) {
        submenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navItem.classList.toggle('active');
        });
    }
}

// 5. CONFIGURAR EVENTOS
function configurarEventos() {
    // Botão enviar
    const btnEnviar = document.getElementById('chat-send-btn');
    const inputMsg = document.getElementById('chat-input-msg');
    
    btnEnviar.addEventListener('click', enviarMensagem);
    
    inputMsg.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });
}

// 6. INTERFACE BÁSICA
function carregarInterfaceBasica() {
    // Canais fixos
    const canais = ['CHAT GERAL', 'Produção', 'Engenharia', 'Administração'];
    const container = document.getElementById('channels-list');
    
    if (container) {
        container.innerHTML = '';
        canais.forEach(nome => {
            const li = document.createElement('li');
            li.className = 'channel' + (nome === canalAtual ? ' selected' : '');
            li.textContent = `# ${nome}`;
            li.dataset.canal = nome;
            li.onclick = () => selecionarCanal(nome);
            container.appendChild(li);
        });
    }
    
    // Atualiza título
    const titulo = document.getElementById('current-channel');
    if (titulo) titulo.textContent = canalAtual;
    
    // Atualiza placeholder
    const inputMsg = document.getElementById('chat-input-msg');
    if (inputMsg) {
        inputMsg.placeholder = `Digite uma mensagem no ${canalAtual}...`;
        inputMsg.focus();
    }
}

// 7. CARREGAR MENSAGENS INICIAIS
async function carregarMensagensIniciais() {
    try {
        console.log('📨 Carregando mensagens iniciais...');
        
        const { data: mensagens, error } = await supabase
            .from('chat_mensagens')
            .select('*')
            .eq('canal', canalAtual)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.warn('⚠️ Erro ao carregar mensagens:', error.message);
            mostrarMensagemBoasVindas();
            return;
        }
        
        // Armazena todas as mensagens
        todasMensagens = mensagens || [];
        
        // Mostra na tela
        mostrarMensagensNaTela(todasMensagens);
        
        console.log(`✅ ${todasMensagens.length} mensagens carregadas`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// 8. MOSTRAR MENSAGENS NA TELA
function mostrarMensagensNaTela(mensagens) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    // LIMPA o container ANTES de adicionar
    container.innerHTML = '';
    
    if (mensagens.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>${canalAtual}</h3>
                <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
            </div>
        `;
        return;
    }
    
    console.log(`🖥️ Exibindo ${mensagens.length} mensagens`);
    
    // Adiciona cada mensagem
    mensagens.forEach(msg => {
        const isMinha = msg.usuario_nome === usuario.nome;
        const card = document.createElement('div');
        card.className = isMinha ? 'message-card-me' : 'message-card';
        
        // Cor do avatar
        const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const corIndex = msg.usuario_nome.length % cores.length;
        
        // Hora formatada
        const dataMsg = new Date(msg.created_at);
        const hora = dataMsg.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        card.innerHTML = `
            <div class="avatar" style="background: ${cores[corIndex]};">
                ${msg.usuario_nome.charAt(0).toUpperCase()}
            </div>
            <div class="user-data">
                <div class="user">
                    ${msg.usuario_nome} 
                    <span style="font-size: 12px; color: #ddd;">(${msg.usuario_setor})</span>
                    <span style="font-size: 11px; color: #999; margin-left: 10px;">${hora}</span>
                </div>
                <div style="margin-top: 5px; color: ${isMinha ? '#000' : '#fff'};">${msg.texto}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Scroll para baixo
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        console.log('⬇️ Scroll para baixo realizado');
    }, 100);
}

// 9. MENSAGEM DE BOAS-VINDAS
function mostrarMensagemBoasVindas() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: white;">
            <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 20px;"></i>
            <h3>Bem-vindo ao ${canalAtual}!</h3>
            <p>Este é o chat geral da empresa. Envie sua primeira mensagem!</p>
        </div>
    `;
}

// 10. SELECIONAR CANAL
async function selecionarCanal(nome) {
    console.log('🔄 Mudando para canal:', nome);
    
    // Atualiza canal atual
    canalAtual = nome;
    
    // Atualiza UI dos canais
    document.querySelectorAll('.channel').forEach(el => {
        el.classList.remove('selected');
        if (el.dataset.canal === nome) {
            el.classList.add('selected');
        }
    });
    
    // Atualiza título
    const titulo = document.getElementById('current-channel');
    if (titulo) titulo.textContent = nome;
    
    // Atualiza placeholder
    const inputMsg = document.getElementById('chat-input-msg');
    if (inputMsg) {
        inputMsg.placeholder = `Digite uma mensagem no ${nome}...`;
        inputMsg.focus();
    }
    
    // Limpa mensagens antigas
    todasMensagens = [];
    
    // Carrega mensagens do novo canal
    await carregarMensagensIniciais();
    
    console.log(`✅ Canal ${nome} selecionado`);
}

// 11. ENVIAR MENSAGEM
async function enviarMensagem() {
    const input = document.getElementById('chat-input-msg');
    const texto = input.value.trim();
    
    if (!texto) {
        console.log('⚠️ Mensagem vazia');
        return;
    }
    
    console.log('✉️ Enviando mensagem:', texto);
    
    // 1. Cria mensagem TEMPORÁRIA para feedback imediato
    const mensagemTemp = {
        id: 'temp_' + Date.now(),
        usuario_nome: usuario.nome,
        usuario_setor: usuario.setor,
        texto: texto,
        canal: canalAtual,
        created_at: new Date().toISOString(),
        isTemp: true
    };
    
    // 2. Adiciona temporariamente à lista
    todasMensagens.push(mensagemTemp);
    
    // 3. Mostra na tela IMEDIATAMENTE
    mostrarMensagensNaTela(todasMensagens);
    
    // 4. Limpa input
    input.value = '';
    input.focus();
    
    try {
        // 5. Envia para o banco
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
        
        console.log('✅ Mensagem salva no banco:', data.id);
        
        // 6. Remove a temporária
        todasMensagens = todasMensagens.filter(m => !m.isTemp);
        
        // 7. Adiciona a mensagem real
        todasMensagens.push(data);
        
        // 8. Atualiza a tela com a mensagem real
        mostrarMensagensNaTela(todasMensagens);
        
    } catch (error) {
        console.error('❌ Erro ao enviar:', error);
        
        // Remove a mensagem temporária em caso de erro
        todasMensagens = todasMensagens.filter(m => !m.isTemp);
        mostrarMensagensNaTela(todasMensagens);
        
        alert('Erro ao enviar mensagem. Tente novamente.');
    }
}

// 12. ATUALIZAR MENSAGENS (busca novas)
async function atualizarMensagens() {
    if (!usuario || !canalAtual) return;
    
    try {
        console.log('🔄 Verificando novas mensagens...');
        
        // Pega a última mensagem que temos
        const ultimaMensagem = todasMensagens[todasMensagens.length - 1];
        
        let query = supabase
            .from('chat_mensagens')
            .select('*')
            .eq('canal', canalAtual)
            .order('created_at', { ascending: true });
        
        // Se temos mensagens, busca apenas as novas
        if (ultimaMensagem && ultimaMensagem.id && !ultimaMensagem.isTemp) {
            const { data: ultimaMsgData } = await supabase
                .from('chat_mensagens')
                .select('created_at')
                .eq('id', ultimaMensagem.id)
                .single();
            
            if (ultimaMsgData) {
                query = query.gt('created_at', ultimaMsgData.created_at);
            }
        }
        
        const { data: novasMensagens, error } = await query;
        
        if (error) {
            console.warn('⚠️ Erro ao verificar novas mensagens:', error.message);
            return;
        }
        
        if (novasMensagens && novasMensagens.length > 0) {
            console.log(`📥 ${novasMensagens.length} nova(s) mensagem(ns) encontrada(s)`);
            
            // Filtra mensagens que já temos (evita duplicatas)
            const idsExistentes = todasMensagens.map(m => m.id);
            const mensagensRealmenteNovas = novasMensagens.filter(m => 
                !idsExistentes.includes(m.id)
            );
            
            if (mensagensRealmenteNovas.length > 0) {
                // Adiciona as novas mensagens
                todasMensagens.push(...mensagensRealmenteNovas);
                
                // Atualiza a tela
                mostrarMensagensNaTela(todasMensagens);
                
                console.log(`✅ ${mensagensRealmenteNovas.length} mensagem(ns) adicionada(s)`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}

// 13. INICIAR ATUALIZAÇÃO AUTOMÁTICA
function iniciarAtualizacaoAutomatica() {
    // Atualiza a cada 3 segundos
    setInterval(() => {
        atualizarMensagens();
    }, 3000);
    
    console.log('⏱️ Atualização automática ativada (3 segundos)');
}

// 14. TESTE RÁPIDO NO CONSOLE
window.testarChat = function() {
    console.log('=== TESTE DO CHAT ===');
    console.log('Usuário:', usuario);
    console.log('Canal atual:', canalAtual);
    console.log('Total mensagens:', todasMensagens.length);
    console.log('Mensagens:', todasMensagens);
    
    // Forçar atualização
    atualizarMensagens();
};
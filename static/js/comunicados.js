// comunicados.js - VERSÃO SIMPLIFICADA E FUNCIONAL

/* ========== CONFIGURAÇÃO SUPABASE ========== */
let supabaseClient = null;

// Função de inicialização modificada
async function inicializarSupabase() {
    try {
        // Esperar a biblioteca carregar
        if (window.supabaseLoaded) {
            await window.supabaseLoaded;
        }
        
        // Aguardar um pouco para garantir
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar se supabase está disponível
        if (typeof supabase === 'undefined') {
            // Tentar carregar se não estiver disponível
            console.warn('Supabase não disponível, tentando carregar...');
            await carregarSupabaseSeNecessario();
        }
        
        if (typeof supabase === 'undefined') {
            throw new Error('Biblioteca Supabase não disponível após tentativa de carregamento');
        }
        
        // SUAS CREDENCIAIS - SUBSTITUA AQUI
        const SUPABASE_URL = 'https://flpygmhnpagppxitqkhw.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA';
        
        // Criar cliente
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        console.log('✅ Supabase inicializado com sucesso');
        console.log('URL:', SUPABASE_URL);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        console.log('⚠️ Continuando sem banco de dados...');
        return false;
    }
}

// Função auxiliar para carregar Supabase se necessário
async function carregarSupabaseSeNecessario() {
    return new Promise((resolve) => {
        if (typeof supabase !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            console.log('📚 Biblioteca Supabase carregada dinamicamente');
            resolve();
        };
        script.onerror = () => {
            console.warn('⚠️ Não foi possível carregar Supabase dinamicamente');
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

/* ========== FUNÇÕES DO BANCO DE DADOS (COM FALLBACK) ========== */
async function carregarComunicados() {
    if (!supabaseClient) {
        console.log('Usando fallback (local storage) para carregar comunicados');
        return carregarDoLocalStorage();
    }
    
    try {
        console.log('📡 Buscando comunicados do Supabase...');
        const { data, error } = await supabaseClient
            .from('comunicados')
            .select('*')
            .order('data_exibicao', { ascending: false });
        
        if (error) {
            console.warn('Erro no Supabase, usando fallback:', error);
            return carregarDoLocalStorage();
        }
        
        console.log(`✅ ${data?.length || 0} comunicados carregados do Supabase`);
        return data || [];
    } catch (error) {
        console.error('Erro ao carregar comunicados:', error);
        return carregarDoLocalStorage();
    }
}

async function salvarComunicado(comunicado) {
    // Adicionar ID se não existir
    if (!comunicado.id) {
        comunicado.id = 'temp_' + Date.now();
    }
    
    if (!supabaseClient) {
        console.log('Salvando no local storage (fallback)');
        return salvarNoLocalStorage(comunicado);
    }
    
    try {
        console.log('💾 Salvando no Supabase...', comunicado);
        const { data, error } = await supabaseClient
            .from('comunicados')
            .insert([{
                titulo: comunicado.titulo,
                conteudo: comunicado.conteudo,
                setor: comunicado.setor,
                data_exibicao: comunicado.data_exibicao
            }])
            .select()
            .single();
        
        if (error) {
            console.warn('Erro no Supabase, salvando localmente:', error);
            return salvarNoLocalStorage(comunicado);
        }
        
        console.log('✅ Salvo no Supabase:', data);
        return data;
    } catch (error) {
        console.error('Erro ao salvar:', error);
        return salvarNoLocalStorage(comunicado);
    }
}

async function excluirComunicado(id) {
    if (!supabaseClient) {
        console.log('Excluindo do local storage (fallback)');
        return excluirDoLocalStorage(id);
    }
    
    try {
        const { error } = await supabaseClient
            .from('comunicados')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao excluir:', error);
        return excluirDoLocalStorage(id);
    }
}

/* ========== FUNÇÕES FALLBACK (LOCAL STORAGE) ========== */
function carregarDoLocalStorage() {
    try {
        const dados = localStorage.getItem('comunicados_fallback');
        if (dados) {
            const parsed = JSON.parse(dados);
            console.log(`📦 ${parsed.length} comunicados carregados do LocalStorage`);
            return parsed;
        }
    } catch (e) {
        console.warn('Erro ao ler do LocalStorage:', e);
    }
    return [];
}

function salvarNoLocalStorage(comunicado) {
    try {
        const comunicados = carregarDoLocalStorage();
        
        // Se já existe, atualiza
        const index = comunicados.findIndex(c => c.id === comunicado.id);
        if (index >= 0) {
            comunicados[index] = comunicado;
        } else {
            comunicados.push(comunicado);
        }
        
        localStorage.setItem('comunicados_fallback', JSON.stringify(comunicados));
        console.log('💾 Salvo no LocalStorage');
        return comunicado;
    } catch (e) {
        console.error('Erro ao salvar no LocalStorage:', e);
        throw e;
    }
}

function excluirDoLocalStorage(id) {
    try {
        const comunicados = carregarDoLocalStorage();
        const novosComunicados = comunicados.filter(c => c.id !== id);
        localStorage.setItem('comunicados_fallback', JSON.stringify(novosComunicados));
        console.log('🗑️ Excluído do LocalStorage');
        return true;
    } catch (e) {
        console.error('Erro ao excluir do LocalStorage:', e);
        throw e;
    }
}

/* ========== FUNÇÕES DE UI (MANTIDAS) ========== */
function formatarData(dataISO) {
    if (!dataISO) return '';
    try {
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) return dataISO;
        
        const dd = String(data.getDate()).padStart(2, '0');
        const mm = String(data.getMonth() + 1).padStart(2, '0');
        const yyyy = data.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    } catch {
        return dataISO;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function criarCardComunicado(comunicado) {
    const card = document.createElement('div');
    card.className = 'card comunicado-card';
    card.dataset.id = comunicado.id;
    card.dataset.setor = comunicado.setor;
    
    const dataFormatada = formatarData(comunicado.data_exibicao);
    
    card.innerHTML = `
        <div class="icons">
            <div class="left">
                <i class="fa-solid fa-bullhorn"></i>
                <button class="btn-excluir" title="Excluir comunicado">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="right">
                <small>${dataFormatada}</small>
            </div>
        </div>
        <div class="card-text">
            ${escapeHtml(comunicado.conteudo)}
        </div>
    `;
    
    // Evento de exclusão
    card.querySelector('.btn-excluir').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Deseja excluir este comunicado?')) {
            try {
                await excluirComunicado(comunicado.id);
                card.remove();
                mostrarMensagem('Comunicado excluído com sucesso!', 'success');
            } catch (error) {
                mostrarMensagem('Erro ao excluir comunicado', 'error');
            }
        }
    });
    
    // Evento de clique para editar
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-excluir')) {
            abrirModalParaEdicao(comunicado);
        }
    });
    
    return card;
}

function renderizarComunicados(comunicados) {
    if (!comunicados || !Array.isArray(comunicados)) {
        console.warn('Nenhum comunicado para renderizar');
        return;
    }
    
    console.log(`🎨 Renderizando ${comunicados.length} comunicados`);
    
    // Agrupar por setor
    const porSetor = {};
    comunicados.forEach(c => {
        if (!porSetor[c.setor]) porSetor[c.setor] = [];
        porSetor[c.setor].push(c);
    });
    
    // Renderizar em cada setor
    Object.entries(porSetor).forEach(([setor, lista]) => {
        const container = document.querySelector(
            `#${setor} .card-container, 
             [data-setor="${setor}"] .card-container,
             .setor#${setor} .card-container`
        );
        
        if (container) {
            // Remover cards antigos (exceto o "new")
            const cardsAntigos = container.querySelectorAll('.comunicado-card');
            cardsAntigos.forEach(card => card.remove());
            
            // Adicionar novos cards
            lista.forEach(comunicado => {
                const card = criarCardComunicado(comunicado);
                const cardNew = container.querySelector('.card.new');
                
                if (cardNew) {
                    container.insertBefore(card, cardNew);
                } else {
                    container.appendChild(card);
                }
            });
            
            // Garantir classe de scroll
            container.classList.add('horizontal-scroll');
        }
    });
}

function mostrarMensagem(texto, tipo = 'info') {
    // Remove mensagem anterior
    const msgAnterior = document.querySelector('.mensagem-flutuante');
    if (msgAnterior) msgAnterior.remove();
    
    // Cria nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-flutuante ${tipo}`;
    mensagem.textContent = texto;
    mensagem.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(mensagem);
    
    // Remove após 3 segundos
    setTimeout(() => {
        mensagem.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => mensagem.remove(), 300);
    }, 3000);
}

/* ========== MODAL ========== */
let setorAtual = null;
let comunicadoEditando = null;

function abrirModalParaEdicao(comunicado) {
    comunicadoEditando = comunicado;
    setorAtual = comunicado.setor;
    
    const modal = document.getElementById('modal');
    const textarea = document.getElementById('modal-text');
    const titulo = document.getElementById('modal-titulo');
    const dateInput = document.getElementById('calendar-input');
    
    if (!modal || !textarea) return;
    
    titulo.textContent = 'Editar Comunicado';
    textarea.value = comunicado.conteudo;
    
    if (comunicado.data_exibicao && dateInput) {
        const data = new Date(comunicado.data_exibicao);
        dateInput.value = data.toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    setTimeout(() => textarea.focus(), 100);
}

function abrirModalParaNovo(setorId) {
    console.log('Abrindo modal para novo comunicado no setor:', setorId);
    
    comunicadoEditando = null;
    setorAtual = setorId;
    
    const modal = document.getElementById('modal');
    const textarea = document.getElementById('modal-text');
    const tituloElement = document.getElementById('modal-titulo');
    const dateInput = document.getElementById('calendar-input');
    
    console.log('Elementos encontrados:', {
        modal: !!modal,
        textarea: !!textarea,
        tituloElement: !!tituloElement,
        dateInput: !!dateInput
    });
    
    if (!modal || !textarea) {
        console.error('Modal ou textarea não encontrados');
        mostrarMensagem('Erro ao abrir o modal. Elementos não encontrados.', 'error');
        return;
    }
    
    // Definir título - verifica se o elemento existe
    if (tituloElement) {
        tituloElement.textContent = 'Novo Comunicado';
    } else {
        console.warn('Elemento modal-titulo não encontrado');
    }
    
    // Limpar textarea
    textarea.value = '';
    
    // Definir data atual
    if (dateInput) {
        const hoje = new Date();
        dateInput.value = hoje.toISOString().split('T')[0];
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Focar no textarea
    setTimeout(() => {
        textarea.focus();
        console.log('Modal aberto com sucesso');
    }, 100);
}

function fecharModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.style.display = 'none';
    setorAtual = null;
    comunicadoEditando = null;
    
    const textarea = document.getElementById('modal-text');
    if (textarea) textarea.value = '';
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando página...');
    
    // 1. Inicializar Supabase
    const supabaseOk = await inicializarSupabase();
    
    // 2. Carregar comunicados
    try {
        const comunicados = await carregarComunicados();
        renderizarComunicados(comunicados);
    } catch (error) {
        console.error('Erro ao carregar comunicados:', error);
        mostrarMensagem('Erro ao carregar comunicados', 'error');
    }
    
    // 3. Configurar elementos UI
    const modal = document.getElementById('modal');
    const textarea = document.getElementById('modal-text');
    const btnSalvar = document.getElementById('btn-save');
    const btnFechar = document.getElementById('modal-close');
    const dateInput = document.getElementById('calendar-input');
    
    if (!modal || !btnSalvar) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
    // 4. Botões "Novo Comunicado"
    document.querySelectorAll('.card.new').forEach(card => {
        card.addEventListener('click', () => {
            const setor = card.dataset.setor || 
                         card.closest('.setor')?.id || 
                         card.closest('[data-setor]')?.dataset.setor;
            
            if (setor) {
                abrirModalParaNovo(setor);
            } else {
                mostrarMensagem('Setor não identificado', 'error');
            }
        });
    });
    
    // 5. Fechar modal
    if (btnFechar) btnFechar.addEventListener('click', fecharModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
    
    // 6. Salvar comunicado
    btnSalvar.addEventListener('click', async () => {
        const texto = textarea?.value?.trim() || '';
        if (!texto) {
            mostrarMensagem('Digite o comunicado antes de salvar', 'error');
            textarea?.focus();
            return;
        }
        
        if (!setorAtual) {
            mostrarMensagem('Setor não identificado', 'error');
            return;
        }
        
        const dataSelecionada = dateInput?.value || new Date().toISOString().split('T')[0];
        
        const dadosComunicado = {
            id: comunicadoEditando?.id,
            titulo: texto.substring(0, 100),
            conteudo: texto,
            setor: setorAtual,
            data_exibicao: dataSelecionada
        };
        
        try {
            if (comunicadoEditando) {
                await salvarComunicado(dadosComunicado);
                mostrarMensagem('Comunicado atualizado com sucesso!', 'success');
            } else {
                await salvarComunicado(dadosComunicado);
                mostrarMensagem('Comunicado salvo com sucesso!', 'success');
            }
            
            // Recarregar e renderizar
            const novosComunicados = await carregarComunicados();
            renderizarComunicados(novosComunicados);
            
            fecharModal();
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarMensagem(`Erro: ${error.message}`, 'error');
        }
    });
    
    // 7. Ctrl+Enter para salvar
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                btnSalvar.click();
            }
        });
    }
    
    // 8. Inicializar containers
    document.querySelectorAll('.card-container').forEach(container => {
        container.classList.add('horizontal-scroll');
    });
    
    console.log('✅ Página inicializada com sucesso!');
});

// Adicione este CSS ao seu arquivo style.css
const estiloMensagem = document.createElement('style');
estiloMensagem.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .mensagem-flutuante {
        font-family: Arial, sans-serif;
        font-size: 14px;
    }
`;
document.head.appendChild(estiloMensagem);
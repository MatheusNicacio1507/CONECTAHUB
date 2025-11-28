/* ---------- Toggle do menu lateral ---------- */    
const sidebar = document.getElementById('sidebar');   
function isMobile() {
    return window.innerWidth <= 680;
}
  
sidebar.addEventListener('click', function(e) {    
    if (isMobile()) return; // no celular não expande
    
    // Só não expande/recolhe se clicar especificamente na setinha do submenu
    if (!e.target.classList.contains('submenu-toggle') && 
        !e.target.closest('.submenu-toggle') &&
        !e.target.closest('.submenu')) {    
        sidebar.classList.toggle('expanded');    
    }    
});
let userData = {  
name: "Maria Silva",  
role: "Analista de Marketing",  
department: "Marketing",  
cpf: "123.456.789-00",  
email: "maria.silva@empresa.com",  
phone: "(11) 98765-4321",  
photo: null,  
score: 1250,  
badges: 8  
};

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
  
function setupEventListeners() {  
// Event listeners específicos do ranking podem ser adicionados aqui
}  

// =================== NOVAS FUNÇÕES PARA REUNIÕES ===================

// Dados de exemplo para reuniões
let recentMeetings = [
    {
        id: 1,
        title: "Reunião de Planejamento",
        date: "2025-11-15",
        time: "14:30",
        code: "ABC-123-XYZ"
    },
    {
        id: 2,
        title: "Apresentação de Resultados",
        date: "2025-12-01",
        time: "10:00",
        code: "DEF-456-UVW"
    },
    {
        id: 3,
        title: "Brainstorming de Campanha",
        date: "2025-12-03",
        time: "08:15",
        code: "GHI-789-RST"
    }
];

// Função para mostrar/ocultar campo de código
function toggleCodeInput() {
    const codeInputContainer = document.getElementById('code-input-container');
    const showCodeBtn = document.getElementById('show-code-btn');
    
    if (codeInputContainer.classList.contains('hidden')) {
        codeInputContainer.classList.remove('hidden');
        codeInputContainer.classList.add('show');
        showCodeBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
    } else {
        codeInputContainer.classList.add('hidden');
        codeInputContainer.classList.remove('show');
        showCodeBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar com código';
        document.getElementById('meeting-code').value = '';
    }
}

// Função para abrir o modal de iniciar reunião
function openMeetingModal() {
    document.getElementById('meeting-modal').classList.add('show');
}

// Função para fechar o modal de iniciar reunião
function closeMeetingModal() {
    document.getElementById('meeting-modal').classList.remove('show');
}

// Função para criar uma nova reunião
function createMeeting() {
    const title = document.getElementById('meeting-title').value;
    const description = document.getElementById('meeting-description').value;
    
    if (!title) {
        alert('Por favor, insira um título para a reunião');
        return;
    }
    
    // Gerar código aleatório para a reunião
    const code = generateMeetingCode();
    
    // Adicionar à lista de reuniões recentes
    const newMeeting = {
        id: recentMeetings.length + 1,
        title: title,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        code: code
    };
    
    recentMeetings.unshift(newMeeting);
    updateMeetingsList();
    
    // Fechar modal e limpar campos
    closeMeetingModal();
    document.getElementById('meeting-title').value = '';
    document.getElementById('meeting-description').value = '';
    document.getElementById('meeting-participants').value = '';
    
    alert(`Reunião "${title}" criada com sucesso! Código: ${code}`);
}

// Função para gerar código de reunião
function generateMeetingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 2 || i === 5) result += '-';
    }
    return result;
}

// Função para entrar em uma reunião
function joinMeeting() {
    const code = document.getElementById('meeting-code').value.trim();
    
    if (!code) {
        alert('Por favor, insira um código da reunião');
        return;
    }
    
    // Verificar se é um código válido (simulação)
    if (code.length < 5) {
        alert('Código inválido');
        return;
    }
    
    alert(`Entrando na reunião: ${code}`);
    // Aqui você implementaria a lógica real para entrar na reunião
    
    // Limpar campo e ocultar input após entrar
    document.getElementById('meeting-code').value = '';
    toggleCodeInput();
}

// Função para atualizar a lista de reuniões
function updateMeetingsList() {
    const meetingsList = document.getElementById('meetings-list');
    if (!meetingsList) return; // Se não estiver na página de reuniões, sai
    
    meetingsList.innerHTML = '';
    
    recentMeetings.forEach(meeting => {
        const meetingItem = document.createElement('div');
        meetingItem.className = 'meeting-item';
        meetingItem.innerHTML = `
            <div class="meeting-info">
                <div class="meeting-title">${meeting.title}</div>
                <div class="meeting-date">${formatDate(meeting.date)} às ${meeting.time}</div>
            </div>
            <button class="meeting-join-btn" onclick="joinExistingMeeting('${meeting.code}')">
                Entrar
            </button>
        `;
        meetingsList.appendChild(meetingItem);
    });
}

// Função para formatar a data
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para entrar em uma reunião existente
function joinExistingMeeting(code) {
    alert(`Entrando na reunião: ${code}`);
    // Aqui você implementaria a lógica real para entrar na reunião
}

// Inicialização
function init() {
    const savedData = localStorage.getItem('conectahub_user_data');  
    if (savedData) userData = { ...userData, ...JSON.parse(savedData) };  
      
    setupEventListeners();      
    setupSubmenuToggle();
    
    // REMOVIDO: Event listeners que causavam o "navegando para"
    
    // Adicionar event listeners para as novas funcionalidades de reunião
    const startMeetingBtn = document.getElementById('start-meeting-btn');
    const showCodeBtn = document.getElementById('show-code-btn');
    const joinMeetingBtn = document.getElementById('join-meeting-btn');
    const meetingCodeInput = document.getElementById('meeting-code');
    
    if (startMeetingBtn) {
        startMeetingBtn.addEventListener('click', openMeetingModal);
    }
    
    if (showCodeBtn) {
        showCodeBtn.addEventListener('click', toggleCodeInput);
    }
    
    if (joinMeetingBtn) {
        joinMeetingBtn.addEventListener('click', joinMeeting);
    }
    
    if (meetingCodeInput) {
        // Permitir pressionar Enter no campo de código
        meetingCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinMeeting();
            }
        });
    }
    
    // Atualizar lista de reuniões (se estiver na página de reuniões)
    updateMeetingsList();
}

document.addEventListener('DOMContentLoaded', init);
/* === DADOS DOS RANKINGS === */

const rankingsData = {
    rh: [
        { position: 1, name: "João Silva", points: 1850 },
        { position: 2, name: "Maria Santos", points: 1720 },
        { position: 3, name: "Pedro Oliveira", points: 1650 }
    ],
    engenharia: [
        { position: 1, name: "Carlos Lima", points: 2100 },
        { position: 2, name: "Ana Costa", points: 1950 },
        { position: 3, name: "Roberto Alves", points: 1820 }
    ],
    producao: [
        { position: 1, name: "Fernanda Rocha", points: 2400 },
        { position: 2, name: "Ricardo Souza", points: 2250 },
        { position: 3, name: "Patrícia Mendes", points: 2100 }
    ],
    // NOVOS SETORES ADICIONADOS
    administracao: [
        { position: 1, name: "Luiza Ferreira", points: 1950 },
        { position: 2, name: "Marcelo Costa", points: 1820 },
        { position: 3, name: "Beatriz Almeida", points: 1750 }
    ],
    ti: [
        { position: 1, name: "Rafael Santos", points: 2200 },
        { position: 2, name: "Camila Oliveira", points: 2050 },
        { position: 3, name: "Daniel Pereira", points: 1980 }
    ],
    financeiro: [
        { position: 1, name: "Juliana Mendes", points: 1900 },
        { position: 2, name: "Gustavo Lima", points: 1850 },
        { position: 3, name: "Amanda Souza", points: 1780 }
    ]
};

const departmentNames = {
    rh: "RH",
    engenharia: "Engenharia",
    producao: "Produção",
    // NOVOS SETORES ADICIONADOS
    administracao: "Administração",
    ti: "TI",
    financeiro: "Financeiro"
};

/* === FUNÇÃO PARA MUDAR O DEPARTAMENTO === */

function showDepartment(department) {
    // Atualiza o título
    document.getElementById('current-department').textContent = `# ${departmentNames[department]}`;
    
    // Atualiza o conteúdo do ranking
    const rankingContent = document.getElementById('ranking-content');
    rankingContent.innerHTML = '';
    
    const rankings = rankingsData[department];
    
    rankings.forEach(rank => {
        const positionCard = document.createElement('div');
        positionCard.className = `position-card ${getPositionClass(rank.position)}`;
        
        positionCard.innerHTML = `
            <div class="position-number">${rank.position}º</div>
            <div class="position-info">
                <div class="position-name">${rank.name}</div>
                <div class="position-points">${rank.points.toLocaleString()} pontos</div>
            </div>
            ${rank.position === 1 ? '<i class="fas fa-crown crown-icon"></i>' : ''}
        `;
        
        rankingContent.appendChild(positionCard);
    });
    
    // Atualiza os badges ativos
    document.querySelectorAll('.department-badge').forEach(badge => {
        badge.classList.remove('active');
    });
    
    const activeBadge = document.querySelector(`.department-badge[onclick="showDepartment('${department}')"]`);
    if (activeBadge) {
        activeBadge.classList.add('active');
    }
}

function getPositionClass(position) {
    switch(position) {
        case 1: return 'first-place';
        case 2: return 'second-place';
        case 3: return 'third-place';
        default: return '';
    }
}

// ... o restante do seu código JavaScript permanece igual ...
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

// Inicialização
function init() {
    const savedData = localStorage.getItem('conectahub_user_data');  
    if (savedData) userData = { ...userData, ...JSON.parse(savedData) };  
      
    setupEventListeners();      
    setupSubmenuToggle();
    
    // REMOVIDO: Event listeners que causavam o "navegando para"
    // As linhas abaixo foram removidas:
    /*
    // Adicionar event listeners para navegação no menu
    document.querySelectorAll('.nav-item:not(.has-submenu)').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.querySelector('span').textContent;
            navigateTo(pageName);
        });
    });
    
    // Adicionar event listeners para submenu
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.querySelector('span').textContent;
            navigateTo(pageName);
        });
    });
    */
}

document.addEventListener('DOMContentLoaded', init);
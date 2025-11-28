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
name: "",  
role: "Analista de Marketing",  
department: "Marketing",  
cpf: "123.456.789-00",  
email: "maria.silva@empresa.com",  
phone: "(11) 98765-4321",  
photo: null,  
score: 1250,  
badges: 8  
};  
  
function openPhotoModal() {  
const photoModal = document.getElementById('photo-modal');  
const modalProfileImg = document.getElementById('modal-profile-img');  
photoModal.classList.add('show');  
modalProfileImg.src = userData.photo ? userData.photo : "";  
}  
  
function closePhotoModal() {  
document.getElementById('photo-modal').classList.remove('show');  
}  
  
function changePhoto() {  
document.getElementById('photo-upload').click();  
}  
  
function removePhoto() {  
if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {  
    userData.photo = null;  
    updateProfileDisplay();  
    localStorage.setItem('conectahub_user_data', JSON.stringify(userData));  
    alert('Foto removida com sucesso!');  
    closePhotoModal();  
}  
}  
  
function updateProfileDisplay() {  
document.getElementById('user-name').textContent = userData.name;  
document.getElementById('display-name').textContent = userData.name;  
document.getElementById('display-role').textContent = userData.role;  
document.getElementById('display-department').textContent = userData.department;  
document.getElementById('display-cpf').textContent = userData.cpf;  
  
const profileImg = document.getElementById('profile-img');    
profileImg.src = userData.photo ? userData.photo : "";    
}  

/* ---------- Toggle dos stats ---------- */    
function setupStatsToggle() {  
const statItems = document.querySelectorAll('.stat-item');  
  
statItems.forEach(item => {  
    item.addEventListener('click', function(e) {  
        // Fecha outros itens abertos
        statItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });
        
        // Abre/fecha o item atual  
        item.classList.toggle('active');  
    });  
});  
}  
  
function setupSubmenuToggle() {  
const submenuToggle = document.querySelector('.submenu-toggle');  
const navItem = document.querySelector('.nav-item.has-submenu');  
  
if (submenuToggle && navItem) {      
    submenuToggle.addEventListener('click', function(e) {      
        e.stopPropagation(); // IMPEDE QUE FECHE O MENU INTEIRO
        e.preventDefault(); // ADICIONADO PARA MAIS SEGURANÇA
        navItem.classList.toggle('active');      
    });      
          
    const navItemMain = document.querySelector('.nav-item-main');      
    navItemMain.addEventListener('click', function(e) {      
        // Só abre/fecha o submenu se não clicar na setinha
        if (!e.target.classList.contains('submenu-toggle') && !e.target.closest('.submenu-toggle')) {      
            navItem.classList.toggle('active');      
        }      
    });      
}  
}  
  
function handlePhotoUpload(event) {  
const file = event.target.files[0];  
if (file) {  
    if (!file.type.match('image.*')) {    
        alert('Por favor, selecione uma imagem válida.');    
        return;    
    }    
  
    if (file.size > 5 * 1024 * 1024) {      
        alert('A imagem deve ter no máximo 5MB.');      
        return;      
    }    
  
    const reader = new FileReader();      
    reader.onload = function(e) {      
        userData.photo = e.target.result;      
        updateProfileDisplay();      
        localStorage.setItem('conectahub_user_data', JSON.stringify(userData));      
        alert('Foto de perfil atualizada com sucesso!');      
        closePhotoModal();      
    };      
    reader.readAsDataURL(file);      
}  
}  
  
function setupEventListeners() {  
const photoUpload = document.getElementById('photo-upload');  
photoUpload.addEventListener('change', handlePhotoUpload);  
  
const photoModal = document.getElementById('photo-modal');      
photoModal.addEventListener('click', function(e) {      
    if (e.target === photoModal) closePhotoModal();    
});  
}  
  
function init() {  
const savedData = localStorage.getItem('conectahub_user_data');  
if (savedData) userData = { ...userData, ...JSON.parse(savedData) };  
  
updateProfileDisplay();      
setupEventListeners();      
setupSubmenuToggle();  
setupStatsToggle();  
}  
  
document.addEventListener('DOMContentLoaded', init);
// ===============================
//  perfil.js (VERSÃO FINAL FUNCIONAL)
// ===============================

// --- Configuração Supabase ---
const SUPABASE_URL = 'https://flpygmhnpagppxitqkhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNTM0MiwiZXhwIjoyMDc4OTkxMzQyfQ.MYMJvDDp2ee6jzytr1IM-WMyjmEtAnF6euHCZ4kdZMc'; // SUA SERVICE ROLE KEY
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DADOS DO USUÁRIO ---
let userData = {
    id: "",
    name: "",
    department: "",
    cpf: "",
    email: "",
    photo: null,
    score: 0,
    badges: 0
};

// --- VERIFICA LOGIN ---
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Carregando perfil...");
    
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
        alert("Você precisa fazer login.");
        window.location.href = "index.html";
        return;
    }
    
    console.log("Usuário encontrado:", user);
    
    userData.id = user.id || "";
    userData.name = user.nome || "Usuário";
    userData.department = user.setor || "Setor";
    userData.cpf = user.cpf || "";
    userData.email = user.email || "—";
    
    // Carrega foto
    await carregarFotoPerfil();
    
    // Atualiza interface
    atualizarInterface();
    
    // Configura logout
    configurarLogout();
    
    console.log("Perfil carregado com sucesso");
});

// --- CARREGA FOTO ---
async function carregarFotoPerfil() {
    try {
        // 1. Tenta do localStorage primeiro
        const saved = localStorage.getItem("conectahub_user_data");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.photo && parsed.cpf === userData.cpf) {
                userData.photo = parsed.photo;
                console.log("Foto carregada do localStorage");
                return;
            }
        }
        
        // 2. Tenta do Supabase Storage
        if (userData.cpf) {
            const fileName = `perfil_${userData.cpf}.jpg`;
            console.log("Buscando no Storage:", fileName);
            
            // Obtém URL pública
            const { data: urlData } = supabase.storage
                .from('fotos-perfil')
                .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
                // Testa se a imagem existe
                const img = new Image();
                img.onload = () => {
                    console.log("✅ Foto encontrada no Storage");
                    userData.photo = urlData.publicUrl + '?t=' + Date.now();
                    
                    // Salva cache
                    localStorage.setItem("conectahub_user_data", JSON.stringify({
                        cpf: userData.cpf,
                        photo: userData.photo,
                        timestamp: Date.now()
                    }));
                    
                    aplicarFotoNaInterface();
                };
                img.onerror = () => {
                    console.log("Foto não existe no Storage");
                    userData.photo = null;
                    aplicarFotoNaInterface();
                };
                img.src = urlData.publicUrl;
            }
        }
        
    } catch (error) {
        console.error("Erro ao carregar foto:", error);
        userData.photo = null;
    }
}

// --- SALVA FOTO (VERSÃO SIMPLES E FUNCIONAL) ---
async function salvarFotoPerfil(file) {
    console.log("=== SALVANDO FOTO ===");
    
    try {
        // 1. Salva localmente primeiro (feedback imediato)
        const fotoBase64 = await converterParaBase64(file);
        userData.photo = fotoBase64;
        
        localStorage.setItem("conectahub_user_data", JSON.stringify({
            cpf: userData.cpf,
            photo: fotoBase64,
            timestamp: Date.now()
        }));
        
        aplicarFotoNaInterface();
        console.log("✅ Foto salva localmente");
        
        // 2. Tenta upload para Supabase (em segundo plano)
        if (userData.cpf) {
            setTimeout(async () => {
                try {
                    await fazerUploadSupabase(file);
                } catch (uploadError) {
                    console.warn("Upload falhou, mantendo local:", uploadError);
                }
            }, 500);
        }
        
        return fotoBase64;
        
    } catch (error) {
        console.error("Erro ao salvar foto:", error);
        throw error;
    }
}

// --- FUNÇÃO AUXILIAR: Converter para Base64 ---
function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- FUNÇÃO AUXILIAR: Fazer upload para Supabase ---
async function fazerUploadSupabase(file) {
    const fileName = `perfil_${userData.cpf}.jpg`;
    console.log("Fazendo upload para:", fileName);
    
    // Tenta primeiro com a API normal
    const { data, error } = await supabase.storage
        .from('fotos-perfil')
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600'
        });
    
    if (error) {
        console.warn("Erro no upload normal:", error);
        
        // Tentativa alternativa: usar método direto
        await uploadDireto(file, fileName);
        return;
    }
    
    console.log("✅ Upload bem-sucedido via API");
    
    // Atualiza com URL do Supabase
    const { data: urlData } = supabase.storage
        .from('fotos-perfil')
        .getPublicUrl(fileName);
    
    if (urlData?.publicUrl) {
        userData.photo = urlData.publicUrl + '?t=' + Date.now();
        localStorage.setItem("conectahub_user_data", JSON.stringify({
            cpf: userData.cpf,
            photo: userData.photo,
            timestamp: Date.now()
        }));
        aplicarFotoNaInterface();
        console.log("✅ Atualizado para URL do Supabase");
    }
}

// --- MÉTODO DIRETO (fallback) ---
async function uploadDireto(file, fileName) {
    console.log("Tentando upload direto...");
    
    const SERVICE_KEY = 'SUA_SERVICE_ROLE_KEY_AQUI'; // ← IMPORTANTE!
    
    try {
        // Converte para base64
        const base64 = await converterParaBase64(file);
        const base64Data = base64.split(',')[1];
        
        // Faz upload via fetch
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/fotos-perfil/${fileName}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                    'Content-Type': 'application/octet-stream',
                    'x-upsert': 'true'
                },
                body: base64Data
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload direto falhou: ${response.status} - ${errorText}`);
        }
        
        console.log("✅ Upload direto bem-sucedido");
        return await response.json();
        
    } catch (error) {
        console.error("Upload direto também falhou:", error);
        throw error;
    }
}

// --- REMOVE FOTO ---
async function removerFotoPerfil() {
    try {
        console.log("Removendo foto...");
        
        if (!userData.cpf) return false;
        
        const fileName = `perfil_${userData.cpf}.jpg`;
        
        // Tenta remover do Storage
        try {
            const { error } = await supabase.storage
                .from('fotos-perfil')
                .remove([fileName]);
            
            if (error) {
                console.warn("Não foi possível remover do Storage:", error);
            } else {
                console.log("✅ Foto removida do Storage");
            }
        } catch (storageError) {
            console.warn("Erro ao remover do Storage:", storageError);
        }
        
        // Remove localmente
        userData.photo = null;
        localStorage.removeItem("conectahub_user_data");
        
        // Atualiza interface
        aplicarFotoNaInterface();
        
        return true;
        
    } catch (error) {
        console.error("Erro ao remover foto:", error);
        return false;
    }
}

// --- ATUALIZA INTERFACE ---
function atualizarInterface() {
    console.log("Atualizando interface...");
    
    // Nome
    const userNameEl = document.getElementById("user-name");
    const displayNameEl = document.getElementById("display-name");
    if (userNameEl) userNameEl.textContent = userData.name;
    if (displayNameEl) displayNameEl.textContent = userData.name;
    
    // Setor
    const deptEl = document.getElementById("display-department");
    if (deptEl) deptEl.textContent = userData.department;
    
    // CPF e Email
    const cpfEl = document.getElementById("display-cpf");
    const emailEl = document.getElementById("display-email");
    if (cpfEl) cpfEl.textContent = userData.cpf;
    if (emailEl) emailEl.textContent = userData.email;
    
    // Foto
    aplicarFotoNaInterface();
    
    console.log("Interface atualizada");
}

// --- APLICA FOTO NA INTERFACE ---
function aplicarFotoNaInterface() {
    const profileImg = document.getElementById("profile-img");
    const modalImg = document.getElementById("modal-profile-img");
    const defaultImg = "static/imagens/user_default.png";
    
    let fotoUrl = userData.photo || defaultImg;
    
    // Se for URL do Supabase, adiciona timestamp para evitar cache
    if (fotoUrl.includes('supabase.co')) {
        if (!fotoUrl.includes('?t=')) {
            fotoUrl = fotoUrl + '?t=' + Date.now();
        }
    }
    
    if (profileImg) {
        profileImg.src = fotoUrl;
        profileImg.onerror = function() {
            console.warn("Erro ao carregar foto, usando padrão");
            this.src = defaultImg;
        };
    }
    
    if (modalImg) {
        modalImg.src = fotoUrl;
        modalImg.onerror = function() {
            this.src = defaultImg;
        };
    }
    
    console.log("Foto aplicada:", userData.photo ? "Foto personalizada" : "Foto padrão");
}

// --- CONFIGURA LOGOUT ---
function configurarLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Deseja realmente sair?")) {
                localStorage.removeItem("user");
                window.location.href = "index.html";
            }
        });
    }
}

// --- EXPORTA FUNÇÕES ---
window.userData = userData;
window.salvarFotoPerfil = salvarFotoPerfil;
window.removerFotoPerfil = removerFotoPerfil;
window.aplicarFotoNaInterface = aplicarFotoNaInterface;
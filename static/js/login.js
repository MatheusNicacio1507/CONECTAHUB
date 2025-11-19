// =========================
// CONFIG SUPABASE
// =========================
const SUPABASE_URL = "https://flpygmhnpagppxitqkhw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// TOGGLE DE SENHA
// =========================
function setupToggle(toggleBtnId, inputId) {
    const btn = document.getElementById(toggleBtnId);
    const input = document.getElementById(inputId);

    if (!btn || !input) return;

    btn.addEventListener("click", () => {
        const type = input.type === "password" ? "text" : "password";
        input.type = type;

        const icon = btn.querySelector("i");

        if (type === "password") {
            icon.classList.remove("bx-show");
            icon.classList.add("bx-hide");
        } else {
            icon.classList.remove("bx-hide");
            icon.classList.add("bx-show");
        }
    });
}

setupToggle("togglePassword", "password");

// =========================
// LOGIN CORRIGIDO
// =========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    // Apenas busca o usuário pelo email
    const { data: user, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        console.error("Erro Supabase:", error);
        alert("Erro ao fazer login.");
        return;
    }

    if (!user) {
        alert("Usuário não encontrado.");
        return;
    }

    // Agora check de senha manual
    if (user.senha !== senha) {
        alert("Senha incorreta.");
        return;
    }

    alert("Login realizado com sucesso!");
    window.location.href = "perfil.html";
});

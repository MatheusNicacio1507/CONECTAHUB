// Inicializa o Supabase
const SUPABASE_URL = "https://flpygmhnpagppxitqkhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("cadastroForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Pega os valores do formulário
        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("password").value;
        const confirmarSenha = document.getElementById("confirmPassword").value;
        const setor = document.getElementById("setor").value;

        // Valida senhas
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        if (!setor) {
            alert("Selecione o setor!");
            return;
        }

        // Envia para o Supabase
        const { data, error } = await supabase
            .from("usuarios")
            .insert([
                {
                    nome: nome,
                    cpf: cpf,
                    email: email,
                    senha: senha,
                    setor: setor
                }
            ]);

        if (error) {
            console.error("ERRO SUPABASE:", error);
            alert("Erro ao cadastrar: " + error.message);
            return;
        }

        alert("Conta criada com sucesso!");
        window.location.href = "index.html";
    });
});

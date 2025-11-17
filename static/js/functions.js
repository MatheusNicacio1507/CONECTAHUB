// -------------------------------------------------------
//  FUNÇÕES DE INTERFACE E VALIDAÇÃO — FRONT-END PURO
//  (SEM LÓGICA DE LOGIN/CADASTRO — SUPABASE VAI CUIDAR)
// -------------------------------------------------------
// =====================
// CONFIGURAÇÃO SUPABASE
// =====================

const SUPABASE_URL = "https://flpygmhnpagppxitqkhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscHlnbWhucGFncHB4aXRxa2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUzNDIsImV4cCI6MjA3ODk5MTM0Mn0.m1vuSLoc6OX15AExTmbPSlGRWxTMfWXywbreQXYODpA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

    // --------------------------
    // TOGGLE DE VISIBILIDADE DA SENHA
    // --------------------------
    document.querySelectorAll(".toggle-password").forEach(button => {
        const input = button.previousElementSibling; // input logo antes
        const icon = button.querySelector("i");

        button.addEventListener("click", () => {
            const tipo = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", tipo);

            // alternar ícone
            icon.classList.toggle("bx-hide");
            icon.classList.toggle("bx-show");
        });
    });

    // --------------------------
    // BLOQUEAR CARACTERES — letras, números, especiais
    // --------------------------

    function bloquearNumeros(id) {
        const campo = document.getElementById(id);
        if (!campo) return;

        campo.addEventListener("input", () => {
            campo.value = campo.value.replace(/[0-9]/g, "");
        });
    }

    function bloquearLetras(id) {
        const campo = document.getElementById(id);
        if (!campo) return;

        campo.addEventListener("input", () => {
            campo.value = campo.value.replace(/[^0-9]/g, "");
        });
    }

    function bloquearTudoMenosLetras(id) {
        const campo = document.getElementById(id);
        if (!campo) return;

        campo.addEventListener("input", () => {
            campo.value = campo.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        });
    }

    // Ativa os bloqueios necessários
    bloquearTudoMenosLetras("nome");
    bloquearLetras("cpf");

    // --------------------------
    // FUNÇÕES DE CPF
    // --------------------------

    // Validação matemática do CPF
    function validarCPF(cpf) {
        if (!cpf) return false;
        const s = cpf.replace(/\D/g, "");
        if (s.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(s)) return false;

        const calcDig = (base, fator) => {
            let total = 0;
            for (let i = 0; i < base.length; i++) {
                total += Number(base[i]) * (fator - i);
            }
            const resto = total % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const base = s.slice(0, 9);
        const d1 = calcDig(base, 10);
        const d2 = calcDig(base + d1, 11);

        return s === base + d1 + String(d2);
    }

    // Adiciona máscara automática no CPF
    function aplicarMascaraCPF(input) {
        input.addEventListener("input", () => {
            let valor = input.value.replace(/\D/g, "");
            if (valor.length > 11) valor = valor.slice(0, 11);

            input.value = valor
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
        });

        // valida ao sair do campo
        input.addEventListener("blur", () => {
            input.setCustomValidity(
                validarCPF(input.value) ? "" : "CPF inválido"
            );
        });
    }

    // Inicializa CPF se existir
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) aplicarMascaraCPF(cpfInput);

});

// ===============================
// CADASTRO → ENVIAR AO SUPABASE
// ===============================

const cadastroForm = document.querySelector("form");

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value.replace(/\D/g, "");
        const email = document.getElementById("email").value;
        const senha = document.getElementById("password").value;
        const confirmar = document.getElementById("confirmPassword").value;
        const setor = document.getElementById("setor").value;

        if (senha !== confirmar) {
            alert("As senhas não coincidem!");
            return;
        }

        // Enviar para supabase
        const { data, error } = await supabase
            .from("usuarios")
            .insert([
                { nome, cpf, email, senha, setor }
            ]);

        if (error) {
            console.error(error);
            alert("Erro ao cadastrar usuário.");
            return;
        }

        alert("Conta criada com sucesso!");
        window.location.href = "perfil.html";
    });
}

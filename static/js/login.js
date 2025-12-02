console.log("LOGIN.JS CARREGOU!");

document.addEventListener("DOMContentLoaded", () => {

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput  = document.getElementById("password");

    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";

            const icon = togglePassword.querySelector("i");
            icon.classList.toggle("bx-hide", !isPassword);
            icon.classList.toggle("bx-show", isPassword);
        });
    }

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("ERRO: Não encontrou o formulário de login (#loginForm).");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();

        if (!email || !senha) {
            alert("Preencha email e senha!");
            return;
        }

        const { data, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .eq("senha", senha)
            .maybeSingle();

        console.log("Retorno Supabase:", data, error);

        if (error) {
            alert("Erro ao conectar ao servidor!");
            return;
        }

        if (!data) {
            alert("E-mail ou senha incorretos.");
            return;
        }

        // 🔥 DEFINA AQUI O CPF DO ADMINISTRADOR
        // TROQUE '00000000000' PELO CPF REAL DO SEU ADMIN
        const CPF_ADMIN = '0000000000';
        
        // Verificar se é administrador (compara CPF)
        const isAdmin = data.cpf && data.cpf.toString() === CPF_ADMIN;
        
        console.log(`👤 Usuário: ${data.nome}`);
        console.log(`📋 CPF: ${data.cpf}`);
        console.log(`👑 É administrador? ${isAdmin ? 'SIM' : 'NÃO'}`);

        // 🔥 SALVAR DADOS DO USUÁRIO (ADICIONA FLAG DE ADMIN)
        localStorage.setItem("user", JSON.stringify({
            id: data.id,
            nome: data.nome,
            setor: data.setor,
            email: data.email,
            cpf: data.cpf,
            isAdmin: isAdmin  // ← FLAG NOVA: true se for admin
        }));

        // 🔥 REDIRECIONAMENTO INTELIGENTE
        if (isAdmin) {
            console.log("🚀 Redirecionando ADMIN para painel...");
            window.location.href = "admin.html";
        } else {
            console.log("💬 Redirecionando USUÁRIO para perfil...");
            window.location.href = "perfil.html";
        }
    });
});
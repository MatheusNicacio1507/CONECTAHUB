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

        // 🔥 AGORA SALVA EMAIL + CPF JUNTO COM OS OUTROS
        localStorage.setItem("user", JSON.stringify({
            id: data.id,
            nome: data.nome,
            setor: data.setor,
            email: data.email,  // <---
            cpf: data.cpf       // <---
        }));

        window.location.href = "perfil.html";
    });
});

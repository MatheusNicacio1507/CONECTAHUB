console.log("Cadastro.js carregado!");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("password").value;
        const setor = document.getElementById("setor").value;

        console.log("Supabase:", supabase);

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
            console.error(error);
            alert("Erro ao cadastrar: " + error.message);
            return;
        }

        alert("Cadastro realizado com sucesso!");
        window.location.href = "perfil.html"; // futura página
    });
});

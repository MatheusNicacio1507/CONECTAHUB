import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("password").value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            alert("E-mail ou senha incorretos.");
            return;
        }

        // Login OK
        window.location.href = "perfil.html";
    });

});

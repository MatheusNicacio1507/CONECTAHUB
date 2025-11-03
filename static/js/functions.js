document.addEventListener('DOMContentLoaded', function () {
    // Configuração para o campo de senha
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Configuração para o campo de confirmação de senha
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const loginForm = document.querySelector('form');

    // Função para alternar a visibilidade da senha
    function setupPasswordToggle(toggleButton, inputField) {
        toggleButton.addEventListener('click', function () {
            const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
            inputField.setAttribute('type', type);

            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('bx-show');
                icon.classList.add('bx-hide');
                this.setAttribute('aria-label', 'Mostrar senha');
            } else {
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
                this.setAttribute('aria-label', 'Ocultar senha');
            }
        });
    }

    // Configurar os dois campos de senha
    setupPasswordToggle(togglePassword, passwordInput);
    setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

    // Validação do formulário
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        const password = passwordInput.value;
        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Verificar se as senhas coincidem
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            alert('As senhas não coincidem. Por favor, verifique.');
            return;
        }

        const loginBtn = document.querySelector('.login');
        loginBtn.textContent = 'Criando conta...';
        loginBtn.disabled = true;

        setTimeout(() => {
            alert('Conta criada com sucesso!');
            loginForm.submit(); // Isso enviará o formulário para o servidor
        }, 1500);
    });
});

function selecionarUnico(checkbox) {
    const checkboxes = document.getElementsByName('casa');
    checkboxes.forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
}

function bloquearNumeros(inputId) {
    const campo = document.getElementById(inputId);

    campo.addEventListener("keypress", function (event) {
        if (/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    });

    campo.addEventListener("input", function () {
        this.value = this.value.replace(/[0-9]/g, "");
    });
}

function bloquearNumerosEspeciais(inputId) {
    const campo = document.getElementById(inputId);

    campo.addEventListener("keypress", function (event) {
        if (!/^[a-zA-ZÀ-ÿ\s]$/.test(event.key)) {
            event.preventDefault();
        }
    });

    campo.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    });
}

function bloquearLetras(inputId) {
    const campo = document.getElementById(inputId);

    campo.addEventListener("keypress", function (event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    });

    campo.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });
}

bloquearNumerosEspeciais("nome");
bloquearNumeros("nome");

// ---------------------------
// Valida CPF (string com ou sem pontuação)
function validarCPF(cpf) {
  if (!cpf) return false;
  const s = String(cpf).replace(/\D/g, ''); // remove tudo que não é dígito
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false; // elimina sequências iguais

  const calcDig = (base, fator) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) total += Number(base[i]) * (fator - i);
    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base9 = s.slice(0, 9);
  const d1 = calcDig(base9, 10);
  const d2 = calcDig(base9 + d1, 11);

  return s === base9 + String(d1) + String(d2);
}

// ---------------------------
// Aplica máscara de CPF enquanto digita
function aplicarMascaraCPF(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, ''); // remove tudo que não é número
    if (valor.length > 11) valor = valor.slice(0, 11);

    input.value = valor
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
  });

  // Validação ao sair do campo
  input.addEventListener("blur", () => {
    const isValid = validarCPF(input.value);
    input.setCustomValidity(isValid ? "" : "CPF inválido");
  });
}

// ---------------------------
// Bloqueia letras no input
function bloquearLetras(input) {
  input.addEventListener("keypress", (e) => {
    if (!/\d/.test(e.key)) e.preventDefault();
  });
}

// ---------------------------
// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const cpfInput = document.getElementById("cpf");
  if (!cpfInput) return;

  aplicarMascaraCPF(cpfInput);
  bloquearLetras(cpfInput);
});

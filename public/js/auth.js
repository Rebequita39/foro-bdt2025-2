// Funciones para cambiar entre formularios
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    clearMessages();
    return false;
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    clearMessages();
    return false;
}

function clearMessages() {
    document.getElementById('loginMessage').className = 'message';
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').className = 'message';
    document.getElementById('registerMessage').style.display = 'none';
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

// Validación en tiempo real con keyup
document.addEventListener('DOMContentLoaded', () => {
    // Validar username en tiempo real
    const usernameInput = document.getElementById('regUsername');
    if (usernameInput) {
        usernameInput.addEventListener('keyup', (e) => {
            const value = e.target.value;
            const small = e.target.nextElementSibling;
            
            if (value.length < 3) {
                small.style.color = 'red';
                small.textContent = 'Muy corto (min 3 chars)';
            } else if (value.length > 20) {
                small.style.color = 'red';
                small.textContent = 'Muy largo (max 20 chars)';
            } else {
                small.style.color = 'green';
                small.textContent = 'Usuario disponible';
            }
        });
    }

    // Validar password en tiempo real
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keyup', (e) => {
            const value = e.target.value;
            const small = e.target.nextElementSibling;
            
            if (value.length < 6) {
                small.style.color = 'red';
                small.textContent = `Contraseña demasiado corta! (${value.length}/6 chars)`;
            } else {
                small.style.color = 'green';
                small.textContent = 'Contraseña fuerte';
            }
        });
    }

    // Validar confirmación de password
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keyup', (e) => {
            const password = document.getElementById('regPassword').value;
            const confirm = e.target.value;
            
            if (confirm && password !== confirm) {
                e.target.style.borderColor = 'red';
            } else if (confirm && password === confirm) {
                e.target.style.borderColor = 'green';
            } else {
                e.target.style.borderColor = '';
            }
        });
    }
});

// Manejo del formulario de login
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        emailOrUsername: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            showMessage('loginMessage', 'Inicio de sesión exitoso', 'success');
            
            // Redirigir a la página principal después de 1 segundo
            setTimeout(() => {
                window.location.href = '/boards.html';
            }, 1000);
        } else {
            showMessage('loginMessage', data.error || 'Inicio de sesión fallido', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('loginMessage', 'Error de conexión, intenta de nuevo!', 'error');
    }
});

// Manejo del formulario de registro
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value
    };

    // Validación del lado del cliente
    if (formData.password !== formData.confirmPassword) {
        showMessage('registerMessage', 'Contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            showMessage('registerMessage', 'Registro exitoso', 'success');
            
            // Redirigir a la página principal después de 1 segundo
            setTimeout(() => {
                window.location.href = '/boards.html';
            }, 1000);
        } else {
            showMessage('registerMessage', data.error || 'Registro fallido', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('registerMessage', 'Error de conexión, intenta de nuevo!', 'error');
    }
});

// Verificar si ya está logueado
if (localStorage.getItem('token')) {
    // Si ya tiene token, redirigir a boards
    // (Comentado para permitir testing)
    // window.location.href = '/boards.html';
}
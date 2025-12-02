const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', loadCurrentProfile);

async function loadCurrentProfile() {
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Pre-llenar formulario con datos actuales (sin mostrar)
      // Los campos quedan vacíos pero el usuario puede ver sus datos actuales en /profile.html
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Editar perfil
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const avatar = document.getElementById('avatar').value.trim();
  const bio = document.getElementById('bio').value.trim();

  // Solo enviar campos que no estén vacíos
  const formData = {};
  if (username) formData.username = username;
  if (email) formData.email = email;
  if (avatar) formData.avatar = avatar;
  if (bio) formData.bio = bio;

  if (Object.keys(formData).length === 0) {
    showMessage('profile', 'Debes completar al menos un campo', 'error');
    return;
  }

  console.log('Enviando datos:', formData); // Debug

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data); // Debug

    if (response.ok) {
      // Actualizar localStorage con nuevos datos si cambió username
      if (formData.username) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.username = formData.username;
        localStorage.setItem('user', JSON.stringify(user));
      }

      showMessage('profile', '✓ Perfil actualizado!', 'success');
      
      setTimeout(() => {
        window.location.href = '/profile.html';
      }, 1500);
    } else {
      showMessage('profile', data.error || 'Error al actualizar', 'error');
    }
  } catch (error) {
    console.error('Error completo:', error);
    showMessage('profile', 'Error de conexión: ' + error.message, 'error');
  }
});

// Cambiar contraseña
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmNewPassword) {
    showMessage('password', 'Las contraseñas nuevas no coinciden', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('password', '✓ Contraseña actualizada!', 'success');
      document.getElementById('changePasswordForm').reset();
    } else {
      showMessage('password', data.error || 'Error al cambiar contraseña', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('password', 'Error de conexión', 'error');
  }
});

function showMessage(formType, message, type) {
  const messageEl = document.getElementById(`${formType}Message`);
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }
}
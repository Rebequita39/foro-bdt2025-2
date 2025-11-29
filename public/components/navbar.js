// Navbar Component - Dinámico según autenticación
function createNavbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const navbarHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
          <a href="/boards.html" class="nav-logo">Foro Galgo Diva</a>
          <a href="/boards.html" class="nav-link">Hilos</a>
          ${user ? '<a href="/create-post.html" class="nav-link">Nueva Publicación</a>' : ''}
        </div>
        <div class="nav-right">
          ${user ? `
            <span class="nav-user"> ${user.username}</span>
            <a href="/profile.html" class="nav-link">Perfil</a>
            <button onclick="logout()" class="nav-link nav-btn">Cerrar Sesión</button>
          ` : `
            <a href="/index.html" class="nav-link">Iniciar Sesión</a>
          `}
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Auto-ejecutar al cargar
document.addEventListener('DOMContentLoaded', createNavbar);
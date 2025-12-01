let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
  loadAllUsers();
  setupSearch();
});

// Setup de búsqueda con keyup
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.trim();
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    if (searchTerm.length === 0) {
      // Si está vacío, limpiar resultados
      document.getElementById('searchResults').innerHTML = '';
      return;
    }
    
    if (searchTerm.length < 2) {
      // Mostrar mensaje si es muy corto
      document.getElementById('searchResults').innerHTML = 
        '<p style="color: #999; text-align: center; margin-top: 15px;">Escribe al menos 2 caracteres...</p>';
      return;
    }
    
    // Esperar 500ms después del último keypress antes de buscar
    searchTimeout = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);
  });
}

// Buscar usuarios
async function searchUsers(searchTerm) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '<p style="text-align: center; color: #ff69b4;">Buscando...</p>';
  
  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    if (data.users.length === 0) {
      searchResults.innerHTML = `
        <p style="text-align: center; color: #999; margin-top: 15px;">
          No se encontraron usuarios con "${searchTerm}"
        </p>
      `;
      return;
    }

    searchResults.innerHTML = `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
        <strong style="color: #3a00a4;">Resultados de búsqueda (${data.count}):</strong>
        ${data.users.map(user => createUserCard(user)).join('')}
      </div>
    `;

  } catch (error) {
    console.error('Error searching users:', error);
    searchResults.innerHTML = `
      <p style="color: #ff6b6b; text-align: center; margin-top: 15px;">
        Error al buscar usuarios
      </p>
    `;
  }
}

// Cargar todos los usuarios
async function loadAllUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();

    const usersList = document.getElementById('usersList');

    if (!data.users || data.users.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <p>No hay usuarios registrados aún</p>
        </div>
      `;
      return;
    }

    usersList.innerHTML = data.users.map(user => createUserCard(user)).join('');

  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersList').innerHTML = `
      <div class="empty-state">
        <p>Error al cargar usuarios</p>
      </div>
    `;
  }
}

// Cargar top usuarios
async function loadTopUsers() {
  try {
    const response = await fetch('/api/users/top');
    const data = await response.json();

    const topUsersList = document.getElementById('topUsersList');

    if (!data.users || data.users.length === 0) {
      topUsersList.innerHTML = `
        <div class="empty-state">
          <p>No hay datos disponibles</p>
        </div>
      `;
      return;
    }

    topUsersList.innerHTML = data.users.map((user, index) => `
      <div class="board-card">
        <div class="board-header">
          <span>${index + 1}. @${user.username}</span>
          <span>${user.post_count || 0} publicaciones</span>
        </div>
        <div class="board-content">
          <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${user.avatar || 'https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'}" 
                 alt="Avatar" 
                 style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #ae9797;"
                 onerror="this.src='https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'">
            <div style="flex: 1;">
              <div><strong>${user.username}</strong> <span style="color: #999; font-size: 12px;">(${user.role})</span></div>
              ${user.last_post_date ? `<small style="color: #999;">Última publicación: ${new Date(user.last_post_date).toLocaleDateString()}</small>` : ''}
            </div>
          </div>
          <a href="user-profile.html?user_id=${user.id}" class="board-link">→ Ver Perfil</a>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading top users:', error);
    document.getElementById('topUsersList').innerHTML = `
      <div class="empty-state">
        <p>Error al cargar usuarios destacados</p>
      </div>
    `;
  }
}

// Crear card de usuario
function createUserCard(user) {
  return `
    <div class="board-card" style="margin-bottom: 15px;">
      <div class="board-content">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${user.avatar || 'https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'}" 
               alt="Avatar" 
               style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #ae9797;"
               onerror="this.src='https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'">
          <div style="flex: 1;">
            <div><strong>@${user.username}</strong> <span style="color: #999; font-size: 12px;">(${user.role})</span></div>
            ${user.bio ? `<small style="color: #666;">${user.bio.substring(0, 100)}${user.bio.length > 100 ? '...' : ''}</small>` : ''}
          </div>
        </div>
        <a href="user-profile.html?user_id=${user.id}" class="board-link" style="margin-top: 10px; display: inline-block;">→ Ver Perfil</a>
      </div>
    </div>
  `;
}

// Cambiar entre tabs
function showTab(tab) {
  const allSection = document.getElementById('allUsersSection');
  const topSection = document.getElementById('topUsersSection');
  const tabAll = document.getElementById('tabAll');
  const tabTop = document.getElementById('tabTop');

  if (tab === 'all') {
    allSection.style.display = 'block';
    topSection.style.display = 'none';
    tabAll.style.background = '';
    tabTop.style.background = '#d69aad';
    loadAllUsers();
  } else {
    allSection.style.display = 'none';
    topSection.style.display = 'block';
    tabAll.style.background = '#d69aad';
    tabTop.style.background = '';
    loadTopUsers();
  }
}
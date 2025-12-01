const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');

document.addEventListener('DOMContentLoaded', () => {
  if (!userId) {
    window.location.href = '/users.html';
    return;
  }
  loadUserProfile();
  loadUserPosts();
});

async function loadUserProfile() {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    displayProfile(data.user, data.stats);

  } catch (error) {
    console.error('Error loading profile:', error);
    document.getElementById('profileContent').innerHTML = `
      <div class="empty-state">
        <p>Error al cargar el perfil</p>
        <p>${error.message}</p>
        <a href="/users.html" class="board-link">← Volver a Usuarios</a>
      </div>
    `;
  }
}

function displayProfile(user, stats) {
  const profileContent = document.getElementById('profileContent');

  profileContent.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <img src="${user.avatar || 'https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'}" 
             alt="Avatar" 
             class="profile-avatar"
             onerror="this.src='https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif'">
        <h2>@${user.username}</h2>
        <span style="color: #fff; font-size: 12px;">${user.role.toUpperCase()}</span>
      </div>
      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-label">Bio:</div>
          <div class="profile-value">${user.bio || 'Sin bio'}</div>

          <div class="profile-label">Miembro desde:</div>
          <div class="profile-value">${new Date(user.created_at).toLocaleDateString('es-ES')}</div>
        </div>

        <div class="profile-info">
          <div class="profile-label">Estadísticas:</div>
          <div class="profile-value">
            <strong>${stats?.total_posts || 0}</strong> publicaciones • 
            <strong>${stats?.total_comments || 0}</strong> comentarios • 
            <strong>${stats?.boards_participated || 0}</strong> hilos participados
          </div>
        </div>

        <button onclick="window.location.href='/users.html'" class="btn-primary">← Volver a Usuarios</button>
      </div>
    </div>
  `;

  document.getElementById('userPostsSection').style.display = 'block';
}

async function loadUserPosts() {
  try {
    const response = await fetch(`/api/posts/user/${userId}`);
    const data = await response.json();

    const userPostsDiv = document.getElementById('userPosts');

    if (!data.posts || data.posts.length === 0) {
      userPostsDiv.innerHTML = '<p style="text-align: center; color: #999;">No hay publicaciones aún</p>';
      return;
    }

    userPostsDiv.innerHTML = data.posts.map(post => `
      <div style="border-bottom: 1px solid #ddd; padding: 15px 0;">
        <strong>${post.title}</strong><br>
        <small style="color: #999;">
          en ${post.board_name} • 
          ${new Date(post.created_at).toLocaleDateString('es-ES')} • 
          👁 ${post.views} vistas • 
          💬 ${post.comment_count || 0} comentarios
        </small><br>
        <a href="post-detail.html?post_id=${post.id}" class="board-link">→ Ver</a>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading user posts:', error);
    document.getElementById('userPosts').innerHTML = '<p style="color: #999;">Error al cargar publicaciones</p>';
  }
}
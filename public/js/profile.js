// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadUserPosts();
});

async function loadProfile() {
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Actualizar perfil
    document.getElementById('profileUsername').textContent = data.user.username;
    document.getElementById('profileEmail').textContent = data.user.email;
    document.getElementById('profileBio').textContent = data.user.bio || 'No bio yet';
    document.getElementById('profileRole').textContent = data.user.role.toUpperCase();
    document.getElementById('profileCreated').textContent = new Date(data.user.created_at).toLocaleDateString();

    if (data.user.avatar) {
      document.getElementById('profileAvatar').src = data.user.avatar;
    }

    // Actualizar stats
    if (data.stats) {
      document.getElementById('totalPosts').textContent = data.stats.total_posts || 0;
      document.getElementById('totalComments').textContent = data.stats.total_comments || 0;
      document.getElementById('boardsParticipated').textContent = data.stats.boards_participated || 0;
    }

  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Error loading profile. Please login again.');
    localStorage.clear();
    window.location.href = '/index.html';
  }
}

async function loadUserPosts() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`/api/posts/user/${user.id}`);
    const data = await response.json();

    const userPostsDiv = document.getElementById('userPosts');

    if (!data.posts || data.posts.length === 0) {
      userPostsDiv.innerHTML = '<p style="text-align: center; color: #999;">No posts yet</p>';
      return;
    }

    userPostsDiv.innerHTML = data.posts.map(post => `
      <div style="border-bottom: 1px solid #ddd; padding: 15px 0;">
        <strong>${post.title}</strong><br>
        <small style="color: #999;">
          in ${post.board_name} • 
          ${new Date(post.created_at).toLocaleDateString()} • 
          👁 ${post.views} views
        </small><br>
        <a href="post-detail.html?post_id=${post.id}" class="board-link">→ View</a>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading user posts:', error);
    document.getElementById('userPosts').innerHTML = '<p style="color: #999;">Error loading posts</p>';
  }
}
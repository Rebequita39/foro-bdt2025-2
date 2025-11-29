const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('post_id');
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !postId) {
  window.location.href = '/index.html';
}

let currentPost = null;

document.addEventListener('DOMContentLoaded', loadPost);

async function loadPost() {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    currentPost = data.post;

    // Verificar permisos
    const isOwner = user.id === data.post.user_id;
    const isAdminOrMod = ['admin', 'moderator'].includes(user.role);

    if (!isOwner && !isAdminOrMod) {
      alert('No tienes permisos para editar esta publicación');
      window.history.back();
      return;
    }

    // Llenar formulario
    document.getElementById('title').value = data.post.title;
    document.getElementById('content').value = data.post.content;
    document.getElementById('image_url').value = data.post.image || '';

    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('editPostForm').style.display = 'block';

  } catch (error) {
    console.error('Error loading post:', error);
    document.getElementById('loadingMessage').innerHTML = `
      <p style="color: #ff6b6b;">Error al cargar la publicación</p>
      <button onclick="window.history.back()" class="btn-primary">← Volver</button>
    `;
  }
}

document.getElementById('editPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
    image_url: document.getElementById('image_url').value || null
  };

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('✓ Publicación actualizada!', 'success');
      
      setTimeout(() => {
        window.location.href = `post-detail.html?post_id=${postId}`;
      }, 1500);
    } else {
      showMessage(data.error || 'Error al actualizar', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error de conexión', 'error');
  }
});

function showMessage(message, type) {
  const messageEl = document.getElementById('editMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
}
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('post_id');
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

let currentPost = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!postId) {
    window.location.href = '/boards.html';
    return;
  }
  loadPost();
});

async function loadPost() {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    currentPost = data.post;
    displayPost(data.post);
    displayComments(data.comments || []);

    // Mostrar formulario de comentario si está logueado
    if (user) {
      document.getElementById('newCommentForm').style.display = 'block';
    }

    // Mostrar botones de acción si es dueño o admin/mod
    const isOwner = user && user.id === data.post.user_id;
    const isAdminOrMod = user && ['admin', 'moderator'].includes(user.role);
    if (isOwner || isAdminOrMod) {
      document.getElementById('postActions').style.display = 'block';
    }

  } catch (error) {
    console.error('Error loading post:', error);
    document.getElementById('postDetail').innerHTML = `
      <div class="empty-state">
        <p>Error al cargar la publicación :(</p>
        <p>${error.message}</p>
        <a href="/boards.html" class="board-link">← Volver a Hilos</a>
      </div>
    `;
  }
}

function displayPost(post) {
  const postDetailDiv = document.getElementById('postDetail');
  
  postDetailDiv.innerHTML = `
    <div class="post-card">
      <div class="post-header">
        ${post.title}
      </div>
      <div class="post-content">
        <div class="post-meta" style="margin-bottom: 15px;">
          <span class="post-author">@${post.username}</span> • 
          en <a href="posts.html?board_id=${post.board_id}" class="board-link">${post.board_name}</a> • 
          ${new Date(post.created_at).toLocaleString('es-ES')}
          ${post.updated_at !== post.created_at ? ' (editado)' : ''}
        </div>
        
        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onerror="this.style.display='none'">` : ''}
        
        <div style="white-space: pre-wrap; margin: 20px 0;">${post.content}</div>
        
        <div class="post-meta" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
          👁 ${post.views} vistas
        </div>
      </div>
    </div>
  `;

  document.getElementById('commentsSection').style.display = 'block';
}

function displayComments(comments) {
  const commentsListDiv = document.getElementById('commentsList');

  if (comments.length === 0) {
    commentsListDiv.innerHTML = '<p style="text-align: center; color: #999;">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
    return;
  }

  commentsListDiv.innerHTML = comments.map(comment => `
    <div style="border-bottom: 1px solid #ddd; padding: 15px 0;">
      <div style="margin-bottom: 8px;">
        <span class="post-author">@${comment.username}</span>
        <small style="color: #999; margin-left: 10px;">
          ${new Date(comment.created_at).toLocaleString('es-ES')}
        </small>
      </div>
      <div style="color: #333;">${comment.content}</div>
    </div>
  `).join('');
}

// Manejar creación de comentario
document.getElementById('createCommentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!token) {
    alert('Debes iniciar sesión para comentar');
    return;
  }

  const content = document.getElementById('commentContent').value;

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('✓ Comentario agregado!', 'success');
      document.getElementById('commentContent').value = '';
      
      // Recargar comentarios
      setTimeout(() => {
        loadPost();
      }, 1000);
    } else {
      showMessage(data.error || 'Error al crear comentario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error de conexión', 'error');
  }
});

function showMessage(message, type) {
  const messageEl = document.getElementById('commentMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

function editPost() {
  window.location.href = `edit-post.html?post_id=${postId}`;
}

async function deletePost() {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert('✓ Publicación eliminada');
      window.location.href = `/posts.html?board_id=${currentPost.board_id}`;
    } else {
      alert(data.error || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}
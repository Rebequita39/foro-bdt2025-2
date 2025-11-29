// Obtener board_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('board_id');

document.addEventListener('DOMContentLoaded', () => {
  if (!boardId) {
    window.location.href = '/boards.html';
    return;
  }
  loadPosts();
});

async function loadPosts() {
  try {
    const response = await fetch(`/api/boards/${boardId}/posts`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Actualizar título y descripción del board
    document.getElementById('boardTitle').textContent = `★ ${data.board.name} ★`;
    document.getElementById('boardDescription').textContent = data.board.description;

    const postsList = document.getElementById('postsList');

    if (!data.posts || data.posts.length === 0) {
      postsList.innerHTML = `
        <div class="empty-state">
          <p>No posts in this board yet!</p>
          <p>Be the first to post! ♡</p>
          <a href="/create-post.html?board_id=${boardId}" class="board-link">Create Post</a>
        </div>
      `;
      return;
    }

    postsList.innerHTML = data.posts.map(post => `
      <div class="post-card">
        <div class="post-header">
          <a href="post-detail.html?post_id=${post.id}" style="color: inherit; text-decoration: none;">
            ${post.title}
          </a>
        </div>
        <div class="post-content">
          <p>${truncateText(post.content, 200)}</p>
          ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onerror="this.style.display='none'">` : ''}
          <div class="post-meta">
            <span class="post-author">@${post.username}</span> • 
            ${new Date(post.created_at).toLocaleDateString()} • 
            👁 ${post.views} views • 
            💬 ${post.comment_count || 0} comments
          </div>
          <a href="post-detail.html?post_id=${post.id}" class="board-link">→ Read More</a>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('postsList').innerHTML = `
      <div class="empty-state">
        <p>Error loading posts :(</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
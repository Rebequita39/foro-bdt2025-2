// Cargar boards al iniciar
document.addEventListener('DOMContentLoaded', loadBoards);

async function loadBoards() {
  try {
    const response = await fetch('/api/boards');
    const data = await response.json();

    const boardsList = document.getElementById('boardsList');

    if (!data.boards || data.boards.length === 0) {
      boardsList.innerHTML = `
        <div class="empty-state">
          <p>No boards available yet!</p>
          <p>Check back later ♡</p>
        </div>
      `;
      return;
    }

    boardsList.innerHTML = data.boards.map(board => `
      <div class="board-card">
        <div class="board-header">
          <span>${board.name}</span>
          <span>${board.post_count || 0} posts</span>
        </div>
        <div class="board-content">
          <p class="board-description">${board.description}</p>
          <div class="board-stats">
            Created by ${board.creator_username || 'Admin'} • 
            ${board.last_post_date ? 'Last post: ' + new Date(board.last_post_date).toLocaleDateString() : 'No posts yet'}
          </div>
          <a href="posts.html?board_id=${board.id}" class="board-link">→ View Posts</a>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading boards:', error);
    document.getElementById('boardsList').innerHTML = `
      <div class="empty-state">
        <p>Error loading boards :(</p>
        <p>Please try again later</p>
      </div>
    `;
  }
}
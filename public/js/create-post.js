// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

// Cargar boards al iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadBoards();
  
  // Pre-seleccionar board si viene de URL
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('board_id');
  if (boardId) {
    setTimeout(() => {
      document.getElementById('board').value = boardId;
    }, 500);
  }
});

async function loadBoards() {
  try {
    const response = await fetch('/api/boards');
    const data = await response.json();

    const boardSelect = document.getElementById('board');
    
    if (data.boards && data.boards.length > 0) {
      data.boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        boardSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading boards:', error);
  }
}

// Manejo del formulario
document.getElementById('createPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
    board_id: parseInt(document.getElementById('board').value),
    image_url: document.getElementById('image_url').value || null
  };

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('✓ Post created successfully!', 'success');
      
      setTimeout(() => {
        window.location.href = `posts.html?board_id=${formData.board_id}`;
      }, 1500);
    } else {
      showMessage(data.error || 'Failed to create post', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Connection error. Please try again.', 'error');
  }
});

function showMessage(message, type) {
  const messageEl = document.getElementById('createMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
}
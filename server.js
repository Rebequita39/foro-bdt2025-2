require('dotenv').config();
const express = require('express');
const path = require('path');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Probar conexión a la base de datos
testConnection();

// Rutas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Importar rutas (cuando las crees)
// const authRoutes = require('./routes/authRoutes');
// cst userRoutes = require('./routes/userRoutes');
// const boardRoutes = require('./routes/boardRoutes');
// const postRoutes = require('./routes/postRoutes');

// Usar rutas
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/boards', boardRoutes);
// app.use('/api/posts', postRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos en: ${path.join(__dirname, 'public')}`);
});
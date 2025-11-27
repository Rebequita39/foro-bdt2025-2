const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug: Mostrar configuración (REMOVER EN PRODUCCIÓN)
console.log('📋 Configuración de DB:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'NO DEFINIDA',
  database: process.env.DB_NAME,
  port: 3306
});

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    console.log('🔌 Intentando conectar a MySQL...');
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    
    // Probar una query simple
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log('📊 Base de datos actual:', rows[0].db);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('   SQL State:', error.sqlState);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 MySQL rechazó la conexión. Verifica:');
      console.error('      - Que MySQL esté corriendo: sudo systemctl status mysql');
      console.error('      - Que DB_HOST sea 127.0.0.1 (no localhost)');
      console.error('      - Que el puerto 3306 esté abierto');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 Acceso denegado. Verifica:');
      console.error('      - Usuario y contraseña en .env');
      console.error('      - Permisos del usuario en MySQL');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   💡 Base de datos no existe. Crea la BD:');
      console.error('      - mysql -u root -p');
      console.error('      - CREATE DATABASE forum;');
    }
    
    return false;
  }
};

// Función para ejecutar queries con manejo de errores
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Función para transacciones
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
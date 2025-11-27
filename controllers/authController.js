const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

// Registro de nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos.' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido.' 
      });
    }

    // Validar longitud de username
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        error: 'El username debe tener entre 3 y 20 caracteres.' 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres.' 
      });
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden.' 
      });
    }

    // Verificar si el usuario o email ya existen
    const existingUser = await User.checkExists(username, email);
    if (existingUser) {
      return res.status(400).json({ 
        error: `El ${existingUser.field_exists} ya está registrado.` 
      });
    }

    // Crear usuario
    const userId = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    // Generar token
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Obtener datos del usuario (sin contraseña)
    const user = await User.findById(userId);

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario.' 
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validaciones
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        error: 'Email/username y contraseña son requeridos.' 
      });
    }

    // Buscar usuario por email o username
    let user;
    if (emailOrUsername.includes('@')) {
      user = await User.findByEmail(emailOrUsername);
    } else {
      user = await User.findByUsername(emailOrUsername);
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas.' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas.' 
      });
    }

    // Generar tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Login exitoso.',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión.' 
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // req.user viene del middleware authenticateToken
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado.' 
      });
    }

    // Obtener estadísticas del usuario
    const stats = await User.getUserStats(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        created_at: user.created_at
      },
      stats
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil.' 
    });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const userId = req.user.id;

    // Validar que al menos un campo esté presente
    if (!username && !email && !bio) {
      return res.status(400).json({ 
        error: 'Debes proporcionar al menos un campo para actualizar.' 
      });
    }

    // Si se va a cambiar username o email, verificar que no existan
    if (username || email) {
      const currentUser = await User.findById(userId);
      
      if (username && username !== currentUser.username) {
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ 
            error: 'El username ya está en uso.' 
          });
        }
      }

      if (email && email !== currentUser.email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ 
            error: 'El email ya está en uso.' 
          });
        }
      }
    }

    // Actualizar usuario
    const updatedUser = await User.update(userId, {
      username,
      email,
      bio
    });

    res.json({
      message: 'Perfil actualizado exitosamente.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      error: 'Error al actualizar perfil.' 
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos.' 
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas nuevas no coinciden.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres.' 
      });
    }

    // Verificar contraseña actual
    const user = await User.findById(userId);
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Contraseña actual incorrecta.' 
      });
    }

    // Actualizar contraseña
    await User.updatePassword(userId, newPassword);

    res.json({
      message: 'Contraseña actualizada exitosamente.'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error al cambiar contraseña.' 
    });
  }
};

// Logout (invalidar token - lado cliente)
const logout = async (req, res) => {
  try {
    // En una implementación real, podrías agregar el token a una blacklist
    // Por ahora, el logout se maneja en el cliente eliminando el token
    
    res.json({
      message: 'Logout exitoso.'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      error: 'Error al cerrar sesión.' 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
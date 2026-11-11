const Usuario = require('../models/Usuario');

/** Devuelve el usuario de la sesión o null si no hay sesión válida. */
async function cargarUsuario(req) {
  if (!req.session?.usuarioId) return null;

  const usuario = await Usuario.findById(req.session.usuarioId);
  if (!usuario || !usuario.activo) return null;

  return usuario;
}

/** Bloquea el acceso a cualquier ruta que no sea de un administrador. */
async function requiereAdmin(req, res, next) {
  try {
    const usuario = await cargarUsuario(req);

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { cargarUsuario, requiereAdmin };

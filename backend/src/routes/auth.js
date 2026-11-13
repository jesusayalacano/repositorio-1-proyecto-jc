const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const Usuario = require('../models/Usuario');
const { cargarUsuario } = require('../middleware/auth');

const router = express.Router();

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos y vuelve a probar.' },
});

const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados registros. Espera un rato y vuelve a probar.' },
});

/** Guarda el usuario en una sesión nueva para evitar fijación de sesión. */
function iniciarSesion(req, usuario) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);

      req.session.usuarioId = usuario._id.toString();
      req.session.save((errorGuardar) => {
        if (errorGuardar) return reject(errorGuardar);
        resolve();
      });
    });
  });
}

router.post('/registro', limiteRegistro, async (req, res, next) => {
  try {
    const nombre = String(req.body?.nombre || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    if (nombre.length < 2 || nombre.length > 80) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 80 caracteres' });
    }

    if (!EMAIL_VALIDO.test(email)) {
      return res.status(400).json({ error: 'Escribe un correo válido' });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 128 caracteres' });
    }

    const existente = await Usuario.exists({ email });

    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      email,
      nombre,
      passwordHash,
      rol: 'cliente',
      activo: true,
    });

    await iniciarSesion(req, usuario);
    res.status(201).json({ ok: true, usuario: usuario.toJSON() });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    next(error);
  }
});

router.post('/login', limiteLogin, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ email });
    const valida = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

    if (!usuario || !usuario.activo || !valida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    await iniciarSesion(req, usuario);
    res.json({ ok: true, usuario: usuario.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });

  req.session.destroy(() => {
    res.clearCookie('dunklabs.sid');
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res, next) => {
  try {
    const usuario = await cargarUsuario(req);

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    res.json({ usuario: usuario.toJSON() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

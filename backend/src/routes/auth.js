const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const Usuario = require('../models/Usuario');
const { cargarUsuario } = require('../middleware/auth');

const router = express.Router();

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos y vuelve a probar.' },
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

    // Se regenera la sesión para evitar fijación de sesión.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.usuarioId = usuario._id.toString();
      req.session.save((errorGuardar) => {
        if (errorGuardar) return next(errorGuardar);
        res.json({ ok: true, usuario: usuario.toJSON() });
      });
    });
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

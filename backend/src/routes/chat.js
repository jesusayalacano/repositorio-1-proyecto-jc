const express = require('express');
const rateLimit = require('express-rate-limit');

const { ApiError } = require('../errors');
const { responderChat } = require('../services/chat');

const router = express.Router();

const MAX_MENSAJES = 8;
const MAX_CARACTERES = 1000;

const limiteChat = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Demasiadas consultas a DunkBot. Espera unos minutos y vuelve a intentar.',
  },
});

function validarMensajes(valor) {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new ApiError(400, 'Envía al menos un mensaje para DunkBot');
  }

  if (valor.length > MAX_MENSAJES) {
    throw new ApiError(400, `Puedes enviar hasta ${MAX_MENSAJES} mensajes por consulta`);
  }

  const mensajes = valor.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new ApiError(400, 'Hay un mensaje inválido en la conversación');
    }

    const role = item.role;
    const content = typeof item.content === 'string' ? item.content.trim() : '';

    if (role !== 'user' && role !== 'assistant') {
      throw new ApiError(400, 'Los mensajes deben tener rol user o assistant');
    }

    if (!content) {
      throw new ApiError(400, 'Los mensajes no pueden estar vacíos');
    }

    if (content.length > MAX_CARACTERES) {
      throw new ApiError(400, `Cada mensaje puede tener máximo ${MAX_CARACTERES} caracteres`);
    }

    return { role, content };
  });

  if (mensajes[mensajes.length - 1].role !== 'user') {
    throw new ApiError(400, 'El último mensaje debe ser del usuario');
  }

  return mensajes;
}

router.post('/', limiteChat, async (req, res, next) => {
  try {
    const mensajes = validarMensajes(req.body?.mensajes);
    const resultado = await responderChat(mensajes);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

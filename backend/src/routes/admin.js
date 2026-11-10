const express = require('express');

const { ApiError } = require('../errors');
const { requiereAdmin } = require('../middleware/auth');
const { ESTADOS_PEDIDO, ESTADOS_PERSONALIZACION } = require('../constantes');
const Pedido = require('../models/Pedido');
const Mensaje = require('../models/Mensaje');
const Personalizacion = require('../models/Personalizacion');
const Producto = require('../models/Producto');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Todo lo que cuelga de /api/admin exige sesión de administrador.
router.use(requiereAdmin);

router.get(
  '/resumen',
  asyncHandler(async (req, res) => {
    const [
      productos,
      pedidos,
      pedidosPendientes,
      mensajes,
      personalizaciones,
      personalizacionesPendientes,
    ] = await Promise.all([
      Producto.countDocuments(),
      Pedido.countDocuments(),
      Pedido.countDocuments({ estado: 'pendiente' }),
      Mensaje.countDocuments(),
      Personalizacion.countDocuments(),
      Personalizacion.countDocuments({ estado: 'pendiente' }),
    ]);

    const ultimosPedidos = await Pedido.find().sort({ creadoEn: -1 }).limit(5).lean();

    res.json({
      productos,
      pedidos,
      pedidosPendientes,
      mensajes,
      personalizaciones,
      personalizacionesPendientes,
      ultimosPedidos,
    });
  })
);

router.get(
  '/mensajes',
  asyncHandler(async (req, res) => {
    const mensajes = await Mensaje.find().sort({ creadoEn: -1 }).lean();
    res.json({ total: mensajes.length, mensajes });
  })
);

router.get(
  '/personalizaciones',
  asyncHandler(async (req, res) => {
    const personalizaciones = await Personalizacion.find().sort({ creadoEn: -1 }).lean();
    res.json({ total: personalizaciones.length, personalizaciones });
  })
);

router.put(
  '/pedidos/:id/estado',
  asyncHandler(async (req, res) => {
    const estado = String(req.body?.estado || '').trim().toLowerCase();

    if (!ESTADOS_PEDIDO.includes(estado)) {
      throw new ApiError(400, `Estado inválido. Usa: ${ESTADOS_PEDIDO.join(', ')}`);
    }

    const pedido = await Pedido.findOneAndUpdate(
      { id: req.params.id },
      { $set: { estado } },
      { returnDocument: 'after' }
    ).lean();

    if (!pedido) throw new ApiError(404, 'Pedido no encontrado');

    res.json(pedido);
  })
);

router.put(
  '/personalizaciones/:id/estado',
  asyncHandler(async (req, res) => {
    const estado = String(req.body?.estado || '').trim().toLowerCase();

    if (!ESTADOS_PERSONALIZACION.includes(estado)) {
      throw new ApiError(400, `Estado inválido. Usa: ${ESTADOS_PERSONALIZACION.join(', ')}`);
    }

    const solicitud = await Personalizacion.findOneAndUpdate(
      { id: req.params.id },
      { $set: { estado } },
      { returnDocument: 'after' }
    ).lean();

    if (!solicitud) throw new ApiError(404, 'Solicitud no encontrada');

    res.json(solicitud);
  })
);

module.exports = router;

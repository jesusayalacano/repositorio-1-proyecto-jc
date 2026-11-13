/**
 * dunk labs - API
 *
 * Ejecutar:
 *   npm install
 *   npm start        (o npm run dev con recarga automática)
 *
 * Variables de entorno:
 *   PORT          Puerto HTTP (por defecto 3000)
 *   FRONTEND_URL  Origen permitido para el frontend de Vite
 *   MONGODB_URI   Cadena de conexión de MongoDB Atlas
 *   MONGODB_DB    Nombre de la base de datos (por defecto dunklabs)
 */

const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');

const { conectarDB } = require('./db');
const { ApiError } = require('./errors');
const { CATEGORIAS, TIPOS_PERSONALIZACION } = require('./constantes');
const { requiereAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');
const Mensaje = require('./models/Mensaje');
const Personalizacion = require('./models/Personalizacion');

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ES_PRODUCCION = process.env.NODE_ENV === 'production';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
const SESSION_TTL = 8 * 60 * 60; // 8 horas en segundos

if (ES_PRODUCCION && !process.env.SESSION_SECRET) {
  throw new Error('Falta SESSION_SECRET. Configúrala en las variables de entorno de producción.');
}

const sessionStore = process.env.MONGODB_URI
  ? MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB || 'dunklabs',
      collectionName: 'sesiones',
      ttl: SESSION_TTL,
      touchAfter: 24 * 3600,
    })
  : undefined;

const TIPOS_IMAGEN = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

/** Envuelve handlers async para que los errores lleguen al middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function escaparRegex(valor) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function esEmailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}

function nuevoId(prefijo) {
  return `${prefijo}-${crypto.randomUUID()}`;
}

const subirImagen = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(UPLOAD_DIR, { recursive: true })
        .then(() => cb(null, UPLOAD_DIR))
        .catch(cb);
    },
    filename: (req, file, cb) => {
      const extension = TIPOS_IMAGEN.get(file.mimetype) || '';
      cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!TIPOS_IMAGEN.has(file.mimetype)) {
      return cb(new ApiError(400, 'La imagen debe ser JPG, PNG o WebP'));
    }
    cb(null, true);
  },
});

/* ------------------------------------------------------------------ */
/* Middlewares generales                                               */
/* ------------------------------------------------------------------ */

app.disable('x-powered-by');

if (ES_PRODUCCION) {
  app.set('trust proxy', 1);
}

// El frontend vive en Vite (5173) y la API en otro puerto. Se permite el
// origen configurado y el envío de la cookie de sesión.
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));

app.use(
  session({
    name: 'dunklabs.sid',
    secret: process.env.SESSION_SECRET || 'dunklabs-dev-secret-cambiar',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      // En Render el frontend y la API viven en dominios distintos.
      // SameSite=None permite enviar la cookie en esas peticiones cruzadas.
      sameSite: ES_PRODUCCION ? 'none' : 'lax',
      secure: ES_PRODUCCION,
      maxAge: SESSION_TTL * 1000,
    },
  })
);

// Log simple de peticiones.
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });
  next();
});

/* ------------------------------------------------------------------ */
/* Archivos subidos por los clientes                                   */
/* ------------------------------------------------------------------ */

// Las imágenes de producto y el frontend ya no se sirven desde aquí.
// Solo se conserva /uploads para las imágenes de personalizaciones.
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: true }));

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    servicio: 'dunk labs api',
    version: '1.0.0',
    baseDatos: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
    hora: new Date().toISOString(),
  });
});

/* ------------------------- Autenticación -------------------------- */

app.use('/api/auth', authRoutes);

/* ------------------------- Administración -------------------------- */

app.use('/api/admin', adminRoutes);

/* --------------------------- Productos ---------------------------- */

app.get(
  '/api/productos',
  asyncHandler(async (req, res) => {
    const categoria = texto(req.query.categoria).toLowerCase();
    const busqueda = texto(req.query.q).toLowerCase();
    const soloDisponibles = req.query.disponible === 'true';

    if (categoria && categoria !== 'todos' && !CATEGORIAS.includes(categoria)) {
      throw new ApiError(400, `Categoría inválida. Usa: ${CATEGORIAS.join(', ')}`);
    }

    const filtro = {};
    if (categoria && categoria !== 'todos') filtro.categoria = categoria;
    if (soloDisponibles) filtro.stock = { $gt: 0 };
    if (busqueda) {
      const patron = new RegExp(escaparRegex(busqueda), 'i');
      filtro.$or = [{ nombre: patron }, { descripcion: patron }];
    }

    const productos = await Producto.find(filtro).sort({ creadoEn: 1, _id: 1 });
    res.json({ total: productos.length, productos });
  })
);

app.get(
  '/api/productos/:id',
  asyncHandler(async (req, res) => {
    const producto = await Producto.findOne({ id: req.params.id });

    if (!producto) throw new ApiError(404, 'Producto no encontrado');
    res.json(producto);
  })
);

app.post(
  '/api/productos',
  requiereAdmin,
  asyncHandler(async (req, res) => {
    const datos = validarProducto(req.body);
    const producto = await Producto.create({
      id: nuevoId('prod'),
      ...datos,
      creadoEn: new Date(),
    });

    res.status(201).json(producto);
  })
);

app.put(
  '/api/productos/:id',
  requiereAdmin,
  asyncHandler(async (req, res) => {
    const datos = validarProducto(req.body, { parcial: true });
    const producto = await Producto.findOneAndUpdate(
      { id: req.params.id },
      { $set: { ...datos, actualizadoEn: new Date() } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!producto) throw new ApiError(404, 'Producto no encontrado');
    res.json(producto);
  })
);

app.delete(
  '/api/productos/:id',
  requiereAdmin,
  asyncHandler(async (req, res) => {
    const producto = await Producto.findOneAndDelete({ id: req.params.id });

    if (!producto) throw new ApiError(404, 'Producto no encontrado');
    res.json({ eliminado: true, producto });
  })
);

/* ---------------------------- Pedidos ----------------------------- */

app.get(
  '/api/pedidos',
  requiereAdmin,
  asyncHandler(async (req, res) => {
    const pedidos = await Pedido.find().sort({ creadoEn: -1 });
    res.json({ total: pedidos.length, pedidos });
  })
);

app.get(
  '/api/pedidos/:id',
  requiereAdmin,
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findOne({ id: req.params.id });

    if (!pedido) throw new ApiError(404, 'Pedido no encontrado');
    res.json(pedido);
  })
);

app.post(
  '/api/pedidos',
  asyncHandler(async (req, res) => {
    const { cliente, items } = req.body ?? {};

    const nombre = texto(cliente?.nombre);
    const email = texto(cliente?.email).toLowerCase();
    const telefono = texto(cliente?.telefono);
    const direccion = texto(cliente?.direccion);

    if (nombre.length < 3) throw new ApiError(400, 'El nombre debe tener al menos 3 caracteres');
    if (!esEmailValido(email)) throw new ApiError(400, 'El email no es válido');
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'El pedido debe incluir al menos un producto');
    }

    const cantidades = new Map();

    for (const item of items) {
      const productoId = texto(item?.productoId);
      const cantidad = item?.cantidad;

      if (!productoId) throw new ApiError(400, 'Hay un producto inválido en el pedido');
      if (!esEnteroPositivo(cantidad)) {
        throw new ApiError(400, `Cantidad inválida para "${productoId}"`);
      }

      cantidades.set(productoId, (cantidades.get(productoId) || 0) + cantidad);
    }

    // Los precios SIEMPRE se toman del catálogo, nunca del cliente.
    const productos = await Producto.find({ id: { $in: [...cantidades.keys()] } });
    const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));
    const lineas = [];

    for (const [productoId, cantidad] of cantidades) {
      const producto = productosPorId.get(productoId);
      if (!producto) throw new ApiError(400, `Producto inexistente: ${productoId}`);
      if (cantidad > producto.stock) {
        throw new ApiError(400, `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`);
      }

      lineas.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad,
      });
    }

    const total = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);

    const pedido = await Pedido.create({
      id: nuevoId('ped'),
      cliente: { nombre, email, telefono, direccion },
      items: lineas,
      total,
      moneda: 'COP',
      estado: 'pendiente',
      creadoEn: new Date(),
    });

    res.status(201).json(pedido);
  })
);

/* --------------------------- Contacto ----------------------------- */

app.post(
  '/api/contacto',
  asyncHandler(async (req, res) => {
    const nombre = texto(req.body?.nombre);
    const email = texto(req.body?.email).toLowerCase();
    const mensaje = texto(req.body?.mensaje);

    if (nombre.length < 3) throw new ApiError(400, 'El nombre debe tener al menos 3 caracteres');
    if (!esEmailValido(email)) throw new ApiError(400, 'El email no es válido');
    if (mensaje.length < 10) throw new ApiError(400, 'El mensaje debe tener al menos 10 caracteres');
    if (mensaje.length > 2000) throw new ApiError(400, 'El mensaje no puede superar 2000 caracteres');

    const registro = await Mensaje.create({
      id: nuevoId('msg'),
      nombre,
      email,
      mensaje,
      creadoEn: new Date(),
    });

    res.status(201).json({ ok: true, mensaje: 'Mensaje recibido', registro });
  })
);

/* ------------------------- Personalizaciones ---------------------- */

app.post(
  '/api/personalizaciones',
  subirImagen.single('imagen'),
  asyncHandler(async (req, res) => {
    try {
      const tipo = texto(req.body?.tipo).toLowerCase();
      const nombre = texto(req.body?.nombre);
      const email = texto(req.body?.email).toLowerCase();
      const telefono = texto(req.body?.telefono);
      const talla = texto(req.body?.talla);
      const color = texto(req.body?.color);
      const detalle = texto(req.body?.detalle).slice(0, 40);
      const notas = texto(req.body?.notas).slice(0, 120);

      if (!TIPOS_PERSONALIZACION.includes(tipo)) {
        throw new ApiError(400, 'Elige camiseta o zapatillas');
      }
      if (nombre.length < 3) {
        throw new ApiError(400, 'El nombre debe tener al menos 3 caracteres');
      }
      if (!esEmailValido(email)) {
        throw new ApiError(400, 'El email no es válido');
      }
      if (telefono.length < 7) {
        throw new ApiError(400, 'El teléfono debe tener al menos 7 caracteres');
      }
      if (talla.length < 1) {
        throw new ApiError(400, 'Falta la talla');
      }
      if (color.length < 1) {
        throw new ApiError(400, 'Falta el color');
      }

      const solicitud = await Personalizacion.create({
        id: nuevoId('per'),
        tipo,
        nombre,
        email,
        telefono,
        talla,
        color,
        detalle,
        notas,
        imagen: req.file ? `/uploads/${req.file.filename}` : null,
        estado: 'pendiente',
        creadoEn: new Date(),
      });

      res.status(201).json({
        ok: true,
        mensaje: 'Solicitud recibida',
        solicitud,
      });
    } catch (error) {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      throw error;
    }
  })
);

/* ------------------------------------------------------------------ */
/* Validación de productos                                             */
/* ------------------------------------------------------------------ */

function validarProducto(cuerpo, { parcial = false } = {}) {
  const datos = {};

  const nombre = texto(cuerpo?.nombre);
  if (!parcial || nombre) {
    if (nombre.length < 2 || nombre.length > 120) {
      throw new ApiError(400, 'El nombre debe tener entre 2 y 120 caracteres');
    }
    datos.nombre = nombre;
  }

  if (!parcial || cuerpo?.precio !== undefined) {
    const precio = Number(cuerpo?.precio);
    if (!Number.isFinite(precio) || precio < 0) {
      throw new ApiError(400, 'El precio debe ser un número mayor o igual a 0');
    }
    datos.precio = precio;
  }

  const categoria = texto(cuerpo?.categoria).toLowerCase();
  if (!parcial || categoria) {
    if (!CATEGORIAS.includes(categoria)) {
      throw new ApiError(400, `Categoría inválida. Usa: ${CATEGORIAS.join(', ')}`);
    }
    datos.categoria = categoria;
  }

  if (!parcial || cuerpo?.stock !== undefined) {
    const stock = Number(cuerpo?.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new ApiError(400, 'El stock debe ser un entero mayor o igual a 0');
    }
    datos.stock = stock;
  }

  if (cuerpo?.descripcion !== undefined) {
    datos.descripcion = texto(cuerpo.descripcion).slice(0, 500);
  }

  if (cuerpo?.imagen !== undefined) {
    datos.imagen = texto(cuerpo.imagen);
  }

  if (cuerpo?.etiqueta !== undefined) {
    datos.etiqueta = texto(cuerpo.etiqueta).slice(0, 40);
  }

  return datos;
}

/* ------------------------------------------------------------------ */
/* 404 y manejo de errores                                             */
/* ------------------------------------------------------------------ */

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado', ruta: req.originalUrl });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', ruta: req.originalUrl });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const mensaje =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'La imagen no puede superar 5 MB'
        : 'No se pudo subir la imagen';
    return res.status(400).json({ error: mensaje });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: Object.values(error.errors || {}).map((item) => item.message),
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Dato inválido' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con ese identificador' });
  }

  if (error.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }

  console.error('Error no controlado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV !== 'production' ? { detalle: error.message } : {}),
  });
});

/* ------------------------------------------------------------------ */
/* Arranque                                                            */
/* ------------------------------------------------------------------ */

async function iniciar() {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`dunk labs corriendo en http://localhost:${PORT}`);
    console.log(`API de productos:   http://localhost:${PORT}/api/productos`);
    console.log(`Estado del servicio: http://localhost:${PORT}/api/health`);
  });
}

if (require.main === module) {
  iniciar().catch((error) => {
    console.error('No se pudo iniciar dunk labs:', error.message);
    process.exit(1);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.iniciar = iniciar;

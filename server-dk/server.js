/**
 * dunk labs - API + servidor del sitio
 *
 * Ejecutar:
 *   npm install
 *   npm start        (o npm run dev con recarga automática)
 *
 * Variables de entorno:
 *   PORT  Puerto HTTP (por defecto 3000)
 */

const express = require('express');
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');

const ARCHIVO_PRODUCTOS = path.join(DATA_DIR, 'productos.json');
const ARCHIVO_PEDIDOS = path.join(DATA_DIR, 'pedidos.json');
const ARCHIVO_MENSAJES = path.join(DATA_DIR, 'mensajes.json');

const CATEGORIAS = ['balones', 'zapatillas', 'camisetas', 'accesorios', 'tableros'];

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

/** Envuelve handlers async para que los errores lleguen al middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Lee un JSON del disco. Si el archivo no existe devuelve `porDefecto`. */
async function leerJson(archivo, porDefecto = []) {
  try {
    const contenido = await fs.readFile(archivo, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') return porDefecto;
    throw error;
  }
}

/** Escribe un JSON de forma atómica (archivo temporal + rename). */
async function escribirJson(archivo, datos) {
  await fs.mkdir(path.dirname(archivo), { recursive: true });
  const temporal = `${archivo}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(datos, null, 2), 'utf8');
  await fs.rename(temporal, archivo);
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
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

/* ------------------------------------------------------------------ */
/* Middlewares generales                                               */
/* ------------------------------------------------------------------ */

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// CORS abierto solo en desarrollo (el sitio se sirve desde el mismo origen).
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

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
/* Sitio estático                                                      */
/* ------------------------------------------------------------------ */

app.use(
  '/images',
  express.static(path.join(ROOT, 'images'), { maxAge: '1d', fallthrough: true })
);

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(ROOT, 'styles.css'));
});

app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.get(['/catalogo', '/catalogo.html'], (req, res) => {
  res.sendFile(path.join(ROOT, 'catalogo.html'));
});

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    servicio: 'dunk labs api',
    version: '1.0.0',
    hora: new Date().toISOString(),
  });
});

/* --------------------------- Productos ---------------------------- */

app.get(
  '/api/productos',
  asyncHandler(async (req, res) => {
    let productos = await leerJson(ARCHIVO_PRODUCTOS, []);

    const categoria = texto(req.query.categoria).toLowerCase();
    const busqueda = texto(req.query.q).toLowerCase();
    const soloDisponibles = req.query.disponible === 'true';

    if (categoria && categoria !== 'todos') {
      if (!CATEGORIAS.includes(categoria)) {
        throw new ApiError(400, `Categoría inválida. Usa: ${CATEGORIAS.join(', ')}`);
      }
      productos = productos.filter((p) => p.categoria === categoria);
    }

    if (busqueda) {
      productos = productos.filter((p) =>
        `${p.nombre} ${p.descripcion}`.toLowerCase().includes(busqueda)
      );
    }

    if (soloDisponibles) {
      productos = productos.filter((p) => p.stock > 0);
    }

    res.json({ total: productos.length, productos });
  })
);

app.get(
  '/api/productos/:id',
  asyncHandler(async (req, res) => {
    const productos = await leerJson(ARCHIVO_PRODUCTOS, []);
    const producto = productos.find((p) => p.id === req.params.id);

    if (!producto) throw new ApiError(404, 'Producto no encontrado');
    res.json(producto);
  })
);

app.post(
  '/api/productos',
  asyncHandler(async (req, res) => {
    const datos = validarProducto(req.body);
    const productos = await leerJson(ARCHIVO_PRODUCTOS, []);

    const producto = { id: nuevoId('prod'), ...datos, creadoEn: new Date().toISOString() };
    productos.push(producto);
    await escribirJson(ARCHIVO_PRODUCTOS, productos);

    res.status(201).json(producto);
  })
);

app.put(
  '/api/productos/:id',
  asyncHandler(async (req, res) => {
    const productos = await leerJson(ARCHIVO_PRODUCTOS, []);
    const indice = productos.findIndex((p) => p.id === req.params.id);

    if (indice === -1) throw new ApiError(404, 'Producto no encontrado');

    const datos = validarProducto(req.body, { parcial: true });
    productos[indice] = {
      ...productos[indice],
      ...datos,
      actualizadoEn: new Date().toISOString(),
    };
    await escribirJson(ARCHIVO_PRODUCTOS, productos);

    res.json(productos[indice]);
  })
);

app.delete(
  '/api/productos/:id',
  asyncHandler(async (req, res) => {
    const productos = await leerJson(ARCHIVO_PRODUCTOS, []);
    const indice = productos.findIndex((p) => p.id === req.params.id);

    if (indice === -1) throw new ApiError(404, 'Producto no encontrado');

    const [eliminado] = productos.splice(indice, 1);
    await escribirJson(ARCHIVO_PRODUCTOS, productos);

    res.json({ eliminado: true, producto: eliminado });
  })
);

/* ---------------------------- Pedidos ----------------------------- */

app.get(
  '/api/pedidos',
  asyncHandler(async (req, res) => {
    const pedidos = await leerJson(ARCHIVO_PEDIDOS, []);
    res.json({ total: pedidos.length, pedidos });
  })
);

app.get(
  '/api/pedidos/:id',
  asyncHandler(async (req, res) => {
    const pedidos = await leerJson(ARCHIVO_PEDIDOS, []);
    const pedido = pedidos.find((p) => p.id === req.params.id);

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

    // Los precios SIEMPRE se toman del catálogo, nunca del cliente.
    const productos = await leerJson(ARCHIVO_PRODUCTOS, []);
    const lineas = [];

    for (const item of items) {
      const producto = productos.find((p) => p.id === item?.productoId);
      if (!producto) throw new ApiError(400, `Producto inexistente: ${item?.productoId}`);

      const cantidad = item?.cantidad;
      if (!esEnteroPositivo(cantidad)) {
        throw new ApiError(400, `Cantidad inválida para "${producto.nombre}"`);
      }
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

    const pedido = {
      id: nuevoId('ped'),
      cliente: { nombre, email, telefono, direccion },
      items: lineas,
      total,
      moneda: 'COP',
      estado: 'pendiente',
      creadoEn: new Date().toISOString(),
    };

    const pedidos = await leerJson(ARCHIVO_PEDIDOS, []);
    pedidos.push(pedido);
    await escribirJson(ARCHIVO_PEDIDOS, pedidos);

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

    const registro = {
      id: nuevoId('msg'),
      nombre,
      email,
      mensaje,
      creadoEn: new Date().toISOString(),
    };

    const mensajes = await leerJson(ARCHIVO_MENSAJES, []);
    mensajes.push(registro);
    await escribirJson(ARCHIVO_MENSAJES, mensajes);

    res.status(201).json({ ok: true, mensaje: 'Mensaje recibido', registro });
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
  res.status(404).sendFile(path.join(ROOT, 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`dunk labs corriendo en http://localhost:${PORT}`);
    console.log(`API de productos:   http://localhost:${PORT}/api/productos`);
    console.log(`Estado del servicio: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

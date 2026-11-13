const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_URL}/api`;

async function pedir(ruta, { body, ...opciones } = {}) {
  const config = {
    ...opciones,
    credentials: 'include',
    headers: { ...opciones.headers },
  };

  if (body instanceof FormData) {
    config.body = body;
  } else if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  const respuesta = await fetch(`${BASE}${ruta}`, config);
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.error || 'No se pudo completar la operación');
    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

export function obtenerProductos() {
  return pedir('/productos');
}

export function enviarContacto(datos) {
  return pedir('/contacto', { method: 'POST', body: datos });
}

export function crearPersonalizacion(formData) {
  return pedir('/personalizaciones', { method: 'POST', body: formData });
}

export function crearPedido(datos) {
  return pedir('/pedidos', { method: 'POST', body: datos });
}

export const api = {
  me: () => pedir('/auth/me'),
  login: (email, password) =>
    pedir('/auth/login', { method: 'POST', body: { email, password } }),
  registro: (datos) => pedir('/auth/registro', { method: 'POST', body: datos }),
  logout: () => pedir('/auth/logout', { method: 'POST' }),

  resumen: () => pedir('/admin/resumen'),
  mensajes: () => pedir('/admin/mensajes'),
  personalizaciones: () => pedir('/admin/personalizaciones'),
  cambiarEstadoPedido: (id, estado) =>
    pedir(`/admin/pedidos/${id}/estado`, { method: 'PUT', body: { estado } }),
  cambiarEstadoPersonalizacion: (id, estado) =>
    pedir(`/admin/personalizaciones/${id}/estado`, { method: 'PUT', body: { estado } }),

  productos: {
    listar: obtenerProductos,
    crear: (producto) => pedir('/productos', { method: 'POST', body: producto }),
    actualizar: (id, producto) =>
      pedir(`/productos/${id}`, { method: 'PUT', body: producto }),
    eliminar: (id) => pedir(`/productos/${id}`, { method: 'DELETE' }),
  },

  pedidos: {
    listar: () => pedir('/pedidos'),
  },
};

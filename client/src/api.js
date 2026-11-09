const BASE = '/api';

async function pedir(ruta, { body, ...opciones } = {}) {
  const config = {
    ...opciones,
    credentials: 'same-origin',
    headers: { ...opciones.headers },
  };

  if (body !== undefined) {
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

export const api = {
  me: () => pedir('/auth/me'),
  login: (email, password) =>
    pedir('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => pedir('/auth/logout', { method: 'POST' }),

  resumen: () => pedir('/admin/resumen'),
  mensajes: () => pedir('/admin/mensajes'),
  personalizaciones: () => pedir('/admin/personalizaciones'),
  cambiarEstadoPedido: (id, estado) =>
    pedir(`/admin/pedidos/${id}/estado`, { method: 'PUT', body: { estado } }),
  cambiarEstadoPersonalizacion: (id, estado) =>
    pedir(`/admin/personalizaciones/${id}/estado`, { method: 'PUT', body: { estado } }),

  productos: {
    listar: () => pedir('/productos'),
    crear: (producto) => pedir('/productos', { method: 'POST', body: producto }),
    actualizar: (id, producto) =>
      pedir(`/productos/${id}`, { method: 'PUT', body: producto }),
    eliminar: (id) => pedir(`/productos/${id}`, { method: 'DELETE' }),
  },

  pedidos: {
    listar: () => pedir('/pedidos'),
  },
};

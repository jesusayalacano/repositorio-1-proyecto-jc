import { useState } from 'react';

import { enviarContacto } from '../api.js';

const DATOS_INICIALES = {
  nombre: '',
  email: '',
  mensaje: '',
};

export default function Contacto() {
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState('');

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  async function enviar(event) {
    event.preventDefault();
    setEnviando(true);
    setEstado('');

    try {
      await enviarContacto({
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        mensaje: datos.mensaje.trim(),
      });

      setDatos(DATOS_INICIALES);
      setEstado('Mensaje enviado. Te respondemos pronto.');
    } catch (fallo) {
      setEstado(
        fallo.message === 'Failed to fetch'
          ? 'No se pudo enviar. Revisa la conexión.'
          : fallo.message
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="contacto">
      <h2>Contacto</h2>
      <p>Escríbenos si tienes una duda sobre un pedido, una talla o una personalización.</p>
      <form id="form-contacto" className="formulario" onSubmit={enviar}>
        <div className="form-grid">
          <label>
            Nombre
            <input
              name="nombre"
              autoComplete="name"
              required
              minLength={3}
              value={datos.nombre}
              onChange={cambiarCampo}
            />
          </label>
          <label>
            Correo
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={datos.email}
              onChange={cambiarCampo}
            />
          </label>
        </div>
        <label>
          Mensaje
          <textarea
            name="mensaje"
            rows={4}
            required
            minLength={10}
            value={datos.mensaje}
            onChange={cambiarCampo}
          />
        </label>
        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar mensaje'}
        </button>
        <p id="contacto-estado" className="form-estado" role="status">
          {estado}
        </p>
      </form>
    </section>
  );
}

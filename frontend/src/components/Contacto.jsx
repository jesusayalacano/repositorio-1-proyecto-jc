import { useState } from 'react';

const DATOS_INICIALES = {
  nombre: '',
  email: '',
  mensaje: '',
};

export default function Contacto() {
  const [datos, setDatos] = useState(DATOS_INICIALES);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function enviar(event) {
    // La conexión con la API se agrega en la Fase 5.
    event.preventDefault();
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
        <button type="submit" className="btn-primario">
          Enviar mensaje
        </button>
        <p id="contacto-estado" className="form-estado" role="status" />
      </form>
    </section>
  );
}

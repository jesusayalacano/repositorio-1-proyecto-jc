export default function Contacto() {
  return (
    <section id="contacto">
      <h2>Contacto</h2>
      <p>Escríbenos si tienes una duda sobre un pedido, una talla o una personalización.</p>
      <form id="form-contacto" className="formulario">
        <div className="form-grid">
          <label>
            Nombre
            <input name="nombre" autoComplete="name" required minLength={3} />
          </label>
          <label>
            Correo
            <input name="email" type="email" autoComplete="email" required />
          </label>
        </div>
        <label>
          Mensaje
          <textarea name="mensaje" rows={4} required minLength={10} />
        </label>
        <button type="submit" className="btn-primario">
          Enviar mensaje
        </button>
        <p id="contacto-estado" className="form-estado" role="status" />
      </form>
    </section>
  );
}

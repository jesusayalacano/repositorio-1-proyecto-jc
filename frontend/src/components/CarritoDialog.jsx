export default function CarritoDialog() {
  return (
    <dialog id="carrito" className="carrito" aria-labelledby="carrito-titulo">
      <div className="carrito-cabecera">
        <h2 id="carrito-titulo">Tu carrito</h2>
        <button className="carrito-cerrar" id="cerrar-carrito" type="button">
          Cerrar
        </button>
      </div>

      <p id="carrito-vacio" className="carrito-vacio">
        Todavía no has agregado nada.
      </p>
      <ul id="carrito-items" className="carrito-items" />

      <div id="carrito-resumen" className="carrito-resumen" hidden>
        <p className="carrito-total">
          Total <strong id="carrito-total">$0</strong>
        </p>

        <form id="form-pedido" className="form-pedido">
          <h3>Datos para la entrega</h3>
          <div className="form-grid">
            <label>
              Nombre
              <input name="nombre" autoComplete="name" required minLength={3} />
            </label>
            <label>
              Correo
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Teléfono
              <input name="telefono" type="tel" autoComplete="tel" required />
            </label>
            <label>
              Dirección
              <input name="direccion" autoComplete="street-address" required />
            </label>
          </div>
          <button id="boton-pedido" type="submit" className="btn-primario">
            Hacer pedido
          </button>
          <p className="form-nota">Te contactamos para confirmar el pago y el envío.</p>
        </form>

        <div className="carrito-acciones">
          <button id="vaciar-carrito" type="button" className="btn-secundario">
            Vaciar carrito
          </button>
          <button id="seguir-comprando" type="button" className="btn-primario">
            Seguir comprando
          </button>
        </div>
      </div>

      <p id="pedido-estado" className="carrito-estado" role="status" />
    </dialog>
  );
}

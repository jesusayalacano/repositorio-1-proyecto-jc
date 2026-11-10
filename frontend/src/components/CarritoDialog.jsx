import { useEffect, useRef, useState } from 'react';

import useBloquearScroll from '../hooks/useBloquearScroll.js';
import { formatoPrecio } from '../utils/formato.js';
import CarritoItem from './CarritoItem.jsx';

const DATOS_INICIALES = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
};

export default function CarritoDialog({
  abierto,
  items,
  onCerrar,
  onCambiarCantidad,
  onEliminar,
  onVaciar,
}) {
  const dialogoRef = useRef(null);
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const total = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);

  useBloquearScroll(abierto);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      dialogo.showModal();
    }

    if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function cerrarAlHacerClic(event) {
    if (event.target === event.currentTarget) {
      onCerrar();
    }
  }

  function enviar(event) {
    // La conexión con la API se agrega en la Fase 5.
    event.preventDefault();
  }

  return (
    <dialog
      ref={dialogoRef}
      id="carrito"
      className="carrito"
      aria-labelledby="carrito-titulo"
      onClose={onCerrar}
      onClick={cerrarAlHacerClic}
    >
      <div className="carrito-cabecera">
        <h2 id="carrito-titulo">Tu carrito</h2>
        <button className="carrito-cerrar" id="cerrar-carrito" type="button" onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      <p id="carrito-vacio" className="carrito-vacio" hidden={items.length > 0}>
        Todavía no has agregado nada.
      </p>
      <ul id="carrito-items" className="carrito-items">
        {items.map((item) => (
          <CarritoItem
            key={item.producto.id}
            item={item}
            onCambiarCantidad={onCambiarCantidad}
            onEliminar={onEliminar}
          />
        ))}
      </ul>

      <div id="carrito-resumen" className="carrito-resumen" hidden={items.length === 0}>
        <p className="carrito-total">
          Total <strong id="carrito-total">{formatoPrecio.format(total)}</strong>
        </p>

        <form id="form-pedido" className="form-pedido" onSubmit={enviar}>
          <h3>Datos para la entrega</h3>
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
            <label>
              Teléfono
              <input
                name="telefono"
                type="tel"
                autoComplete="tel"
                required
                value={datos.telefono}
                onChange={cambiarCampo}
              />
            </label>
            <label>
              Dirección
              <input
                name="direccion"
                autoComplete="street-address"
                required
                value={datos.direccion}
                onChange={cambiarCampo}
              />
            </label>
          </div>
          <button id="boton-pedido" type="submit" className="btn-primario">
            Hacer pedido
          </button>
          <p className="form-nota">Te contactamos para confirmar el pago y el envío.</p>
        </form>

        <div className="carrito-acciones">
          <button id="vaciar-carrito" type="button" className="btn-secundario" onClick={onVaciar}>
            Vaciar carrito
          </button>
          <button id="seguir-comprando" type="button" className="btn-primario" onClick={onCerrar}>
            Seguir comprando
          </button>
        </div>
      </div>

      <p id="pedido-estado" className="carrito-estado" role="status" />
    </dialog>
  );
}

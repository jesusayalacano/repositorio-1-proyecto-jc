import { formatoPrecio, urlImagen } from '../utils/formato.js';

export default function CarritoItem({ item, onCambiarCantidad, onEliminar }) {
  const { producto, cantidad } = item;

  return (
    <li className="carrito-item" data-id={producto.id}>
      <img src={urlImagen(producto.imagen)} alt={producto.nombre} />
      <div className="carrito-item-info">
        <p className="carrito-item-nombre">{producto.nombre}</p>
        <p className="carrito-item-precio">{formatoPrecio.format(producto.precio)}</p>
        <div className="carrito-cantidad">
          <button
            type="button"
            data-accion="menos"
            aria-label="Quitar una unidad"
            onClick={() => onCambiarCantidad(producto.id, -1)}
          >
            -
          </button>
          <span className="carrito-item-cantidad">{cantidad}</span>
          <button
            type="button"
            data-accion="mas"
            aria-label="Agregar una unidad"
            disabled={cantidad >= producto.stock}
            onClick={() => onCambiarCantidad(producto.id, 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        className="carrito-eliminar"
        data-accion="eliminar"
        aria-label="Eliminar producto"
        onClick={() => onEliminar(producto.id)}
      >
        ×
      </button>
    </li>
  );
}

import { formatoPrecio, urlImagen } from '../utils/formato.js';

export default function ProductoCard({ producto, onAgregar }) {
  const agotado = producto.stock <= 0;

  return (
    <article
      className="tarjeta-producto"
      data-id={producto.id}
      data-categoria={producto.categoria}
    >
      <span className="etiqueta" hidden={!producto.etiqueta}>
        {producto.etiqueta}
      </span>
      <img loading="lazy" decoding="async" src={urlImagen(producto.imagen)} alt={producto.nombre} />
      <h3>{producto.nombre}</h3>
      <p className="descripcion">{producto.descripcion}</p>
      <p className="precio">{formatoPrecio.format(producto.precio)}</p>
      <button
        className="btn-agregar"
        type="button"
        data-id={producto.id}
        disabled={agotado}
        onClick={() => onAgregar(producto.id)}
      >
        {agotado ? 'Agotado' : 'Añadir al carrito'}
      </button>
    </article>
  );
}

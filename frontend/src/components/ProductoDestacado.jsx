export default function ProductoDestacado({ producto }) {
  return (
    <li>
      <a className="producto-destacado" href={producto.href}>
        <img src={producto.imagen} alt={producto.alt} loading="lazy" />
        <h3>{producto.nombre}</h3>
        <p className="precio-destacado">{producto.precio}</p>
      </a>
    </li>
  );
}

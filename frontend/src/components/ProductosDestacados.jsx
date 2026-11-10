import destacados from '../data/destacados.js';
import ProductoDestacado from './ProductoDestacado.jsx';

export default function ProductosDestacados() {
  return (
    <section id="productos">
      <h2>Productos destacados</h2>
      <ul>
        {destacados.map((producto) => (
          <ProductoDestacado key={producto.id} producto={producto} />
        ))}
      </ul>
    </section>
  );
}

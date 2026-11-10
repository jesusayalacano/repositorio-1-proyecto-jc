import productos from '../data/productos.js';
import ProductoCard from './ProductoCard.jsx';

export default function CatalogoSeccion() {
  return (
    <section id="catalogo">
      <h2>Catálogo completo</h2>
      <p className="seccion-intro">Tienda · 6 categorías</p>

      <div className="catalogo-herramientas">
        <label className="buscador">
          <span className="sr-only">Buscar productos</span>
          <input id="buscador" type="search" placeholder="Buscar producto" autoComplete="off" />
        </label>
        <p id="resultado-conteo" className="resultado-conteo" aria-live="polite">
          {productos.length} de {productos.length} productos
        </p>
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por categoría">
        <button type="button" className="filtro-btn activo" data-categoria="todos">
          Todos
        </button>
        <button type="button" className="filtro-btn" data-categoria="balones">
          Balones
        </button>
        <button type="button" className="filtro-btn" data-categoria="zapatillas">
          Zapatillas
        </button>
        <button type="button" className="filtro-btn" data-categoria="mochilas">
          Mochilas
        </button>
        <button type="button" className="filtro-btn" data-categoria="camisetas">
          Camisetas
        </button>
        <button type="button" className="filtro-btn" data-categoria="accesorios">
          Accesorios
        </button>
        <button type="button" className="filtro-btn" data-categoria="tableros">
          Tableros
        </button>
      </div>

      <div id="grid-productos" className="grid-productos" aria-live="polite">
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
      <p id="catalogo-estado" className="catalogo-estado" role="status" />

      <noscript>
        <p className="catalogo-estado">
          Este catálogo necesita JavaScript para mostrar los productos.
        </p>
      </noscript>
    </section>
  );
}

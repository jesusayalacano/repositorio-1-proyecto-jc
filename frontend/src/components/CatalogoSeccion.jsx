import { useState } from 'react';

import ProductoCard from './ProductoCard.jsx';

const CATEGORIAS = [
  { id: 'todos', texto: 'Todos' },
  { id: 'balones', texto: 'Balones' },
  { id: 'zapatillas', texto: 'Zapatillas' },
  { id: 'mochilas', texto: 'Mochilas' },
  { id: 'camisetas', texto: 'Camisetas' },
  { id: 'accesorios', texto: 'Accesorios' },
  { id: 'tableros', texto: 'Tableros' },
];

function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function categoriaInicial() {
  const categoria = new URLSearchParams(window.location.search).get('categoria');
  return CATEGORIAS.some((opcion) => opcion.id === categoria) ? categoria : 'todos';
}

function busquedaInicial() {
  return new URLSearchParams(window.location.search).get('q') || '';
}

function actualizarUrl(filtro, busqueda) {
  const parametros = new URLSearchParams();
  if (filtro !== 'todos') parametros.set('categoria', filtro);
  if (busqueda.trim()) parametros.set('q', busqueda.trim());

  const url = parametros.toString()
    ? `${window.location.pathname}?${parametros.toString()}`
    : window.location.pathname;

  history.replaceState(null, '', url);
}

export default function CatalogoSeccion({ productos, cargando, error, onAgregar }) {
  const [filtro, setFiltro] = useState(categoriaInicial);
  const [busqueda, setBusqueda] = useState(busquedaInicial);

  const busquedaNormalizada = normalizar(busqueda.trim());
  const visibles = productos.filter((producto) => {
    if (filtro !== 'todos' && producto.categoria !== filtro) return false;
    if (!busquedaNormalizada) return true;

    const texto = `${producto.nombre} ${producto.descripcion} ${producto.categoria}`;
    return normalizar(texto).includes(busquedaNormalizada);
  });

  function cambiarFiltro(nuevoFiltro) {
    setFiltro(nuevoFiltro);
    actualizarUrl(nuevoFiltro, busqueda);
  }

  function cambiarBusqueda(event) {
    const valor = event.target.value;
    setBusqueda(valor);
    actualizarUrl(filtro, valor);
  }

  return (
    <section id="catalogo">
      <h2>Catálogo completo</h2>
      <p className="seccion-intro">Tienda · 6 categorías</p>

      <div className="catalogo-herramientas">
        <label className="buscador">
          <span className="sr-only">Buscar productos</span>
          <input
            id="buscador"
            type="search"
            placeholder="Buscar producto"
            autoComplete="off"
            value={busqueda}
            onChange={cambiarBusqueda}
          />
        </label>
        <p id="resultado-conteo" className="resultado-conteo" aria-live="polite">
          {cargando || error ? '' : `${visibles.length} de ${productos.length} productos`}
        </p>
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por categoría">
        {CATEGORIAS.map((categoria) => (
          <button
            key={categoria.id}
            type="button"
            className={filtro === categoria.id ? 'filtro-btn activo' : 'filtro-btn'}
            data-categoria={categoria.id}
            onClick={() => cambiarFiltro(categoria.id)}
          >
            {categoria.texto}
          </button>
        ))}
      </div>

      <div id="grid-productos" className="grid-productos" aria-live="polite">
        {visibles.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} onAgregar={onAgregar} />
        ))}
      </div>
      <p id="catalogo-estado" className="catalogo-estado" role="status">
        {cargando
          ? 'Cargando productos...'
          : error || (visibles.length === 0 ? 'No hay productos con ese filtro.' : '')}
      </p>

      <noscript>
        <p className="catalogo-estado">
          Este catálogo necesita JavaScript para mostrar los productos.
        </p>
      </noscript>
    </section>
  );
}

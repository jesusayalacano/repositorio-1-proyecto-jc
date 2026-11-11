import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../../api.js';
import {
  Aviso,
  CATEGORIAS,
  Cargando,
  ErrorPanel,
  Vacio,
  formatoPrecio,
  urlImagen,
} from './ui.jsx';
import ProductoForm from './ProductoForm.jsx';

const PRODUCTO_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: 'balones',
  stock: '',
  imagen: '',
  etiqueta: '',
};

export default function Productos({ onExpirado }) {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const datos = await api.productos.listar();
      setProductos(datos.productos || []);
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    }
  }, [onExpirado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    if (!productos) return [];
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      if (categoria !== 'todas' && producto.categoria !== categoria) return false;
      if (!termino) return true;
      return `${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(termino);
    });
  }, [productos, busqueda, categoria]);

  function abrirNuevo() {
    setAviso('');
    setEditando({ ...PRODUCTO_VACIO });
  }

  function abrirEditar(producto) {
    setAviso('');
    setEditando({ ...producto });
  }

  async function guardar(datos) {
    setGuardando(true);
    setError('');

    try {
      if (datos.id) {
        const { id, ...cambios } = datos;
        await api.productos.actualizar(id, cambios);
      } else {
        await api.productos.crear(datos);
      }

      setAviso(datos.id ? 'Producto actualizado.' : 'Producto creado.');
      setEditando(null);
      await cargar();
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(producto) {
    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminando(producto.id);
    setError('');

    try {
      await api.productos.eliminar(producto.id);
      setAviso('Producto eliminado.');
      await cargar();
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    } finally {
      setEliminando('');
    }
  }

  if (error && !productos) return <ErrorPanel mensaje={error} onReintentar={cargar} />;
  if (!productos) return <Cargando texto="Cargando productos…" />;

  return (
    <>
      {editando && (
        <ProductoForm
          valorInicial={editando}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
          guardando={guardando}
        />
      )}

      <section className="panel">
        <div className="panel-cabecera panel-cabecera-acciones">
          <h2>Catálogo ({productos.length})</h2>
          <button type="button" className="btn btn-primario" onClick={abrirNuevo}>
            + Nuevo producto
          </button>
        </div>

        <div className="filtros-admin">
          <input
            type="search"
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
          <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <Aviso texto={aviso} />
        {error && <p className="panel-error compacto">{error}</p>}

        {visibles.length === 0 ? (
          <Vacio>No hay productos que coincidan con el filtro.</Vacio>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla tabla-productos">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Etiqueta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className="celda-producto">
                        {producto.imagen ? (
                          <img src={urlImagen(producto.imagen)} alt="" />
                        ) : (
                          <span className="sin-imagen">—</span>
                        )}
                        <div>
                          <strong>{producto.nombre}</strong>
                          <span className="texto-suave">{producto.descripcion}</span>
                        </div>
                      </div>
                    </td>
                    <td>{producto.categoria}</td>
                    <td>{formatoPrecio.format(producto.precio)}</td>
                    <td className={producto.stock <= 0 ? 'stock-agotado' : ''}>
                      {producto.stock}
                    </td>
                    <td>{producto.etiqueta || '—'}</td>
                    <td>
                      <div className="acciones-fila">
                        <button
                          type="button"
                          className="btn btn-mini"
                          onClick={() => abrirEditar(producto)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-mini btn-peligro"
                          onClick={() => eliminar(producto)}
                          disabled={eliminando === producto.id}
                        >
                          {eliminando === producto.id ? '…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

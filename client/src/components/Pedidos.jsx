import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../api.js';
import {
  Cargando,
  ErrorPanel,
  ESTADOS_PEDIDO,
  EstadoBadge,
  Vacio,
  formatoFecha,
  formatoPrecio,
} from './ui.jsx';

export default function Pedidos({ onExpirado }) {
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [actualizando, setActualizando] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const datos = await api.pedidos.listar();
      setPedidos(datos.pedidos || []);
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    }
  }, [onExpirado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    if (!pedidos) return [];
    if (filtro === 'todos') return pedidos;
    return pedidos.filter((pedido) => pedido.estado === filtro);
  }, [pedidos, filtro]);

  async function cambiarEstado(pedido, estado) {
    setActualizando(pedido.id);
    setError('');

    try {
      const actualizado = await api.cambiarEstadoPedido(pedido.id, estado);
      setPedidos((lista) =>
        lista.map((item) =>
          item.id === pedido.id ? { ...item, estado: actualizado.estado } : item
        )
      );
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    } finally {
      setActualizando('');
    }
  }

  if (error && !pedidos) return <ErrorPanel mensaje={error} onReintentar={cargar} />;
  if (!pedidos) return <Cargando texto="Cargando pedidos…" />;

  return (
    <section className="panel">
      <div className="panel-cabecera panel-cabecera-acciones">
        <h2>Pedidos ({pedidos.length})</h2>
        <select value={filtro} onChange={(evento) => setFiltro(evento.target.value)}>
          <option value="todos">Todos los estados</option>
          {ESTADOS_PEDIDO.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="panel-error compacto">{error}</p>}

      {visibles.length === 0 ? (
        <Vacio>No hay pedidos con ese estado.</Vacio>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="mono">{pedido.id.slice(0, 13)}…</td>
                  <td>
                    <strong>{pedido.cliente?.nombre}</strong>
                    <span className="texto-suave">{pedido.cliente?.email}</span>
                    {pedido.cliente?.telefono && (
                      <span className="texto-suave">{pedido.cliente.telefono}</span>
                    )}
                    {pedido.cliente?.direccion && (
                      <span className="texto-suave">{pedido.cliente.direccion}</span>
                    )}
                  </td>
                  <td>
                    <details className="detalle-pedido">
                      <summary>{pedido.items.length} línea(s)</summary>
                      <ul>
                        {pedido.items.map((item) => (
                          <li key={item.productoId}>
                            {item.cantidad} × {item.nombre} —{' '}
                            {formatoPrecio.format(item.subtotal)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td>{formatoPrecio.format(pedido.total)}</td>
                  <td>{formatoFecha(pedido.creadoEn)}</td>
                  <td>
                    <div className="estado-editor">
                      <EstadoBadge estado={pedido.estado} />
                      <select
                        value={pedido.estado}
                        onChange={(evento) => cambiarEstado(pedido, evento.target.value)}
                        disabled={actualizando === pedido.id}
                        aria-label={`Cambiar estado del pedido ${pedido.id}`}
                      >
                        {ESTADOS_PEDIDO.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

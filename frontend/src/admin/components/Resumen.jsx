import { useCallback, useEffect, useState } from 'react';

import { api } from '../api.js';
import { Cargando, ErrorPanel, EstadoBadge, formatoFecha, formatoPrecio } from './ui.jsx';

export default function Resumen({ onExpirado }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      setDatos(await api.resumen());
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    }
  }, [onExpirado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <ErrorPanel mensaje={error} onReintentar={cargar} />;
  if (!datos) return <Cargando texto="Cargando resumen…" />;

  const tarjetas = [
    { titulo: 'Productos', valor: datos.productos, detalle: 'en el catálogo' },
    { titulo: 'Pedidos', valor: datos.pedidos, detalle: `${datos.pedidosPendientes} pendientes` },
    { titulo: 'Mensajes', valor: datos.mensajes, detalle: 'recibidos' },
    {
      titulo: 'Personalizaciones',
      valor: datos.personalizaciones,
      detalle: `${datos.personalizacionesPendientes} pendientes`,
    },
  ];

  return (
    <>
      <section className="kpis">
        {tarjetas.map((tarjeta) => (
          <article key={tarjeta.titulo} className="kpi">
            <p className="kpi-titulo">{tarjeta.titulo}</p>
            <strong className="kpi-valor">{tarjeta.valor}</strong>
            <span className="kpi-detalle">{tarjeta.detalle}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-cabecera">
          <h2>Últimos pedidos</h2>
        </div>

        {datos.ultimosPedidos.length === 0 ? (
          <p className="vacio">Todavía no hay pedidos.</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.ultimosPedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="mono">{pedido.id.slice(0, 12)}…</td>
                    <td>
                      <strong>{pedido.cliente?.nombre}</strong>
                      <span className="texto-suave">{pedido.cliente?.email}</span>
                    </td>
                    <td>{formatoFecha(pedido.creadoEn)}</td>
                    <td>{formatoPrecio.format(pedido.total)}</td>
                    <td>
                      <EstadoBadge estado={pedido.estado} />
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

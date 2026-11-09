import { useCallback, useEffect, useState } from 'react';

import { api } from '../api.js';
import {
  Cargando,
  ErrorPanel,
  ESTADOS_PERSONALIZACION,
  EstadoBadge,
  Vacio,
  formatoFecha,
  urlImagen,
} from './ui.jsx';

export default function Personalizaciones({ onExpirado }) {
  const [solicitudes, setSolicitudes] = useState(null);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const datos = await api.personalizaciones();
      setSolicitudes(datos.personalizaciones || []);
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    }
  }, [onExpirado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(solicitud, estado) {
    setActualizando(solicitud.id);
    setError('');

    try {
      const actualizada = await api.cambiarEstadoPersonalizacion(solicitud.id, estado);
      setSolicitudes((lista) =>
        lista.map((item) =>
          item.id === solicitud.id ? { ...item, estado: actualizada.estado } : item
        )
      );
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    } finally {
      setActualizando('');
    }
  }

  if (error && !solicitudes) return <ErrorPanel mensaje={error} onReintentar={cargar} />;
  if (!solicitudes) return <Cargando texto="Cargando personalizaciones…" />;

  if (solicitudes.length === 0) {
    return (
      <section className="panel">
        <Vacio>Todavía no hay solicitudes de personalización.</Vacio>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Personalizaciones ({solicitudes.length})</h2>
      </div>

      {error && <p className="panel-error compacto">{error}</p>}

      <div className="grid-personalizaciones">
        {solicitudes.map((solicitud) => (
          <article key={solicitud.id} className="personalizacion-card">
            <div className="personalizacion-cabecera">
              <div>
                <span className="etiqueta-tipo">{solicitud.tipo}</span>
                <strong>{solicitud.nombre}</strong>
                <span className="texto-suave">{solicitud.email}</span>
                <span className="texto-suave">{solicitud.telefono}</span>
              </div>
              <EstadoBadge estado={solicitud.estado} />
            </div>

            {solicitud.imagen && (
              <a href={urlImagen(solicitud.imagen)} target="_blank" rel="noreferrer" className="personalizacion-imagen">
                <img src={urlImagen(solicitud.imagen)} alt={`Referencia de ${solicitud.nombre}`} loading="lazy" />
              </a>
            )}

            <dl className="personalizacion-datos">
              <div>
                <dt>Talla</dt>
                <dd>{solicitud.talla}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{solicitud.color}</dd>
              </div>
              <div>
                <dt>Detalle</dt>
                <dd>{solicitud.detalle || '—'}</dd>
              </div>
              <div>
                <dt>Notas</dt>
                <dd>{solicitud.notas || '—'}</dd>
              </div>
            </dl>

            <div className="personalizacion-pie">
              <span className="texto-suave">{formatoFecha(solicitud.creadoEn)}</span>
              <select
                value={solicitud.estado}
                onChange={(evento) => cambiarEstado(solicitud, evento.target.value)}
                disabled={actualizando === solicitud.id}
                aria-label={`Cambiar estado de la solicitud ${solicitud.id}`}
              >
                {ESTADOS_PERSONALIZACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

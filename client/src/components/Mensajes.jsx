import { useCallback, useEffect, useState } from 'react';

import { api } from '../api.js';
import { Cargando, ErrorPanel, Vacio, formatoFecha } from './ui.jsx';

export default function Mensajes({ onExpirado }) {
  const [mensajes, setMensajes] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const datos = await api.mensajes();
      setMensajes(datos.mensajes || []);
    } catch (fallo) {
      if (fallo.status === 401) return onExpirado();
      setError(fallo.message);
    }
  }, [onExpirado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <ErrorPanel mensaje={error} onReintentar={cargar} />;
  if (!mensajes) return <Cargando texto="Cargando mensajes…" />;

  if (mensajes.length === 0) {
    return (
      <section className="panel">
        <Vacio>Todavía no hay mensajes de contacto.</Vacio>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Mensajes ({mensajes.length})</h2>
      </div>

      <ul className="lista-mensajes">
        {mensajes.map((mensaje) => (
          <li key={mensaje.id} className="mensaje-card">
            <div className="mensaje-cabecera">
              <div>
                <strong>{mensaje.nombre}</strong>
                <a href={`mailto:${mensaje.email}`}>{mensaje.email}</a>
              </div>
              <span className="texto-suave">{formatoFecha(mensaje.creadoEn)}</span>
            </div>
            <p>{mensaje.mensaje}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

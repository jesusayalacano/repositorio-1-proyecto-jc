import { useCallback, useState } from 'react';

import { api } from '../api.js';
import Resumen from './Resumen.jsx';
import Productos from './Productos.jsx';
import Pedidos from './Pedidos.jsx';
import Mensajes from './Mensajes.jsx';
import Personalizaciones from './Personalizaciones.jsx';

const SECCIONES = [
  { id: 'resumen', titulo: 'Resumen', icono: '▦' },
  { id: 'productos', titulo: 'Productos', icono: '◫' },
  { id: 'pedidos', titulo: 'Pedidos', icono: '▤' },
  { id: 'mensajes', titulo: 'Mensajes', icono: '✉' },
  { id: 'personalizaciones', titulo: 'Personalizaciones', icono: '✦' },
];

export default function Dashboard({ usuario, onSalir }) {
  const [seccion, setSeccion] = useState('resumen');
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    try {
      await api.logout();
    } catch {
      // Aunque falle el logout remoto, cerramos la sesión local.
    } finally {
      onSalir();
    }
  }

  const manejarExpiracion = useCallback(() => {
    onSalir();
  }, [onSalir]);

  const activa = SECCIONES.find((item) => item.id === seccion);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-marca" href="/">
          dunk labs <span>admin</span>
        </a>

        <nav className="admin-nav" aria-label="Secciones del panel">
          {SECCIONES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === seccion ? 'activo' : ''}
              onClick={() => setSeccion(item.id)}
            >
              <span aria-hidden="true">{item.icono}</span>
              {item.titulo}
            </button>
          ))}
        </nav>

        <div className="admin-usuario">
          <p>{usuario.nombre}</p>
          <span>{usuario.email}</span>
          <button type="button" className="btn btn-secundario" onClick={salir} disabled={saliendo}>
            {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      <div className="admin-contenido">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Panel de administración</p>
            <h1>{activa.titulo}</h1>
          </div>
          <a className="btn btn-secundario" href="/" target="_blank" rel="noreferrer">
            Ver tienda ↗
          </a>
        </header>

        <main className="admin-main">
          {seccion === 'resumen' && <Resumen onExpirado={manejarExpiracion} />}
          {seccion === 'productos' && <Productos onExpirado={manejarExpiracion} />}
          {seccion === 'pedidos' && <Pedidos onExpirado={manejarExpiracion} />}
          {seccion === 'mensajes' && <Mensajes onExpirado={manejarExpiracion} />}
          {seccion === 'personalizaciones' && (
            <Personalizaciones onExpirado={manejarExpiracion} />
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

import { api } from '../api.js';
import AccesoDenegado from './components/AccesoDenegado.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    let activo = true;

    api
      .me()
      .then(({ usuario }) => {
        if (activo) setUsuario(usuario);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (usuario === undefined) {
    return (
      <main className="pantalla-centrada">
        <p className="cargando">Comprobando sesión…</p>
      </main>
    );
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  if (usuario.rol !== 'admin') {
    return <AccesoDenegado usuario={usuario} onSalir={() => setUsuario(null)} />;
  }

  return <Dashboard usuario={usuario} onSalir={() => setUsuario(null)} />;
}

import { useEffect, useState } from 'react';

import { api } from './api.js';
import CuentaAcceso from './components/CuentaAcceso.jsx';
import CuentaPanel from './components/CuentaPanel.jsx';
import Footer from './components/Footer.jsx';
import HeaderCatalogo from './components/HeaderCatalogo.jsx';

export default function CuentaApp() {
  const [usuario, setUsuario] = useState(undefined);
  const [errorSesion, setErrorSesion] = useState('');
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    let activo = true;

    api
      .me()
      .then(({ usuario: usuarioActual }) => {
        if (activo) setUsuario(usuarioActual);
      })
      .catch((fallo) => {
        if (!activo) return;

        setUsuario(null);

        if (fallo.status !== 401) {
          setErrorSesion('No se pudo comprobar la sesión. Revisa que el backend esté encendido.');
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  async function salir() {
    setSaliendo(true);

    try {
      await api.logout();
    } catch {
      // Aunque falle el logout remoto, cerramos la sesión local.
    } finally {
      setUsuario(null);
      setSaliendo(false);
    }
  }

  return (
    <>
      <HeaderCatalogo />
      <main className="cuenta-main">
        <section className="cuenta-intro">
          <p className="eyebrow">Mi cuenta</p>
          <h2>Tu espacio en dunk labs</h2>
          <p className="cuenta-texto">
            Inicia sesión para identificarte en la tienda. También puedes crear una cuenta
            nueva con tu correo en pocos segundos.
          </p>
          <ul className="cuenta-beneficios">
            <li>Acceso con correo y contraseña.</li>
            <li>Tu cuenta es independiente del panel de administración.</li>
            <li>Puedes cerrar sesión cuando quieras.</li>
          </ul>
        </section>

        <section className="cuenta-panel">
          {usuario === undefined ? (
            <p className="cargando">Comprobando sesión…</p>
          ) : usuario ? (
            <CuentaPanel usuario={usuario} onSalir={salir} saliendo={saliendo} />
          ) : (
            <>
              {errorSesion && (
                <p className="cuenta-error" role="alert">
                  {errorSesion}
                </p>
              )}
              <CuentaAcceso onAcceso={setUsuario} />
            </>
          )}
        </section>
      </main>
      <Footer enCatalogo />
    </>
  );
}

import { useState } from 'react';

import { api } from '../../api.js';

export default function AccesoDenegado({ usuario, onSalir }) {
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

  return (
    <main className="login-layout">
      <section className="login-marca">
        <p className="login-eyebrow">dunk labs · panel interno</p>
        <h1>
          Acceso restringido
          <span>solo para administradores.</span>
        </h1>
        <p className="login-texto">
          La cuenta {usuario.email} no tiene permisos para gestionar la tienda.
        </p>
        <a className="login-volver" href="/">
          ← Volver a la tienda
        </a>
      </section>

      <section className="login-panel">
        <div className="login-form">
          <h2>No puedes entrar</h2>
          <p className="login-ayuda">
            Inicia sesión con una cuenta de administrador para acceder al panel.
          </p>
          <a className="btn btn-primario" href="/cuenta">
            Ir a mi cuenta
          </a>
          <button type="button" className="btn btn-secundario" onClick={salir} disabled={saliendo}>
            {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </section>
    </main>
  );
}

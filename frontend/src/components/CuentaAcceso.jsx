import { useState } from 'react';

import { api } from '../api.js';

const DATOS_INICIALES = {
  nombre: '',
  email: '',
  password: '',
};

export default function CuentaAcceso({ onAcceso }) {
  const [modo, setModo] = useState('login');
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError('');
    setDatos((anteriores) => ({ ...anteriores, password: '' }));
  }

  async function enviar(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const respuesta =
        modo === 'login'
          ? await api.login(datos.email.trim(), datos.password)
          : await api.registro({
              nombre: datos.nombre.trim(),
              email: datos.email.trim(),
              password: datos.password,
            });

      onAcceso(respuesta.usuario);
    } catch (fallo) {
      setError(
        fallo.message === 'Failed to fetch'
          ? 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.'
          : fallo.message
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="cuenta-tabs" role="tablist" aria-label="Acceso a la cuenta">
        <button
          type="button"
          className={`cuenta-tab${modo === 'login' ? ' activo' : ''}`}
          onClick={() => cambiarModo('login')}
          aria-pressed={modo === 'login'}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className={`cuenta-tab${modo === 'registro' ? ' activo' : ''}`}
          onClick={() => cambiarModo('registro')}
          aria-pressed={modo === 'registro'}
        >
          Crear cuenta
        </button>
      </div>

      <form className="formulario cuenta-form" onSubmit={enviar}>
        {modo === 'registro' && (
          <label>
            Nombre
            <input
              name="nombre"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={datos.nombre}
              onChange={cambiarCampo}
            />
          </label>
        )}

        <label>
          Correo
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            value={datos.email}
            onChange={cambiarCampo}
          />
        </label>

        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={modo === 'registro' ? 8 : undefined}
            maxLength={128}
            value={datos.password}
            onChange={cambiarCampo}
          />
        </label>

        {modo === 'registro' && (
          <p className="cuenta-nota">La contraseña debe tener al menos 8 caracteres.</p>
        )}

        {error && (
          <p className="cuenta-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando
            ? 'Procesando…'
            : modo === 'login'
              ? 'Entrar a mi cuenta'
              : 'Crear mi cuenta'}
        </button>
      </form>
    </>
  );
}

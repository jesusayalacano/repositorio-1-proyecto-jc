import { useState } from 'react';

import { api } from '../../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@dunklabs.co');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const { usuario } = await api.login(email.trim(), password);
      onLogin(usuario);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-marca">
        <p className="login-eyebrow">dunk labs · panel interno</p>
        <h1>
          Controla la tienda
          <span>desde un solo lugar.</span>
        </h1>
        <p className="login-texto">
          Productos, pedidos, mensajes y personalizaciones. Todo lo que pasa en Dunk Labs,
          en tiempo real.
        </p>
        <a className="login-volver" href="/">
          ← Volver a la tienda
        </a>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={enviar}>
          <h2>Iniciar sesión</h2>
          <p className="login-ayuda">Acceso exclusivo para administradores.</p>

          <label>
            Correo
            <input
              type="email"
              name="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar al panel'}
          </button>

          <p className="login-demo">
            Las credenciales del panel están definidas en <code>backend/.env</code>.
          </p>
        </form>
      </section>
    </main>
  );
}

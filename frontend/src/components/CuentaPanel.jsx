export default function CuentaPanel({ usuario, onSalir, saliendo }) {
  const esAdmin = usuario.rol === 'admin';

  return (
    <div className="cuenta-sesion">
      <p className="cuenta-eyebrow">Sesión iniciada</p>
      <h2>Hola, {usuario.nombre}</h2>
      <p className="cuenta-texto">
        {esAdmin
          ? 'Entraste con una cuenta de administrador. Puedes ir al panel para gestionar la tienda.'
          : 'Tu cuenta de cliente está activa. Ya puedes volver al catálogo y seguir comprando.'}
      </p>

      <dl className="cuenta-datos">
        <div>
          <dt>Nombre</dt>
          <dd>{usuario.nombre}</dd>
        </div>
        <div>
          <dt>Correo</dt>
          <dd>{usuario.email}</dd>
        </div>
        <div>
          <dt>Tipo de cuenta</dt>
          <dd>{esAdmin ? 'Administrador' : 'Cliente'}</dd>
        </div>
      </dl>

      <div className="cuenta-acciones">
        <a className="btn-primario" href={esAdmin ? '/admin/' : '/catalogo'}>
          {esAdmin ? 'Ir al panel admin' : 'Ir al catálogo'}
        </a>
        <button type="button" className="btn-secundario" onClick={onSalir} disabled={saliendo}>
          {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}

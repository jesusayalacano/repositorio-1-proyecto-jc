export default function Footer({ id, enCatalogo = false }) {
  const prefijo = enCatalogo ? '/#' : '#';

  return (
    <footer id={id}>
      <div className="footer-grid">
        <div className="footer-marca">
          <p className="footer-logo">dunk labs</p>
          <p>Equipamiento de baloncesto para jugadores que van en serio.</p>
        </div>
        <div className="footer-contacto">
          <p className="footer-titulo">Contacto</p>
          <p>Bogotá, Colombia</p>
          <p>
            <a href={`${prefijo}contacto`}>Escríbenos</a>
          </p>
        </div>
        <div className="footer-enlaces">
          <p className="footer-titulo">Explora</p>
          <a href="/">Inicio</a>
          <a href="/catalogo">Catálogo</a>
          <a href="/cuenta">Mi cuenta</a>
          <a href={`${prefijo}personalizacion`}>Personalización</a>
          <a href={`${prefijo}contacto`}>Contacto</a>
          <a href="/admin/">Panel admin</a>
        </div>
      </div>
      <p className="footer-copy">© 2026 dunk labs. Todos los derechos reservados.</p>
    </footer>
  );
}

import { useEffect, useId, useRef, useState } from 'react';

export default function HeaderBase({ enlaces, cta }) {
  const [abierto, setAbierto] = useState(false);
  const headerRef = useRef(null);
  const botonRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!abierto) return undefined;

    const media = window.matchMedia('(min-width: 851px)');

    function cerrarConEscape(event) {
      if (event.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }

    function cerrarAlTocarFuera(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setAbierto(false);
      }
    }

    function cerrarEnEscritorio(event) {
      if (event.matches) setAbierto(false);
    }

    document.addEventListener('keydown', cerrarConEscape);
    document.addEventListener('pointerdown', cerrarAlTocarFuera);
    media.addEventListener('change', cerrarEnEscritorio);

    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.removeEventListener('pointerdown', cerrarAlTocarFuera);
      media.removeEventListener('change', cerrarEnEscritorio);
    };
  }, [abierto]);

  return (
    <header ref={headerRef} className={abierto ? 'header-menu-abierto' : undefined}>
      <h1>
        <a href="/">dunk labs</a>
      </h1>

      <button
        ref={botonRef}
        type="button"
        className="menu-boton"
        aria-expanded={abierto}
        aria-controls={menuId}
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="menu-icono" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <nav id={menuId} className={`menu-principal${abierto ? ' abierto' : ''}`} aria-label="Navegación principal">
        <ul>
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <a href={enlace.href} onClick={() => setAbierto(false)}>
                {enlace.texto}
              </a>
            </li>
          ))}
        </ul>

        <a className="btn-catalogo btn-catalogo-menu" href={cta.href} onClick={() => setAbierto(false)}>
          {cta.texto}
        </a>
      </nav>

      <a className="btn-catalogo btn-catalogo-escritorio" href={cta.href}>
        {cta.texto}
      </a>
    </header>
  );
}

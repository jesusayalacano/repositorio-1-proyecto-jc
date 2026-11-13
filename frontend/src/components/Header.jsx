export default function Header() {
  return (
    <header>
      <h1>
        <a href="/">dunk labs</a>
      </h1>
      <nav>
        <ul>
          <li>
            <a href="/">Inicio</a>
          </li>
          <li>
            <a href="#sobre-nosotros">Nosotros</a>
          </li>
          <li>
            <a href="#productos">Productos</a>
          </li>
          <li>
            <a href="#personalizacion">Personalización</a>
          </li>
          <li>
            <a href="#ofertas">Ofertas</a>
          </li>
          <li>
            <a href="#contacto">Contacto</a>
          </li>
          <li>
            <a href="/cuenta">Mi cuenta</a>
          </li>
        </ul>
      </nav>
      <a href="/catalogo" className="btn-catalogo">
        Ver catálogo
      </a>
    </header>
  );
}

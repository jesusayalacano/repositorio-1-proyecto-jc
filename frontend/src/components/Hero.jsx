export default function Hero() {
  return (
    <section id="hero">
      <p className="eyebrow">Baloncesto · Bogotá</p>
      <h2>
        Equípate para <span className="acento">dominar</span> la cancha
      </h2>
      <p className="hero-texto">
        Balones, zapatillas, camisetas y accesorios para jugadores que no se conforman. Calidad real,
        estilo propio y envíos a todo el país.
      </p>
      <div className="hero-acciones">
        <a className="btn-primario" href="/catalogo">
          Ver catálogo
        </a>
        <a className="btn-secundario" href="#personalizacion">
          Personalizar mi equipo
        </a>
      </div>
      <ul className="hero-datos">
        <li>
          <strong>6</strong>
          <span>categorías</span>
        </li>
        <li>
          <strong>100%</strong>
          <span>baloncesto</span>
        </li>
        <li>
          <strong>CO</strong>
          <span>envíos nacionales</span>
        </li>
      </ul>
    </section>
  );
}

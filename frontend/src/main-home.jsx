import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main>
      <section id="hero">
        <p className="eyebrow">Baloncesto · Bogotá</p>
        <h2>dunk labs</h2>
        <p className="hero-texto">
          Frontend en React listo. La página de inicio se migra en la Fase 3.
        </p>
        <a className="btn-primario" href="/catalogo">
          Ver catálogo
        </a>
      </section>
    </main>
  </StrictMode>
);

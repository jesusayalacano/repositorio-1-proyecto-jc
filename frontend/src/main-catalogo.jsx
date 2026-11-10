import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main>
      <section id="catalogo">
        <h2>Catálogo completo</h2>
        <p className="seccion-intro">Frontend en React listo. El catálogo se migra en la Fase 3.</p>
        <a className="btn-secundario" href="/">
          Volver al inicio
        </a>
      </section>
    </main>
  </StrictMode>
);

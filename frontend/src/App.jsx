import { useState } from 'react';

import Contacto from './components/Contacto.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Ofertas from './components/Ofertas.jsx';
import Personalizacion from './components/Personalizacion.jsx';
import PersonalizacionDialog from './components/PersonalizacionDialog.jsx';
import ProductosDestacados from './components/ProductosDestacados.jsx';
import SobreNosotros from './components/SobreNosotros.jsx';

export default function App() {
  const [tipoPersonalizacion, setTipoPersonalizacion] = useState(null);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreNosotros />
        <ProductosDestacados />
        <Personalizacion onAbrir={setTipoPersonalizacion} />
        <Ofertas />
        <Contacto />
      </main>
      <Footer />
      <PersonalizacionDialog
        abierto={tipoPersonalizacion !== null}
        tipo={tipoPersonalizacion || 'camiseta'}
        onCerrar={() => setTipoPersonalizacion(null)}
      />
    </>
  );
}

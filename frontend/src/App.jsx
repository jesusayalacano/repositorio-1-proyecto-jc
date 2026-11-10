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
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreNosotros />
        <ProductosDestacados />
        <Personalizacion />
        <Ofertas />
        <Contacto />
      </main>
      <Footer />
      <PersonalizacionDialog />
    </>
  );
}

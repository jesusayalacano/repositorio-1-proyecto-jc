import AvisoCarrito from './components/AvisoCarrito.jsx';
import CarritoDialog from './components/CarritoDialog.jsx';
import CarritoFlotante from './components/CarritoFlotante.jsx';
import CatalogoSeccion from './components/CatalogoSeccion.jsx';
import Footer from './components/Footer.jsx';
import HeaderCatalogo from './components/HeaderCatalogo.jsx';

export default function CatalogoApp() {
  return (
    <>
      <HeaderCatalogo />
      <main>
        <CatalogoSeccion />
      </main>
      <Footer id="contacto" enCatalogo />
      <CarritoFlotante />
      <AvisoCarrito />
      <CarritoDialog />
    </>
  );
}

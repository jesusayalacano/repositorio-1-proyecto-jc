import { useEffect, useState } from 'react';

import AvisoCarrito from './components/AvisoCarrito.jsx';
import CarritoDialog from './components/CarritoDialog.jsx';
import CarritoFlotante from './components/CarritoFlotante.jsx';
import CatalogoSeccion from './components/CatalogoSeccion.jsx';
import Footer from './components/Footer.jsx';
import HeaderCatalogo from './components/HeaderCatalogo.jsx';
import productos from './data/productos.js';
import { guardarCarrito, leerCarrito } from './utils/carrito.js';

function buscarProducto(id) {
  return productos.find((producto) => producto.id === id);
}

function carritoInicial() {
  return leerCarrito().flatMap((item) => {
    const producto = buscarProducto(item.id);
    if (!producto || producto.stock <= 0) return [];

    const cantidad = Math.min(item.cantidad, producto.stock);
    return cantidad > 0 ? [{ id: item.id, cantidad }] : [];
  });
}

export default function CatalogoApp() {
  const [carrito, setCarrito] = useState(carritoInicial);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [aviso, setAviso] = useState({ texto: '', id: 0 });

  const itemsCarrito = carrito
    .map((item) => ({ ...item, producto: buscarProducto(item.id) }))
    .filter((item) => item.producto && item.producto.stock > 0)
    .map((item) => ({
      ...item,
      cantidad: Math.min(item.cantidad, item.producto.stock),
    }))
    .filter((item) => item.cantidad > 0);

  const cantidadTotal = itemsCarrito.reduce((suma, item) => suma + item.cantidad, 0);

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  useEffect(() => {
    if (!aviso.texto) return undefined;

    const temporizador = setTimeout(() => {
      setAviso((anterior) => ({ ...anterior, texto: '' }));
    }, 2400);

    return () => clearTimeout(temporizador);
  }, [aviso]);

  function avisar(texto) {
    setAviso((anterior) => ({ texto, id: anterior.id + 1 }));
  }

  function agregarAlCarrito(id) {
    const producto = buscarProducto(id);
    if (!producto || producto.stock <= 0) return;

    const existente = carrito.find((item) => item.id === id);
    const cantidad = existente ? existente.cantidad : 0;

    if (cantidad >= producto.stock) {
      avisar(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`);
      return;
    }

    setCarrito((anteriores) => {
      const item = anteriores.find((linea) => linea.id === id);
      if (item) {
        return anteriores.map((linea) =>
          linea.id === id ? { ...linea, cantidad: linea.cantidad + 1 } : linea
        );
      }
      return [...anteriores, { id, cantidad: 1 }];
    });
    avisar(`Agregado: ${producto.nombre}`);
  }

  function cambiarCantidad(id, cambio) {
    const item = carrito.find((linea) => linea.id === id);
    const producto = buscarProducto(id);
    if (!item || !producto) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    if (nuevaCantidad > producto.stock) {
      avisar(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`);
      return;
    }

    setCarrito((anteriores) =>
      anteriores.map((linea) => (linea.id === id ? { ...linea, cantidad: nuevaCantidad } : linea))
    );
  }

  function eliminarDelCarrito(id) {
    setCarrito((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  return (
    <>
      <HeaderCatalogo />
      <main>
        <CatalogoSeccion onAgregar={agregarAlCarrito} />
      </main>
      <Footer id="contacto" enCatalogo />
      <CarritoFlotante cantidad={cantidadTotal} onAbrir={() => setCarritoAbierto(true)} />
      <AvisoCarrito mensaje={aviso.texto} />
      <CarritoDialog
        abierto={carritoAbierto}
        items={itemsCarrito}
        onCerrar={() => setCarritoAbierto(false)}
        onCambiarCantidad={cambiarCantidad}
        onEliminar={eliminarDelCarrito}
        onVaciar={vaciarCarrito}
      />
    </>
  );
}

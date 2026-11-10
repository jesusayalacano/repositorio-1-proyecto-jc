export default function CarritoFlotante() {
  return (
    <button className="carrito-flotante" id="abrir-carrito" type="button" aria-haspopup="dialog">
      Carrito
      <span id="carrito-contador" className="carrito-contador">
        0
      </span>
    </button>
  );
}

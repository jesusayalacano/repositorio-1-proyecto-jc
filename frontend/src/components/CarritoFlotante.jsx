export default function CarritoFlotante({ cantidad, onAbrir }) {
  return (
    <button
      className="carrito-flotante"
      id="abrir-carrito"
      type="button"
      aria-haspopup="dialog"
      aria-label={cantidad === 0 ? 'Abrir carrito' : `Abrir carrito, ${cantidad} productos`}
      onClick={onAbrir}
    >
      Carrito
      <span id="carrito-contador" className="carrito-contador">
        {cantidad}
      </span>
    </button>
  );
}

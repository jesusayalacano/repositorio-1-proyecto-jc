export default function AvisoCarrito({ mensaje }) {
  return (
    <p
      id="aviso-carrito"
      className={mensaje ? 'aviso-carrito visible' : 'aviso-carrito'}
      role="status"
    >
      {mensaje}
    </p>
  );
}

export const CLAVE_CARRITO = 'dunklabs-carrito';

export function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
    if (!Array.isArray(guardado)) return [];

    return guardado.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch {
    // Si el navegador bloquea localStorage, el carrito sigue en memoria.
  }
}

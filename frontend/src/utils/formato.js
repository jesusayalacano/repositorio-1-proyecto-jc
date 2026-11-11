// Utilidades compartidas por las tarjetas de producto.
export const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function urlImagen(valor) {
  if (!valor) return '';
  if (/^(https?:)?\/\//i.test(valor) || valor.startsWith('/') || valor.startsWith('data:')) {
    return valor;
  }
  return `/${valor}`;
}

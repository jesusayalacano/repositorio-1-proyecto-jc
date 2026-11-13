export const CATEGORIAS = [
  'balones',
  'zapatillas',
  'camisetas',
  'mochilas',
  'accesorios',
  'tableros',
];

export const ESTADOS_PEDIDO = [
  'pendiente',
  'confirmado',
  'enviado',
  'entregado',
  'cancelado',
];

export const ESTADOS_PERSONALIZACION = ['pendiente', 'contactado', 'cerrado'];

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function urlImagen(valor) {
  if (!valor) return '';
  if (/^(https?:)?\/\//i.test(valor) || valor.startsWith('data:')) {
    return valor;
  }
  if (valor.startsWith('/uploads/')) {
    return `${API_URL}${valor}`;
  }
  if (valor.startsWith('/')) {
    return valor;
  }
  return `/${valor}`;
}

export const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatoFecha(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(valor));
}

export function Cargando({ texto = 'Cargando…' }) {
  return <p className="cargando">{texto}</p>;
}

export function ErrorPanel({ mensaje, onReintentar }) {
  return (
    <div className="panel-error" role="alert">
      <p>{mensaje}</p>
      {onReintentar && (
        <button type="button" className="btn btn-secundario" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ children }) {
  return <p className="vacio">{children}</p>;
}

export function EstadoBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{estado}</span>;
}

export function Aviso({ texto }) {
  if (!texto) return null;
  return (
    <p className="aviso" role="status">
      {texto}
    </p>
  );
}

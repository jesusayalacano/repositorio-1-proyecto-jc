import { useEffect } from 'react';

// Bloquea el scroll del cuerpo mientras un diálogo modal está abierto.
export default function useBloquearScroll(activo) {
  useEffect(() => {
    if (!activo) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [activo]);
}

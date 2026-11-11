import { useEffect, useRef, useState } from 'react';

import { crearPersonalizacion } from '../api.js';
import useBloquearScroll from '../hooks/useBloquearScroll.js';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

const NOMBRES = {
  camiseta: { titulo: 'Personalizar camiseta', producto: 'Camiseta' },
  zapatillas: { titulo: 'Personalizar zapatillas', producto: 'Zapatillas' },
};

const COLORES = [
  { nombre: 'Negro', hex: '#0d0d0d' },
  { nombre: 'Blanco', hex: '#f7f8f5' },
  { nombre: 'Rojo', hex: '#c62828' },
  { nombre: 'Azul', hex: '#1565c0' },
  { nombre: 'Verde', hex: '#2e7d32' },
  { nombre: 'Naranja', hex: '#ff5c00' },
  { nombre: 'Morado', hex: '#6a1b9a' },
  { nombre: 'Amarillo', hex: '#d6ff3f' },
];

const DATOS_INICIALES = {
  nombre: '',
  email: '',
  telefono: '',
  talla: '',
  detalle: '',
  notas: '',
};

export default function PersonalizacionDialog({ abierto, tipo, onCerrar }) {
  const dialogoRef = useRef(null);
  const inputImagenRef = useRef(null);
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [color, setColor] = useState('Negro');
  const [colorPersonalizado, setColorPersonalizado] = useState('#d6ff3f');
  const [preview, setPreview] = useState('');
  const [estadoImagen, setEstadoImagen] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState('');

  const info = NOMBRES[tipo] || NOMBRES.camiseta;

  useBloquearScroll(abierto);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      dialogo.showModal();
    }

    if (!abierto && dialogo.open) {
      dialogo.close();
    }
  }, [abierto]);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function limpiarImagen() {
    if (inputImagenRef.current) {
      inputImagenRef.current.value = '';
    }
    setPreview('');
    setEstadoImagen('');
  }

  function cambiarImagen(event) {
    const archivo = event.target.files?.[0];
    setEstadoImagen('');

    if (!archivo) {
      limpiarImagen();
      return;
    }

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      limpiarImagen();
      setEstadoImagen('Usa una imagen JPG, PNG o WebP.');
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      limpiarImagen();
      setEstadoImagen('La imagen no puede pasar de 5 MB.');
      return;
    }

    setPreview(URL.createObjectURL(archivo));
  }

  function cambiarColorPersonalizado(event) {
    const valor = event.target.value;
    setColorPersonalizado(valor);
    setColor(valor);
  }

  function cerrar() {
    setEstado('');
    onCerrar();
  }

  function cerrarAlHacerClic(event) {
    if (event.target === event.currentTarget) {
      cerrar();
    }
  }

  async function enviar(event) {
    event.preventDefault();

    const formulario = event.currentTarget;
    setEnviando(true);
    setEstado('');
    setEstadoImagen('');

    try {
      await crearPersonalizacion(new FormData(formulario));

      setDatos(DATOS_INICIALES);
      setColor('Negro');
      setColorPersonalizado('#d6ff3f');
      limpiarImagen();
      setEstado('Recibimos tu solicitud. Te contactamos para confirmar.');
    } catch (fallo) {
      setEstado(
        fallo.message === 'Failed to fetch'
          ? 'No se pudo enviar. Revisa la conexión.'
          : fallo.message
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <dialog
      ref={dialogoRef}
      id="dialogo-personalizar"
      className="dialogo-personalizar"
      aria-labelledby="personalizar-titulo"
      onClose={cerrar}
      onClick={cerrarAlHacerClic}
    >
      <div className="dialogo-cabecera">
        <h2 id="personalizar-titulo">{info.titulo}</h2>
        <button type="button" className="dialogo-cerrar" id="cerrar-personalizar" onClick={cerrar}>
          Cerrar
        </button>
      </div>

      <form id="form-personalizar" className="formulario" encType="multipart/form-data" onSubmit={enviar}>
        <input type="hidden" name="tipo" id="personalizar-tipo" value={tipo} readOnly />
        <p className="personalizar-producto" id="personalizar-producto">
          {info.producto}
        </p>

        <div className="form-grid">
          <label>
            Nombre
            <input
              name="nombre"
              autoComplete="name"
              required
              minLength={3}
              value={datos.nombre}
              onChange={cambiarCampo}
            />
          </label>
          <label>
            Correo
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={datos.email}
              onChange={cambiarCampo}
            />
          </label>
          <label>
            Teléfono
            <input
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
              value={datos.telefono}
              onChange={cambiarCampo}
            />
          </label>
          <label>
            Talla
            <input
              name="talla"
              required
              placeholder="S, M, L o 40"
              value={datos.talla}
              onChange={cambiarCampo}
            />
          </label>
        </div>

        <fieldset className="color-campo">
          <legend>Color</legend>
          <div className="colores" role="group" aria-label="Elegir color">
            {COLORES.map((opcion) => (
              <button
                key={opcion.nombre}
                type="button"
                className={color === opcion.nombre ? 'color-opcion activo' : 'color-opcion'}
                data-color={opcion.nombre}
                aria-pressed={color === opcion.nombre}
                onClick={() => setColor(opcion.nombre)}
              >
                <span style={{ '--color': opcion.hex }} />
                {opcion.nombre}
              </button>
            ))}
          </div>
          <label className="color-personalizado">
            Otro color
            <input
              type="color"
              id="color-personalizado"
              value={colorPersonalizado}
              onChange={cambiarColorPersonalizado}
            />
          </label>
          <input type="hidden" name="color" id="color-seleccionado" value={color} readOnly />
        </fieldset>

        <div className="form-grid">
          <label>
            Nombre o número
            <input
              name="detalle"
              placeholder="Ej: AYALA 23"
              maxLength={40}
              value={datos.detalle}
              onChange={cambiarCampo}
            />
          </label>
          <label>
            Notas
            <input
              name="notas"
              placeholder="Ej: logo en la espalda"
              maxLength={120}
              value={datos.notas}
              onChange={cambiarCampo}
            />
          </label>
        </div>

        <div className="campo-imagen">
          <p className="etiqueta-campo">Imagen de referencia</p>
          <div className="imagen-acciones">
            <label htmlFor="imagen-personalizacion" className="btn-subir">
              Subir imagen
            </label>
            <input
              ref={inputImagenRef}
              id="imagen-personalizacion"
              className="input-archivo"
              name="imagen"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={cambiarImagen}
            />
            <button
              type="button"
              id="quitar-imagen"
              className="btn-quitar-imagen"
              hidden={!preview}
              onClick={limpiarImagen}
            >
              Quitar imagen
            </button>
          </div>
          <p className="ayuda-campo">JPG, PNG o WebP. Máximo 5 MB.</p>
          <img
            id="preview-personalizacion"
            className="preview-personalizacion"
            src={preview || undefined}
            alt="Vista previa de la imagen"
            hidden={!preview}
          />
          <p id="imagen-estado" className="form-estado" role="status">
            {estadoImagen}
          </p>
        </div>

        <button type="submit" className="btn-primario" id="boton-personalizar" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar solicitud'}
        </button>
        <p id="personalizar-estado" className="form-estado" role="status">
          {estado}
        </p>
      </form>
    </dialog>
  );
}

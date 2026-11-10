import { useState } from 'react';

import { CATEGORIAS, urlImagen } from './ui.jsx';

function soloDatos(producto) {
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    categoria: producto.categoria,
    stock: Number(producto.stock),
    imagen: producto.imagen,
    etiqueta: producto.etiqueta,
  };
}

export default function ProductoForm({ valorInicial, onGuardar, onCancelar, guardando }) {
  const [datos, setDatos] = useState({ ...valorInicial });
  const [imagenPreview, setImagenPreview] = useState(urlImagen(valorInicial.imagen));
  const editando = Boolean(valorInicial.id);

  function cambiar(campo) {
    return (evento) => setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    onGuardar({ ...soloDatos(datos), ...(editando ? { id: valorInicial.id } : {}) });
  }

  return (
    <form className="panel form-producto" onSubmit={enviar}>
      <div className="panel-cabecera">
        <h2>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
      </div>

      <div className="form-grid-dos">
        <label className="campo-ancho">
          Nombre
          <input
            name="nombre"
            value={datos.nombre}
            onChange={cambiar('nombre')}
            maxLength={120}
            required
          />
        </label>

        <label>
          Categoría
          <select name="categoria" value={datos.categoria} onChange={cambiar('categoria')} required>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        <label>
          Precio (COP)
          <input
            name="precio"
            type="number"
            min="0"
            step="500"
            value={datos.precio}
            onChange={cambiar('precio')}
            required
          />
        </label>

        <label>
          Stock
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            value={datos.stock}
            onChange={cambiar('stock')}
            required
          />
        </label>

        <label>
          Etiqueta (opcional)
          <input
            name="etiqueta"
            value={datos.etiqueta || ''}
            onChange={cambiar('etiqueta')}
            maxLength={40}
            placeholder="Ej: Nuevo, Oferta"
          />
        </label>

        <label className="campo-ancho">
          Descripción
          <textarea
            name="descripcion"
            rows="3"
            value={datos.descripcion || ''}
            onChange={cambiar('descripcion')}
            maxLength={500}
          />
        </label>

        <label className="campo-ancho">
          Imagen (ruta o URL)
          <input
            name="imagen"
            value={datos.imagen || ''}
            onChange={cambiar('imagen')}
            onBlur={() => setImagenPreview(urlImagen(datos.imagen))}
            placeholder="/images/producto.webp o https://…"
          />
          <span className="ayuda-campo">
            Usa una ruta de <code>/images/</code> o un enlace directo a la imagen.
          </span>
        </label>
      </div>

      <div className="preview-producto">
        {imagenPreview ? (
          <img
            key={imagenPreview}
            src={imagenPreview}
            alt="Vista previa del producto"
            onError={(evento) => {
              evento.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="preview-vacio">Sin imagen</span>
        )}
        <span>Vista previa</span>
      </div>

      <div className="form-acciones">
        <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}

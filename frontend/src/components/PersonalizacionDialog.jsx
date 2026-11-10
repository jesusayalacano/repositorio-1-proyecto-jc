export default function PersonalizacionDialog() {
  return (
    <dialog
      id="dialogo-personalizar"
      className="dialogo-personalizar"
      aria-labelledby="personalizar-titulo"
    >
      <div className="dialogo-cabecera">
        <h2 id="personalizar-titulo">Personalizar camiseta</h2>
        <button type="button" className="dialogo-cerrar" id="cerrar-personalizar">
          Cerrar
        </button>
      </div>

      <form id="form-personalizar" className="formulario" encType="multipart/form-data">
        <input type="hidden" name="tipo" id="personalizar-tipo" defaultValue="camiseta" />
        <p className="personalizar-producto" id="personalizar-producto">
          Camiseta
        </p>

        <div className="form-grid">
          <label>
            Nombre
            <input name="nombre" autoComplete="name" required minLength={3} />
          </label>
          <label>
            Correo
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Teléfono
            <input name="telefono" type="tel" autoComplete="tel" required />
          </label>
          <label>
            Talla
            <input name="talla" required placeholder="S, M, L o 40" />
          </label>
        </div>

        <fieldset className="color-campo">
          <legend>Color</legend>
          <div className="colores" role="group" aria-label="Elegir color">
            <button
              type="button"
              className="color-opcion activo"
              data-color="Negro"
              aria-pressed="true"
            >
              <span style={{ '--color': '#0d0d0d' }} />
              Negro
            </button>
            <button type="button" className="color-opcion" data-color="Blanco" aria-pressed="false">
              <span style={{ '--color': '#f7f8f5' }} />
              Blanco
            </button>
            <button type="button" className="color-opcion" data-color="Rojo" aria-pressed="false">
              <span style={{ '--color': '#c62828' }} />
              Rojo
            </button>
            <button type="button" className="color-opcion" data-color="Azul" aria-pressed="false">
              <span style={{ '--color': '#1565c0' }} />
              Azul
            </button>
            <button type="button" className="color-opcion" data-color="Verde" aria-pressed="false">
              <span style={{ '--color': '#2e7d32' }} />
              Verde
            </button>
            <button type="button" className="color-opcion" data-color="Naranja" aria-pressed="false">
              <span style={{ '--color': '#ff5c00' }} />
              Naranja
            </button>
            <button type="button" className="color-opcion" data-color="Morado" aria-pressed="false">
              <span style={{ '--color': '#6a1b9a' }} />
              Morado
            </button>
            <button type="button" className="color-opcion" data-color="Amarillo" aria-pressed="false">
              <span style={{ '--color': '#d6ff3f' }} />
              Amarillo
            </button>
          </div>
          <label className="color-personalizado">
            Otro color
            <input type="color" id="color-personalizado" defaultValue="#d6ff3f" />
          </label>
          <input type="hidden" name="color" id="color-seleccionado" defaultValue="Negro" />
        </fieldset>

        <div className="form-grid">
          <label>
            Nombre o número
            <input name="detalle" placeholder="Ej: AYALA 23" maxLength={40} />
          </label>
          <label>
            Notas
            <input name="notas" placeholder="Ej: logo en la espalda" maxLength={120} />
          </label>
        </div>

        <div className="campo-imagen">
          <p className="etiqueta-campo">Imagen de referencia</p>
          <div className="imagen-acciones">
            <label htmlFor="imagen-personalizacion" className="btn-subir">
              Subir imagen
            </label>
            <input
              id="imagen-personalizacion"
              className="input-archivo"
              name="imagen"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <button type="button" id="quitar-imagen" className="btn-quitar-imagen" hidden>
              Quitar imagen
            </button>
          </div>
          <p className="ayuda-campo">JPG, PNG o WebP. Máximo 5 MB.</p>
          <img
            id="preview-personalizacion"
            className="preview-personalizacion"
            alt="Vista previa de la imagen"
            hidden
          />
          <p id="imagen-estado" className="form-estado" role="status" />
        </div>

        <button type="submit" className="btn-primario" id="boton-personalizar">
          Enviar solicitud
        </button>
        <p id="personalizar-estado" className="form-estado" role="status" />
      </form>
    </dialog>
  );
}

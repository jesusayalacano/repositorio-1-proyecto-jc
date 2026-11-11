export default function Personalizacion({ onAbrir }) {
  return (
    <section id="personalizacion">
      <h2>Crea tu propio estilo</h2>
      <p>
        Elige el color, sube una imagen de referencia y dinos qué nombre o número quieres. Te
        confirmamos por correo o teléfono.
      </p>
      <div className="opciones-personalizar">
        <button type="button" data-personalizar="camiseta" onClick={() => onAbrir('camiseta')}>
          Personalizar Camiseta
        </button>
        <button type="button" data-personalizar="zapatillas" onClick={() => onAbrir('zapatillas')}>
          Personalizar Zapatillas
        </button>
      </div>
    </section>
  );
}

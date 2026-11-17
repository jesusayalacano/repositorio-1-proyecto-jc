import { formatoPrecio, urlImagen } from '../utils/formato.js';

const RUTA_EN_TEXTO =
    /(\/#personalizacion|\/catalogo(?:\?[^\s.,;:!?)]*)?|\/cuenta)/g;
const RUTA_INTERNA =
    /^(\/#personalizacion|\/catalogo(?:\?[^\s.,;:!?)]*)?|\/cuenta)$/;

function TextoConEnlaces({ texto }) {
    const partes = String(texto).split(RUTA_EN_TEXTO);

    return partes.map((parte, indice) => {
        if (!parte) return null;

        if (RUTA_INTERNA.test(parte)) {
            return (
                <a key={`${parte}-${indice}`} href={parte} className="chatbot-enlace">
                    {parte}
                </a>
            );
        }

        return <span key={`texto-${indice}`}>{parte}</span>;
    });
}

export default function ChatMensaje({ mensaje }) {
    const esUsuario = mensaje.role === 'user';
    const texto = String(mensaje.content || '');
    const productos = Array.isArray(mensaje.productos)
        ? mensaje.productos.filter((producto) => Number(producto.stock) > 0)
        : [];
    const mencionaPersonalizacion = /personalizaci[oó]n/i.test(texto);
    const incluyeEnlacePersonalizacion = /\/#personalizacion/.test(texto);

    return (
        <article
            className={`chatbot-mensaje ${
                esUsuario ? 'chatbot-mensaje-usuario' : 'chatbot-mensaje-bot'
            }`}
        >
            <p className="chatbot-texto">
                <TextoConEnlaces texto={texto} />
            </p>

            {!esUsuario && mencionaPersonalizacion && !incluyeEnlacePersonalizacion && (
                <a href="/#personalizacion" className="chatbot-enlace-directo">
                    Ir a personalización
                </a>
            )}

            {productos.length > 0 && (
                <div className="chatbot-productos" aria-label="Productos sugeridos">
                    {productos.map((producto) => (
                        <a
                            className="chatbot-producto"
                            key={producto.id}
                            href={`/catalogo?q=${encodeURIComponent(producto.nombre)}`}
                        >
                            {producto.imagen ? (
                                <img
                                    src={urlImagen(producto.imagen)}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <span className="chatbot-producto-sin-imagen" aria-hidden="true">
                                    DL
                                </span>
                            )}
                            <span className="chatbot-producto-info">
                                <strong>{producto.nombre}</strong>
                                <span>{formatoPrecio.format(Number(producto.precio) || 0)}</span>
                                <span className="chatbot-producto-stock">
                                    {producto.stock > 0
                                        ? `${producto.stock} disponibles`
                                        : 'Agotado'}
                                </span>
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </article>
    );
}

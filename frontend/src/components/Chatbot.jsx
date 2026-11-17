import { useEffect, useRef, useState } from 'react';

import { enviarChat } from '../api.js';
import ChatMensaje from './ChatMensaje.jsx';

const BIENVENIDA = {
    id: 'bienvenida',
    role: 'assistant',
    content:
        '¡Hola! Soy DunkBot, el asistente de dunk labs. Puedo ayudarte a encontrar balones, zapatillas, camisetas, mochilas, tableros o accesorios. ¿Qué estás buscando?',
    local: true,
};

const SUGERENCIAS = [
    'Busco un balón',
    '¿Qué zapatillas me recomiendas?',
    '¿Cómo funciona la personalización?',
    '¿Cómo se confirma el pago?',
];

let contadorMensajes = 0;

function nuevoId(prefijo) {
    contadorMensajes += 1;
    return `${prefijo}-${Date.now()}-${contadorMensajes}`;
}

function historialParaApi(mensajes) {
    return mensajes
        .filter((mensaje) => !mensaje.local)
        .slice(-8)
        .map(({ role, content }) => ({ role, content }));
}

export default function Chatbot() {
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState([BIENVENIDA]);
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const listaRef = useRef(null);
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    const botonRef = useRef(null);
    const enviandoRef = useRef(false);

    const hayConversacion = mensajes.some((mensaje) => mensaje.role === 'user');

    useEffect(() => {
        if (!abierto) return undefined;

        const foco = requestAnimationFrame(() => inputRef.current?.focus());

        return () => cancelAnimationFrame(foco);
    }, [abierto]);

    useEffect(() => {
        if (!abierto) return undefined;

        function manejarTecla(event) {
            if (event.key === 'Escape') {
                setAbierto(false);
                botonRef.current?.focus();
            }
        }

        function cerrarFuera(event) {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                botonRef.current &&
                !botonRef.current.contains(event.target)
            ) {
                setAbierto(false);
            }
        }

        document.addEventListener('keydown', manejarTecla);
        document.addEventListener('pointerdown', cerrarFuera);

        return () => {
            document.removeEventListener('keydown', manejarTecla);
            document.removeEventListener('pointerdown', cerrarFuera);
        };
    }, [abierto]);

    useEffect(() => {
        if (!abierto || !listaRef.current) return;
        listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }, [abierto, mensajes, enviando]);

    async function enviarMensaje(valor) {
        if (enviandoRef.current) return;

        const contenido = String(valor ?? texto).trim();
        if (!contenido) return;

        const mensajeUsuario = {
            id: nuevoId('usuario'),
            role: 'user',
            content: contenido.slice(0, 1000),
        };
        const conversacion = [...mensajes, mensajeUsuario];

        enviandoRef.current = true;
        setMensajes(conversacion);
        setTexto('');
        setError('');
        setEnviando(true);

        try {
            const datos = await enviarChat(historialParaApi(conversacion));
            const respuesta = String(datos?.respuesta || '').trim();

            if (!respuesta) throw new Error('DunkBot no devolvió una respuesta.');

            setMensajes((actuales) => [
                ...actuales,
                {
                    id: nuevoId('bot'),
                    role: 'assistant',
                    content: respuesta,
                    productos: Array.isArray(datos?.productos) ? datos.productos : [],
                },
            ]);
        } catch (fallo) {
            const mensaje =
                fallo.message === 'Failed to fetch' || fallo.message === 'Load failed'
                    ? 'No se pudo conectar con DunkBot. Revisa tu conexión e intenta de nuevo.'
                    : fallo.message || 'No se pudo obtener respuesta.';

            setError(mensaje);
        } finally {
            enviandoRef.current = false;
            setEnviando(false);
        }
    }

    function manejarEnvio(event) {
        event.preventDefault();
        enviarMensaje();
    }

    function manejarTecla(event) {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            enviarMensaje();
        }
    }

    function nuevaConversacion() {
        if (enviandoRef.current) return;

        setMensajes([BIENVENIDA]);
        setTexto('');
        setError('');
        inputRef.current?.focus();
    }

    function cerrarPanel() {
        setAbierto(false);
        botonRef.current?.focus();
    }

    return (
        <div className="chatbot">
            {abierto && (
                <section
                    id="chatbot-panel"
                    ref={panelRef}
                    className="chatbot-panel"
                    role="dialog"
                    aria-label="DunkBot, asistente de dunk labs"
                >
                    <div className="chatbot-cabecera">
                        <div>
                            <p className="chatbot-eyebrow">Asistente Dunk Labs</p>
                            <h2>DunkBot</h2>
                        </div>
                        <div className="chatbot-cabecera-acciones">
                            <button
                                type="button"
                                onClick={nuevaConversacion}
                                disabled={enviando}
                            >
                                Nueva
                            </button>
                            <button
                                type="button"
                                className="chatbot-cerrar"
                                onClick={cerrarPanel}
                                aria-label="Cerrar chat"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>

                    <div
                        ref={listaRef}
                        className="chatbot-mensajes"
                        aria-live="polite"
                        aria-busy={enviando}
                    >
                        {mensajes.map((mensaje) => (
                            <ChatMensaje key={mensaje.id} mensaje={mensaje} />
                        ))}

                        {!hayConversacion && (
                            <div className="chatbot-sugerencias" aria-label="Preguntas rápidas">
                                {SUGERENCIAS.map((sugerencia) => (
                                    <button
                                        key={sugerencia}
                                        type="button"
                                        disabled={enviando}
                                        onClick={() => enviarMensaje(sugerencia)}
                                    >
                                        {sugerencia}
                                    </button>
                                ))}
                            </div>
                        )}

                        {enviando && (
                            <p className="chatbot-escribiendo">DunkBot está escribiendo…</p>
                        )}

                        {error && (
                            <p className="chatbot-error" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <form className="chatbot-formulario" onSubmit={manejarEnvio}>
                        <label className="sr-only" htmlFor="chatbot-entrada">
                            Mensaje para DunkBot
                        </label>
                        <textarea
                            id="chatbot-entrada"
                            ref={inputRef}
                            rows={2}
                            maxLength={1000}
                            value={texto}
                            onChange={(event) => setTexto(event.target.value)}
                            onKeyDown={manejarTecla}
                            placeholder="Escribe tu pregunta…"
                        />
                        <button type="submit" disabled={enviando || !texto.trim()}>
                            {enviando ? 'Enviando…' : 'Enviar'}
                        </button>
                    </form>

                    <p className="chatbot-legal">
                        DunkBot puede equivocarse. Confirma precios y stock en el catálogo.
                    </p>
                </section>
            )}

            <button
                ref={botonRef}
                type="button"
                className="chatbot-boton"
                aria-expanded={abierto}
                aria-controls={abierto ? 'chatbot-panel' : undefined}
                aria-haspopup="dialog"
                aria-label={abierto ? 'Cerrar DunkBot' : 'Abrir DunkBot'}
                onClick={() => setAbierto((anterior) => !anterior)}
            >
                <span aria-hidden="true">✦</span>
                {abierto ? 'Cerrar' : 'DunkBot'}
            </button>
        </div>
    );
}

const dialogoPersonalizar = document.querySelector('#dialogo-personalizar');
const formPersonalizar = document.querySelector('#form-personalizar');
const tituloPersonalizar = document.querySelector('#personalizar-titulo');
const productoPersonalizar = document.querySelector('#personalizar-producto');
const tipoPersonalizar = document.querySelector('#personalizar-tipo');
const botonPersonalizar = document.querySelector('#boton-personalizar');
const estadoPersonalizar = document.querySelector('#personalizar-estado');
const botonesPersonalizar = document.querySelectorAll('[data-personalizar]');
const cerrarPersonalizar = document.querySelector('#cerrar-personalizar');

const botonesColor = document.querySelectorAll('.color-opcion');
const colorSeleccionado = document.querySelector('#color-seleccionado');
const colorPersonalizado = document.querySelector('#color-personalizado');

const inputImagen = document.querySelector('#imagen-personalizacion');
const previewImagen = document.querySelector('#preview-personalizacion');
const quitarImagen = document.querySelector('#quitar-imagen');
const estadoImagen = document.querySelector('#imagen-estado');

const formContacto = document.querySelector('#form-contacto');
const estadoContacto = document.querySelector('#contacto-estado');

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

const nombres = {
    camiseta: { titulo: 'Personalizar camiseta', producto: 'Camiseta' },
    zapatillas: { titulo: 'Personalizar zapatillas', producto: 'Zapatillas' },
};

let tipoActual = 'camiseta';
let urlPreview = null;

function activarColor(valor) {
    colorSeleccionado.value = valor;
    botonesColor.forEach((boton) => {
        const activo = boton.dataset.color === valor;
        boton.classList.toggle('activo', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
}

function limpiarImagen() {
    inputImagen.value = '';
    if (urlPreview) {
        URL.revokeObjectURL(urlPreview);
        urlPreview = null;
    }
    previewImagen.removeAttribute('src');
    previewImagen.hidden = true;
    quitarImagen.hidden = true;
    estadoImagen.textContent = '';
}

function abrirPersonalizacion(tipo) {
    const datos = nombres[tipo] || nombres.camiseta;
    tipoActual = tipo;
    tipoPersonalizar.value = tipo;
    tituloPersonalizar.textContent = datos.titulo;
    productoPersonalizar.textContent = datos.producto;
    estadoPersonalizar.textContent = '';

    if (!dialogoPersonalizar.open) {
        dialogoPersonalizar.showModal();
        document.body.classList.add('dialogo-abierto');
    }
}

function cerrarPersonalizacion() {
    if (dialogoPersonalizar.open) {
        dialogoPersonalizar.close();
    }
}

botonesPersonalizar.forEach((boton) => {
    boton.addEventListener('click', () => {
        abrirPersonalizacion(boton.dataset.personalizar);
    });
});

cerrarPersonalizar.addEventListener('click', cerrarPersonalizacion);

dialogoPersonalizar.addEventListener('close', () => {
    document.body.classList.remove('dialogo-abierto');
});

dialogoPersonalizar.addEventListener('click', (event) => {
    if (event.target === dialogoPersonalizar) cerrarPersonalizacion();
});

botonesColor.forEach((boton) => {
    boton.addEventListener('click', () => {
        activarColor(boton.dataset.color);
    });
});

colorPersonalizado.addEventListener('input', () => {
    colorSeleccionado.value = colorPersonalizado.value;
    botonesColor.forEach((boton) => {
        boton.classList.remove('activo');
        boton.setAttribute('aria-pressed', 'false');
    });
});

inputImagen.addEventListener('change', () => {
    const archivo = inputImagen.files?.[0];
    estadoImagen.textContent = '';

    if (!archivo) {
        limpiarImagen();
        return;
    }

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
        limpiarImagen();
        estadoImagen.textContent = 'Usa una imagen JPG, PNG o WebP.';
        return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
        limpiarImagen();
        estadoImagen.textContent = 'La imagen no puede pasar de 5 MB.';
        return;
    }

    if (urlPreview) {
        URL.revokeObjectURL(urlPreview);
    }

    urlPreview = URL.createObjectURL(archivo);
    previewImagen.src = urlPreview;
    previewImagen.hidden = false;
    quitarImagen.hidden = false;
});

quitarImagen.addEventListener('click', limpiarImagen);

formPersonalizar.addEventListener('submit', async (event) => {
    event.preventDefault();

    botonPersonalizar.disabled = true;
    botonPersonalizar.textContent = 'Enviando...';
    estadoPersonalizar.textContent = '';
    estadoImagen.textContent = '';

    try {
        const respuesta = await fetch('/api/personalizaciones', {
            method: 'POST',
            body: new FormData(formPersonalizar),
        });

        const resultado = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No se pudo enviar la solicitud.');
        }

        formPersonalizar.reset();
        tipoPersonalizar.value = tipoActual;
        activarColor('Negro');
        limpiarImagen();
        estadoPersonalizar.textContent = 'Recibimos tu solicitud. Te contactamos para confirmar.';
    } catch (error) {
        estadoPersonalizar.textContent =
            error.message === 'Failed to fetch'
                ? 'No se pudo enviar. Revisa la conexión.'
                : error.message;
    } finally {
        botonPersonalizar.disabled = false;
        botonPersonalizar.textContent = 'Enviar solicitud';
    }
});

formContacto.addEventListener('submit', async (event) => {
    event.preventDefault();

    const boton = formContacto.querySelector('button[type="submit"]');
    const datos = new FormData(formContacto);

    boton.disabled = true;
    boton.textContent = 'Enviando...';
    estadoContacto.textContent = '';

    try {
        const respuesta = await fetch('/api/contacto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: String(datos.get('nombre') || '').trim(),
                email: String(datos.get('email') || '').trim(),
                mensaje: String(datos.get('mensaje') || '').trim(),
            }),
        });

        const resultado = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No se pudo enviar el mensaje.');
        }

        formContacto.reset();
        estadoContacto.textContent = 'Mensaje enviado. Te respondemos pronto.';
    } catch (error) {
        estadoContacto.textContent =
            error.message === 'Failed to fetch'
                ? 'No se pudo enviar. Revisa la conexión.'
                : error.message;
    } finally {
        boton.disabled = false;
        boton.textContent = 'Enviar mensaje';
    }
});

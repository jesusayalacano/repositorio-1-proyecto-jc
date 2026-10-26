const grid = document.querySelector('#grid-productos');
const textoEstado = document.querySelector('#catalogo-estado');
const plantilla = document.querySelector('#plantilla-producto');

const formatoPrecio = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

let productos = [];

async function cargarProductos() {
    textoEstado.textContent = 'Cargando productos...';

    try {
        const respuesta = await fetch('/api/productos');
        if (!respuesta.ok) throw new Error('La API respondió con un error');

        const datos = await respuesta.json();
        productos = Array.isArray(datos.productos) ? datos.productos : [];
        textoEstado.textContent = '';
        renderProductos();
    } catch (error) {
        textoEstado.textContent = 'No se pudo cargar el catálogo. Abre el sitio con npm start.';
        console.error(error);
    }
}

function renderProductos() {
    grid.replaceChildren();

    if (productos.length === 0) {
        textoEstado.textContent = 'No hay productos cargados.';
        return;
    }

    const fragmento = document.createDocumentFragment();

    for (const producto of productos) {
        const tarjeta = plantilla.content.firstElementChild.cloneNode(true);
        const etiqueta = tarjeta.querySelector('.etiqueta');
        const imagen = tarjeta.querySelector('img');
        const titulo = tarjeta.querySelector('h3');
        const descripcion = tarjeta.querySelector('.descripcion');
        const precio = tarjeta.querySelector('.precio');
        const boton = tarjeta.querySelector('.btn-agregar');

        tarjeta.dataset.id = producto.id;
        tarjeta.dataset.categoria = producto.categoria;

        if (producto.etiqueta) {
            etiqueta.textContent = producto.etiqueta;
            etiqueta.hidden = false;
        }

        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        titulo.textContent = producto.nombre;
        descripcion.textContent = producto.descripcion;
        precio.textContent = formatoPrecio.format(producto.precio);

        boton.dataset.id = producto.id;

        if (producto.stock <= 0) {
            boton.disabled = true;
            boton.textContent = 'Agotado';
        }

        fragmento.append(tarjeta);
    }

    grid.append(fragmento);
}

cargarProductos();

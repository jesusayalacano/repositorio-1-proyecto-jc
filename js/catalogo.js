const grid = document.querySelector('#grid-productos');
const textoEstado = document.querySelector('#catalogo-estado');
const plantilla = document.querySelector('#plantilla-producto');
const buscador = document.querySelector('#buscador');
const conteo = document.querySelector('#resultado-conteo');
const botonesFiltro = document.querySelectorAll('.filtro-btn');

const formatoPrecio = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

let productos = [];
let filtro = 'todos';
let busqueda = '';

function normalizar(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function productosVisibles() {
    return productos.filter((producto) => {
        if (filtro !== 'todos' && producto.categoria !== filtro) return false;
        if (!busqueda) return true;

        const texto = `${producto.nombre} ${producto.descripcion} ${producto.categoria}`;
        return normalizar(texto).includes(busqueda);
    });
}

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
    const visibles = productosVisibles();
    grid.replaceChildren();

    conteo.textContent = `${visibles.length} de ${productos.length} productos`;

    if (visibles.length === 0) {
        textoEstado.textContent = 'No hay productos con ese filtro.';
        return;
    }

    textoEstado.textContent = '';

    const fragmento = document.createDocumentFragment();

    for (const producto of visibles) {
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

botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', () => {
        filtro = boton.dataset.categoria;
        botonesFiltro.forEach((otro) => otro.classList.toggle('activo', otro === boton));
        renderProductos();
    });
});

buscador.addEventListener('input', () => {
    busqueda = normalizar(buscador.value.trim());
    renderProductos();
});

cargarProductos();

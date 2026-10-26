const grid = document.querySelector('#grid-productos');
const textoEstado = document.querySelector('#catalogo-estado');
const plantilla = document.querySelector('#plantilla-producto');
const buscador = document.querySelector('#buscador');
const conteo = document.querySelector('#resultado-conteo');
const botonesFiltro = document.querySelectorAll('.filtro-btn');

const abrirCarrito = document.querySelector('#abrir-carrito');
const dialogoCarrito = document.querySelector('#carrito');
const cerrarCarrito = document.querySelector('#cerrar-carrito');
const seguirComprando = document.querySelector('#seguir-comprando');
const vaciarCarrito = document.querySelector('#vaciar-carrito');
const contadorCarrito = document.querySelector('#carrito-contador');
const itemsCarrito = document.querySelector('#carrito-items');
const carritoVacio = document.querySelector('#carrito-vacio');
const carritoResumen = document.querySelector('#carrito-resumen');
const totalCarrito = document.querySelector('#carrito-total');
const avisoCarrito = document.querySelector('#aviso-carrito');
const plantillaCarrito = document.querySelector('#plantilla-carrito');

const formatoPrecio = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

const CLAVE_CARRITO = 'dunklabs-carrito';

let productos = [];
let carrito = leerCarrito();
let filtro = 'todos';
let busqueda = '';
let temporizadorAviso;

function normalizar(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function leerCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
        if (!Array.isArray(guardado)) return [];

        return guardado.filter(
            (item) =>
                item &&
                typeof item.id === 'string' &&
                Number.isInteger(item.cantidad) &&
                item.cantidad > 0
        );
    } catch {
        return [];
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        // Si el navegador bloquea localStorage, el carrito sigue en memoria.
    }
}

function buscarProducto(id) {
    return productos.find((producto) => producto.id === id);
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
        renderCarrito();
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

function avisar(mensaje) {
    avisoCarrito.textContent = mensaje;
    avisoCarrito.classList.add('visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        avisoCarrito.textContent = '';
        avisoCarrito.classList.remove('visible');
    }, 2400);
}

function actualizarContador() {
    const total = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contadorCarrito.textContent = total;
    abrirCarrito.setAttribute(
        'aria-label',
        total === 0 ? 'Abrir carrito' : `Abrir carrito, ${total} productos`
    );
}

function agregarAlCarrito(id) {
    const producto = buscarProducto(id);
    if (!producto || producto.stock <= 0) return;

    const item = carrito.find((linea) => linea.id === id);
    const cantidad = item ? item.cantidad : 0;

    if (cantidad >= producto.stock) {
        avisar(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`);
        return;
    }

    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({ id, cantidad: 1 });
    }

    guardarCarrito();
    renderCarrito();
    avisar(`Agregado: ${producto.nombre}`);
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find((linea) => linea.id === id);
    const producto = buscarProducto(id);
    if (!item || !producto) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    if (nuevaCantidad > producto.stock) {
        avisar(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`);
        return;
    }

    item.cantidad = nuevaCantidad;
    guardarCarrito();
    renderCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter((item) => item.id !== id);
    guardarCarrito();
    renderCarrito();
}

function renderCarrito() {
    carrito = carrito.filter((item) => {
        const producto = buscarProducto(item.id);
        if (!producto || producto.stock <= 0) return false;

        item.cantidad = Math.min(item.cantidad, producto.stock);
        return item.cantidad > 0;
    });

    guardarCarrito();
    actualizarContador();
    itemsCarrito.replaceChildren();

    if (carrito.length === 0) {
        carritoVacio.hidden = false;
        carritoResumen.hidden = true;
        return;
    }

    carritoVacio.hidden = true;
    carritoResumen.hidden = false;

    const fragmento = document.createDocumentFragment();
    let total = 0;

    for (const item of carrito) {
        const producto = buscarProducto(item.id);
        if (!producto) continue;

        total += producto.precio * item.cantidad;

        const fila = plantillaCarrito.content.firstElementChild.cloneNode(true);
        const imagen = fila.querySelector('img');
        const nombre = fila.querySelector('.carrito-item-nombre');
        const precio = fila.querySelector('.carrito-item-precio');
        const cantidad = fila.querySelector('.carrito-item-cantidad');
        const botonMas = fila.querySelector('[data-accion="mas"]');

        fila.dataset.id = producto.id;
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        nombre.textContent = producto.nombre;
        precio.textContent = formatoPrecio.format(producto.precio);
        cantidad.textContent = item.cantidad;
        botonMas.disabled = item.cantidad >= producto.stock;

        fragmento.append(fila);
    }

    itemsCarrito.append(fragmento);
    totalCarrito.textContent = formatoPrecio.format(total);
}

function abrirDialogo() {
    if (!dialogoCarrito.open) {
        dialogoCarrito.showModal();
        document.body.classList.add('carrito-abierto');
    }
}

function cerrarDialogo() {
    if (dialogoCarrito.open) {
        dialogoCarrito.close();
    }
}

grid.addEventListener('click', (event) => {
    const boton = event.target.closest('.btn-agregar');
    if (!boton) return;
    agregarAlCarrito(boton.dataset.id);
});

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

itemsCarrito.addEventListener('click', (event) => {
    const boton = event.target.closest('button[data-accion]');
    const fila = boton?.closest('.carrito-item');
    if (!boton || !fila) return;

    const id = fila.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === 'mas') cambiarCantidad(id, 1);
    if (accion === 'menos') cambiarCantidad(id, -1);
    if (accion === 'eliminar') eliminarDelCarrito(id);
});

abrirCarrito.addEventListener('click', abrirDialogo);
cerrarCarrito.addEventListener('click', cerrarDialogo);
seguirComprando.addEventListener('click', cerrarDialogo);
vaciarCarrito.addEventListener('click', () => {
    carrito = [];
    guardarCarrito();
    renderCarrito();
});

dialogoCarrito.addEventListener('close', () => {
    document.body.classList.remove('carrito-abierto');
});

dialogoCarrito.addEventListener('click', (event) => {
    if (event.target === dialogoCarrito) cerrarDialogo();
});

actualizarContador();
cargarProductos();

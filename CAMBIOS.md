# Cambios de la migración a React

Este documento resume qué había antes (HTML, CSS y JavaScript directo) y qué hay ahora (React + Vite + API Express). Está pensado para alguien que está empezando con React.

La versión anterior se conserva en `_vanilla-original/`; la aplicación activa está en `frontend/` y `backend/`.

## Antes y ahora, por archivo

| Antes (versión vanilla) | Ahora (React) | Qué cambió |
| --- | --- | --- |
| `index.html` | `frontend/index.html` + `frontend/src/App.jsx` | La página de inicio ahora monta componentes React en `#root`. |
| `catalogo.html` | `frontend/catalogo.html` + `frontend/src/CatalogoApp.jsx` | El catálogo es una entrada separada de Vite, sin React Router. |
| Login de clientes (nuevo) | `frontend/cuenta.html` + `frontend/src/CuentaApp.jsx` | Registro e inicio de sesión de clientes, separado del panel de administración. |
| `styles.css` | `frontend/src/index.css` | Se conservaron las clases, variables y el diseño. |
| `js/inicio.js` | `frontend/src/components/Contacto.jsx`, `PersonalizacionDialog.jsx` y `frontend/src/api.js` | Los formularios usan estado de React y llaman a la API centralizada. |
| `js/catalogo.js` | `CatalogoApp.jsx`, `CatalogoSeccion.jsx`, `ProductoCard.jsx`, `CarritoDialog.jsx` y `utils/carrito.js` | El catálogo, los filtros y el carrito usan estado de React y `localStorage`. |
| `images/` | `frontend/public/images/` | Las imágenes que sirve Vite quedaron en `public/`. |
| API y servidor anterior | `backend/` | Express quedó como API pura; ya no sirve el frontend. |
| Panel de administración anterior | `frontend/src/admin/` | El panel sigue siendo React, pero ahora comparte `frontend/src/api.js` con la tienda. |
| Datos de prueba `frontend/src/data/productos.js` | API `GET /api/productos` | Los productos se cargan desde MongoDB; el archivo de prueba se eliminó. |

## Antes y ahora, por funcionalidad

| Funcionalidad | Antes | Ahora |
| --- | --- | --- |
| Pintar productos | Se creaba HTML con `innerHTML` y plantillas. | `.map()` sobre el estado `productos` y el componente `ProductoCard`. |
| Filtros y búsqueda | Se manipulaban clases y se volvía a pintar el DOM. | Estado `filtro` y `busqueda`; la URL se actualiza con `history.replaceState`. |
| Carrito | Variables globales y actualizaciones manuales del DOM. | `useState` en `CatalogoApp` y persistencia en `localStorage`. |
| Modales | Se abrían y cerraban con `showModal()` y `close()`. | Se conserva `<dialog>`, controlado con `useRef` y el estado `abierto`. |
| Formularios | Se leía `FormData` y se hacía `fetch` directo. | Formularios controlados; las peticiones pasan por `frontend/src/api.js`. |
| Estado de carga y error | Se escribía texto directamente en el DOM. | Estados `cargando` y `error` que React vuelve a renderizar. |
| Pedidos | `fetch('/api/pedidos')` dentro de `catalogo.js`. | `crearPedido()` en `api.js`; el backend valida stock y precios. |
| Contacto | `fetch('/api/contacto')` dentro de `inicio.js`. | `enviarContacto()` en `api.js` y estado del formulario. |
| Personalización | `FormData` con archivo y `fetch` directo. | `crearPersonalizacion()` en `api.js`; el archivo sigue enviándose con `FormData`. |
| Admin | Archivo de API propio con `credentials: 'same-origin'`. | Todo usa `api.js`, `VITE_API_URL` y `credentials: 'include'`. |
| Cuenta de cliente | No existía. | `POST /api/auth/registro` crea usuarios con rol `cliente`; `/cuenta` permite registrarse, iniciar sesión y cerrar sesión. |

## Conceptos de React usados

- **Componente:** una función que devuelve JSX. Por ejemplo, `ProductoCard` devuelve la tarjeta de un producto.
- **Props:** datos que un componente recibe. `ProductoCard` recibe `producto` y `onAgregar`.
- **Estado (`useState`):** datos que cambian y hacen que React vuelva a pintar. El carrito, los filtros y los formularios usan estado.
- **Efectos (`useEffect`):** código que se ejecuta al montar el componente o cuando cambia un valor. Se usa para cargar productos y para guardar el carrito.
- **API centralizada:** `frontend/src/api.js` concentra `fetch`, arma el cuerpo JSON, maneja `FormData`, revisa si la respuesta es correcta y lanza un error cuando falla.
- **Variables de entorno:** Vite expone `VITE_API_URL` al navegador. El backend lee sus propias variables desde `backend/.env`.

## Qué se conservó

- El diseño, los textos, las clases CSS y los identificadores principales.
- Las cuatro entradas separadas: inicio, catálogo, cuenta de clientes y admin.
- MongoDB Atlas, la base `dunklabs`, los modelos y los datos.
- La autenticación del admin con cookie de sesión.
- La validación de stock y precios en el backend.

## Verificación realizada

- `npm run lint` sin errores.
- `npm run build` sin errores.
- Catálogo con **30 productos** cargados desde la API.
- Carrito: agregar producto, abrir el diálogo y crear un pedido.
- Contacto: envío correcto y mensaje de confirmación.
- Personalización: envío correcto sin imagen y mensaje de confirmación.
- Admin: login correcto y carga del resumen.
- Cuenta de cliente: registro correcto con rol `cliente`, login, sesión y logout.
- Un cliente autenticado recibe `403` al intentar entrar a `/api/admin/resumen`.
- Los registros creados durante las pruebas se eliminaron de MongoDB.

## Despliegue en Render

- `render.yaml` define el Web Service del backend y el Static Site del frontend.
- El frontend usa rewrites para `/catalogo`, `/cuenta` y `/admin/*`.
- En producción la cookie usa `Secure` y `SameSite=None` para funcionar entre subdominios.
- `VITE_API_URL` apunta al backend y `FRONTEND_URL` al frontend; ambos se configuran en `render.yaml`.
- Las imágenes de `/uploads` se solicitan al backend usando `VITE_API_URL`.
- Las imágenes de personalizaciones en Render son temporales porque el disco del Web Service no es persistente.
- Build de producción con `VITE_API_URL=https://dunklabs-api-jc.onrender.com` y cookie de producción verificada con `X-Forwarded-Proto: https`.

## Dudas y cosas a tener en cuenta

- **Usa `localhost`, no `127.0.0.1`,** para abrir el frontend. El backend permite por defecto `http://localhost:5173` en `FRONTEND_URL`. Si usas otro origen, cámbialo en `backend/.env`.
- Hay que tener **dos servidores encendidos**: el backend en `3000` y Vite en `5173`. Abrir los HTML con doble clic no funciona.
- El admin no guarda un token en `localStorage`: usa la cookie de sesión del backend. Por eso `api.js` envía `credentials: 'include'`.
- `VITE_API_URL` no debe incluir `/api` al final; `api.js` añade esa parte.
- Las imágenes de producto están en `frontend/public/images/`. Las imágenes que suben los clientes en personalizaciones van a `backend/uploads/`.
- El carrito vive en el navegador (`localStorage`). El backend vuelve a validar el stock y toma los precios del catálogo al crear el pedido.
- La búsqueda y los filtros cambian la URL sin recargar la página, pero no se usa React Router.
- La versión vanilla se movió a `_vanilla-original/` para conservarla como referencia sin mezclarla con la aplicación React.

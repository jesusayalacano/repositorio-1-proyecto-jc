# dunk labs

Tienda de baloncesto. La página de inicio es HTML y CSS. El catálogo carga los productos desde una API hecha con Express.

## Cómo correrlo

```bash
cd server-dk
npm install
npm start
```

Abrir `http://localhost:3000`. El catálogo está en `http://localhost:3000/catalogo`.

El catálogo necesita el servidor porque los productos se piden a `/api/productos`. Si se abre el HTML con doble clic, no carga.

## API

- `GET /api/health`
- `GET /api/productos` (acepta `categoria`, `q` y `disponible`)
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `POST /api/contacto`

## Datos

Los productos están en `server-dk/data/productos.json`. Los pedidos y los mensajes se guardan en la misma carpeta cuando se crean.

## Pendiente

- Login y panel de administración.
- Cambiar los JSON por una base de datos.
- Asistente con IA.
- Publicar el sitio en internet.

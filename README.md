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
- `POST /api/personalizaciones` (multipart: `tipo`, `nombre`, `email`, `telefono`, `talla`, `color`, `detalle`, `notas` e `imagen` opcional)

## Personalización

Los botones de camiseta y zapatillas abren un formulario para elegir color, talla y subir una imagen de referencia. La solicitud se guarda en `server-dk/data/personalizaciones.json` y la imagen en `server-dk/uploads`.

Esas dos rutas se generan al usar la aplicación y están ignoradas por Git. Para publicar en un servidor con disco temporal hay que mover las imágenes a un servicio como Cloudinary.

## Datos

Los productos están en `server-dk/data/productos.json`. Los pedidos, mensajes y personalizaciones se guardan en la misma carpeta cuando se crean.

## Pendiente

- Login y panel de administración.
- Cambiar los JSON por MongoDB Atlas.
- Asistente con IA.
- Publicar el sitio en internet.

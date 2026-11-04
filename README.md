# dunk labs

Tienda de baloncesto. La página de inicio es HTML y CSS. El catálogo carga los productos desde una API hecha con Express y MongoDB Atlas.

## Cómo correrlo

```bash
cd server-dk
npm install
npm run seed
npm start
```

Abrir `http://localhost:3000`. El catálogo está en `http://localhost:3000/catalogo`.

El catálogo necesita el servidor porque los productos se piden a `/api/productos`. Si se abre el HTML con doble clic, no carga.

## MongoDB Atlas

1. Crear un clúster gratuito M0 en Atlas.
2. Crear un usuario de base de datos con permisos de lectura y escritura.
3. En **Network Access**, permitir la IP desde donde se va a conectar.
4. Copiar la cadena `mongodb+srv://...` desde **Connect → Drivers**.
5. Crear `server-dk/.env` a partir de `server-dk/.env.example`.

El `.env` debe tener:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:clave@cluster.mongodb.net/dunklabs?retryWrites=true&w=majority
MONGODB_DB=dunklabs
```

El archivo `.env` no se sube a Git.

Para cargar los 30 productos:

```bash
npm run seed
```

El seed se puede correr varias veces sin duplicar productos. Si se cambió `data/productos.json` y se quieren actualizar los existentes:

```bash
npm run seed -- --force
```

## API

- `GET /api/health`
- `GET /api/productos` (acepta `categoria`, `q` y `disponible`)
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `POST /api/pedidos`
- `POST /api/contacto`
- `POST /api/personalizaciones` (multipart: `tipo`, `nombre`, `email`, `telefono`, `talla`, `color`, `detalle`, `notas` e `imagen` opcional)

## Personalización

Los botones de camiseta y zapatillas abren un formulario para elegir color, talla y subir una imagen de referencia. La solicitud se guarda en MongoDB y la imagen en `server-dk/uploads`.

La carpeta `server-dk/uploads` está ignorada por Git. Para publicar en un servidor con disco temporal hay que mover las imágenes a un servicio como Cloudinary.

## Datos

Los productos se cargan desde `server-dk/data/productos.json` hacia la colección `productos` de MongoDB. Los pedidos, mensajes y personalizaciones se guardan en las colecciones `pedidos`, `mensajes` y `personalizaciones`.

## Pendiente

- Login y panel de administración.
- Proteger los endpoints de administración.
- Asistente con IA.
- Publicar el sitio en internet.
- Guardar las imágenes en Cloudinary o S3.
- Pruebas automatizadas dentro del repositorio.

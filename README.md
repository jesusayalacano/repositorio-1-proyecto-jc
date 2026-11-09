# dunk labs

Tienda de baloncesto. La página de inicio es HTML y CSS. El catálogo carga los productos desde una API hecha con Express y MongoDB Atlas.

## Cómo correrlo

```bash
cd server-dk
npm install
npm run seed
npm run crear-admin   # requiere ADMIN_EMAIL y ADMIN_PASSWORD en .env
npm run build:admin   # compila el panel React
npm start
```

Abrir `http://localhost:3000`. El catálogo está en `http://localhost:3000/catalogo` y el panel admin en `http://localhost:3000/admin`.

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
SESSION_SECRET=una-cadena-larga-y-aleatoria
ADMIN_NOMBRE=Administrador Dunk Labs
ADMIN_EMAIL=admin@dunklabs.co
ADMIN_PASSWORD=define-una-contraseña-segura
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

## Panel de administración

El panel está hecho con React y Vite en `client/`. Se sirve en `http://localhost:3000/admin`.

Credenciales de demostración:

```text
Correo:     admin@dunklabs.co
Contraseña: la definida en server-dk/.env (ADMIN_PASSWORD)
```

El usuario se crea (o se actualiza) con:

```bash
cd server-dk
npm run crear-admin
```

Toma `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` del `.env`. **Cambia estas credenciales antes de publicar el sitio.**

### Compilar el panel

```bash
cd client
npm install
npm run build
```

También se puede compilar desde `server-dk` con `npm run build:admin`.

### Desarrollo con recarga

```bash
cd server-dk
npm start        # API en el puerto 3000
```

```bash
cd client
npm run dev      # Vite en el puerto 5173 con proxy a /api
```

El panel incluye:

- Login con sesión en cookie `httpOnly` y contraseña hasheada con bcrypt.
- Resumen con productos, pedidos pendientes, mensajes y personalizaciones.
- CRUD de productos (la imagen se indica con una ruta `/images/...` o una URL).
- Pedidos con cambio de estado.
- Mensajes de contacto.
- Personalizaciones con vista previa de la imagen y cambio de estado.

## API

Públicas:

- `GET /api/health`
- `GET /api/productos` (acepta `categoria`, `q` y `disponible`)
- `GET /api/productos/:id`
- `POST /api/pedidos`
- `POST /api/contacto`
- `POST /api/personalizaciones` (multipart: `tipo`, `nombre`, `email`, `telefono`, `talla`, `color`, `detalle`, `notas` e `imagen` opcional)

Autenticación:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Protegidas (requieren sesión de administrador):

- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `GET /api/admin/resumen`
- `PUT /api/admin/pedidos/:id/estado`
- `GET /api/admin/mensajes`
- `GET /api/admin/personalizaciones`
- `PUT /api/admin/personalizaciones/:id/estado`

## Personalización

Los botones de camiseta y zapatillas abren un formulario para elegir color, talla y subir una imagen de referencia. La solicitud se guarda en MongoDB y la imagen en `server-dk/uploads`.

La carpeta `server-dk/uploads` está ignorada por Git. Para publicar en un servidor con disco temporal hay que mover las imágenes a un servicio como Cloudinary.

## Datos

Los productos se cargan desde `server-dk/data/productos.json` hacia la colección `productos` de MongoDB. Los pedidos, mensajes y personalizaciones se guardan en las colecciones `pedidos`, `mensajes` y `personalizaciones`.

## Pendiente

- Asistente con IA.
- Publicar el sitio en internet.
- Guardar las imágenes en Cloudinary o S3.
- Pruebas automatizadas dentro del repositorio.
- Cambiar las credenciales demo del panel antes de publicar.

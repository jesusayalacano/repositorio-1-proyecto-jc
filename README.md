# dunk labs

Tienda de baloncesto migrada a **React 19 + Vite** en el frontend y **Express 5 + MongoDB Atlas** en el backend.

La aplicación tiene cuatro entradas:

- `/` → página de inicio.
- `/catalogo` → catálogo y carrito.
- `/cuenta` → registro e inicio de sesión de clientes.
- `/admin/` → panel de administración con login.

## Tecnologías

- React 19, Vite y JavaScript (sin TypeScript).
- Express 5, `node --watch` y MongoDB con Mongoose.
- CSS existente, conservado desde la versión anterior.
- Render para publicar el frontend estático y la API.
- Sin React Router, Redux ni axios: las entradas son páginas HTML de Vite y las llamadas a la API están en `frontend/src/api.js`.

## Estructura

```text
backend/
  src/             API, modelos, rutas y middlewares
  scripts/         seed de productos y creación del administrador
  data/            productos iniciales para el seed
  uploads/         imágenes subidas en personalizaciones (no se versionan)
frontend/
  src/             componentes React, admin y llamadas a la API
  public/images/   imágenes de los productos
  index.html       entrada de la página de inicio
  catalogo.html    entrada del catálogo
  cuenta.html      entrada de la cuenta de clientes
  admin/index.html entrada del panel
render.yaml        Blueprint de Render para API + frontend
```

## Requisitos

- Node.js 18 o superior.
- npm.
- MongoDB Atlas (o una instancia de MongoDB compatible).
- Dos terminales: una para el backend y otra para el frontend.

## Instalación

### 1. Backend

```bash
cd backend
npm install
```

Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edita `backend/.env` con tu cadena de MongoDB y tus datos de administrador. No subas ese archivo a Git.

Carga los productos y crea el administrador:

```bash
npm run seed
npm run crear-admin
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

El archivo `frontend/.env` debe apuntar al backend:

```env
VITE_API_URL=http://localhost:3000
```

## Cómo correrlo

Abre dos terminales.

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Abre:

- Inicio: <http://localhost:5173/>
- Catálogo: <http://localhost:5173/catalogo>
- Cuenta de clientes: <http://localhost:5173/cuenta>
- Admin: <http://localhost:5173/admin/>

La API queda en <http://localhost:3000/api/productos>.

> El catálogo no funciona abriendo `index.html` o `catalogo.html` con doble clic. Necesita Vite y el backend encendidos.

## Variables de entorno

### `backend/.env`

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto del backend. Por defecto `3000`. |
| `NODE_ENV` | `development` o `production`. |
| `FRONTEND_URL` | Origen permitido para CORS. Por defecto `http://localhost:5173`. |
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas. |
| `MONGODB_DB` | Nombre de la base de datos. Por defecto `dunklabs`. |
| `SESSION_SECRET` | Clave larga y aleatoria para firmar la sesión. |
| `ADMIN_NOMBRE` | Nombre visible del administrador. |
| `ADMIN_EMAIL` | Correo del administrador. |
| `ADMIN_PASSWORD` | Contraseña del administrador. |

Los archivos `backend/.env` y `frontend/.env` no se versionan.

### `frontend/.env`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL base del backend, sin `/api` al final. |

## MongoDB

1. Crea un clúster en MongoDB Atlas.
2. Crea un usuario de base de datos con permisos de lectura y escritura.
3. Permite la IP desde la que te vas a conectar.
4. Copia la cadena `mongodb+srv://...` en `MONGODB_URI`.
5. Mantén `MONGODB_DB=dunklabs` para usar la misma base del proyecto.

El seed se puede ejecutar varias veces sin duplicar productos:

```bash
cd backend
npm run seed
```

Si cambias `backend/data/productos.json` y quieres sobrescribir los productos existentes:

```bash
npm run seed -- --force
```

## Panel de administración

El correo y la contraseña se crean con:

```bash
cd backend
npm run crear-admin
```

Toma los valores `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` de `backend/.env`. No hay credenciales escritas en el código ni en este README.

El panel usa una cookie de sesión. Por eso las peticiones del frontend se hacen con `credentials: 'include'` y el backend permite el origen configurado en `FRONTEND_URL`.

## Cuenta de clientes

La página `/cuenta` permite registrarse e iniciar sesión con nombre, correo y contraseña. Los usuarios creados desde el formulario se guardan con el rol `cliente` y no tienen acceso al panel de administración.

El registro es público y no requiere verificación por correo. Para probarlo:

1. Abre <http://localhost:5173/cuenta>.
2. Pulsa “Crear cuenta”.
3. Completa el formulario y vuelve a iniciar sesión si cierras la sesión.

El login de clientes comparte la misma cookie de sesión que el admin, pero las rutas `/api/admin` siguen exigiendo el rol `admin`.

## Build y verificaciones

```bash
cd frontend
npm run lint
npm run build
```

El build queda en `frontend/dist/`. Para producción, sirve ese contenido con un servidor estático y configura `VITE_API_URL` con la URL pública del backend.

## Despliegue en Render

El repositorio incluye `render.yaml` con dos servicios:

- `dunklabs-api-jc`: Web Service de Express.
- `dunklabs-web-jc`: Static Site de React/Vite.

### 1. Preparar MongoDB Atlas

En MongoDB Atlas entra a **Network Access** y permite la conexión desde Render. Para una entrega rápida puedes usar `0.0.0.0/0`; si quieres restringirlo, agrega las IP de salida de Render.

Conserva la base `dunklabs` y ten a mano la cadena `mongodb+srv://...` de `MONGODB_URI`.

### 2. Crear el Blueprint

1. En Render, entra a **New > Blueprint**.
2. Conecta el repositorio `jesusayalacano/repositorio-1-proyecto-jc`.
3. Render leerá `render.yaml` y creará los dos servicios.
4. Cuando lo pida, pega `MONGODB_URI`. `SESSION_SECRET` se genera automáticamente.

Si los nombres `dunklabs-api-jc` o `dunklabs-web-jc` ya están ocupados, Render no podrá crear el Blueprint. En ese caso cambia los nombres en `render.yaml` y actualiza también:

- `FRONTEND_URL` del backend.
- `VITE_API_URL` del frontend.

### 3. Variables del backend

El Web Service usa estas variables:

```env
NODE_ENV=production
MONGODB_URI=tu_cadena_de_atlas
MONGODB_DB=dunklabs
SESSION_SECRET=generada_por_render
FRONTEND_URL=https://dunklabs-web-jc.onrender.com
```

`FRONTEND_URL` debe ser la URL exacta del frontend, sin `/` al final.

### 4. Variables del frontend

El Static Site compila con:

```env
VITE_API_URL=https://dunklabs-api-jc.onrender.com
```

No incluyas `/api` al final: `frontend/src/api.js` la agrega. `VITE_API_URL` se fija al construir el frontend; si cambias la URL del backend, vuelve a desplegar el Static Site.

### 5. Rutas del frontend

`render.yaml` configura los rewrites para que estas rutas funcionen en el dominio estático:

- `/catalogo` → `/catalogo.html`
- `/cuenta` → `/cuenta.html`
- `/admin`, `/admin/` y `/admin/*` → `/admin/index.html`
- Cualquier ruta desconocida → `/index.html`

### 6. Sesión y CORS en producción

Con `NODE_ENV=production` la cookie se marca `Secure` y `SameSite=None`, necesaria porque el frontend y la API quedan en subdominios distintos de Render. El backend también usa `trust proxy` para reconocer HTTPS.

Las peticiones usan `credentials: 'include'` y el backend solo permite el origen configurado en `FRONTEND_URL`. Si cambias de dominio, actualiza esa variable.

### 7. Crear el administrador

El servidor no crea el usuario administrador automáticamente. Puedes crearlo desde tu equipo apuntando `backend/.env` a la misma base de Atlas:

```bash
cd backend
npm run crear-admin
```

También puedes ejecutar ese comando desde la Shell del Web Service en Render, siempre que `MONGODB_URI`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén configuradas.

### 8. Verificar el despliegue

Abre:

- `https://dunklabs-web-jc.onrender.com/`
- `https://dunklabs-web-jc.onrender.com/catalogo`
- `https://dunklabs-web-jc.onrender.com/cuenta`
- `https://dunklabs-web-jc.onrender.com/admin/`
- `https://dunklabs-api-jc.onrender.com/api/health`

Prueba registro, login de cliente, login de admin y un pedido.

### Limitaciones del plan gratuito

- El Web Service gratuito puede dormir; la primera petición puede tardar.
- El disco del backend es temporal: las imágenes de `backend/uploads/` pueden perderse al reiniciar o redesplegar. Para conservarlas, usa un disco persistente de Render o un servicio como Cloudinary.
- El Static Site sigue disponible aunque el backend esté dormido; las llamadas a la API despertarán el backend.

No subas `backend/.env` ni `frontend/.env` a Git. Los secretos se configuran en Render.

## Notas de la migración

- Las imágenes de producto están en `frontend/public/images/`.
- Las imágenes de personalizaciones se guardan en `backend/uploads/` y se sirven desde `/uploads`. En el panel admin, las rutas `/uploads/...` se prefijan con `VITE_API_URL` para que funcionen cuando el frontend está en otro dominio.
- En Render, `backend/uploads/` es temporal; revisa la sección de despliegue si necesitas conservar esas imágenes.
- El carrito se guarda en `localStorage`; el backend valida precios y stock al crear el pedido.
- Los filtros y la búsqueda del catálogo actualizan la URL sin recargar la página.
- La versión anterior en HTML, CSS y JavaScript se conserva en `_vanilla-original/` como referencia. La aplicación activa es la de `frontend/`.

Consulta `CAMBIOS.md` para ver el detalle de qué cambió respecto a la versión anterior.

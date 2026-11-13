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

## Notas de la migración

- Las imágenes de producto están en `frontend/public/images/`.
- Las imágenes de personalizaciones se guardan en `backend/uploads/` y se sirven desde `/uploads`.
- El carrito se guarda en `localStorage`; el backend valida precios y stock al crear el pedido.
- Los filtros y la búsqueda del catálogo actualizan la URL sin recargar la página.
- La versión anterior en HTML, CSS y JavaScript se conserva en `_vanilla-original/` como referencia. La aplicación activa es la de `frontend/`.

Consulta `CAMBIOS.md` para ver el detalle de qué cambió respecto a la versión anterior.

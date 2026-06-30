# Unahur ANti-social Net

## Descripción general

Unahur ANti-social Net es el frontend del trabajo práctico de una red social inspirada en Instagram, desarrollado con React y TypeScript. La aplicación consume una API REST construida con Express y MongoDB, y permite registrar usuarios, iniciar sesión mediante un login simulado, navegar un feed de publicaciones, crear posteos, comentar y visualizar el perfil del usuario activo.

Este repositorio corresponde exclusivamente a la capa de presentación. La persistencia de datos, la lógica de negocio y los endpoints REST se encuentran implementados en el backend asociado.

## Objetivo del proyecto

El objetivo de este trabajo es construir una interfaz web que permita a las personas usuarias interactuar con la API provista por la cátedra o por el equipo de backend, resolviendo los siguientes casos de uso:

- registro de usuario
- inicio de sesión simulado
- visualización del feed
- lectura del detalle de una publicación
- creación de comentarios
- creación de nuevas publicaciones
- consulta del perfil del usuario autenticado
- cambio de tema visual claro y oscuro

## Alcance funcional

La aplicación implementa las siguientes funcionalidades:

- login simulado con `nickName` y contraseña fija `123456`
- persistencia del usuario autenticado con `useContext` y `localStorage`
- rutas protegidas para las vistas privadas
- consumo del feed personalizado de usuarios seguidos
- creación de publicaciones con descripción, etiquetas e imagen por URL
- creación de comentarios sobre publicaciones existentes
- vista de perfil del usuario actual
- cambio de tema claro / oscuro
- simulación local de likes en `localStorage`

## Arquitectura de la solución

La solución está dividida en dos proyectos:

- frontend: `C:\Users\le_ma\Desktop\TP2 CIU`
- backend: `C:\Users\le_ma\Desktop\TP2 EP\anti-social-documental-tp-unahur-data-systems`

### Stack tecnológico

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Base de datos local: MongoDB levantado con Docker Compose

### Relación entre frontend y backend

El frontend consume endpoints REST del backend mediante un servicio centralizado en `src/services/api.ts`. Durante el desarrollo, la comunicación se resuelve con un proxy de Vite para evitar problemas de CORS.

## Requisitos previos

Para ejecutar correctamente el sistema se requiere:

- Node.js 18 o superior
- npm
- Docker Desktop

## Configuración de entorno

### Frontend

El frontend utiliza el archivo [.env](.env) con la siguiente configuración:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:3050
```

Interpretación:

- `VITE_API_BASE_URL=/api` indica que el frontend hará las solicitudes a través del proxy de desarrollo.
- `VITE_BACKEND_URL=http://localhost:3050` define la dirección del backend local.

### Backend

El backend requiere estas variables de entorno:

```env
PORT=3050
MONGO_URL=mongodb://admin:admin123@127.0.0.1:27017/antisocial?authSource=admin
TIEMPO_MAX_COMENTARIO=6
```

## Procedimiento de ejecución

### 1. Levantar el backend

Abrir una terminal en la carpeta del backend:

```powershell
Set-Location "C:\Users\le_ma\Desktop\TP2 EP\anti-social-documental-tp-unahur-data-systems"
```

Instalar dependencias:

```powershell
npm install
```

Levantar MongoDB con Docker Compose:

```powershell
docker compose up -d
```

Opcionalmente, verificar el estado del contenedor:

```powershell
docker compose ps
```

Iniciar la API:

```powershell
npm run dev
```

Si no existe un archivo `.env` configurado en el backend, también puede iniciarse de forma manual con variables temporales de PowerShell:

```powershell
$env:PORT='3050'
$env:MONGO_URL='mongodb://admin:admin123@127.0.0.1:27017/antisocial?authSource=admin'
$env:TIEMPO_MAX_COMENTARIO='6'
npm run dev
```

Verificación sugerida:

- Swagger: `http://localhost:3050/api-docs`
- Endpoint de usuarios: `http://localhost:3050/api/usuarios`

### 2. Levantar el frontend

Abrir una segunda terminal en la carpeta del frontend:

```powershell
Set-Location "C:\Users\le_ma\Desktop\TP2 CIU"
```

Instalar dependencias:

```powershell
npm install
```

Iniciar el servidor de desarrollo:

```powershell
npm run dev
```

Abrir la aplicación en el navegador:

- `http://127.0.0.1:5173/`

## Orden recomendado de arranque

Para una ejecución correcta, se recomienda seguir esta secuencia:

1. abrir Docker Desktop
2. levantar MongoDB desde el backend con `docker compose up -d`
3. iniciar la API con `npm run dev`
4. iniciar el frontend con `npm run dev`
5. abrir `http://127.0.0.1:5173/`

## Usuarios y acceso de prueba

La aplicación no implementa autenticación real ni JWT. El inicio de sesión se resuelve de la siguiente manera:

- usuario: cualquier `nickName` existente en la base de datos
- contraseña: `123456`

Usuarios creados durante la verificación funcional:

- `copilot-feed-viewer`
- `copilot-feed-author`
- `copilot-ui-test`

## Flujo de navegación esperado

1. la persona usuaria ingresa o se registra
2. luego del login se redirige al feed
3. desde el feed puede abrir el detalle de una publicación
4. desde el menú inferior puede navegar al perfil o crear un nuevo post
5. desde el detalle puede agregar comentarios

## Endpoints utilizados por el frontend

La interfaz fue adaptada al contrato real del backend y utiliza los siguientes endpoints:

- `GET /api/usuarios`
- `POST /api/usuarios`
- `GET /api/usuarios/:id/feed`
- `GET /api/posts`
- `GET /api/posts/:postId`
- `POST /api/posts`
- `POST /api/posts/:postId/etiquetas`
- `POST /api/posts/:postId/imagenes`
- `GET /api/comentarios`
- `POST /api/posts/:postId/comentarios`

## Comandos útiles

### Frontend

```powershell
npm run dev
npm run build
npm run lint
```

### Backend

```powershell
npm run dev
docker compose up -d
docker compose down
```

## Criterios de verificación realizados

Durante la validación del sistema se comprobó correctamente:

- inicio de sesión simulado
- carga del feed desde la API
- creación de publicaciones
- creación de comentarios
- navegación entre vistas
- funcionamiento del frontend con el backend real

## Problemas comunes

### El frontend no muestra datos

Verificar:

- que el backend esté corriendo en `http://localhost:3050`
- que MongoDB esté levantado
- que el archivo `.env` del frontend exista y tenga los valores correctos

### El login falla

Verificar:

- que el usuario exista en `GET /api/usuarios`
- que la contraseña usada sea exactamente `123456`

### El feed aparece vacío

Esto no necesariamente indica un error. El backend devuelve el feed personalizado del usuario, por lo que si no sigue a nadie, la respuesta puede llegar vacía.

### Las imágenes no se visualizan

Verificar:

- que el backend esté exponiendo correctamente la ruta `/uploads`
- que la imagen haya sido asociada al post o que la URL cargada sea válida

## Consideraciones finales

Para la exposición o defensa del trabajo práctico, se recomienda ejecutar el sistema con dos terminales abiertas, una para el backend y otra para el frontend, manteniendo ambas instancias activas durante la demostración.

Este README fue redactado con foco en la puesta en marcha, la comprensión general de la arquitectura y la explicación formal del funcionamiento del sistema.

# Unahur ANti-social Net

## Descripción general

Unahur ANti-social Net es el frontend del trabajo práctico de una red social inspirada en Instagram. La aplicación está desarrollada con React, TypeScript y Vite, y consume una API REST provista por un backend en Express y MongoDB.

El alcance de este repositorio es la capa de presentación. Toda la persistencia de datos, la lógica de negocio y los endpoints REST residen en el backend asociado.

## Integrantes

- Comisión: 2
- Felipe López
- Martín Maldonado
- Luis Sebastián Alderete Cuello
- Magalí Gutierrez
- Ary Albarracín

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

- registro de usuario por `nickName`
- inicio de sesión simulado con contraseña fija `123456`
- persistencia de sesión con `useContext` y `localStorage`
- rutas protegidas para las vistas privadas
- feed personalizado según los usuarios seguidos
- visualización del detalle de una publicación
- creación de publicaciones con descripción, etiquetas e imágenes
- edición y eliminación de publicaciones propias
- creación y eliminación de comentarios
- seguimiento y desbloqueo de usuarios desde el perfil
- vista de perfil propio y de otros usuarios
- cambio de tema visual claro / oscuro
- simulación local de likes en `localStorage`

## Arquitectura de la solución

La solución está dividida en dos proyectos:

- frontend: https://github.com/FeliLopez14/CIU-TECH_STORE2
- backend: https://github.com/EP-UnaHur-2026C1/anti-social-documental-tp-unahur-data-systems.git

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

### 1. Clonar y preparar el backend

Repositorio del backend:

- https://github.com/EP-UnaHur-2026C1/anti-social-documental-tp-unahur-data-systems.git

Pasos recomendados:

1. abrir una terminal en la carpeta del backend
2. instalar dependencias con `npm install`
3. levantar MongoDB con `docker compose up -d`
4. iniciar la API con `npm run dev`

Si el backend no tiene un archivo `.env`, también puede iniciarse con variables temporales de PowerShell:

```powershell
$env:PORT='3050'
$env:MONGO_URL='mongodb://admin:admin123@127.0.0.1:27017/antisocial?authSource=admin'
$env:TIEMPO_MAX_COMENTARIO='6'
npm run dev
```

Verificación sugerida:

- Swagger: `http://localhost:3050/api-docs`
- Usuarios: `http://localhost:3050/api/usuarios`
- Feed: `http://localhost:3050/api/usuarios/:id/feed`

### 2. Clonar y preparar el frontend

Repositorio del frontend:

- https://github.com/FeliLopez14/CIU-TECH_STORE2

Pasos recomendados:

1. abrir una terminal en la carpeta del frontend
2. instalar dependencias con `npm install`
3. crear o verificar el archivo `.env`
4. iniciar el servidor de desarrollo con `npm run dev`

Abrir la aplicación en el navegador:

- `http://127.0.0.1:5173/`

## Orden recomendado de arranque

Para una ejecución correcta, se recomienda seguir esta secuencia:

1. abrir Docker Desktop
2. levantar MongoDB con `docker compose up -d`
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

1. la persona usuaria se registra o inicia sesión con un `nickName` válido
2. al autenticarse se redirige al feed
3. desde el feed puede abrir el detalle de una publicación
4. desde el detalle puede comentar, eliminar comentarios propios, editar o eliminar la publicación si es autora
5. desde el menú inferior puede navegar al perfil, crear una publicación o cambiar el tema visual
6. desde el perfil puede seguir o dejar de seguir a otros usuarios y revisar sus publicaciones

## Endpoints utilizados por el frontend

La interfaz fue adaptada al contrato real del backend y utiliza los siguientes endpoints:

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `POST /api/usuarios/seguir`
- `POST /api/usuarios/dejar-seguir`
- `GET /api/usuarios/:id/feed`
- `GET /api/posts`
- `GET /api/posts/:postId`
- `POST /api/posts`
- `PUT /api/posts/:postId`
- `DELETE /api/posts/:postId`
- `POST /api/posts/:postId/etiquetas`
- `DELETE /api/posts/:postId/etiquetas/:tagId`
- `POST /api/posts/:postId/imagenes/upload`
- `DELETE /api/posts/:postId/imagenes/:imageId`
- `GET /api/comentarios`
- `POST /api/posts/:postId/comentarios`
- `DELETE /api/comentarios/:commentId`

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
- registro de nuevos usuarios
- carga del feed desde la API
- creación, edición y eliminación de publicaciones
- creación y eliminación de comentarios
- seguimiento y desbloqueo de usuarios
- navegación entre vistas
- funcionamiento del frontend con el backend real

La validación local del frontend también pasó con éxito:

- `npm run build`
- `npm run lint`

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

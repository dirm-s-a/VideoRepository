# Video Repository

Repositorio centralizado de videos para el sistema de Llamador de Turnos. Permite administrar los videos que se reproducen en cada kiosco llamador desde una interfaz web con autenticacion.

## Arquitectura

```
┌─────────────────────────────────────┐
│   Servidor Central (LAN)            │
│   Video Repository :3002            │
│                                     │
│  ┌──────────┐  ┌────────┐  ┌─────┐ │
│  │ Admin UI │  │API REST│  │ DB  │ │
│  │ (React)  │  │(Routes)│  │SQLite│ │
│  └──────────┘  └────────┘  └─────┘ │
└──────────────────┬──────────────────┘
                   │ HTTP (LAN)
       ┌───────────┼───────────┐
       ▼           ▼           ▼
 ┌──────────┐ ┌──────────┐ ┌──────────┐
 │Llamador 1│ │Llamador 2│ │Llamador N│
 │  :3000   │ │  :3000   │ │  :3000   │
 └──────────┘ └──────────┘ └──────────┘
```

Cada llamador sincroniza periodicamente los videos de su playlist asignada, descargandolos al cache local con verificacion SHA-256.

## Stack

| Tecnologia | Version | Uso |
|------------|---------|-----|
| Next.js | 16 | Framework (App Router, standalone output) |
| React | 19 | UI |
| TypeScript | 5.9 | Tipado |
| Tailwind CSS | 4 | Estilos |
| SQLite | better-sqlite3 | Base de datos embebida |
| Zod | 4 | Validacion de schemas |
| AG Grid Enterprise | 35 | Grillas de datos con agrupacion y filtros |
| jose | 6 | JWT (Edge-compatible para middleware) |
| bcryptjs | 3 | Hash de passwords |
| jsPDF | 4 | Exportar a PDF |
| xlsx | 0.18 | Exportar a Excel |

## Deploy con Docker

```bash
docker compose up -d
```

El servicio queda disponible en `http://<ip-servidor>:3002`.

### Variables de entorno

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `JWT_SECRET` | `video-repo-default-secret-change-me` | Secret para firmar tokens JWT |
| `PORT` | `3002` | Puerto del servicio |

### Datos persistentes

Los videos y la base de datos SQLite se almacenan en un Docker volume (`video-data` montado en `/app/data`). Los datos persisten entre reinicios y rebuilds.

Para usar una carpeta del host en lugar del volume (util para backups):

```yaml
volumes:
  - ./data:/app/data    # bind mount
```

## Autenticacion

El sistema usa **JWT en cookies HTTP-only** para autenticacion.

- Al iniciar por primera vez, se crea un usuario `admin` con password `admin`
- Todos los usuarios autenticados tienen acceso completo (sin roles)
- Las cookies expiran en 24 horas

### Rutas publicas (sin autenticacion)

Las siguientes rutas son accesibles sin login, ya que son usadas por los dispositivos llamadores:

- `POST /api/status` — Heartbeat de llamadores
- `POST /api/video-plays` — Tracking de reproducciones
- `GET /api/playlists/[nombre-llamador]` — Sync de playlist (cuando el slug no es numerico)
- `GET /api/videos/[id]/download` — Descarga de videos

## Admin UI

### Paginas

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Login | `/login` | Formulario de autenticacion |
| Dashboard | `/` | Resumen: total de videos, espacio en disco, playlists, llamadores online. Tarjetas de estado por llamador |
| Videos | `/videos` | Subir, listar, preview, editar descripcion, eliminar videos. Grilla AG Grid con busqueda rapida |
| Playlists | `/playlists` | Crear playlists, asignar videos con orden personalizado (drag & drop) |
| Llamadores | `/llamadores` | Administrar llamadores: editar datos (ubicacion, resolucion, marca TV, observaciones, foto), asignar playlist |
| Estadisticas | `/estadisticas` | Historial de reproducciones con filtros por fecha y llamador. Grilla AG Grid con agrupacion. Exportar a Excel/PDF |
| Usuarios | `/usuarios` | ABM de usuarios: crear, cambiar clave, eliminar |
| Base de Datos | `/database` | Backup, restaurar y reiniciar la base de datos |
| Estado en vivo | `/status` | Pagina alternativa de monitoreo en tiempo real |

### Dashboard

El dashboard muestra 4 tarjetas resumen (videos, espacio usado, playlists, llamadores online) y el estado de cada llamador en tarjetas compactas con codigo de color:

| Color | Estado | Condicion |
|-------|--------|-----------|
| Verde | Online | Heartbeat recibido en los ultimos 10 minutos |
| Azul | Sincronizando | Llamador descargando videos |
| Amarillo | Error sync | Error durante la sincronizacion de videos |
| Rojo | Offline | Sin heartbeat por mas de 10 minutos |
| Gris | Sin conexion | Nunca se conecto al repositorio |

Cada tarjeta muestra: nombre, IP, playlist asignada, videos en cache, video actual reproduciendose, y tiempo desde ultimo contacto.

### Subir videos

- Formatos soportados: MP4, WebM, OGG, AVI, MKV, MOV
- Tamano maximo: 500MB por archivo
- Upload multiple con barra de progreso por archivo
- Cada video recibe un hash SHA-256 para verificacion de integridad
- Descripcion editable (aparece en las tarjetas del dashboard junto al video actual)

### Playlists

- Cada playlist tiene un nombre y puede asignarse a uno o mas llamadores
- Drag & drop para reordenar videos dentro de la playlist
- Los llamadores se registran automaticamente al reportar estado via heartbeat

### Estadisticas

- Historial de reproducciones de video por llamador
- Filtros por rango de fecha y por llamador especifico
- Grilla AG Grid Enterprise con agrupacion por llamador o video
- Exportar a Excel (XLSX) o PDF
- Muestra: llamador, video, duracion, fecha/hora

### Gestion de usuarios

- Crear nuevos usuarios con username y password
- Cambiar password de usuarios existentes
- Eliminar usuarios (no se puede eliminar el usuario actualmente logueado)
- Passwords hasheados con bcrypt

### Base de datos

- **Backup**: Descargar una copia completa de la base de datos SQLite
- **Restaurar**: Subir un archivo de backup para reemplazar la base actual
- **Reiniciar**: Eliminar todos los datos y recrear la base con usuario admin/admin por defecto. Descarga un backup automatico antes de reiniciar

## API REST

### Autenticacion

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login con username/password. Setea cookie JWT |
| `POST` | `/api/auth/logout` | Borra cookie de sesion |
| `GET` | `/api/auth/me` | Retorna usuario actual desde JWT |

### Videos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/videos` | Lista todos los videos con metadata |
| `POST` | `/api/videos` | Subir video (multipart/form-data) |
| `GET` | `/api/videos/[id]` | Metadata de un video |
| `PATCH` | `/api/videos/[id]` | Actualizar descripcion |
| `DELETE` | `/api/videos/[id]` | Eliminar video (archivo + DB + playlists) |
| `GET` | `/api/videos/[id]/download` | Stream del archivo. Soporta `Range` headers para resume. ETag = SHA-256 |

### Playlists

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/playlists` | Lista todas las playlists con resumen |
| `GET` | `/api/playlists/[slug]` | Playlist por ID (numerico) o por nombre de llamador |
| `PUT` | `/api/playlists/[slug]` | Actualizar playlist (array de videoId + orden) |
| `POST` | `/api/playlists` | Crear nueva playlist |
| `DELETE` | `/api/playlists/[slug]` | Eliminar playlist |

### Llamadores

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/llamadores` | Lista todos los llamadores con estado y playlist |
| `GET` | `/api/llamadores/[nombre]` | Detalle de un llamador |
| `POST` | `/api/llamadores/[nombre]` | Crear o actualizar datos de un llamador |

### Estado (sin auth)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/status` | Llamador reporta estado (video actual, cache, IP). Actualiza `last_seen_at` |

### Reproducciones (sin auth)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/video-plays` | Registrar reproduccion completada (llamador, video, duracion) |
| `GET` | `/api/video-plays` | Obtener historial de reproducciones (con filtros opcionales) |

### Usuarios

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/users` | Lista todos los usuarios |
| `POST` | `/api/users` | Crear usuario (username + password) |
| `PATCH` | `/api/users/[id]` | Cambiar password |
| `DELETE` | `/api/users/[id]` | Eliminar usuario (no permite self-deletion) |

### Base de datos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/backup` | Descargar backup de la base de datos |
| `POST` | `/api/backup?action=restore` | Restaurar base desde archivo (multipart) |
| `POST` | `/api/backup?action=reset` | Reiniciar base de datos |

### Ejemplo: obtener playlist

```
GET /api/playlists/llamador3ero
```

```json
{
  "nombreLlamador": "llamador3ero",
  "videos": [
    {
      "id": 1,
      "filename": "adetraumato.mp4",
      "original_name": "adetraumato.mp4",
      "sha256": "abc123...",
      "size_bytes": 9437184,
      "orden": 1
    }
  ]
}
```

### Ejemplo: download con resume

```
GET /api/videos/1/download
Range: bytes=1048576-
```

Responde con `206 Partial Content` y el rango solicitado. El `ETag` es el SHA-256 del archivo.

## Configuracion en el Llamador

En el `configuracion.yml` de cada llamador:

```yaml
video:
  usarRepositorioCentral: true
  urlRepositorio: http://192.168.1.100:3002
  intervaloSyncMinutos: 5
```

El llamador automaticamente:
1. Consulta su playlist cada N minutos
2. Compara hashes SHA-256 con archivos locales
3. Descarga videos faltantes con retry y verificacion
4. Reproduce la playlist en orden
5. Reporta estado y video actual cada 60 segundos
6. Reporta cada reproduccion completada con duracion

## Base de datos

SQLite con las siguientes tablas:

| Tabla | Descripcion |
|-------|-------------|
| `videos` | Catalogo de videos (filename, sha256, size_bytes, description, original_name) |
| `llamadores` | Dispositivos registrados (nombre, IP, last_status, last_seen_at, ubicacion, resolucion, etc.) |
| `playlists` | Definicion de playlists (nombre) |
| `playlist_items` | Relacion playlist-video con orden |
| `video_plays` | Historial de reproducciones (llamador, video, duracion, timestamp) |
| `users` | Usuarios del sistema (username, password_hash) |

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3002`.

## Licencia

Uso interno.

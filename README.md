# Video Repository

Repositorio centralizado de videos para el sistema de [Llamador de Turnos](https://github.com/dirm-s-a/LlamadorNext.Js). Permite administrar los videos que se reproducen en cada kiosco llamador desde una interfaz web.

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

| Tecnologia | Version |
|------------|---------|
| Next.js | 16 |
| React | 19 |
| TypeScript | 5.9 |
| Tailwind CSS | 4 |
| SQLite | better-sqlite3 |
| Zod | 4 |

## Deploy con Docker

```bash
docker compose up -d
```

El servicio queda disponible en `http://<ip-servidor>:3002`.

### Datos persistentes

Los videos y la base de datos SQLite se almacenan en un Docker volume (`video-data` montado en `/app/data`). Los datos persisten entre reinicios y rebuilds.

Para usar una carpeta del host en lugar del volume (util para backups):

```yaml
volumes:
  - ./data:/app/data    # bind mount
```

## Admin UI

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Dashboard | `/` | Resumen: total de videos, espacio en disco, estado de llamadores |
| Videos | `/videos` | Subir, listar, preview, editar descripcion, eliminar videos |
| Playlists | `/playlists` | Asignar videos a cada llamador con orden personalizado |
| Estado | `/status` | Estado en vivo de cada llamador (online, syncing, video actual) |

### Subir videos

- Formatos soportados: MP4, WebM, OGG, AVI, MKV, MOV
- Tamano maximo recomendado: 500MB por archivo
- Upload multiple con barra de progreso por archivo
- Cada video recibe un hash SHA-256 para verificacion de integridad

### Playlists

- Cada llamador tiene su propia playlist (identificado por `nombreLlamador`)
- Drag & drop para reordenar videos
- Los llamadores se registran automaticamente al reportar estado

## API REST

### Videos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/videos` | Lista todos los videos con metadata |
| `POST` | `/api/videos` | Subir video (multipart/form-data) |
| `GET` | `/api/videos/[id]` | Metadata de un video |
| `PATCH` | `/api/videos/[id]` | Actualizar descripcion |
| `DELETE` | `/api/videos/[id]` | Eliminar video (archivo + DB + playlists) |
| `GET` | `/api/videos/[id]/download` | Stream del archivo. Soporta `Range` headers para resume |

### Playlists

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/playlists` | Lista llamadores con resumen de playlist |
| `GET` | `/api/playlists/[llamador]` | Playlist completa con metadata de videos |
| `PUT` | `/api/playlists/[llamador]` | Actualizar playlist (array de videoId + orden) |

### Estado

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/status` | Llamador reporta su estado (video actual, cache, etc.) |

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

## Base de datos

SQLite con 3 tablas:

- **videos**: Catalogo de videos (filename, sha256, size, descripcion)
- **llamadores**: Dispositivos registrados (nombre, IP, ultimo estado)
- **playlist_items**: Relacion llamador-video con orden

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3002`.

import { z } from "zod/v4";

// ── Video schemas ──

export const videoMetadataSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  sha256: z.string(),
  size_bytes: z.number(),
  duration_seconds: z.number().nullable(),
  uploaded_at: z.string(),
  description: z.string(),
});

export type VideoMetadata = z.infer<typeof videoMetadataSchema>;

// ── Playlist schemas ──

export const playlistVideoSchema = z.object({
  videoId: z.number(),
  filename: z.string(),
  sha256: z.string(),
  sizeBytes: z.number(),
  order: z.number(),
});

export const playlistResponseSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  descripcion: z.string(),
  updatedAt: z.string(),
  videos: z.array(playlistVideoSchema),
});

export const playlistUpdateSchema = z.object({
  videos: z.array(
    z.object({
      videoId: z.number(),
      orden: z.number(),
    })
  ),
});

export const playlistCreateSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
});

export type PlaylistVideo = z.infer<typeof playlistVideoSchema>;
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;
export type PlaylistUpdate = z.infer<typeof playlistUpdateSchema>;
export type PlaylistCreate = z.infer<typeof playlistCreateSchema>;

// ── Status schemas ──

export const llamadorStatusSchema = z.object({
  nombreLlamador: z.string(),
  currentVideo: z.string().optional(),
  cacheStatus: z.enum(["synced", "syncing", "error", "idle"]),
  cachedCount: z.number(),
  totalCount: z.number(),
  ipAddress: z.string().optional(),
});

export type LlamadorStatus = z.infer<typeof llamadorStatusSchema>;

// ── Llamador summary ──

export const llamadorSummarySchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  videoCount: z.number(),
  last_seen_at: z.string().nullable(),
  last_status: z.string().nullable(),
  ip_address: z.string().nullable(),
  observacion: z.string(),
  ubicacion: z.string(),
  ubicacion_principal: z.string(),
  ubicacion_secundaria: z.string(),
  resolucion_pantalla: z.string(),
  layout: z.string(),
  marca_modelo_tv: z.string(),
  foto: z.string(),
  playlist_id: z.number().nullable(),
  playlistNombre: z.string().nullable(),
});

export type LlamadorSummary = z.infer<typeof llamadorSummarySchema>;

// ── Video play tracking ──

export const videoPlayReportSchema = z.object({
  nombreLlamador: z.string(),
  videoFilename: z.string(),
  videoId: z.number().optional(),
  durationSeconds: z.number().optional(),
});

export type VideoPlayReport = z.infer<typeof videoPlayReportSchema>;

// ── Auth schemas ──

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Clave requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Usuario requerido")
    .max(50, "Maximo 50 caracteres"),
  password: z
    .string()
    .min(4, "Minimo 4 caracteres")
    .max(100, "Maximo 100 caracteres"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(4, "Minimo 4 caracteres")
    .max(100, "Maximo 100 caracteres"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

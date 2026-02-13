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
  nombreLlamador: z.string(),
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

export type PlaylistVideo = z.infer<typeof playlistVideoSchema>;
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;
export type PlaylistUpdate = z.infer<typeof playlistUpdateSchema>;

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
});

export type LlamadorSummary = z.infer<typeof llamadorSummarySchema>;

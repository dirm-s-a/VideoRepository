import { NextRequest, NextResponse } from "next/server";
import { getAllVideos, insertVideo } from "@/shared/db/repository";
import { saveVideoFile } from "@/shared/storage/video-storage";

// GET /api/videos — List all videos
export async function GET() {
  try {
    const videos = getAllVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error listing videos:", error);
    return NextResponse.json(
      { error: "Error al listar videos" },
      { status: 500 }
    );
  }
}

// POST /api/videos — Upload a video (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) ?? "";
    const tipo = (formData.get("tipo") as string) ?? "";

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|avi|mkv|mov)$/i)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se aceptan videos (mp4, webm, ogg, avi, mkv, mov)" },
        { status: 400 }
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to disk and compute hash
    const { filename, sha256, sizeBytes } = await saveVideoFile(
      buffer,
      file.name
    );

    // Insert into database
    const video = insertVideo({
      filename,
      original_name: file.name,
      sha256,
      size_bytes: sizeBytes,
      description,
      tipo,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Error al subir el video" },
      { status: 500 }
    );
  }
}

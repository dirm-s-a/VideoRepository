import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getVideoById } from "@/shared/db/repository";
import { getVideoFilePath, videoFileExists } from "@/shared/storage/video-storage";

// GET /api/videos/[id]/download — Stream video file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const video = getVideoById(videoId);
    if (!video) {
      return NextResponse.json(
        { error: "Video no encontrado" },
        { status: 404 }
      );
    }

    if (!videoFileExists(video.filename)) {
      return NextResponse.json(
        { error: "Archivo de video no encontrado en disco" },
        { status: 404 }
      );
    }

    const filePath = getVideoFilePath(video.filename);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Handle Range requests for resume support
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          return new NextResponse(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${fileSize}` },
          });
        }

        const chunkSize = end - start + 1;
        const stream = fs.createReadStream(filePath, { start, end });
        const readable = new ReadableStream({
          start(controller) {
            stream.on("data", (chunk) => controller.enqueue(chunk));
            stream.on("end", () => controller.close());
            stream.on("error", (err) => controller.error(err));
          },
        });

        return new NextResponse(readable, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Content-Type": "video/mp4",
            ETag: `"${video.sha256}"`,
          },
        });
      }
    }

    // Full file download
    const stream = fs.createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Content-Disposition": `attachment; filename="${video.filename}"`,
        ETag: `"${video.sha256}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Error al descargar video" },
      { status: 500 }
    );
  }
}

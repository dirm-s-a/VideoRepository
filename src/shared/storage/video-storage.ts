import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getVideosDir } from "@/shared/db/repository";

export async function computeSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

export async function saveVideoFile(
  buffer: Buffer,
  originalName: string
): Promise<{ filename: string; sha256: string; sizeBytes: number }> {
  const ext = path.extname(originalName).toLowerCase() || ".mp4";
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();

  // Ensure unique filename
  let filename = `${baseName}${ext}`;
  let filePath = path.join(getVideosDir(), filename);
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filename = `${baseName}_${counter}${ext}`;
    filePath = path.join(getVideosDir(), filename);
    counter++;
  }

  // Write file
  fs.writeFileSync(filePath, buffer);

  // Compute hash
  const sha256 = await computeSha256(filePath);
  const sizeBytes = buffer.length;

  return { filename, sha256, sizeBytes };
}

export function deleteVideoFile(filename: string): boolean {
  const filePath = path.join(getVideosDir(), filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function getVideoFilePath(filename: string): string {
  return path.join(getVideosDir(), filename);
}

export function videoFileExists(filename: string): boolean {
  return fs.existsSync(path.join(getVideosDir(), filename));
}

export function getDiskUsage(): { totalBytes: number; fileCount: number } {
  const dir = getVideosDir();
  if (!fs.existsSync(dir)) return { totalBytes: 0, fileCount: 0 };

  const files = fs.readdirSync(dir);
  let totalBytes = 0;
  let fileCount = 0;

  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isFile()) {
      totalBytes += stat.size;
      fileCount++;
    }
  }

  return { totalBytes, fileCount };
}

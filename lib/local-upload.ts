import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "listings");
const PUBLIC_UPLOAD_PREFIX = "/uploads/listings";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

export async function saveUploadedImageLocally(file: File) {
  const extension = MIME_TO_EXTENSION[file.type];

  if (!extension) {
    throw new Error("Supported image formats: JPG, PNG, WEBP, GIF.");
  }

  await mkdir(UPLOAD_DIR, {
    recursive: true
  });

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, fileBuffer);

  return `${PUBLIC_UPLOAD_PREFIX}/${fileName}`;
}

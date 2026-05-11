import { randomUUID } from "node:crypto";

const DEFAULT_BUCKET = "listing-images";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

function getSupabaseStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET;

  if (!supabaseUrl || !serviceRoleKey || !bucket) {
    return null;
  }

  return {
    supabaseUrl: supabaseUrl.endsWith("/") ? supabaseUrl.slice(0, -1) : supabaseUrl,
    serviceRoleKey,
    bucket
  };
}

function encodeObjectPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function hasSupabaseStorageConfig() {
  return Boolean(getSupabaseStorageConfig());
}

export async function uploadImageToSupabase(file: File) {
  const config = getSupabaseStorageConfig();

  if (!config) {
    throw new Error("Supabase Storage is not configured.");
  }

  const extension = MIME_TO_EXTENSION[file.type];

  if (!extension) {
    throw new Error("Supported image formats: JPG, PNG, WEBP, GIF.");
  }

  const now = new Date();
  const objectPath = `listings/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${Date.now()}-${randomUUID()}.${extension}`;
  const uploadUrl = `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeObjectPath(objectPath)}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
      "Content-Type": file.type,
      "x-upsert": "false"
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase Storage upload failed: ${body}`);
  }

  return `${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodeObjectPath(objectPath)}`;
}

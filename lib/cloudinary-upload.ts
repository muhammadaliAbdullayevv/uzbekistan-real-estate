import { createHash } from "node:crypto";

const DEFAULT_FOLDER = "uzbekistan-rentals/listings";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || DEFAULT_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder
  };
}

function createSignature(input: { folder: string; timestamp: number; apiSecret: string }) {
  const toSign = `folder=${input.folder}&timestamp=${input.timestamp}${input.apiSecret}`;
  return createHash("sha1").update(toSign).digest("hex");
}

export function hasCloudinaryUploadConfig() {
  return Boolean(getCloudinaryConfig());
}

export async function uploadImageToCloudinary(file: File) {
  const config = getCloudinaryConfig();

  if (!config) {
    throw new Error("Cloudinary upload is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createSignature({
    folder: config.folder,
    timestamp,
    apiSecret: config.apiSecret
  });

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", config.apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", config.folder);
  body.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body
    }
  );

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: {
      message?: string;
    };
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || "Unable to upload image to Cloudinary.");
  }

  return payload.secure_url;
}

import { NextResponse } from "next/server";

import { isAiRateLimited } from "@/lib/ai-rate-limit";
import {
  hasCloudinaryUploadConfig,
  uploadImageToCloudinary
} from "@/lib/cloudinary-upload";
import { getLocale, getTranslations } from "@/lib/i18n";
import { sniffImageType } from "@/lib/image-validation";
import { saveUploadedImageLocally } from "@/lib/local-upload";
import {
  hasSupabaseStorageConfig,
  uploadImageToSupabase
} from "@/lib/supabase-storage";
import { getUserSession } from "@/lib/user-session";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
// No login required to upload -- keyed by account when signed in, otherwise
// IP, so this (despite the name) is a generic per-hour limiter re-used here
// to keep an anonymous caller from hammering disk/bandwidth with uploads.
const MAX_UPLOADS_PER_HOUR = 30;

export async function POST(request: Request) {
  try {
    const locale = getLocale();
    const t = getTranslations(locale);
    const session = await getUserSession();
    const rateLimitKey = `upload:${session?.userId ?? `ip:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`}`;

    if (isAiRateLimited(rateLimitKey, MAX_UPLOADS_PER_HOUR)) {
      return NextResponse.json(
        {
          error: t.api.uploadRateLimited
        },
        {
          status: 429
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: t.api.noImageProvided
        },
        {
          status: 400
        }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: t.api.onlyImagesAllowed
        },
        {
          status: 400
        }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        {
          error: t.api.imageTooLarge
        },
        {
          status: 400
        }
      );
    }

    const sniffedType = sniffImageType(Buffer.from(await file.arrayBuffer()));

    if (!sniffedType || sniffedType !== file.type) {
      return NextResponse.json(
        {
          error: t.api.onlyImagesAllowed
        },
        {
          status: 400
        }
      );
    }

    const allowLocalUploads = process.env.ALLOW_LOCAL_UPLOADS === "true";

    if (
      !hasSupabaseStorageConfig() &&
      !hasCloudinaryUploadConfig() &&
      !allowLocalUploads &&
      process.env.NODE_ENV === "production"
    ) {
      return NextResponse.json(
        {
          error: t.api.cloudUploadNotConfigured
        },
        {
          status: 500
        }
      );
    }

    const url = hasSupabaseStorageConfig()
      ? await uploadImageToSupabase(file)
      : hasCloudinaryUploadConfig()
        ? await uploadImageToCloudinary(file)
        : await saveUploadedImageLocally(file);

    return NextResponse.json({
      url
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: getTranslations(getLocale()).api.unableToUploadImage
      },
      {
        status: 500
      }
    );
  }
}

import { NextResponse } from "next/server";

import {
  hasCloudinaryUploadConfig,
  uploadImageToCloudinary
} from "@/lib/cloudinary-upload";
import { getLocale, getTranslations } from "@/lib/i18n";
import { saveUploadedImageLocally } from "@/lib/local-upload";
import {
  hasSupabaseStorageConfig,
  uploadImageToSupabase
} from "@/lib/supabase-storage";
import { getUserSession } from "@/lib/user-session";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const locale = getLocale();
    const t = getTranslations(locale);
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        {
          error: t.api.loginToUploadImages
        },
        {
          status: 401
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

    if (
      !hasSupabaseStorageConfig() &&
      !hasCloudinaryUploadConfig() &&
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

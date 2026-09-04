"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

import { isLocalImageUrl } from "@/lib/image-url";

type AvatarUploadProps = {
  initialUrl: string | null;
  initial: string;
  size?: "md" | "lg";
  copy: {
    change: string;
    uploading: string;
    uploadFailed: string;
  };
};

const SIZE_CLASSES: Record<"md" | "lg", { frame: string; text: string; sizes: string }> = {
  md: { frame: "h-16 w-16", text: "text-xl", sizes: "64px" },
  lg: { frame: "h-20 w-20 sm:h-24 sm:w-24", text: "text-2xl sm:text-3xl", sizes: "96px" }
};

export function AvatarUpload({ initialUrl, initial, size = "md", copy }: AvatarUploadProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? copy.uploadFailed);
      }

      const uploadedUrl = payload.url as string;

      // Persist immediately so the profile photo doesn't depend on the rest
      // of the form being saved -- this is what lets the header avatar
      // (a separate server component) pick up the change right away.
      const saveResponse = await fetch("/api/account/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploadedUrl })
      });

      if (!saveResponse.ok) {
        throw new Error(copy.uploadFailed);
      }

      setAvatarUrl(uploadedUrl);
      router.refresh();
    } catch (uploadIssue) {
      setError(uploadIssue instanceof Error ? uploadIssue.message : copy.uploadFailed);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex ${sizeClasses.frame} shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 ${sizeClasses.text} font-bold text-accent`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            unoptimized={isLocalImageUrl(avatarUrl)}
            sizes={sizeClasses.sizes}
            className="object-cover"
          />
        ) : (
          initial
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? copy.uploading : copy.change}
        </button>
        {error ? <p className="mt-2 text-xs text-coral">{error}</p> : null}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isLocalImageUrl } from "@/lib/image-url";

type HeaderAvatarLinkProps = {
  avatarUrl: string | null;
  initial: string | null;
  label: string;
};

export function HeaderAvatarLink({ avatarUrl, initial, label }: HeaderAvatarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === "/account";

  const content = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      fill
      unoptimized={isLocalImageUrl(avatarUrl)}
      sizes="40px"
      className="object-cover"
    />
  ) : (
    initial
  );

  if (isActive) {
    return (
      <span
        aria-current="page"
        aria-label={label}
        title={label}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent bg-accent text-sm font-bold text-white sm:h-10 sm:w-10"
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href="/account"
      aria-label={label}
      title={label}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-sm font-bold text-accent transition hover:bg-accent/15 sm:h-10 sm:w-10"
    >
      {content}
    </Link>
  );
}

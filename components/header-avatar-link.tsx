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
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-sm font-extrabold text-slate-950 shadow-md shadow-cyan-500/25 sm:h-10 sm:w-10"
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
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-sm font-extrabold text-cyan-300 transition hover:border-cyan-400 hover:text-white sm:h-10 sm:w-10"
    >
      {content}
    </Link>
  );
}

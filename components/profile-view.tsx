"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { isLocalImageUrl } from "@/lib/image-url";
import type { UzbekistanRegion } from "@/lib/locations";

type ProfileViewProps = {
  locale?: "uz" | "ru";
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    plainPass?: string | null;
    telegramUsername: string | null;
    telegramChatId: string | null;
    avatarUrl: string | null;
    preferredRegion: string | null;
    preferredDistrict: string | null;
    phoneVerifiedAt: Date | null;
  };
  botUsername: string;
  isOwnerUser: boolean;
  listingsCount: number;
  favoritesCount: number;
  unreadCount: number;
  conversationsCount: number;
  regionOptions: { value: UzbekistanRegion; label: string }[];
  copy: {
    avatarChange: string;
    avatarUploading: string;
    avatarUploadFailed: string;
    signOut: string;
  };
};

export function ProfileView({
  locale = "uz",
  user,
  botUsername,
  isOwnerUser,
  listingsCount,
  favoritesCount,
  unreadCount,
  conversationsCount,
  regionOptions,
  copy
}: ProfileViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [tgNotify, setTgNotify] = useState<boolean>(Boolean(user.telegramChatId));

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Rasm yuklashda xatolik");
      const uploadedUrl = payload.url as string;
      const saveRes = await fetch("/api/account/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: uploadedUrl })
      });
      if (!saveRes.ok) throw new Error("Rasm saqlashda xatolik");
      setAvatarUrl(uploadedUrl);
      showToast("Rasm muvaffaqiyatli yuklandi!");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rasm yuklashda xatolik");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2200);
  }

  function copyToClipboard(text: string, label: string) {
    if (!text) {
      showToast(`${label} mavjud emas`);
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(`${label} nusxalandi!`))
      .catch(() => showToast("Nusxalashda xatolik yuz berdi"));
  }

  const initial = (
    user.name?.trim()?.[0] ||
    user.telegramUsername?.[0] ||
    user.email?.[0] ||
    "U"
  ).toUpperCase();

  const displayHandle = user.telegramUsername
    ? `@${user.telegramUsername}`
    : user.phone || user.email;

  const currentRegionLabel =
    regionOptions.find((r) => r.value === user.preferredRegion)?.label ??
    user.preferredRegion ??
    "Toshkent shahri";

  const botParolUrl = `https://t.me/${botUsername}?start=parol`;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* 1. USER HERO CARD WITH DIRECT LOGIN & PASSWORD */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Upload Capability */}
          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-xl font-black text-white shadow-md shadow-blue-600/20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.name || "Avatar"}
                  fill
                  className="object-cover"
                  unoptimized={isLocalImageUrl(avatarUrl)}
                />
              ) : (
                <span>{initial}</span>
              )}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold text-white">
                  ...
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white shadow transition hover:bg-blue-600"
              title="Rasm yuklash"
            >
              📷
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate font-display text-lg font-black tracking-tight text-slate-900">
                {user.name?.trim() || "Foydalanuvchi"}
              </h1>
              <svg
                className="h-4 w-4 shrink-0 fill-blue-600"
                viewBox="0 0 24 24"
                aria-label="Tasdiqlangan"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
              {displayHandle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            Tahrirlash
          </button>
        </div>

        {/* DIRECT CREDENTIALS STRIP (RAW LOGIN & PASSWORD VISIBLE DIRECTLY) */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          {/* Login Field */}
          <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-2.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>Login</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(user.phone || user.email, "Login")
                }
                className="text-blue-600 transition hover:underline"
              >
                Nusxa
              </button>
            </div>
            <p className="mt-0.5 truncate font-mono text-xs font-black text-slate-900">
              {user.phone || user.email}
            </p>
          </div>

          {/* Password Field */}
          <div className="rounded-2xl border border-blue-200/80 bg-[#EFF6FF] p-2.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              <span>Parol</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPassVisible((v) => !v)}
                  className="text-blue-700 transition hover:underline"
                >
                  {passVisible ? "Yopish" : "Ko'rish"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(user.plainPass ?? "", "Parol")
                  }
                  className="text-blue-700 transition hover:underline"
                >
                  Nusxa
                </button>
              </div>
            </div>
            <p className="mt-0.5 font-mono text-xs font-black text-blue-900">
              {passVisible
                ? user.plainPass || "uychi••••"
                : "••••••••"}
            </p>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100/60 pt-3 text-center">
          <Link
            href="/my-listings"
            className="group rounded-xl py-1 transition hover:bg-slate-50"
          >
            <span className="block text-base font-black text-slate-900 group-hover:text-blue-600">
              {listingsCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-400">
              E&apos;lonlarim
            </span>
          </Link>
          <Link
            href="/saved"
            className="group rounded-xl border-x border-slate-100 py-1 transition hover:bg-slate-50"
          >
            <span className="block text-base font-black text-slate-900 group-hover:text-rose-600">
              {favoritesCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-400">
              Saqlangan
            </span>
          </Link>
          <Link
            href="/chat"
            className="group rounded-xl py-1 transition hover:bg-slate-50"
          >
            <span
              className={`block text-base font-black ${
                unreadCount > 0 ? "text-blue-600" : "text-slate-900"
              }`}
            >
              {unreadCount > 0
                ? `${unreadCount} yangi`
                : conversationsCount}
            </span>
            <span className="block text-[10px] font-bold text-slate-400">
              Xabarlar
            </span>
          </Link>
        </div>
      </div>

      {/* 2. PRIMARY ACTION: E'LON QO'SHISH */}
      <Link
        href="/add-listing"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition active:scale-[0.98] hover:from-blue-700 hover:to-blue-800"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Yangi e&apos;lon joylashtirish</span>
      </Link>

      {/* 3. SETTINGS GROUP: FAOLIYATIM */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-soft">
        <div className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Faoliyatim
        </div>
        <div className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
          <Link
            href="/my-listings"
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                📋
              </span>
              <span>Mening e&apos;lonlarim</span>
            </div>
            <span className="font-semibold text-slate-400">
              {listingsCount} ta faol ›
            </span>
          </Link>

          <Link
            href="/saved"
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                ❤️
              </span>
              <span>Saqlangan uylar</span>
            </div>
            <span className="font-semibold text-slate-400">
              {favoritesCount} ta ›
            </span>
          </Link>

          <Link
            href="/chat"
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                💬
              </span>
              <span>Xabarlar va chat</span>
            </div>
            {unreadCount > 0 ? (
              <span className="inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {unreadCount}
              </span>
            ) : (
              <span className="font-semibold text-slate-400">Ko&apos;rish ›</span>
            )}
          </Link>

          {isOwnerUser ? (
            <Link
              href="/admin"
              className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  🛡️
                </span>
                <span>Boshqaruv paneli (Owner)</span>
              </div>
              <span className="font-extrabold text-purple-600">Kirish ›</span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* 4. SETTINGS GROUP: SOZLAMALAR VA AFZALLIKLAR */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-soft">
        <div className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Sozlamalar va Afzalliklar
        </div>
        <div className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
          {/* Asosiy hudud */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                📍
              </span>
              <div>
                <span className="block">Qidiruvdagi asosiy hudud</span>
                <span className="block text-[11px] font-normal text-slate-400">
                  Qidiruvda avtomatik ko&apos;rsatiladi
                </span>
              </div>
            </div>
            <span className="font-extrabold text-blue-600">
              {currentRegionLabel}
              {user.preferredDistrict ? `, ${user.preferredDistrict}` : ""} ›
            </span>
          </button>

          {/* Valyuta */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                💵
              </span>
              <span>Asosiy narx valyutasi</span>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-md px-2 py-1 transition ${
                  currency === "USD"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("UZS")}
                className={`rounded-md px-2 py-1 transition ${
                  currency === "UZS"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                UZS (so&apos;m)
              </button>
            </div>
          </div>

          {/* Ilova tili (Language Switcher) */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                🌐
              </span>
              <div>
                <span className="block">Ilova tili</span>
                <span className="block text-[11px] font-normal text-slate-400">
                  O&apos;zbekcha / Русский
                </span>
              </div>
            </div>
            <LanguageSwitcher currentLocale={locale} label="Ilova tili" />
          </div>

          {/* Telegram bildirishnomalar */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                🔔
              </span>
              <div>
                <span className="block">Telegram bildirishnomalar</span>
                <span className="block text-[11px] font-normal text-slate-400">
                  Yangi xabarlar va e&apos;lon holati
                </span>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={tgNotify}
                onChange={(e) => {
                  setTgNotify(e.target.checked);
                  showToast(
                    e.target.checked
                      ? "Telegram bildirishnomalar yoqildi"
                      : "Telegram bildirishnomalar o'chirildi"
                  );
                }}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>

          {/* Til */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                🌐
              </span>
              <span>Sayt tili</span>
            </div>
            <span className="font-bold text-slate-500">O&apos;zbekcha ›</span>
          </div>
        </div>
      </div>

      {/* 5. SETTINGS GROUP: XAVFSIZLIK */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-2 shadow-soft">
        <div className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Xavfsizlik
        </div>
        <div className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
          <a
            href={botParolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                🔑
              </span>
              <span>Yangi parol olish</span>
            </div>
            <span className="font-extrabold text-blue-600">Bot orqali ›</span>
          </a>

          <Link
            href="/account/sessions"
            className="flex items-center justify-between rounded-xl p-3 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                💻
              </span>
              <div>
                <span className="block">Ulangan qurilmalar (Seanslar)</span>
                <span className="block text-[11px] font-normal text-slate-400">
                  Faol seanslarni boshqarish
                </span>
              </div>
            </div>
            <span className="text-slate-400">Ko&apos;rish ›</span>
          </Link>
        </div>
      </div>

      {/* 6. CHIQISH */}
      <form action="/api/auth/logout" method="post">
        <input type="hidden" name="next" value="/" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3.5 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span>{copy.signOut}</span>
        </button>
      </form>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900">
                Profilni tahrirlash
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form
              action="/api/account/preferences"
              method="post"
              className="mt-4 space-y-3.5"
            >
              <div>
                <label
                  htmlFor="modal-name"
                  className="mb-1 block text-xs font-bold text-slate-700"
                >
                  Ism va familiya
                </label>
                <input
                  id="modal-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={user.name || ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-phone"
                  className="mb-1 block text-xs font-bold text-slate-700"
                >
                  Telefon raqami
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:bg-white">
                  <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-600">
                    +998
                  </span>
                  <input
                    id="modal-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    defaultValue={(user.phone || "").replace(/\D/g, "").slice(-9)}
                    placeholder="901234567"
                    className="w-full bg-transparent px-3 py-2.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-region"
                  className="mb-1 block text-xs font-bold text-slate-700"
                >
                  Qidiruvdagi asosiy hudud
                </label>
                <select
                  id="modal-region"
                  name="preferredRegion"
                  defaultValue={user.preferredRegion || "Tashkent City"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  {regionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="modal-district"
                  className="mb-1 block text-xs font-bold text-slate-700"
                >
                  Tuman / Shahar
                </label>
                <input
                  id="modal-district"
                  name="preferredDistrict"
                  type="text"
                  defaultValue={user.preferredDistrict || ""}
                  placeholder="Masalan: Chilonzor tumani"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow-lg animate-in fade-in duration-150">
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}

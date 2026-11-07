"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthSubmitForm } from "@/components/auth-submit-form";
import { PasswordInput } from "@/components/password-input";
import { TelegramLoginButton } from "@/components/telegram-login-button";

type LoginCardWithModalProps = {
  nextPath: string;
  defaultEmail?: string;
  botUsername: string;
  error?: string | null;
  notice?: string | null;
  copy: {
    phoneLabel: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    signIn: string;
    or: string;
    createAccount: string;
    showPassword: string;
    hidePassword: string;
    showPasswordAria: string;
    hidePasswordAria: string;
  };
};

export function LoginCardWithModal({
  nextPath,
  defaultEmail = "",
  botUsername,
  error,
  notice,
  copy
}: LoginCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const botRegisterUrl = `https://t.me/${botUsername}?start=register`;
  const botParolUrl = `https://t.me/${botUsername}?start=parol`;

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-xl sm:shadow-2xl">
      {/* Top Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-90">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-sm font-black text-white shadow-xs">
            U
          </span>
          <span className="text-sm font-black tracking-tight text-slate-900">
            UYCHI<span className="text-blue-600">.UZ</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-400 transition hover:text-slate-700"
        >
          Bosh sahifa
        </Link>
      </div>

      {/* Main Login Form Content */}
      <div className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Tizimga kirish
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
            Uychi hisobingizga kiring
          </p>
        </div>

        <AuthSubmitForm action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          {/* Login / Phone Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-bold text-slate-700"
            >
              {copy.phoneLabel}
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-[#F4F7FB] px-3.5 py-3 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10">
              <span className="mr-2.5 text-slate-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                defaultValue={defaultEmail}
                placeholder={copy.phonePlaceholder}
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-bold text-slate-700"
              >
                {copy.passwordLabel}
              </label>
              <a
                href={botParolUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {copy.forgotPassword}
              </a>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder={copy.passwordPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-[#F4F7FB] px-3.5 py-3 pr-24 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              showLabel={copy.showPassword}
              hideLabel={copy.hidePassword}
              showAriaLabel={copy.showPasswordAria}
              hideAriaLabel={copy.hidePasswordAria}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
              {notice}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]"
          >
            {copy.signIn}
          </button>
        </AuthSubmitForm>

        {/* Clean Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            {copy.or}
          </span>
        </div>

        {/* Create Account Trigger Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-800 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700 active:scale-[0.98]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span>{copy.createAccount}</span>
        </button>

        {/* 1-Tap Browser Auth Option (Subtle) */}
        <div className="mt-5 border-t border-slate-100 pt-3 text-center">
          <TelegramLoginButton
            nextPath={nextPath}
            label="⚡ Telegram orqali 1-bosishda tez kirish"
            className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-blue-600"
          />
        </div>
      </div>

      {/* OVERLAY MODAL: GUIDE & WAITING ON THE FACE OF LOGIN */}
      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm transition-all sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:rounded-[28px]">
            {/* Modal Top Bar with Close X Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700">
                  Oddiy va tezkor
                </span>
                <h3 className="mt-1 font-display text-lg font-black tracking-tight text-slate-900">
                  Hisob yaratish yo&apos;riqnomasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Yopish"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 3-Step Clear Visual Guide */}
            <div className="my-5 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
                  1
                </span>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Telegram botni oching</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Pastdagi ko&apos;k tugmani bosib rasmiy botimizga o&apos;ting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
                  2
                </span>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    «📱 Telefon raqamimni ulashish»ni bosing
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Botda pastdagi bitta tugmani bosib raqamingizni tasdiqlang.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-200/80 bg-[#EFF6FF] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
                  3
                </span>
                <div>
                  <p className="text-xs font-extrabold text-blue-900">
                    Bot sizga Login va Parol beradi!
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-blue-700">
                    Bot bergan Login va Parol bilan shu sahifada tizimga kirasiz.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Waiting Pulse Indicator */}
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
              <span>Telegram botda hisob olishingiz kutilmoqda...</span>
            </div>

            {/* Direct CTA to open bot */}
            <div className="space-y-2">
              <a
                href={botRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                <span>Telegram botni ochish (@{botUsername})</span>
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 text-xs font-bold text-slate-500 transition hover:text-slate-800"
              >
                ← Orqaga (Login oynasiga qaytish)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

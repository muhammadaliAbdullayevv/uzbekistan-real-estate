"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TelegramLoginButtonProps = {
  nextPath: string;
  locale?: "uz" | "ru";
  botUsername?: string | null;
  label?: string;
  className?: string;
};

export function TelegramLoginButton({
  nextPath,
  locale = "uz",
  botUsername = null,
  label,
  className
}: TelegramLoginButtonProps) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "starting" | "waiting" | "completed" | "error">("idle");
  const [token, setToken] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    phone: string | null;
    name: string | null;
    plainPass: string | null;
    redirectTo: string;
  } | null>(null);

  async function handleStartTelegramLogin() {
    setStage("starting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/telegram/start", {
        method: "POST"
      });
      const data = (await response.json()) as {
        ok?: boolean;
        token?: string;
        botUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.token || !data.botUrl) {
        throw new Error(
          data.error ||
            (locale === "ru"
              ? "Не удалось запустить вход через Telegram."
              : "Telegram orqali kirishni boshlab bo'lmadi.")
        );
      }

      setToken(data.token);
      setBotUrl(data.botUrl);
      setStage("waiting");

      // Open Telegram bot in a new tab / app
      window.open(data.botUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStage("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : locale === "ru"
            ? "Ошибка подключения к Telegram."
            : "Telegram botga ulanishda xatolik yuz berdi."
      );
    }
  }

  // Poll status while waiting for the user to share their phone number in the Telegram bot
  useEffect(() => {
    if (stage !== "waiting" || !token) {
      return;
    }

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram/status?token=${encodeURIComponent(token)}`, {
          cache: "no-store"
        });
        const statusData = (await res.json()) as {
          status?: "pending" | "completed" | "expired" | "invalid";
        };

        if (cancelled) {
          return;
        }

        if (statusData.status === "completed") {
          clearInterval(interval);

          const completeRes = await fetch("/api/auth/telegram/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, next: nextPath })
          });

          const completeData = (await completeRes.json()) as {
            ok?: boolean;
            redirectTo?: string;
            plainPass?: string | null;
            phone?: string | null;
            name?: string | null;
          };

          if (completeRes.ok && completeData.ok) {
            setCredentials({
              phone: completeData.phone ?? null,
              name: completeData.name ?? null,
              plainPass: completeData.plainPass ?? null,
              redirectTo: completeData.redirectTo ?? "/account"
            });
            setStage("completed");
          } else {
            setStage("error");
            setErrorMessage(
              locale === "ru"
                ? "Не удалось завершить вход. Попробуйте ещё раз."
                : "Kirishni yakunlab bo'lmadi. Qaytadan urinib ko'ring."
            );
          }
        } else if (statusData.status === "expired" || statusData.status === "invalid") {
          clearInterval(interval);
          setStage("error");
          setErrorMessage(
            locale === "ru"
              ? "Время ожидания истекло. Нажмите кнопку ещё раз."
              : "Kutish vaqti tugadi. Tugmani qaytadan bosing."
          );
        }
      } catch {
        // Ignore transient network errors while polling
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stage, token, nextPath, locale]);

  if (stage === "completed" && credentials) {
    return (
      <div className="space-y-4 rounded-[24px] border-2 border-emerald-300 bg-emerald-50/90 p-5 text-slate-900 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div>
            <p className="font-display text-base font-extrabold text-slate-900">
              {locale === "ru" ? "Вы успешно вошли!" : "Muvaffaqiyatli tasdiqlandi!"}
            </p>
            <p className="text-xs font-bold text-emerald-800">
              {credentials.name} · {credentials.phone}
            </p>
          </div>
        </div>

        {credentials.plainPass ? (
          <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              {locale === "ru"
                ? "Данные для входа с других устройств (также отправлены в Telegram):"
                : "Boshqa qurilma / brauzerdan kirish uchun Login va Parol (Telegramga ham yuborildi):"}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-xl bg-[#F3F6FB] p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-500">
                  {locale === "ru" ? "Логин (Телефон)" : "Login (Telefon)"}
                </span>
                <span className="mt-0.5 block font-mono font-extrabold text-slate-900">
                  {credentials.phone}
                </span>
              </div>
              <div className="rounded-xl bg-[#EFF6FF] p-2.5">
                <span className="block text-[10px] font-bold uppercase text-blue-600">
                  {locale === "ru" ? "Пароль" : "Parol"}
                </span>
                <span className="mt-0.5 block font-mono font-extrabold text-blue-700">
                  {credentials.plainPass}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            router.push(credentials.redirectTo);
            router.refresh();
          }}
          className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold"
        >
          <span>{locale === "ru" ? "Продолжить на сайт" : "Saytga o'tish"}</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stage === "waiting" && botUrl ? (
        <div className="space-y-3.5 rounded-[24px] border-2 border-blue-200 bg-[#EFF6FF] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </span>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
                {locale === "ru"
                  ? "Подтвердите номер в Telegram-боте..."
                  : "Telegram botda telefon raqamingizni ulashing..."}
              </p>
              <p className="text-xs leading-relaxed font-medium text-slate-600">
                {locale === "ru"
                  ? "Нажмите «Start» и кнопку «📱 Telefon raqamimni ulashish» в боте. Эта страница войдет автоматически и выдаст вам логин и пароль."
                  : "Botda «Start» va «📱 Telefon raqamimni ulashish» tugmasini bosing. Shu sahifa avtomatik ochiladi va bot sizga Login hamda Parol beradi."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-extrabold sm:text-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              <span>
                {locale === "ru" ? "Открыть Telegram-бот" : "Telegram botni ochish"}
                {botUsername ? ` (@${botUsername})` : ""}
              </span>
            </a>

            <button
              type="button"
              onClick={() => setStage("idle")}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              {locale === "ru" ? "Отмена" : "Bekor qilish"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={stage === "starting"}
          onClick={handleStartTelegramLogin}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_28px_-8px_rgba(37,99,235,0.45)] transition hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span>
            {stage === "starting"
              ? locale === "ru"
                ? "Подключение к Telegram..."
                : "Telegram botga ulanmoqda..."
              : label ||
                (locale === "ru"
                  ? "Войти / Зарегистрироваться через Telegram"
                  : "Telegram orqali tasdiqlash va kirish")}
          </span>
        </button>
      )}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

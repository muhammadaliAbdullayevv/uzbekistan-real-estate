import Link from "next/link";
import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { resolvePostAuthPath } from "@/lib/owner";
import { getSafeUserNextPath, getUserSession } from "@/lib/user-session";

type RegisterPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function RegisterPage({ searchParams = {} }: RegisterPageProps) {
  const session = await getUserSession();
  const nextPath = getSafeUserNextPath(
    typeof searchParams.next === "string" ? searchParams.next : "/"
  );

  if (session) {
    redirect(resolvePostAuthPath(session, nextPath));
  }

  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "HousliBot").replace(/^@/, "");

  return (
    <div className="shell py-6 sm:py-12">
      <div className="mx-auto max-w-md">
        <div className="panel overflow-hidden border border-slate-200/90 bg-white p-6 shadow-soft sm:rounded-[32px] sm:p-8">
          {/* Header */}
          <div className="text-center">
            <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white shadow-md shadow-blue-600/25">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Ro&apos;yxatdan o&apos;tish
            </h1>
            <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
              Telegram bot orqali 5 soniyada hisob yarating
            </p>
          </div>

          {/* Direct CTA */}
          <div className="mt-6">
            <a
              href={`https://t.me/${botUsername}?start=register`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-4 text-sm font-extrabold text-white shadow-md shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-800"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>Telegram botda hisob ochish</span>
            </a>
          </div>

          {/* Simple 3 steps */}
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-4 text-xs text-slate-700">
            <p className="font-extrabold uppercase tracking-wider text-slate-900">
              Oddiy 3 qadam:
            </p>
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
                1
              </span>
              <p className="leading-relaxed">
                Yuqoridagi ko&apos;k tugmani bosib <strong>@{botUsername}</strong> botini oching.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
                2
              </span>
              <p className="leading-relaxed">
                Botdagi <strong>«📱 Telefon raqamimni ulashish»</strong> tugmasini bosing.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
                3
              </span>
              <p className="leading-relaxed">
                Bot sizga <strong>Login (+998...)</strong> va <strong>Parol</strong> beradi va saytga darhol kiritadi!
              </p>
            </div>
          </div>

          {/* Link back to login */}
          <p className="mt-6 text-center text-sm font-medium text-slate-600">
            Hisobingiz bormi?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="font-extrabold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
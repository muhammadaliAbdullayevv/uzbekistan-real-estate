import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { TelegramLoginButton } from "@/components/telegram-login-button";
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

  return (
    <AuthShell
      pill="Yangi profil ochish"
      title="Ro'yxatdan o'tish va shaxsni tasdiqlash Telegram bot orqali"
      description="Uychi platformasida haqiqiy foydalanuvchilar va ishonchli e'lonlarni ta'minlash uchun ro'yxatdan o'tish rasmiy Telegram botimiz orqali 10 soniyada amalga oshiriladi."
      primaryFeature={{
        title: "Avtomatik Login va Parol",
        copy: "Telefon raqamingizni botda ulashishingiz bilan saytda profilingiz ochiladi va boshqa qurilmalarda kirish uchun Login (+998...) hamda Parol beriladi."
      }}
      secondaryFeatures={[
        {
          title: "Tasdiqlangan profil",
          copy: "Saytda sizning tasdiqlangan telefon raqamingiz va Telegram ismingiz ko'rsatiladi."
        },
        {
          title: "Kompyuter va telefon uchun",
          copy: "Bot bergan Login va Parol yordamida istalgan brauzerdan profilingizga kira olasiz."
        }
      ]}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
        Rasmiy identifikatsiya
      </span>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-[1.75rem]">
        Telegram orqali ro&apos;yxatdan o&apos;tish
      </h2>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
        Quyidagi tugmani bosing va Telegram botimizda <strong>«📱 Telefon raqamimni ulashish»</strong> tugmasini tasdiqlang.
      </p>

      <div className="mt-5">
        <TelegramLoginButton
          nextPath={nextPath}
          label="Telegram orqali tasdiqlash va Login olish"
        />
      </div>

      <div className="mt-6 space-y-2.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-4 text-xs text-slate-700">
        <p className="font-extrabold uppercase tracking-wider text-slate-900">
          3 ta oddiy qadam:
        </p>
        <div className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
            1
          </span>
          <p className="leading-relaxed">
            <strong>Telegram orqali tasdiqlash</strong> tugmasini bosib rasmiy botimizni oching va <code>Start</code> bosing.
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
            Shu brauzerda avtomatik tizimga kirasiz, bot esa sizga boshqa qurilmalar uchun <strong>Login (+998...)</strong> va <strong>Parol</strong> yuboradi!
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-medium text-slate-600">
        Login va parolingiz bormi?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-extrabold text-blue-600 hover:text-blue-700 underline"
        >
          Login va parol bilan kirish
        </Link>
      </p>
    </AuthShell>
  );
}

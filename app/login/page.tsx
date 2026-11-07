import { redirect } from "next/navigation";

import { LoginCardWithModal } from "@/components/login-card-with-modal";
export { privatePageMetadata as metadata } from "@/lib/site";
import { getLocale, getTranslations } from "@/lib/i18n";
import { resolvePostAuthPath } from "@/lib/owner";
import { getSafeUserNextPath, getUserSession } from "@/lib/user-session";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams = {} }: LoginPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();
  const nextPath = getSafeUserNextPath(
    typeof searchParams.next === "string" ? searchParams.next : "/"
  );

  if (session) {
    redirect(resolvePostAuthPath(session, nextPath));
  }

  const error =
    searchParams.error === "blocked"
      ? t.auth.blocked
      : searchParams.error === "rate-limited"
        ? t.auth.rateLimited
        : searchParams.error === "invalid"
          ? "Login (telefon raqam / @username) yoki parol noto'g'ri kiritildi."
          : searchParams.error === "verify-invalid"
            ? t.auth.verifyEmailInvalid
            : searchParams.error === "google"
              ? t.auth.invalidLogin
              : null;
  const notice =
    searchParams.registered === "1"
      ? t.auth.registeredSuccess
      : searchParams.notice === "password-reset"
        ? t.auth.passwordResetSuccess
        : searchParams.notice === "email-verified"
          ? t.auth.verifiedSuccess
          : null;
  const email = typeof searchParams.email === "string" ? searchParams.email : "";
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "HousliBot").replace(/^@/, "");

  return (
    <div className="shell flex min-h-[calc(100vh-140px)] items-center justify-center py-6 sm:py-12">
      <LoginCardWithModal
        nextPath={nextPath}
        defaultEmail={email}
        botUsername={botUsername}
        error={error}
        notice={notice}
        copy={{
          phoneLabel: "Telefon raqam (Login)",
          phonePlaceholder: "+998 90 123 45 67 yoki @username",
          passwordLabel: "Parol",
          passwordPlaceholder: "Parolingizni kiriting",
          forgotPassword: "Parolni unutdingizmi?",
          signIn: "Kirish",
          or: "yoki",
          createAccount: "Hisob yaratish",
          showPassword: t.auth.showPassword,
          hidePassword: t.auth.hidePassword,
          showPasswordAria: t.auth.showPasswordAria,
          hidePasswordAria: t.auth.hidePasswordAria
        }}
      />
    </div>
  );
}

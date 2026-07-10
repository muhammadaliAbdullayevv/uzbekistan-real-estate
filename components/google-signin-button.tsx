type GoogleSignInButtonProps = {
  nextPath: string;
  label: string;
  dividerLabel: string;
};

export function GoogleSignInButton({ nextPath, label, dividerLabel }: GoogleSignInButtonProps) {
  return (
    <div className="space-y-5">
      <a
        href={`/api/auth/google?next=${encodeURIComponent(nextPath)}`}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-line/80 bg-white px-5 py-3.5 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
          />
        </svg>
        {label}
      </a>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-ink/40">
        <span className="h-px flex-1 bg-line/70" />
        {dividerLabel}
        <span className="h-px flex-1 bg-line/70" />
      </div>
    </div>
  );
}

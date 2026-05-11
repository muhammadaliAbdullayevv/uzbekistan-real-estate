import type { ReactNode } from "react";

type AuthFeature = {
  title: string;
  copy: string;
};

type AuthShellProps = {
  pill: string;
  title: string;
  description: string;
  primaryFeature: AuthFeature;
  secondaryFeatures: AuthFeature[];
  children: ReactNode;
};

export function AuthShell({
  pill,
  title,
  description,
  primaryFeature,
  secondaryFeatures,
  children
}: AuthShellProps) {
  return (
    <div className="shell">
      <div className="auth-stage">
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />

        <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
          <section className="order-2 auth-showcase auth-raise lg:order-1">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82">
              {pill}
            </span>
            <h1 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/74">
              {description}
            </p>

            <div className="mt-8 rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
                {primaryFeature.title}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {primaryFeature.copy}
              </p>
            </div>

            <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2">
              {secondaryFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[26px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{feature.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="order-1 auth-card auth-raise-delayed lg:order-2">{children}</section>
        </div>
      </div>
    </div>
  );
}

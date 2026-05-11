import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  icon
}: EmptyStateProps) {
  return (
    <div className="panel flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-mist text-ink/65">
          {icon}
        </div>
      ) : null}
      {eyebrow ? <div className="pill mb-4">{eyebrow}</div> : null}
      <h2 className="font-display text-3xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-ink/70">{description}</p>
    </div>
  );
}

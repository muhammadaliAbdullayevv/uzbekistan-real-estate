/**
 * The Uychi house mark: a roofline that falls straight into two open wall
 * strokes, with a brass doorway bridging the gap and stepping past the
 * bottom edge. No badge or fill behind it -- it stands on its own.
 */
export function UychiMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-md shadow-blue-600/20 ${className ?? "h-8 w-8"}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
        <path d="M9 21V13h6v8" />
      </svg>
    </span>
  );
}

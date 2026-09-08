/**
 * The Uychi house mark: a roofline that falls straight into two open wall
 * strokes, with a brass doorway bridging the gap and stepping past the
 * bottom edge. No badge or fill behind it -- it stands on its own.
 */
export function UychiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M17 90 L17 42 L50 10 L83 42 L83 90"
        fill="none"
        stroke="#1D3B34"
        strokeWidth="15"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      <rect x="38" y="54" width="24" height="44" fill="#B07D2B" />
    </svg>
  );
}

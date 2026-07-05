// Decorative pixel-block strip that bridges a light section into the dark footer.
// Each column is a block whose top edge sits at a pseudo-random row, so the seam
// dissolves into pixels; all blocks reach the bottom, meeting the footer cleanly.
// The height pattern is deterministic (no Math.random) so server and client match.
// Small screens use fewer, chunkier columns so the bars do not look too thin.

const ROWS = 5;

function topRow(i: number): number {
  const hashed = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453);
  return 1 + Math.floor((hashed - Math.floor(hashed)) * 3.999);
}

function Bars({ cols }: { cols: number }) {
  return (
    <svg
      viewBox={`0 0 ${cols} ${ROWS}`}
      preserveAspectRatio="none"
      fill="currentColor"
      className="block h-12 w-full sm:h-16 lg:h-20"
    >
      {Array.from({ length: cols }, (_, i) => {
        const top = topRow(i);
        // Slight overlap avoids subpixel gaps between columns when stretched.
        return <rect key={i} x={i} y={top} width={1.02} height={ROWS - top} />;
      })}
    </svg>
  );
}

export function PixelTransition() {
  return (
    <div aria-hidden="true" className="bg-surface text-ink w-full leading-[0]">
      <div className="sm:hidden">
        <Bars cols={22} />
      </div>
      <div className="hidden sm:block">
        <Bars cols={72} />
      </div>
    </div>
  );
}

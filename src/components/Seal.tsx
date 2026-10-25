// Het officiële zegel: een sticker met roterende rand. Klik vijf keer voor een verrassing.

export function Seal({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <path id="seal-circle" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="49" fill="#f6d36b" />
      <g className="seal__ring">
        <text fontFamily="Geist Mono, monospace" fontSize="9.5" fontWeight="600" letterSpacing="2.4" fill="#191b2e">
          <textPath href="#seal-circle">INSTITUUT · MDB · OPGERICHT VANDAAG · </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="24" fill="#f2785c" />
      <path d="M50 36l3.6 9.4 10 .6-7.8 6.3 2.6 9.7L50 56.6 41.6 62l2.6-9.7-7.8-6.3 10-.6z" fill="#191b2e" />
    </svg>
  );
}

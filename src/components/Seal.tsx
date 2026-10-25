// Het officiële zegel: een fijne lijntekening met roterende rand. Klik vijf keer voor een verrassing.

export function Seal({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <path id="seal-circle" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g className="seal__ring">
        <text fontFamily="Geist Mono, monospace" fontSize="9.5" letterSpacing="2.6" fill="currentColor">
          <textPath href="#seal-circle">INSTITUUT · MDB · OPGERICHT VANDAAG · </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="8" fill="#b65a3a" />
    </svg>
  );
}

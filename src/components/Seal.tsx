// Het officiële zegel van het instituut. Draait langzaam; draait sneller als je erop klikt.

export function Seal({ size = 46 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <path id="seal-circle" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill="#ffd24d" stroke="#17153a" strokeWidth="4" />
      <g className="seal__ring">
        <text fontFamily="Space Mono, monospace" fontSize="11.5" fontWeight="700" letterSpacing="2.2" fill="#17153a">
          <textPath href="#seal-circle">INSTITUUT · MEER IDEEËN DAN TIJD · </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="24" fill="#ff5c47" stroke="#17153a" strokeWidth="4" />
      <text x="50" y="57" textAnchor="middle" fontFamily="Bricolage, sans-serif" fontWeight="800" fontSize="20" fill="#17153a">
        MdB
      </text>
    </svg>
  );
}

// Kleine octrooitekeningen: het illustratiesysteem van het instituut.
// Fijne inktlijnen, hooguit één accentkleur per figuur, en een fig.-nummer in de hoek.

export type MiniFigKind = "knop" | "sokkel" | "lamp" | "ticket" | "certificaat" | "zandloper" | "vitrine" | "tandwiel" | "kalender" | "sleutel";

const NUMBERS: Record<MiniFigKind, string> = {
  knop: "2",
  sokkel: "3",
  lamp: "4",
  ticket: "5",
  certificaat: "7",
  zandloper: "8",
  vitrine: "9",
  tandwiel: "10",
  kalender: "11",
  sleutel: "12",
};

function Body({ kind }: { kind: MiniFigKind }) {
  switch (kind) {
    case "knop":
      return (
        <>
          <circle cx="60" cy="46" r="30" />
          <circle cx="60" cy="46" r="20" />
          <circle className="fill" cx="60" cy="46" r="13" fill="#b65a3a" stroke="none" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (0.75 + i * 0.15);
            return <line key={i} x1={60 + Math.cos(a) * 34} y1={46 + Math.sin(a) * 34} x2={60 + Math.cos(a) * 38} y2={46 + Math.sin(a) * 38} />;
          })}
          <path d="M60 46l12-12" strokeWidth="2" />
        </>
      );
    case "sokkel":
      return (
        <>
          <path d="M34 82h52M40 82V44h40v38M36 44h48M44 44v-4h32v4" />
          <rect className="fill" x="48" y="14" width="24" height="24" fill="#4a4f8c" stroke="none" />
          <rect x="48" y="14" width="24" height="24" />
          <path d="M44 60h32M44 68h20" strokeWidth="0.8" />
        </>
      );
    case "lamp":
      return (
        <>
          <circle className="fill" cx="60" cy="38" r="20" fill="#c2913a" stroke="none" />
          <circle cx="60" cy="38" r="20" />
          <path d="M52 38q4-9 8 0t8 0M52 58h16M53 64h14M56 70h8" />
          <path d="M60 10v-6M84 22l5-4M36 22l-5-4M90 40h6M24 40h6" />
          <circle cx="92" cy="70" r="9" />
          <circle cx="92" cy="70" r="3" />
        </>
      );
    case "ticket":
      return (
        <>
          <path d="M28 22h64v14a6 6 0 0 0 0 12v14H28V48a6 6 0 0 0 0-12z" />
          <path d="M76 22v40" strokeDasharray="2 3" />
          <text x="50" y="47" textAnchor="middle" fontFamily="Instrument Serif" fontSize="18" fill="currentColor" stroke="none">
            A-57
          </text>
          <rect className="fill" x="80" y="30" width="8" height="24" fill="#b65a3a" stroke="none" />
        </>
      );
    case "certificaat":
      return (
        <>
          <rect x="14" y="12" width="92" height="64" />
          <rect x="19" y="17" width="82" height="54" strokeWidth="0.6" />
          <path d="M32 30h56M38 40h44M30 52h30" strokeWidth="0.8" />
          <circle className="fill" cx="82" cy="58" r="10" fill="#b65a3a" stroke="none" />
          <circle cx="82" cy="58" r="13" strokeWidth="0.8" />
          <path d="M30 62c6-6 10 4 16-2s8 2 12-1" />
        </>
      );
    case "zandloper":
      return (
        <>
          <path d="M40 10h40M40 80h40M44 10c0 22 14 28 16 35c2-7 16-13 16-35M44 80c0-22 14-28 16-35c2 7 16 13 16 35" />
          <path className="fill" d="M50 20h20c-2 12-8 16-10 22c-2-6-8-10-10-22z" fill="#c2913a" stroke="none" />
        </>
      );
    case "vitrine":
      return (
        <>
          <path d="M26 30l34-14 34 14v42H26z" />
          <path d="M26 30h68M60 16v56" strokeWidth="0.6" />
          <rect className="fill" x="44" y="50" width="32" height="12" fill="#4a4f8c" stroke="none" />
          <path d="M20 80h80" />
        </>
      );
    case "tandwiel": {
      let d = "";
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = i % 2 ? 24 : 30;
        d += `${i ? "L" : "M"}${(60 + Math.cos(a) * r).toFixed(1)} ${(45 + Math.sin(a) * r).toFixed(1)}`;
      }
      return (
        <>
          <path className="fill" d={d + "Z"} fill="#8a9a7b" stroke="none" />
          <path d={d + "Z"} />
          <circle cx="60" cy="45" r="9" />
        </>
      );
    }
    case "kalender":
      return (
        <>
          <rect x="26" y="18" width="68" height="60" />
          <path d="M26 32h68M40 12v12M80 12v12" />
          {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => <rect key={`${c}-${r}`} x={32 + c * 15} y={38 + r * 12} width="9" height="7" strokeWidth="0.6" />))}
          <rect className="fill" x="77" y="62" width="9" height="7" fill="#b65a3a" stroke="none" />
        </>
      );
    case "sleutel":
      return (
        <>
          <circle cx="40" cy="45" r="16" />
          <circle cx="40" cy="45" r="6" />
          <path d="M56 45h44M88 45v10M96 45v8" />
          <rect className="fill" x="64" y="42" width="16" height="6" fill="#c2913a" stroke="none" />
        </>
      );
  }
}

export function MiniFig({ kind, className = "" }: { kind: MiniFigKind; className?: string }) {
  return (
    <svg viewBox="0 0 120 92" className={`minifig draw ${className}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
      <Body kind={kind} />
      <text x="2" y="90" fontFamily="Geist Mono" fontSize="6.5" fill="currentColor" stroke="none" opacity="0.7">
        FIG. {NUMBERS[kind]}
      </text>
    </svg>
  );
}

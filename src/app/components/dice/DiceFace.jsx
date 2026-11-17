const PIP_POSITIONS = [
  [50, 50],
  [32, 32],
  [50, 32],
  [68, 32],
  [32, 50],
  [68, 50],
  [32, 68],
  [50, 68],
  [68, 68],
];

const PIP_LAYOUTS = {
  1: [0],
  2: [1, 8],
  3: [1, 0, 8],
  4: [1, 3, 6, 8],
  5: [1, 3, 0, 6, 8],
  6: [1, 3, 4, 5, 6, 8],
};

const PENTAGON_OUTER = "50,6 91.85,36.4 75.86,85.6 24.14,85.6 8.15,36.4";
const PENTAGON_INNER = "50,23 75.68,41.66 65.86,71.84 34.14,71.84 24.32,41.66";
const HEXAGON = "94,50 72,88.1 28,88.1 6,50 28,11.9 72,11.9";
const TRIANGLE_A = "94,50 28,88.1 28,11.9";
const TRIANGLE_B = "6,50 72,88.1 72,11.9";

function faceTextStyle(value, base) {
  const length = String(value).length;
  return {
    fontFamily: "var(--font-cinzel), Georgia, serif",
    fontWeight: 800,
    fill: "var(--theme-accent-contrast)",
    fontSize: length >= 3 ? base * 0.7 : base,
  };
}

export default function DiceFace({ sides, value }) {
  const text = String(value);

  if (sides === 4) {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <polygon points="50,6 93,82 7,82" fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
        <line x1="50" y1="6" x2="7" y2="82" stroke="rgba(255,255,255,0.32)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="56.67" x2="50" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <line x1="50" y1="56.67" x2="93" y2="82" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <line x1="50" y1="56.67" x2="7" y2="82" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <text x="50" y="74" textAnchor="middle" style={faceTextStyle(value, 22)}>{text}</text>
      </svg>
    );
  }

  if (sides === 6) {
    const pips = PIP_LAYOUTS[Number(value)];
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <rect x="8" y="8" width="84" height="84" rx="17" fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
        <rect x="15.5" y="15.5" width="69" height="69" rx="11.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
        {pips ? (
          pips.map((index) => (
            <circle key={index} cx={PIP_POSITIONS[index][0]} cy={PIP_POSITIONS[index][1]} r="7" fill="var(--theme-accent-contrast)" />
          ))
        ) : (
          <text x="50" y="60" textAnchor="middle" style={faceTextStyle(value, 30)}>{text}</text>
        )}
      </svg>
    );
  }

  if (sides === 8) {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <polygon points="50,4 91,50 50,96 9,50" fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="50,4 91,50 50,50" fill="rgba(255,255,255,0.18)" />
        <polygon points="50,96 9,50 50,50" fill="rgba(0,0,0,0.26)" />
        <line x1="9" y1="50" x2="91" y2="50" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" />
        <text x="50" y="58" textAnchor="middle" style={faceTextStyle(value, 27)}>{text}</text>
      </svg>
    );
  }

  if (sides === 10 || sides === 100) {
    const isPercentile = sides === 100;
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <polygon points="50,2 87,31 50,98 13,31" fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="50,2 13,31 50,55" fill="rgba(255,255,255,0.16)" />
        <polygon points="50,98 87,31 50,55" fill="rgba(0,0,0,0.25)" />
        <line x1="13" y1="31" x2="87" y2="31" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <line x1="13" y1="31" x2="50" y2="55" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <line x1="87" y1="31" x2="50" y2="55" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        <text x="50" y="66" textAnchor="middle" style={faceTextStyle(value, isPercentile ? 19 : 24)}>{text}</text>
      </svg>
    );
  }

  if (sides === 12) {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <polygon points={PENTAGON_OUTER} fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={PENTAGON_INNER} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="8.15" y1="36.4" x2="50" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <text x="50" y="58" textAnchor="middle" style={faceTextStyle(value, 25)}>{text}</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <polygon points={HEXAGON} fill="var(--theme-accent)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="6,50 28,11.9 72,11.9" fill="rgba(255,255,255,0.1)" />
      <polygon points={TRIANGLE_A} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={TRIANGLE_B} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinejoin="round" />
      <text x="50" y="58" textAnchor="middle" style={faceTextStyle(value, 24)}>{text}</text>
    </svg>
  );
}

export function SanSavingClubLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sscEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="sscIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="sscGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* App Icon Container matched with Dashboard Slate/Indigo theme */}
      <rect width="240" height="240" rx="52" fill="url(#sscIndigoGrad)" />

      {/* Outer Rotating Ring in Emerald */}
      <circle cx="120" cy="120" r="72" stroke="url(#sscEmeraldGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray="300 60" />

      {/* Inner Monogram 'S' */}
      <path
        d="M138 92C138 84 130 78 120 78C108 78 100 85 100 94C100 110 140 108 140 128C140 140 128 148 116 148C104 148 96 140 96 132"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gold Savings Spark Badge */}
      <circle cx="165" cy="75" r="14" fill="url(#sscGoldGrad)" />
      <path d="M165 55V95M145 75H185" stroke="url(#sscGoldGrad)" strokeWidth="3" opacity="0.4" />
    </svg>
  );
}

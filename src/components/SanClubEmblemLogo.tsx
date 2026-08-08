export function SanClubEmblemLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Fondo */}
        <linearGradient id="scelBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#113F33" />
          <stop offset="100%" stopColor="#071B16" />
        </linearGradient>

        {/* Verde esmeralda principal */}
        <linearGradient id="scelTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="100%" stopColor="#16A085" />
        </linearGradient>

        {/* Oro/dorado para moneda y acentos */}
        <linearGradient id="scelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1C40F" />
          <stop offset="100%" stopColor="#D4AC0D" />
        </linearGradient>

        {/* Brillo suave integrado */}
        <filter id="scelSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base del icono (squircle) */}
      <rect x="16" y="16" width="480" height="480" rx="105" ry="105" fill="url(#scelBgGrad)" />

      {/* Borde interno sutil */}
      <rect
        x="18"
        y="18"
        width="476"
        height="476"
        rx="103"
        ry="103"
        fill="none"
        stroke="#2ECC71"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />

      {/* Fondo de comunidad: círculo de unión semitransparente */}
      <circle
        cx="256"
        cy="256"
        r="170"
        fill="#16A085"
        fillOpacity="0.08"
        stroke="url(#scelTealGrad)"
        strokeWidth="3"
        strokeDasharray="8 8"
        opacity="0.4"
      />

      {/* Anillo / órbita integrada de miembros */}
      <path
        d="M 120,290 A 150,150 0 1,1 392,290"
        fill="none"
        stroke="url(#scelTealGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Miembro superior izquierdo */}
      <g transform="translate(160, 160)">
        <circle cx="0" cy="0" r="16" fill="#113F33" stroke="#2ECC71" strokeWidth="3" />
        <circle cx="0" cy="-3" r="5" fill="#2ECC71" />
        <path d="M -7,8 C -7,4 7,4 7,8" fill="none" stroke="#2ECC71" strokeWidth="2" />
      </g>

      {/* Miembro superior central: líder/admin en dorado */}
      <g transform="translate(256, 115)" filter="url(#scelSoftGlow)">
        <circle cx="0" cy="0" r="20" fill="#113F33" stroke="#F1C40F" strokeWidth="3" />
        <circle cx="0" cy="-3" r="6" fill="#F1C40F" />
        <path d="M -9,10 C -9,5 9,5 9,10" fill="none" stroke="#F1C40F" strokeWidth="2.5" />
      </g>

      {/* Miembro superior derecho */}
      <g transform="translate(352, 160)">
        <circle cx="0" cy="0" r="16" fill="#113F33" stroke="#2ECC71" strokeWidth="3" />
        <circle cx="0" cy="-3" r="5" fill="#2ECC71" />
        <path d="M -7,8 C -7,4 7,4 7,8" fill="none" stroke="#2ECC71" strokeWidth="2" />
      </g>

      {/* Elemento central: alcancía y moneda fusionadas */}
      <g transform="translate(126, 175)">
        {/* Sombra proyectada */}
        <ellipse cx="130" cy="195" rx="85" ry="16" fill="#000000" opacity="0.3" />

        {/* Cuerpo del puerquito */}
        <ellipse cx="130" cy="120" rx="75" ry="55" fill="url(#scelTealGrad)" />

        {/* Oreja trasera */}
        <path d="M 65,75 L 75,45 L 90,70 Z" fill="#16A085" />
        {/* Oreja delantera */}
        <path d="M 78,70 L 92,40 L 105,65 Z" fill="url(#scelTealGrad)" />

        {/* Hocico */}
        <rect x="195" y="105" width="20" height="30" rx="8" fill="url(#scelTealGrad)" />
        <circle cx="205" cy="115" r="2.5" fill="#071B16" opacity="0.5" />
        <circle cx="205" cy="125" r="2.5" fill="#071B16" opacity="0.5" />

        {/* Patas */}
        <rect x="85" y="160" width="20" height="28" rx="6" fill="url(#scelTealGrad)" />
        <rect x="150" y="160" width="20" height="28" rx="6" fill="url(#scelTealGrad)" />

        {/* Ojo sonriente */}
        <path d="M 170,105 Q 176,98 182,105" fill="none" stroke="#071B16" strokeWidth="3" strokeLinecap="round" />

        {/* Ranura de la alcancía */}
        <ellipse cx="120" cy="67" rx="22" ry="5" fill="#071B16" opacity="0.5" />

        {/* Moneda entrando */}
        <g transform="translate(120, 38)" filter="url(#scelSoftGlow)">
          <circle cx="0" cy="0" r="24" fill="url(#scelGoldGrad)" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="0" r="18" fill="none" stroke="#D4AC0D" strokeWidth="1.5" />
          <text x="0" y="7" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="#604800" textAnchor="middle">
            $
          </text>
        </g>
      </g>

      {/* Base del club: sostén inferior */}
      <path d="M 180,410 Q 256,435 332,410" fill="none" stroke="url(#scelGoldGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <circle cx="256" cy="423" r="5" fill="#F1C40F" />
    </svg>
  );
}

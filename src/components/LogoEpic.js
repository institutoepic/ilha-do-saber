import React from 'react';

export default function LogoEpic({ size = 'md', white = false }) {
  const sizes = {
    sm: { helmet: 28, epic: '1rem', inst: '0.4rem', gap: 6 },
    md: { helmet: 40, epic: '1.4rem', inst: '0.5rem', gap: 8 },
    lg: { helmet: 60, epic: '2rem', inst: '0.65rem', gap: 10 },
    xl: { helmet: 90, epic: '3rem', inst: '0.85rem', gap: 14 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: s.gap,
      userSelect: 'none',
    }}>
      {/* Capacete espartano SVG */}
      <svg
        width={s.helmet}
        height={s.helmet}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brilho de fundo */}
        <circle cx="50" cy="50" r="48" fill="url(#helmetGlow)"/>
        {/* Corpo do capacete */}
        <path
          d="M20 45 C20 25 35 12 50 12 C65 12 80 25 80 45 L80 58 C80 58 72 62 50 62 C28 62 20 58 20 58 Z"
          fill="url(#helmetBody)"
        />
        {/* Viseira */}
        <path
          d="M30 48 L30 56 C30 56 38 60 50 60 C62 60 70 56 70 56 L70 48 C70 48 62 52 50 52 C38 52 30 48 30 48 Z"
          fill="url(#helmetVisor)"
        />
        {/* Abertura da viseira */}
        <path
          d="M33 44 L33 54 L50 57 L67 54 L67 44 L50 47 Z"
          fill="#0a0010"
          opacity="0.8"
        />
        {/* Crista do capacete */}
        <path
          d="M46 12 L46 6 C46 6 48 2 50 2 C52 2 54 6 54 6 L54 12"
          stroke="url(#crestGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Protetor do nariz */}
        <path
          d="M47 47 L47 68 C47 68 49 72 50 72 C51 72 53 68 53 68 L53 47"
          fill="url(#helmetBody)"
        />
        {/* Reflexo */}
        <path
          d="M28 38 C30 28 38 20 48 18"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <radialGradient id="helmetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,47,201,0.3)"/>
            <stop offset="100%" stopColor="rgba(139,47,201,0)"/>
          </radialGradient>
          <linearGradient id="helmetBody" x1="20" y1="12" x2="80" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C026D3"/>
            <stop offset="50%" stopColor="#8B2FC9"/>
            <stop offset="100%" stopColor="#4a1080"/>
          </linearGradient>
          <linearGradient id="helmetVisor" x1="30" y1="48" x2="70" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6B21A8"/>
            <stop offset="100%" stopColor="#3b0764"/>
          </linearGradient>
          <linearGradient id="crestGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#E91E8C"/>
            <stop offset="100%" stopColor="#C026D3"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Texto */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontSize: s.epic,
          fontWeight: '900',
          letterSpacing: '3px',
          background: 'linear-gradient(135deg, #E91E8C, #C026D3, #8B2FC9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>
          EPIC
        </span>
        <span style={{
          fontSize: s.inst,
          letterSpacing: '3px',
          color: white ? 'rgba(255,255,255,0.6)' : 'rgba(192,38,211,0.7)',
          fontWeight: '400',
          marginTop: '1px',
        }}>
          INSTITUTO
        </span>
      </div>
    </div>
  );
}
import React from 'react';

export default function LogoEpic({ size = 'md', white = false }) {
  const sizes = {
    sm: { helmet: 28, epic: '1rem',  inst: '0.4rem', gap: 6  },
    md: { helmet: 40, epic: '1.4rem', inst: '0.5rem', gap: 8  },
    lg: { helmet: 60, epic: '2rem',  inst: '0.65rem', gap: 10 },
    xl: { helmet: 90, epic: '3rem',  inst: '0.85rem', gap: 14 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none' }}>

      {/* Capacete espartano — idêntico ao logo Epic */}
      <svg
        width={s.helmet}
        height={s.helmet}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Corpo principal do capacete — arco superior */}
        <path
          d="M15 55 C15 25 30 8 50 8 C70 8 85 25 85 55 L85 70 L15 70 Z"
          fill="white"
        />

        {/* Protetor lateral esquerdo */}
        <path
          d="M15 70 L15 88 C15 88 20 95 28 95 L28 70 Z"
          fill="white"
        />

        {/* Protetor lateral direito */}
        <path
          d="M85 70 L85 88 C85 88 80 95 72 95 L72 70 Z"
          fill="white"
        />

        {/* Abertura central da viseira — recorte preto */}
        <path
          d="M28 58 L28 70 L50 73 L72 70 L72 58 C72 58 63 63 50 63 C37 63 28 58 28 58 Z"
          fill="black"
        />

        {/* Protetor do nariz — desce do centro */}
        <rect x="44" y="63" width="12" height="32" rx="3" fill="white"/>

        {/* Sombra interna da viseira para dar profundidade */}
        <path
          d="M28 55 C28 55 37 61 50 61 C63 61 72 55 72 55 L72 58 C72 58 63 63 50 63 C37 63 28 58 28 58 Z"
          fill="rgba(0,0,0,0.3)"
        />

        {/* Linha divisória horizontal da viseira */}
        <rect x="15" y="68" width="70" height="4" fill="black"/>

        {/* Base do capacete — queixo */}
        <path
          d="M28 95 L28 100 C28 105 35 110 44 110 L44 95 Z"
          fill="white"
        />
        <path
          d="M72 95 L72 100 C72 105 65 110 56 110 L56 95 Z"
          fill="white"
        />

        {/* Abertura inferior central — boca */}
        <rect x="44" y="95" width="12" height="15" rx="2" fill="black"/>
      </svg>

      {/* Texto EPIC + INSTITUTO */}
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
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}>
          INSTITUTO
        </span>
      </div>
    </div>
  );
}
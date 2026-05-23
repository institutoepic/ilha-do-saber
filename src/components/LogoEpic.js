import React from 'react';

export default function LogoEpic({ size = 'md' }) {
  const sizes = {
    sm: { helmet: 28, epic: '1rem',  inst: '0.4rem', gap: 6  },
    md: { helmet: 40, epic: '1.4rem', inst: '0.5rem', gap: 8  },
    lg: { helmet: 60, epic: '2rem',  inst: '0.65rem', gap: 10 },
    xl: { helmet: 90, epic: '3rem',  inst: '0.85rem', gap: 14 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none' }}>
      <img
        src="/logo-epic.png"
        alt="Logo Epic"
        style={{
          width: s.helmet,
          height: s.helmet,
          objectFit: 'contain',
          filter: 'brightness(1.1)',
        }}
      />
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
          color: 'rgba(192,38,211,0.7)',
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
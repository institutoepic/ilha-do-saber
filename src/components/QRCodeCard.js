import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeCard({ baseUrl }) {
  const [mostrando, setMostrando] = useState('aluno');

  const links = {
    aluno: { url: baseUrl, label: 'Alunos', cor: '#E91E8C' },
    professor: { url: `${baseUrl}/professor`, label: 'Professor', cor: '#8B2FC9' },
  };

  const atual = links[mostrando];

  return (
    <div style={styles.container}>
      <p style={styles.titulo}>Acesse pelo celular</p>
      <div style={styles.abas}>
        {Object.entries(links).map(([key, val]) => (
          <button
            key={key}
            style={{
              ...styles.aba,
              background: mostrando === key ? val.cor : 'rgba(255,255,255,0.05)',
              border: mostrando === key
                ? `1px solid ${val.cor}`
                : '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={() => setMostrando(key)}
          >
            {val.label}
          </button>
        ))}
      </div>
      <div style={{ ...styles.qrWrap, boxShadow: `0 0 20px ${atual.cor}44` }}>
        <QRCodeSVG
          value={atual.url}
          size={140}
          bgColor="#ffffff"
          fgColor="#0a0010"
          level="M"
          includeMargin={true}
        />
      </div>
      <div style={styles.urlBox}>
        <span style={{ ...styles.urlTexto, color: atual.cor }}>
          {atual.url}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '14px',
    border: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  titulo: {
    fontSize: '0.7rem',
    color: '#C026D3',
    margin: 0,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  abas: {
    display: 'flex',
    gap: '6px',
    width: '100%',
  },
  aba: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.2s',
  },
  qrWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    padding: '4px',
    background: 'white',
  },
  urlBox: {
    background: 'rgba(139,47,201,0.1)',
    borderRadius: '8px',
    padding: '6px 10px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  urlTexto: {
    fontSize: '0.68rem',
    wordBreak: 'break-all',
    fontWeight: '600',
  },
};
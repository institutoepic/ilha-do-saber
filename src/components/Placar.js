import React from 'react';

const CORES = [
  '#e91e63','#9c27b0','#3f51b5','#00897b',
  '#f57f17','#c62828','#2e7d32','#1565c0',
  '#6a1b9a','#00838f','#558b2f','#ef6c00',
];

const MEDALHAS = ['🥇','🥈','🥉'];

export default function Placar({ alunos }) {
  const lista = Object.entries(alunos || {})
    .map(([id, a]) => ({ id, ...a }))
    .sort((a, b) => (b.checkpoint || 0) - (a.checkpoint || 0));

  return (
    <div style={styles.container}>
      <div style={styles.titulo}>
        <span style={styles.trofeu}>🏆</span>
        <span style={styles.tituloTexto}>Placar</span>
      </div>
      <div style={styles.lista}>
        {lista.slice(0, 8).map((aluno, i) => (
          <div key={aluno.id} style={{
            ...styles.item,
            background: i === 0
              ? 'rgba(240,192,64,0.2)'
              : 'rgba(255,255,255,0.05)',
            borderLeft: `3px solid ${CORES[i % CORES.length]}`,
          }}>
            <span style={styles.posicao}>
              {i < 3 ? MEDALHAS[i] : `${i + 1}º`}
            </span>
            <span style={styles.avatarEmoji}>{aluno.avatar}</span>
            <span style={styles.nome}>{aluno.nome?.split(' ')[0]}</span>
            <span style={styles.checkpoint}>
              {'⬡'.repeat(Math.min(aluno.checkpoint || 0, 5))}
            </span>
          </div>
        ))}
        {lista.length === 0 && (
          <p style={styles.vazio}>Aguardando alunos...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(0,0,0,0.35)',
    borderRadius: '16px',
    padding: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    minWidth: '180px',
  },
  titulo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '8px',
  },
  trofeu: { fontSize: '1.2rem' },
  tituloTexto: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#f0c040',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '8px',
  },
  posicao: { fontSize: '0.85rem', minWidth: '24px' },
  avatarEmoji: { fontSize: '1.1rem' },
  nome: {
    fontSize: '0.8rem',
    color: 'white',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  checkpoint: {
    fontSize: '0.6rem',
    color: '#f0c040',
    letterSpacing: '1px',
  },
  vazio: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '8px 0',
  },
};
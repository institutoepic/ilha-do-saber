import React from 'react';

const CORES = [
  '#E91E8C','#C026D3','#8B2FC9','#3f51b5',
  '#00897b','#f57f17','#c62828','#2e7d32',
  '#1565c0','#6a1b9a','#00838f','#ef6c00',
];

const MEDALHAS = ['🥇','🥈','🥉'];

export default function Placar({ alunos }) {
  const lista = Object.entries(alunos || {})
    .map(([id, a]) => ({ id, ...a }))
    .sort((a, b) => (b.checkpoint || 0) - (a.checkpoint || 0));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerEmoji}>🏆</span>
        <span style={styles.headerTitulo}>PLACAR</span>
      </div>

      {/* Lista */}
      <div style={styles.lista}>
        {lista.slice(0, 8).map((aluno, i) => (
          <div key={aluno.id} style={{
            ...styles.item,
            background: i === 0
              ? 'linear-gradient(135deg, rgba(233,30,140,0.2), rgba(139,47,201,0.2))'
              : 'rgba(255,255,255,0.04)',
            border: i === 0
              ? '1px solid rgba(233,30,140,0.4)'
              : '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Posição */}
            <span style={styles.posicao}>
              {i < 3 ? MEDALHAS[i] : (
                <span style={{ ...styles.posNum, color: CORES[i % CORES.length] }}>
                  {i + 1}º
                </span>
              )}
            </span>

            {/* Avatar */}
            <div style={{
              ...styles.avatarCircle,
              background: CORES[i % CORES.length],
              boxShadow: i === 0
                ? `0 0 12px ${CORES[i % CORES.length]}`
                : 'none',
            }}>
              <span style={styles.avatarEmoji}>{aluno.avatar}</span>
            </div>

            {/* Nome e progresso */}
            <div style={styles.info}>
              <span style={styles.nome}>{aluno.nome?.split(' ')[0]}</span>
              <div style={styles.progressoMini}>
                {[1,2,3,4,5].map(cp => (
                  <div key={cp} style={{
                    ...styles.progressoDot,
                    background: (aluno.checkpoint || 0) >= cp
                      ? CORES[i % CORES.length]
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: (aluno.checkpoint || 0) >= cp
                      ? `0 0 6px ${CORES[i % CORES.length]}`
                      : 'none',
                  }}/>
                ))}
              </div>
            </div>

            {/* Checkpoint */}
            <div style={styles.cpBadge}>
              <span style={{ ...styles.cpNum, color: CORES[i % CORES.length] }}>
                {aluno.checkpoint || 0}
              </span>
              <span style={styles.cpLabel}>CP</span>
            </div>
          </div>
        ))}

        {lista.length === 0 && (
          <div style={styles.vazio}>
            <span style={styles.vazioEmoji}>⏳</span>
            <p style={styles.vazioTexto}>Aguardando jogadores...</p>
          </div>
        )}
      </div>

      {/* Total */}
      {lista.length > 0 && (
        <div style={styles.footer}>
          <span style={styles.footerTexto}>
            {lista.length} explorador{lista.length !== 1 ? 'es' : ''} na ilha
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(10,0,20,0.8)',
    borderRadius: '18px',
    border: '1px solid rgba(139,47,201,0.3)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(139,47,201,0.15)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(139,47,201,0.3), rgba(233,30,140,0.2))',
    borderBottom: '1px solid rgba(139,47,201,0.3)',
  },
  headerEmoji: { fontSize: '1.1rem' },
  headerTitulo: {
    fontSize: '0.75rem',
    fontWeight: '900',
    letterSpacing: '3px',
    background: 'linear-gradient(135deg, #E91E8C, #C026D3)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '10px',
    transition: 'all 0.3s',
  },
  posicao: { fontSize: '1rem', minWidth: '26px', textAlign: 'center' },
  posNum: { fontSize: '0.8rem', fontWeight: 'bold' },
  avatarCircle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: '1rem' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  nome: {
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  progressoMini: { display: 'flex', gap: '3px' },
  progressoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s',
  },
  cpBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '28px',
  },
  cpNum: { fontSize: '1rem', fontWeight: '900', lineHeight: 1 },
  cpLabel: { fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' },
  vazio: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    gap: '8px',
  },
  vazioEmoji: { fontSize: '1.8rem' },
  vazioTexto: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
  footer: {
    padding: '8px 16px',
    borderTop: '1px solid rgba(139,47,201,0.2)',
    textAlign: 'center',
  },
  footerTexto: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' },
};
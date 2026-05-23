import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';

const PERGUNTAS_VAZIAS = Array(5).fill(null).map(() => ({
  pergunta: '',
  opcoes: ['', '', '', ''],
  resposta_certa: '',
}));

export default function Professor() {
  const [alunos, setAlunos] = useState({});
  const [perguntas, setPerguntas] = useState(PERGUNTAS_VAZIAS);
  const [perguntaAtual, setPerguntaAtual] = useState(-1);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState('perguntas');

  useEffect(() => {
    onValue(ref(db, 'sala/alunos'), snap => setAlunos(snap.val() || {}));
    onValue(ref(db, 'sala/pergunta_atual'), snap => {
      const v = snap.val();
      setPerguntaAtual(v !== null && v !== undefined ? v : -1);
    });
    onValue(ref(db, 'sala/perguntas'), snap => {
      if (snap.val()) setPerguntas(snap.val());
    });
  }, []);

  const lista = Object.values(alunos);
  const responderam = lista.filter(a => a.respondeu).length;
  const acertaram = lista.filter(a => a.acertou).length;

  function atualizarPergunta(i, campo, valor) {
    const novas = perguntas.map((p, idx) =>
      idx === i ? { ...p, [campo]: valor } : p
    );
    setPerguntas(novas);
  }

  function atualizarOpcao(pi, oi, valor) {
    const novas = perguntas.map((p, idx) => {
      if (idx !== pi) return p;
      const opcoes = [...p.opcoes];
      opcoes[oi] = valor;
      return { ...p, opcoes };
    });
    setPerguntas(novas);
  }

  async function salvarPerguntas() {
    setSalvando(true);
    await set(ref(db, 'sala/perguntas'), perguntas);
    setTimeout(() => setSalvando(false), 1200);
  }

  async function lancarPergunta(i) {
    const p = perguntas[i];
    if (!p.pergunta.trim() || !p.resposta_certa.trim()) {
      alert('Preencha a pergunta e a resposta certa!');
      return;
    }
    const opcoesFiltradas = p.opcoes.filter(o => o.trim() !== '');
    if (!opcoesFiltradas.includes(p.resposta_certa.trim())) {
      alert('A resposta certa deve ser igual a uma das opções!');
      return;
    }
    await set(ref(db, 'sala/missao_atual'), {
      pergunta: p.pergunta,
      opcoes: opcoesFiltradas,
      resposta_certa: p.resposta_certa.trim(),
      index: i,
      timestamp: Date.now(),
    });
    await set(ref(db, 'sala/pergunta_atual'), i);
    // Reseta respostas dos alunos
    Object.keys(alunos).forEach(id => {
      set(ref(db, `sala/alunos/${id}/respondeu`), false);
      set(ref(db, `sala/alunos/${id}/acertou`), false);
    });
  }

  async function encerrarJogo() {
    if (!window.confirm('Encerrar o jogo e limpar tudo?')) return;
    await remove(ref(db, 'sala'));
    setPerguntas(PERGUNTAS_VAZIAS);
    setPerguntaAtual(-1);
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
            <span style={styles.logoInstituto}>INSTITUTO</span>
          <span style={styles.logoEpic}>EPIC</span>
          
        </div>
        <h1 style={styles.titulo}>Painel do Professor</h1>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{lista.length}</span>
            <span style={styles.statLabel}>alunos</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{responderam}</span>
            <span style={styles.statLabel}>responderam</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNum, color: '#4caf50' }}>{acertaram}</span>
            <span style={styles.statLabel}>acertaram</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={styles.abas}>
        {['perguntas', 'alunos'].map(a => (
          <button
            key={a}
            style={{ ...styles.aba, ...(aba === a ? styles.abaAtiva : {}) }}
            onClick={() => setAba(a)}
          >
            {a === 'perguntas' ? '📝 Perguntas' : '👥 Alunos'}
          </button>
        ))}
      </div>

      {/* Aba Perguntas */}
      {aba === 'perguntas' && (
        <div style={styles.conteudo}>
          {perguntas.map((p, i) => (
            <div key={i} style={{
              ...styles.card,
              borderLeft: perguntaAtual === i
                ? '4px solid #f0c040'
                : '4px solid rgba(255,255,255,0.1)',
            }}>
              <div style={styles.cardHeader}>
                <span style={styles.cardNumero}>Pergunta {i + 1}</span>
                {perguntaAtual === i && (
                  <span style={styles.badge}>● AO VIVO</span>
                )}
              </div>
              <input
                style={styles.input}
                placeholder={`Digite a pergunta ${i + 1}...`}
                value={p.pergunta}
                onChange={e => atualizarPergunta(i, 'pergunta', e.target.value)}
              />
              <div style={styles.opcoesGrid}>
                {p.opcoes.map((op, j) => (
                  <input
                    key={j}
                    style={styles.inputOpcao}
                    placeholder={`Opção ${j + 1}`}
                    value={op}
                    onChange={e => atualizarOpcao(i, j, e.target.value)}
                  />
                ))}
              </div>
              <input
                style={{ ...styles.input, borderColor: '#4caf50', marginBottom: '12px' }}
                placeholder="✅ Resposta certa (igual a uma das opções)"
                value={p.resposta_certa}
                onChange={e => atualizarPergunta(i, 'resposta_certa', e.target.value)}
              />
              <button
                style={{
                  ...styles.botaoLancar,
                  background: perguntaAtual === i
                    ? 'rgba(240,192,64,0.2)'
                    : '#f0c040',
                  color: perguntaAtual === i ? '#f0c040' : '#1a1a2e',
                  border: perguntaAtual === i ? '2px solid #f0c040' : 'none',
                }}
                onClick={() => lancarPergunta(i)}
              >
                {perguntaAtual === i ? '🔄 Relançar' : '🚀 Lançar pergunta'}
              </button>
            </div>
          ))}

          <div style={styles.botoesRodape}>
            <button style={styles.botaoSalvar} onClick={salvarPerguntas}>
              {salvando ? '✅ Salvo!' : '💾 Salvar perguntas'}
            </button>
            <button style={styles.botaoEncerrar} onClick={encerrarJogo}>
              🗑️ Encerrar jogo
            </button>
          </div>
        </div>
      )}

      {/* Aba Alunos */}
      {aba === 'alunos' && (
        <div style={styles.conteudo}>
          <div style={styles.alunosGrid}>
            {lista.map((aluno, i) => (
              <div key={i} style={{
                ...styles.alunoCard,
                background: aluno.respondeu
                  ? aluno.acertou
                    ? 'rgba(76,175,80,0.2)'
                    : 'rgba(244,67,54,0.2)'
                  : 'rgba(255,255,255,0.05)',
                border: aluno.respondeu
                  ? aluno.acertou
                    ? '1px solid #4caf50'
                    : '1px solid #f44336'
                  : '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={styles.alunoAvatar}>{aluno.avatar}</span>
                <span style={styles.alunoNome}>{aluno.nome}</span>
                <span style={styles.alunoStatus}>
                  {aluno.respondeu
                    ? aluno.acertou ? '✅' : '❌'
                    : '⏳'}
                </span>
                <span style={styles.alunoCheckpoint}>
                  CP {aluno.checkpoint || 0}
                </span>
              </div>
            ))}
            {lista.length === 0 && (
              <p style={styles.vazio}>Nenhum aluno conectado ainda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: 'white',
    paddingBottom: '40px',
  },
  header: {
    background: 'rgba(0,0,0,0.3)',
    padding: '20px 30px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(240,192,64,0.15)',
    border: '1px solid #f0c040',
    borderRadius: '10px',
    padding: '6px 14px',
  },
  logoEpic: {
    fontSize: '1.4rem',
    fontWeight: '900',
    color: '#f0c040',
    letterSpacing: '3px',
  },
  logoInstituto: {
    fontSize: '0.55rem',
    color: 'rgba(240,192,64,0.7)',
    letterSpacing: '2px',
  },
  titulo: {
    fontSize: '1.4rem',
    fontWeight: '600',
    flex: 1,
  },
  stats: { display: 'flex', gap: '12px' },
  statCard: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNum: { fontSize: '1.4rem', fontWeight: 'bold', color: '#f0c040' },
  statLabel: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  abas: {
    display: 'flex',
    gap: '4px',
    padding: '16px 30px 0',
  },
  aba: {
    padding: '10px 24px',
    borderRadius: '10px 10px 0 0',
    border: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  abaAtiva: {
    background: 'rgba(240,192,64,0.15)',
    color: '#f0c040',
    borderBottom: '2px solid #f0c040',
  },
  conteudo: {
    padding: '20px 30px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  cardNumero: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#f0c040',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  badge: {
    fontSize: '0.7rem',
    background: 'rgba(240,192,64,0.2)',
    color: '#f0c040',
    padding: '2px 8px',
    borderRadius: '20px',
    border: '1px solid #f0c040',
    animation: 'pulse 1.5s infinite',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    marginBottom: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  opcoesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '10px',
  },
  inputOpcao: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  botaoLancar: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  botoesRodape: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  botaoSalvar: {
    flex: 1,
    padding: '14px',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    border: '1px solid #4caf50',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  botaoEncerrar: {
    padding: '14px 24px',
    background: 'rgba(244,67,54,0.15)',
    color: '#f44336',
    border: '1px solid #f44336',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  alunosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px',
  },
  alunoCard: {
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  alunoAvatar: { fontSize: '2rem' },
  alunoNome: { fontSize: '0.8rem', color: 'white', textAlign: 'center' },
  alunoStatus: { fontSize: '1.2rem' },
  alunoCheckpoint: {
    fontSize: '0.7rem',
    color: '#f0c040',
    background: 'rgba(240,192,64,0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  vazio: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    padding: '40px',
    gridColumn: '1/-1',
  },
};
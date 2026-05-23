import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';
import LogoEpic from '../components/LogoEpic';

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
    setPerguntas(perguntas.map((p, idx) =>
      idx === i ? { ...p, [campo]: valor } : p
    ));
  }

  function atualizarOpcao(pi, oi, valor) {
    setPerguntas(perguntas.map((p, idx) => {
      if (idx !== pi) return p;
      const opcoes = [...p.opcoes];
      opcoes[oi] = valor;
      return { ...p, opcoes };
    }));
  }

  async function salvarPerguntas() {
    setSalvando(true);
    await set(ref(db, 'sala/perguntas'), perguntas);
    setTimeout(() => setSalvando(false), 1500);
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

  const CHECKPOINT_EMOJIS = ['🚩','🌳','🌋','🏖️','🪨','🏆'];

  return (
    <div style={styles.container}>
      <div style={styles.bgParticles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}/>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <LogoEpic size="md"/>
        <div style={styles.headerCenter}>
          <h1 style={styles.titulo}>Painel do Professor</h1>
          <p style={styles.subtitulo}>🌴 Ilha do Saber</p>
        </div>
        <div style={styles.statsRow}>
          {[
            { num: lista.length, label: 'jogadores', color: '#C026D3' },
            { num: responderam, label: 'responderam', color: '#8B2FC9' },
            { num: acertaram, label: 'acertaram', color: '#4caf50' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <span style={{ ...styles.statNum, color: s.color }}>{s.num}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Abas */}
      <div style={styles.abas}>
        {[
          { id: 'perguntas', label: '📝 Perguntas' },
          { id: 'alunos', label: '👥 Alunos' },
        ].map(a => (
          <button
            key={a.id}
            style={{ ...styles.aba, ...(aba === a.id ? styles.abaAtiva : {}) }}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Aba Perguntas */}
      {aba === 'perguntas' && (
        <div style={styles.conteudo}>
          <div style={styles.perguntasGrid}>
            {perguntas.map((p, i) => (
              <div key={i} style={{
                ...styles.card,
                borderTop: perguntaAtual === i
                  ? '3px solid #E91E8C'
                  : '3px solid rgba(139,47,201,0.3)',
                boxShadow: perguntaAtual === i
                  ? '0 0 20px rgba(233,30,140,0.2)'
                  : 'none',
              }}>
                {/* Header do card */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardNumeroWrap}>
                    <span style={styles.cardEmoji}>{CHECKPOINT_EMOJIS[i + 1]}</span>
                    <span style={styles.cardNumero}>Pergunta {i + 1}</span>
                  </div>
                  {perguntaAtual === i && (
                    <span style={styles.badgeAoVivo}>● AO VIVO</span>
                  )}
                  {perguntaAtual > i && (
                    <span style={styles.badgeConcluida}>✅ Concluída</span>
                  )}
                </div>

                {/* Pergunta */}
                <textarea
                  style={styles.textarea}
                  placeholder={`Digite a pergunta ${i + 1}...`}
                  value={p.pergunta}
                  onChange={e => atualizarPergunta(i, 'pergunta', e.target.value)}
                  rows={2}
                />

                {/* Opções */}
                <div style={styles.opcoesGrid}>
                  {p.opcoes.map((op, j) => (
                    <div key={j} style={styles.opcaoWrap}>
                      <span style={styles.opcaoLetra}>
                        {['A','B','C','D'][j]}
                      </span>
                      <input
                        style={styles.inputOpcao}
                        placeholder={['A','B','C','D'][j]}
                        value={op}
                        onChange={e => atualizarOpcao(i, j, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Resposta certa */}
                <div style={styles.respostaWrap}>
                  <span style={styles.respostaLabel}>✅ Resposta certa:</span>
                  <input
                    style={styles.inputResposta}
                    placeholder="Igual a uma das opções acima"
                    value={p.resposta_certa}
                    onChange={e => atualizarPergunta(i, 'resposta_certa', e.target.value)}
                  />
                </div>

                {/* Botão lançar */}
                <button
                  style={{
                    ...styles.botaoLancar,
                    background: perguntaAtual === i
                      ? 'transparent'
                      : 'linear-gradient(135deg, #E91E8C, #C026D3)',
                    border: perguntaAtual === i
                      ? '2px solid #E91E8C'
                      : 'none',
                    color: 'white',
                    boxShadow: perguntaAtual === i
                      ? '0 0 15px rgba(233,30,140,0.3)'
                      : '0 4px 15px rgba(233,30,140,0.4)',
                  }}
                  onClick={() => lancarPergunta(i)}
                >
                  {perguntaAtual === i ? '🔄 Relançar pergunta' : '🚀 Lançar pergunta'}
                </button>
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <div style={styles.rodape}>
            <button style={styles.botaoSalvar} onClick={salvarPerguntas}>
              {salvando ? '✅ Salvo com sucesso!' : '💾 Salvar todas as perguntas'}
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
          {lista.length === 0 ? (
            <div style={styles.vazioWrap}>
              <span style={styles.vazioEmoji}>⏳</span>
              <p style={styles.vazioTexto}>Nenhum aluno conectado ainda.</p>
              <p style={styles.vazioSub}>Os alunos devem acessar o link e entrar na sala.</p>
            </div>
          ) : (
            <div style={styles.alunosGrid}>
              {lista.map((aluno, i) => (
                <div key={i} style={{
                  ...styles.alunoCard,
                  background: aluno.respondeu
                    ? aluno.acertou
                      ? 'rgba(76,175,80,0.15)'
                      : 'rgba(244,67,54,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: aluno.respondeu
                    ? aluno.acertou
                      ? '1px solid rgba(76,175,80,0.5)'
                      : '1px solid rgba(244,67,54,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={styles.alunoAvatarWrap}>
                    <span style={styles.alunoAvatar}>{aluno.avatar}</span>
                    <span style={styles.alunoStatus}>
                      {aluno.respondeu ? (aluno.acertou ? '✅' : '❌') : '⏳'}
                    </span>
                  </div>
                  <span style={styles.alunoNome}>{aluno.nome}</span>
                  <div style={styles.alunoCpWrap}>
                    <span style={styles.alunoCp}>CP {aluno.checkpoint || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0010, #120020, #0a0818)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: '40px',
  },
  bgParticles: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(192,38,211,0.6)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 30px',
    background: 'rgba(0,0,0,0.4)',
    borderBottom: '1px solid rgba(139,47,201,0.3)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerCenter: { textAlign: 'center', flex: 1 },
  titulo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  subtitulo: {
    fontSize: '0.8rem',
    color: 'rgba(192,38,211,0.7)',
    margin: '4px 0 0',
  },
  statsRow: { display: 'flex', gap: '10px' },
  statCard: {
    background: 'rgba(139,47,201,0.1)',
    border: '1px solid rgba(139,47,201,0.2)',
    borderRadius: '12px',
    padding: '10px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: { fontSize: '1.6rem', fontWeight: '900', lineHeight: 1 },
  statLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  abas: {
    display: 'flex',
    gap: '4px',
    padding: '16px 30px 0',
    position: 'relative',
    zIndex: 1,
  },
  aba: {
    padding: '10px 28px',
    borderRadius: '12px 12px 0 0',
    border: '1px solid rgba(139,47,201,0.2)',
    borderBottom: 'none',
    background: 'rgba(255,255,255,0.03)',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  abaAtiva: {
    background: 'rgba(139,47,201,0.15)',
    color: '#C026D3',
    borderColor: 'rgba(139,47,201,0.4)',
  },
  conteudo: {
    padding: '24px 30px',
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  perguntasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  cardNumeroWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  cardEmoji: { fontSize: '1.3rem', flexShrink: 0 },
  cardNumero: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#C026D3',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  badgeAoVivo: {
    fontSize: '0.6rem',
    background: 'rgba(233,30,140,0.2)',
    color: '#E91E8C',
    padding: '3px 8px',
    borderRadius: '20px',
    border: '1px solid rgba(233,30,140,0.5)',
    animation: 'blink 1.5s infinite',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  badgeConcluida: {
    fontSize: '0.6rem',
    background: 'rgba(76,175,80,0.15)',
    color: '#4caf50',
    padding: '3px 8px',
    borderRadius: '20px',
    border: '1px solid rgba(76,175,80,0.3)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(139,47,201,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '0.88rem',
    resize: 'none',
    outline: 'none',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    boxSizing: 'border-box',
    lineHeight: '1.5',
    display: 'block',
  },
  opcoesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  opcaoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '4px 8px 4px 6px',
    border: '1px solid rgba(255,255,255,0.07)',
    boxSizing: 'border-box',
    minWidth: 0,
    overflow: 'hidden',
  },
  opcaoLetra: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(139,47,201,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: '#C026D3',
    flexShrink: 0,
  },
  inputOpcao: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    padding: '6px 0',
    border: 'none',
    background: 'transparent',
    color: 'white',
    fontSize: '0.82rem',
    outline: 'none',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  respostaWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  respostaLabel: {
    fontSize: '0.72rem',
    color: 'rgba(76,175,80,0.8)',
    fontWeight: '600',
  },
  inputResposta: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(76,175,80,0.3)',
    background: 'rgba(76,175,80,0.05)',
    color: 'white',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    boxSizing: 'border-box',
    display: 'block',
  },
  botaoLancar: {
    width: '100%',
    padding: '11px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    letterSpacing: '0.5px',
    boxSizing: 'border-box',
  },
  rodape: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  botaoSalvar: {
    flex: 1,
    padding: '14px',
    background: 'rgba(76,175,80,0.15)',
    color: '#4caf50',
    border: '1px solid rgba(76,175,80,0.4)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  botaoEncerrar: {
    padding: '14px 24px',
    background: 'rgba(244,67,54,0.1)',
    color: '#f44336',
    border: '1px solid rgba(244,67,54,0.3)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  alunosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  alunoCard: {
    borderRadius: '14px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    backdropFilter: 'blur(10px)',
  },
  alunoAvatarWrap: { position: 'relative' },
  alunoAvatar: { fontSize: '2.2rem' },
  alunoStatus: { position: 'absolute', top: -4, right: -8, fontSize: '0.9rem' },
  alunoNome: { fontSize: '0.8rem', color: 'white', textAlign: 'center', fontWeight: '500' },
  alunoCpWrap: {
    background: 'rgba(139,47,201,0.2)',
    borderRadius: '20px',
    padding: '2px 10px',
  },
  alunoCp: { fontSize: '0.7rem', color: '#C026D3', fontWeight: '700' },
  vazioWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  vazioEmoji: { fontSize: '3rem' },
  vazioTexto: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' },
  vazioSub: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' },
};
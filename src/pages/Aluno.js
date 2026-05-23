import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, push } from 'firebase/database';
import LogoEpic from '../components/LogoEpic';

const AVATARES = ['🧑‍🚀','🧜','🧙','🦸','🧝','🥷','🧞','🦄'];
const CORES = ['#E91E8C','#C026D3','#8B2FC9','#3f51b5','#00897b','#f57f17','#c62828','#2e7d32'];

export default function Aluno() {
  const [nome, setNome] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [entrou, setEntrou] = useState(false);
  const [alunoId, setAlunoId] = useState(null);
  const [missao, setMissao] = useState(null);
  const [respondeu, setRespondeu] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [checkpoint, setCheckpoint] = useState(0);
  const [posicao, setPosicao] = useState(null);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);

  useEffect(() => {
    if (!alunoId) return;
    onValue(ref(db, 'sala/missao_atual'), snap => {
      setMissao(snap.val());
      setRespondeu(false);
      setResultado(null);
      setOpcaoSelecionada(null);
    });
    onValue(ref(db, 'sala/alunos'), snap => {
      const data = snap.val() || {};
      const lista = Object.values(data).sort(
        (a, b) => (b.checkpoint || 0) - (a.checkpoint || 0)
      );
      setTotalAlunos(lista.length);
      const pos = lista.findIndex(a => a.nome === nome);
      setPosicao(pos + 1);
    });
  }, [alunoId, nome]);

  function entrarNaSala() {
    if (!nome.trim()) return;
    const novoRef = push(ref(db, 'sala/alunos'));
    const id = novoRef.key;
    set(novoRef, {
      nome: nome.trim(),
      avatar: AVATARES[avatarIndex],
      respondeu: false,
      acertou: false,
      checkpoint: 0,
      entrou: Date.now(),
    });
    setAlunoId(id);
    setEntrou(true);
  }

  async function responder(opcao) {
    if (respondeu || !alunoId) return;
    setOpcaoSelecionada(opcao);
    const acertou = opcao === missao.resposta_certa;
    const novoCheckpoint = acertou ? checkpoint + 1 : checkpoint;
    await set(ref(db, `sala/alunos/${alunoId}`), {
      nome: nome.trim(),
      avatar: AVATARES[avatarIndex],
      respondeu: true,
      acertou,
      checkpoint: novoCheckpoint,
      entrou: Date.now(),
    });
    setRespondeu(true);
    setResultado(acertou);
    if (acertou) setCheckpoint(novoCheckpoint);
  }

  const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : null;

  // TELA DE ENTRADA
  if (!entrou) {
    return (
      <div style={styles.container}>
        <Particles/>
        <div style={styles.loginBox}>
          <LogoEpic size="lg"/>
          <h1 style={styles.tituloJogo}>🌴 Ilha do Saber</h1>
          <p style={styles.subtitulo}>Escolha seu explorador e embarque na aventura!</p>

          <div style={styles.avatarGrid}>
            {AVATARES.map((av, i) => (
              <button
                key={i}
                onClick={() => setAvatarIndex(i)}
                style={{
                  ...styles.avatarBtn,
                  background: i === avatarIndex
                    ? `rgba(${hexToRgb(CORES[i])}, 0.3)`
                    : 'rgba(255,255,255,0.04)',
                  border: i === avatarIndex
                    ? `2px solid ${CORES[i]}`
                    : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: i === avatarIndex
                    ? `0 0 20px ${CORES[i]}66`
                    : 'none',
                  transform: i === avatarIndex ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <span style={styles.avatarEmoji}>{av}</span>
                {i === avatarIndex && (
                  <div style={{ ...styles.avatarCheck, background: CORES[i] }}>✓</div>
                )}
              </button>
            ))}
          </div>

          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>🧭</span>
            <input
              style={styles.input}
              placeholder="Seu nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrarNaSala()}
              maxLength={20}
            />
          </div>

          <button
            style={{
              ...styles.botaoEntrar,
              opacity: nome.trim() ? 1 : 0.4,
              cursor: nome.trim() ? 'pointer' : 'not-allowed',
            }}
            onClick={entrarNaSala}
            disabled={!nome.trim()}
          >
            <span>Embarcar na Missão</span>
            <span style={styles.botaoIcon}>🚀</span>
          </button>

          <p style={styles.disclaimer}>
            Você está prestes a explorar a Ilha do Saber!
          </p>
        </div>
      </div>
    );
  }

  // AGUARDANDO
  if (!missao) {
    return (
      <div style={styles.container}>
        <Particles/>
        <div style={styles.aguardandoBox}>
          <LogoEpic size="sm"/>

          <div style={styles.avatarGrandeWrap}>
            <div style={{
              ...styles.avatarGrandeBg,
              background: `radial-gradient(circle, ${CORES[avatarIndex]}44, transparent)`,
              boxShadow: `0 0 40px ${CORES[avatarIndex]}66`,
            }}/>
            <span style={styles.avatarGrande}>{AVATARES[avatarIndex]}</span>
          </div>

          <h2 style={styles.nomeAluno}>{nome}</h2>

          <div style={styles.badgesRow}>
            <div style={styles.checkpointBadge}>
              <span style={styles.cpNum}>{checkpoint}</span>
              <span style={styles.cpSlash}>/</span>
              <span style={styles.cpTotal}>5</span>
              <span style={styles.cpLabel}>checkpoints</span>
            </div>
            {posicao && (
              <div style={styles.posicaoBadge}>
                {medalha || `${posicao}º`} de {totalAlunos}
              </div>
            )}
          </div>

          {/* Trilha mini */}
          <div style={styles.trilhaMiniWrap}>
            {['🚩','🌳','🌋','🏖️','🪨','🏆'].map((emoji, i) => (
              <React.Fragment key={i}>
                <div style={{
                  ...styles.cpMiniItem,
                  background: i <= checkpoint
                    ? `linear-gradient(135deg, #E91E8C, #8B2FC9)`
                    : 'rgba(255,255,255,0.06)',
                  border: i === checkpoint
                    ? '2px solid #E91E8C'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: i <= checkpoint
                    ? '0 0 12px rgba(233,30,140,0.4)'
                    : 'none',
                }}>
                  {emoji}
                </div>
                {i < 5 && (
                  <div style={{
                    ...styles.cpConector,
                    background: i < checkpoint
                      ? 'linear-gradient(90deg, #E91E8C, #C026D3)'
                      : 'rgba(255,255,255,0.08)',
                  }}/>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={styles.aguardandoCard}>
            <div style={styles.loadingWrap}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  ...styles.dot,
                  animationDelay: `${i * 0.2}s`,
                  background: ['#E91E8C','#C026D3','#8B2FC9'][i],
                }}/>
              ))}
            </div>
            <p style={styles.aguardandoTexto}>Aguardando o professor...</p>
          </div>
        </div>
      </div>
    );
  }

  // TELA DA PERGUNTA
  return (
    <div style={styles.container}>
      <Particles/>
      <div style={styles.jogoBox}>

        {/* Header */}
        <div style={styles.jogoHeader}>
          <div style={styles.jogoAvatarWrap}>
            <div style={{
              ...styles.jogoAvatarCircle,
              background: CORES[avatarIndex],
              boxShadow: `0 0 15px ${CORES[avatarIndex]}88`,
            }}>
              {AVATARES[avatarIndex]}
            </div>
            <div>
              <p style={styles.jogoNome}>{nome}</p>
              <p style={styles.jogoCp}>CP {checkpoint}/5</p>
            </div>
          </div>
          {posicao && (
            <div style={styles.posicaoWrap}>
              <span style={styles.posicaoEmoji}>{medalha || `${posicao}º`}</span>
              <span style={styles.posicaoLabel}>lugar</span>
            </div>
          )}
        </div>

        {/* Trilha mini */}
        <div style={styles.trilhaMiniWrap}>
          {['🚩','🌳','🌋','🏖️','🪨','🏆'].map((emoji, i) => (
            <React.Fragment key={i}>
              <div style={{
                ...styles.cpMiniItem,
                background: i <= checkpoint
                  ? 'linear-gradient(135deg, #E91E8C, #8B2FC9)'
                  : 'rgba(255,255,255,0.06)',
                border: i === checkpoint + (respondeu && resultado ? 0 : 0)
                  ? '2px solid #E91E8C'
                  : '1px solid rgba(255,255,255,0.1)',
                transform: i === missao.index + 1 ? 'scale(1.2)' : 'scale(1)',
                boxShadow: i === missao.index + 1
                  ? '0 0 16px rgba(233,30,140,0.6)'
                  : 'none',
              }}>
                {emoji}
              </div>
              {i < 5 && (
                <div style={{
                  ...styles.cpConector,
                  background: i < checkpoint
                    ? 'linear-gradient(90deg, #E91E8C, #C026D3)'
                    : 'rgba(255,255,255,0.08)',
                }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pergunta */}
        <div style={styles.perguntaCard}>
          <div style={styles.perguntaHeaderRow}>
            <span style={styles.perguntaBadge}>
              ❓ Pergunta {(missao.index || 0) + 1} de 5
            </span>
          </div>
          <p style={styles.perguntaTexto}>{missao.pergunta}</p>
        </div>

        {/* Opções ou Resultado */}
        {!respondeu ? (
          <div style={styles.opcoesLista}>
            {missao.opcoes.map((op, i) => {
              const cores = [
                { bg: 'rgba(233,30,140,0.1)', border: '#E91E8C', hover: 'rgba(233,30,140,0.25)' },
                { bg: 'rgba(139,47,201,0.1)', border: '#8B2FC9', hover: 'rgba(139,47,201,0.25)' },
                { bg: 'rgba(63,81,181,0.1)',  border: '#3f51b5', hover: 'rgba(63,81,181,0.25)' },
                { bg: 'rgba(0,137,123,0.1)',  border: '#00897b', hover: 'rgba(0,137,123,0.25)' },
              ];
              return (
                <button
                  key={i}
                  style={{
                    ...styles.opcaoBtn,
                    background: opcaoSelecionada === op
                      ? cores[i].hover
                      : cores[i].bg,
                    borderColor: cores[i].border,
                    boxShadow: opcaoSelecionada === op
                      ? `0 0 20px ${cores[i].border}66`
                      : 'none',
                    transform: opcaoSelecionada === op ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => responder(op)}
                >
                  <span style={{
                    ...styles.opcaoLetra,
                    background: cores[i].border,
                    boxShadow: `0 0 10px ${cores[i].border}88`,
                  }}>
                    {['A','B','C','D'][i]}
                  </span>
                  <span style={styles.opcaoTexto}>{op}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{
            ...styles.resultadoCard,
            background: resultado
              ? 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))'
              : 'linear-gradient(135deg, rgba(244,67,54,0.15), rgba(244,67,54,0.05))',
            border: `2px solid ${resultado ? '#4caf50' : '#f44336'}`,
            boxShadow: resultado
              ? '0 0 30px rgba(76,175,80,0.2)'
              : '0 0 30px rgba(244,67,54,0.2)',
          }}>
            <span style={styles.resultadoEmoji}>
              {resultado ? '🎉' : '😅'}
            </span>
            <div style={styles.resultadoTextos}>
              <p style={{
                ...styles.resultadoTitulo,
                color: resultado ? '#4caf50' : '#f44336',
              }}>
                {resultado ? 'Acertou!' : 'Quase lá!'}
              </p>
              <p style={styles.resultadoSub}>
                {resultado
                  ? `Checkpoint ${checkpoint} conquistado! Continue avançando!`
                  : `A resposta certa era: ${missao.resposta_certa}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de partículas
function Particles() {
  return (
    <div style={stylesParticles.wrap}>
      {[...Array(25)].map((_, i) => (
        <div key={i} style={{
          ...stylesParticles.particle,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${1 + Math.random() * 3}px`,
          height: `${1 + Math.random() * 3}px`,
          background: ['#E91E8C','#C026D3','#8B2FC9','#ffffff'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 5}s`,
          opacity: 0.3 + Math.random() * 0.5,
        }}/>
      ))}
    </div>
  );
}

const stylesParticles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    animation: 'pulse 3s ease-in-out infinite',
  },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0010, #120020, #0a0818)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  loginBox: {
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '28px',
    padding: '40px 32px',
    border: '1px solid rgba(139,47,201,0.25)',
    backdropFilter: 'blur(30px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 1,
    boxShadow: '0 0 60px rgba(139,47,201,0.15), 0 20px 60px rgba(0,0,0,0.5)',
  },
  tituloJogo: {
    fontSize: '2rem',
    color: 'white',
    textAlign: 'center',
    margin: 0,
    textShadow: '0 0 20px rgba(192,38,211,0.5)',
  },
  subtitulo: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    margin: 0,
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '10px',
    width: '100%',
  },
  avatarBtn: {
    padding: '12px 8px',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: { fontSize: '2rem' },
  avatarCheck: {
    position: 'absolute',
    top: 4, right: 4,
    width: '16px', height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: 'white',
    fontWeight: 'bold',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '14px',
    border: '1px solid rgba(139,47,201,0.3)',
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  inputIcon: { fontSize: '1.2rem', marginRight: '10px' },
  input: {
    flex: 1,
    padding: '14px 0',
    border: 'none',
    background: 'transparent',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  botaoEntrar: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #E91E8C, #C026D3, #8B2FC9)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1.1rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(233,30,140,0.4)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    letterSpacing: '0.5px',
  },
  botaoIcon: { fontSize: '1.3rem' },
  disclaimer: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    margin: 0,
  },
  aguardandoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
    zIndex: 1,
    maxWidth: '400px',
    width: '100%',
  },
  avatarGrandeWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  },
  avatarGrandeBg: {
    position: 'absolute',
    width: '120px', height: '120px',
    borderRadius: '50%',
  },
  avatarGrande: {
    fontSize: '5.5rem',
    animation: 'float 3s ease-in-out infinite',
    position: 'relative',
    zIndex: 1,
  },
  nomeAluno: {
    fontSize: '1.8rem',
    color: 'white',
    fontWeight: '700',
    margin: 0,
    textAlign: 'center',
  },
  badgesRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  checkpointBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(139,47,201,0.15)',
    border: '1px solid rgba(139,47,201,0.4)',
    borderRadius: '20px',
    padding: '6px 16px',
  },
  cpNum: { fontSize: '1.1rem', fontWeight: '900', color: '#E91E8C' },
  cpSlash: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' },
  cpTotal: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' },
  cpLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' },
  posicaoBadge: {
    background: 'rgba(233,30,140,0.1)',
    border: '1px solid rgba(233,30,140,0.3)',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '0.9rem',
    color: 'white',
  },
  trilhaMiniWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '12px 16px',
    border: '1px solid rgba(139,47,201,0.15)',
    width: '100%',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  cpMiniItem: {
    width: '36px', height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'all 0.4s',
    flexShrink: 0,
  },
  cpConector: {
    width: '16px', height: '3px',
    borderRadius: '2px',
    flexShrink: 0,
    transition: 'all 0.4s',
  },
  aguardandoCard: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    padding: '20px 32px',
    border: '1px solid rgba(139,47,201,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingWrap: { display: 'flex', gap: '10px' },
  dot: {
    width: '12px', height: '12px',
    borderRadius: '50%',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  aguardandoTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.95rem',
    margin: 0,
  },
  jogoBox: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    zIndex: 1,
  },
  jogoHeader: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(10px)',
  },
  jogoAvatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  jogoAvatarCircle: {
    width: '44px', height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
  },
  jogoNome: { color: 'white', fontWeight: '700', fontSize: '1rem', margin: 0 },
  jogoCp: { color: '#C026D3', fontSize: '0.8rem', margin: '2px 0 0', fontWeight: '600' },
  posicaoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  posicaoEmoji: { fontSize: '1.8rem', lineHeight: 1 },
  posicaoLabel: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  perguntaCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '18px',
    padding: '22px',
    border: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 20px rgba(139,47,201,0.1)',
  },
  perguntaHeaderRow: { marginBottom: '12px' },
  perguntaBadge: {
    fontSize: '0.72rem',
    color: '#C026D3',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  perguntaTexto: {
    fontSize: '1.15rem',
    color: 'white',
    lineHeight: '1.6',
    margin: 0,
  },
  opcoesLista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  opcaoBtn: {
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid',
    color: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    transition: 'all 0.2s',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    backdropFilter: 'blur(10px)',
  },
  opcaoLetra: {
    width: '30px', height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '0.85rem',
    color: 'white',
    flexShrink: 0,
  },
  opcaoTexto: { color: 'white', fontSize: '0.95rem', lineHeight: '1.4' },
  resultadoCard: {
    borderRadius: '20px',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    backdropFilter: 'blur(10px)',
  },
  resultadoEmoji: { fontSize: '3.5rem', flexShrink: 0 },
  resultadoTextos: { display: 'flex', flexDirection: 'column', gap: '6px' },
  resultadoTitulo: { fontSize: '1.4rem', fontWeight: '900', margin: 0 },
  resultadoSub: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4' },
};
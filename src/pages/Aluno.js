import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, push } from 'firebase/database';

const AVATARES = ['🧑‍🚀', '🧜', '🧙', '🦸', '🧝', '🥷', '🧞', '🦄'];

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

  useEffect(() => {
    if (!alunoId) return;
    onValue(ref(db, 'sala/missao_atual'), snap => {
      const data = snap.val();
      setMissao(data);
      setRespondeu(false);
      setResultado(null);
    });
    onValue(ref(db, 'sala/alunos'), snap => {
      const data = snap.val() || {};
      const lista = Object.values(data).sort(
        (a, b) => (b.checkpoint || 0) - (a.checkpoint || 0)
      );
      setTotalAlunos(lista.length);
      const pos = lista.findIndex(
        a => a.nome === nome && a.avatar === AVATARES[avatarIndex]
      );
      setPosicao(pos + 1);
    });
  }, [alunoId, nome, avatarIndex]);

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
    const acertou = opcao === missao.resposta_certa;
    const novoCheckpoint = acertou ? (checkpoint + 1) : checkpoint;
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

  // TELA DE ENTRADA
  if (!entrou) {
    return (
      <div style={styles.container}>
        <div style={styles.bgCircle1}/>
        <div style={styles.bgCircle2}/>
        <div style={styles.loginBox}>
          <div style={styles.logo}>
            <span style={styles.logoEpic}>EPIC</span>
            <span style={styles.logoInstituto}>INSTITUTO</span>
          </div>
          <h1 style={styles.tituloJogo}>🌴 Ilha do Saber</h1>
          <p style={styles.subtitulo}>Escolha seu explorador</p>
          <div style={styles.avatarGrid}>
            {AVATARES.map((av, i) => (
              <button
                key={i}
                onClick={() => setAvatarIndex(i)}
                style={{
                  ...styles.avatarBtn,
                  background: i === avatarIndex
                    ? 'rgba(240,192,64,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: i === avatarIndex
                    ? '2px solid #f0c040'
                    : '2px solid rgba(255,255,255,0.1)',
                  transform: i === avatarIndex ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {av}
              </button>
            ))}
          </div>
          <input
            style={styles.input}
            placeholder="Seu nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && entrarNaSala()}
            maxLength={20}
          />
          <button
            style={{
              ...styles.botaoEntrar,
              opacity: nome.trim() ? 1 : 0.5,
            }}
            onClick={entrarNaSala}
          >
            Entrar na Missão 🚀
          </button>
        </div>
      </div>
    );
  }

  // AGUARDANDO MISSÃO
  if (!missao) {
    return (
      <div style={styles.container}>
        <div style={styles.bgCircle1}/>
        <div style={styles.bgCircle2}/>
        <div style={styles.aguardandoBox}>
          <div style={styles.avatarGrande}>{AVATARES[avatarIndex]}</div>
          <h2 style={styles.nomeAluno}>{nome}</h2>
          <div style={styles.checkpointBadge}>
            Checkpoint {checkpoint} / 5
          </div>
          {posicao && (
            <div style={styles.posicaoBadge}>
              {posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`} lugar de {totalAlunos}
            </div>
          )}
          <div style={styles.aguardandoCard}>
            <div style={styles.loadingDots}>
              <span style={{ ...styles.dot, animationDelay: '0s' }}/>
              <span style={{ ...styles.dot, animationDelay: '0.2s' }}/>
              <span style={{ ...styles.dot, animationDelay: '0.4s' }}/>
            </div>
            <p style={styles.aguardandoTexto}>
              Aguardando o professor...
            </p>
          </div>
          <div style={styles.trilhaMini}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{
                ...styles.cpMini,
                background: i <= checkpoint
                  ? '#f0c040'
                  : 'rgba(255,255,255,0.1)',
              }}/>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TELA DA PERGUNTA
  return (
    <div style={styles.container}>
      <div style={styles.bgCircle1}/>
      <div style={styles.bgCircle2}/>
      <div style={styles.jogoBox}>
        {/* Header do aluno */}
        <div style={styles.jogoHeader}>
          <span style={styles.avatarPequeno}>{AVATARES[avatarIndex]}</span>
          <div>
            <p style={styles.jogoNome}>{nome}</p>
            <p style={styles.jogoCp}>Checkpoint {checkpoint}/5</p>
          </div>
          {posicao && (
            <div style={styles.posicaoMini}>
              {posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`}
            </div>
          )}
        </div>

        {/* Trilha mini */}
        <div style={styles.trilhaMini}>
          {['🚩','🌳','🌋','🏖️','🪨','🏆'].map((emoji, i) => (
            <div key={i} style={{
              ...styles.cpMiniEmoji,
              background: i <= checkpoint
                ? 'rgba(240,192,64,0.3)'
                : 'rgba(255,255,255,0.05)',
              border: i === checkpoint
                ? '2px solid #f0c040'
                : '1px solid rgba(255,255,255,0.1)',
            }}>
              {emoji}
            </div>
          ))}
        </div>

        {/* Pergunta */}
        <div style={styles.perguntaCard}>
          <div style={styles.perguntaNumero}>
            Pergunta {(missao.index || 0) + 1} de 5
          </div>
          <p style={styles.perguntaTexto}>{missao.pergunta}</p>
        </div>

        {/* Opções */}
        {!respondeu ? (
          <div style={styles.opcoesGrid}>
            {missao.opcoes.map((op, i) => (
              <button
                key={i}
                style={{
                  ...styles.opcaoBtn,
                  background: ['rgba(233,30,99,0.15)','rgba(63,81,181,0.15)',
                    'rgba(0,137,123,0.15)','rgba(245,127,23,0.15)'][i],
                  borderColor: ['#e91e63','#3f51b5','#00897b','#f57f17'][i],
                }}
                onClick={() => responder(op)}
              >
                <span style={styles.opcaoLetra}>
                  {['A','B','C','D'][i]}
                </span>
                {op}
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            ...styles.resultadoCard,
            background: resultado
              ? 'rgba(76,175,80,0.2)'
              : 'rgba(244,67,54,0.2)',
            border: `2px solid ${resultado ? '#4caf50' : '#f44336'}`,
          }}>
            <div style={styles.resultadoEmoji}>
              {resultado ? '🎉' : '😅'}
            </div>
            <p style={styles.resultadoTexto}>
              {resultado
                ? 'Você acertou! Continue avançando!'
                : `Quase! A resposta era: ${missao.resposta_certa}`}
            </p>
            {resultado && (
              <p style={styles.resultadoCheckpoint}>
                ✅ Checkpoint {checkpoint} conquistado!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  bgCircle1: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'rgba(240,192,64,0.05)',
    top: '-100px', right: '-100px',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    width: '300px', height: '300px',
    borderRadius: '50%',
    background: 'rgba(63,81,181,0.1)',
    bottom: '-80px', left: '-80px',
    pointerEvents: 'none',
  },
  loginBox: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '24px',
    padding: '36px 28px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'rgba(240,192,64,0.1)',
    border: '1px solid rgba(240,192,64,0.4)',
    borderRadius: '10px',
    padding: '6px 18px',
  },
  logoEpic: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#f0c040',
    letterSpacing: '4px',
  },
  logoInstituto: {
    fontSize: '0.55rem',
    color: 'rgba(240,192,64,0.6)',
    letterSpacing: '3px',
  },
  tituloJogo: {
    fontSize: '1.8rem',
    color: 'white',
    marginBottom: '6px',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '20px',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '8px',
    marginBottom: '20px',
    width: '100%',
  },
  avatarBtn: {
    fontSize: '1.8rem',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    fontSize: '1rem',
    marginBottom: '14px',
    outline: 'none',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  botaoEntrar: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #f0c040, #ff9800)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  aguardandoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    zIndex: 1,
  },
  avatarGrande: {
    fontSize: '5rem',
    animation: 'float 3s ease-in-out infinite',
  },
  nomeAluno: {
    fontSize: '1.6rem',
    color: 'white',
    fontWeight: '600',
  },
  checkpointBadge: {
    background: 'rgba(240,192,64,0.15)',
    border: '1px solid rgba(240,192,64,0.4)',
    color: '#f0c040',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  posicaoBadge: {
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  aguardandoCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '20px 32px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  loadingDots: { display: 'flex', gap: '8px' },
  dot: {
    width: '10px', height: '10px',
    borderRadius: '50%',
    background: '#f0c040',
    animation: 'pulse 1.2s ease-in-out infinite',
    display: 'inline-block',
  },
  aguardandoTexto: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
  trilhaMini: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  cpMini: {
    width: '28px', height: '8px',
    borderRadius: '4px',
    transition: 'background 0.5s',
  },
  cpMiniEmoji: {
    width: '36px', height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'all 0.3s',
  },
  jogoBox: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    zIndex: 1,
  },
  jogoHeader: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '14px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  avatarPequeno: { fontSize: '2.2rem' },
  jogoNome: { color: 'white', fontWeight: 'bold', fontSize: '1rem', margin: 0 },
  jogoCp: { color: '#f0c040', fontSize: '0.8rem', margin: 0 },
  posicaoMini: {
    marginLeft: 'auto',
    fontSize: '1.6rem',
  },
  perguntaCard: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  perguntaNumero: {
    fontSize: '0.75rem',
    color: '#f0c040',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  perguntaTexto: {
    fontSize: '1.15rem',
    color: 'white',
    lineHeight: '1.5',
    margin: 0,
  },
  opcoesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  opcaoBtn: {
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid',
    color: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'transform 0.1s',
  },
  opcaoLetra: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  resultadoCard: {
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  resultadoEmoji: { fontSize: '3.5rem' },
  resultadoTexto: {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
    margin: 0,
  },
  resultadoCheckpoint: {
    color: '#4caf50',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    margin: 0,
  },
};
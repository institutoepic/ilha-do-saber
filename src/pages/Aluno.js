import React, { useState, useEffect, useRef } from 'react';
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
  const [jogo, setJogo] = useState(null);
  const [respondeu, setRespondeu] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [posicao, setPosicao] = useState(null);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [ranking, setRanking] = useState([]);
  const timerRef = useRef(null);
  const missaoRef = useRef(null);

  useEffect(() => {
    if (!alunoId) return;

    onValue(ref(db, 'sala/missao_atual'), snap => {
      const data = snap.val();
      // Nova pergunta chegou — reseta estado
      if (data && data.pergunta !== missaoRef.current?.pergunta) {
        setRespondeu(false);
        setResultado(null);
        setOpcaoSelecionada(null);
        // Inicia timer local
        clearInterval(timerRef.current);
        const tempo = data.tempo || 30;
        const inicio = data.inicio || Date.now();
        const calcRestante = () => Math.max(0, tempo - Math.floor((Date.now() - inicio) / 1000));
        setTempoRestante(calcRestante());
        timerRef.current = setInterval(() => {
          const r = calcRestante();
          setTempoRestante(r);
          if (r <= 0) clearInterval(timerRef.current);
        }, 500);
      }
      if (!data) clearInterval(timerRef.current);
      missaoRef.current = data;
      setMissao(data);
    });

    onValue(ref(db, 'sala/jogo'), snap => setJogo(snap.val()));

    onValue(ref(db, 'sala/alunos'), snap => {
      const data = snap.val() || {};
      const lista = Object.values(data).sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
      setTotalAlunos(lista.length);
      setRanking(lista);
      const pos = lista.findIndex(a => a.nome === nome);
      setPosicao(pos + 1);
      if (data[alunoId]) {
        setPontos(data[alunoId].pontos || 0);
        setAcertos(data[alunoId].acertos || 0);
      }
    });

    return () => clearInterval(timerRef.current);
  }, [alunoId, nome]);

  function entrarNaSala() {
    if (!nome.trim()) return;
    const novoRef = push(ref(db, 'sala/alunos'));
    const id = novoRef.key;
    set(novoRef, {
      nome: nome.trim(),
      avatar: AVATARES[avatarIndex],
      respondeu_atual: false,
      acertou: false,
      pontos: 0,
      acertos: 0,
      entrou: Date.now(),
    });
    setAlunoId(id);
    setEntrou(true);
  }

  async function responder(opcao) {
    if (respondeu || !alunoId || !missao) return;
    if (tempoRestante <= 0) return;
    setOpcaoSelecionada(opcao);
    const acertou = opcao === missao.resposta_certa;
    const tempoUsado = (missao.tempo || 30) - tempoRestante;
    const pontosGanhos = acertou ? Math.max(10, tempoRestante * 3) : 0;
    const novosPontos = pontos + pontosGanhos;
    const novosAcertos = acertos + (acertou ? 1 : 0);
    await set(ref(db, `sala/alunos/${alunoId}`), {
      nome: nome.trim(),
      avatar: AVATARES[avatarIndex],
      respondeu_atual: true,
      acertou,
      pontos: novosPontos,
      acertos: novosAcertos,
      entrou: Date.now(),
      tempo_resposta: tempoUsado,
    });
    setRespondeu(true);
    setResultado(acertou);
    setPontos(novosPontos);
    if (acertou) setAcertos(novosAcertos);
    clearInterval(timerRef.current);
  }

  const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : null;
  const totalPerguntas = jogo?.total_perguntas || 5;
  const perguntaAtual = jogo?.pergunta_atual ?? -1;

  // TELA DE ENTRADA
  if (!entrou) {
    return (
      <div style={styles.container}>
        <Particles/>
        <div style={styles.loginBox}>
          <LogoEpic size="lg"/>
          <h1 style={styles.tituloJogo}>🌴 Ilha dos Saberes</h1>
          <p style={styles.subtitulo}>Escolha seu explorador e embarque na aventura!</p>
          <div style={styles.avatarGrid}>
            {AVATARES.map((av, i) => (
              <button key={i} onClick={() => setAvatarIndex(i)} style={{
                ...styles.avatarBtn,
                background: i === avatarIndex ? `rgba(${hexToRgb(CORES[i])},0.3)` : 'rgba(255,255,255,0.04)',
                border: i === avatarIndex ? `2px solid ${CORES[i]}` : '2px solid rgba(255,255,255,0.08)',
                boxShadow: i === avatarIndex ? `0 0 20px ${CORES[i]}66` : 'none',
                transform: i === avatarIndex ? 'scale(1.15)' : 'scale(1)',
              }}>
                <span style={styles.avatarEmoji}>{av}</span>
                {i === avatarIndex && <div style={{ ...styles.avatarCheck, background: CORES[i] }}>✓</div>}
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
            style={{ ...styles.botaoEntrar, opacity: nome.trim() ? 1 : 0.4, cursor: nome.trim() ? 'pointer' : 'not-allowed' }}
            onClick={entrarNaSala}
            disabled={!nome.trim()}
          >
            <span>Embarcar na Missão</span>
            <span style={styles.botaoIcon}>🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // TELA DE PÓDIO
  if (jogo?.encerrado) {
    return (
      <div style={styles.container}>
        <Particles/>
        <div style={styles.podioBox}>
          <LogoEpic size="sm"/>
          <h1 style={styles.podioTitulo}>🏆 Resultado Final</h1>

          {/* Minha posição */}
          <div style={styles.minhaPosicaoCard}>
            <span style={styles.minhaPosicaoAvatar}>{AVATARES[avatarIndex]}</span>
            <div>
              <p style={styles.minhaPosicaoNome}>{nome}</p>
              <p style={styles.minhaPosicaoInfo}>
                {medalha || `${posicao}º lugar`} · {pontos} pts · {acertos}/{totalPerguntas} acertos
              </p>
            </div>
            <span style={{ fontSize: '2.5rem' }}>{medalha || `${posicao}º`}</span>
          </div>

          {/* Top 3 */}
          <div style={styles.podioTop3}>
            {[1, 0, 2].map(pos => {
              const aluno = ranking[pos];
              if (!aluno) return null;
              const medalhas = ['🥈','🥇','🥉'];
              const cores = ['#C0C0C0','#FFD700','#CD7F32'];
              const alturas = ['70px','90px','55px'];
              return (
                <div key={pos} style={styles.podioItem}>
                  <span style={{ fontSize: pos === 1 ? '3rem' : '2.2rem' }}>{aluno.avatar}</span>
                  <span style={styles.podioItemNome}>{aluno.nome?.split(' ')[0]}</span>
                  <span style={{ ...styles.podioItemPontos, color: cores[pos] }}>{aluno.pontos || 0}pts</span>
                  <div style={{ ...styles.podioItemBarra, height: alturas[pos], background: `${cores[pos]}33`, border: `2px solid ${cores[pos]}66` }}>
                    <span style={{ fontSize: '1.5rem' }}>{medalhas[pos]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ranking */}
          <div style={styles.rankingMini}>
            {ranking.map((aluno, i) => (
              <div key={i} style={{
                ...styles.rankingMiniItem,
                background: aluno.nome === nome ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.03)',
                border: aluno.nome === nome ? '1px solid rgba(233,30,140,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={styles.rankingMiniPos}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`}</span>
                <span style={{ fontSize: '1.2rem' }}>{aluno.avatar}</span>
                <span style={styles.rankingMiniNome}>{aluno.nome}</span>
                <span style={styles.rankingMiniPontos}>{aluno.pontos || 0}pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // AGUARDANDO INÍCIO
  if (!jogo?.ativo || perguntaAtual < 0) {
    return (
      <div style={styles.container}>
        <Particles/>
        <div style={styles.aguardandoBox}>
          <LogoEpic size="sm"/>
          <div style={styles.avatarGrandeWrap}>
            <div style={{ ...styles.avatarGrandeBg, background: `radial-gradient(circle, ${CORES[avatarIndex]}44, transparent)`, boxShadow: `0 0 40px ${CORES[avatarIndex]}66` }}/>
            <span style={styles.avatarGrande}>{AVATARES[avatarIndex]}</span>
          </div>
          <h2 style={styles.nomeAluno}>{nome}</h2>
          <div style={styles.aguardandoCard}>
            <div style={styles.loadingWrap}>
              {[0,1,2].map(i => (
                <div key={i} style={{ ...styles.dot, animationDelay: `${i*0.2}s`, background: ['#E91E8C','#C026D3','#8B2FC9'][i] }}/>
              ))}
            </div>
            <p style={styles.aguardandoTexto}>Aguardando o professor iniciar...</p>
          </div>
          <p style={styles.aguardandoSub}>🌴 Ilha dos Saberes — prepare-se para a aventura!</p>
        </div>
      </div>
    );
  }

  // TELA DA PERGUNTA
  const tempoPercent = missao ? (tempoRestante / (missao.tempo || 30)) * 100 : 0;
  const corTimer = tempoRestante > 10 ? '#E91E8C' : tempoRestante > 5 ? '#ff9800' : '#f44336';

  return (
    <div style={styles.container}>
      <Particles/>
      <div style={styles.jogoBox}>

        {/* Header */}
        <div style={styles.jogoHeader}>
          <div style={styles.jogoAvatarWrap}>
            <div style={{ ...styles.jogoAvatarCircle, background: CORES[avatarIndex], boxShadow: `0 0 15px ${CORES[avatarIndex]}88` }}>
              {AVATARES[avatarIndex]}
            </div>
            <div>
              <p style={styles.jogoNome}>{nome}</p>
              <p style={styles.jogoPontos}>{pontos} pts · {acertos} acertos</p>
            </div>
          </div>
          {posicao && (
            <div style={styles.posicaoWrap}>
              <span style={styles.posicaoEmoji}>{medalha || `${posicao}º`}</span>
              <span style={styles.posicaoLabel}>de {totalAlunos}</span>
            </div>
          )}
        </div>

        {/* Timer */}
        <div style={styles.timerWrap}>
          <div style={styles.timerTrack}>
            <div style={{
              ...styles.timerFill,
              width: `${tempoPercent}%`,
              background: `linear-gradient(90deg, ${corTimer}, ${corTimer}99)`,
              boxShadow: `0 0 10px ${corTimer}88`,
              transition: 'width 0.5s linear, background 0.3s',
            }}/>
          </div>
          <span style={{ ...styles.timerNum, color: corTimer }}>{tempoRestante}s</span>
        </div>

        {/* Progresso perguntas */}
        <div style={styles.progressoPerguntas}>
          {Array.from({ length: totalPerguntas }).map((_, i) => (
            <div key={i} style={{
              ...styles.progressoDot,
              background: i < perguntaAtual
                ? 'linear-gradient(135deg, #E91E8C, #8B2FC9)'
                : i === perguntaAtual
                ? '#f0c040'
                : 'rgba(255,255,255,0.1)',
              transform: i === perguntaAtual ? 'scale(1.3)' : 'scale(1)',
              boxShadow: i === perguntaAtual ? '0 0 10px #f0c04088' : 'none',
            }}/>
          ))}
          <span style={styles.progressoLabel}>Pergunta {perguntaAtual + 1}/{totalPerguntas}</span>
        </div>

        {/* Pergunta */}
        {missao && (
          <>
            <div style={styles.perguntaCard}>
              <p style={styles.perguntaTexto}>{missao.pergunta}</p>
            </div>

            {/* Opções ou Resultado */}
            {!respondeu && tempoRestante > 0 ? (
              <div style={styles.opcoesLista}>
                {missao.opcoes.map((op, i) => {
                  const cores = [
                    { bg: 'rgba(233,30,140,0.1)', border: '#E91E8C' },
                    { bg: 'rgba(139,47,201,0.1)', border: '#8B2FC9' },
                    { bg: 'rgba(63,81,181,0.1)',  border: '#3f51b5' },
                    { bg: 'rgba(0,137,123,0.1)',  border: '#00897b' },
                  ];
                  return (
                    <button key={i} style={{
                      ...styles.opcaoBtn,
                      background: opcaoSelecionada === op ? `rgba(${hexToRgb(cores[i].border)},0.25)` : cores[i].bg,
                      borderColor: cores[i].border,
                      boxShadow: opcaoSelecionada === op ? `0 0 20px ${cores[i].border}66` : 'none',
                      transform: opcaoSelecionada === op ? 'scale(1.02)' : 'scale(1)',
                    }} onClick={() => responder(op)}>
                      <span style={{ ...styles.opcaoLetra, background: cores[i].border, boxShadow: `0 0 10px ${cores[i].border}88` }}>
                        {['A','B','C','D'][i]}
                      </span>
                      <span style={styles.opcaoTexto}>{op}</span>
                    </button>
                  );
                })}
              </div>
            ) : tempoRestante <= 0 && !respondeu ? (
              <div style={{ ...styles.resultadoCard, background: 'rgba(100,100,100,0.15)', border: '2px solid #666' }}>
                <span style={styles.resultadoEmoji}>⏰</span>
                <div style={styles.resultadoTextos}>
                  <p style={{ ...styles.resultadoTitulo, color: '#aaa' }}>Tempo esgotado!</p>
                  <p style={styles.resultadoSub}>A resposta era: {missao.resposta_certa}</p>
                </div>
              </div>
            ) : (
              <div style={{
                ...styles.resultadoCard,
                background: resultado ? 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))' : 'linear-gradient(135deg, rgba(244,67,54,0.15), rgba(244,67,54,0.05))',
                border: `2px solid ${resultado ? '#4caf50' : '#f44336'}`,
                boxShadow: resultado ? '0 0 30px rgba(76,175,80,0.2)' : '0 0 30px rgba(244,67,54,0.2)',
              }}>
                <span style={styles.resultadoEmoji}>{resultado ? '🎉' : '😅'}</span>
                <div style={styles.resultadoTextos}>
                  <p style={{ ...styles.resultadoTitulo, color: resultado ? '#4caf50' : '#f44336' }}>
                    {resultado ? `+${Math.max(10, tempoRestante * 3)} pontos!` : 'Errou!'}
                  </p>
                  <p style={styles.resultadoSub}>
                    {resultado ? `Você tem ${pontos} pontos no total!` : `A resposta era: ${missao.resposta_certa}`}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Particles() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {[...Array(25)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          borderRadius: '50%',
          left: `${Math.random()*100}%`,
          top: `${Math.random()*100}%`,
          width: `${1+Math.random()*3}px`,
          height: `${1+Math.random()*3}px`,
          background: ['#E91E8C','#C026D3','#8B2FC9','#ffffff'][Math.floor(Math.random()*4)],
          animationDelay: `${Math.random()*5}s`,
          animationDuration: `${3+Math.random()*5}s`,
          opacity: 0.3+Math.random()*0.5,
          animation: 'pulse 3s ease-in-out infinite',
        }}/>
      ))}
    </div>
  );
}

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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  loginBox: {
    width: '100%', maxWidth: '440px',
    background: 'rgba(255,255,255,0.03)', borderRadius: '28px', padding: '40px 32px',
    border: '1px solid rgba(139,47,201,0.25)', backdropFilter: 'blur(30px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 1,
    boxShadow: '0 0 60px rgba(139,47,201,0.15), 0 20px 60px rgba(0,0,0,0.5)',
  },
  tituloJogo: { fontSize: '2rem', color: 'white', textAlign: 'center', margin: 0, textShadow: '0 0 20px rgba(192,38,211,0.5)' },
  subtitulo: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', width: '100%' },
  avatarBtn: { padding: '12px 8px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
  avatarEmoji: { fontSize: '2rem' },
  avatarCheck: { position: 'absolute', top: 4, right: 4, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' },
  inputWrap: { display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(139,47,201,0.3)', padding: '0 16px', boxSizing: 'border-box' },
  inputIcon: { fontSize: '1.2rem', marginRight: '10px' },
  input: { flex: 1, padding: '14px 0', border: 'none', background: 'transparent', color: 'white', fontSize: '1rem', outline: 'none', fontFamily: "'Segoe UI', Arial, sans-serif" },
  botaoEntrar: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #E91E8C, #C026D3, #8B2FC9)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 20px rgba(233,30,140,0.4)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  botaoIcon: { fontSize: '1.3rem' },
  aguardandoBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', zIndex: 1, maxWidth: '400px', width: '100%' },
  avatarGrandeWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' },
  avatarGrandeBg: { position: 'absolute', width: '120px', height: '120px', borderRadius: '50%' },
  avatarGrande: { fontSize: '5.5rem', animation: 'float 3s ease-in-out infinite', position: 'relative', zIndex: 1 },
  nomeAluno: { fontSize: '1.8rem', color: 'white', fontWeight: '700', margin: 0, textAlign: 'center' },
  aguardandoCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px 32px', border: '1px solid rgba(139,47,201,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', boxSizing: 'border-box' },
  loadingWrap: { display: 'flex', gap: '10px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', animation: 'pulse 1.2s ease-in-out infinite' },
  aguardandoTexto: { color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', margin: 0 },
  aguardandoSub: { color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', textAlign: 'center' },
  jogoBox: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 },
  jogoHeader: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(139,47,201,0.2)', backdropFilter: 'blur(10px)' },
  jogoAvatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  jogoAvatarCircle: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' },
  jogoNome: { color: 'white', fontWeight: '700', fontSize: '1rem', margin: 0 },
  jogoPontos: { color: '#C026D3', fontSize: '0.8rem', margin: '2px 0 0', fontWeight: '600' },
  posicaoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  posicaoEmoji: { fontSize: '1.8rem', lineHeight: 1 },
  posicaoLabel: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  timerWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' },
  timerTrack: { flex: 1, height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: '5px' },
  timerNum: { fontSize: '1.2rem', fontWeight: '900', minWidth: '36px', textAlign: 'right' },
  progressoPerguntas: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
  progressoDot: { width: '12px', height: '12px', borderRadius: '50%', transition: 'all 0.3s' },
  progressoLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' },
  perguntaCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '18px', padding: '22px', border: '1px solid rgba(139,47,201,0.2)', backdropFilter: 'blur(10px)' },
  perguntaTexto: { fontSize: '1.15rem', color: 'white', lineHeight: '1.6', margin: 0 },
  opcoesLista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  opcaoBtn: { padding: '14px 18px', borderRadius: '14px', border: '1px solid', color: 'white', fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', fontFamily: "'Segoe UI', Arial, sans-serif", backdropFilter: 'blur(10px)' },
  opcaoLetra: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem', color: 'white', flexShrink: 0 },
  opcaoTexto: { color: 'white', fontSize: '0.95rem', lineHeight: '1.4' },
  resultadoCard: { borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', backdropFilter: 'blur(10px)' },
  resultadoEmoji: { fontSize: '3rem', flexShrink: 0 },
  resultadoTextos: { display: 'flex', flexDirection: 'column', gap: '4px' },
  resultadoTitulo: { fontSize: '1.4rem', fontWeight: '900', margin: 0 },
  resultadoSub: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.4' },
  podioBox: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1, padding: '20px 0' },
  podioTitulo: { fontSize: '2rem', color: 'white', fontWeight: '900', margin: 0, textAlign: 'center' },
  minhaPosicaoCard: { width: '100%', background: 'linear-gradient(135deg, rgba(233,30,140,0.15), rgba(139,47,201,0.15))', border: '1px solid rgba(233,30,140,0.3)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxSizing: 'border-box' },
  minhaPosicaoAvatar: { fontSize: '2.5rem' },
  minhaPosicaoNome: { fontSize: '1rem', fontWeight: '700', color: 'white', margin: 0 },
  minhaPosicaoInfo: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' },
  podioTop3: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px' },
  podioItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  podioItemNome: { fontSize: '0.8rem', color: 'white', fontWeight: '600', textAlign: 'center' },
  podioItemPontos: { fontSize: '0.9rem', fontWeight: '900' },
  podioItemBarra: { width: '80px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rankingMini: { width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' },
  rankingMiniItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px' },
  rankingMiniPos: { fontSize: '1rem', minWidth: '28px' },
  rankingMiniNome: { flex: 1, fontSize: '0.85rem', color: 'white' },
  rankingMiniPontos: { fontSize: '0.9rem', fontWeight: '900', color: '#f0c040' },
};
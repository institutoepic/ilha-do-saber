import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';
import LogoEpic from '../components/LogoEpic';
import GeradorIA from '../components/GeradorIA';

const PERGUNTA_VAZIA = () => ({
  pergunta: '',
  opcoes: ['', '', '', ''],
  resposta_certa: '',
});

export default function Professor() {
  const [alunos, setAlunos] = useState({});
  const [perguntas, setPerguntas] = useState([PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA()]);
  const [tempoPorPergunta, setTempoPorPergunta] = useState(30);
  const [perguntaAtual, setPerguntaAtual] = useState(-1);
  const [jogoAtivo, setJogoAtivo] = useState(false);
  const [jogoEncerrado, setJogoEncerrado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState('perguntas');
  const [tempoRestante, setTempoRestante] = useState(0);
  const timerRef = useRef(null);
  const perguntaRef = useRef(-1);

  useEffect(() => {
    onValue(ref(db, 'sala/alunos'), snap => setAlunos(snap.val() || {}));
    onValue(ref(db, 'sala/jogo'), snap => {
      const data = snap.val();
      if (!data) return;
      setJogoAtivo(data.ativo || false);
      setJogoEncerrado(data.encerrado || false);
      setPerguntaAtual(data.pergunta_atual ?? -1);
      perguntaRef.current = data.pergunta_atual ?? -1;
    });
    onValue(ref(db, 'sala/perguntas'), snap => {
      if (snap.val()) setPerguntas(snap.val());
    });
    onValue(ref(db, 'sala/config'), snap => {
      if (snap.val()?.tempo) setTempoPorPergunta(snap.val().tempo);
    });
  }, []);

  const lista = Object.values(alunos);
  const responderam = lista.filter(a => a.respondeu_atual).length;

  function atualizarPergunta(i, campo, valor) {
    setPerguntas(perguntas.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p));
  }

  function atualizarOpcao(pi, oi, valor) {
    setPerguntas(perguntas.map((p, idx) => {
      if (idx !== pi) return p;
      const opcoes = [...p.opcoes];
      opcoes[oi] = valor;
      return { ...p, opcoes };
    }));
  }

  function adicionarPergunta() {
    setPerguntas([...perguntas, PERGUNTA_VAZIA()]);
  }

  function removerPergunta(i) {
    if (perguntas.length <= 1) return;
    setPerguntas(perguntas.filter((_, idx) => idx !== i));
  }

  async function salvarPerguntas() {
    setSalvando(true);
    await set(ref(db, 'sala/perguntas'), perguntas);
    await set(ref(db, 'sala/config'), { tempo: tempoPorPergunta });
    setTimeout(() => setSalvando(false), 1500);
  }

  async function iniciarJogo() {
    for (let i = 0; i < perguntas.length; i++) {
      const p = perguntas[i];
      if (!p.pergunta.trim() || !p.resposta_certa.trim()) {
        alert(`Preencha a pergunta ${i + 1} e sua resposta certa!`);
        return;
      }
      const opcoesFiltradas = p.opcoes.filter(o => o.trim() !== '');
      if (!opcoesFiltradas.includes(p.resposta_certa.trim())) {
        alert(`A resposta certa da pergunta ${i + 1} deve ser igual a uma das opções!`);
        return;
      }
    }
    await set(ref(db, 'sala/perguntas'), perguntas);
    await set(ref(db, 'sala/config'), { tempo: tempoPorPergunta });
    await set(ref(db, 'sala/jogo'), { ativo: true, encerrado: false, pergunta_atual: -1, total_perguntas: perguntas.length });
    Object.keys(alunos).forEach(id => {
      set(ref(db, `sala/alunos/${id}/pontos`), 0);
      set(ref(db, `sala/alunos/${id}/acertos`), 0);
      set(ref(db, `sala/alunos/${id}/respondeu_atual`), false);
    });
    setTimeout(() => lancarPerguntaIndex(0), 3000);
  }

  async function lancarPerguntaIndex(i) {
    if (i >= perguntas.length) {
      encerrarJogoAutomatico();
      return;
    }
    const p = perguntas[i];
    const opcoesFiltradas = p.opcoes.filter(o => o.trim() !== '');
    const inicio = Date.now();
    await set(ref(db, 'sala/missao_atual'), {
      pergunta: p.pergunta,
      opcoes: opcoesFiltradas,
      resposta_certa: p.resposta_certa.trim(),
      index: i,
      inicio,
      tempo: tempoPorPergunta,
    });
    await set(ref(db, 'sala/jogo/pergunta_atual'), i);
    perguntaRef.current = i;
    Object.keys(alunos).forEach(id => {
      set(ref(db, `sala/alunos/${id}/respondeu_atual`), false);
    });
    setTempoRestante(tempoPorPergunta);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => lancarPerguntaIndex(perguntaRef.current + 1), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function encerrarJogoAutomatico() {
    clearInterval(timerRef.current);
    await set(ref(db, 'sala/missao_atual'), null);
    await set(ref(db, 'sala/jogo/ativo'), false);
    await set(ref(db, 'sala/jogo/encerrado'), true);
  }

  async function jogarNovamente() {
    clearInterval(timerRef.current);
    await remove(ref(db, 'sala/jogo'));
    await remove(ref(db, 'sala/missao_atual'));
    Object.keys(alunos).forEach(id => {
      set(ref(db, `sala/alunos/${id}/pontos`), 0);
      set(ref(db, `sala/alunos/${id}/acertos`), 0);
      set(ref(db, `sala/alunos/${id}/respondeu_atual`), false);
    });
    setJogoAtivo(false);
    setJogoEncerrado(false);
    setPerguntaAtual(-1);
    setTempoRestante(0);
  }

  async function encerrarTudo() {
    if (!window.confirm('Encerrar e limpar tudo?')) return;
    clearInterval(timerRef.current);
    await remove(ref(db, 'sala'));
    setPerguntas([PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA(), PERGUNTA_VAZIA()]);
    setJogoAtivo(false);
    setJogoEncerrado(false);
    setPerguntaAtual(-1);
  }

  const ranking = [...lista].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
  const CHECKPOINT_EMOJIS = ['🚩','🌳','🌋','🏖️','🪨','🏆','⭐','🎯','💡','🔥'];

  // TELA DE PÓDIO
  if (jogoEncerrado) {
    return (
      <div style={styles.container}>
        <div style={styles.bgParticles}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{ ...styles.particle, left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}/>
          ))}
        </div>
        <div style={styles.header}>
          <LogoEpic size="md"/>
          <div style={styles.headerCenter}>
            <h1 style={styles.titulo}>🏆 Resultado Final</h1>
            <p style={styles.subtitulo}>🌴 Ilha dos Saberes</p>
          </div>
          <div style={styles.statsRow}>
            <button style={styles.botaoNovamente} onClick={jogarNovamente}>🔄 Jogar novamente</button>
            <button style={styles.botaoEncerrar} onClick={encerrarTudo}>🗑️ Encerrar</button>
          </div>
        </div>
        <div style={styles.podioWrap}>
          <div style={styles.podioTop}>
            {[1, 0, 2].map(pos => {
              const aluno = ranking[pos];
              if (!aluno) return <div key={pos} style={styles.podioVazio}/>;
              const alturas = ['160px', '200px', '130px'];
              const medalhas = ['🥈', '🥇', '🥉'];
              const cores = ['#C0C0C0', '#FFD700', '#CD7F32'];
              return (
                <div key={pos} style={styles.podioItem}>
                  <div style={styles.podioAvatarWrap}>
                    <span style={styles.podioMedalha}>{medalhas[pos]}</span>
                    <span style={styles.podioAvatar}>{aluno.avatar}</span>
                    <p style={styles.podioNome}>{aluno.nome}</p>
                    <p style={{ ...styles.podioPontos, color: cores[pos] }}>{aluno.pontos || 0} pts</p>
                    <p style={styles.podioAcertos}>{aluno.acertos || 0}/{perguntas.length} acertos</p>
                  </div>
                  <div style={{
                    ...styles.podioBarra,
                    height: alturas[pos],
                    background: `linear-gradient(180deg, ${cores[pos]}44, ${cores[pos]}22)`,
                    border: `2px solid ${cores[pos]}88`,
                  }}>
                    <span style={{ ...styles.podioPos, color: cores[pos] }}>
                      {pos === 0 ? '2º' : pos === 1 ? '1º' : '3º'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={styles.rankingWrap}>
            <h2 style={styles.rankingTitulo}>📋 Ranking Completo</h2>
            <div style={styles.rankingLista}>
              {ranking.map((aluno, i) => (
                <div key={i} style={{
                  ...styles.rankingItem,
                  background: i === 0 ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))' : i === 1 ? 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(192,192,192,0.03))' : i === 2 ? 'linear-gradient(135deg, rgba(205,127,50,0.1), rgba(205,127,50,0.03))' : 'rgba(255,255,255,0.03)',
                  border: i < 3 ? `1px solid ${['rgba(255,215,0,0.3)','rgba(192,192,192,0.2)','rgba(205,127,50,0.2)'][i]}` : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={styles.rankingPos}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`}</span>
                  <span style={styles.rankingAvatar}>{aluno.avatar}</span>
                  <span style={styles.rankingNome}>{aluno.nome}</span>
                  <span style={styles.rankingAcertos}>{aluno.acertos || 0}/{perguntas.length} ✅</span>
                  <span style={styles.rankingPontos}>{aluno.pontos || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgParticles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ ...styles.particle, left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}/>
        ))}
      </div>

      <div style={styles.header}>
        <LogoEpic size="md"/>
        <div style={styles.headerCenter}>
          <h1 style={styles.titulo}>Painel do Professor</h1>
          <p style={styles.subtitulo}>🌴 Ilha dos Saberes</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNum, color: '#C026D3' }}>{lista.length}</span>
            <span style={styles.statLabel}>jogadores</span>
          </div>
          {jogoAtivo && (
            <>
              <div style={styles.statCard}>
                <span style={{ ...styles.statNum, color: '#8B2FC9' }}>{responderam}</span>
                <span style={styles.statLabel}>responderam</span>
              </div>
              <div style={{ ...styles.statCard, border: '1px solid rgba(233,30,140,0.4)' }}>
                <span style={{ ...styles.statNum, color: '#E91E8C' }}>{tempoRestante}s</span>
                <span style={styles.statLabel}>restantes</span>
              </div>
            </>
          )}
        </div>
      </div>

      {!jogoAtivo && (
        <div style={styles.abas}>
          {[{ id: 'perguntas', label: '📝 Perguntas' }, { id: 'alunos', label: '👥 Alunos' }].map(a => (
            <button key={a.id}
              style={{ ...styles.aba, ...(aba === a.id ? styles.abaAtiva : {}) }}
              onClick={() => setAba(a.id)}
            >{a.label}</button>
          ))}
        </div>
      )}

      {/* Jogo ativo */}
      {jogoAtivo && (
        <div style={styles.jogoAtivoWrap}>
          <div style={styles.jogoAtivoCard}>
            <p style={styles.jogoAtivoLabel}>
              🎮 Jogo em andamento — Pergunta {perguntaAtual + 1} de {perguntas.length}
            </p>
            <div style={styles.timerBarWrap}>
              <div style={styles.timerBar}>
                <div style={{
                  ...styles.timerFill,
                  width: `${(tempoRestante / tempoPorPergunta) * 100}%`,
                  background: tempoRestante > 10
                    ? 'linear-gradient(90deg, #E91E8C, #C026D3)'
                    : 'linear-gradient(90deg, #f44336, #ff9800)',
                }}/>
              </div>
              <span style={styles.timerNum}>{tempoRestante}s</span>
            </div>
            <p style={styles.jogoAtivoSub}>
              {responderam}/{lista.length} responderam esta pergunta
            </p>
          </div>
          {/* BOTÃO ENCERRAR DURANTE O JOGO */}
          <button style={styles.botaoEncerrarJogo} onClick={encerrarJogoAutomatico}>
            🏁 Encerrar jogo e ver pódio
          </button>
          <div style={styles.alunosGridMini}>
            {lista.map((aluno, i) => (
              <div key={i} style={{
                ...styles.alunoMini,
                background: aluno.respondeu_atual
                  ? aluno.acertou ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: aluno.respondeu_atual
                  ? aluno.acertou ? '1px solid #4caf50' : '1px solid #f44336'
                  : '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>{aluno.avatar}</span>
                <span style={styles.alunoMiniNome}>{aluno.nome?.split(' ')[0]}</span>
                <span style={styles.alunoMiniStatus}>
                  {aluno.respondeu_atual ? (aluno.acertou ? '✅' : '❌') : '⏳'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#f0c040' }}>{aluno.pontos || 0}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!jogoAtivo && aba === 'perguntas' && (
        <div style={styles.conteudo}>
          <div style={styles.configCard}>
            <span style={styles.configLabel}>⏱️ Tempo por pergunta:</span>
            <div style={styles.configTempoWrap}>
              {[15, 20, 30, 45, 60].map(t => (
                <button key={t} style={{
                  ...styles.tempoBtn,
                  background: tempoPorPergunta === t ? 'linear-gradient(135deg, #E91E8C, #C026D3)' : 'rgba(255,255,255,0.05)',
                  border: tempoPorPergunta === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                }} onClick={() => setTempoPorPergunta(t)}>{t}s</button>
              ))}
              <input type="number" style={styles.tempoInput} value={tempoPorPergunta} min={5} max={300}
                onChange={e => setTempoPorPergunta(Number(e.target.value))}/>
            </div>
          </div>
          <GeradorIA onGerado={perguntas => setPerguntas(perguntas)}/>
          <div style={styles.perguntasGrid}>
            {perguntas.map((p, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardNumeroWrap}>
                    <span style={styles.cardEmoji}>{CHECKPOINT_EMOJIS[i] || '❓'}</span>
                    <span style={styles.cardNumero}>Pergunta {i + 1}</span>
                  </div>
                  {perguntas.length > 1 && (
                    <button style={styles.btnRemover} onClick={() => removerPergunta(i)}>✕</button>
                  )}
                </div>
                <textarea style={styles.textarea} placeholder={`Digite a pergunta ${i + 1}...`}
                  value={p.pergunta} onChange={e => atualizarPergunta(i, 'pergunta', e.target.value)} rows={2}/>
                <div style={styles.opcoesGrid}>
                  {p.opcoes.map((op, j) => (
                    <div key={j} style={styles.opcaoWrap}>
                      <span style={styles.opcaoLetra}>{['A','B','C','D'][j]}</span>
                      <input style={styles.inputOpcao} placeholder={['A','B','C','D'][j]} value={op}
                        onChange={e => atualizarOpcao(i, j, e.target.value)}/>
                    </div>
                  ))}
                </div>
                <div style={styles.respostaWrap}>
                  <span style={styles.respostaLabel}>✅ Resposta certa:</span>
                  <input style={styles.inputResposta} placeholder="Igual a uma das opções acima"
                    value={p.resposta_certa} onChange={e => atualizarPergunta(i, 'resposta_certa', e.target.value)}/>
                </div>
              </div>
            ))}
          </div>
          <button style={styles.botaoAdicionar} onClick={adicionarPergunta}>➕ Adicionar pergunta</button>
          <div style={styles.rodape}>
            <button style={styles.botaoSalvar} onClick={salvarPerguntas}>
              {salvando ? '✅ Salvo!' : '💾 Salvar perguntas'}
            </button>
            <button style={styles.botaoIniciar} onClick={iniciarJogo}>🚀 Iniciar Jogo</button>
            <button style={styles.botaoEncerrar} onClick={encerrarTudo}>🗑️ Limpar tudo</button>
          </div>
        </div>
      )}

      {!jogoAtivo && aba === 'alunos' && (
        <div style={styles.conteudo}>
          {lista.length === 0 ? (
            <div style={styles.vazioWrap}>
              <span style={styles.vazioEmoji}>⏳</span>
              <p style={styles.vazioTexto}>Nenhum aluno conectado ainda.</p>
            </div>
          ) : (
            <div style={styles.alunosGrid}>
              {lista.map((aluno, i) => (
                <div key={i} style={styles.alunoCard}>
                  <span style={{ fontSize: '2rem' }}>{aluno.avatar}</span>
                  <span style={styles.alunoNome}>{aluno.nome}</span>
                  <div style={styles.alunoCpWrap}>
                    <span style={styles.alunoCp}>{aluno.pontos || 0} pts</span>
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
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0010, #120020, #0a0818)', fontFamily: "'Segoe UI', Arial, sans-serif", color: 'white', position: 'relative', overflow: 'hidden', paddingBottom: '40px' },
  bgParticles: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  particle: { position: 'absolute', borderRadius: '50%', background: 'rgba(192,38,211,0.6)', width: '3px', height: '3px', animation: 'pulse 3s ease-in-out infinite' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(139,47,201,0.3)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '16px' },
  headerCenter: { textAlign: 'center', flex: 1 },
  titulo: { fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 },
  subtitulo: { fontSize: '0.8rem', color: 'rgba(192,38,211,0.7)', margin: '4px 0 0' },
  statsRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  statCard: { background: 'rgba(139,47,201,0.1)', border: '1px solid rgba(139,47,201,0.2)', borderRadius: '12px', padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statNum: { fontSize: '1.6rem', fontWeight: '900', lineHeight: 1 },
  statLabel: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' },
  abas: { display: 'flex', gap: '4px', padding: '16px 30px 0', position: 'relative', zIndex: 1 },
  aba: { padding: '10px 28px', borderRadius: '12px 12px 0 0', border: '1px solid rgba(139,47,201,0.2)', borderBottom: 'none', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Segoe UI', Arial, sans-serif" },
  abaAtiva: { background: 'rgba(139,47,201,0.15)', color: '#C026D3', borderColor: 'rgba(139,47,201,0.4)' },
  conteudo: { padding: '24px 30px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' },
  configCard: { background: 'rgba(139,47,201,0.08)', border: '1px solid rgba(139,47,201,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  configLabel: { fontSize: '0.9rem', color: '#C026D3', fontWeight: '700', whiteSpace: 'nowrap' },
  configTempoWrap: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  tempoBtn: { padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'Segoe UI', Arial, sans-serif" },
  tempoInput: { width: '70px', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(139,47,201,0.3)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: "'Segoe UI', Arial, sans-serif", textAlign: 'center' },
  perguntasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(139,47,201,0.2)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardNumeroWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  cardEmoji: { fontSize: '1.3rem', flexShrink: 0 },
  cardNumero: { fontSize: '0.8rem', fontWeight: '700', color: '#C026D3', textTransform: 'uppercase', letterSpacing: '1px' },
  btnRemover: { background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'Segoe UI', Arial, sans-serif" },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(139,47,201,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.88rem', resize: 'none', outline: 'none', fontFamily: "'Segoe UI', Arial, sans-serif", boxSizing: 'border-box', lineHeight: '1.5', display: 'block' },
  opcoesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', width: '100%', boxSizing: 'border-box' },
  opcaoWrap: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px 8px 4px 6px', border: '1px solid rgba(255,255,255,0.07)', boxSizing: 'border-box', minWidth: 0, overflow: 'hidden' },
  opcaoLetra: { width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(139,47,201,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: '#C026D3', flexShrink: 0 },
  inputOpcao: { flex: 1, minWidth: 0, width: '100%', padding: '6px 0', border: 'none', background: 'transparent', color: 'white', fontSize: '0.82rem', outline: 'none', fontFamily: "'Segoe UI', Arial, sans-serif" },
  respostaWrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  respostaLabel: { fontSize: '0.72rem', color: 'rgba(76,175,80,0.8)', fontWeight: '600' },
  inputResposta: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)', background: 'rgba(76,175,80,0.05)', color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: "'Segoe UI', Arial, sans-serif", boxSizing: 'border-box', display: 'block' },
  botaoAdicionar: { width: '100%', padding: '12px', marginBottom: '12px', background: 'rgba(139,47,201,0.1)', color: '#C026D3', border: '2px dashed rgba(139,47,201,0.4)', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif" },
  rodape: { display: 'flex', gap: '12px', marginTop: '4px' },
  botaoSalvar: { padding: '14px 20px', background: 'rgba(76,175,80,0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif" },
  botaoIniciar: { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #E91E8C, #C026D3)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif", boxShadow: '0 4px 20px rgba(233,30,140,0.4)', letterSpacing: '1px' },
  botaoEncerrar: { padding: '14px 20px', background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif" },
  botaoNovamente: { padding: '12px 20px', background: 'linear-gradient(135deg, #E91E8C, #C026D3)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif" },
  botaoEncerrarJogo: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #f44336, #c62828)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Segoe UI', Arial, sans-serif", marginBottom: '16px', boxShadow: '0 4px 15px rgba(244,67,54,0.4)' },
  jogoAtivoWrap: { padding: '20px 30px', position: 'relative', zIndex: 1 },
  jogoAtivoCard: { background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px' },
  jogoAtivoLabel: { fontSize: '1rem', fontWeight: '700', color: '#E91E8C', margin: '0 0 10px' },
  timerBarWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  timerBar: { flex: 1, height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: '6px', transition: 'width 1s linear' },
  timerNum: { fontSize: '1.2rem', fontWeight: '900', color: '#E91E8C', minWidth: '40px', textAlign: 'right' },
  jogoAtivoSub: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 },
  alunosGridMini: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' },
  alunoMini: { borderRadius: '10px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },
  alunoMiniNome: { fontSize: '0.72rem', color: 'white', textAlign: 'center' },
  alunoMiniStatus: { fontSize: '1rem' },
  alunosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' },
  alunoCard: { borderRadius: '14px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
  alunoNome: { fontSize: '0.8rem', color: 'white', textAlign: 'center', fontWeight: '500' },
  alunoCpWrap: { background: 'rgba(139,47,201,0.2)', borderRadius: '20px', padding: '2px 10px' },
  alunoCp: { fontSize: '0.7rem', color: '#C026D3', fontWeight: '700' },
  vazioWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '12px' },
  vazioEmoji: { fontSize: '3rem' },
  vazioTexto: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' },
  podioWrap: { padding: '20px 30px', position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' },
  podioTop: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginBottom: '30px' },
  podioItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' },
  podioVazio: { width: '160px' },
  podioAvatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '8px' },
  podioMedalha: { fontSize: '2rem' },
  podioAvatar: { fontSize: '3.5rem' },
  podioNome: { fontSize: '1rem', fontWeight: '700', color: 'white', margin: 0, textAlign: 'center' },
  podioPontos: { fontSize: '1.3rem', fontWeight: '900', margin: 0 },
  podioAcertos: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 },
  podioBarra: { width: '120px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px' },
  podioPos: { fontSize: '2rem', fontWeight: '900' },
  rankingWrap: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(139,47,201,0.2)', padding: '20px' },
  rankingTitulo: { fontSize: '1.1rem', color: '#C026D3', margin: '0 0 14px', fontWeight: '700' },
  rankingLista: { display: 'flex', flexDirection: 'column', gap: '8px' },
  rankingItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '12px' },
  rankingPos: { fontSize: '1.2rem', minWidth: '36px' },
  rankingAvatar: { fontSize: '1.5rem' },
  rankingNome: { flex: 1, fontSize: '0.95rem', color: 'white', fontWeight: '500' },
  rankingAcertos: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
  rankingPontos: { fontSize: '1rem', fontWeight: '900', color: '#f0c040', minWidth: '60px', textAlign: 'right' },
};
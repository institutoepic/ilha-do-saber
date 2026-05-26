import QRCodeCard from '../components/QRCodeCard';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import Trilha from '../components/Trilha';
import Placar from '../components/Placar';
import LogoEpic from '../components/LogoEpic';

const CONFETES = ['🌟','🎊','🏆','✨','🎯','🌈','🥳','💥','⭐','🎉','💜','🔥'];

export default function Huawei() {
  const [alunos, setAlunos] = useState({});
  const [missao, setMissao] = useState(null);
  const [jogo, setJogo] = useState(null);
  const [perguntaAtual, setPerguntaAtual] = useState(-1);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [celebrando, setCelebrando] = useState(false);
  const timerRef = useRef(null);
  const missaoRef = useRef(null);

  useEffect(() => {
    onValue(ref(db, 'sala/alunos'), snap => {
      setAlunos(snap.val() || {});
    });

    onValue(ref(db, 'sala/missao_atual'), snap => {
      const data = snap.val();
      if (data && data.pergunta !== missaoRef.current?.pergunta) {
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
      if (!data) {
        clearInterval(timerRef.current);
        setTempoRestante(0);
      }
      missaoRef.current = data;
      setMissao(data);
    });

    onValue(ref(db, 'sala/jogo'), snap => {
      const data = snap.val();
      setJogo(data);
      setPerguntaAtual(data?.pergunta_atual ?? -1);
      if (data?.encerrado) {
        setCelebrando(true);
        setTimeout(() => setCelebrando(false), 8000);
      }
    });

    return () => clearInterval(timerRef.current);
  }, []);

  const lista = Object.values(alunos);
  const total = lista.length;
  const responderam = lista.filter(a => a.respondeu_atual).length;
  const ranking = [...lista].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
  const totalPerguntas = jogo?.total_perguntas || 5;
  const tempoTotal = missao?.tempo || 30;
  const tempoPercent = tempoTotal > 0 ? (tempoRestante / tempoTotal) * 100 : 0;
  const corTimer = tempoRestante > 10 ? '#E91E8C' : tempoRestante > 5 ? '#ff9800' : '#f44336';

  // TELA DE PÓDIO FINAL
  if (jogo?.encerrado) {
    const top3 = ranking.slice(0, 3);
    const cores = ['#FFD700','#C0C0C0','#CD7F32'];
    const medalhas = ['🥇','🥈','🥉'];
    const alturas = ['220px','180px','150px'];

    return (
      <div style={styles.container}>
        <div style={styles.bgParticles}>
          {[...Array(30)].map((_,i) => (
            <motion.div key={i} style={{ ...styles.particle, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: ['#E91E8C','#C026D3','#8B2FC9','#fff'][Math.floor(Math.random()*4)] }}
              animate={{ opacity: [0.2,0.8,0.2], scale: [1,1.5,1] }}
              transition={{ duration: 3+Math.random()*4, delay: Math.random()*5, repeat: Infinity }}
            />
          ))}
        </div>

        <div style={styles.podioContainer}>
          <div style={styles.podioHeader}>
            <LogoEpic size="md"/>
            <h1 style={styles.podioTitulo}>🏆 Resultado Final — Ilha dos Saberes</h1>
          </div>

          {/* Top 3 pódio */}
          <div style={styles.podioTop}>
            {[1,0,2].map(pos => {
              const aluno = top3[pos];
              if (!aluno) return <div key={pos} style={{ width: '200px' }}/>;
              return (
                <motion.div key={pos} style={styles.podioItem}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pos * 0.3, type: 'spring' }}
                >
                  <motion.div style={styles.podioAvatarWrap}
                    animate={{ y: [0,-10,0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: pos * 0.3 }}
                  >
                    <span style={styles.podioMedalha}>{medalhas[pos]}</span>
                    <div style={{ ...styles.podioAvatarCircle, background: `${cores[pos]}33`, border: `3px solid ${cores[pos]}`, boxShadow: `0 0 30px ${cores[pos]}66` }}>
                      <span style={{ fontSize: pos === 0 ? '4rem' : '3rem' }}>{aluno.avatar}</span>
                    </div>
                    <p style={styles.podioNome}>{aluno.nome}</p>
                    <p style={{ ...styles.podioPontos, color: cores[pos] }}>{aluno.pontos || 0} pts</p>
                    <p style={styles.podioAcertos}>{aluno.acertos || 0}/{totalPerguntas} acertos</p>
                  </motion.div>
                  <div style={{ ...styles.podioBarra, height: alturas[pos], background: `linear-gradient(180deg, ${cores[pos]}33, ${cores[pos]}11)`, border: `2px solid ${cores[pos]}66`, boxShadow: `0 0 20px ${cores[pos]}33` }}>
                    <span style={{ ...styles.podioPos, color: cores[pos] }}>
                      {pos === 0 ? '2º' : pos === 1 ? '1º' : '3º'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ranking completo */}
          <div style={styles.rankingWrap}>
            <h2 style={styles.rankingTitulo}>📋 Ranking Completo</h2>
            <div style={styles.rankingGrid}>
              {ranking.map((aluno, i) => (
                <motion.div key={i} style={{
                  ...styles.rankingItem,
                  background: i === 0 ? 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,215,0,0.05))' : i === 1 ? 'linear-gradient(135deg,rgba(192,192,192,0.1),rgba(192,192,192,0.03))' : i === 2 ? 'linear-gradient(135deg,rgba(205,127,50,0.1),rgba(205,127,50,0.03))' : 'rgba(255,255,255,0.03)',
                  border: i < 3 ? `1px solid ${[`rgba(255,215,0,0.3)`,`rgba(192,192,192,0.2)`,`rgba(205,127,50,0.2)`][i]}` : '1px solid rgba(255,255,255,0.06)',
                }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span style={styles.rankingPos}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`}</span>
                  <span style={styles.rankingAvatar}>{aluno.avatar}</span>
                  <span style={styles.rankingNome}>{aluno.nome}</span>
                  <span style={styles.rankingAcertos}>{aluno.acertos || 0}/{totalPerguntas} ✅</span>
                  <span style={styles.rankingPontos}>{aluno.pontos || 0} pts</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Confetes */}
        <AnimatePresence>
          {celebrando && (
            <div style={styles.confetesWrap}>
              {CONFETES.map((e, i) => (
                <motion.span key={i} style={{ ...styles.confete, left: `${4 + i * 8}%` }}
                  animate={{ y: ['0vh','110vh'], rotate: [0, 720*(i%2===0?1:-1)], x: [0,i%2===0?40:-40] }}
                  transition={{ duration: 2+Math.random()*2, delay: i*0.12, repeat: Infinity, ease: 'easeIn' }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Partículas */}
      <div style={styles.bgParticles}>
        {[...Array(30)].map((_,i) => (
          <motion.div key={i} style={{ ...styles.particle, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: ['#E91E8C','#C026D3','#8B2FC9','#fff'][Math.floor(Math.random()*4)] }}
            animate={{ opacity: [0.2,0.8,0.2], scale: [1,1.5,1] }}
            transition={{ duration: 3+Math.random()*4, delay: Math.random()*5, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Linhas de grade */}
      <div style={styles.gridLines}>
        {[...Array(8)].map((_,i) => (
          <div key={i} style={{ ...styles.gridLine, top: `${i*14}%` }}/>
        ))}
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <LogoEpic size="md"/>
        <div style={styles.headerCenter}>
          <h1 style={styles.titulo}>🌴 Ilha dos Saberes</h1>
          {jogo?.ativo && (
            <div style={styles.perguntaInfo}>
              {Array.from({ length: totalPerguntas }).map((_,i) => (
                <div key={i} style={{
                  ...styles.perguntaDot,
                  background: i < perguntaAtual ? 'linear-gradient(135deg,#E91E8C,#C026D3)' : i === perguntaAtual ? '#f0c040' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === perguntaAtual ? '0 0 10px rgba(240,192,64,0.6)' : 'none',
                  transform: i === perguntaAtual ? 'scale(1.3)' : 'scale(1)',
                }}/>
              ))}
              <span style={styles.perguntaLabel}>Pergunta {perguntaAtual+1}/{totalPerguntas}</span>
            </div>
          )}
          {!jogo?.ativo && <span style={styles.perguntaLabel}>Aguardando início...</span>}
        </div>
        <div style={styles.headerStats}>
          {[
            { num: total, label: 'jogadores', color: '#C026D3', icon: '👥' },
            { num: responderam, label: 'responderam', color: '#8B2FC9', icon: '📝' },
          ].map((s,i) => (
            <div key={i} style={styles.statCard}>
              <span style={styles.statIcon}>{s.icon}</span>
              <span style={{ ...styles.statNum, color: s.color }}>{s.num}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
          {/* Timer grande */}
          {jogo?.ativo && missao && (
            <div style={{ ...styles.statCard, border: `1px solid ${corTimer}66`, background: `rgba(${corTimer === '#E91E8C' ? '233,30,140' : corTimer === '#ff9800' ? '255,152,0' : '244,67,54'},0.1)` }}>
              <span style={styles.statIcon}>⏱️</span>
              <span style={{ ...styles.statNum, color: corTimer, fontSize: '2rem' }}>{tempoRestante}</span>
              <span style={styles.statLabel}>segundos</span>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE TEMPO */}
      {jogo?.ativo && missao && (
        <div style={styles.timerBarWrap}>
          <motion.div
            style={{ ...styles.timerBarFill, background: `linear-gradient(90deg, ${corTimer}, ${corTimer}99)`, boxShadow: `0 0 10px ${corTimer}88` }}
            animate={{ width: `${tempoPercent}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </div>
      )}

      {/* CORPO */}
      <div style={styles.corpo}>
        <div style={styles.trilhaWrap}>
          <Trilha alunos={alunos} perguntaAtual={perguntaAtual}/>

          {/* Pergunta atual */}
          <AnimatePresence mode="wait">
            {missao && jogo?.ativo && (
              <motion.div key={missao.pergunta} style={styles.perguntaCard}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div style={styles.perguntaCardHeader}>
                  <span style={styles.perguntaCardBadge}>❓ Pergunta atual</span>
                  <span style={styles.perguntaCardStats}>{responderam}/{total} responderam</span>
                </div>
                <p style={styles.perguntaCardTexto}>{missao.pergunta}</p>
                <div style={styles.perguntaOpcoes}>
                  {missao.opcoes?.map((op, i) => (
                    <div key={i} style={{ ...styles.perguntaOpcao, background: tempoRestante === 0 && op === missao.resposta_certa ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.04)', border: tempoRestante === 0 && op === missao.resposta_certa ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ ...styles.perguntaOpcaoLetra, background: ['#E91E8C','#8B2FC9','#3f51b5','#00897b'][i] }}>{['A','B','C','D'][i]}</span>
                      <span style={styles.perguntaOpcaoTexto}>{op}</span>
                      {tempoRestante === 0 && op === missao.resposta_certa && <span>✅</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!jogo?.ativo && (
            <div style={styles.aguardandoCard}>
              <motion.p style={styles.aguardandoTexto} animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                ⏳ Aguardando o professor iniciar o jogo...
              </motion.p>
            </div>
          )}
        </div>

        {/* LATERAL */}
        <div style={styles.lateral}>
          <Placar alunos={alunos}/>
          <QRCodeCard baseUrl={window.location.origin}/>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(160deg, #0a0010, #120025, #050f2e)', fontFamily: "'Segoe UI', Arial, sans-serif", color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  bgParticles: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  particle: { position: 'absolute', borderRadius: '50%', width: '3px', height: '3px' },
  gridLines: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: '1px', background: 'rgba(139,47,201,0.05)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(139,47,201,0.2)', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '12px' },
  headerCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  titulo: { fontSize: '1.8rem', margin: 0, background: 'linear-gradient(135deg, #fff 0%, rgba(192,38,211,0.8) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: '800' },
  perguntaInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  perguntaDot: { width: '10px', height: '10px', borderRadius: '50%', transition: 'all 0.4s' },
  perguntaLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '6px', letterSpacing: '1px', textTransform: 'uppercase' },
  headerStats: { display: 'flex', gap: '8px', alignItems: 'center' },
  statCard: { background: 'rgba(139,47,201,0.1)', border: '1px solid rgba(139,47,201,0.2)', borderRadius: '12px', padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', backdropFilter: 'blur(10px)' },
  statIcon: { fontSize: '0.85rem' },
  statNum: { fontSize: '1.4rem', fontWeight: '900', lineHeight: 1 },
  statLabel: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  timerBarWrap: { height: '6px', background: 'rgba(255,255,255,0.07)', position: 'relative', zIndex: 2, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: '0 3px 3px 0' },
  corpo: { flex: 1, display: 'flex', gap: '14px', padding: '10px 28px 16px', overflow: 'hidden', position: 'relative', zIndex: 2 },
  trilhaWrap: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  perguntaCard: { background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '14px 18px', border: '1px solid rgba(139,47,201,0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 0 20px rgba(139,47,201,0.1)' },
  perguntaCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  perguntaCardBadge: { fontSize: '0.7rem', color: '#C026D3', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' },
  perguntaCardStats: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' },
  perguntaCardTexto: { fontSize: '1rem', color: 'white', margin: '0 0 12px', lineHeight: '1.5' },
  perguntaOpcoes: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  perguntaOpcao: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', transition: 'all 0.3s' },
  perguntaOpcaoLetra: { width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', color: 'white', flexShrink: 0 },
  perguntaOpcaoTexto: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', flex: 1 },
  aguardandoCard: { background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(139,47,201,0.1)', textAlign: 'center' },
  aguardandoTexto: { color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', margin: 0 },
  lateral: { width: '210px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 },
  linkCard: { background: 'rgba(0,0,0,0.35)', borderRadius: '14px', padding: '12px 14px', border: '1px solid rgba(139,47,201,0.15)', backdropFilter: 'blur(10px)' },
  linkLabel: { fontSize: '0.7rem', color: '#C026D3', margin: '0 0 8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
  linkBox: { background: 'rgba(139,47,201,0.1)', borderRadius: '8px', padding: '8px 10px', border: '1px solid rgba(139,47,201,0.2)' },
  linkTexto: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' },
  podioContainer: { position: 'relative', zIndex: 2, padding: '20px 40px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  podioHeader: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  podioTitulo: { fontSize: '2rem', fontWeight: '900', margin: 0, background: 'linear-gradient(135deg, #FFD700, #E91E8C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textAlign: 'center' },
  podioTop: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginBottom: '30px' },
  podioItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  podioAvatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '10px' },
  podioMedalha: { fontSize: '2.5rem' },
  podioAvatarCircle: { width: '90px', height: '90px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  podioNome: { fontSize: '1rem', fontWeight: '700', color: 'white', margin: 0, textAlign: 'center', maxWidth: '120px' },
  podioPontos: { fontSize: '1.4rem', fontWeight: '900', margin: 0 },
  podioAcertos: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 },
  podioBarra: { width: '110px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  podioPos: { fontSize: '2.5rem', fontWeight: '900' },
  rankingWrap: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(139,47,201,0.2)', padding: '20px' },
  rankingTitulo: { fontSize: '1.1rem', color: '#C026D3', margin: '0 0 14px', fontWeight: '700' },
  rankingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' },
  rankingItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px' },
  rankingPos: { fontSize: '1.1rem', minWidth: '32px' },
  rankingAvatar: { fontSize: '1.4rem' },
  rankingNome: { flex: 1, fontSize: '0.9rem', color: 'white', fontWeight: '500' },
  rankingAcertos: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' },
  rankingPontos: { fontSize: '1rem', fontWeight: '900', color: '#f0c040', minWidth: '55px', textAlign: 'right' },
  confetesWrap: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 102, overflow: 'hidden' },
  confete: { position: 'absolute', top: '-60px', display: 'inline-block', fontSize: '2rem' },
};
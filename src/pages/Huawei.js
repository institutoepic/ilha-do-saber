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
  const [perguntaAtual, setPerguntaAtual] = useState(-1);
  const [celebrando, setCelebrando] = useState(false);
  const [tipoCelebracao, setTipoCelebracao] = useState(null);
  const [vencedor, setVencedor] = useState(null);
  const prevAlunosRef = useRef({});
  const vencedorRef = useRef(null);

  useEffect(() => {
    onValue(ref(db, 'sala/alunos'), snap => {
      const data = snap.val() || {};
      const prev = prevAlunosRef.current;
      const lista = Object.values(data);
      const prevLista = Object.values(prev);

      // Verifica vencedor
      if (!vencedorRef.current) {
        const ganhador = lista.find(a => (a.checkpoint || 0) >= 5);
        if (ganhador) {
          vencedorRef.current = ganhador;
          setVencedor(ganhador);
          setTipoCelebracao('vencedor');
          setCelebrando(true);
          setTimeout(() => setCelebrando(false), 8000);
        }
      }

      // Verifica turma perfeita
      if (
        lista.length > 0 &&
        lista.every(a => a.acertou) &&
        prevLista.length > 0 &&
        !prevLista.every(a => a.acertou) &&
        !vencedorRef.current
      ) {
        setTipoCelebracao('turma');
        setCelebrando(true);
        setTimeout(() => setCelebrando(false), 5000);
      }

      prevAlunosRef.current = data;
      setAlunos(data);
    });

    onValue(ref(db, 'sala/missao_atual'), snap => setMissao(snap.val()));
    onValue(ref(db, 'sala/pergunta_atual'), snap => {
      const v = snap.val();
      setPerguntaAtual(v !== null && v !== undefined ? v : -1);
    });
  }, []);

  const lista = Object.values(alunos);
  const total = lista.length;
  const responderam = lista.filter(a => a.respondeu).length;
  const acertaram = lista.filter(a => a.acertou).length;
  const progresso = total > 0 ? Math.round((responderam / total) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Partículas de fundo */}
      <div style={styles.bgParticles}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              background: ['#E91E8C','#C026D3','#8B2FC9','#ffffff'][Math.floor(Math.random() * 4)],
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
            transition={{
              duration: 3 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Linhas de grade decorativas */}
      <div style={styles.gridLines}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            ...styles.gridLine,
            top: `${i * 14}%`,
          }}/>
        ))}
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <LogoEpic size="md"/>

        <div style={styles.headerCenter}>
          <h1 style={styles.titulo}>🌴 Ilha do Saber</h1>
          <div style={styles.perguntaInfo}>
            {perguntaAtual >= 0 ? (
              <>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    ...styles.perguntaDot,
                    background: i <= perguntaAtual
                      ? 'linear-gradient(135deg, #E91E8C, #C026D3)'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: i === perguntaAtual
                      ? '0 0 10px rgba(233,30,140,0.6)'
                      : 'none',
                    transform: i === perguntaAtual ? 'scale(1.3)' : 'scale(1)',
                  }}/>
                ))}
                <span style={styles.perguntaLabel}>
                  Pergunta {perguntaAtual + 1}/5
                </span>
              </>
            ) : (
              <span style={styles.perguntaLabel}>Aguardando início...</span>
            )}
          </div>
        </div>

        <div style={styles.headerStats}>
          {[
            { num: total, label: 'jogadores', color: '#C026D3', icon: '👥' },
            { num: responderam, label: 'responderam', color: '#8B2FC9', icon: '📝' },
            { num: acertaram, label: 'acertaram', color: '#4caf50', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <span style={styles.statIcon}>{s.icon}</span>
              <span style={{ ...styles.statNum, color: s.color }}>{s.num}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div style={styles.progressoWrap}>
        <div style={styles.progressoTrack}>
          <motion.div
            style={styles.progressoFill}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div style={styles.progressoGlow}
            dangerouslySetInnerHTML={{__html: ''}}
          />
        </div>
        <span style={styles.progressoTexto}>
          {progresso}% responderam
        </span>
      </div>

      {/* CORPO */}
      <div style={styles.corpo}>

        {/* TRILHA */}
        <div style={styles.trilhaWrap}>
          <Trilha alunos={alunos} perguntaAtual={perguntaAtual}/>

          {/* Pergunta atual abaixo da trilha */}
          <AnimatePresence mode="wait">
            {missao && (
              <motion.div
                key={missao.pergunta}
                style={styles.perguntaCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div style={styles.perguntaCardHeader}>
                  <span style={styles.perguntaCardBadge}>❓ Pergunta atual</span>
                  <span style={styles.perguntaCardStats}>
                    {responderam}/{total} responderam · {acertaram} acertaram
                  </span>
                </div>
                <p style={styles.perguntaCardTexto}>{missao.pergunta}</p>
                <div style={styles.perguntaOpcoes}>
                  {missao.opcoes?.map((op, i) => (
                    <div key={i} style={{
                      ...styles.perguntaOpcao,
                      background: responderam === total && total > 0 && op === missao.resposta_certa
                        ? 'rgba(76,175,80,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border: responderam === total && total > 0 && op === missao.resposta_certa
                        ? '1px solid #4caf50'
                        : '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <span style={{
                        ...styles.perguntaOpcaoLetra,
                        background: ['#E91E8C','#8B2FC9','#3f51b5','#00897b'][i],
                      }}>
                        {['A','B','C','D'][i]}
                      </span>
                      <span style={styles.perguntaOpcaoTexto}>{op}</span>
                      {responderam === total && total > 0 && op === missao.resposta_certa && (
                        <span style={styles.perguntaOpcaoCerto}>✅</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!missao && (
            <div style={styles.aguardandoCard}>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p style={styles.aguardandoTexto}>
                  ⏳ Aguardando o professor lançar uma missão...
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* LATERAL */}
        <div style={styles.lateral}>
          <Placar alunos={alunos}/>

          {/* QR Code / Link */}
          <div style={styles.linkCard}>
            <p style={styles.linkLabel}>📱 Acesse pelo celular:</p>
            <div style={styles.linkBox}>
              <span style={styles.linkTexto}>
                {window.location.origin}
              </span>
            </div>
            <p style={styles.linkSub}>
              Alunos acessam a URL raiz
            </p>
          </div>
        </div>
      </div>

      {/* CELEBRAÇÃO */}
      <AnimatePresence>
        {celebrando && (
          <motion.div
            style={styles.celebracaoOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Raios de luz */}
            <div style={styles.raios}>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    ...styles.raio,
                    transform: `rotate(${i * 30}deg)`,
                    background: i % 2 === 0
                      ? 'linear-gradient(180deg, rgba(233,30,140,0.6), transparent)'
                      : 'linear-gradient(180deg, rgba(139,47,201,0.6), transparent)',
                  }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </div>

            {/* Box central */}
            <motion.div
              style={styles.celebracaoBox}
              initial={{ scale: 0.3, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.3, y: 60 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {tipoCelebracao === 'vencedor' && vencedor ? (
                <>
                  <motion.div
                    style={styles.celebracaoEmoji}
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    🏆
                  </motion.div>
                  <motion.h2
                    style={styles.celebracaoTitulo}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    VENCEDOR!
                  </motion.h2>
                  <div style={styles.vencedorBox}>
                    <motion.span
                      style={styles.vencedorAvatar}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {vencedor.avatar}
                    </motion.span>
                    <span style={styles.vencedorNome}>{vencedor.nome}</span>
                  </div>
                  <p style={styles.celebracaoSub}>
                    chegou ao tesouro primeiro! 💎
                  </p>
                  <div style={styles.celebracaoEstrelinhas}>
                    {['⭐','🌟','✨','💫','⭐','🌟'].map((e, i) => (
                      <motion.span key={i}
                        animate={{ y: [0,-15,0], opacity: [0.5,1,0.5] }}
                        transition={{ duration: 1, delay: i*0.15, repeat: Infinity }}
                        style={{ fontSize: '1.5rem' }}
                      >
                        {e}
                      </motion.span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    style={styles.celebracaoEmoji}
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                  <motion.h2
                    style={styles.celebracaoTitulo}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >
                    TURMA INCRÍVEL!
                  </motion.h2>
                  <p style={styles.celebracaoSub}>
                    Todo mundo acertou! Que time! 🔥
                  </p>
                </>
              )}
            </motion.div>

            {/* Confetes */}
            <div style={styles.confetesWrap}>
              {CONFETES.map((e, i) => (
                <motion.span
                  key={i}
                  style={{
                    ...styles.confete,
                    left: `${4 + i * 8}%`,
                    fontSize: `${1.5 + Math.random()}rem`,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    rotate: [0, 720 * (i % 2 === 0 ? 1 : -1)],
                    x: [0, (i % 2 === 0 ? 40 : -40)],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.12,
                    repeat: Infinity,
                    ease: 'easeIn',
                  }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0a0010, #120025, #050f2e)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
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
  },
  gridLines: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: '1px',
    background: 'rgba(139,47,201,0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    background: 'rgba(0,0,0,0.5)',
    borderBottom: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(30px)',
    position: 'relative',
    zIndex: 2,
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  titulo: {
    fontSize: '1.8rem',
    margin: 0,
    background: 'linear-gradient(135deg, #fff 0%, rgba(192,38,211,0.8) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: '800',
  },
  perguntaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
  },
  perguntaDot: {
    width: '10px', height: '10px',
    borderRadius: '50%',
    transition: 'all 0.4s',
  },
  perguntaLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginLeft: '6px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  headerStats: {
    display: 'flex',
    gap: '8px',
  },
  statCard: {
    background: 'rgba(139,47,201,0.1)',
    border: '1px solid rgba(139,47,201,0.2)',
    borderRadius: '12px',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
    backdropFilter: 'blur(10px)',
  },
  statIcon: { fontSize: '0.85rem' },
  statNum: { fontSize: '1.4rem', fontWeight: '900', lineHeight: 1 },
  statLabel: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  progressoWrap: {
    padding: '6px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    zIndex: 2,
  },
  progressoTrack: {
    flex: 1,
    height: '8px',
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressoFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #E91E8C, #C026D3, #8B2FC9)',
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(233,30,140,0.5)',
  },
  progressoGlow: { display: 'none' },
  progressoTexto: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
  },
  corpo: {
    flex: 1,
    display: 'flex',
    gap: '14px',
    padding: '10px 28px 16px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  trilhaWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  perguntaCard: {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '14px 18px',
    border: '1px solid rgba(139,47,201,0.2)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 20px rgba(139,47,201,0.1)',
  },
  perguntaCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  perguntaCardBadge: {
    fontSize: '0.7rem',
    color: '#C026D3',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  perguntaCardStats: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
  },
  perguntaCardTexto: {
    fontSize: '1rem',
    color: 'white',
    margin: '0 0 12px',
    lineHeight: '1.5',
  },
  perguntaOpcoes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  perguntaOpcao: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 10px',
    borderRadius: '8px',
    transition: 'all 0.3s',
  },
  perguntaOpcaoLetra: {
    width: '22px', height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '900',
    color: 'white',
    flexShrink: 0,
  },
  perguntaOpcaoTexto: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  perguntaOpcaoCerto: { fontSize: '0.9rem' },
  aguardandoCard: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid rgba(139,47,201,0.1)',
    textAlign: 'center',
  },
  aguardandoTexto: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.9rem',
    margin: 0,
  },
  lateral: {
    width: '210px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flexShrink: 0,
  },
  linkCard: {
    background: 'rgba(0,0,0,0.35)',
    borderRadius: '14px',
    padding: '12px 14px',
    border: '1px solid rgba(139,47,201,0.15)',
    backdropFilter: 'blur(10px)',
  },
  linkLabel: {
    fontSize: '0.7rem',
    color: '#C026D3',
    margin: '0 0 8px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  linkBox: {
    background: 'rgba(139,47,201,0.1)',
    borderRadius: '8px',
    padding: '8px 10px',
    border: '1px solid rgba(139,47,201,0.2)',
    marginBottom: '6px',
  },
  linkTexto: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.7)',
    wordBreak: 'break-all',
  },
  linkSub: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.25)',
    margin: 0,
    textAlign: 'center',
  },
  celebracaoOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.88)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  raios: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  raio: {
    position: 'absolute',
    width: '3px',
    height: '50vh',
    transformOrigin: 'bottom center',
    bottom: '50%',
    borderRadius: '2px',
  },
  celebracaoBox: {
    background: 'linear-gradient(135deg, rgba(10,0,20,0.95), rgba(30,0,50,0.95))',
    border: '2px solid rgba(233,30,140,0.6)',
    borderRadius: '32px',
    padding: '50px 70px',
    textAlign: 'center',
    zIndex: 101,
    backdropFilter: 'blur(30px)',
    boxShadow: '0 0 80px rgba(233,30,140,0.3), 0 0 40px rgba(139,47,201,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  celebracaoEmoji: { fontSize: '5rem', lineHeight: 1 },
  celebracaoTitulo: {
    fontSize: '3.5rem',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(135deg, #E91E8C, #C026D3, #8B2FC9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '4px',
  },
  vencedorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(233,30,140,0.1)',
    border: '1px solid rgba(233,30,140,0.3)',
    borderRadius: '20px',
    padding: '16px 40px',
  },
  vencedorAvatar: { fontSize: '4.5rem', lineHeight: 1 },
  vencedorNome: {
    fontSize: '2.2rem',
    fontWeight: '900',
    color: 'white',
    letterSpacing: '1px',
  },
  celebracaoSub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  celebracaoEstrelinhas: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  confetesWrap: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 102,
    overflow: 'hidden',
  },
  confete: {
    position: 'absolute',
    top: '-60px',
    display: 'inline-block',
  },
};
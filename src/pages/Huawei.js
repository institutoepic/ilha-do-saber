import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import Trilha from '../components/Trilha';
import Placar from '../components/Placar';

export default function Huawei() {
  const [alunos, setAlunos] = useState({});
  const [missao, setMissao] = useState(null);
  const [perguntaAtual, setPerguntaAtual] = useState(-1);
  const [celebrando, setCelebrando] = useState(false);
  const [vencedor, setVencedor] = useState(null);
  const prevAlunosRef = useRef({});

  useEffect(() => {
    onValue(ref(db, 'sala/alunos'), snap => {
      const data = snap.val() || {};
      const prev = prevAlunosRef.current;

      // Verifica vencedor (chegou ao checkpoint 5)
      Object.values(data).forEach(aluno => {
        if ((aluno.checkpoint || 0) >= 5 && !vencedor) {
          setVencedor(aluno);
          setCelebrando(true);
          setTimeout(() => setCelebrando(false), 7000);
        }
      });

      // Verifica turma perfeita
      const lista = Object.values(data);
      const prevLista = Object.values(prev);
      if (
        lista.length > 0 &&
        lista.every(a => a.acertou) &&
        !prevLista.every(a => a.acertou)
      ) {
        setCelebrando(true);
        setTimeout(() => setCelebrando(false), 5000);
      }

      prevAlunosRef.current = data;
      setAlunos(data);
    });

    onValue(ref(db, 'sala/missao_atual'), snap => {
      setMissao(snap.val());
    });

    onValue(ref(db, 'sala/pergunta_atual'), snap => {
      const v = snap.val();
      setPerguntaAtual(v !== null && v !== undefined ? v : -1);
    });
  }, [vencedor]);

  const lista = Object.values(alunos);
  const total = lista.length;
  const responderam = lista.filter(a => a.respondeu).length;
  const acertaram = lista.filter(a => a.acertou).length;
  const progresso = total > 0 ? Math.round((responderam / total) * 100) : 0;

  const CONFETES = ['🌟','🎊','🏆','✨','🎯','🌈','🥳','💥','⭐','🎉'];

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>
            <span style={styles.logoInstituto}>INSTITUTO</span>
          <span style={styles.logoEpic}>EPIC</span>
        </div>

        <div style={styles.headerCenter}>
          <h1 style={styles.titulo}>🌴 Ilha do Saber</h1>
          {missao && (
            <p style={styles.perguntaLabel}>
              Pergunta {perguntaAtual + 1} de 5
            </p>
          )}
        </div>

        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{total}</span>
            <span style={styles.statLabel}>jogadores</span>
          </div>
          <div style={styles.statDivider}/>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{responderam}</span>
            <span style={styles.statLabel}>responderam</span>
          </div>
          <div style={styles.statDivider}/>
          <div style={styles.statItem}>
            <span style={{ ...styles.statNum, color: '#4caf50' }}>{acertaram}</span>
            <span style={styles.statLabel}>acertaram</span>
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div style={styles.progressoWrap}>
        <div style={styles.progressoBar}>
          <motion.div
            style={styles.progressoFill}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {progresso > 8 && (
            <span style={styles.progressoLabel}>
              {progresso}% responderam
            </span>
          )}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={styles.corpo}>

        {/* TRILHA */}
        <div style={styles.trilhaWrap}>
          <Trilha alunos={alunos} perguntaAtual={perguntaAtual}/>
        </div>

        {/* LATERAL DIREITA */}
        <div style={styles.lateral}>
          <Placar alunos={alunos}/>

          {/* Pergunta atual */}
          {missao && (
            <motion.div
              style={styles.missaoCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={missao.pergunta}
            >
              <p style={styles.missaoLabel}>❓ Pergunta atual</p>
              <p style={styles.missaoTexto}>{missao.pergunta}</p>
              <div style={styles.opcoesWrap}>
                {missao.opcoes?.map((op, i) => (
                  <div key={i} style={{
                    ...styles.opcaoItem,
                    background: op === missao.resposta_certa && responderam === total && total > 0
                      ? 'rgba(76,175,80,0.3)'
                      : 'rgba(255,255,255,0.05)',
                    border: op === missao.resposta_certa && responderam === total && total > 0
                      ? '1px solid #4caf50'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={styles.opcaoLetra}>
                      {['A','B','C','D'][i]}
                    </span>
                    <span style={styles.opcaoTexto}>{op}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!missao && (
            <div style={styles.aguardandoCard}>
              <p style={styles.aguardandoTexto}>
                ⏳ Aguardando o professor...
              </p>
            </div>
          )}
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
          >
            <motion.div
              style={styles.celebracaoBox}
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {vencedor ? (
                <>
                  <div style={styles.celebracaoEmoji}>🏆</div>
                  <h2 style={styles.celebracaoTitulo}>VENCEDOR!</h2>
                  <div style={styles.vencedorAvatar}>{vencedor.avatar}</div>
                  <p style={styles.vencedorNome}>{vencedor.nome}</p>
                  <p style={styles.celebracaoSub}>
                    chegou ao tesouro primeiro!
                  </p>
                </>
              ) : (
                <>
                  <div style={styles.celebracaoEmoji}>🎉</div>
                  <h2 style={styles.celebracaoTitulo}>TURMA INCRÍVEL!</h2>
                  <p style={styles.celebracaoSub}>
                    Todo mundo acertou!
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
                    left: `${5 + i * 9}%`,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    rotate: [0, 720],
                    scale: [0.5, 1.5, 0.8],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 2,
                    delay: i * 0.15,
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
    background: 'linear-gradient(160deg, #0f0c29, #302b63, #0d47a1)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(240,192,64,0.12)',
    border: '1px solid rgba(240,192,64,0.4)',
    borderRadius: '10px',
    padding: '6px 16px',
  },
  logoEpic: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: '#f0c040',
    letterSpacing: '4px',
  },
  logoInstituto: {
    fontSize: '0.5rem',
    color: 'rgba(240,192,64,0.6)',
    letterSpacing: '3px',
  },
  headerCenter: { textAlign: 'center', flex: 1 },
  titulo: {
    fontSize: '1.8rem',
    margin: 0,
    textShadow: '0 2px 12px rgba(0,0,0,0.5)',
  },
  perguntaLabel: {
    margin: '2px 0 0',
    fontSize: '0.8rem',
    color: '#f0c040',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '10px 20px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: '1.4rem', fontWeight: 'bold', color: '#f0c040', lineHeight: 1 },
  statLabel: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginTop: '2px' },
  statDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' },
  progressoWrap: { padding: '8px 28px' },
  progressoBar: {
    height: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '5px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressoFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #f0c040, #ff9800)',
    borderRadius: '5px',
  },
  progressoLabel: {
    position: 'absolute',
    right: '8px',
    top: '-1px',
    fontSize: '8px',
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  corpo: {
    flex: 1,
    display: 'flex',
    gap: '16px',
    padding: '12px 28px 20px',
    overflow: 'hidden',
  },
  trilhaWrap: { flex: 1, minWidth: 0 },
  lateral: {
    width: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
  },
  missaoCard: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '14px',
    padding: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
  },
  missaoLabel: {
    fontSize: '0.7rem',
    color: '#f0c040',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 8px',
    fontWeight: 'bold',
  },
  missaoTexto: {
    fontSize: '0.85rem',
    color: 'white',
    margin: '0 0 10px',
    lineHeight: '1.4',
  },
  opcoesWrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  opcaoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '8px',
    transition: 'all 0.3s',
  },
  opcaoLetra: {
    width: '20px', height: '20px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  opcaoTexto: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' },
  aguardandoCard: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },
  aguardandoTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    margin: 0,
  },
  celebracaoOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  celebracaoBox: {
    background: 'linear-gradient(135deg, rgba(240,192,64,0.2), rgba(255,152,0,0.2))',
    border: '2px solid #f0c040',
    borderRadius: '28px',
    padding: '50px 60px',
    textAlign: 'center',
    zIndex: 101,
    backdropFilter: 'blur(20px)',
  },
  celebracaoEmoji: { fontSize: '5rem', marginBottom: '10px' },
  celebracaoTitulo: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#f0c040',
    margin: '0 0 10px',
    letterSpacing: '4px',
  },
  celebracaoSub: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  vencedorAvatar: { fontSize: '4rem', margin: '10px 0' },
  vencedorNome: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 6px',
  },
  confetesWrap: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 102,
  },
  confete: {
    position: 'absolute',
    top: '-50px',
    fontSize: '2rem',
  },
};
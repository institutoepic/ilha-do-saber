import React from 'react';
// framer-motion reservado para animações futuras

const CHECKPOINTS = [
  { id: 0, nome: 'Largada', emoji: '🚩', x: 10, y: 72 },
  { id: 1, nome: 'Floresta', emoji: '🌳', x: 26, y: 58 },
  { id: 2, nome: 'Vulcão',   emoji: '🌋', x: 44, y: 42 },
  { id: 3, nome: 'Praia',    emoji: '🏖️', x: 62, y: 30 },
  { id: 4, nome: 'Caverna',  emoji: '🪨', x: 78, y: 22 },
  { id: 5, nome: 'Tesouro',  emoji: '🏆', x: 92, y: 14 },
];

export { CHECKPOINTS };

const CORES_AVATAR = [
  '#e91e63','#9c27b0','#3f51b5','#00897b',
  '#f57f17','#c62828','#2e7d32','#1565c0',
  '#6a1b9a','#00838f','#558b2f','#ef6c00',
];

export default function Trilha({ alunos, perguntaAtual }) {
  const lista = Object.entries(alunos || {});

  return (
    <div style={styles.wrapper}>
      <svg
        viewBox="0 0 1000 320"
        width="100%"
        style={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Oceano de fundo */}
        <defs>
          <radialGradient id="oceano" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1565c0"/>
            <stop offset="100%" stopColor="#0d47a1"/>
          </radialGradient>
          <radialGradient id="ilha" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor="#43a047"/>
            <stop offset="60%" stopColor="#388e3c"/>
            <stop offset="100%" stopColor="#2e7d32"/>
          </radialGradient>
        </defs>

        <rect width="1000" height="320" fill="url(#oceano)"/>

        {/* Ondas decorativas */}
        <path d="M0 280 Q50 270 100 280 Q150 290 200 280 Q250 270 300 280 Q350 290 400 280 Q450 270 500 280 Q550 290 600 280 Q650 270 700 280 Q750 290 800 280 Q850 270 900 280 Q950 290 1000 280 L1000 320 L0 320Z"
              fill="#0d47a1" opacity="0.5"/>
        <path d="M0 295 Q60 285 120 295 Q180 305 240 295 Q300 285 360 295 Q420 305 480 295 Q540 285 600 295 Q660 305 720 295 Q780 285 840 295 Q900 305 960 295 Q980 290 1000 295 L1000 320 L0 320Z"
              fill="#0a3880" opacity="0.6"/>

        {/* Ilha principal */}
        <ellipse cx="500" cy="200" rx="480" ry="160" fill="url(#ilha)"/>
        <ellipse cx="500" cy="185" rx="440" ry="130" fill="#43a047"/>
        <ellipse cx="500" cy="175" rx="400" ry="110" fill="#4caf50" opacity="0.6"/>

        {/* Detalhes da ilha — arbustos e pedras */}
        <ellipse cx="150" cy="240" rx="45" ry="22" fill="#2e7d32"/>
        <ellipse cx="850" cy="235" rx="40" ry="20" fill="#2e7d32"/>
        <ellipse cx="500" cy="270" rx="60" ry="18" fill="#2e7d32"/>
        <ellipse cx="300" cy="255" rx="30" ry="14" fill="#1b5e20"/>
        <ellipse cx="700" cy="248" rx="35" ry="15" fill="#1b5e20"/>

        {/* Palmeiras decorativas */}
        <line x1="180" y1="230" x2="175" y2="195" stroke="#5d4037" strokeWidth="4"/>
        <ellipse cx="172" cy="192" rx="18" ry="10" fill="#2e7d32" transform="rotate(-20,172,192)"/>
        <ellipse cx="178" cy="190" rx="18" ry="10" fill="#388e3c" transform="rotate(15,178,190)"/>

        <line x1="820" y1="225" x2="825" y2="190" stroke="#5d4037" strokeWidth="4"/>
        <ellipse cx="828" cy="187" rx="18" ry="10" fill="#2e7d32" transform="rotate(20,828,187)"/>
        <ellipse cx="822" cy="185" rx="18" ry="10" fill="#388e3c" transform="rotate(-15,822,185)"/>

        {/* TRILHA — caminho de areia */}
        <path
          d="M95 240 C140 220 180 200 240 175 C300 150 340 135 420 115 C480 100 540 88 620 78 C680 70 740 66 820 58 C860 54 900 52 930 48"
          fill="none" stroke="#8d6e63" strokeWidth="22" strokeLinecap="round"
        />
        <path
          d="M95 240 C140 220 180 200 240 175 C300 150 340 135 420 115 C480 100 540 88 620 78 C680 70 740 66 820 58 C860 54 900 52 930 48"
          fill="none" stroke="#bcaaa4" strokeWidth="14" strokeLinecap="round"
        />
        {/* Tracejado central da trilha */}
        <path
          d="M95 240 C140 220 180 200 240 175 C300 150 340 135 420 115 C480 100 540 88 620 78 C680 70 740 66 820 58 C860 54 900 52 930 48"
          fill="none" stroke="#d7ccc8" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="4 18"
        />

        {/* CHECKPOINTS */}
        {CHECKPOINTS.map((cp, i) => {
          const cx = cp.x * 10;
          const cy = cp.y * 3.2;
          const ativo = i === perguntaAtual + 1;
          const concluido = i <= perguntaAtual;

          return (
            <g key={cp.id}>
              {/* Halo do checkpoint ativo */}
              {ativo && (
                <circle cx={cx} cy={cy} r="28" fill="rgba(240,192,64,0.25)"/>
              )}
              {/* Círculo do checkpoint */}
              <circle
                cx={cx} cy={cy} r="20"
                fill={concluido ? '#f57f17' : ativo ? '#f0c040' : '#1b5e20'}
                stroke={ativo ? '#ffeb3b' : concluido ? '#ffa726' : '#a5d6a7'}
                strokeWidth={ativo ? 3 : 2}
              />
              {/* Emoji do checkpoint */}
              <text x={cx} y={cy + 7} textAnchor="middle" fontSize="18">{cp.emoji}</text>
              {/* Nome do checkpoint */}
              <rect
                x={cx - 30} y={cy - 38} width="60" height="16"
                rx="4" fill="rgba(0,0,0,0.55)"
              />
              <text
                x={cx} y={cy - 26}
                textAnchor="middle"
                fontSize="10"
                fontFamily="Arial"
                fontWeight="bold"
                fill={ativo ? '#ffeb3b' : concluido ? '#ffa726' : '#a5d6a7'}
              >
                {cp.nome}
              </text>
              {/* Número do checkpoint */}
              {i > 0 && i < 5 && (
                <text x={cx} y={cy + 32} textAnchor="middle" fontSize="9" fontFamily="Arial" fill="rgba(255,255,255,0.6)">
                  Q{i}
                </text>
              )}
            </g>
          );
        })}

        {/* AVATARES dos alunos */}
        {lista.map(([id, aluno], i) => {
          const cpIndex = Math.min(aluno.checkpoint || 0, 5);
          const cp = CHECKPOINTS[cpIndex];
          const cx = cp.x * 10;
          const cy = cp.y * 3.2;
          const offset = (i % 5) * 16 - 32;
          const offsetY = Math.floor(i / 5) * 20;
          const cor = CORES_AVATAR[i % CORES_AVATAR.length];

          return (
            <g key={id}>
              <circle
                cx={cx + offset} cy={cy - 30 - offsetY} r="13"
                fill={cor} stroke="white" strokeWidth="2"
              />
              <text
                x={cx + offset} y={cy - 25 - offsetY}
                textAnchor="middle" fontSize="13"
              >
                {aluno.avatar}
              </text>
              <rect
                x={cx + offset - 18} y={cy - 14 - offsetY}
                width="36" height="11" rx="3"
                fill="rgba(0,0,0,0.65)"
              />
              <text
                x={cx + offset} y={cy - 5 - offsetY}
                textAnchor="middle" fontSize="8"
                fontFamily="Arial" fill="white"
              >
                {aluno.nome?.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Estrelinhas decorativas no céu */}
        {[
          [30,20],[60,10],[100,25],[150,8],[200,18],[700,15],[750,8],
          [800,20],[850,10],[900,25],[950,12]
        ].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r="1.5" fill="#ffeb3b" opacity="0.7"/>
        ))}
      </svg>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.15)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  svg: {
    display: 'block',
  },
};
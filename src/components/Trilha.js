import React from 'react';

const CHECKPOINTS = [
  { id: 0, nome: 'Largada', emoji: '🚩', x: 8,  y: 75 },
  { id: 1, nome: 'Floresta', emoji: '🌳', x: 24, y: 60 },
  { id: 2, nome: 'Vulcão',   emoji: '🌋', x: 42, y: 42 },
  { id: 3, nome: 'Praia',    emoji: '🏖️', x: 60, y: 28 },
  { id: 4, nome: 'Caverna',  emoji: '🪨', x: 77, y: 18 },
  { id: 5, nome: 'Tesouro',  emoji: '🏆', x: 92, y: 10 },
];

export { CHECKPOINTS };

const CORES_AVATAR = [
  '#E91E8C','#C026D3','#8B2FC9','#3f51b5',
  '#00897b','#f57f17','#c62828','#2e7d32',
  '#1565c0','#6a1b9a','#00838f','#ef6c00',
];

export default function Trilha({ alunos, perguntaAtual }) {
  const lista = Object.entries(alunos || {});

  return (
    <div style={styles.wrapper}>
      <svg
        viewBox="0 0 1000 340"
        width="100%"
        style={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradientes do céu */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0010"/>
            <stop offset="60%" stopColor="#1a0030"/>
            <stop offset="100%" stopColor="#0d1a4a"/>
          </linearGradient>
          {/* Gradiente da ilha */}
          <radialGradient id="ilha" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#1a4a1a"/>
            <stop offset="50%" stopColor="#145214"/>
            <stop offset="100%" stopColor="#0a2e0a"/>
          </radialGradient>
          {/* Brilho roxo de fundo */}
          <radialGradient id="glowBg" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(139,47,201,0.15)"/>
            <stop offset="100%" stopColor="rgba(139,47,201,0)"/>
          </radialGradient>
          {/* Gradiente oceano */}
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d2b6e"/>
            <stop offset="100%" stopColor="#050f2e"/>
          </linearGradient>
          {/* Gradiente trilha */}
          <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B2FC9"/>
            <stop offset="50%" stopColor="#C026D3"/>
            <stop offset="100%" stopColor="#E91E8C"/>
          </linearGradient>
          {/* Gradiente checkpoint ativo */}
          <radialGradient id="cpActive" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E91E8C"/>
            <stop offset="100%" stopColor="#8B2FC9"/>
          </radialGradient>
          {/* Brilho checkpoint */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Fundo céu */}
        <rect width="1000" height="340" fill="url(#sky)"/>
        <rect width="1000" height="340" fill="url(#glowBg)"/>

        {/* Estrelas */}
        {[
          [50,15],[120,8],[200,20],[280,5],[350,18],[420,10],[500,22],
          [580,8],[650,16],[720,6],[800,20],[880,12],[950,18],[160,30],
          [440,28],[700,25],[900,30],[80,35],[320,32],[760,28],
        ].map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r={i%3===0?2:1.2}
            fill="#fff" opacity={0.4+Math.random()*0.5}/>
        ))}

        {/* Nebulosa roxa */}
        <ellipse cx="200" cy="60" rx="180" ry="60" fill="rgba(139,47,201,0.08)"/>
        <ellipse cx="750" cy="40" rx="200" ry="50" fill="rgba(192,38,211,0.06)"/>

        {/* Oceano */}
        <ellipse cx="500" cy="340" rx="560" ry="80" fill="url(#ocean)"/>

        {/* Ondas */}
        <path d="M0 310 Q80 300 160 310 Q240 320 320 310 Q400 300 480 310 Q560 320 640 310 Q720 300 800 310 Q880 320 960 310 Q980 308 1000 310 L1000 340 L0 340Z"
              fill="#0a1f5c" opacity="0.7"/>
        <path d="M0 325 Q100 315 200 325 Q300 335 400 325 Q500 315 600 325 Q700 335 800 325 Q900 315 1000 325 L1000 340 L0 340Z"
              fill="#070f3a" opacity="0.8"/>

        {/* ILHA */}
        <ellipse cx="500" cy="260" rx="490" ry="130" fill="#0a2e0a"/>
        <ellipse cx="500" cy="248" rx="460" ry="115" fill="#0d3b0d"/>
        <ellipse cx="500" cy="238" rx="430" ry="100" fill="#145214"/>
        <ellipse cx="500" cy="228" rx="400" ry="88"  fill="#1a6b1a"/>
        <ellipse cx="500" cy="220" rx="370" ry="76"  fill="#1e7a1e"/>

        {/* Texturas da ilha — arbustos */}
        <ellipse cx="120" cy="262" rx="55" ry="25" fill="#0d3b0d"/>
        <ellipse cx="880" cy="258" rx="50" ry="22" fill="#0d3b0d"/>
        <ellipse cx="320" cy="272" rx="40" ry="18" fill="#0a2e0a"/>
        <ellipse cx="680" cy="268" rx="45" ry="20" fill="#0a2e0a"/>
        <ellipse cx="500" cy="278" rx="70" ry="20" fill="#0a2e0a"/>

        {/* Palmeiras */}
        {[[140,248],[860,244],[220,240],[780,238]].map(([px,py],i) => (
          <g key={i}>
            <line x1={px} y1={py} x2={px+(i%2===0?-5:5)} y2={py-45}
              stroke="#4a2c0a" strokeWidth="5" strokeLinecap="round"/>
            <ellipse cx={px+(i%2===0?-8:8)} cy={py-48} rx="20" ry="10"
              fill="#0d4a0d" transform={`rotate(${i%2===0?-25:25},${px},${py-48})`}/>
            <ellipse cx={px+(i%2===0?5:-5)} cy={py-46} rx="20" ry="9"
              fill="#145214" transform={`rotate(${i%2===0?15:-15},${px},${py-46})`}/>
            <ellipse cx={px} cy={py-50} rx="15" ry="8"
              fill="#1a6b1a" transform={`rotate(${i%2===0?-5:5},${px},${py-50})`}/>
          </g>
        ))}

        {/* Rochas decorativas */}
        {[[200,260],[400,270],[600,268],[800,262]].map(([rx,ry],i) => (
          <g key={i}>
            <ellipse cx={rx} cy={ry} rx="12" ry="8" fill="#2a1a0a"/>
            <ellipse cx={rx-3} cy={ry-2} rx="8" ry="5" fill="#3a2a1a"/>
          </g>
        ))}

        {/* TRILHA */}
        {/* Sombra da trilha */}
        <path
          d="M78 258 C130 235 175 215 240 188 C305 161 355 145 430 122 C490 104 550 90 625 76 C685 65 745 58 820 48 C860 43 900 40 930 36"
          fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="28" strokeLinecap="round"
        />
        {/* Base da trilha */}
        <path
          d="M78 258 C130 235 175 215 240 188 C305 161 355 145 430 122 C490 104 550 90 625 76 C685 65 745 58 820 48 C860 43 900 40 930 36"
          fill="none" stroke="#3b1f6b" strokeWidth="24" strokeLinecap="round"
        />
        {/* Trilha colorida */}
        <path
          d="M78 258 C130 235 175 215 240 188 C305 161 355 145 430 122 C490 104 550 90 625 76 C685 65 745 58 820 48 C860 43 900 40 930 36"
          fill="none" stroke="url(#trailGrad)" strokeWidth="16" strokeLinecap="round"
          opacity="0.8"
        />
        {/* Tracejado central */}
        <path
          d="M78 258 C130 235 175 215 240 188 C305 161 355 145 430 122 C490 104 550 90 625 76 C685 65 745 58 820 48 C860 43 900 40 930 36"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"
          strokeLinecap="round" strokeDasharray="6 20"
        />

        {/* CHECKPOINTS */}
        {CHECKPOINTS.map((cp, i) => {
          const cx = cp.x * 10;
          const cy = cp.y * 3.4;
          const ativo = i === perguntaAtual + 1;
          const concluido = i <= perguntaAtual;

          return (
            <g key={cp.id} filter={ativo ? "url(#glowStrong)" : concluido ? "url(#glow)" : ""}>
              {/* Halo externo */}
              {ativo && (
                <>
                  <circle cx={cx} cy={cy} r="36" fill="rgba(233,30,140,0.1)"/>
                  <circle cx={cx} cy={cy} r="28" fill="rgba(233,30,140,0.15)"
                    stroke="rgba(233,30,140,0.4)" strokeWidth="1"/>
                </>
              )}
              {/* Círculo principal */}
              <circle
                cx={cx} cy={cy} r="22"
                fill={concluido ? '#4a1080' : ativo ? 'url(#cpActive)' : '#0d2b0d'}
                stroke={ativo ? '#E91E8C' : concluido ? '#C026D3' : '#2a5a2a'}
                strokeWidth={ativo ? 3 : 2}
              />
              {/* Emoji */}
              <text x={cx} y={cy+8} textAnchor="middle" fontSize="20">{cp.emoji}</text>
              {/* Label */}
              <rect x={cx-34} y={cy-42} width="68" height="18" rx="5"
                fill="rgba(0,0,0,0.7)"/>
              <text x={cx} y={cy-29} textAnchor="middle" fontSize="11"
                fontFamily="Arial" fontWeight="bold"
                fill={ativo ? '#E91E8C' : concluido ? '#C026D3' : '#5a9a5a'}>
                {cp.nome}
              </text>
              {/* Número */}
              {i > 0 && i < 5 && (
                <text x={cx} y={cy+38} textAnchor="middle" fontSize="9"
                  fontFamily="Arial" fill="rgba(255,255,255,0.4)">
                  Q{i}
                </text>
              )}
              {/* Check de concluído */}
              {concluido && i > 0 && (
                <text x={cx+16} y={cy-14} fontSize="12">✅</text>
              )}
            </g>
          );
        })}

        {/* AVATARES */}
       {lista.map(([id, aluno], i) => {
          const pontos = aluno.pontos || 0;
          const acertos = aluno.acertos || 0;
          const cpIndex = Math.min(acertos, 5);
          const cp = CHECKPOINTS[cpIndex];
          const cx = cp.x * 10;
          const cy = cp.y * 3.4;
          const col = i % 6;
          const row = Math.floor(i / 6);
          const offsetX = (col - 2.5) * 18;
          const offsetY = row * 22;
          const cor = CORES_AVATAR[i % CORES_AVATAR.length];

          return (
            <g key={id}>
              {/* Sombra do avatar */}
              <ellipse cx={cx+offsetX} cy={cy-18-offsetY+2} rx="12" ry="4"
                fill="rgba(0,0,0,0.4)"/>
              {/* Brilho se acertou */}
              {aluno.acertou && (
                <circle cx={cx+offsetX} cy={cy-28-offsetY} r="16"
                  fill="rgba(233,30,140,0.2)" stroke="rgba(233,30,140,0.5)"
                  strokeWidth="1"/>
              )}
              {/* Círculo do avatar */}
              <circle cx={cx+offsetX} cy={cy-28-offsetY} r="13"
                fill={cor} stroke="white" strokeWidth="2"/>
              {/* Emoji do avatar */}
              <text x={cx+offsetX} y={cy-23-offsetY}
                textAnchor="middle" fontSize="14">{aluno.avatar}</text>
              {/* Nome */}
              <rect x={cx+offsetX-18} y={cy-12-offsetY} width="36" height="11"
                rx="3" fill="rgba(0,0,0,0.75)"/>
              <text x={cx+offsetX} y={cy-3-offsetY}
                textAnchor="middle" fontSize="8"
                fontFamily="Arial" fill="white">
                {aluno.nome?.split(' ')[0]}
              </text>
              {/* Estrela se acertou */}
              {aluno.acertou && (
                <text x={cx+offsetX+10} y={cy-36-offsetY} fontSize="10">⭐</text>
              )}
            </g>
          );
        })}

        {/* Partículas mágicas na trilha */}
        {[
          [240,188],[350,155],[450,125],[560,96],[670,72],[780,52]
        ].map(([px,py],i) => (
          <g key={i}>
            <circle cx={px+15} cy={py-15} r="2" fill="#E91E8C" opacity="0.6"/>
            <circle cx={px-10} cy={py-25} r="1.5" fill="#C026D3" opacity="0.5"/>
            <circle cx={px+25} cy={py-8} r="1" fill="#fff" opacity="0.4"/>
          </g>
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
    border: '1px solid rgba(139,47,201,0.3)',
    boxShadow: '0 0 40px rgba(139,47,201,0.2), 0 8px 32px rgba(0,0,0,0.6)',
  },
  svg: { display: 'block' },
};
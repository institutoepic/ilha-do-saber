import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = 'AIzaSyB9HAeuoo-_2t8tT-ZlOZG2ZpZsGH_TF7k';

const MATERIAS = ['Matemática','Português','Ciências','História','Geografia','Inglês','Artes','Educação Física'];
const NIVEIS = [
  { label: 'Ed. Infantil', anos: ['Maternal','Jardim I','Jardim II'] },
  { label: 'Fund. I', anos: ['1º ano','2º ano','3º ano','4º ano','5º ano'] },
  { label: 'Fund. II', anos: ['6º ano','7º ano','8º ano','9º ano'] },
  { label: 'EJA', anos: ['EJA I','EJA II','EJA III'] },
];

export default function GeradorIA({ onGerado }) {
  const [materia, setMateria] = useState('Matemática');
  const [ano, setAno] = useState('3º ano');
  const [tema, setTema] = useState('');
  const [quantidade, setQuantidade] = useState(5);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);
  const [nivelAtivo, setNivelAtivo] = useState('Fund. I');

  async function gerarPerguntas() {
    setGerando(true);
    setErro('');
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Crie ${quantidade} perguntas de múltipla escolha sobre ${materia} para alunos do ${ano}${tema ? `, com foco em: ${tema}` : ''}.

Retorne APENAS um array JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código. Apenas o JSON puro:
[
  {
    "pergunta": "texto da pergunta",
    "opcoes": ["opção A", "opção B", "opção C", "opção D"],
    "resposta_certa": "opção A"
  }
]

Regras importantes:
- Linguagem simples e adequada para ${ano}
- Exatamente 4 opções por pergunta
- Apenas uma resposta certa
- A resposta_certa deve ser EXATAMENTE igual a uma das opcoes (cópia exata)
- Perguntas criativas e educativas
- Retorne exatamente ${quantidade} perguntas`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const clean = text.replace(/```json|```/g, '').trim();
      const inicio = clean.indexOf('[');
      const fim = clean.lastIndexOf(']');
      const jsonLimpo = clean.slice(inicio, fim + 1);
      const perguntas = JSON.parse(jsonLimpo);

      if (!Array.isArray(perguntas) || perguntas.length === 0) {
        throw new Error('Formato inválido');
      }

      const formatadas = perguntas.map(p => ({
        pergunta: p.pergunta || '',
        opcoes: Array.isArray(p.opcoes)
          ? [...p.opcoes.slice(0, 4), '', '', '', ''].slice(0, 4)
          : ['', '', '', ''],
        resposta_certa: p.resposta_certa || '',
      }));

      onGerado(formatadas);
      setAberto(false);
      setTema('');
    } catch (e) {
      console.error(e);
      setErro('Erro ao gerar perguntas. Verifique sua conexão e tente novamente!');
    }
    setGerando(false);
  }

  if (!aberto) {
    return (
      <button style={styles.botaoAbrir} onClick={() => setAberto(true)}>
        🤖 Gerar perguntas com IA
      </button>
    );
  }

  const anosDoNivel = NIVEIS.find(n => n.label === nivelAtivo)?.anos || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🤖</span>
          <span style={styles.headerTitulo}>Gerador de Perguntas com IA</span>
        </div>
        <button style={styles.btnFechar} onClick={() => setAberto(false)}>✕</button>
      </div>

      <div style={styles.form}>

        {/* Matéria */}
        <div style={styles.campo}>
          <label style={styles.label}>📚 Matéria</label>
          <div style={styles.opcoesBtns}>
            {MATERIAS.map(m => (
              <button key={m} style={{
                ...styles.opcaoBtn,
                background: materia === m
                  ? 'linear-gradient(135deg, #E91E8C, #C026D3)'
                  : 'rgba(255,255,255,0.05)',
                border: materia === m ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setMateria(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Nível */}
        <div style={styles.campo}>
          <label style={styles.label}>🎓 Nível de ensino</label>
          <div style={styles.opcoesBtns}>
            {NIVEIS.map(n => (
              <button key={n.label} style={{
                ...styles.opcaoBtn,
                background: nivelAtivo === n.label
                  ? 'linear-gradient(135deg, #3f51b5, #1a237e)'
                  : 'rgba(255,255,255,0.05)',
                border: nivelAtivo === n.label ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => {
                setNivelAtivo(n.label);
                setAno(n.anos[0]);
              }}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ano */}
        <div style={styles.campo}>
          <label style={styles.label}>📅 Turma</label>
          <div style={styles.opcoesBtns}>
            {anosDoNivel.map(a => (
              <button key={a} style={{
                ...styles.opcaoBtn,
                background: ano === a
                  ? 'linear-gradient(135deg, #8B2FC9, #3f51b5)'
                  : 'rgba(255,255,255,0.05)',
                border: ano === a ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setAno(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Tema */}
        <div style={styles.campo}>
          <label style={styles.label}>🎯 Tema específico (opcional)</label>
          <input
            style={styles.input}
            placeholder="Ex: tabuada do 3, substantivos, sistema solar..."
            value={tema}
            onChange={e => setTema(e.target.value)}
          />
        </div>

        {/* Quantidade */}
        <div style={styles.campo}>
          <label style={styles.label}>🔢 Quantidade de perguntas</label>
          <div style={styles.opcoesBtns}>
            {[3, 5, 8, 10].map(q => (
              <button key={q} style={{
                ...styles.opcaoBtn,
                background: quantidade === q
                  ? 'linear-gradient(135deg, #00897b, #00695c)'
                  : 'rgba(255,255,255,0.05)',
                border: quantidade === q ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setQuantidade(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <div style={styles.erroBox}>
            <span>⚠️ {erro}</span>
          </div>
        )}

        <button
          style={{
            ...styles.botaoGerar,
            opacity: gerando ? 0.7 : 1,
            cursor: gerando ? 'not-allowed' : 'pointer',
          }}
          onClick={gerarPerguntas}
          disabled={gerando}
        >
          {gerando ? '⟳ Gerando perguntas...' : '✨ Gerar perguntas agora'}
        </button>

        <p style={styles.disclaimer}>
          As perguntas serão geradas pela IA e preenchidas automaticamente. Você pode editar antes de iniciar o jogo.
        </p>
      </div>
    </div>
  );
}

const styles = {
  botaoAbrir: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, rgba(139,47,201,0.3), rgba(233,30,140,0.3))',
    color: 'white',
    border: '2px dashed rgba(139,47,201,0.6)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '16px',
    transition: 'all 0.2s',
  },
  container: {
    background: 'rgba(10,0,20,0.95)',
    borderRadius: '20px',
    border: '1px solid rgba(139,47,201,0.4)',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: '0 0 40px rgba(139,47,201,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, rgba(139,47,201,0.3), rgba(233,30,140,0.2))',
    borderBottom: '1px solid rgba(139,47,201,0.3)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerIcon: { fontSize: '1.4rem' },
  headerTitulo: { fontSize: '0.95rem', fontWeight: '700', color: 'white' },
  btnFechar: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'Arial, sans-serif',
  },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '0.8rem',
    color: '#C026D3',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  opcoesBtns: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  opcaoBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(139,47,201,0.3)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  botaoGerar: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #E91E8C, #C026D3, #8B2FC9)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 20px rgba(233,30,140,0.4)',
  },
  erroBox: {
    background: 'rgba(244,67,54,0.15)',
    border: '1px solid rgba(244,67,54,0.4)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.85rem',
    color: '#f44336',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    margin: 0,
  },
};
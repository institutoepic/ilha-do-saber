import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = 'AIzaSyB9HAeuoo-_2t8tT-ZlOZG2ZpZsGH_TF7k';

const MATERIAS = ['Matemática','Português','Ciências','História','Geografia','Inglês','Artes','Educação Física'];
const ANOS = ['1º ano','2º ano','3º ano','4º ano','5º ano','6º ano','7º ano','8º ano','9º ano'];

export default function GeradorIA({ onGerado }) {
  const [materia, setMateria] = useState('Matemática');
  const [ano, setAno] = useState('3º ano');
  const [tema, setTema] = useState('');
  const [quantidade, setQuantidade] = useState(5);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);

  async function gerarPerguntas() {
    setGerando(true);
    setErro('');
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Crie ${quantidade} perguntas de múltipla escolha sobre ${materia} para alunos do ${ano} do Ensino Fundamental${tema ? `, com foco em: ${tema}` : ''}.

Retorne APENAS um JSON válido, sem nenhum texto antes ou depois, sem markdown, sem blocos de código. Apenas o JSON puro neste formato exato:
[
  {
    "pergunta": "texto da pergunta",
    "opcoes": ["opção A", "opção B", "opção C", "opção D"],
    "resposta_certa": "opção A"
  }
]

Regras:
- Linguagem simples e adequada para a idade
- 4 opções por pergunta
- Apenas uma resposta certa
- A resposta_certa deve ser EXATAMENTE igual a uma das opcoes
- Perguntas criativas e educativas`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Limpa possível markdown
      const clean = text.replace(/```json|```/g, '').trim();
      const perguntas = JSON.parse(clean);

      if (!Array.isArray(perguntas) || perguntas.length === 0) {
        throw new Error('Formato inválido');
      }

      // Valida e formata cada pergunta
      const formatadas = perguntas.map(p => ({
        pergunta: p.pergunta || '',
        opcoes: Array.isArray(p.opcoes) ? p.opcoes.slice(0, 4).concat(['','','','']).slice(0, 4) : ['','','',''],
        resposta_certa: p.resposta_certa || '',
      }));

      onGerado(formatadas);
      setAberto(false);
    } catch (e) {
      setErro('Erro ao gerar perguntas. Tente novamente!');
      console.error(e);
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
                background: materia === m ? 'linear-gradient(135deg, #E91E8C, #C026D3)' : 'rgba(255,255,255,0.05)',
                border: materia === m ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setMateria(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Ano */}
        <div style={styles.campo}>
          <label style={styles.label}>🎓 Ano escolar</label>
          <div style={styles.opcoesBtns}>
            {ANOS.map(a => (
              <button key={a} style={{
                ...styles.opcaoBtn,
                background: ano === a ? 'linear-gradient(135deg, #8B2FC9, #3f51b5)' : 'rgba(255,255,255,0.05)',
                border: ano === a ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setAno(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Tema opcional */}
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
                background: quantidade === q ? 'linear-gradient(135deg, #00897b, #00695c)' : 'rgba(255,255,255,0.05)',
                border: quantidade === q ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }} onClick={() => setQuantidade(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {erro && <p style={styles.erro}>{erro}</p>}

        <button
          style={{
            ...styles.botaoGerar,
            opacity: gerando ? 0.7 : 1,
            cursor: gerando ? 'not-allowed' : 'pointer',
          }}
          onClick={gerarPerguntas}
          disabled={gerando}
        >
          {gerando ? (
            <span style={styles.gerando}>
              <span style={styles.spinner}>⟳</span>
              Gerando perguntas...
            </span>
          ) : (
            '✨ Gerar perguntas agora'
          )}
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
  label: { fontSize: '0.8rem', color: '#C026D3', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
  opcoesBtns: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  opcaoBtn: {
    padding: '6px 12px',
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
  gerando: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  spinner: { display: 'inline-block', animation: 'rotate 1s linear infinite', fontSize: '1.2rem' },
  erro: { color: '#f44336', fontSize: '0.85rem', margin: 0, textAlign: 'center' },
  disclaimer: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 },
};
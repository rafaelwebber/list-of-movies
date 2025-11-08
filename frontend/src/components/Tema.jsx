import React, { useState } from 'react';
import './Tema.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Tema() {
  const { tema, alterarTema } = useTheme();
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  const salvarTema = async (novoTema) => {
    if (novoTema === tema) {
      return; // Já está selecionado
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    
    try {
      await alterarTema(novoTema);
      setMensagem({ tipo: 'sucesso', texto: 'Tema alterado com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao alterar tema. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="tema-container">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>Voltar</button>
      <h1>Escolha o tema de fundo</h1>

      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
      )}

      <div className="opcoes-tema">
        <div 
          className={`opcao ${tema === 'claro' ? 'selecionado' : ''}`} 
          onClick={() => salvarTema('claro')}
        >
          <div className="preview claro">Tema Claro</div>
          <button disabled={salvando}>
            {tema === 'claro' ? 'Selecionado' : 'Selecionar'}
          </button>
        </div>

        <div 
          className={`opcao ${tema === 'escuro' ? 'selecionado' : ''}`} 
          onClick={() => salvarTema('escuro')}
        >
          <div className="preview escuro">Tema Escuro</div>
          <button disabled={salvando}>
            {tema === 'escuro' ? 'Selecionado' : 'Selecionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

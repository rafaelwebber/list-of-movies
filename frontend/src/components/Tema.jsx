import React, { useEffect, useState } from 'react';
import './Tema.css';
import { useNavigate } from 'react-router-dom';

export default function Tema() {
  const [temaAtual, setTemaAtual] = useState('claro');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    aplicarTemaInicial();
    carregarTemaUsuario();
  }, []);

  const aplicarTemaInicial = () => {
    const local = localStorage.getItem('temaApp');
    if (local) {
      aplicarTema(local);
      setTemaAtual(local);
    }
  };

  const carregarTemaUsuario = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const user = JSON.parse(userInfo);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/usuarios/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dados && data.dados.tema) {
          setTemaAtual(data.dados.tema);
          aplicarTema(data.dados.tema);
          // atualizar localStorage
          localStorage.setItem('temaApp', data.dados.tema);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar tema:', e);
    }
  };

  const aplicarTema = (tema) => {
    if (tema === 'claro') {
      document.body.style.backgroundImage = "url('/imagens/fundo-login.avif')";
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
  };

  const salvarTema = async (novoTema) => {
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setMensagem({ tipo: 'erro', texto: 'Usuário não logado.' });
        setSalvando(false);
        return;
      }
      const user = JSON.parse(userInfo);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/usuarios/${user.id}/tema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tema: novoTema })
      });

      const data = await response.json();

      if (response.ok) {
        setTemaAtual(novoTema);
        aplicarTema(novoTema);
        localStorage.setItem('temaApp', novoTema);
        setMensagem({ tipo: 'sucesso', texto: data.mensagem || 'Tema salvo com sucesso.' });
      } else {
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao salvar tema.' });
      }
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
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
        <div className={`opcao ${temaAtual === 'claro' ? 'selecionado' : ''}`} onClick={() => salvarTema('claro')}>
          <div className="preview claro">Tema Claro</div>
          <button disabled={salvando}>{temaAtual === 'claro' ? 'Selecionado' : 'Selecionar'}</button>
        </div>

        <div className={`opcao ${temaAtual === 'escuro' ? 'selecionado' : ''}`} onClick={() => salvarTema('escuro')}>
          <div className="preview escuro">Tema Escuro</div>
          <button disabled={salvando}>{temaAtual === 'escuro' ? 'Selecionado' : 'Selecionar'}</button>
        </div>
      </div>

    </div>
  );
}

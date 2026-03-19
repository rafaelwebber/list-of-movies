import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLightbulb, FaFilm, FaPlus, FaStar } from 'react-icons/fa';
import './Recomendacoes.css';

export default function Recomendacoes() {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [adicionando, setAdicionando] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarRecomendacoes();
  }, []);

  const carregarRecomendacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      if (!token || !userInfo) {
        navigate('/');
        return;
      }

      const user = JSON.parse(userInfo);
      const response = await fetch(`${API_URL}/filmes/recomendacoes?usuario_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecomendacoes(data.dados && Array.isArray(data.dados) ? data.dados : []);
      } else {
        setRecomendacoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      setRecomendacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarFilme = async (filme) => {
    setAdicionando(filme.id);

    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      const user = JSON.parse(userInfo);

      const responseAdd = await fetch(`${API_URL}/filmes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: filme.titulo,
          ano: filme.ano || null,
          imagem_url: filme.imagem_url || null
        })
      });

      const dataAdd = await responseAdd.json();
      let filmeId = dataAdd.dados?.filme_id;

      if (!filmeId && dataAdd.status === 409) {
        filmeId = dataAdd.dados?.filme_id;
      }

      if (filmeId) {
        const responseVincular = await fetch(`${API_URL}/filmes/vincular`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filme_id: filmeId, usuario_id: user.id })
        });

        if (responseVincular.ok) {
          setMensagem({ tipo: 'sucesso', texto: `"${filme.titulo}" adicionado à lista!` });
          setRecomendacoes(recomendacoes.filter(r => r.id !== filme.id));
        } else {
          const dataVincular = await responseVincular.json();
          setMensagem({ tipo: 'erro', texto: dataVincular.status_http === 409 ? 'Já está na sua lista.' : 'Erro ao adicionar.' });
        }
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao adicionar filme.' });
    } finally {
      setAdicionando(null);
    }
  };

  useEffect(() => {
    if (mensagem.texto) {
      const timer = setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  if (loading) {
    return (
      <div className="recomendacoes-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando recomendações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recomendacoes-container">
      <div className="recomendacoes-content">
        <div className="recomendacoes-header">
          <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <h1>Recomendações</h1>
          <p className="subtitle">Filmes sugeridos para você</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
        )}

        {recomendacoes.length === 0 ? (
          <div className="empty-state">
            <FaLightbulb className="empty-icon" />
            <h2>Nenhuma recomendação no momento</h2>
            <p>Adicione filmes à sua coleção e avalie-os para receber recomendações personalizadas.</p>
            <button className="btn-adicionar" onClick={() => navigate('/dashboard/adicionar')}>
              Adicionar Filmes
            </button>
            <p className="hint">Ou busque filmes populares para descobrir novos títulos.</p>
            <button className="btn-secundario" onClick={() => navigate('/dashboard/buscar')}>
              Buscar Filmes
            </button>
          </div>
        ) : (
          <div className="recomendacoes-grid">
            {recomendacoes.map((filme) => (
              <div key={filme.id} className="recomendacao-card">
                <div className="recomendacao-imagem-container">
                  {filme.imagem_url ? (
                    <img src={filme.imagem_url} alt={filme.titulo} className="recomendacao-imagem" />
                  ) : (
                    <div className="recomendacao-sem-imagem"><FaFilm /></div>
                  )}
                  <div className="recomendacao-badge">
                    <FaStar /> Recomendado
                  </div>
                </div>
                <div className="recomendacao-info">
                  <h3>{filme.titulo}</h3>
                  <p className="recomendacao-motivo">{filme.motivo || 'Baseado no seu gosto'}</p>
                  <button
                    className="btn-adicionar-filme"
                    onClick={() => adicionarFilme(filme)}
                    disabled={adicionando === filme.id}
                  >
                    {adicionando === filme.id ? 'Adicionando...' : <><FaPlus /> Adicionar</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaTrash, FaFilm, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { API_URL } from '../config';
import './MeusFilmes.css';

export default function MeusFilmes() {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [avaliandoFilme, setAvaliandoFilme] = useState(null);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    carregarFilmes();
  }, []);

  const carregarFilmes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        navigate('/');
        return;
      }

      const user = JSON.parse(userInfo);
      const userId = user.id;

      const response = await fetch(`${API_URL}/filmes/usuario/${userId}/filmes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dados && Array.isArray(data.dados)) {
          setFilmes(data.dados);
        } else {
          setFilmes([]);
        }
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar filmes.' });
      }
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar filmes.' });
    } finally {
      setLoading(false);
    }
  };

  const avaliarFilme = async (filmeId, nota) => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      const user = JSON.parse(userInfo);
      const userId = user.id;

      const response = await fetch(`${API_URL}/filmes/avaliar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: userId,
          filme_id: filmeId,
          nota: nota
        })
      });

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Avaliação registrada com sucesso!' });
        setAvaliandoFilme(null);
        setNotaSelecionada(0);
        carregarFilmes();
      } else {
        const data = await response.json();
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao avaliar filme.' });
      }
    } catch (error) {
      console.error('Erro ao avaliar filme:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao avaliar filme.' });
    }
  };

  const removerFilme = async (filmeId) => {
    if (!window.confirm('Tem certeza que deseja remover este filme da sua lista?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      const user = JSON.parse(userInfo);
      const userId = user.id;

      const response = await fetch(`${API_URL}/filmes/usuario/${userId}/filmes/${filmeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Filme removido com sucesso!' });
        carregarFilmes();
      } else {
        const data = await response.json();
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao remover filme.' });
      }
    } catch (error) {
      console.error('Erro ao remover filme:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao remover filme.' });
    }
  };

  const renderizarEstrelas = (nota) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <FaStar
          key={i}
          className={i <= nota ? 'estrela-preenchida' : 'estrela-vazia'}
        />
      );
    }
    return estrelas;
  };

  useEffect(() => {
    if (mensagem.texto) {
      const timer = setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  if (loading) {
    return (
      <div className="meus-filmes-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando seus filmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meus-filmes-container">
      <div className="meus-filmes-content">
        <div className="meus-filmes-header">
          <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <h1>Meus Filmes</h1>
          <p className="subtitle">Gerencie sua coleção de filmes</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        {filmes.length === 0 ? (
          <div className="empty-state">
            <FaFilm className="empty-icon" />
            <h2>Nenhum filme adicionado ainda</h2>
            <p>Comece adicionando filmes à sua coleção!</p>
            <button className="btn-adicionar" onClick={() => navigate('/dashboard/adicionar')}>
              Adicionar Filme
            </button>
          </div>
        ) : (
          <div className="filmes-grid">
            {filmes.map((filme) => (
              <div key={filme.id} className="filme-card">
                <div className="filme-imagem-container">
                  {filme.imagem_url ? (
                    <img src={filme.imagem_url} alt={filme.titulo} className="filme-imagem" />
                  ) : (
                    <div className="filme-sem-imagem">
                      <FaFilm />
                    </div>
                  )}
                  <button
                    className="btn-remover-filme"
                    onClick={() => removerFilme(filme.id)}
                    title="Remover filme"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="filme-info">
                  <h3 className="filme-titulo">{filme.titulo}</h3>
                  <div className="filme-detalhes">
                    <span className="filme-ano">
                      <FaCalendarAlt /> {filme.ano}
                    </span>
                    {filme.genero && (
                      <span className="filme-genero">
                        <FaTag /> {filme.genero}
                      </span>
                    )}
                  </div>
                  <div className="filme-avaliacao">
                    <div className="avaliacao-atual">
                      <span className="avaliacao-label">Avaliação:</span>
                      <div className="estrelas-container">
                        {renderizarEstrelas(filme.nota || 0)}
                      </div>
                      {filme.nota ? (
                        <span className="nota-numero">{filme.nota}/5</span>
                      ) : (
                        <span className="sem-nota">Sem avaliação</span>
                      )}
                    </div>
                    {avaliandoFilme === filme.id ? (
                      <div className="avaliacao-form">
                        <div className="estrelas-selecao">
                          {[1, 2, 3, 4, 5].map((nota) => (
                            <FaStar
                              key={nota}
                              className={`estrela-selecao ${nota <= notaSelecionada ? 'selecionada' : ''}`}
                              onClick={() => setNotaSelecionada(nota)}
                            />
                          ))}
                        </div>
                        <div className="avaliacao-botoes">
                          <button
                            className="btn-salvar-avaliacao"
                            onClick={() => avaliarFilme(filme.id, notaSelecionada)}
                            disabled={notaSelecionada === 0}
                          >
                            Salvar
                          </button>
                          <button
                            className="btn-cancelar-avaliacao"
                            onClick={() => {
                              setAvaliandoFilme(null);
                              setNotaSelecionada(0);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-avaliar"
                        onClick={() => {
                          setAvaliandoFilme(filme.id);
                          setNotaSelecionada(filme.nota || 0);
                        }}
                      >
                        <FaStar /> {filme.nota ? 'Alterar Avaliação' : 'Avaliar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

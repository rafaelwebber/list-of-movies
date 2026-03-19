import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaPlus, FaCalendarAlt, FaTag, FaFilm, FaCheckCircle } from 'react-icons/fa';
import { API_URL } from '../config';
import './AdicionarFilme.css';

export default function AdicionarFilme() {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [adicionando, setAdicionando] = useState(null);
  const [filmeAdicionado, setFilmeAdicionado] = useState(null);
  const navigate = useNavigate();

  const buscarFilmes = async () => {
    if (!termoBusca.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Digite um termo para buscar.' });
      return;
    }

    setLoading(true);
    setResultados([]);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/filmes/buscar?q=${encodeURIComponent(termoBusca)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dados && Array.isArray(data.dados) && data.dados.length > 0) {
          setResultados(data.dados);
        } else {
          setMensagem({ tipo: 'erro', texto: 'Nenhum filme encontrado.' });
        }
      } else {
        const data = await response.json();
        setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao buscar filmes.' });
      }
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao buscar filmes.' });
    } finally {
      setLoading(false);
    }
  };

  const adicionarFilme = async (filme) => {
    setAdicionando(filme.id);

    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      
      if (!userInfo) {
        setMensagem({ tipo: 'erro', texto: 'Usuário não encontrado.' });
        setAdicionando(null);
        return;
      }

      const user = JSON.parse(userInfo);
      const userId = user.id;

      // Primeiro, adicionar o filme ao banco (se não existir)
      const responseAdd = await fetch(`${API_URL}/filmes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: filme.title,
          ano: filme.release_date ? filme.release_date.split('-')[0] : null,
          imagem_url: filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : null
        })
      });

      let filmeId = null;

      if (responseAdd.ok) {
        const data = await responseAdd.json();
        // O backend retorna o ID do filme nos dados
        filmeId = data.dados?.filme_id;
      } else {
        const data = await responseAdd.json();
        // Se o filme já existe (409), o ID também vem nos dados
        if (data.status === 409 && data.dados?.filme_id) {
          filmeId = data.dados.filme_id;
        } else {
          setMensagem({ tipo: 'erro', texto: data.mensagem || 'Erro ao adicionar filme.' });
          setAdicionando(null);
          return;
        }
      }

      // Se temos o ID do filme, vincular diretamente
      if (filmeId) {
        const responseVincular = await fetch(`${API_URL}/filmes/vincular`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filme_id: filmeId,
            usuario_id: userId
          })
        });

        if (responseVincular.ok) {
          setMensagem({ tipo: 'sucesso', texto: `Filme "${filme.title}" adicionado com sucesso!` });
          setFilmeAdicionado(filme.title);
          // Remover o filme da lista de resultados
          setResultados(resultados.filter(r => r.id !== filme.id));
        } else {
          const dataVincular = await responseVincular.json();
          if (dataVincular.status_http === 409) {
            setMensagem({ tipo: 'erro', texto: 'Este filme já está na sua lista.' });
          } else {
            setMensagem({ tipo: 'erro', texto: dataVincular.mensagem || 'Erro ao vincular filme.' });
          }
        }
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao obter ID do filme no banco de dados.' });
      }
    } catch (error) {
      console.error('Erro ao adicionar filme:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao adicionar filme.' });
    } finally {
      setAdicionando(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarFilmes();
    }
  };

  useEffect(() => {
    if (mensagem.texto) {
      // Se for sucesso e tiver filme adicionado, manter por mais tempo
      const tempo = mensagem.tipo === 'sucesso' && filmeAdicionado ? 6000 : 3000;
      const timer = setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
        setFilmeAdicionado(null);
      }, tempo);
      return () => clearTimeout(timer);
    }
  }, [mensagem, filmeAdicionado]);

  return (
    <div className="adicionar-filme-container">
      <div className="adicionar-filme-content">
        <div className="adicionar-filme-header">
          <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <h1>Adicionar Filme</h1>
          <p className="subtitle">Busque e adicione filmes à sua coleção</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            <div className="mensagem-conteudo">
              {mensagem.tipo === 'sucesso' && <FaCheckCircle className="mensagem-icon" />}
              <span>{mensagem.texto}</span>
            </div>
            {mensagem.tipo === 'sucesso' && filmeAdicionado && (
              <div className="mensagem-acoes">
                <button 
                  className="btn-ver-filmes"
                  onClick={() => navigate('/dashboard/filmes')}
                >
                  Ver Meus Filmes
                </button>
              </div>
            )}
          </div>
        )}

        <div className="busca-section">
          <div className="busca-input-container">
            <FaSearch className="busca-icon" />
            <input
              type="text"
              className="busca-input"
              placeholder="Digite o nome do filme..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="btn-buscar"
              onClick={buscarFilmes}
              disabled={loading || !termoBusca.trim()}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Buscando filmes...</p>
          </div>
        )}

        {!loading && resultados.length > 0 && (
          <div className="resultados-section">
            <h2 className="resultados-titulo">
              Resultados da busca ({resultados.length})
            </h2>
            <div className="resultados-grid">
              {resultados.map((filme) => (
                <div key={filme.id} className="resultado-card">
                  <div className="resultado-imagem-container">
                    {filme.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${filme.poster_path}`}
                        alt={filme.title}
                        className="resultado-imagem"
                      />
                    ) : (
                      <div className="resultado-sem-imagem">
                        <FaFilm />
                      </div>
                    )}
                  </div>
                  <div className="resultado-info">
                    <h3 className="resultado-titulo">{filme.title}</h3>
                    {filme.release_date && (
                      <div className="resultado-ano">
                        <FaCalendarAlt /> {filme.release_date.split('-')[0]}
                      </div>
                    )}
                    {filme.overview && (
                      <p className="resultado-sinopse">
                        {filme.overview.length > 150
                          ? `${filme.overview.substring(0, 150)}...`
                          : filme.overview}
                      </p>
                    )}
                    <button
                      className="btn-adicionar-filme"
                      onClick={() => adicionarFilme(filme)}
                      disabled={adicionando === filme.id}
                    >
                      {adicionando === filme.id ? (
                        <>
                          <div className="loading-spinner-small"></div> Adicionando...
                        </>
                      ) : (
                        <>
                          <FaPlus /> Adicionar à Lista
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && termoBusca && resultados.length === 0 && !mensagem.texto && (
          <div className="empty-state">
            <FaSearch className="empty-icon" />
            <h2>Nenhum resultado encontrado</h2>
            <p>Tente buscar com outro termo</p>
          </div>
        )}

        {!loading && !termoBusca && resultados.length === 0 && (
          <div className="empty-state">
            <FaFilm className="empty-icon" />
            <h2>Busque por filmes</h2>
            <p>Digite o nome de um filme no campo de busca acima</p>
          </div>
        )}
      </div>
    </div>
  );
}


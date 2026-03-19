import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { FaArrowLeft, FaSearch, FaFilm, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import './BuscarFilmes.css';

export default function BuscarFilmes() {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [adicionando, setAdicionando] = useState(null);
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
        headers: { 'Authorization': `Bearer ${token}` }
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
      const dataAdd = await responseAdd.json();

      if (responseAdd.ok) {
        filmeId = dataAdd.dados?.filme_id;
      } else if (dataAdd.status === 409 && dataAdd.dados?.filme_id) {
        filmeId = dataAdd.dados.filme_id;
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
          setMensagem({ tipo: 'sucesso', texto: `Filme "${filme.title}" adicionado!` });
          setResultados(resultados.filter(r => r.id !== filme.id));
        } else {
          const dataVincular = await responseVincular.json();
          setMensagem({ tipo: 'erro', texto: dataVincular.status_http === 409 ? 'Filme já está na sua lista.' : (dataVincular.mensagem || 'Erro ao adicionar.') });
        }
      } else {
        setMensagem({ tipo: 'erro', texto: dataAdd.mensagem || 'Erro ao adicionar filme.' });
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

  return (
    <div className="buscar-filmes-container">
      <div className="buscar-filmes-content">
        <div className="buscar-filmes-header">
          <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> <span className="btn-voltar-texto">Voltar</span>
          </button>
          <h1>Buscar Filmes</h1>
          <p className="subtitle">Encontre filmes para adicionar à sua coleção</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
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
              onKeyPress={(e) => e.key === 'Enter' && buscarFilmes()}
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
            <h2 className="resultados-titulo">Resultados ({resultados.length})</h2>
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
                      <div className="resultado-sem-imagem"><FaFilm /></div>
                    )}
                  </div>
                  <div className="resultado-info">
                    <h3>{filme.title}</h3>
                    {filme.release_date && (
                      <div className="resultado-ano"><FaCalendarAlt /> {filme.release_date.split('-')[0]}</div>
                    )}
                    {filme.overview && (
                      <p className="resultado-sinopse">{filme.overview.substring(0, 120)}...</p>
                    )}
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
          </div>
        )}

        {!loading && termoBusca && resultados.length === 0 && !mensagem.texto && (
          <div className="empty-state">
            <FaSearch className="empty-icon" />
            <h2>Nenhum resultado</h2>
            <p>Tente buscar com outro termo</p>
          </div>
        )}

        {!loading && !termoBusca && resultados.length === 0 && (
          <div className="empty-state">
            <FaFilm className="empty-icon" />
            <h2>Descubra filmes</h2>
            <p>Digite o nome de um filme no campo de busca acima</p>
            <button className="btn-adicionar" onClick={() => navigate('/dashboard/adicionar')}>
              Ir para Adicionar Filme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
